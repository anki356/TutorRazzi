import SubjectCurriculumGrade from "../../../models/SubjectCurriculumGrade.js";
import { responseObj } from "../../../util/response.js";

const addSubjectCurriculum = async(req,res,next)=>{
    const addSubjectCurriculumResponse=await SubjectCurriculumGrade.insertMany({
name:req.body.subject_name,
curriculum:req.body.curriculum

    })
    res.json(responseObj(true,addSubjectCurriculumResponse,[]))
}
const getCurriculum=async (req,res,next)=>{
    const query = { curriculum: { $exists: true, $ne: null } };
    const uniqueCurriculums = await SubjectCurriculumGrade.distinct('curriculum', query);

}
export {addSubjectCurriculum,getCurriculum}