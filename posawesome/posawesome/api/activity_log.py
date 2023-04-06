import frappe
from frappe.utils import now

def before_insert(doc, method):
    # print(doc.name)
    # doc.__newname = now().replace("-", "").replace(" ", "").replace(".","").replace(":", "")
