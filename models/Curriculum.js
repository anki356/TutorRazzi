import mongoose from "mongoose";
import moment from "moment";
const CurriculumSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }
},{
     
    versionKey: false
})
export default mongoose.model("Curriculum",CurriculumSchema)