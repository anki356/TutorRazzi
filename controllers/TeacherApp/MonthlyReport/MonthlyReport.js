import Grade from "../../../models/Grade.js"
import mongoose from "mongoose"
import { responseObj } from "../../../util/response.js"
import AdditionalComment from "../../../models/AdditionalComment.js"
import moment from "moment"
import Report from "../../../models/Report.js"
import Class from "../../../models/Class.js"
import { addNotifications } from "../../../util/addNotification.js"
const ObjectID=mongoose.Types.ObjectId
const getMonthlyReport=async(req,res,next)=>{
    const months = [
        "January", 
        "February", 
        "March", 
        "April", 
        "May", 
        "June", 
        "July", 
        "August", 
        "September", 
        "October", 
        "November", 
        "December"
      ];
    const monthlyReport=await Report.aggregate([
        {
            $match:{
                student_id:new ObjectID(req.query.student_id),
                teacher_id:new ObjectID(req.user._id),
                subject:req.query.subject
            }
        },  {
            $group: {
                _id: {
                    year: "$year",
                    month:"$month"
                },
                averageRating: { $avg: "$rating" },
                subject:{
                    $first:"$subject"
                }
              // You can use other accumulator operators based on your requirements
                // Add other fields or calculations as needed
            }
        },
        
        {
            $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                averageRating: 1,// Include other fields as needed,
                subject:1,
                month_name: {
                    $let: {
                      vars: {
                        monthsInString: [
                    
                          'January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'
                        ]
                      },
                      in: { $arrayElemAt: ['$$monthsInString', '$_id.month'] }
                    }
                  },
            }
        },
        {
            $sort: {
                year: -1,
                month: -1
            }
        }
    ])
    let totalDocs=monthlyReport.length
   let totalPages=Math.ceil(totalDocs/Number(req.query.limit))
   let hasPrevPage=req.query.page>1
   let hasNextPage=req.query.page<totalPages
   let prevPage=hasPrevPage?Number(req.query.page)-1:null
   let nextPage=hasNextPage?Number(req.query.page)+1:null 
 

  return  res.json(responseObj(true,{docs:monthlyReport,totalDocs:totalDocs,limit:req.query.limit,page:req.query.page,pagingCounter:req.query.page,totalPages:totalPages,hasNextPage:hasNextPage,hasPrevPage:hasPrevPage,prevPage:prevPage,nextPage:nextPage},null))
}

const addMonthlyReport=async(req,res)=>{
    const monthlyReport=await Report.aggregate([
        {
            $match:{
                student_id:new ObjectID(req.query.student_id),
                teacher_id:new ObjectID(req.user._id),
                subject:req.query.subject
            }
        },  {
            $group: {
                _id: {
                    year: "$year",
                    month:"$month"
                },
                averageRating: { $avg: "$rating" },
                subject:{
                    $first:"$subject"
                }
              // You can use other accumulator operators based on your requirements
                // Add other fields or calculations as needed
            }
        },
        
        {
            $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                averageRating: 1,// Include other fields as needed,
                subject:1,
                month_name: {
                    $let: {
                      vars: {
                        monthsInString: [
                    
                          'January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'
                        ]
                      },
                      in: { $arrayElemAt: ['$$monthsInString', '$_id.month'] }
                    }
                  },
            }
        },
        {
            $sort: {
                year: -1,
                month: -1
            }
        }
    ])
    if(monthlyReport.length>0&& monthlyReport[0].averageRating['$numberDecimal']===null){



    
    const report=await Report.updateOne({
title:"Academic Performance",
sub_title:"Subject Knowledge and Understanding",
student_id:new ObjectID(req.body.student_id),
teacher_id:req.user._id,
month:moment().month(),
year:moment().year(),
  subject:  req.body.subject

    },{
        $set:{
            rating:req.body.subject_knowledge_and_understanding,
            message:req.body.subject_knowledge_and_understanding_message,
            status:true
        }
    })
    await Report.updateOne({
        title:"Academic Performance",
        sub_title:"Class Participation and Engagement",
        student_id:new ObjectID(req.body.student_id),
        teacher_id:req.user._id,
        month:moment().month(),
        year:moment().year(),
          subject:  req.body.subject
        
            },{
                $set:{
                    rating:req.body.class_participation_and_engagement,
                    message:req.body.class_participation_and_engagement_message,
                    status:true
                }
            })
            await Report.updateOne({
                title:"Academic Performance",
        sub_title:"Homework and Assignments Completion",
                student_id:new ObjectID(req.body.student_id),
                teacher_id:req.user._id,
                month:moment().month(),
                year:moment().year(),
                  subject:  req.body.subject
                
                    },{
                        $set:{
                            rating:req.body.homeworks_and_assignment_completion,
        
                            message:req.body.homeworks_and_assignment_completion_message,
                            status:true
                        }
                    })
                    await Report.updateOne({
                        title:"Academic Performance",
                        sub_title:"Problem-Solving and Critical Thinking Skills",
                        student_id:new ObjectID(req.body.student_id),
                        teacher_id:req.user._id,
                        month:moment().month(),
                        year:moment().year(),
                          subject:  req.body.subject
                        
                            },{
                                $set:{
                                    rating:req.body.problem_solving_and_critical_thinking_skills,
                                    status:true,
      
                                    message:req.body.problem_solving_and_critical_thinking_skills_message,
                                }
                            })
                            await Report.updateOne({
                                title:"Learning Attitude",
        sub_title:"Motivation and Enthusiasm",
                                student_id:new ObjectID(req.body.student_id),
                                teacher_id:req.user._id,
                                month:moment().month(),
                                year:moment().year(),
                                  subject:  req.body.subject
                                
                                    },{
                                        $set:{
                                            rating:req.body.motivation_and_enthusiasm,
                                            status:true,
                                            message:req.body.motivation_and_enthusiasm_message,
                                        }
                                    })
                                    await Report.updateOne({
                                        title:"Learning Attitude",
                sub_title:"Initiative and Self Direction",
                                        student_id:new ObjectID(req.body.student_id),
                                        teacher_id:req.user._id,
                                        month:moment().month(),
                                        year:moment().year(),
                                          subject:  req.body.subject
                                        
                                            },{
                                                $set:{
                                                    rating:req.body.initiative_and_self_direction,
                                                    status:true,
                                                    message:req.body.initiative_and_self_direction_message,
                                                }
                                            })
                                    await Report.updateOne({
                                        title:"Learning Attitude",
                                        sub_title:"Collaboration and Teamwork",
                                        student_id:new ObjectID(req.body.student_id),
                                        teacher_id:req.user._id,
                                        month:moment().month(),
                                        year:moment().year(),
                                          subject:  req.body.subject
                                        
                                            },{
                                                $set:{
                                                    rating:req.body.collaboration_and_teamwork,
                                                    status:true,
                                                    message:req.body.collaboration_and_teamwork_message,
                                                }
                                            })
                                            await Report.updateOne({
                                                title:"Communication Skills",
                                                sub_title:"Verbal Communication",
                                                student_id:new ObjectID(req.body.student_id),
                                                teacher_id:req.user._id,
                                                month:moment().month(),
                                                year:moment().year(),
                                                  subject:  req.body.subject
                                                
                                                    },{
                                                        $set:{
                                                            rating:req.body.verbal_communication,
                                                            status:true,
        message:req.body.verbal_communication_message,
                                                        }
                                                    })
                                                    await Report.updateOne({
                                                        title:"Communication Skills",
        sub_title:"Written Communication",
                                                        student_id:new ObjectID(req.body.student_id),
                                                        teacher_id:req.user._id,
                                                        month:moment().month(),
                                                        year:moment().year(),
                                                          subject:  req.body.subject
                                                        
                                                            },{
                                                                $set:{
                                                                    rating:req.body.written_communication,
                                                                    status:true,
                                                                    message:req.body.written_communication_message,
                                                                }
                                                            })
                                                            await Report.updateOne({
                                                                title:"Personal Growth",
                                                                sub_title:"Time Management",
                                                                student_id:new ObjectID(req.body.student_id),
                                                                teacher_id:req.user._id,
                                                                month:moment().month(),
                                                                year:moment().year(),
                                                                  subject:  req.body.subject
                                                                
                                                                    },{
                                                                        $set:{
                                                                            rating:req.body.time_management,
                                                                            status:true,
                                                                            message:req.body.time_management_message,
                                                                        }
                                                                    })
                                                                    await Report.updateOne({
                                                                        title:"Personal Growth",
                                                                        sub_title:"Organization and Preparedness",
                                                                        student_id:new ObjectID(req.body.student_id),
                                                                        teacher_id:req.user._id,
                                                                        month:moment().month(),
                                                                        year:moment().year(),
                                                                          subject:  req.body.subject
                                                                        
                                                                            },{
                                                                                $set:{
                                                                                    rating:req.body.organization_and_preparedness,
                                                                                    status:true,
                                                                                    message:req.body.organization_and_preparedness_message,
                                                                                }
                                                                            })
                                                                            await Report.updateOne({
                                                                                title:"Personal Growth",
        sub_title:"Responsibility and Accountability",
                                                                                student_id:new ObjectID(req.body.student_id),
                                                                                teacher_id:req.user._id,
                                                                                month:moment().month(),
                                                                                year:moment().year(),
                                                                                  subject:  req.body.subject
                                                                                
                                                                                    },{
                                                                                        $set:{
                                                                                            rating:req.body.responsibility_and_accountability,
                                                                                            status:true,
                                                                                            message:req.body.responsibility_and_accountability_message
                                                                                        }
                                                                                    })


 
       
      
 
    const additionalComment=await AdditionalComment.create({
        student_id:new ObjectID(req.body.student_id),
        comments:req.body.comments,
        month:moment().month(),
        year:moment().year(),
        teacher_id:req.user._id
    })
addNotifications(req.body.student_id,"Report Filled","Your current month report has been filled for "+req.body.subject+" by teacher "+req.user.name)

  
  
  // addNotifications(,"Task Added", "A Task has been added by "+req.user.name+" of title"+ req.body.title)
  
  
   
  
    
  
    return res.json(responseObj(true,null ,"Student Report Added"))
}
else{
    return res.json(responseObj(false,null ,"Student Report already added or class not found"))
}
}
const getMonthlyReportDetails=async(req,res)=>{
    const averageGrade=await Report.aggregate([
        {
            $match:{
                $and:[
                   { student_id:new ObjectID(req.query.student_id)},
                   { month:Number(req.query.month)},
                    {year:Number(req.query.year) },
                    { teacher_id:new ObjectID(req.user._id)} ,
                    {subject:req.query.subject} 
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
   
    let classResponse=await Class.find({
        student_id:req.query.student_id,
        teacher_id:req.user._id,
        start_time:{
            $gte:moment().startOf('month').format("YYYY-MM-DDTHH:mm:ss"),
            $lte:moment().endOf('month').format("YYYY-MM-DDTHH:mm:ss")
        },
        status:'Done',
        "subject.name":req.query.subject
        
    })
    
    if(classResponse.length===0) {
        return res.json(responseObj(true,classResponse,"No Class Found"))
    }
    let isPendingResponse=await Report.find({
        student_id:req.query.student_id,
        teacher_id:req.user._id,
        month:moment().month(),
        year:moment().year(),
        subject:{$in:classResponse.map((data)=>data.subject.name)}
    })

    return res.json(responseObj(true,isPendingResponse.length===0,null))
}
const getAllSubjects=async(req,res)=>{
    let subjects=await Class.find({
        teacher_id:req.user._id,
        student_id:req.query.student_id,
        status:"Done"
    },{
        subject:1
    })
subjects =subjects.map((data)=>{
    return data.subject.name
}).filter((data,index,self)=>{
    return self.indexOf(data)===index
})
return res.json(responseObj(true,subjects,"subjects"))

}
export {getMonthlyReport,addMonthlyReport,getMonthlyReportDetails,isStudentReportPending,getAllSubjects}
