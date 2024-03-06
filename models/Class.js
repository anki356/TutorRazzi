import mongoose from "mongoose";
import Document from "./Document.js";
import Task from "./Task.js";
import HomeWork from "./HomeWork.js";
import Curriculum from "./Curriculum.js";
import Subject from "./Subject.js";
import Grade from "./Grade.js";
import moment from "moment";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const ClassSchema = new mongoose.Schema({
  
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name:{
type:String
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, class_type: {
        type: String,
        enum: ["Trial", "Non-Trial","Extra"],
        required: true
    },grade:{
        type :Grade.schema,
        required:true
    },start_time:{
        type:String,
      
    },
    end_time:{
        type:String,
       
    },
    quote_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quote', 
    },
    subject:{
        type:Subject.schema,

required:true
    },
    curriculum:{
type:Curriculum.schema,
required:true
    },
    
    description:{
        type:String
    },
    is_rescheduled:{
        type:Boolean,
        required:true,
    },
    notes:{
        type:String,
    },
    recordings:{
        type:[String],
        
    },
    materials:{
        type:[Document.schema],
        
    },
  
    response: {
        type: String,
        enum: ['Liked', 'Disliked'],
    },
    reason_disliking: {
        type: String
    },
    status:{
        type:String,
        defult:"Pending",
        enum:['Pending','Scheduled','Done','Cancelled'],
    },
    payment_status:{
        type:String,
        enum:['Unpaid','Paid'],
        default:'Unpaid',
        required:true,
    },
   
    details:{
        type:String,
        default:""
    },
    rescheduled_by:{
        type:String,
        enum: ['student', 'teacher', 'null'],
        default: 'null',
        required: false
    }, createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },
other_information:{
    type:String
},
meeting_id:{
    type:String
}
   
},{
     
    versionKey: false
})
ClassSchema.set('toJSON', { virtuals: true });

ClassSchema.virtual('start_date').get(function () {
    if(this.start_time!==undefined&&this.start_time!==null){
        return moment(this.start_time).format("DD-MM-YYYY")
    }
})
ClassSchema.virtual('start_time_string').get(function () {
    if(this.start_time!==undefined&&this.start_time!==null){
        return moment(this.start_time).format("HH:mm:ss")
    }
})
ClassSchema.virtual('end_time_string').get(function () {
    if(this.end_time!==undefined&&this.end_time!==null){
        return moment(this.end_time).format("HH:mm:ss")
    }
})
ClassSchema.virtual('time_left').get(function () {
    if (this.status!==undefined&&this.status !=='Done'&&this.status!=='Cancelled'&&this.end_time!==undefined) {
        const end_time = moment(this.end_time);
        const duration = moment.duration(end_time.diff(moment().add(5,'h').add(30,'m')));
       if(duration<0){
        return null
       }
        else if (duration.asSeconds() < 60) {
          return `${Math.round(duration.asSeconds())} seconds left`;
        } else if (duration.asMinutes() < 60) {
          return `${Math.round(duration.asMinutes())} minutes left`;
        } else if (duration.asHours() < 24) {
          return `${Math.round(duration.asHours())} hours left`;
        } else if (duration.asDays() < 30) {
          return `${Math.round(duration.asDays())} days left`;
        } else {
          return `${Math.round(duration.asMonths())} months left`;
        }
       
    
    }

})
ClassSchema.virtual('materials_url').get(function(){
    if(this.materials!==undefined){
        let materials_list= this.materials;
        materials_list.forEach((material)=>{
            material.url=process.env.CLOUD_API+"/"+material
                })
                return materials_list
    }
    
    
})

ClassSchema.virtual('grade_name').get(function(){

    if(this.grade!==undefined){
       
    return this.grade.name
    }
})
ClassSchema.virtual('subject_name').get(function(){
    
    if(this.subject!==undefined){
        return this.subject.name
    }
    
    
})
ClassSchema.virtual('teacher_name').get(function(){
    
    if(this.teacher_id!==undefined){
        return this.teacher_id.name
    }
    
    
})
ClassSchema.virtual('student_name').get(function(){
    
    if(this.student_id!==undefined){
        return this.student_id.name
    }
    
    
})
ClassSchema.virtual('curriculum_name').get(function(){
    
    if(this.curriculum!==undefined){
        return this.curriculum.name
    }
    

})
ClassSchema.virtual('is_past').get(function(){
    
    if(this.status!==undefined){
        return this.status==='Done'
    }
    

})
ClassSchema.virtual('class_status').get(function(){
    
    
   if((this.status==="Pending"||this.status==='Scheduled')&&this.is_rescheduled) {
        return "Rescheduled"
    }
    return this.status
    

})
ClassSchema.plugin(mongoosePaginate)
ClassSchema.plugin(mongooseAggregatePaginate)

export default mongoose.model("Class",ClassSchema)