import {  marked } from "marked"
const newResourceRequested=(user_name,resourcerequestcount)=>{


let content=`# Request Resource Acknowledgement 
            
Dear ${user_name},
            
You have successfully requested for a resource from the admin of this platform. You will be notified once your request is approved by an Admin.
Your Request Id is ${resourcerequestcount+1}

Best Regards,  
**Tutor Razzi** 
`;
return  marked.parse(content) 
}
export {newResourceRequested}
