import moment from "moment";
import mongoose from "mongoose";

const SupportResponseSchema= new mongoose.Schema({
    support_id:{
        type:mongoose.Types.ObjectId,
        ref:"Support",
        required:true
    },
    response:{
        type:String,
       
    },
response_document:{
type:String
},
    user_id:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true 
    },
    createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },
    is_sender:{
        type:Boolean,
        default:false
    },
    is_read:{
        type:Boolean,
        default:false
    }
})
SupportResponseSchema.set('toJSON', { virtuals: true });
SupportResponseSchema.virtual('response_document_url').get(function(){

    if(this.response_document!==undefined){
       
    return process.env.CLOUD_API+this.response_document
    }
})
export default mongoose.model('SupportResponse', SupportResponseSchema)

