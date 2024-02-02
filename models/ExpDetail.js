import mongoose from "mongoose";
import moment from "moment";
const ExpDetailSchema=new mongoose.Schema({
  exp:{
type:Number,
required:true
  },
    start_year:{
        type:String,
        required:true
    },
    end_year:{
        type:String
        
    },
    subject_curriculum:{
        type:String,
      
    },
        description:{
type:String,

        }, createdAt: {
            type: String,
            default:()=> moment().format("YYYY-MM-DDTHH:mm"),
            required: false
        },
    

},{  
versionKey: false})
export default mongoose.model("ExpDetail",ExpDetailSchema)