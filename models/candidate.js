import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    party:{
        type: String,
        required: true
    },
    votes:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"user",
                required:true
            },
            votedAt:{
                type:Date,
                default:Date.now
            }

        }
    ],
    voteCount:{
        type:Number,
        default:0
    }
})

const candidate = mongoose.model("candidate", candidateSchema);
export default candidate;