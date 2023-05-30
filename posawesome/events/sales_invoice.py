import frappe

def validate(doc, method=None):
   setting_doc = frappe.get_doc("Pizzaman Setting")
   if setting_doc.include_payment:
      if doc.is_pos:
          flag_dis = False
          flag_not = False
          for row in doc.items:
            if row.discount_percentage == 100:
              flag_dis =True
            else:
              flag_not =True
            
          total_paid_amount=0
          for payment in doc.payments:
            total_paid_amount = total_paid_amount + payment.amount
  
          doc.db_set('paid_amount',total_paid_amount)

          if total_paid_amount == 0  and flag_dis == False:
            frappe.throw("Paid Amount can't be zero")
          elif total_paid_amount == 0  and flag_dis == True and flag_not == True:
            frappe.throw("Sorry you cannot process further because total discount is not 100%")


          if doc.grand_total != total_paid_amount:
              frappe.throw("Sorry you cannot process further because paid amount is not equal to the total amount")
  #  else:
  #     frappe.msgprint(f"Please enable the option Include Payment from Doctype Pizzaman Setting")
           
              

            
    
      
            
    
