import mongoose from "mongoose";
import moment from "moment";
const ParentSchema=new mongoose.Schema({
 
            preferred_name:{
type:String,
required:true
    },
    user_id:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'User'
    },
    city:{
        type:String,
      
    },
    state:{
        type:String,
      
    },
    country:{
        type:String,
      
    },
    age:{
        type:Number,
      
    },
    address:{
        type:String,
      
    }, createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }
    


}, {   
versionKey: false })
export default mongoose.model("Parent",ParentSchema)