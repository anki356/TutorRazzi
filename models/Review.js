import mongoose from "mongoose";
import moment from "moment";
import mongoosePaginate from 'mongoose-paginate-v2'
const ReviewSchema = new mongoose.Schema({
    teacher_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
   
    class_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Class',
    },
    given_by: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    message: {
        type: String,
        
    },
    rating: {
        type: Number,
        required: true
    }, createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }
}, {
    
    versionKey: false
})
ReviewSchema.plugin(mongoosePaginate)
export default mongoose.model("Review", ReviewSchema)