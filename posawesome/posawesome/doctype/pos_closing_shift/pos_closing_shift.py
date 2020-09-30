# -*- coding: utf-8 -*-
# Copyright (c) 2020, Youssef Restom and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json
from frappe import _
from frappe.model.document import Document
from frappe.utils import getdate, get_datetime, flt
from collections import defaultdict
from erpnext.controllers.taxes_and_totals import get_itemised_tax_breakup_data


class POSClosingShift(Document):
    def validate(self):
        user = frappe.get_all('POS Closing Shift',
                              filters={'user': self.user, 'docstatus': 1},
                              or_filters={
                                  'period_start_date': ('between', [self.period_start_date, self.period_end_date]),
                                  'period_end_date': ('between', [self.period_start_date, self.period_end_date])
                              })

        if user:
            frappe.throw(_("POS Closing Shift {} against {} between selected period"
                           .format(frappe.bold("already exists"), frappe.bold(self.user))), title=_("Invalid Period"))

        if frappe.db.get_value("POS Opening Shift", self.pos_opening_shift, "status") != "Open":
            frappe.throw(_("Selected POS Opening Shift should be open."), title=_(
                "Invalid Opening Entry"))

    def on_submit(self):
        opening_entry = frappe.get_doc(
            "POS Opening Shift", self.pos_opening_shift)
        opening_entry.pos_closing_shift = self.name
        opening_entry.set_status()
        opening_entry.save()

    def get_payment_reconciliation_details(self):
        currency = frappe.get_cached_value(
            'Company', self.company,  "default_currency")
        return frappe.render_template("posawesome/posawesome/doctype/pos_closing_shift/closing_shift_details.html",
                                      {"data": self, "currency": currency})


@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_cashiers(doctype, txt, searchfield, start, page_len, filters):
    cashiers_list = frappe.get_all(
        "POS Profile User", filters=filters, fields=['user'])
    return [c['user'] for c in cashiers_list]


@frappe.whitelist()
def get_pos_invoices(pos_opening_shift):
    data = frappe.db.sql("""
	select
		name
	from
		`tabSales Invoice`
	where
		docstatus = 1 and posa_pos_opening_shift = %s
	""", (pos_opening_shift), as_dict=1)

    data = [frappe.get_doc("Sales Invoice", d.name).as_dict() for d in data]

    return data


@frappe.whitelist()
def make_closing_shift_from_opening(opening_shift):
    closing_shift = frappe.new_doc("POS Closing Shift")
    closing_shift.pos_opening_shift = opening_shift.name
    closing_shift.period_start_date = opening_shift.period_start_date
    closing_shift.period_end_date = frappe.utils.get_datetime()
    closing_shift.pos_profile = opening_shift.pos_profile
    closing_shift.user = opening_shift.user
    closing_shift.company = opening_shift.company
    closing_shift.grand_total = 0
    closing_shift.net_total = 0
    closing_shift.total_quantity = 0

    invoices = get_pos_invoices(opening_shift.name)

    pos_transactions = []
    taxes = []
    payments = []
    for detail in opening_shift.balance_details:
        payments.append(frappe._dict({
            'mode_of_payment': detail.mode_of_payment,
            'opening_amount': detail.opening_amount,
            'expected_amount': detail.opening_amount
        }))

    for d in invoices:
        pos_transactions.append(frappe._dict({
            'sales_invoice': d.name,
            'posting_date': d.posting_date,
            'grand_total': d.grand_total,
            'customer': d.customer
        }))
        closing_shift.grand_total += flt(d.grand_total)
        closing_shift.net_total += flt(d.net_total)
        closing_shift.total_quantity += flt(d.total_qty)

        for t in d.taxes:
            existing_tax = [tx for tx in taxes if tx.account_head ==
                            t.account_head and tx.rate == t.rate]
            if existing_tax:
                existing_tax[0].amount += flt(t.tax_amount)
            else:
                taxes.append(frappe._dict({
                    'account_head': t.account_head,
                    'rate': t.rate,
                    'amount': t.tax_amount
                }))

        for p in d.payments:
            existing_pay = [
                pay for pay in payments if pay.mode_of_payment == p.mode_of_payment]
            if existing_pay:
                existing_pay[0].expected_amount += flt(p.amount)
            else:
                payments.append(frappe._dict({
                    'mode_of_payment': p.mode_of_payment,
                    'opening_amount': 0,
                    'expected_amount': p.amount
                }))

    closing_shift.set("pos_transactions", pos_transactions)
    closing_shift.set("payment_reconciliation", payments)
    closing_shift.set("taxes", taxes)

    return closing_shift