import User from "../models/user.model.js";
import jwt from "jsonwebtoken"

export const protectedRoutes = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token) {
            return res.status(401).json({error: "Unauthorised: No token provided"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({error: "Invalid Token"});
        }

        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("error in protectedRoutes: ", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}