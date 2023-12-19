import {  marked } from "marked"
const teacherResourceRequests=(student_name,message,teacher_name,subject_name,grade_name)=>{


let content=`
Dear ${teacher_name},


**Resource Requested by ${student_name}**

- Resource:${message},
- Class Name:${subject_name} of ${grade_name }

Best Regards,  
**Tutor Razzi** 
`
return  marked.parse(content) 
}
export {teacherResourceRequests}
