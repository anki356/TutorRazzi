import {  marked } from "marked"
import moment from "moment";
const paymentReceiptAcknowlegement=(teacher_name,net_amount)=>{

    let markdownContent =  `
# Payment Acknowledgement 
        
Dear ${teacher_name},
        
You Have received payment of ${net_amount*95/100} made on ${moment().format("DD-MM-YYYY")}.
        
**Payment Details**:
- Payment Amount: ${net_amount*95/100},

- Payment Date: ${moment().format("DD-MM-YYYY")}

Best regards,  
**Tutor Razzi** 
`;
    return marked.parse(markdownContent)
}
export {paymentReceiptAcknowlegement}