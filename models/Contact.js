import mongoose from "mongoose";
import User from './User.js'
const contactsSchema = new mongoose.Schema({
   name:{
    type:String,
    required:true
   }
, email:{
    type:String,
    required:true
   }
, subject:{
    type:String,
    required:true
   }
,
    message:{
        type:String,
        required:true  
    }
}, { timestamps: { currentTime: () => {
    let date = new Date();
    let newDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60 * 1000 * -1));
    return newDate;
}},  
versionKey: false })
export default mongoose.model("Contacts", contactsSchema);