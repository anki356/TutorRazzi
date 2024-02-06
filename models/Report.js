import mongoose from "mongoose";
import moment from "moment";
import paginate from "mongoose-aggregate-paginate-v2";
const ReportSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    sub_title:{
        type:String,
        required:true
    },
    message:{
        type:String,
       
    },
    rating:{
        type:mongoose.Schema.Types.Decimal128,
        
    },
    student_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    teacher_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }, createdAt: {
        type: String,
        default: ()=>moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },
    month:{
        type:Number,
        required:true
    },
    year:{
        type:Number,
        required:true
    },
   subject:{
type:String,
required:true
   },
   status:{
    type:Boolean,
    default:false
   }
},{
versionKey: false})
ReportSchema.plugin(paginate)
ReportSchema.set('toJSON', { virtuals: true });
ReportSchema.virtual('month_name').get(function(){
    if(this.month){
        const months = [
            "January", 
            "February", 
            "March", 
            "April", 
            "May", 
            "June", 
            "July", 
            "August", 
            "September", 
            "October", 
            "November", 
            "December"
          ];
        return months[this.month];
    }
})
export default mongoose.model("Report",ReportSchema)