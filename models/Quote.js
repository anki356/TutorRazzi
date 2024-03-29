import mongoose from "mongoose";
import SubjectCurriculumGrade from "./SubjectCurriculumGrade.js";
import moment from "moment";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
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
        type:String,
        default:null
    },
   
    schedule_status: {
        type: String,
        default: "pending", enum: ['pending', 'done']
    }, createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },
    status: {
        type: String, default: "Pending", enum: ['Pending', 'Paid','Rejected']
    },
    class_name:{
        type:String
    },
    due_date_class_id:{
        type:mongoose.SchemaTypes.ObjectId ,
        ref:"Class"
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
QuoteSchema.virtual('due_date').get(function(){
    if(this.due_date_class_id!==null&& typeof(this.due_date_class_id)==='object'){
        return this.due_date_class_id.end_time;
    }
    else{
        return null
    }
})
QuoteSchema.virtual('grade_name').get(function(){
    if(this.subject_curriculum_grade){

        return this.subject_curriculum_grade.grade;
    }
})
QuoteSchema.virtual('teacher_name').get(function(){
    if(this.teacher_id){

        return this.teacher_id.name;
    }
})
QuoteSchema.virtual('curriculum_name').get(function(){
    if(this.subject_curriculum_grade){

        return this.subject_curriculum_grade.curriculum;
    }
})
QuoteSchema.virtual('is_edit').get(function(){
    if(this.status){

        return this.status==='Pending';
    }
})
QuoteSchema.plugin(mongooseAggregatePaginate)
export default mongoose.model("Quote", QuoteSchema)