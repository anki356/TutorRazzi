import moment from "moment"
import AcademicManager from "../../../models/AcademicManager.js"
import Class from "../../../models/Class.js"
import Teacher from "../../../models/Teacher.js"
import Testimonial from "../../../models/Testimonial.js"
import { responseObj } from "../../../util/response.js"
import Support from "../../../models/Support.js"
const getAllTeachers = async (req, res, next) => {
    let TeacherIds=await AcademicManager.findOne({user_id:req.user._id},{teachers:1})

    let query={
    
        user_id:{
         $in :TeacherIds.teachers
        }
}
if(req.query.search){
    query.preferred_name={
        $regex:req.query.search,
        $options:"i"
    }
}
    const teacherResponse = await Teacher.aggregate([{
        $match: query
    }, {
        $lookup: {
            from: "classes",
            foreignField: "teacher_id",
            localField: "user_id",
            as: "classes",
            pipeline:[{
                $match:{
                    status:"Done"
                }
            }]

        }
    }, {
        $lookup: {
            from: "reviews",
            foreignField: "teacher_id",
            localField: "user_id",
            as: "reviews"

        }

    }
    , {
        $lookup: {
            from: "users",
            foreignField: "_id",
            localField: "user_id",
            as: "users"

        }

    }, 
    
    
    
    {
        $project: {
            _id: 1,
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
            user_id:1,
            "users.profile_image":1,
            total_exp: {
                $sum: {
                    $map: {
                        input: "$exp_details", // Changed to exp_details
                        as: "exp",
                        in: "$$exp.exp" 
                    }
                }
            }
        

        }
    },{
        $limit:Number(req.query.limit)||TeacherIds.teachers.length,
        
    },{
        $skip:(Number(req.query.page)-1)*req.query.limit||0
    }])

let options={
    limit:req.query.limit||TeacherIds.teachers.length,
    page:req.query.page||1,
    select:{"preferred_name":1}
}
Teacher.paginate(query,options,(err,result)=>{

    res.json(responseObj(true, {teacherResponse:teacherResponse,result:result}, 'All Teachers'))
})
}
const getTeacherById = async (req, res, next) => {

    const { id } = req.query
    const teacherResponse = await Teacher.findOne({ user_id: id }).populate({ path: 'user_id' })
    const testimonialResponse=await Testimonial.find({teacher_id:id})
    const upcomingClasses=await Class.countDocuments({
        teacher_id:id,
        start_time:{$gte:moment().format("YYYY-MM-DDTHH:mm:ss")},
        status:'Scheduled'
    })
    const pastClass=await Class.countDocuments({
        teacher_id:id,
        start_time:{$lt:moment().format("YYYY-MM-DDTHH:mm:ss")},
        status:'Done'
    })
    const trialClassesDone=await Class.countDocuments({
        teacher_id:id,
        class_type:"Trial",
        status:'Done'
    })
    const latest_support=await Support.find({
        user_id:id
    },{
        subject:1,ticket_id:1,createdAt:1,status:1
    }).sort({
        "createdAt":-1
    }).limit(3)
    return res.json(responseObj(true, {teacherResponse:teacherResponse,testimonialResponse:testimonialResponse,upcomingClasses:upcomingClasses,pastClass:pastClass,trialClassesDone:trialClassesDone,latest_support:latest_support}, "Teacher Details"))




}
export {getAllTeachers,getTeacherById}