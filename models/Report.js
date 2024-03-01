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
        type:Number,
        
    },
  
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