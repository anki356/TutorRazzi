import Class from "../../../models/Class.js"
import ResourceRequest from "../../../models/ResourceRequest.js"
import Review from "../../../models/Review.js"
import Attendance from "../../../models/Attendance.js"
import { responseObj } from "../../../util/response.js"
import mongoose from "mongoose"
import sendEmail from "../../../util/sendEmail.js"
const ObjectID = mongoose.Types.ObjectId
import { marked } from "marked"
import Quote from "../../../models/Quote.js"
import moment from "moment-timezone"
import ExtraClassRequest from "../../../models/ExtraClassRequest.js"
import Document from "../../../models/Document.js"
import jwt from 'jsonwebtoken'
import Student from "../../../models/Student.js"
import { newResourceRequested } from "../../../util/EmailFormats/newResourceRequested.js"
import { adminNewResourceRequest } from "../../../util/EmailFormats/adminNewResourceRequest.js"
import unlinkFile from "../../../util/unlinkFile.js"
import HomeWork from "../../../models/HomeWork.js"
import Teacher from "../../../models/Teacher.js"
import Task from "../../../models/Task.js"
import Reminder from "../../../models/Reminder.js"
import { addNotifications } from "../../../util/addNotification.js"
import User from "../../../models/User.js"

const dislikeClass = async (req, res, next) => {




    const dislikeResponse = await Class.findOneAndUpdate({_id:req.body.class_id},{$set:{
      
        response: "Disliked",
        reason_disliking: req.body.reason
    }})
    addNotifications(dislikeResponse.teacher_id,"Class has been disliked"," Class has been disliked by "+req.user.name+" for subject "+dislikeResponse.subject+" on "+ moment(dislikeResponse.start_time).format("DD-MM-YYYY")+ "at "+moment(dislikeResponse.start_time).format("HH:mm" ))
    res.json(responseObj(true, [], " Dislike Response saved Successfully", []))



}

const likeClass = async (req, res, next) => {
    const likeResponse = await Class.findOneAndUpdate({_id:req.body.class_id},{$set:{
      
        response: "Liked",
    }})
    addNotifications(likeResponse.teacher_id,"Class has been Liked"," Class has been Liked by "+req.user.name+" for subject "+likeResponse.subject+" on "+ moment(likeResponse.start_time).format("DD-MM-YYYY")+ "at "+moment(likeResponse.start_time).format("HH:mm" ))
    res.json(responseObj(true, [], "Like Response Saved Successful"))
}

const requestExtraclass = async (req, res, next) => {
   
    const extraClassRequestResponse = await ExtraClassRequest.insertMany({
        quote_id: req.body.quote_id,
        message: req.body.message,

    })
    res.json(responseObj(true, extraClassRequestResponse, "Request for Extra Class Created Successfully"))
}

const requestTrialClass = async (req, res, next) => {
   
    let classResponseArray = []
    let classResponse = await Class.findOne({
        student_id: req.user._id,
        "subject.name": req.body.subject ,
        status: 'Done'
    })
   
    if (classResponse) {
        throw new Error("Subject Trial Class already done")




    }

    await req.body.start_time.forEach(async (element) => {
        let newClassResponse = await Class.insertMany({
            teacher_id: req.body.teacher_id,
            student_id: req.user._id,
            start_time: moment(element).format("YYYY-MM-DDTHH:mm:ss"),
            end_time: moment(element).add(1, 'h').format("YYYY-MM-DDTHH:mm:ss"),
            subject: { name: req.body.subject },
            curriculum: { name: req.body.curriculum },
            grade: { name: req.body.grade },
            class_type: "Trial",
            status: "Pending",
            is_rescheduled: false,
            details: req.body.details ? req.body.details : null
        })
        classResponseArray.push(newClassResponse)



    });
    res.json(responseObj(true, classResponseArray, "Trial Class request created Successfully"))




}

const getClassDetails = async (req, res, next) => {
    let classDetails = {}
    classDetails = await Class.findOne({ _id: req.query.class_id }).populate({
        path: 'teacher_id', select: {
            profile_image: 1, name: 1
        }
    })
 let teacherResponse=await Teacher.findOne({
    user_id:classDetails.teacher_id
 },{
    exp:1,
    qualification:1
 }) 
 let reviews=await Review.countDocuments({
    teacher_id:classDetails.teacher_id
 }) 
 let average_rating=await Review.aggregate([
    {$match:{teacher_id:classDetails.teacher_id}},{
        $group:{
           _id:"$teacher_id",
           avgRating:{$avg:"$rating"}
    }}
 ])
let homeworkResponse=await HomeWork.find({
    class_id:req.query.class_id
})
let taskResponse=await Task.find({
    class_id:req.query.class_id
})
let classReview=await Review.findOne({
    class_id:req.query.class_id,
    given_by:req.user._id
  })
  let teacherReview=await Review.findOne({
    class_id:req.query.class_id,
    given_by:req.user._id,
    teacher_id:classDetails.teacher_id
  })
    res.json(responseObj(true, {classDetails,homeworkResponse:homeworkResponse,taskResponse:taskResponse,teacherResponse:teacherResponse,classReview:classReview,teacherReview:teacherReview,average_rating:average_rating,reviews:reviews}, "Class Details successfully fetched"))
}

const scheduleClass = async (req, res, next) => {
   
    let classScheduled = await Class.find({
        $and: [{
            start_time: req.body.start_time,
        }, {
            $or: [{
                teacher_id: req.body.teacher_id
            }, {
                student_id: req.user._id
            }]
        }]
    })
    if (classScheduled.length !== 0) {
        throw new Error('This time slot has been already scheduled')
    }

    const scheduleClassResponse = await Class.findOneAndUpdate({ _id:req.params._id ,status:"Pending"}, {
        $set: {

            start_time: req.body.start_time,
            end_time: moment(req.body.start_time).add(1, 'h').format("YYYY-MM-DDTHH:mm:ss"),
            status: 'Scheduled'
        }
    })
    let purchased_classes = await Class.find({ quote_id: scheduleClassResponse.quote_id }, { status: 1 })
    let statusArray = purchased_classes.map((data) => {
        return data.status
    })

    if (!statusArray.includes('pending')) {
        await Quote.findByIdAndUpdate(scheduleClassResponse.quote_id, {
            $set: {
                schedule_status: 'done'
            }
        })
    }
    addNotifications(req.body.teacher_id,"Class Scheduled Successfully","Class has been scheduled for student "+req.user.name+" on "+moment(req.body.start_time).format("DD-MM-YYYY")+ " at "+moment(req.body.start_time).format("HH:mm" ))
    res.json(responseObj(true, scheduleClassResponse, "Class Scheduled Successfully"))



}

const rescheduleClass = async (req, res, next) => {
   
    let classScheduled = await Class.find({
        $and: [{
            start_time: req.body.start_time,
        }, {
            $or: [{
                teacher_id: req.body.teacher_id
            }, {
                student_id: req.user._id
            }]
        },{
            status:"Scheduled"
        }]
    })

    if (classScheduled.length !== 0) {
        throw new Error('This time slot has been already scheduled')
    }

    const rescheduleClassResponse = await Class.updateOne({ _id: new ObjectID(req.params._id) }, {
        $set: {
            is_rescheduled: true,
            start_time: moment(req.body.start_time).format("YYYY-MM-DDTHH:mm:ss"),
            end_time: moment(req.body.start_time).add(1, 'h').format("YYYY-MM-DDTHH:mm:ss"),
            rescheduled_by: 'student',
            status: 'Pending'
        }
    })
    addNotifications(req.body.teacher_id,"Class ReScheduled","Class has been re-scheduled for student "+req.user.name+" on "+moment(req.body.start_time).format("DD-MM-YYYY")+ " at "+moment(req.body.start_time).format("HH:mm" ))
    res.json(responseObj(true, [], "Class ReScheduled Successfully"))

}

const reviewClass = async (req, res, next) => {
    let classDetails=await Class.findOne({
        _id : req.body.class_id
      })
      if(classDetails===null){
        throw new Error("Incorrect Class ID")
      }
      let reviewResponse=await Review.findOne({
        class_id:req.body.class_id,
        given_by:req.user._id
      })
      console.log(reviewResponse)
      if(reviewResponse===null){
         reviewResponse=await Review.insertMany({
          class_id:req.body.class_id,
          message:req.body?.message,
          rating:req.body.rating,
          given_by:req.user._id
      })
      }
      else{
    reviewResponse=await Review.updateOne({
      _id:reviewResponse._id
    },{
      $set:{
        message:req.body?.message,
        rating:req.body.rating,
      }
    })
      }
 
    const teacherDetails=await Class.findOne({
        _id:req.body.class_id
    })
    addNotifications(teacherDetails.teacher_id,"Class Reviewed","Class  for student "+req.user.name+" for subject "+classDetails.subject+" on "+moment(classDetails.start_time).format("DD-MM-YYYY")+ " at "+moment(classDetails.start_time).format("HH:mm" )+" has been reviewed as rating "+req.body.rating)

    res.json(responseObj(true, reviewResponse, "Review Created Successfully"))
}

const raiseRequestResource = async (req, res, next) => {
   
    let resourcerequestcount = await ResourceRequest.countDocuments()
    let response = await ResourceRequest.insertMany({
        request_id: resourcerequestcount + 1,
        message: req.body.message,
        class_id: req.body.class_id,
      
    })
    const classResponse = await Class.findOne({ _id: req.body.class_id }, { teacher_id: 1, subject: 1, curriculum: 1, grade: 1,name:1 }).populate({
        path: 'teacher_id', select: {
            name: 1
        }
    })


    const htmlContent = newResourceRequested(req.user.name, resourcerequestcount)
    
        sendEmail(req.user.email, "Resource Reqested", htmlContent, null)
    
const teacherResponse=await User.findOne({
    _id:classResponse.teacher_id
})

    const adminHtmlContent = adminNewResourceRequest(req.user.name, req.body.message, classResponse)
    sendEmail(teacherResponse.email, "Resource Reqested", adminHtmlContent, null)
    let class_name=classResponse.name!==null&&classResponse.name!==undefined?classResponse.name:classResponse.subject.name+" of " +classResponse.grade.name+" By "+classResponse.teacher_id.name


    addNotifications({
        user_id:teacherResponse._id,
        title:"Resource Requested ",
        description:`${req.user.name} has requested resources for your Class ${class_name}`
    })
    res.json(responseObj(true, response, "Resource Requested Successfully"))


}

const joinClass = async (req, res, next) => {
    let classResponse = await Class.findOne({
        _id: req.body.class_id
    }, {
        start_time: 1,
        end_time: 1
    })

    if (!moment().isBetween(moment(classResponse.start_time), moment(classResponse.end_time))) {
        throw new Error('You cannot Join Class at this time')
    }
    classResponse = await Class.updateOne({
        _id: req.body.class_id
    }, {

        $set: {
            status: 'Done'
        }
    })
   
    let attendanceResponse = await Attendance.insertMany({
        check_in_datetime: moment().format("YYYY-MM-DDTHH:mm:ss"),
        student_id: req.user._id,
        class_id: req.body.class_id,

    })
return res.json(responseObj(true, attendanceResponse, "Class Joined"))

}

const leaveClass = async (req, res, next) => {
   
    let response = await Attendance.findOneAndUpdate({
        class_id: req.body.class_id,
        student_id: req.user._id
    }, {
        $set: {
            check_out_datetime:moment().format("YYYY-MM-DDTHH:mm:ss")
        }
    })
let classResponse=await Class.updateOne({
    _id:req.body.class_id
},{
    $set:{
        end_time:   moment().format("YYYY-MM-DDTHH:mm:ss")

    }
})
  return   res.json(responseObj(true, {response,classResponse}, "Class Left"))
}

const setReminder = async (req, res, next) => {
    const reminderResponse = await Reminder.insertMany({
        class_id: req.body.class_id,
        user_id: req.user._id
    })
    res.json(responseObj(true, reminderResponse, "Reminder Created Successfully"))
}

const acceptRescheduledClass = async (req, res, next) => {
let classDetails=await Class.findOne({
    _id:req.params._id
})
    classDetails = await Class.find({
        $and: [{
            start_time: classDetails.start_time,
        }, {
            $or: [{
                teacher_id: req.body.teacher_id
            }, {
                student_id: req.user._id
            }]
        },{
            status:"Scheduled"
        }]
    })
    if (classDetails.length !== 0) {
        throw new Error("Slot Already Booked")

    }
    let classResponse=await Class.findOne(
        {_id:req.params._id,
        
          rescheduled_by:'student'
        }
       )
       console.log(classResponse)
       if(classResponse!==null){
        throw new Error("You can't Accept your own Reschedule request.")
       }
    let rescheduleacceptResponse = await Class.findOneAndUpdate({ _id: new ObjectID(req.params._id) }, {
        $set: {
            status: 'Scheduled'
        }
    });
    addNotifications(req.body.teacher_id,"Class rescheduled by You for student "+req.user.name+" for subject "+rescheduleacceptResponse.subject+" on "+moment(rescheduleacceptResponse.start_time).format("DD-MM-YYYY")+ " at "+moment(rescheduleacceptResponse.start_time).format("HH:mm" )+" has been accepted")
    res.json(responseObj(true, rescheduleacceptResponse, "Rescheduled Class Accepted Successfully"))
}

const markTaskDone = async (req, res, next) => {
   let taskResponse=await Task.findOneAndUpdate({
    _id:req.params._id
   },{
    $set:{
        status:"Done"
    }
   })
   const teacherDetails=await Class.findOne({
    _id:taskResponse.class_id
})
addNotifications(teacherDetails.teacher_id,"Task marked Done"," Task has been marked as done given to "+req.user.name+ " in class for subject "+teacherDetails.subject+" on "+ moment(teacherDetails.start_time).format("DD-MM-YYYY")+ "at "+moment(teacherDetails.start_time).format("HH:mm" ))
    res.json(responseObj(true, [], "Task Marked Done"))
   
}
const uploadHomework = async (req, res, next) => {
    let documentResponse = await Document.create({
        name: req.files[0].filename
    })
let homeworkResponse=await HomeWork.findOne({
    _id:req.params._id
})
if(homeworkResponse.answer_document_id!==null&&homeworkResponse.answer_document_id!==undefined ){
  let  documentTobeDeleted=await Document.findOne(
        {_id:homeworkResponse.answer_document_id}
    )
  unlinkFile(documentTobeDeleted.name)  
}
   homeworkResponse=await HomeWork.findOneAndUpdate({
    _id:req.params._id
  },{
    $set:{
        status:"Done",
        answer_document_id:documentResponse._id
    }
  })
  const teacherDetails=await Class.findOne({
    _id:homeworkResponse.class_id
})
addNotifications(teacherDetails.teacher_id,"Home work uploaded"," Home work uploaded given to "+req.user.name+" in class for subject "+teacherDetails.subject+" on "+ moment(teacherDetails.start_time).format("DD-MM-YYYY")+ "at "+moment(teacherDetails.start_time).format("HH:mm" ))
    res.json(responseObj(true, [], "Home work uploaded"))
}

const getQuotes = async (req, res, next) => {
   
    const quoteResponse = await Quote.find({
        student_id: req.user._id,
        status: 'Pending'
    }, { teacher_id: 1, subject_curriculum_grade: 1, amount: 1, hours: 1 }).populate({
        path: "teacher_id", select: {
            name: 1
        }
    })
    res.json(responseObj(true, quoteResponse, 'Quotes are fetched successfully'))
}

const getExtraClassQuotes = async (req, res, next) => {
    
    const quoteResponse = await Quote.find({
        student_id: req.user._id,
        class_type: 'Extra'
    })

    res.json(responseObj(true, quoteResponse, 'Extra CLass Quotes are fetched properly'))
}

const getPurchasedClasses = async (req, res, next) => {
   
    let query = { student_id: req.user._id ,status:"Paid"}
    if (req.query.search) {
        query = {
            $and: [
                { student_id: req.user._id },
                {status:"Paid"},
                {
                    $or: [
                        {
                            "subject.name": {

                                $regex: req.query.search,
                                $options: 'i'
                            }
                        }
                        , {
                            "curriculum.name": {

                                $regex: req.query.search,
                                $options: 'i'
                            }
                        },
                        {
                            "grade.name": {

                                $regex: req.query.search,
                                $options: 'i'
                            }
                        }



                    ]
                }
            ]
        }

    }
    let options = {
        limit: Number(req.query.limit),
        page: Number(req.query.page),
        select: [
            "subject_curriculum_grade", "teacher_id", "hours", "class_type", "schedule_status"
        ],
        populate: {
            path: 'teacher_id',
            select: {
                name: 1
            }
        }

    }
    await Quote.paginate(query, options).then((results) => {

        res.json(responseObj(true, results, ''))
    })
}

const getPurchasedClassesByQuoteId = async (req, res, next) => {
    let options = {
        limit: Number(req.query.limit),
        page: Number(req.query.page),
        select: [

            "subject", "start_time", "status", "teacher_id"
        ],
        populate: {
            path: "teacher_id",
            select: {
                name: 1
            }
        }

    }
    Class.paginate({ quote_id: new ObjectID(req.query._id) }, options).then((result, err) => {
        res.json(responseObj(true, result, 'Purchased Class Quotes are fetched successfully'))
    })
}



const getLastTrialClass = async (req, res, next) => {
   
    const lastClassResponse = await Attendance.findOne({ student_id: req.user._id }).populate({'path':'class_id',select:{
        start_time:1,subject:1,teacher_id:1,
    },populate:{
        path:"teacher_id",
        select:{
        "name":1
        }
    },match:{
        class_type:"Trial"
    }}).sort({ _id: -1 })
    
    if(lastClassResponse!==null){

        const TrialResponse=await Class.findOne({
            _id:lastClassResponse.class_id,
            response:{
                $ne : null
            }
        })
       
        if(TrialResponse!==null){
            return res.json(responseObj(true,null,"Trial Class already responded"))
        }
        
        res.json(responseObj(true, lastClassResponse.class_id, 'Last trial class details are fetched successfully'))
    }
    else{
        return res.json(responseObj(true,null,"No Trial Class"))
    }
    


}
const getClassesBasedOnDate=async (req,res)=>{
    const start_time=moment(req.body.date).startOf('day')
    const end_time=moment(req.body.date).endOf('day')
    const classes=await Class.find({
      start_time:{$gte :start_time},
      end_time:{$lte:end_time},
      student_id:req.user._id
    })
    return res.json(responseObj(true,classes,null)) 
  }
  const getUpcomingClassDetails=async(req,res)=>{
    let classDetails = {}
    classDetails = await Class.findOne({ _id: req.query.class_id }, { start_time: 1, end_time: 1, details: 1, grade: 1, subject_id: 1, teacher_id: 1, notes: 1 }).populate({
      path: 'teacher_id', select: {
       name: 1,profile_image:1
      }
    }).populate({
      path: 'student_id', select: {
        name: 1,mobile_number:1,profile_image:1
      }
    })
    let studentDetails=await Student.findOne({user_id:classDetails.student_id},{
      grade:1,
      curriculum:1,
      school:1
    })
    let teacherDetails=await Teacher.findOne({user_id:classDetails.teacher_id},{
      qualification:1,
  
    })
   
    
    let reminderResponse = await Reminder.findOne({ class_id:req.query.class_id })
    res.json(responseObj(true, { classDetails: classDetails, reminderResponse: reminderResponse,studentDetails:studentDetails,teacherDetails:teacherDetails }, null))
  }
export { getUpcomingClassDetails,getClassesBasedOnDate,dislikeClass, getLastTrialClass, likeClass, setReminder, getExtraClassQuotes, requestExtraclass, markTaskDone, uploadHomework, scheduleClass, requestTrialClass, getClassDetails, rescheduleClass, reviewClass, raiseRequestResource, joinClass, leaveClass, acceptRescheduledClass, getQuotes, getPurchasedClasses, getPurchasedClassesByQuoteId }