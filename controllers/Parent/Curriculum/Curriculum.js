import Curriculum from "../../../models/Curriculum.js";
import Grade from "../../../models/Grade.js";
import Subject from "../../../models/Subject.js";
import { responseObj } from "../../../util/response.js";


const getCurriculum=async (req,res,next)=>{
    if(req.query.curriculum){

        await Curriculum.collection.createIndex({name:"text"})
        const curriculums=await Curriculum.find({
            $text: { $search: req.query.curriculum}
        }).collation({ locale: 'en', strength: 2 })
        return res.json(responseObj(true,curriculums,''))
    }
   const curriculums= await Curriculum.find().limit(5)
   return res.json(responseObj(true,curriculums,"Curriculums are fetched Successfully"))


    
   
    }
const getSubjects=async (req,res,next)=>{
  
    await Subject.collection.createIndex({name:"text"})
    const subjects=await Subject.find({
        $text: { $search: req.query.subject, $caseSensitive: false , $language: "en"},
       
      })
res.json(responseObj(true,subjects,''))
        
   
}
const getGrades=async(req,res,next)=>{
    if(req.query.grade){

        await Grade.collection.createIndex({name:"text"})
        const grades=await Grade.find({
            $text: { $search: req.query.grade}
          })
  return   res.json(responseObj(true,grades,'Grades Are Fetched Successfully'))
    }
    const grades= await Grade.find().limit(5)
    return   res.json(responseObj(true,grades,'Grades Are Fetched Successfully')) 
}
export {getCurriculum,getSubjects,getGrades}