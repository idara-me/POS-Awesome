// Copyright (c) 20201 Youssef Restom and contributors
// For license information, please see license.txt

frappe.ui.form.on('Supplier', {
    setup: function (frm) {
        frm.set_query('account', 'accounts', function (doc, cdt, cdn) {
            var d = locals[cdt][cdn];
			return {
				// filters: {
				// 	'company': d.company,
				//}
			}
        })
    },
    
});