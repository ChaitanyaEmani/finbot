import mongoose from "mongoose";

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://chaitanyaemani6:8247281027@cluster0.zuac4on.mongodb.net/finbot").then(()=>{console.log("MongoDB connected successfully")});

}

export default connectDB;