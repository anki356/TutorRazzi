import mongoose from "mongoose";
import moment from "moment";
const StudentNoteSchema=mongoose.Schema({
    studentId:{
    type:mongoose.Types.ObjectId,
    ref:'Student',
    required:true

    },text:{
type:String,
required:true
    }, createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }
})
export default mongoose.model("StudentNote",StudentNoteSchema)