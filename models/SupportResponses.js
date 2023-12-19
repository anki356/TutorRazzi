import moment from "moment";
import mongoose from "mongoose";

const SupportResponseSchema= new mongoose.Schema({
    support_id:{
        type:mongoose.Types.ObjectId,
        ref:"Support",
        required:true
    },
    response:{
        type:String,
        required:true
    },
    user_id:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true 
    },
    createdAt: {
        type: String,
        default: moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },
})
export default mongoose.model('SupportResponse', SupportResponseSchema)

