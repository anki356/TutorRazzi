import mongoose from "mongoose";
import moment from "moment";
const SubjectCurriculumGradeSchema=new mongoose.Schema({
    subject:{
        type:String,
        required:true
    },
    curriculum:{
        type:String,
        required:true
    },
    grade:{
        type:String,
        required:true
    }, createdAt: {
        type: String,
        default: moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },
   
    
},{
    
    versionKey: false
})
export default mongoose.model("SubjectCurriculumGrade",SubjectCurriculumGradeSchema)