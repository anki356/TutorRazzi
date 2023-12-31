import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'
const NewsSchema=new mongoose.Schema({
    title:{type:String,required:true},
    sub_title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    cover_photo:{
        type:String,
        required:true 
    },
    category:{
        type:String,
        required:true  
    }
})
NewsSchema.plugin(mongoosePaginate)
export default mongoose.model("News",NewsSchema)