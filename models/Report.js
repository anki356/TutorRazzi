import mongoose from "mongoose";
import moment from "moment";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
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
        required:true
    },
    rating:{
        type:mongoose.Schema.Types.Decimal128,
        required:true
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
   }
},{
versionKey: false})
ReportSchema.plugin(aggregatePaginate)
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