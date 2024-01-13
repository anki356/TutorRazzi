import mongoose from "mongoose";
import SubjectCurriculumGrade from "./SubjectCurriculumGrade.js";
import moment from "moment";
import mongoosePaginate from "mongoose-paginate-v2";
const QuoteSchema = new mongoose.Schema({
    class_count: {
        type: Number,

    },
    teacher_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        
    },
    amount: {
        type: Number,

    },
    student_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    subject_curriculum_grade: {
        type: SubjectCurriculumGrade.schema,
        required: true
    },
    class_type: {
        type: String,
        enum: ['Normal', 'Extra'],
        default: 'Normal'
    },
    description:{
        type:String
    },
   
    schedule_status: {
        type: String,
        default: "pending", enum: ['pending', 'done']
    }, createdAt: {
        type: String,
        default: moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },
    status: {
        type: String, default: "Pending", enum: ['Pending', 'Paid','Rejected']
    },
    class_name:{
        type:String
    }
}, {
  
    versionKey: false
})
QuoteSchema.plugin(mongoosePaginate);
QuoteSchema.set('toJSON', { virtuals: true });
QuoteSchema.virtual('subject_name').get(function(){
    if(this.subject_curriculum_grade){

        return this.subject_curriculum_grade.subject;
    }
})
QuoteSchema.virtual('grade_name').get(function(){
    if(this.subject_curriculum_grade){

        return this.subject_curriculum_grade.grade;
    }
})
QuoteSchema.virtual('curriculum_name').get(function(){
    if(this.subject_curriculum_grade){

        return this.subject_curriculum_grade.curriculum;
    }
})

export default mongoose.model("Quote", QuoteSchema)