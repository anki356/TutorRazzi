import mongoose from "mongoose";
import moment from "moment";
const AttendanceSchema = new mongoose.Schema({
    check_in_datetime: {
        type: String,

        required: true

    },
    parent_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',

    },
    academic_manager_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    student_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',

    }, class_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Class',
        required: true
    },
    check_out_datetime: {
        type: String,

    },
    teacher_id: {

        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
    }, createdAt: {
        type: String,
        default: moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }
}, {
    
    versionKey: false
})
export default mongoose.model("Attendance", AttendanceSchema)