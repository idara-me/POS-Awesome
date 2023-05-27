// Copyright (c) 20201 Youssef Restom and contributors
// For license information, please see license.txt

frappe.ui.form.on('Sales Invoice', {
    setup: function (frm) {
        frm.set_query("posa_delivery_charges", function (doc) {
            return {
                filters: { 'company': doc.company, 'disabled': 0 }
            };
        });
        frm.set_query('pos_profile', () => {
            return {
                query: 'posawesome.posawesome.api.invoice.pos_profile',
                filters: {
                    assigned_user: frappe.session.user 
                }
            }
        })
        frm.set_query('mode_of_payment', 'payments', () => {
            return {
                query: 'posawesome.posawesome.api.invoice.mode_of_payments',
                filters: {
                    pos_profile: frm.doc.pos_profile 
                }
            }
        })
    },
    
});