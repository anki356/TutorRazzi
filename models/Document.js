import mongoose from "mongoose";
import moment from "moment";
const DocumentSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    }, createdAt: {
        type: String,
        default: moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }
}, { 
versionKey: false })
DocumentSchema.set('toJSON', { virtuals: true });
DocumentSchema.virtual('document_url').get(function(){
    return process.env.APP_URL+this.name
})

export default mongoose.model("Document",DocumentSchema)