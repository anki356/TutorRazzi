import {  marked } from "marked"
const adminNewResourceRequest=(user_name,message,classResponse)=>{
let class_name=classResponse.name!==null&&classResponse.name!==undefined?classResponse.name:classResponse.subject.name+" of " +classResponse.grade.name+" By "+classResponse.teacher_id.name

let content=`
**Resource Requested by ${user_name}**

- Resource:${message},
- Class Name:${class_name}

Best Regards,  
**Tutor Razzi** 
`
return  marked.parse(content) 
}
export {adminNewResourceRequest}
