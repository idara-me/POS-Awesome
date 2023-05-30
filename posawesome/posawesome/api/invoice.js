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
    pos_profile: function (frm) {
        setTimeout(() => {
            frm.doc.payments = []
            frm.refresh_field('payments');
            let gd_total=0
            frappe.db.get_doc('POS Profile', null, { 'name': frm.doc.pos_profile })
            .then(doc => {
                for(let row of doc.payments){
                    if(row.default==1 && frm.doc.grand_total > 0){
                        gd_total=frm.doc.grand_total
                    }else{
                        gd_total=0.0
                    }
                    frm.add_child('payments', {
                        default : row.default,
                        mode_of_payment: row.mode_of_payment,
                        amount:gd_total
                    });
                }
                frm.refresh_field('payments');
                })
            }, 1000);

    }
    
});