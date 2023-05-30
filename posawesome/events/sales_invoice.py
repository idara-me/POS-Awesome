import frappe

def validate(doc, method=None):
   setting_doc = frappe.get_doc("Pizzaman Setting")
   if setting_doc.include_payment:
      if doc.is_pos:
          total_paid_amount=0
          for payment in doc.payments:
              if doc.paid_amount == 0:
                frappe.throw("Amount can't be zero")
              else:
                  total_paid_amount = total_paid_amount + payment.amount

          if doc.grand_total != total_paid_amount:
              frappe.throw("paid amount is less than grand total")
   else:
      frappe.msgprint(f"Please enable the option Include Payment from Doctype Pizzaman Setting")
           
              

            
    
      
            
    
