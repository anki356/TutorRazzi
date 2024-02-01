import {  marked } from "marked"
const newTeacherSignup=(user_name,email,password)=>{


let content=`# Welcome to TutorRazzi!

Dear ${user_name},

We are excited to welcome you to TutorRazzi! Your new account is now active, and we're thrilled to have you as a part of our community.

**Here's a summary of what you can do with your new account:**

- **Access Our Services**: You can now access all the features and benefits of [Your Service/Product Name]. Simply visit our website at [Website URL] and log in using the following details:

  - **Username/Email:** ${email}
  - **Password** ${password}

- **Customize Your Profile**: After logging in, you can customize your profile, update your preferences, and set up notifications to tailor your experience.

- **Explore Our Content/Products**: Start exploring our content/products to [briefly mention the main benefits or features of your service].

**Getting Started:**

1. **Log In**: Go to website and use the provided username/email and temporary password to log in.


2. **Get Acquainted**: Take some time to explore and enjoy what TutorRazzi has to offer. We're here to make your experience enjoyable and convenient.

If you have any questions or need assistance, our support team is here to help. Feel free to reach out to us at support.

Thank you for choosing TutorRazzi. We're excited to have you on board and look forward to serving you!

Best regards,

*TutorRazzi*

---

`
return  marked.parse(content) 
}
export {newTeacherSignup}
