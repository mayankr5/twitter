import mongoose from "mongoose";

const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connect: ${conn.connection.host}`);
    }catch(err) {
        console.log(`Error connecting MongoDB: ${error.message}`);
    }
}

export default connectMongoDB;