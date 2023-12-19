import Review from "../../../models/Review.js"
import Student from "../../../models/Student.js"
import Teacher from "../../../models/Teacher.js"
import Testimonial from "../../../models/Testimonial.js"
import { responseObj } from "../../../util/response.js"
import mongoose from 'mongoose'
const ObjectID=mongoose.Types.ObjectId
const getTeacherBySubjectCurriculumGrade=async(req,res,next)=>{
    
    const teacherResponse = await Teacher.aggregate([{
        $match: {
            subject_curriculum_grade:{
                $elemMatch:{
subject:req.query.subject,
curriculum:req.query.curriculum,
grade:req.query.grade
                }
            }
        }
    },{
        $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "users"
        }
    },
     {
        $lookup: {
            from: "classes",
            foreignField: "teacher_id",
            localField: "user_id",
            as: "classes",
            pipeline: [
               { $match: {$and:[{ status: "Done" },{
                    subject:req.query.subject
                }]} }   // Add a $match stage to filter documents in the "from" collection
                // Additional stages for the "from" collection aggregation pipeline if needed
            ]

        }
    }, {
        $lookup: {
            from: "reviews",
            foreignField: "teacher_id",
            localField: "user_id",
            as: "reviews"

        }

    }, {
        $project: {
            user_id: 1,
            preferred_name: 1,
            ratings: {
                $avg: "$reviews.rating"
            },
            reviews: {
                $size: "$reviews"
            },
            no_of_classes: {
                $size: "$classes"
            },
            "users.profile_image":1,
            exp:1,
           

        }
    }])


    return res.json(responseObj(true, teacherResponse, ''))


   
}
const getTeacherById=async(req,res,next)=>{
    const { id } = req.query
    const teacherResponse = await Teacher.find({ user_id: id }).populate({ path: 'user_id' })
    const testimonialResponse=await Testimonial.find({teacher_id:teacherResponse.user_id})
    const reviewResponse=await Review.aggregate([
        {
            $match:{
                teacher_id :new ObjectID(id),
            }
        },{
            $project:{
                _id:"$teacher_id",
                ratings:{
                    $avg:"$rating"
                },
                reviews:{
                    $sum:1
                }
            }
        }
    ])
    return res.json(responseObj(true, {teacherResponse:teacherResponse,testimonialResponse:testimonialResponse,reviewResponse:reviewResponse}, "Teacher Details"))
}
const reviewTeacher = async (req, res, next) => {
   
    const reviewResponse = await Review.insertMany({
        message: req.body?.message,
        rating: req.body.ratings,
        teacher_id: req.body.teacher_id,
        class_id: req.body.class_id,
        given_by:req.user._id
    })

    res.json(responseObj(true, { reviewResponse}, 'Teacher Review Recorded'))

}
const getGreatTeachers = async (req, res, next) => {
    const studentResponse = await Student.findOne({ user_id: req.query.student_id }, { subjects: 1,curriculum:1,grade:1 })

    let subjects = studentResponse.subjects.map((data) => {
        return data.name
    })
    let teacherResponse = await Teacher.aggregate([
        {
            $match:{ $elemMatch:{
                subject:{$in:subjects},
                curriculum:studentResponse.curriculum.name,
                grade:studentResponse.grade.name
            }}
        },
        
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
                exp:1,
                ratings: {
                    $avg: "$reviews.rating"
                },
                reviews: {
                    $size: "$reviews"
                },
                subjects: {
                    $filter: {
                      input: "$subject_curriculum_grade",  // Replace with the actual name of your array field
                      as: "item",
                      cond: { $in: ["$$item.subject", subjects] }
                    }
                  }
    
            }
        },
        {
            $sort: { averageRating: -1 }, 
        },
        {
            $limit: req.query.limit ? req.query.limit : 5
        }

    ])


    //chat gpt
    return res.json(responseObj(true, teacherResponse, ''))
}
const getTeachersBySubjectAndName=async(req,res)=>{
    let offset=(Number(req.query.page)-1)*Number(req.query.limit)
    let query={}
    if(req.query.subject){
        query.subject_curriculum_grade={
            $elemMatch:{
                subject:{
                    $regex:req.query.subject,
                    $options:'i'
                }
            }
        }

    }
    
    if (req.query.name){
        query.
            preferred_name={$regex:req.query.name,$options:'i'}
                
        }
    
    const teacherResponse = await Teacher.aggregate([{
        $match: query
    }, {
        $lookup: {
            from: "classes",
            foreignField: "teacher_id",
            localField: "user_id",
            as: "classes",
            pipeline: [
                {$match: {$and:[{ status: "Done" },{
                    subject:req.query.subject
                }]}  }// Add a $match stage to filter documents in the "from" collection
                // Additional stages for the "from" collection aggregation pipeline if needed
            ]
        }
        },
    
    {
        $lookup: {
            from: "reviews",
            foreignField: "teacher_id",
            localField: "user_id",
            as: "reviews"

        }

    },{
        $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "users"
        }
    }, {
        $project: {
            user_id: 1,
            preferred_name: 1,
            subject_curriculum_grade:1,
            exp:1,
            ratings: {
                $avg: "$reviews.rating"
            },
            reviews: {
                $size: "$reviews"
            },
            no_of_classes: {
                $size: "$classes"
            },
            "users.profile_image":1

        }
    },{
        $skip:offset
    },{
        $limit:Number(req.query.limit)
    }])
    
    let options={
        limit:req.query.limit,
        page:req.query.page
    }
  
   Teacher.paginate(query,options,(err,result)=>{
    return res.json(responseObj(true,{teacherResponse,result},"Teachers data of required Subject are here"))
   })
}
export {getTeacherBySubjectCurriculumGrade,getTeacherById,getGreatTeachers,reviewTeacher,getTeachersBySubjectAndName}