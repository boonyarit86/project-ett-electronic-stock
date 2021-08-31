const HttpError = require('../models/http-error');
const Notification = require("../models/notification");
const User = require("../models/user");

// รับข้อมูลการแจ้งเตือนทั้งหมด
const getAllNotifications = async (req, res, next) => {
    let notifications;
    let user;

    // หาข้อมูลผู้ใช้ว่ามีการแจ้งเตือนใหม่เท่าไร
    try {
        user = await User.findById(req.params.uid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data users.',
            500
        );
        return next(error);
    }

    // เตรียมข้อมูลการแจ้งเตือน
    try {
        notifications = await Notification.find();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data.',
            500
        );
        return next(error);
    }

    // ลบข้อมูลการแจ้งเตือนที่หมดอายุหรือมีระยะเวลามากกว่า 7 วัน
    for (var round = 0; round < notifications.length; round++) {
        let expNotification = new Date(notifications[round].exp).getTime()
        let currentDate = new Date().getTime();
        if (expNotification < currentDate) {
            try {
                await notifications[round].remove()
            } catch (err) {
                const error = new HttpError(
                    'Something went wrong, could not remove notification.',
                    500
                );
                return next(error);
            }
        }
    }

    res.json({ notifications: notifications, userInfo: user.countNotification });
}

// สร้างการแจ้งเตือนใหม่
const createNotification = async (req, res, next) => {
    const { notifications, username, image, status } = req.body;
    let response = []
    let users;

    // กำหนดจำนวนการแจ้งเตือนใหม่ล่าสุดให้กับผู้ใช้
    try {
        users = await User.find();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data users.',
            500
        );
        return next(error);
    }

    // สร้างการแจ้งเตือนใหม่
    for (var round = 0; round < notifications.length; round++) {
        let newNotification = new Notification({
            post: notifications[round].post,
            username: username,
            status: status,
            image: image,
            date: new Date().toString(),
            exp: new Date(new Date().getTime() + (1000 * 60) * (1440 * 7))
        })

        try {
            await newNotification.save();
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not save notification.',
                500
            );
            return next(error);
        }
        response = [...response, newNotification]
    }

    // กำหนดจำนวนการแจ้งเตือนใหม่ล่าสุดให้กับผู้ใช้
    for (var round = 0; round < users.length; round++) {
        let sumNotification = notifications.length + users[round].countNotification
        users[round].countNotification = sumNotification
        try {
            await users[round].save();
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not save user.',
                500
            );
            return next(error);
        }
    }
    res.status(201).json(response)
}

// การเคลียค่าตัวเลขการแจ้งเตือน
const clearNotification = async (req, res, next) => {

    // เมื่อผู้ใช้เปิดดูการแจ้งเตือน ตัวเลขจำนวนของการแจ้งเตือนใหม่จะถูกกำหนดเป็น 0 ทันที
    let user;
    try {
        user = await User.findById(req.params.uid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data user by id.',
            500
        );
        return next(error);
    }

    user.countNotification = 0

    try {
        await user.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save user.',
            500
        );
        return next(error);
    }
    res.json({ userInfo: user.countNotification })
}


exports.getAllNotifications = getAllNotifications;
exports.createNotification = createNotification;
exports.clearNotification = clearNotification