import mongoose from "mongoose";
import moment from "moment";
const GradeSchema =new mongoose.Schema({
name:{
    type:String,
    required:true
}, createdAt: {
    type: String,
    default:()=> moment().format("YYYY-MM-DDTHH:mm"),
    required: false
}
}); 
export default mongoose.model("Grade",GradeSchema)