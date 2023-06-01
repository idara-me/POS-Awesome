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
    refresh: function (frm){
        frm.doc.payments = []
        frm.refresh_field('payments');
        if(!frm.doc.pos_profile) return

        
        let gd_total=0.0
        frappe.db.get_doc('POS Profile', frm.doc.pos_profile)
        .then(doc => {
            for(let row of doc.payments){
                gd_total = row.default==1 && frm.doc.rounded_total > 0 ? frm.doc.rounded_total : 0.0

                frm.add_child('payments', {
                    default : row.default,
                    mode_of_payment: row.mode_of_payment,
                    amount: gd_total
                });
            }

            frm.refresh_field('payments');
        })
    },
    pos_profile: function (frm) {
        frm.doc.payments = []
        frm.refresh_field('payments');

        if(!frm.doc.pos_profile) return

        
        let gd_total=0.0
        frappe.db.get_doc('POS Profile', frm.doc.pos_profile)
        .then(doc => {
            for(let row of doc.payments){
                gd_total = row.default==1 && frm.doc.rounded_total > 0 ? frm.doc.rounded_total : 0.0

                frm.add_child('payments', {
                    default : row.default,
                    mode_of_payment: row.mode_of_payment,
                    amount: gd_total
                });
            }

            frm.refresh_field('payments');
        })

    },
    customer:function(frm,cdt,cdn){
        if(frm.doc.customer){
            frappe.db.get_value('Customer', frm.doc.customer, ['posa_discount'])
            .then(r => {
                if(frm.doc.items){
                    for(let row of frm.doc.items){
                        frappe.model.set_value(row.doctype,row.name,'discount_percentage',r.message.posa_discount)      
                    }
                }
            })
        }
    }
    
});

frappe.ui.form.on('Sales Invoice Item', {
    item_code:function(frm,cdt,cdn){
        if(frm.doc.customer){
            frappe.db.get_value('Customer', frm.doc.customer, ['posa_discount'])
                .then(r => {
                    setTimeout(function(){ 
                        frappe.model.set_value(cdt,cdn,'discount_percentage',r.message.posa_discount)
                    }, 1000);
                })
        }
    }
});
