import Exam from "../../../models/Exam.js"
import Student from "../../../models/Student.js"
import { responseObj } from "../../../util/response.js"

const addExams=async(req,res,next)=>{
    const studentExamInsertResponse=await Exam.create({student_id:req.body.student_id ,subject:{name:req.body.subject},
        start_time:req.body.start_time,
        end_time:req.body.end_time,
        syllabus:req.body.syllabus
    })
    res.json(responseObj(true,studentExamInsertResponse,null))
}
export {addExams    }