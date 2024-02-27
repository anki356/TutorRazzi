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
        enum:['Educational ','Strategies','Technology','Professional','Career','Parental'],
        required:true  
    }
})
NewsSchema.plugin(mongoosePaginate)
NewsSchema.set('toJSON', { virtuals: true });
NewsSchema.virtual('cover_photo_url').get(function(){

return process.env.CLOUD_API+"/"+this.cover_photo
})
export default mongoose.model("News",NewsSchema)