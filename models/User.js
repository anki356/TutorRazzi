import moment from "moment";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import mongoosePaginate from 'mongoose-paginate-v2'
const UserSchema = new mongoose.Schema({
    profile_image: {
        type: String,
default:null
    },
    email: {
        type: String,
        unique: true
    },
    name:{
        type:String
    },
    password: {
        type: String,
        
    },
    mobile_number: {
        type: Number,
        
       
    },
    role: {
        type: String,
        required: true,
        enum: ['academic manager', 'admin', 'parent', 'student', "teacher"]
    },
    createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },
    resetToken: {
        type: String,
        default: null,
      },
      views:{
        type:Number,
        default: 0
      },status:{
        type:Boolean,
        default:true
      }
    
      
}, {
    versionKey: false
})

UserSchema.methods.signJWT = function () {
    const user = this;
    if (user) {
      user.password = undefined;
      user.createdAt = undefined;
    }
 
    return jwt.sign({ user }, process.env.JWT_SECRET);
  }
  UserSchema.set('toJSON', { virtuals: true });
  UserSchema.virtual('profile_image_url').get(function () {
    if(this.profile_image!==undefined) {
 
        return process.env.APP_URL+this.profile_image
    }
 })
UserSchema.plugin(mongoosePaginate)

export default mongoose.model("User", UserSchema)