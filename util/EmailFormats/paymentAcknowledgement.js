import {  marked } from "marked"
import moment from "moment";
const paymentAcknowledgement=(student_name,net_amount,tax,coupon_amount,other_deduction,amount)=>{

    let markdownContent = `
# Payment Acknowledgement 
        
Dear ${student_name},
        
Thank you for your payment of ${net_amount} made on ${moment().format("DD-MM-YYYY")}. We have received your payment and processed it successfully.
        
**Payment Details**:
- Payment Amount: ${amount},
- Payment Tax:  ${tax}
- Coupon Discount:${coupon_amount?coupon_amount:0}
- Other deduction: ${other_deduction?other_deduction:0}
- Net Amount :${net_amount}
- Payment Date: ${moment().format("DD-MM-YYYY")}
        
If you have any questions or concerns regarding this payment or your account, please don't hesitate to reach out to our customer support team. Once again, thank you for your payment. We truly value your business.
        
Best regards,  
**Tutor Razzi** 
    `;
    return marked.parse(markdownContent)
}
export {paymentAcknowledgement}