import Grade from "../../../models/Grade.js"
import mongoose from "mongoose"
import { responseObj } from "../../../util/response.js"
import AdditionalComment from "../../../models/AdditionalComment.js"
import moment from "moment"
import Report from "../../../models/Report.js"
import Class from "../../../models/Class.js"
const ObjectID=mongoose.Types.ObjectId
const getMonthlyReport=async(req,res,next)=>{
    const monthlyReport=await Report.aggregate([
        {
            $match:{
                student_id:new ObjectID(req.query.student_id),
                teacher_id:new ObjectID(req.user._id)
            }
        },  {
            $group: {
                _id: {
                    year: "$year",
                    month:"$month"
                },
                averageRating: { $avg: "$rating" },
              // You can use other accumulator operators based on your requirements
                // Add other fields or calculations as needed
            }
        },
        {
            $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                averageRating: 1,// Include other fields as needed
            }
        },
        {
            $sort: {
                year: 1,
                month: 1
            }
        }
    ])
    


  return  res.json(responseObj(true,monthlyReport,null))
}

const addMonthlyReport=async(req,res)=>{
    const report=await Report.insertMany([{
title:"Academic Performance",
sub_title:"Subject Knowledge and Understanding",
rating:req.body.subject_knowledge_and_understanding,
student_id:new ObjectID(req.body.student_id),
message:req.body.subject_knowledge_and_understanding_message,
teacher_id:req.user._id,
month:moment().month(),
year:moment().year()
    



    },{
        title:"Academic Performance",
        sub_title:"Class Participation and Engagement",
        rating:req.body.class_participation_and_engagement,
        student_id:new ObjectID(req.body.student_id),
        message:req.body.class_participation_and_engagement_message,
        teacher_id:req.user._id,
        month:moment().month(),
        year:moment().year()  
    },{
        title:"Academic Performance",
        sub_title:"Homework and Assignments Completion",
        rating:req.body.homeworks_and_assignment_completion,
        student_id:new ObjectID(req.body.student_id),
        message:req.body.homeworks_and_assignment_completion_message,
        teacher_id:req.user._id,
        month:moment().month(),
        year:moment().year()  
    },{
        title:"Academic Performance",
        sub_title:"Problem-Solving and Critical Thinking Skills",
        rating:req.body.problem_solving_and_critical_thinking_skills,
        student_id:new ObjectID(req.body.student_id),
        message:req.body.problem_solving_and_critical_thinking_skills_message,
        teacher_id:req.user._id,
        month:moment().month(),
        year:moment().year()  
    },{
        title:"Learning Attitude",
        sub_title:"Motivation and Enthusiasm",
        rating:req.body.motivation_and_enthusiasm,
        student_id:new ObjectID(req.body.student_id),
        message:req.body.motivation_and_enthusiasm_message,
        teacher_id:req.user._id,
        month:moment().month(),
        year:moment().year() 
    },{
        title:"Learning Attitude",
        sub_title:"Collaboration and Teamwork",
        rating:req.body.collaboration_and_teamwork,
        student_id:new ObjectID(req.body.student_id),
        message:req.body.collaboration_and_teamwork_message,
        teacher_id:req.user._id,
        month:moment().month(),
        year:moment().year() 
    },{
        title:"Communication Skills",
        sub_title:"Verbal Communication",
        rating:req.body.verbal_communication,
        student_id:new ObjectID(req.body.student_id),
        message:req.body.verbal_communication_message,
        teacher_id:req.user._id,
        month:moment().month(),
        year:moment().year() 
    },{
        title:"Communication Skills",
        sub_title:"Written Communication",
        rating:req.body.written_communication,
        student_id:new ObjectID(req.body.student_id),
        message:req.body.written_communication_message,
        teacher_id:req.user._id,
        month:moment().month(),
        year:moment().year()
    },{
        title:"Personal Growth",
        sub_title:"Time Management",
        rating:req.body.time_management,
        student_id:new ObjectID(req.body.student_id),
        message:req.body.time_management_message,
        teacher_id:req.user._id,
        month:moment().month(),
        year:moment().year()
    },{
        title:"Personal Growth",
        sub_title:"Organization and Preparedness",
        rating:req.body.organization_and_preparedness,
        student_id:new ObjectID(req.body.student_id),
        message:req.body.organization_and_preparedness_message,
        teacher_id:req.user._id,
        month:moment().month(),
        year:moment().year()
    },{
        title:"Personal Growth",
        sub_title:"Responsibility and Accountability",
        rating:req.body.responsibility_and_accountability,
        student_id:new ObjectID(req.body.student_id),
        message:req.body.responsibility_and_accountability_message,
        teacher_id:req.user._id,
        month:moment().month(),
        year:moment().year() 
    }])
    const additionalComment=await AdditionalComment.create({
        student_id:new ObjectID(req.body.student_id),
        comments:req.body.comments,
        month:moment().month(),
        year:moment().year(),
        teacher_id:req.user._id
    })
    return res.json(responseObj(true,{report:report,additionalComment:additionalComment} ,"Student Report Inserted"))
}
const getMonthlyReportDetails=async(req,res)=>{
    const averageGrade=await Report.aggregate([
        {
            $match:{
                $and:[
                   { student_id:new ObjectID(req.query.student_id)},
                   { month:Number(req.query.month)},
                    {year:Number(req.query.year) },
                    { teacher_id:new ObjectID(req.user._id)}  
                ]
                
            }
        }
        ,
        {
            $project :{
                totalRatings:{
                    "$avg":"$rating"
                }
            }
        }
    ])
    
    const report=await Report.find({student_id:new ObjectID(req.query.student_id),
        month:req.query.month,
        year:req.query.year,
        teacher_id:req.user._id})

const additionalComment=await AdditionalComment.findOne({student_id:new ObjectID(req.query.student_id), month:req.query.month,
    year:req.query.year, teacher_id:req.user._id})
    res.json(responseObj(true,{ratings:averageGrade[0]?.totalRatings?averageGrade[0]?.totalRatings:0,report:report,additionalComment:additionalComment},null))
}
const isStudentReportPending=async(req,res)=>{
    let isPendingResponse=await Class.findOne({
        student_id:req.query.student_id,
        teacher_id:req.user._id,
        start_time:{
            $gte:moment().startOf('month').format("YYYY-MM-DDTHH:mm:ss"),
            $lte:moment().endOf('month').format("YYYY-MM-DDTHH:mm:ss")
        },
        status:'Done'
    })
    return res.json(responseObj(true,isPendingResponse!==null,null))
}
export {getMonthlyReport,addMonthlyReport,getMonthlyReportDetails,isStudentReportPending}
