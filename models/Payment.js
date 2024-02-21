import mongoose from "mongoose";
import Coupon from "./Coupon.js";
import mongoosePaginate from 'mongoose-paginate-v2'
import moment from "moment";
const PaymentSchema = new mongoose.Schema({
    sender_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true

    },

    payment_type: {
        type: String,
        enum: ["Debit", "Credit"],
        required: true
    },
    amount: {
        type:Number,
        required: true
    },
    tax: {
        type:Number,
    }, other_deduction: {
        type:Number,
    },
    coupon: {
        type: [Coupon.schema]
    },
    net_amount: {
        type:Number,
        required: true

    }, trx_ref_no: {
        type: String,
       
    },
    quote_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Quote',
    },
    createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },
    status: {
        type: String, default: "Pending", enum: ['Pending', 'Paid','Rejected']
    },
    class_id:{
        type: [mongoose.SchemaTypes.ObjectId],
        ref:"Class"
    },
payment_date:{
    type:String
}
}, {
   
    versionKey: false
})
PaymentSchema.plugin(mongoosePaginate)
PaymentSchema.set('toJSON', { virtuals: true });


PaymentSchema.virtual('amount_received_teacher').get(function () {
    if(this.net_amount!==undefined&& this.status==='Paid'&&this.payment_type==='Credit'){
        return 0.95*this.net_amount
    }
})
PaymentSchema.virtual('class_count').get(function () {
    if(this.class_id!==undefined&&this.class_id.length>0){
        return this.class_id.length
    }
})
PaymentSchema.virtual('payment_date_string').get(function () {
    if(this.payment_date!==undefined&&this.payment_date!==null){
        return moment(this.payment_date).format("DD-MM-YYYY")
    }
})
PaymentSchema.virtual('payment_time_string').get(function () {
    if(this.payment_date!==undefined&&this.payment_date!==null){
        return moment(this.payment_date).format("HH:mm:ss")
    }
})


export default mongoose.model("Payment", PaymentSchema)