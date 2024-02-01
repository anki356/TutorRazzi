import mongoose from "mongoose";

import moment from "moment";
const TestimonialSchema = new mongoose.Schema({
    video: {
        type: String,
        required: true
    },
    student_id: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
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

export default mongoose.model('Testimonial', TestimonialSchema)