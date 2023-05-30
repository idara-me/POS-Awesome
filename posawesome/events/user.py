import frappe

def validate(doc, method=None):
    if frappe.session.user != "Administrator":
        doc.user_type = "Website User"