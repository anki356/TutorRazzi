import mongoose from "mongoose";
import moment from "moment";
import paginate from "mongoose-aggregate-paginate-v2";
import Report from "./Report.js";
const MonthlyReportSchema=new mongoose.Schema({
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
   },
   reports:{
    type:[Report.schema],
    required:true
   }
  
},{
versionKey: false})
MonthlyReportSchema.plugin(paginate)
MonthlyReportSchema.set('toJSON', { virtuals: true });
MonthlyReportSchema.virtual('month_name').get(function(){
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
export default mongoose.model("MonthlyReport",MonthlyReportSchema)