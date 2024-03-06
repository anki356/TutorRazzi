import axios from "axios";
import Attendance from "../../models/Attendance.js";
import Class from "../../models/Class.js";
import MonthlyReport from "../../models/MonthlyReport.js";
import User from "../../models/User.js";
import moment from "moment";
import { addNotifications } from "../addNotification.js";
import Student from "../../models/Student.js";

const leaveClass = async (data) => {
   
 console.log(data.body)
const classDetails=await Class.findOne({
    meeting_id:data.body.meeting.id
})
const user_id=await User.findOne({
email:data.body.participant.userDisplayName
})
console.log(user_id,classDetails)
if(user_id.role==='student'){
    let response = await Attendance.findOneAndUpdate({
        class_id: classDetails._id,
        student_id: user_id._id
    }, {
        $set: {
            check_out_datetime:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
        }
    })
}
else if(user_id.role==='academic manager'){
    let response = await Attendance.findOneAndUpdate({
        class_id: classDetails._id,
        academic_manager_id: user_id._id
    }, {
        $set: {
            check_out_datetime:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
        }
    })
}


}
const meetingEnded=async(data)=>{
    console.log(data.body)
    const organizationId = '6894d463-40a7-4240-93dc-bb30ef741dbd';
    const apiKey = 'ac00320ed5f57433dfa8';
    
    // Combine organizationId and apiKey with a colon
    const credentials = `${organizationId}:${apiKey}`;
    
    // Encode credentials to Base64
    const encodedCredentials = btoa(credentials);
    
axios.get(`https://api.dyte.io/v2/meetings/${data.body.meeting.id}/participants`,{
    headers:{
        'Authorization': `Basic ${encodedCredentials}`,
    }
}).then(async(response)=>{
    console.log(response.data.data)
    let isStudent=false
    let isTeacher=false
    const classDetails=await Class.findOne({
        meeting_id:data.body.meeting_id
                    })
    response.data.data.forEach(async element => {
        if(element.name==='student'){
isStudent=true
        }
        if(element.name==='teacher'){
        
            
            let response = await Attendance.findOneAndUpdate({
                class_id: classDetails._id,
                teacher_id: classDetails.teacher_id
            }, {
                $set: {
                    check_out_datetime:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
                }
            })
isTeacher=true
        }
    });
    if(isStudent&&isTeacher){
        await Class.updateOne({
            meeting_id:data.body.meeting.id
        },{
            $set:{
                status:'Done'
            }
        }) 
        let student_name=await Student.findOne({
            user_id:classDetails.student_id
        })
if(classDetails.class_type==='Trial'){
    addNotifications("65891c1d69765570ec7d213a","Trial Class Completed","Trial Class of "+classDetails.subject.name+" has been completed of student "+student_name.preferred_name)
}
    }
  
   
})
    
}
export{leaveClass,meetingEnded}