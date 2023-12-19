import {  marked } from "marked"
const changePasswordEmail=(name)=>{
    let content=`# Password Change Confirmation

Dear ${name},
               
We are writing to inform you that your password for Tutor Razzi Account has been successfully changed. Your account security is important to us, and we wanted to confirm this change with you.
        
If you did not request this password change, please contact our support team immediately at [Support Email or Phone Number]. We take security very seriously and will assist you in resolving any issues or concerns.
        
## Tips Regarding Your Password Change
        
- **Keep Your New Password Secure:** Please make sure to keep your new password confidential and do not share it with anyone. We will never ask for your password via email or any other unsolicited communication.
        
- **Password Best Practices:** We recommend using strong and unique passwords for all your online accounts. Make sure your new password is not easily guessable and contains a combination of letters, numbers, and special characters.
        
- **Regularly Update Your Password:** To enhance the security of your account, consider changing your password periodically.
        
- **Sign Out and Sign In:** After changing your password, it's a good practice to sign out of your account and sign back in with your new credentials to ensure everything is working as expected.
        
If you have any questions or need further assistance, please don't hesitate to reach out to our support team.
               
Thank you for using Tutor Razzi. We appreciate your trust in us, and we're committed to safeguarding your account's security.
            
Best regards,
            
Tutor Razzi
`  
return marked.parse(content)     
}
export {changePasswordEmail}