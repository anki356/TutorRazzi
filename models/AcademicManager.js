import mongoose from "mongoose";
import DegreeDetail from "./DegreeDetail.js";
import ExpDetail from "./ExpDetail.js";
import mongoosePaginate from 'mongoose-paginate-v2'
import moment from "moment";

const AcademicManagerSchema =
    new mongoose.Schema({
        preferred_name: {
            type: String,
            required: true
        },
        students: {
            type: [mongoose.SchemaTypes.ObjectId],
            ref: 'User',
        },
        teachers:{
            type: [mongoose.SchemaTypes.ObjectId],
            ref: 'User',
        },
        user_id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required:true
        },
        exp_details: {
            type: [ExpDetail.schema],
    
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
            type: mongoose.SchemaTypes.Date,
            

        },
        gender: {
            type: String,
            enum: ["Female", "Male"],
           
        },
        exp: {
            type: Number,
           

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
          
        } ,createdAt: {
            type: String,
            default:()=> moment().format("YYYY-MM-DDTHH:mm"),
            required: false
        }
    }, {
       
        versionKey: false
    })

    AcademicManagerSchema.plugin(mongoosePaginate)
    AcademicManagerSchema.set('toJSON', { virtuals: true });

// Custom Virtuals
AcademicManagerSchema.virtual('total_students').get(function () {
    if (this.students !== undefined) {
        return this.students.length
    }

})
export default mongoose.model("AcademicManager", AcademicManagerSchema)