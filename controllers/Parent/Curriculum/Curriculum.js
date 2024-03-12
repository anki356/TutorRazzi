import Curriculum from "../../../models/Curriculum.js";
import Grade from "../../../models/Grade.js";
import Subject from "../../../models/Subject.js";
import SubjectCurriculum from "../../../models/SubjectCurriculum.js";
import { responseObj } from "../../../util/response.js";

const getCurriculum=async (req,res,next)=>{
    if(req.query.curriculum){

        const curriculums= await Curriculum.find({
           name:{
            $regex:req.query.curriculum,
            $options:"i"
           }
        })
        return res.json(responseObj(true,curriculums,''))
    }
   const curriculums= await Curriculum.find().limit(5)
   return res.json(responseObj(true,curriculums,"Curriculums are fetched Successfully"))


    
   
    }
    const getSubjects=async (req,res,next)=>{
  
        const subject_curriculum=await SubjectCurriculum.find({
            curriculum:req.query.curriculum,
            subject:req.query.subject
         })
         let subjects=subject_curriculum.map((data)=>data.subject)
         return res.json(responseObj(true,subjects,"Subject Curriculum"))     
       
    }
    const getGrades=async(req,res,next)=>{
        if(req.query.grade){
            const grades= await Grade.find({
                name:{
                 $regex:req.query.grade,
                 $options:"i"
                }
             })
            
      return   res.json(responseObj(true,grades,'Grades Are Fetched Successfully'))
        }
        const grades= await Grade.find().limit(5)
        return   res.json(responseObj(true,grades,'Grades Are Fetched Successfully')) 
    }
export {getCurriculum,getSubjects,getGrades}