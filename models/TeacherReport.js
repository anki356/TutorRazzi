import mongoose from "mongoose";
const TeacherReportSchema=await new mongoose.Schema({
    teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reportBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    flag: String,

})
export default mongoose.model("TeacherReport",TeacherReportSchema)