import mongoose from "mongoose";
import Student from "./Student.js";
import Subject from "./Subject.js";
import Curriculum from "./Curriculum.js";
import moment from "moment";
import mongoosepaginate from "mongoose-paginate-v2"
const ExamSchema=new mongoose.Schema({
subject:{
    type:Subject.schema,

    required:true
},
student_id:{
type:mongoose.Schema.Types.ObjectId,
required:true,
ref:'User'
},

start_time:{
    type:String,
    required:true
},
end_time:{
    type:String,
    required:true
},
syllabus:{
    type:[String],
    required:true
},
createdAt: {
    type: String,
    default:()=> moment().format("YYYY-MM-DDTHH:mm"),
    required: false
}

},{
versionKey: false})
ExamSchema.plugin(mongoosepaginate)
ExamSchema.set('toJSON', { virtuals: true });
ExamSchema.virtual('start_date').get(function () {
    if(this.start_time!==undefined&&this.start_time!==null){
        return moment(this.start_time).format("DD-MM-YYYY")
    }
})
ExamSchema.virtual('start_time_string').get(function () {
    if(this.start_time!==undefined&&this.start_time!==null){
        return moment(this.start_time).format("HH:mm:ss")
    }
})
ExamSchema.virtual('end_time_string').get(function () {
    if(this.end_time!==undefined&&this.end_time!==null){
        return moment(this.end_time).format("HH:mm:ss")
    }
})
export default mongoose.model("Exam",ExamSchema)