import mongoose from "mongoose";
import DegreeDetail from "./DegreeDetail.js";
import ExpDetail from "./ExpDetail.js";
import Grade from "./Grade.js";
import moment from "moment";
import SubjectCurriculum from "./SubjectCurriculum.js";
import Testimonial from "./Testimonial.js";
import mongoosePaginate from "mongoose-paginate-v2";
import Subject from "./Subject.js";
import Curriculum from "./Curriculum.js";
const TeacherSchema = new mongoose.Schema({
  
    bio: {
        type: String,
    },
    qualification: {
        type: String,
    },
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

    degree: {
        type: [DegreeDetail.schema],

    },

    dob: {
        type:String,


    },
    gender: {
        type: String,
        enum: ["Female", "Male"],

    },
    exp: {
        type: Number,


    },
    subject_curriculum:{
type :[SubjectCurriculum.schema]

    },
    exp_details: {
        type: [ExpDetail.schema],

    },
    address: {
        type: String,

    },
    
    bank_name: {
        type: String,
        
    },
    branch_name: {
        type: String,
        
    },
    ifsc_code: {
        type: String,
        
    },
    account_number: {
        type: Number,
        
    }, createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }
   
}, {
    
    versionKey: false
})
TeacherSchema.set('toJSON', { virtuals: true });

// Custom Virtuals

TeacherSchema.virtual('profileImageUrl').get(function () {
    if (this.profile_image !== undefined) {
        return process.env.APP_URL + this.profile_image

    }

})
TeacherSchema.plugin(mongoosePaginate)


export default mongoose.model("Teacher", TeacherSchema)