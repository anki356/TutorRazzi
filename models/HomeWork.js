import mongoose from "mongoose";
import moment from "moment";
import mongoosePaginate from 'mongoose-paginate-v2'
const HomeWorkSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true

    },is_reupload:
{
type:Boolean,
default:false
},
   status:{
type:String,
enum:['Pending','Resolved'],
default:'Pending'
   },
    answer_document_id:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"Document",
       
    },
    due_date:{
        type:String,
        required:true
    }, createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },
    expires:{
        type:Boolean,
        default:false
    },
class_id:{
    type:mongoose.SchemaTypes.ObjectId,
    ref:'Class',
    required:true
}
}, {
versionKey: false })
HomeWorkSchema.plugin(mongoosePaginate)
HomeWorkSchema.set('toJSON', { virtuals: true });
HomeWorkSchema.virtual('subject_name').get(function(){
    if(this.class_id){
        return this.class_id.subject_name
    }
})
HomeWorkSchema.virtual('student_name').get(function(){
    if(this.class_id){
        return this.class_id.student_name
    }
})
HomeWorkSchema.virtual('days_left').get(function(){
    if(this.due_date!==undefined&& moment().diff(this.due_date,'d')<=0){
        const now = moment();
        const duration = moment(this.due_date).diff(moment(), 'd');
        
         
          return `${duration} days left`;
       
    
    }
    else if(moment().diff(this.due_date,'d')>0){
        return 'Due Date Passed'
    }
})
export default mongoose.model("HomeWork",HomeWorkSchema)