import Attendance from "../../models/Attendance.js";
import Class from "../../models/Class.js";
import MonthlyReport from "../../models/MonthlyReport.js";

const joinClass = async (req, res, next) => {
    let classResponse = await Class.findOne({
        _id: req.body.class_id
    }, {
        start_time: 1,
        end_time: 1,
        teacher_id:1,
        subject:1
    })

    if (!moment().isBetween(moment(classResponse.start_time), moment(classResponse.end_time))) {
        throw new Error('You cannot Join Class at this time')
    }
    console.log(classResponse.subject.name);
   let reportResponse=await MonthlyReport.findOne({
        student_id:req.user._id,
        teacher_id:classResponse.teacher_id,
        month:moment().month(),
        year:moment().year(),
        subject:classResponse.subject.name
   })
  let attendanceResponse=await Attendance.findOne({
    teacher_id:classResponse.teacher_id,
    class_id:req.body.class_id
   })
   if(attendanceResponse!==null){
    classResponse = await Class.findOneAndUpdate({
        _id: req.body.class_id
    }, {

        $set: {
            status: 'Done'
        }
    })
   }
   
   if(reportResponse===null&&attendanceResponse!==null){

    const   MonthlyReportResponse=await MonthlyReport.create({
        student_id:req.user._id,
        teacher_id:classResponse.teacher_id,
        month:moment().month(),
        year:moment().year(),
        subject:classResponse.subject.name, 
        reports:[{

title:"Academic Performance",
sub_title:"Subject Knowledge and Understanding",





    },{
        title:"Academic Performance",
        sub_title:"Class Participation and Engagement",
        
       
        
    },{
        title:"Academic Performance",
        sub_title:"Homework and Assignments Completion",
       
       
       
    },{
        title:"Academic Performance",
        sub_title:"Problem-Solving and Critical Thinking Skills",
       
        
    },{
        title:"Learning Attitude",
        sub_title:"Motivation and Enthusiasm",
       
        
    },{  title:"Learning Attitude",
    sub_title:"Initiative and Self Direction",
   
    },{
        title:"Learning Attitude",
        sub_title:"Collaboration and Teamwork",
      
        
    },{
        title:"Communication Skills",
        sub_title:"Verbal Communication",
        
        
    },{
        title:"Communication Skills",
        sub_title:"Written Communication",
        
        
    },{
        title:"Personal Growth",
        sub_title:"Time Management",
       
        
    },{
        title:"Personal Growth",
        sub_title:"Organization and Preparedness",
        
       
    },{
        title:"Personal Growth",
        sub_title:"Responsibility and Accountability",
       
        
    }]})
   }
    attendanceResponse = await Attendance.insertMany({
        check_in_datetime: moment().format("YYYY-MM-DDTHH:mm:ss"),
        student_id: req.user._id,
        class_id: req.body.class_id,

    })
return res.json(responseObj(true, attendanceResponse, "Class Joined"))

}
export{joinClass}