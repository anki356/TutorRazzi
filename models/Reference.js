import mongoose from "mongoose";

const ReferenceSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
})

export default mongoose.model("Reference", ReferenceSchema)