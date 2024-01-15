import mongoose from "mongoose";
import moment from "moment";
const CouponSchema=new mongoose.Schema({
    coupon_name:{
        type:String,
        required:true
        } ,discount :{type:Number ,required:true
    }, createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }
},{
    
    versionKey: false
})
export default mongoose.model('Coupon',CouponSchema)