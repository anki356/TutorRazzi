import mongoose from "mongoose";
import moment from "moment";
const DegreeDetailSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    start_date:{
        type:mongoose.Schema.Types.Date,
        required:true
    },
    end_date:{
        type:mongoose.Schema.Types.Date,
        required:true
    },
    stream:{
        type:String,
        required:true
    },
        college:{
type:String,
reuired:true
        }, createdAt: {
            type: String,
            default: moment().format("YYYY-MM-DDTHH:mm"),
            required: false
        }
    

},{  
versionKey: false})
export default mongoose.model("DegreeDetail",DegreeDetailSchema)