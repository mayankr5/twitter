import { generateTokenAndSetCookies } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
    try {
        const { fullname, username, email, password } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			res.status(400).json({ error: "Invalid email format" });
		}

        const existingUser = await User.findOne({username})
        if(existingUser){
            res.status(400).json({error: "Username is already taken"});
        }

        const existingEmail = await User.findOne({email})
        if(existingEmail){
            res.status(400).json({error: "Email is already taken"});
        }

        if(password.length < 6){
            res.status(400).json({error: "Password should be atleast length of 6"})
        }

        const salt = await bcrypt.genSalt(12);
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            username,
            email,
            password: hashPassword,
        })
        

        if(User){
            generateTokenAndSetCookies(newUser._id, res);  
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                username: newUser.username,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg
            })
        }else{
            res.status(400).json({
                error: "Invalid User Data"
            })
        }

    } catch (error) {
        console.log("error in signup controller: ", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const login = async (req, res) => {
    try {
        
        const {username, password} = req.body;

        const user = await User.findOne({username});        
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if(!user || !isPasswordCorrect) {
            res.status(400).json({error: "Invalid credential"})
        }

        generateTokenAndSetCookies(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            username: user.username,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg
        })

    } catch (error) {
        console.log("error in login controller: ", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {
            maxAge: 0
        })
        res.status(200).json({
            message: "logout successfully"
        })
    } catch (error) {
        console.log("error in logout controller: ", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json({user})
    } catch (error) {
        console.log("error in getMe controller: ", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}