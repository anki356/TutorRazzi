import mongoose from "mongoose";
const otpSchema=new mongoose.Schema({
    code:{
        type:Number,
        required:true,
        expires:5*60
    },
    email:{
        type:"String",
        required:true
    } ,expiresAt: {
        type: Date,
        default: Date.now,
        expires: 300 // Expiry time in seconds (5 minutes)
      }
},{
    timestamps: { createdAt: 'createdAt' }
})
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 5 * 60 });
export default mongoose.model("Otp",otpSchema)
