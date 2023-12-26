import { responseObj } from "../../../util/response.js"
import Testimonial from "../../../models/Testimonial.js"
import Review from "../../../models/Review.js"
import Teacher from "../../../models/Teacher.js"
import Contact from "../../../models/Contact.js"
import Subject from "../../../models/Subject.js"
import Curriculum from "../../../models/Curriculum.js"
import Grade from "../../../models/Grade.js"
import Class from "../../../models/Class.js"
import Student from "../../../models/Student.js"
import moment from "moment"
import mongoose from "mongoose"
const objectId=mongoose.Types.ObjectId
const getGreatTeachers=async(req,res)=>{
   
    let teacherResponse = await Teacher.aggregate([
       
        
        {
            $lookup: {
                from: "reviews",
                localField: "user_id",
                foreignField: "teacher_id",
                as: "reviews"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "users"
            }
        },

        {
            $project: {
                user_id: 1,
                preferred_name: 1,
                "users.profile_image":1,
                "subject_curriculum_grade":1,
                averageRating: {
                    $avg: "$reviews.rating"
                },
    
            }
        },
        {
            $sort: { averageRating: -1 }, 
        },
        {
            $limit: req.query.limit ? req.query.limit : 5
        }

    ])
    return res.json(responseObj(true,teacherResponse,"Teacher data"))

}
const getSubjects=async(req,res)=>{
const subjects=await Subject.find({})
return res.json(responseObj(true,subjects,"All Subjects"))
}
const getCurriculums=async(req,res)=>{
    const curriculums=await Curriculum.find({})
    return res.json(responseObj(true,curriculums,"All Curriculums"))
}
const getGrades=async(req,res)=>{
    const grades=await Grade.find({})
    return res.json(responseObj(true,grades,"All Grades"))
}
const getGreatTeachersList=async(req,res)=>{
    let query={

    }
    
    
   if(req.query.subject&&req.query.curriculum&&req.query.grade){
    
    query["subject_curriculum_grade"]={
        $elemMatch:{
            "subject":req.query.subject,
            "curriculum":req.query.curriculum,
            "grade":req.query.grade
        }
    };
   }
  
   let teacherResponse = await Teacher.aggregate([
      {
        $match:query
      } ,
        
    {
        $lookup: {
            from: "reviews",
            localField: "user_id",
            foreignField: "teacher_id",
            as: "reviews"
        }
    },
    {
        $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "users"
        }
    },{
$addFields:{
    organization:{$ifNull: [
        { $arrayElemAt: ["$exp_details.organization", 0] },
        null  // Value to use if the array or its first element is null
      ]}
}
    },

    {
        $project: {
            user_id: 1,
            "preferred_name": 1,
            "users.profile_image":1,
            subject_curriculum_grade:1,
            averageRating: {
                $avg: "$reviews.rating"
            },
exp:1,
organization:1,
qualification:1,
no_of_reviews:{
    $size:"$reviews"
}

        }
    },
    {
        $sort: { averageRating: -1 }, 
    },
    {
        $limit: req.query.limit ? Number(req.query.limit) : 5
    }

])
let options={
    limit:req.query.limit,
    page:req.query.page
}
  Teacher.paginate(query,options,(err,result)=>{

      return res.json(responseObj(true,{teacherResponse:teacherResponse,result:result},"Teacher List"))
  })

}
const getTestimonials=async(req,res)=>{
    const testimonials=await Testimonial.find({},{
        video:1
    }).limit(10)
    return res.json(responseObj(true,testimonials,"Testimonials"))
}

const getFeedBacks=async(req,res)=>{
const reviews=await Review.find({message:{
$nin:['',null]
}}).limit(10)
return res.json(responseObj(true,reviews,"Feedbacks"))
}

const getTeacherDetailsById=async(req,res)=>{
    let teacher_id = req.query.teacher_id
    const teacherDetails=await Teacher.findOne({
        user_id:teacher_id
    },{
        preferred_name:1,
        subject_curriculum_grade:1,
        exp_details:1,
        exp:1,
        bio:1,
        gender:1,
        dob:1,
        testimonials:1

    }).populate({
        path:'user_id',
            select:{
                email:1,mobile_number:1
            }
        
    })
    let reviews = await Review.aggregate([
        {
            $match:{teacher_id:new objectId(teacher_id)}
        },
        {
            $lookup: {
                from: "teachers",
                localField: "teacher_id",
                foreignField: "user_id",
                as: "teachers"
            }
        },
        {
            $group: {
                _id: '$teacher_id', // Group reviews by teacher
                averageRating: { $avg: '$rating' }, // Calculate the average rating for each teacher,
               
                no_of_reviews:{$sum:1},
                
            },
        },
        {
            $project:{
                _id:1,
                averageRating:1,
                no_of_reviews:1
            }
        }
    ])
        let reviewList=await Review.find({
            teacher_id:teacher_id
        })
        let reviewCategorization=await Review.aggregate([
            {
                $match:{teacher_id:new objectId(teacher_id)}
            },
            {
                $group:{
                    _id:"$rating",
                    no_of_reviews:{
                        $sum:1
                    }
                }
            },{
                $project:{
                    _id:1,
                    no_of_reviews:1
                }
            }
        ])
        return res.json(responseObj(true,{teacherDetails:teacherDetails,reviews:reviews,reviewList:reviewList,reviewCategorization:reviewCategorization}))

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

const postReview=async(req,res)=>{
    const reviewResponse=await Review.create({
        message: req.body.message?req.body.message:null,
        rating: req.body.rating,
        teacher_id: req.body.teacher_id,
        given_by:req.user._id,
        class_id:req.body.class_id?req.body.class_id:null
    })
    res.json(responseObj(true, reviewResponse, "Review Added Successfully"))
}

const postContact=async(req,res)=>{
    let contactResponse=await Contact.create({
        ...req.body
    })
    res.json(responseObj(true,contactResponse,null))
}
export {getGrades,getCurriculums,getSubjects,postContact,getGreatTeachers,getTestimonials,getFeedBacks,getGreatTeachersList,getTeacherDetailsById,requestTrialClass,postReview}