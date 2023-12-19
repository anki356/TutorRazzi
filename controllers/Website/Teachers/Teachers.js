import { responseObj } from "../../../util/response"
import Testimonial from "../../../models/Testimonial.js"
import Review from "../../../models/Review.js"
import Teacher from "../../../models/Teacher.js"
const getGreatTeachers=async(req,res)=>{
   
    let teacherResponse = await Review.aggregate([
        
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
                curriculum:"$teachers.curriculum",
                name:"$teachers.preferred_name"
            },
        },
       
        {
            $sort: { averageRating: -1 }, 
        },
        {
            $limit: req.query.limit ? req.query.limit : 3
        }

    ])
    return res.json(responseObj(true,teacherResponse,"Teacher data"))

}

const getGreatTeachersList=async(req,res)=>{
    let query={

    }
   if(req.query.exp){
query.teachers={
    exp:req.query.exp
}
   }
   if(req.query.subject){
    query["teachers.subject"]=req.query.subject;
   }
    let teacherResponse = await Review.aggregate([
        
        {
            $lookup: {
                from: "teachers",
                localField: "teacher_id",
                foreignField: "user_id",
                as: "teachers"
            }
        },{
            $match:query
        },
        {
            $group: {
                _id: '$teacher_id', // Group reviews by teacher
                averageRating: { $avg: '$rating' }, // Calculate the average rating for each teacher,
                exp_details:"$teachers.exp_details",
                name:"$teachers.preferred_name",
                no_of_reviews:{$sum:1},
                exp:"$teachers.$exp"
            },
        },
       
        {
            $sort: { averageRating: -1 }, 
        },
        {
            $skip:{
offset:(Number(req.query.page)-1)*req.query.limit
            }
        },
        {
            $limit: req.query.limit 
        }

    ])
let options={
    limit:req.query.limit,
    page:req.query.page
}
  Teacher.paginate(quer,options,(err,result)=>{

      return res.json(responseObj(true,{teacherResponse:teacherResponse,result:result},"Teacher List"))
  })

}
const getTestimonials=async(req,res)=>{
    const testimonials=await Testimonial.find({teacher_id:req.query.teacher_id}).limit(10)
    return res.json(responseObj(true,testimonials,"Testimonials"))
}

const getFeedBacks=async(req,res)=>{
const reviews=await Review.find({teacher_id:req.query.teacher_id}).limit(10)
return res.json(responseObj(true,reviews,"Feedbcks"))
}

const getTeacherDetailsById=async(req,res)=>{
    let teacher_id = req.query.teacher_id
    const teacherDetails=await Teacher.findOne({
        user_id:teacher_id
    },{
        preferred_name:1,
        subject:1,
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
            $lookup: {
                from: "teachers",
                localField: "teacher_id",
                foreignField: "user_id",
                as: "teachers"
            }
        },{
            $match:{teacher_id:teacher_id}
        },
        {
            $group: {
                _id: '$teacher_id', // Group reviews by teacher
                averageRating: { $avg: '$rating' }, // Calculate the average rating for each teacher,
               
                no_of_reviews:{$sum:1},
                
            },
        }])
        let reviewList=await Review.find({
            teacher_id:teacher_id
        })
        let reviewCategorization=await Review.aggregate([
            {
                $match:{teacher_id:teacher_id}
            },
            {
                $group:{
                    _id:"ratings",
                    no_of_reviews:{
                        $sum:1
                    }
                }
            }
        ])
        return res.json(responseObj(true,{teacherDetails:teacherDetails,reviews:reviews,reviewList:reviewList,reviewCategorization:reviewCategorization}))

}

const requestTrialClass = async (req, res, next) => {
   
    let classResponseArray = []
    let classResponse = await Class.findOne({
        student_id: req.user._id,
        subject: { name: req.body.subject },
        status: 'Done'
    })
    if (classResponse) {
        throw new Error("Subject Trial Class already done")




    }
const teacherResponse=await Teacher.findOne({
    "user_id":req.body.teacher_id
},{
    "subject":1,"curriculum":1,"grade":1
})
    await req.body.start_time.forEach(async (element) => {
        let newClassResponse = await Class.insertMany({
            teacher_id: req.body.teacher_id,
            student_id: req.user._id,
            start_time: moment(element).format("YYYY-MM-DDTHH:mm:ss"),
            end_time: moment(element).add(1, 'h').format("YYYY-MM-DDTHH:mm:ss"),
            subject: { name: teacherResponse.subject },
            curriculum: { name: teacherResponse.curriculum },
            grade: { name: teacherResponse.grade },
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
        message: req.body?.message,
        rating: req.body.ratings,
        teacher_id: req.body.teacher_id,
        class_id: req.body.class_id,
        given_by:req.user._id

    })
    res.json(responseObj(true, reviewResponse, "Review Added Successfully"))
}

export {getGreatTeachers,getTestimonials,getFeedBacks,getGreatTeachersList,getTeacherDetailsById,requestTrialClass,postReview}