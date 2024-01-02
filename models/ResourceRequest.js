import mongoose from "mongoose";
import moment from "moment";
import mongoosePaginate from 'mongoose-paginate-v2'
const RequestResourceSchema = new mongoose.Schema({
    request_id: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    class_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Class',
        required: true
    }, createdAt: {
        type: String,
        default: moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },
    status: {
        type: String,
        enum: ['Pending', 'Resolved'],
        default: 'Pending'
    },
   

}, {
    versionKey: false
});
RequestResourceSchema.plugin(mongoosePaginate)
export default mongoose.model("RequestResource", RequestResourceSchema)