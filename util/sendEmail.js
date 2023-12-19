
import nodemailer from 'nodemailer'
const transporter = nodemailer.createTransport({
  service: 'Gmail', 

  auth: {
      user: 'acodewebdev@gmail.com',
      pass: 'atedndpgrmvducdi'
  },
  queue: true,
  maxQueuedEmails: 100,
  maxQueueTime: 3600000
});
const sendEmail=async(receiver_address,subject,body,attachment)=>{
    
    if(attachment!==undefined){
      transporter.sendMail({
        from:'acodewebdev@gmail.com',
        to:receiver_address,
        subject: subject,
        html: body,
        attachments:attachment
    }, (err, info) => {
        if (err) {
          console.log("Error sending Email")
        } else {
          console.log('Message sent successfully!');
          
        }}) 
        return   
    }
      transporter.sendMail({
        from:'acodewebdev@gmail.com',
        to:receiver_address,
        subject: subject,
        html: body
    }, (err, info) => {
        if (err) {
          console.log("Error sending Email")
        } else {
        console.log('Message sent successfully!');
          
        }})    
    }
   

export default sendEmail
 