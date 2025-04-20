import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js"
import connectMongoDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 8000

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())

app.use("/api/auth", authRoutes)


connectMongoDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    }
)
