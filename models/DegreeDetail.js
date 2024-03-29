import mongoose from "mongoose";
import moment from "moment";
const DegreeDetailSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    start_year:{
        type:String,
        required:true
    },
    end_year:{
        type:String,
        default:null
    },
        college:{
type:String,
required:true
        }, createdAt: {
            type: String,
            default:()=> moment().format("YYYY-MM-DDTHH:mm"),
            required: false
        }
    

},{  
versionKey: false})
export default mongoose.model("DegreeDetail",DegreeDetailSchema)