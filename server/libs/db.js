import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log("Database connected successfully");
    }
    catch(e){
        console.log("Error while connecting to database", e.message);
    }
}

export default connectDB;