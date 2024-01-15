import mongoose from "mongoose";

import moment from "moment";
const WalletSchema=new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    amount:{
        type:Number,
        required:true,
        default:0
    },createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }

},{  
versionKey: false})
export default mongoose.model("Wallet",WalletSchema)
