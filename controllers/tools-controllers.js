const HttpError = require('../models/http-error');
const Tool = require("../models/tool");
const HistoryTool = require("../models/history-tool");
const fs = require("fs")
const HistoryCnt = require("../models/history-cnt");
const Board = require("../models/board");
// const HistoryBoard = require("../models/history-board");
const IncompleteTool = require("../models/incomplete-tool");
// const historyTool = require('../models/history-tool');

// const aws = require('aws-sdk');

// You can get those keys from My Security from Credentials of Aws S3
// aws.config.update({
//     accessKeyId: process.env.accessKeyId,
//     secretAccessKey: process.env.secretAccessKey
// });

// const s3 = new aws.S3();

// รับข้อมูลรายการอุปกรณ์ทั้งหมด
const getAllTools = async (req, res, next) => {
    let tools;
    try {
        tools = await Tool.find();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data.',
            500
        );
        return next(error);
    }

    res.json(tools);
}

// รับข้อมูลการเบิกโปรเจคทั้งหมด
const getAllHistoryTools = async (req, res, next) => {
    let historyTools;
    let userStatus = req.body.status;
    let userName = req.body.userName;
    try {
        historyTools = await HistoryTool.find();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching history tool.',
            500
        );
        return next(error);
    }

    // ลบข้อมูลที่หมดอายุ
    for (var round = 0; round < historyTools.length; round++) {
        let expHistory = new Date(historyTools[round].exp).getTime()
        let currentDate = new Date().getTime();
        if (expHistory < currentDate) {
            try {
                await historyTools[round].remove()
            } catch (err) {
                const error = new HttpError(
                    'Something went wrong, could not remove history-tool that expired.',
                    500
                );
                return next(error);
            }
        }
    }

    // รายการอุปกรณ์ไหนที่ถูกลบไปแล้ว จะไปแสดงผลในหน้าประวัติการใช้งานอุปกรณ์ด้วย แต่จะเก็บไว้ในฐานข้อมูลอย่างเดียว
    // ตรวจสอบว่าผู้ใช้สถานะไหนเป็นคนขอข้อมูล
    let filterData;
    if (userStatus === "User") {
        filterData = historyTools.filter((item) => item.isDeleted !== true && item.username === userName)
    }
    else {
        filterData = historyTools.filter((item) => item.isDeleted !== true)
    }

    // เรียงลำดับข้อมูล โดยเอาวันที่ล่าสุดขึ้นมาก่อน
    let responseData = []
    for (var round = 0; round < filterData.length; round++) {
        let index = filterData.length - 1 - round
        responseData = [...responseData, filterData[index]]
    }

    res.json(responseData);
}

// รับข้อมูลอุปกรณ์ที่ผู้ใช้เลือก
const getTool = async (req, res, next) => {
    let tool;
    try {
        tool = await Tool.findById(req.params.tid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data.',
            500
        );
        return next(error);
    }
    res.json(tool);
}

// สร้างรายการอุปกรณ์
const createTool = async (req, res, next) => {
    const { toolName, toolCode, type, category, size, total, description } = req.body;
    let image;

    if (req.file !== undefined) {
        image = { location: 'http://localhost:5000/' + req.file.path, key: req.file.path }
    } else {
        // ถ้าผู้ใช้ไม่อัพโหลดรูปภาพเข้ามา ระบบจะกำหนดเป็นรูปภาพพื้นฐาน
        image = { location: "/images/profile.png", key: false }
    }

    const newTool = new Tool({
        toolName: toolName,
        toolCode: toolCode,
        type: type,
        category: category,
        size: size,
        total: total,
        limit: 0,
        imageProfile: image,
        images: [],
        status: false,
        description: description
    })

    try {
        await newTool.save()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not create a tool.',
            500
        );
        return next(error);
    }

    console.log("create a tool successfully")
    res.status(200).json(newTool);
}

// การเบิก/เพิ่มอุปกรณ์
const actionTool = async (req, res, next) => {
    let tool;
    let cnt;
    const { total, actionType, tid, toolName, description, userName, status } = req.body
    try {
        tool = await Tool.findById(req.params.tid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data.',
            500
        );
        return next(error);
    }

    // ข้อมูลเลขที่การเบิก
    try {
        cnt = await HistoryCnt.findById("608386350b3e6333741b6c01");
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find cntNumber.',
            500
        );
        return next(error);
    }

    // การเพิ่ม
    if (actionType === "add") {
        tool.total = Number(tool.total) + Number(total)
    } 
    // การเบิก
    else {
        tool.total = Number(tool.total) - Number(total)
    }

    let createActionEdit = [
        {
            code: cnt.name + (cnt.cntNumber + 1) + "-1",
            username: userName,
            total: total,
            status: status,
            date: new Date().toString(),
            description: description,
            actionType: actionType
        }
    ]

    // บันทึกข้อมูลประวัติการเบิกของ
    let newHistory = new HistoryTool({
        code: cnt.name + (cnt.cntNumber + 1),
        tid: tid,
        toolName: toolName,
        type: tool.type,
        category: tool.category,
        size: tool.size,
        date: new Date(),
        total: total,
        username: userName,
        status: status,
        actionType: actionType,
        exp: new Date(new Date().getTime() + (1000 * 60) * (1440 * 180)),
        description: description,
        actionEdit: createActionEdit
    })
    // บันทึกจำนวนอุปกรณ์ล่าสุดไปยังฐานข้อมูล
    try {
        await tool.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save tool.',
            500
        );
        return next(error);
    }

    // บันทึกเลขที่การเบิก
    cnt.cntNumber = cnt.cntNumber + 1
    try {
        await cnt.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save tool.',
            500
        );
        return next(error);
    }

    // บันทึกการเบิกอุปกรณ์
    try {
        await newHistory.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save history tool.',
            500
        );
        return next(error);
    }

    res.json(tool);
    // console.log(newHistory);
    console.log("update successfully")
}

// การแก้ไขรายการอุปกรณ์
const editTool = async (req, res, next) => {
    let tool;
    const { toolName, toolCode, total, type, category, size, images, imageProfile, description, oldImages, delImages, limit } = req.body;
    // ตัวแปรรูปภาพที่จะถูกลบ
    let delImgArr = []
    try {
        tool = await Tool.findById(req.params.tid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data.',
            500
        );
        return next(error);
    }

    tool.toolName = toolName
    tool.toolCode = toolCode
    tool.total = total
    tool.type = type
    tool.size = size
    tool.limit = limit
    tool.category = category
    tool.description = description

    // อัพโหลดโปรไฟล์อุปกรณ์
    // ถ้ารูปอุปกรณ์ถูกลบหรือไม่ได้กำหนดมา
    if (imageProfile === "false") {
        // ลบรูปภาพเดิมออกแล้วเพิ่มรูปภาพระบบไปแทน
        if (tool.imageProfile.key) {
            delImgArr = [...delImgArr, tool.imageProfile.key]
            tool.imageProfile = { location: "/images/profile.png", key: false }
            console.log("set default image and delete")
        }
        // ถ้าไม่มีรูปภาพก่อนหน้านี้ เพิ่มรูปภาพระบบเข้าไป ป้องกันค่าว่าง 
        else {
            tool.imageProfile = { location: "/images/profile.png", key: false }
        }
    }
    // ผู้ใช้งานกำหนดรูปภาพใหม่
    else if (imageProfile === "true") {
        // ถ้ามีรูปเก่าในระบบให้ลบ และเพิ่มรุปภาพใหม่เข้าไป
        if (tool.imageProfile.key) {
            delImgArr = [...delImgArr, tool.imageProfile.key]
            tool.imageProfile = { location: 'http://localhost:5000/' + req.files[0].path, key: req.files[0].path }
        }
        // ถ้าไม่มีรุปภาพเก่าในระบบ ให้เพิ่มอย่างเดียว
        else {
            console.log("add images to db")
            tool.imageProfile = { location: 'http://localhost:5000/' + req.files[0].path, key: req.files[0].path }
        }
    }
    else if (typeof (imageProfile) === "string") {
        console.log("default image")
    }

    // Multi Images
    let newImgArr = []
    // ถ้ามีรูปภาพใหม่ที่อัพมา มากกว่า 1
    if (images === "true") {
        console.log("have images")
        // ทำการแยกรูปภาพโปรไฟล์อุปกรณ์ออกจากรายการ ถ้ามี
        if (imageProfile === "true") {
            for (var round = 0; round < req.files.length; round++) {
                if (round !== 0) {
                    newImgArr = [...newImgArr, { location: 'http://localhost:5000/' + req.files[round].path, key: req.files[round].path }]
                }
            }
        } else {
            console.log("Only many imges")
            for (var round1 = 0; round1 < req.files.length; round1++) {
                newImgArr = [...newImgArr, { location: 'http://localhost:5000/' + req.files[round1].path, key: req.files[round1].path }]
            }
        }
        // เพิ่มรุปภาพเก่าไปยังที่เดิม
        if (JSON.parse(oldImages).length !== 0) {
            let convOldImages = JSON.parse(oldImages);
            newImgArr = [...newImgArr, ...convOldImages]
        }

        if (JSON.parse(delImages).length !== 0) {
            console.log("delete images section 1")
            let convDelImages = JSON.parse(delImages)
            for (var x = 0; x < convDelImages.length; x++) {
                delImgArr = [...delImgArr, convDelImages[x].key]
            }
        }
        tool.images = newImgArr
    }
    // ถ้าไม่มีรูปภาพที่อัพมาใหม่ แต่เป็นรูปภาพเก่าที่ถูกลบจากฐานข้อมูล
    else {
        console.log("have no images")
        // เพิ่มรุปภาพเก่าไปยังที่เดิม
        if (JSON.parse(oldImages).length !== 0) {
            let convOldImages = JSON.parse(oldImages);
            newImgArr = [...newImgArr, ...convOldImages]
        }

        if (JSON.parse(delImages).length !== 0) {
            console.log("delete images section 2")
            let convDelImages = JSON.parse(delImages)
            for (var x = 0; x < convDelImages.length; x++) {
                delImgArr = [...delImgArr, convDelImages[x].key]
            }
        }
        tool.images = newImgArr
    }

    // ลบรูปภาพออกจากระบบ
    if (delImgArr.length !== 0) {
        for (var i = 0; i < delImgArr.length; i++) {
            fs.unlink(delImgArr[i], err => {
                if (err) console.log(err);
                else console.log("delete image successfully")
            });
        }
    }

    try {
        await tool.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save data.',
            500
        );
        return next(error);
    }

    res.status(201).json(tool);
    // console.log(tool);
    console.log("edit successfully")
}

// ยกเลิกการเบิกอุปกรณ์
const editHistoryTool = async (req, res, next) => {
    const { htid, username, status, total, description } = req.body

    let findTool;
    let findHistoryTool;

    // หาข้อมูลอุปกรณ์
    try {
        findTool = await Tool.findById(req.params.tid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find tool by id.',
            500
        );
        return next(error);
    }

    // หาข้อมูลประวัติการเบิกอุปกรณ์
    try {
        findHistoryTool = await HistoryTool.findById(htid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find history-tool by id.',
            500
        );
        return next(error);
    }

    let newTag;
    let calTotal;
    // แก้ไขกระบวนการทำงานของ การเพิ่ม
    if (findHistoryTool.actionType === "add") {
        // 10 - 8 = 2 ก็คือ สต๊อกถูกลดค่า 
        if (findHistoryTool.total > Number(total)) {
            calTotal = findHistoryTool.total - Number(total)
            findTool.total = findTool.total - calTotal;
        }
        // 10 - 15 = -5 ก็คือ สต๊อกถูกเพิ่มค่า
        else if (findHistoryTool.total < Number(total)) {
            calTotal = Number(total) - findHistoryTool.total
            findTool.total = findTool.total + calTotal;
        }
        newTag = {
            code: findHistoryTool.code + "-2",
            username: username,
            total: total,
            status: status,
            date: new Date().toString(),
            description: description,
            actionType: findHistoryTool.actionType
        }
    }
    // แก้ไขกระบวนการทำงานของ การเบิก
    else if (findHistoryTool.actionType === "request") {
        // ตรวจสอบว่าเป็นกระบวนการ Restore ของคืนสต๊อกรึป่าว
        if (Number(total) !== 0) {
            // 10 - 8 = 2 ก็คือ สต๊อกถูกเพิ่มค่า 
            if (findHistoryTool.total > Number(total)) {
                calTotal = findHistoryTool.total - Number(total)
                findTool.total = findTool.total + calTotal;
            }
            // 10 - 15 = 5 ก็คือ สต๊อกถูกลดค่า
            else if (findHistoryTool.total < Number(total)) {
                calTotal = Number(total) - findHistoryTool.total
                findTool.total = findTool.total - calTotal;
            }
        } else {
            findTool.total = findTool.total + findHistoryTool.total;
        }
    }

    // สร้างข้อมูลแท๊กใหม่
    let newActionType;
    if (Number(total) !== 0) {
        newActionType = findHistoryTool.actionType
    } else {
        newActionType = "restore";
    }
    newTag = {
        code: findHistoryTool.code + "-2",
        username: username,
        total: total,
        status: status,
        date: new Date().toString(),
        description: description,
        actionType: newActionType
    }

    // เริ่มเก็บข้อมูล
    findHistoryTool.total = total
    findHistoryTool.actionEdit = [...findHistoryTool.actionEdit, newTag]

    try {
        await findTool.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save data tool.',
            500
        );
        return next(error);
    }

    try {
        await findHistoryTool.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save data tool.',
            500
        );
        return next(error);
    }
    let historyTool = await HistoryTool.find();
    res.status(201).json(historyTool);
    console.log("restore tool successfully")
    // console.log(findHistoryTool)
    // console.log(findTool)
}

// ลบรายการอุปกรณ์
const deleteTool = async (req, res, next) => {
    let toolId = req.params.tid;

    // หาข้อมูลอุปกรณ์
    let tool;
    try {
        tool = await Tool.findById(toolId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find tool by id.',
            500
        );
        return next(error);
    }

    // หาข้อมูลบอร์ด
    let boards;
    try {
        boards = await Board.find();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data of boards.',
            500
        );
        return next(error);
    }

    // ลบข้อมูลอุปกรณ์ที่อยู่ในบอร์ด
    for (var round = 0; round < boards.length; round++) {
        let newArr = boards[round].tools.filter((board) => board.id !== toolId)
        boards[round].tools = newArr
        // console.log(newArr)

        // บันทึกข้อมูลบอร์ด
        try {
            await boards[round].save();
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not save data boards.',
                500
            );
            return next(error);
        }
    }

    // ลบข้อมูลอุปกรณ์ที่อยู่ในประวัติการเบิกหรือเพิ่มอุปกรณ์
    let histool;
    try {
        histool = await HistoryTool.find();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data of history-tool.',
            500
        );
        return next(error);
    }

    for (var round = 0; round < histool.length; round++) {
        if (histool[round].tid === toolId) {
            histool[round].isDeleted = true

            // บันทึกข้อมูลอุปกรณ์
            try {
                await histool[round].save();
            } catch (err) {
                const error = new HttpError(
                    'Something went wrong, could not save data history-tool.',
                    500
                );
                return next(error);
            }
        }
    }

    // ลบข้อมูลอุปกรณ์ที่อยู่ในหน้าอุปกรณ์คงค้าง
    let incomplete;
    try {
        incomplete = await IncompleteTool.find();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data of incomplete board.',
            500
        );
        return next(error);
    }

    for (var round = 0; round < incomplete.length; round++) {
        let newArr = incomplete[round].tools.filter((tool) => String(tool.tid) !== toolId)
        incomplete[round].tools = newArr

        if (incomplete[round].tools.length === 0) {
            console.log("delete incomplete", incomplete[round].tools.length)
            try {
                await incomplete[round].remove();
            } catch (err) {
                const error = new HttpError(
                    'Something went wrong, could not delete data tool.',
                    500
                );
                return next(error);
            }
        } else {
            console.log("save incomplete", incomplete[round].tools.length)
            try {
                await incomplete[round].save();
            } catch (err) {
                const error = new HttpError(
                    'Something went wrong, could not save incomplete.',
                    500
                );
                return next(error);
            }
        }
    }

    // ลบรูปภาพของอุปกรณ์
    if (tool.images.length !== 0) {
        for (var i = 0; i < tool.images.length; i++) {
            fs.unlink(tool.images[i].key, err => {
                if (err) console.log("can not find path of images");
                else console.log("delete images successfully")
            });
        }
    }

    // ลบรูปภาพโปรไฟล์ของอุปกรณ์
    if (tool.imageProfile.key !== false) {
        fs.unlink(tool.imageProfile.key, err => {
            if (err) console.log("can not find path of image");
            else console.log("delete image successfully")
        });
    }

    try {
        await tool.remove();
        console.log("delete tool successfully")
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete tool by id.',
            500
        );
        return next(error);
    }


    // ลบข้อมูลอุปกรณ์
    // await Tool.findByIdAndDelete(toolId, (err, data) => {
    //     if (err) console.log("can not delete")
    //     else console.log(data)
    // })

    res.json(tool);
}

exports.editTool = editTool;
exports.getAllTools = getAllTools;
exports.getAllHistoryTools = getAllHistoryTools;
exports.getTool = getTool;
exports.actionTool = actionTool;
exports.createTool = createTool;
exports.editHistoryTool = editHistoryTool;
exports.deleteTool = deleteTool;