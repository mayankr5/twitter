import Notification from "../models/notification.model.js";

export const getNotifications = async(req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({to: userId}).populate({
            path: "from",
            select: "username profileImg"
        })

        await Notification.updateMany({to: userId}, {read: true});

        res.status(200).json(notifications);
    } catch (error) {
        console.log("error in getNotifications: ", error.message);
        res.status(500).json({error: "Internal server error"})
    }
}

export const deleteNotifications = async(req, res) => {
    try {
        const userId = req.user._id;

        await Notification.deleteMany({to: userId});

        res.status(200).json({message: "Notifications deleted successfully"});
    } catch (error) {
        console.log("error in deleteNotification: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const deleteNotification = async(req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user._id;
 
        const notification = Notification.findById(id);
        if(!notification) {
            res.status(404).json({error: "Notification not found"});
        }

        if(notification.to.toString() !== userId.toString()){
            res.status(403).json({error: "You are not authorised"});
        }

        await Notification.findByIdAndDelete(id);

        res.status(200).json({message: "Notification got deleted"});
        
    } catch (error) {
        console.log("error in deleteNotification: ", error.message);
        res.status(500).json({error:  "Internal server error"});
    }
}