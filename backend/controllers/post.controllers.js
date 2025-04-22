import { v2 as cloudinary } from "cloudinary";

import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";



export const createPost = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { text } = req.body;
        let { img } = req.body;
        
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error: "User not found"});
        }
        
        if(!text){
            return res.status(400).json({error: "Post must have text"})
        }
        
        if(img){
            const uploadRes = await cloudinary.uploader.upload(img);
            img = uploadRes.secure_url;
        }
        
        const newPost = new Post({
            user: userId,
            text: text,
            img: img || ""
        })
        
        await newPost.save();
        
        res.status(200).json(newPost);
        
    } catch (error) {
        console.log("error in createPost: ", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({error: "Post not found"});
        }
        
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({error: "You are not authorized to delete this post"});
        }
        
        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }
        
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "Post deleted successfully"});
        
    } catch (error) {
        console.log("error in deletPost: ", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        
        if(!text){
            return res.status(400).json({error: "Commnent must have text"});
        }
        
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({error: "Post not found"});
        }
        
        const comment = {
            user: userId,
            text
        }
        post.comments.push(comment)
        await post.save();
        
        res.status(200).json(post);
        
    } catch (error) {
        console.log("error in deletPost: ", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const postId = req.params.id;
        
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({error: "Post not found"});
        }
        
        const isLiked = post.likes.includes(userId);
        if(isLiked) {
            await Post.findByIdAndUpdate(postId, {$pull: {likes: userId}})
            await User.findByIdAndUpdate(userId, {$pull: {likedPosts: postId}})
            res.status(200).json({message: "Post unliked successfully"});
        } else {
            post.likes.push(userId);
            await post.save();
            await User.findByIdAndUpdate(userId, {$push: {likedPosts: postId}})
            
            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            })
            
            await notification.save();
            res.status(200).json({message: "Post liked successfully"});
        }
        
    } catch (error) {
        console.log("error in likeUnlike: ", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select:"-password"
        });

        if(posts.length === 0){
            res.status(200).json([]);
        }

        res.status(200).json(posts);

    } catch (error) {
        console.log("error in getAllPosts: ", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = User.findById(userId);
        if(!user){
            res.status(404).json({error: "User not found"});
        }
        
        const likedPosts = Post.find({_id: {$in: user.likedPosts}})
        .populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })
        
        res.status(200).json(likedPosts);
        
    } catch (error) {
        console.log("error in getLikedPosts: ", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        const follwingPost = await Post.find({user: {$in: user.following}})
        .sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select:"-password"
        });

        res.status(200).json(follwingPost);

    } catch (error) {
        console.log("error in getFollowingPosts: ", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.find({username: username});
        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        const userPosts = await Post.find({user: user._id})
        .sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select:"-password"
        });;

        res.status(200).json(userPosts);

    } catch (error) {
        console.log("error in getUserPosts: ", error.message);
        res.status(500).json({error: "Internal Server Error"})
    }
}