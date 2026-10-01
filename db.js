import mongoose from "mongoose";

mongoose.connect('mongodb://127.0.0.1:27017/vote_management').then(()=>{
    console.log("MongoDB connected successfully")
}).catch((error)=>{
    console.log("Error in connecting to MongoDB",error.message)
}
)

export default mongoose;
