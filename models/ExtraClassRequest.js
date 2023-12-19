import mongoose from "mongoose";
import moment from "moment";
const ExtraClassRequestSchema= new mongoose.Schema({
    quote_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Quote',
        required:true
    },
    message:{
type:String,
required:true
    },
    status:{
        type : String ,enum:['pending','done' ] ,default:"pending"
    },
    createdAt: {
        type: String,
        default: moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }

})
export default mongoose.model("ExtraClassRequest",ExtraClassRequestSchema)