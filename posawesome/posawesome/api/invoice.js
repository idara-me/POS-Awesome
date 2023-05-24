// Copyright (c) 20201 Youssef Restom and contributors
// For license information, please see license.txt

frappe.ui.form.on('Sales Invoice', {
    setup: function (frm) {
        frm.set_query("posa_delivery_charges", function (doc) {
            return {
                filters: { 'company': doc.company, 'disabled': 0 }
            };
        });
    },
    refresh:function(frm,dt,dn){
        if(frappe.user!="Administrator"){
            frm.set_df_property('pos_profile', 'hidden', 1)
            frappe.db.get_list("POS Profile", {
                fields: ['name'],
                filters: {}
            }).then(records => {
                if(records){
                    let profiles=[]
                    for(let profile of records){
                        frappe.db.get_doc('POS Profile', profile['name'])
                        .then(profile_doc => {
                            for(let item of profile_doc.applicable_for_users){
                                if(item.user==frappe.user){
                                    profiles.push(profile['name'])
                                    break;
                                }
                            }
                        })   
                    }
                    frm.set_df_property("pos_profile_selector", "options", profiles);
                }
            })
        }
        else if(frappe.user=="Administrator"){
            if(frm.is_new()){
                frm.set_df_property('pos_profile_selector', 'hidden', 1)
                frm.set_df_property('pos_profile', 'hidden', 0)
            }
        }
        payment_mode_list(frm)
        console.log(frm.doc.pos_profile_selector);
    },
    pos_profile_selector:function(frm,dt,dn){
        if(frm.doc.pos_profile_selector){
            frappe.model.set_value(dt,dn,'pos_profile',frm.doc.pos_profile_selector)
        }
    }
});
const payment_mode_list=(frm)=>{
    if(frm.pos_profile_selector){
        frappe.db.get_doc('POS Profile', frm.doc.pos_profile_selector)
        .then(doc => {
            console.log(doc)
            let mp=''
            let flag=false
            //frm.doc.payments = []
            refresh_field("payments");
            for(let row of doc.payments){
                if(flag==true){
                    mp=mp+'\n'
                }
                mp = mp+row.mode_of_payment
                frm.fields_dict.payments.grid["fields_map"].payment_mode.options = mp
                flag = true
                // if(row.default==1){
                //     let item = frm.add_child('payments', {
                //         payment_mode:row.mode_of_payment,
                //         mode_of_payment: row.mode_of_payment,
                //     });
                //     frappe.model.set_value(row.doctype,row.name,'payment_mode',row.mode_of_payment)
                // }
                refresh_field("payments");
            }
            console.log(mp);
        })
    }
}