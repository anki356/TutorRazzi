import Grade from "../../../models/Grade.js"
import mongoose from "mongoose"
import { responseObj } from "../../../util/response.js"
import AdditionalComment from "../../../models/AdditionalComment.js"
import moment from "moment"
import Report from "../../../models/Report.js"
const ObjectID=mongoose.Types.ObjectId
const getMonthlyReport=async(req,res,next)=>{
    let query={
        student_id:new ObjectID(req.query.student_id)  
    }
    if(req.query.teacher_id){
        query={
            student_id:new ObjectID(req.query.student_id),
            teacher_id:new ObjectID(req.quer.teacher_id)
        }
    }
    const monthlyReports=await Report.aggregate([
        {
            $match:query
        },{$lookup:{
            from:'teachers',
            localField:'teacher_id',
            foreignField:'user_id',
            as:'teacher'
        }},{
            $group :{
                month:moment().month(),
                year:moment().year(),
                totalRatings:{
                    "$avg":"$rating"
                },
                subject:"$teacher.$subject"
            }
        }
    ])
    

  return  res.json(responseObj(true,monthlyReports,null))
}

const getMonthlyReportDetails=async(req,res)=>{
    const averageGrade=await Report.aggregate([
        {
            $match:{
                student_id:new ObjectID(req.query.student_id),
                month:req.query.month,
                year:req.query.year
            }
        },{
            $group :{
                _id:0,
                totalRatings:{
                    "$avg":"$rating"
                }
            }
        }
    ])
    const report=await Report.find({student_id:new ObjectID(req.query.student_id),
    month:req.query.month,
    year:req.query.year})

const additionalComment=await AdditionalComment.findOne({student_id:new ObjectID(req.query.student_id),month:req.query.month,year:req.query.year})
  return  res.json(responseObj(true,{ratings:averageGrade[0]?.totalRatings?averageGrade[0]?.totalRatings:0,report:report,additionalComment:additionalComment},null))
}
export {getMonthlyReport,getMonthlyReportDetails}
