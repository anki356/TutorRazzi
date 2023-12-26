import mongoose from "mongoose";

const SubscribedEmailSchema=new mongoose.Schema({
    email:{type:String,required:true},
})
export default mongoose.model("SubscribedEmail",SubscribedEmailSchema)