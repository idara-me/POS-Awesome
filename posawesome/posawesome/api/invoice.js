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
            frappe.db.get_list("POS Profile", {
                fields: ['name'],
                filters: {}
            }).then(records => {
                if(records){
                    let profiles=[]
                    for(let profile of records){
                        frappe.db.get_doc('POS Profile', profile['name'])
                        .then(profile_doc => {
                            console.log(profile_doc)
                            for(let item of profile_doc.applicable_for_users){
                                if(item.user==frappe.user){
                                    profiles.push(profile['name'])
                                    break;
                                }
                            }
                        })   
                    }
                    console.log(profiles);
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
    },
    pos_profile_selector:function(frm,dt,dn){
        if(frm.doc.pos_profile_selector){
            frappe.model.set_value(dt,dn,'pos_profile',frm.doc.pos_profile_selector)
        }
    }
});