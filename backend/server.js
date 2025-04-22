import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { v2 as cloudinary} from "cloudinary";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";

import connectMongoDB from "./db/connectDB.js";

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET
})

const app = express();
const PORT = process.env.PORT || 8000

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())
app.use(morgan('tiny'))

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);


connectMongoDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    }
)
