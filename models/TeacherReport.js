import mongoose from "mongoose";
const TeacherReportSchema=await new mongoose.Schema({
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reportBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    flag: {
        type:String
    },

})
export default mongoose.model("TeacherReport",TeacherReportSchema)