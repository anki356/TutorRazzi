import mongoose from "mongoose";
import SubjectCurriculum from "./Subject.js";
import Task from "./Task.js";
import HomeWork from "./HomeWork.js";
import Exam from "./Exam.js";
import Grade from "./Grade.js";
import Subject from "./Subject.js";
import Curriculum from "./Curriculum.js";
import mongoosePaginate from 'mongoose-paginate-v2'
import moment from "moment";
const StudentSchema = new mongoose.Schema({
    
    preferred_name: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    city: {
        type: String,

    },
    state: {
        type: String,

    },
    country: {
        type: String,

    },
    grade: {
        type: Grade.schema

    },
    age: {
        type: Number,

    },
    parent_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User"
    },
    school: {
        type: String,

    },
    address: {
        type: String,

    },
    subjects: {
        type: [Subject.schema],

    },
    curriculum: {
        type: Curriculum.schema
    },

    exams: {
        type: [Exam.schema]
    }, createdAt: {
        type: String,
        default: moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }
}, {
    
    versionKey: false
})
StudentSchema.plugin(mongoosePaginate)
export default mongoose.model("Student", StudentSchema)