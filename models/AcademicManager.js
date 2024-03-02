import mongoose from "mongoose";
import DegreeDetail from "./DegreeDetail.js";
import ExpDetail from "./ExpDetail.js";
import mongoosePaginate from 'mongoose-paginate-v2'
import moment from "moment";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import MongooseDelete from "mongoose-delete";
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
      
        city: {
            type: String,
            
        },
        state: {
            type: String,
            
        },
        country: {
            type: String,
            
        },
        
        
        dob: {
            type: String,
            

        },
        gender: {
            type: String,
            enum: ["Female", "Male"],
           
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
    AcademicManagerSchema.plugin(mongooseAggregatePaginate)
    AcademicManagerSchema.plugin(MongooseDelete, { 
        deletedAt : true,
        overrideMethods: 'all' 
      })
    AcademicManagerSchema.set('toJSON', { virtuals: true });

// Custom Virtuals
AcademicManagerSchema.virtual('total_students').get(function () {
    if (this.students !== undefined) {
        return this.students.length
    }

})
export default mongoose.model("AcademicManager", AcademicManagerSchema)