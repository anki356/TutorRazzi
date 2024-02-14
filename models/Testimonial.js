import mongoose from "mongoose";

import moment from "moment";
import mongoosePaginate from 'mongoose-paginate-v2'
const TestimonialSchema = new mongoose.Schema({
    video: {
        type: String,
        required: true
    },
    student_name: {
        type: String,
        required: true
    },
    grade:{
type:String,
required: true
    },
    school:{
        type:String,
        required: true
    },
    teacher_id: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },createdAt: {
        type: String,
        default: ()=>moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }
    
}//timesatap
)
TestimonialSchema.plugin(mongoosePaginate)
export default mongoose.model('Testimonial', TestimonialSchema)