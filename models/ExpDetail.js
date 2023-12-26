import mongoose from "mongoose";
import moment from "moment";
const ExpDetailSchema=new mongoose.Schema({
    exp:{
        type:Number,
        required:true
    },
    start_date:{
        type:mongoose.Schema.Types.Date,
        required:true
    },
    end_date:{
        type:mongoose.Schema.Types.Date,
        
    },
    stream:{
        type:String,
        required:true
    },
        organization:{
type:String,
reuired:true
        }, createdAt: {
            type: String,
            default: moment().format("YYYY-MM-DDTHH:mm"),
            required: false
        },
    

},{  
versionKey: false})
export default mongoose.model("ExpDetail",ExpDetailSchema)