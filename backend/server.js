import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js"
import connectMongoDB from "./db/connectDB.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 8000

app.use("/api/auth", authRoutes)

connectMongoDB().then(() => {
        app.listen(8000, () => {
            console.log("Server is running on port 8000");
        })
    }
)
