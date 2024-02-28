import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'
import moment from "moment";
const NotificationSchema=new mongoose.Schema({
    user_id:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'User',
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    is_read:{
        type:Boolean,
        required:true,
    default:false
    }, createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm:ss"),
        required: false
    }
},{  
versionKey: false})
NotificationSchema.set('toJSON', { virtuals: true });
NotificationSchema.virtual('time_diff').get(function () {
    if(this.createdAt!==undefined){
        const now = moment();
        const duration = moment.duration(now.diff(this.createdAt));
        
        if (duration.asSeconds() < 60) {
          return `${Math.round(duration.asSeconds())} seconds ago`;
        } else if (duration.asMinutes() < 60) {
          return `${Math.round(duration.asMinutes())} minutes ago`;
        } else if (duration.asHours() < 24) {
          return `${Math.round(duration.asHours())} hours ago`;
        } else if (duration.asDays() < 30) {
          return `${Math.round(duration.asDays())} days ago`;
        } else {
          return `${Math.round(duration.asMonths())} months ago`;
        }
    
    }
   
})
NotificationSchema.plugin(mongoosePaginate)
export default mongoose.model('Notification',NotificationSchema)