import Attendance from "../../models/Attendance.js";
import Class from "../../models/Class.js";
import MonthlyReport from "../../models/MonthlyReport.js";
import User from "../../models/User.js";

const leaveClass = async (data) => {
   
 console.log(data.body)
await Class.updateOne({
    meeting_id:data.body.meeting.id
},{
    $set:{
        status:'Done'
    }
})
const user_id=await User.findOne({
email:data.body.participant.customParticipantId
})
if(user_id.role==='student'){
    let response = await Attendance.findOneAndUpdate({
        class_id: req.body.class_id,
        student_id: user_id._id
    }, {
        $set: {
            check_out_datetime:moment().format("YYYY-MM-DDTHH:mm:ss")
        }
    })
}
else if(user_id.role==='teacher'){
    let response = await Attendance.findOneAndUpdate({
        class_id: req.body.class_id,
        teacher_id: user_id._id
    }, {
        $set: {
            check_out_datetime:moment().format("YYYY-MM-DDTHH:mm:ss")
        }
    })
}

}
export{leaveClass}