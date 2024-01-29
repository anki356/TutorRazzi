import Class from "../../../models/Class.js"
import mongoose from "mongoose"
import { responseObj } from "../../../util/response.js"
import moment from "moment/moment.js"
import Payment from "../../../models/Payment.js"
import Student from "../../../models/Student.js"
import Attendance from "../../../models/Attendance.js"
import Teacher from "../../../models/Teacher.js"
import User from "../../../models/User.js"
const ObjectId = mongoose.Types.ObjectId
import unlinkFile from "../../../util/unlinkFile.js"
import Testimonial from "../../../models/Testimonial.js"
const editProfile = async (req, res, next) => {
//   if(req.body.delete_testimonials){
//     const fileResponse=await Testimonial.find({
//       _id: {$in: req.body.delete_images},
//     },{
//       name:1
//     })
// fileResponse.forEach((data)=>{
//   unlinkFile(data.name)
// })
//     await Testimonial.deleteMany({_id:{$in:req.body.delete_testimonials}})
//   }
  if (req.files ) {
    // let testimonialsResponse = await Testimonial.insertMany(
    //   req.files.filter((data) => data.fieldname === "testimonials[]")
    //     .map((data) => {
    //       return { video: data.filename, teacher_id:req.user._id,student_id:req.body.student_id };
    //     })
    // )
    let image=   req.files.filter((data) => data.fieldname === "photo")
    if(image.length>0){
      const imageResponse = await User.findOne({
        _id: req.user._id
      }, {
        profile_image: 1
      })
      if (imageResponse.profile_image) {
    
        unlinkFile(imageResponse.profile_image)
      }
       await User.updateOne({
        _id: req.user._id
      }, {
        $set: {
          profile_image: image[0].filename
        }
      })
    }
   
  
 
  }
  const teacherResponse = await Teacher.findOneAndUpdate({
    user_id: req.user._id
  }, {
    $set: {
      ...req.body
    }
  })
if(req.body.preferred_name){
  req.body.name=req.body.preferred_name
}
  const userResponse = await User.updateOne({
    _id: req.user._id
  }, {
    $set: {
      ...req.body,
      

    }
  })
  res.json(responseObj(true, { teacherResponse, userResponse }, null))
}
const editPhoto = async (req, res, next) => {
  const imageResponse = await User.findOne({
    _id: req.user._id
  }, {
    profile_image: 1
  })
  if (imageResponse.profile_image) {

    unlinkFile(imageResponse.profile_image)
  }
  const userResponse = await User.updateOne({
    _id: req.user._id
  }, {
    $set: {
      profile_image: req.files[0].filename
    }
  })
  res.json(responseObj(true, userResponse, null))
}
const getTrialClassesRequests = async (req, res, next) => {
  let query = {
    $and: [{
      teacher_id: req.user._id,
      class_type: 'Trial',
      start_time: {
        $gte:new Date().toLocaleDateString()
      },
      status: 'Pending'
    }]
  }
  if (req.query.search) {
    query = {
      $and: [{
        teacher_id: req.user._id,
        class_type: 'Trial',
        start_time: {
          $gte: new Date().toLocaleDateString(),

        },
        status: "Pending",
        $or:
          [
            {
              "subject.name": {
                $regex: req.query.search,
                $options: 'i'
              }
            }, {
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

      }]
    }
  }
  let options = {
    limit: req.query.limit ? Number(req.query.limit) : 5,
    page: Number(req.query.page)||1,
    populate:[{
      path:'student_id',
      select:{
        name:1
      }
    },{
      path:'teacher_id',
      select:{
        name:1
      }
    }]
  }
  Class.paginate(query, options, (err, result) => {
    result.docs.forEach((data)=>{
      if(data?.rescheduled_by===req.user._id){
data.is_user=true
      }
    })
    res.json(responseObj(true, result, null))
  })
}
const getUpcomingClasses = async (req, res, next) => {
  
  
  let options = {
    limit: req.query.limit ? Number(req.query.limit) : 5,
    page: Number(req.query.page)||1,
    populate:[{
      path:'student_id',
      select:{
        name:1
      }
    },{
      path:'teacher_id',
      select:{
        name:1
      } 
    }]
  }
  let query = {
    $and: [
      { start_time: { $gte: moment().format("YYYY-MM-DDTHH:mm:ss") } },

      { teacher_id: req.user._id },


      { status: 'Scheduled' }
    ]


  }
  if (req.query.search) {
    query = {
      $and: [
        { start_time: { $gte: moment().format("YYYY-MM-DDTHH:mm:ss") } },

        { teacher_id: req.user._id },


        { status: 'Scheduled' }, {
          $or:
            [
              {
                "subject.name": {
                  $regex: req.query.search,
                  $options: 'i'
                }
              }, {
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
              } ,{
                name: {
      
                  $regex: req.query.search,
                  $options: 'i'
                }
              }



            ]

        },
       
      ]


    }
  }
  
  Class.paginate(query, options, (err, results) => {
    if(results.docs.length===0){
      throw new Error("No CLaases Found")
    }
    if (results) {
      res.json(responseObj(true, results, null))
    }
  })

}
const overallPerformance = async (req, res, next) => {
  const classResponse = await Class.find({ teacher_id: req.user._id }, { _id: 1 })

  const total_earnings_response = await Payment.aggregate([
    {
      $match: {
        $and: [

          {
            class_id: {
              $in: classResponse.map(x => x._id)
            }
          }, {
            createdAt: {
              $gte: moment().startOf('week').set('h', 0).set('m', 0).set('s', 0).format("YYYY-MM-DDTHH:mm:ss"),
              $lte: moment().endOf('week').add(1, 'd').set('h', 0).set('m', 0).set('s', 0).format("YYYY-MM-DDTHH:mm:ss")
            }
          }
        ]
      }

    }, {
      $group: {
        _id: "$createdAt",
        totalEarnings: {
          $sum: "$amount"
        }
      }
    }
  ])
  let weeklyPaymentResponseArray = []
  for (let i = 0; i < 7; i++) {


    const weeklyPaymentResponse = await Payment.aggregate([
      {
        $match: {
          $and: [

            {
              "createdAt": {
                $gte: moment().startOf('week').set('h', 0).set('m', 0).set('s', 0).add(i, 'd').format("YYYY-MM-DDTHH:mm:ss")
              }
            },
            {
              "createdAt": {
                $lte: moment().startOf('week').set('h', 0).set('m', 0).set('s', 0).add(i + 1, 'd').format("YYYY-MM-DDTHH:mm:ss")
              }
            },
            {
              class_id: {
                $in: classResponse.map(x => x._id)
              }
            }

          ]
        }
      },
      {
        $group: {
          _id: moment().startOf('week').set('h', 0).set('m', 0).set('s', 0).add(i, 'd').format("YYYY-MM-DDTHH:mm:ss"),
          totalEarnings: {
            $sum: "$amount"
          },

        }
      }
    ])
    if (weeklyPaymentResponse.length > 0) {

      weeklyPaymentResponseArray.push({
        date: moment().startOf('week').set('h', 0).set('m', 0).set('s', 0).add(i, 'd').format("YYYY-MM-DDTHH:mm:ss"),
        totalEarnings: weeklyPaymentResponse[0].totalEarnings
      })
    }
    else {
      weeklyPaymentResponseArray.push({
        date: moment().startOf('week').set('h', 0).set('m', 0).set('s', 0).add(i, 'd').format("YYYY-MM-DDTHH:mm:ss"),
        totalEarnings: 0
      })
    }

  }
  let totalHoursResponse = 0;
  const attendanceResponse = await Attendance.find({ teacher_id: req.user._id }, { "check_in_datetime": 1, "check_out_datetime": 1 })

  attendanceResponse.forEach((data, index) => {
    totalHoursResponse += moment(data['check_out_datetime']).diff(moment(data['check_in_datetime']), 'H')
  })

  const totalBookingsResponse = await Class.aggregate([{
    $match: {
      $and: [{
        teacher_id: new ObjectId(req.user._id)
      }
      , {
        status: {
          $in: ['Scheduled','Done']
        }
      }
    ]
    }
  }
  , {
    $group: {
      _id: '$teacher_id',
      totalBookings: {
        $sum: 1
      }
    }
  }
])

  res.json(responseObj(true, { totalEarnings: total_earnings_response.length > 0 ? total_earnings_response[0].totalEarnings : 0, weeklyPaymentResponseArray: weeklyPaymentResponseArray, totalHoursResponse: totalHoursResponse, totalBookingsResponse: totalBookingsResponse.length > 0 ? totalBookingsResponse[0].totalBookings : 0 }, null))
}
const getTotalStudents = async (req, res, next) => {
  let query = {
    teacher_id: req.user._id
  }
  const classResponse = await Class.find(query, { student_id: 1 })
 
  query = {
    user_id: {
      $in: classResponse.map((data) => data.student_id)
    }
  }
  if(req.query.name){
    query.preferred_name={
      $regex:req.query.name,
      $options:"i"
    }
  }
  const options = {
    limit: req.query.limit,
    page: req.query.page,
    select: {
      "preferred_name": 1,
      "grade": 1,
      "curriculum": 1,
      "user_id":1
    },
    populate:{
      path:'user_id',
      select:{
        "profile_image":1,"_id":1
      }
    }
  }
  Student.paginate(query, options, (err, studentResponse) => {
if(studentResponse.docs.length===0){
  return res.json(responseObj(false,[],"No Students found"))
 
}
    res.json(responseObj(true, studentResponse, null))
  })

}
const acceptTrialClassRequest = async (req, res, next) => {
  let details=await Class.findOne({_id:req.params._id})
  if(details===null){
    throw new Error("No Details Found of class Id")
  }
  let classDetails = await Class.find({
    $and: [{
      start_time: details.start_time,
    }, {
      $or: [{
        teacher_id: req.user._id
      }, {
        student_id: details.student_id
      }]
    },{
      status:{
        $in:'Scheduled'
      }
    }]
  })
  if (classDetails.length > 0) {
    throw new Error("Class in this slot is booked already")
  }
 
  let classUpdateResponse=await  Class.updateMany({
    student_id:details.student_id,
    teacher_id:req.user._id,
    class_type:"Trial",
    "subject.name":details.subject.name
  },{
    $set:{
      status:"Cancelled"
    }
  })
  let classResponse = await Class.updateOne({
    _id: new ObjectId(req.params._id)
  }, {
    $set: {
      status: 'Scheduled'
    }
  })
  
   return res.json(responseObj(true, [], "Class Request Accepted"))


}

const getAllExams = async (req, res, next) => {
  let StudentResponse = []
  let query = { _id: new ObjectId(req.query.student_id) }
  if (req.query.search) {
    query = {
      _id: new ObjectId(req.query.student_id),
      exams: {
        $elemMatch: {
          $or: [
            {
              subject: {
                $regex: req.query.search,
                options: 'i'
              }
            }, {
              syllabus: {
                $regex: req.query.search,
                options: 'i'
              }
            }
          ]
        }
      }
    }
  }
  StudentResponse = await Student.findOne(query, { exams: 1 })
 
  res.json(responseObj(true, StudentResponse, null))
}
const getTrialClasses = async (req, res, next) => {
  let query = {
    $and: [{
      teacher_id: req.query.teacher_id,
      class_type: 'Trial',
      start_time: {
        "$gte": new Date()
      }
    }]
  }
  if (req.query.search) {
    query = {
      $and: [{
        teacher_id: req.query.teacher_id,
        class_type: 'Trial',
        start_time: {
          "$gte": new Date()
        }, $or:
          [
            {
              "subject.name": {
                $regex: req.query.search,
                $options: 'i'
              }
            }, {
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

      }]
    }
  }
  let options = {
    limit: req.query.limit ? Number(req.query.limit) : 5,
    page: Number(req.query.page),
    populate: {
      path: "student_id",
      select: {
        full_name: 1
      }
    }
  }
  Class.paginate(query, options, (err, result) => {
    if(result.docs.length===0){
      return res.json(responseObj(false, [], "No Classes Found"))
    }
    res.json(responseObj(true, result, null))
  })
}
const getMyProfile = async (req, res, next) => {
 

    const teacherResponse = await Teacher.find({ user_id: req.user._id}).populate({ path: 'user_id' })
    const testimonialResponse=await Testimonial.find({teacher_id:req.user._id})
    res.json(responseObj(true, {...teacherResponse,...testimonialResponse}, null))
  
 

  
}
export { getTrialClassesRequests, editProfile, getUpcomingClasses, overallPerformance, getTotalStudents, acceptTrialClassRequest, getAllExams, getTrialClasses, getMyProfile, editPhoto };