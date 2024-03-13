import Exam from "../../../models/Exam.js"
import Student from "../../../models/Student.js"
import { responseObj } from "../../../util/response.js"

const addExams=async(req,res,next)=>{
    const studentExamInsertResponse=await Exam.create({student_id:req.user._id ,subject:{name:req.body.subject},
        start_time:req.body.start_time,
        end_time:req.body.end_time,
        syllabus:req.body.syllabus,
        start_date:req.body.start_date
    })
    res.json(responseObj(true,studentExamInsertResponse,null))
}
export {addExams    }