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
import TeacherReport from "../../../models/TeacherReport.js"
import User from "../../../models/User.js"
import { ObjectId } from "bson"
import { addNotifications } from "../../../util/addNotification.js"
import AcademicManager from "../../../models/AcademicManager.js"
import SubjectCurriculum from "../../../models/SubjectCurriculum.js"
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
    let subjects
    if(req.query.teacher_id){
        const subjectDetails=await SubjectCurriculum.find({
            curriculum:req.query.curriculum_name
        })
         subjects=await Teacher.aggregate([ { $match: { user_id:new ObjectId(req.query.teacher_id ), "subject_curriculum.subject": {$in:subjectDetails.map((data)=>data.subject)}} },
            { $unwind: "$subject_curriculum" }, // Unwind the subject_curriculum array
            {
              $group: {
                _id: "$subject_curriculum.curriculum", // Group by the curriculum field within each subject_curriculum object
                // _id: "$user_id" , // Preserve the teacher's user_id
                // curriculum_name: { $first: "$subject_curriculum.curriculum" }, // Preserve the curriculum name
                subject_name: { $addToSet: "$subject_curriculum.subject" }
                 // Collect unique subjects for each curriculum
              }
            }
        ])
    }else{
        subjects=await SubjectCurriculum.find({ curriculum:req.query.curriculum_name})
    }
    
return res.json(responseObj(true,subjects,"All Subjects"))
}
const getCurriculums=async(req,res)=>{
    let curriculums
if(req.query.teacher_id){
     curriculums=await Teacher.aggregate([ { $match: { user_id:new ObjectId(req.query.teacher_id )} },
        { $unwind: "$subject_curriculum" }, // Unwind the subject_curriculum array
        {
          $group: {
            _id: "$subject_curriculum.curriculum", // Group by the curriculum field within each subject_curriculum object
            // teacher_id: { $first: "$user_id" }, // Preserve the teacher's user_id
            curriculum_name: { $first: "$subject_curriculum.curriculum" }, // Preserve the curriculum name
             // Collect unique subjects for each curriculum
          }
        }
    ])   
}
   else{
curriculums=await Curriculum.find({})
   }
    
    return res.json(responseObj(true,curriculums,"All Curriculums"))
}
const getGrades=async(req,res)=>{
    const grades=await Grade.find({})
    return res.json(responseObj(true,grades,"All Grades"))
}
const getGreatTeachersList=async(req,res)=>{
    let query={

    }
    let querySecond
    if (req.query.exp){
        querySecond={
            exp:req.query.ex
        }
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
  
   let teacherResponse = Teacher.aggregate([
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
      ]},
      totalExp: { $sum: "$exp_details.exp" }
}
    },

    {
        $project: {
            user_id: 1,
            "preferred_name": 1,
            "users.profile_image":1,
            // subject_curriculum_grade:1,
            averageRating: {
                $avg: "$reviews.rating"
            },
            totalExp:1,
// organization:1,
// qualification:1,
no_of_reviews:{
    $size:"$reviews"
},
city:1,
country:1

        }
    },
    {
        $match:querySecond
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
  Teacher.aggregatePaginate(teacherResponse,options,(err,result)=>{

      return res.json(responseObj(true,result,"Teacher List"))
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
}}).limit(10).populate({
    path:'given_by',select:{
        name:1,profile_image:1
    }
}).sort({
    createdAt:-1
})
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
  const introVideo=await Testimonial.findOne({
    teacher_id:teacher_id
  })
        return res.json(responseObj(true,{teacherDetails:teacherDetails,introVideo:introVideo},"Teacher Details"))

}
const getTestimonialsOfTeacher=async(req,res)=>{
    let query={teacher_id:req.query.teacher_id}
    let options={
        limit:req.query.limit,
        page:req.query.page
    }
    Testimonial.paginate(query,options,(err,result)=>{
        return res.json(responseObj(true,result,"Testimonials"))
    })
}
const getReviewDetails=async(req,res)=>{
    let teacher_id = req.query.teacher_id
    let reviews = await Review.aggregate([
        {
            $match:{teacher_id:new objectId(teacher_id),
          
            
            }
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
        
        let reviewCategorization=await Review.aggregate([
            {
                $match:{teacher_id:new objectId(teacher_id),
              
                }
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
        let reviewArray=[]
        let totalReviews=await Review.countDocuments({
            teacher_id:teacher_id
        })
        console.log(reviewCategorization)
        for (let i=1;i<=5;i++){

    let index=reviewCategorization.findIndex((data)=>{
        return data._id==i
    })
    if(index!==-1){

    
    reviewArray.push({
        rating:i,
        no_of_reviews:reviewCategorization[index].no_of_reviews,
        percentage:reviewCategorization[index].no_of_reviews/totalReviews*100
    })
}
else{
    reviewArray.push({
        rating:i,
        no_of_reviews:0
    })  
}
        }
        return res.json(responseObj(true,{reviews:reviews,reviewCategorization:reviewArray}))   
}
const requestTrialClass = async (req, res, next) => {
    const AcademicManangerResponse=await AcademicManager.findOne({
        students:{
             $elemMatch: {
            $eq: req.user._id
        }
        }
    })
    if(AcademicManangerResponse!==null){

    
    let classResponseArray = []
    let classResponse = await Class.findOne({
        student_id: req.user._id,
        "subject.name": req.body.subject ,
        
    })
    let studentResponse=await Student.findOne({
        user_id:req.user._id
    })
    if (classResponse) {
        throw new Error("Subject Trial Class already Requested or Done")




    }

    await req.body.start_time.forEach(async (element) => {
        let newClassResponse = await Class.insertMany({
            teacher_id: req.body.teacher_id,
            student_id: req.user._id,
            start_time: moment(element).format("YYYY-MM-DDTHH:mm:ss"),
            end_time: moment(element).add(1, 'h').format("YYYY-MM-DDTHH:mm:ss"),
            subject: { name: req.body.subject },
            curriculum: { name: req.body.curriculum },
            grade: { name: studentResponse.grade.name },
            class_type: "Trial",
            status: "Pending",
            is_rescheduled: false,
            details: req.body.details ? req.body.details : null
        })
        classResponseArray.push(newClassResponse)



    });
   
    const teacherResponse=await Teacher.findOne({
        user_id:req.body.teacher_id
    })
    addNotifications(AcademicManangerResponse.user_id,"New Trial Class Requested","New Trial Class Requested By "+ req.user.name+" by teacher "+teacherResponse.preferred_name+" of subject "+req.body.subject)
    addNotifications(req.body.teacher_id,"New Trial Class Requested","New Trial Class Requested By "+ req.user.name+" of subject "+req.body.subject)
    res.json(responseObj(true, classResponseArray, "Trial Class request created Successfully"))
    }else{
        return res.json(responseObj(false, null,"Academic Manager is not assigned to you"))
    }



} 
const getReviewList=async(req,res)=>{
    let query={
        teacher_id:req.query.teacher_id,
      

    }
    let options={
        page:req.query.page,
        limit:req.query.limit,
        populate:{
            path:"given_by",
            select:{
                name:1,
                profile_image:1
            }
        },
        sort:{
            "createdAt":-1
        }
    }
    Review.paginate(query,options,(err,result)=>{
        return res.json(responseObj(true,{reviewsList:result}))
    })
}
const postReview=async(req,res)=>{
    const reviewResponse=await Review.findOne({
teacher_id:req.body.teacher_id,
class_id:null,
given_by:req.user._id
    })
    if(reviewResponse!==null){
        return res.json(responseObj(false,null,"Review Already Recorded"))
    }
    await Review.create({
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
    res.json(responseObj(true,contactResponse,"Contact Saved Successfully"))
}
const postAFlag=async(req,res)=>{
    const { id } = req.params;
    const { flag } = req.body;

    const teacher = await User.findOne({
        _id:id,
        role:'teacher'
    });

    if (!teacher) {
        throw new Error('Invalid Teacher ID try again.');
    }


    const reportDoc = await TeacherReport.findOne({ teacher: id, reportBy: req.user._id });
console.log(reportDoc)
    if (reportDoc) {
        throw new Error('Already reported this profile.');
    }
console.log(req.user)
    const report = { teacher: id, flag, reportBy: req.user._id }

    const reportCreate = await TeacherReport.create(report);

    
    return res.json(responseObj(true, reportCreate, 'Profile Reported.',  []))
}
export {getGrades,getReviewList,getTestimonialsOfTeacher,getCurriculums,getSubjects,postContact,getGreatTeachers,getTestimonials,getFeedBacks,getGreatTeachersList,getTeacherDetailsById,requestTrialClass,postReview,getReviewDetails,postAFlag}