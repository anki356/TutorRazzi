import nodemailer from 'nodemailer'
import fs from 'fs'
import ejs from 'ejs'



const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'acodewebdev@gmail.com',
        pass: 'atedndpgrmvducdi'
    }
});


const sendMailAsync = (mailOptions, options = {}) => {

    return new Promise((res, rej) => {

        mailOptions.from = "acodewebdev@gmail.com";
        
        const emailTemplate = fs.readFileSync(mailOptions.html, 'utf-8');
        const renderedEmail = ejs.render(emailTemplate, { ...options, subject: mailOptions.subject })
        mailOptions.html = renderedEmail

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                rej('Failed to send mail.');
            }
            res(info.response);
        });
    })
}

export {sendMailAsync}
