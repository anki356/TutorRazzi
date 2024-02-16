import {  marked } from "marked"
const homeworkEmail=(student_name,title,teacher_name,subject_name,grade_name)=>{


let content=`
**Dear ${student_name}**

- Homework: ${title} is given in Class Name:${subject_name} of ${grade_name } By ${teacher_name} is pending.Kindly Upload the Solution.

Best Regards,  
**Tutor Razzi** 
`
return  marked.parse(content) 
}
export {homeworkEmail}
