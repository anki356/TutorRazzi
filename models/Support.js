import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'
import moment from "moment";
const SupportSchema = new mongoose.Schema({
    ticket_id: {
        type: Number,
        required: true
    }, user_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Resolved'],
        required: true
    },
    category:{
type:"String",
enum:["High","Medium","Low"],
required: true
    },
    document_id: {
        type: mongoose.SchemaTypes.ObjectId,
      ref:"Document"
    }, createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },
   
}, {
   
    versionKey: false
})
SupportSchema.plugin(mongoosePaginate)
export default mongoose.model("Support", SupportSchema)
