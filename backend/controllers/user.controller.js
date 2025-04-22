import { v2 as cloudinary} from "cloudinary";
import bcrypt from "bcryptjs";

import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({username}).select("-password")
        if(!user){
            res.status(404).json({error: "user not found"});
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("error in getUserProfile: ", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
} 

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const usersFollowingByMe = await User.findById(userId).select("following");
        const users = await User.aggregate([
            {
                $match: {
                    _id: {$ne: userId}
                },
            },
            { $sample: {size: 10}}, 
            {
                $project: {
                  password: 0,
                },
              },
        ])

        const filterUsers = users.filter((user) => !usersFollowingByMe.following.includes(user._id));
        const suggestedUsers = filterUsers.slice(0, 4);

        res.status(200).json(suggestedUsers);

    } catch (error) {
        console.log("error in getSuggestedUsers: ", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const followUnfollowUser = async(req, res) => {
    try {
        const {id} = req.params
        const userToModify = await User.findById(id);
        console.log(req.user);
        const currentUser = await User.findById(req.user._id)

        if(!id === req.user._id.toString()){
            res.status(400).json({error: "You can follow/unfollow yourself"});
        }

        if(!userToModify || !currentUser){
            res.status(404).json({error: "User not found"});
        }

        const isFollowing = currentUser.following.includes(id);
        if(isFollowing){
            await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}})
            await User.findByIdAndUpdate(id, {$pull: {followers: req.user._id}});
            res.status(200).json({messgae: "User unfollowed successfully"})    
        }else {
            await User.findByIdAndUpdate(id, {$push: {followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$push: {following: id}});

            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id
            })
            await newNotification.save();

            res.status(200).json({message: "User followed successfully"})
        }

    } catch (error) {
        console.log("error in followUnfollowUser: ", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const updateUser = async(req, res) => {
    const { fullname, email, username, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;
    const userId = req.user._id;
    try {
        let user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({error: "User not found"});
        }
        
        if((!newPassword && currentPassword) || (!currentPassword && newPassword)){
            return res.status(400).json({error: "Please provide both current password and new password"});
        }
        
        if(newPassword && currentPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if(!isMatch){
                return res.status(400).json({error: "Current password is invalid"})
            }

            if(newPassword.length < 6){
                return res.status(400).json({error: "Password should be atleast length of 6"})
            }

            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if(profileImg) {
            if(user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadRes = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadRes.secure_url;
        }

        if(coverImg) {
            if(user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadRes = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadRes.secure_url;
        }

        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();

        user.password = null;
        return res.status(200).json(user);
    } catch (error) {
        console.log("error in updateUser: ", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}