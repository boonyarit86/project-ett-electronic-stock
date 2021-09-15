const HttpError = require('../models/http-error');
const Board = require("../models/board");
const Tool = require("../models/tool");
const HistoryTool = require("../models/history-tool");
const HistoryBoard = require("../models/history-board");
const IncompleteTool = require("../models/incomplete-tool");
const fs = require("fs");
const HistoryCnt = require("../models/history-cnt");

// const aws = require('aws-sdk');

// You can get those keys from My Security from Credentials of Aws S3
// aws.config.update({
//     accessKeyId: process.env.accessKeyId,
//     secretAccessKey: process.env.secretAccessKey
// });

// const s3 = new aws.S3();

// รับข้อมูลบอร์ดทั้งหมด
const getAllBoards = async (req, res, next) => {
    let boards;
    try {
        boards = await Board.find();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data.',
            500
        );
        return next(error);
    }

    res.json(boards);
}

// รับข้อมูลบอร์ดที่ผู้ใช้เลือก
const getBoard = async (req, res, next) => {
    let board;
    try {
        board = await Board.findById(req.params.bid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data.',
            500
        );
        return next(error);
    }
    res.json(board);
}

// รับข้อมูลการเบิกบอร์ดทั้งหมด
const getAllHistoryBoards = async (req, res, next) => {
    let historyBoards;
    try {
        historyBoards = await HistoryBoard.find();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching history board.',
            500
        );
        return next(error);
    }

    // ลบข้อมูลที่หมดอายุ
    for (var round = 0; round < historyBoards.length; round++) {
        let expHistory = new Date(historyBoards[round].exp).getTime()
        let currentDate = new Date().getTime();
        if (expHistory < currentDate) {
            try {
                await historyBoards[round].remove()
            } catch (err) {
                const error = new HttpError(
                    'Something went wrong, could not remove history-board that expired.',
                    500
                );
                return next(error);
            }
        }
    }

    // รายการอุปกรณ์ไหนที่ถูกลบไปแล้ว จะไปแสดงผลในหน้าประวัติการใช้งานอุปกรณ์ด้วย แต่จะเก็บไว้ในฐานข้อมูลอย่างเดียว
    let filterData = historyBoards.filter((item) => item.isDeleted !== true)

    // เรียงลำดับข้อมูล โดยเอาวันที่ล่าสุดขึ้นมาก่อน
    let responseData = []
    for (var round = 0; round < filterData.length; round++) {
        let index = filterData.length - 1 - round
        responseData = [...responseData, filterData[index]]
    }


    res.json(responseData);
}

// รับข้อมูลอุปกรณ์คงค้าง
const getIncompleteBoard = async (req, res, next) => {
    let incompleteTool;
    try {
        incompleteTool = await IncompleteTool.find();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data about Incomplete Board.',
            500
        );
        return next(error);
    }

    res.json(incompleteTool);
}

// สร้างรายการบอร์ด
const createBoard = async (req, res, next) => {
    const { boardName, boardCode, type, tools, description } = req.body;
    let image;
    // ตัวแปรอุปกรณ์ที่ใช้ภายในบอร์ด []
    let convTools = JSON.parse(tools);

    if (req.file !== undefined) {
        // ถ้ากำหนดรูปภาพมาให้เก็บข้อมูลไว้
        image = { location: 'http://localhost:5000/' + req.file.path, key: req.file.path }
    } else {
        // ถ้าไม่ได้กำหนดรูปภาพมา ให้ตั้งค่าเป็นค่าพื้นฐาน
        image = { location: "/images/profile.png", key: false }
    }

    const newBoard = new Board({
        boardName: boardName,
        boardCode: boardCode,
        type: type,
        total: 0,
        limit: 0,
        tools: convTools,
        imageProfile: image,
        images: [],
        status: false,
        description: description
    })

    try {
        await newBoard.save()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not create a board.',
            500
        );
        return next(error);
    }

    console.log("create a board successfully")
    res.status(200).json(newBoard);
    // console.log(newBoard)
}

// การเพิ่มบอร์ด
const actionBoard = async (req, res, next) => {
    let board;
    let cnt;
    const { bid, description, username, status } = req.body;
    // ตัวแปรของจำนวนที่ต้องการเพิ่ม
    let total = Number(req.body.total);

    // หาข้อมูลบอร์ดที่ต้องเพิ่ม
    try {
        board = await Board.findById(req.params.bid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data.',
            500
        );
        return next(error);
    }

    // ข้อมูลเลขที่การเบิก
    try {
        cnt = await HistoryCnt.findById("608386543e4e3458083fb2c0");
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find cntNumber.',
            500
        );
        return next(error);
    }

    // บอร์ดในสต๊อก + จำนวนที่ต้องการเพิ่ม
    board.total = board.total + total

    // สร้างแท๊กใหม่
    let createActionEditBoard = [
        {
            code: cnt.name + (cnt.cntNumber + 1) + "-1",
            username: username,
            total: total,
            status: status,
            date: new Date().toString(),
            description: description,
            actionType: "add"
        }
    ]

    // บันทึกข้อมูลประวัติการเบิกของและเก็บข้อมูลไอดีของตารางอุปกรณ์ไม่ครบ
    let newHistoryBoard = new HistoryBoard({
        code: cnt.name + (cnt.cntNumber + 1),
        bid: board._id,
        tid: [],
        incompleteToolid: "none",
        boardName: board.boardName,
        boardCode: board.boardCode,
        date: new Date(),
        total: total,
        username: username,
        status: status,
        actionType: "add",
        exp: new Date(new Date().getTime() + (1000 * 60) * (1440 * 180)),
        description: description,
        actionEdit: createActionEditBoard,
        tools: []
    })
    // บันทึกจำนวนอุปกรณ์ล่าสุดไปยังฐานข้อมูล
    try {
        await board.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save board.',
            500
        );
        return next(error);
    }

    // บันทึกข้อมูลเลขที่การเบิก
    cnt.cntNumber = cnt.cntNumber + 1
    try {
        await cnt.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save cntHistory.',
            500
        );
        return next(error);
    }

    // บันทึกข้อมูลการเบิก
    try {
        await newHistoryBoard.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save history board.',
            500
        );
        return next(error);
    }

    let boardsList;
    try {
        boardsList = await Board.find();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data.',
            500
        );
        return next(error);
    }

    res.json(boardsList);
    console.log("update successfully")
}

// แก้ไขข้อมูลบอร์ด
const editBoard = async (req, res, next) => {
    let board;
    const { boardName, boardCode, type, images, imageProfile, description, oldImages, delImages, limit } = req.body;
    const tools = JSON.parse(req.body.tools)
    // ตัวแปรรูปภาพที่จะถูกลบ
    let delImgArr = []
    try {
        board = await Board.findById(req.params.bid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data.',
            500
        );
        return next(error);
    }

    board.boardName = boardName
    board.boardCode = boardCode
    board.type = type
    board.tools = tools
    board.limit = limit
    board.description = description

    // อัพโหลดโปรไฟล์อุปกรณ์
    // ถ้ารูปอุปกรณ์ถูกลบหรือไม่ได้กำหนดมา
    if (imageProfile === "false") {
        // ลบรูปภาพเดิมออกแล้วเพิ่มรูปภาพระบบไปแทน
        if (board.imageProfile.key) {
            delImgArr = [...delImgArr, board.imageProfile.key]
            board.imageProfile = { location: "/images/profile.png", key: false }
            console.log("set default image and delete")
        }
        // ถ้าไม่มีรูปภาพก่อนหน้านี้ เพิ่มรูปภาพระบบเข้าไป ป้องกันค่าว่าง 
        else {
            board.imageProfile = { location: "/images/profile.png", key: false }
        }
    }
    // ผู้ใช้งานกำหนดรูปภาพใหม่
    else if (imageProfile === "true") {
        // ถ้ามีรูปเก่าในระบบให้ลบ และเพิ่มรุปภาพใหม่เข้าไป
        if (board.imageProfile.key) {
            delImgArr = [...delImgArr, board.imageProfile.key]
            board.imageProfile = { location: 'http://localhost:5000/' + req.files[0].path, key: req.files[0].path }
        }
        // ถ้าไม่มีรุปภาพเก่าในระบบ ให้เพิ่มอย่างเดียว
        else {
            console.log("add images to db")
            board.imageProfile = { location: 'http://localhost:5000/' + req.files[0].path, key: req.files[0].path }
        }
    }
    // กรณีผู้ใช้ไม่ได้แก้ไขรูปภาพโปรไฟล์
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
        board.images = newImgArr
    }
    // ถ้าไม่มีรูปภาพที่อัพมาใหม่ แต่เป็นรูปภาพเก่าที่ถูกลบจากฐานข้อมูล
    else {
        console.log("have no images")
        // เพิ่มรุปภาพเก่าไปยังที่เดิม
        if (JSON.parse(oldImages).length !== 0) {
            let convOldImages = JSON.parse(oldImages);
            newImgArr = [...newImgArr, ...convOldImages]
        }

        // ย้ายข้อมูลรุปภาพที่จะถูกลบไปยังตัวแปรใหม่
        if (JSON.parse(delImages).length !== 0) {
            // console.log("delete images section 2")
            let convDelImages = JSON.parse(delImages)
            for (var x = 0; x < convDelImages.length; x++) {
                delImgArr = [...delImgArr, convDelImages[x].key]
            }
        }
        board.images = newImgArr
    }

    // ลบรูปภาพ
    if (delImgArr.length !== 0) {
        for (var i = 0; i < delImgArr.length; i++) {
            fs.unlink(delImgArr[i], err => {
                if (err) console.log(err);
                else console.log("delete image successfully")
            });
        }
    }

    // In case of AWS

    // if (delImgArr1.length !== 0) {
    //     for (var i = 0; i < delImgArr1.length; i++) {
    //         s3.deleteObject({
    //             Bucket: 'demo-utcc/profile',
    //             Key: delImgArr1[i]
    //         }, (err, data) => {
    //             if (err) console.log("can not delete an image in Aws S3")
    //             else console.log("delete an image in Aws S3 successfully.")
    //         })
    //     }
    // }

    try {
        await board.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save data.',
            500
        );
        return next(error);
    }

    res.status(201).json(board);
    // console.log(board);
    console.log("edit successfully")
}

// การเบิกบอร์ด
const requestBoard = async (req, res, next) => {
    const { username, status, description } = req.body;
    let total = Number(req.body.total);
    let board;
    let toolList = []
    // ตัวแปรไอดีประวัติการเบิกอุปกรณ์ทั้งหมดจะถูกเก็บไว้ในประวัติการเบิกบอร์ดนั้นด้วย
    let newToolsId = []

    // หาข้อมูลบอร์ด
    try {
        board = await Board.findById(req.params.bid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find board by id.',
            500
        );
        return next(error);
    }

    // คำนวณอุปกรณ์ที่ใช้แล้วทำการแก้ไข
    for (var round = 0; round < board.tools.length; round++) {
        let tool;
        let toolId = board.tools[round].id;
        let calTool;
        let cntTool;

        // หาข้อมูลอุปกรณ์
        try {
            tool = await Tool.findById(toolId);
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not find tool by id in process forLoop.',
                500
            );
            return next(error);
        }

        // ข้อมูลเลขที่การเบิกอุปกรณ์
        try {
            cntTool = await HistoryCnt.findById("608386350b3e6333741b6c01");
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not find cntNumber.',
                500
            );
            return next(error);
        }


        // ผลลัพธ์จำนวนอุปกรณ์ที่ใช้
        calTool = Number(board.tools[round].total) * total
        toolList = [...toolList,
        {
            id: tool._id,
            toolName: tool.toolName,
            toolCode: tool.toolCode,
            type: tool.type,
            category: tool.category,
            size: tool.size,
            total: calTool
        }
        ]

        let createActionEdit = [
            {
                code: cntTool.name + (cntTool.cntNumber + 1) + "-1",
                username: username,
                total: calTool,
                status: status,
                date: new Date().toString(),
                description: description,
                actionType: "requestFromBoard",
            }
        ]

        // บันทึกข้อมูลประวัติการเบิกของ
        let newHistory = new HistoryTool({
            code: cntTool.name + (cntTool.cntNumber + 1),
            tid: tool._id,
            toolName: tool.toolName,
            boardName: board.boardName,
            boardCode: board.boardCode,
            boardType: board.type,
            type: tool.type,
            category: tool.category,
            size: tool.size,
            date: new Date(),
            total: calTool,
            username: username,
            status: status,
            actionType: "requestFromBoard",
            exp: new Date(new Date().getTime() + (1000 * 60) * (1440 * 180)),
            description: description,
            actionEdit: createActionEdit
        })

        // บันทึกค่าอุปกรณ์ โดยนำค่าที่ต้องการใช้ มาลบกับ จำนวนอุปกรณ์ในสต๊อก
        tool.total = tool.total - calTool

        try {
            await tool.save()
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not save a tool in process forLoop.',
                500
            );
            return next(error);
        }

        // บันทึกข้อมูลเลขที่การเบิก
        cntTool.cntNumber = cntTool.cntNumber + 1
        try {
            await cntTool.save();
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not save cntHistory.',
                500
            );
            return next(error);
        }

        try {
            await newHistory.save()
            newToolsId = [...newToolsId, newHistory._id]
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not save a history-tool in process forLoop.',
                500
            );
            return next(error);
        }
    }

    let cntBoard;
    // ข้อมูลเลขที่การเบิกบอร์ด
    try {
        cntBoard = await HistoryCnt.findById("608386543e4e3458083fb2c0");
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find cntNumber.',
            500
        );
        return next(error);
    }

    let createActionEditBoard = [
        {
            code: cntBoard.name + (cntBoard.cntNumber + 1) + "-1",
            username: username,
            total: total,
            status: status,
            date: new Date().toString(),
            description: description,
            actionType: "request"
        }
    ]

    // บันทึกข้อมูลประวัติการเบิกของ
    let newHistoryBoard = new HistoryBoard({
        code: cntBoard.name + (cntBoard.cntNumber + 1),
        tid: newToolsId,
        bid: board._id,
        incompleteToolid: "none",
        boardName: board.boardName,
        boardCode: board.boardCode,
        date: new Date(),
        total: total,
        username: username,
        status: status,
        actionType: "requestFromBoard",
        exp: new Date(new Date().getTime() + (1000 * 60) * (1440 * 180)),
        description: description,
        actionEdit: createActionEditBoard,
        tools: toolList
    })

    board.total = board.total - total

    try {
        await newHistoryBoard.save()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save a history-board.',
            500
        );
        return next(error);
    }

    try {
        await board.save()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save a board.',
            500
        );
        return next(error);
    }

    // บันทึกข้อมูลเลขที่การเบิก
    cntBoard.cntNumber = cntBoard.cntNumber + 1
    try {
        await cntBoard.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save cntHistory.',
            500
        );
        return next(error);
    }

    res.status(201).json(board)
    console.log("request board successfully")
    // console.log(board)
    // console.log(newHistoryBoard)
}

// การเบิกบอร์ด กรณีของไม่ครบ
const requestBoardandIncompleteTool = async (req, res, next) => {
    const { username, status, description, image } = req.body;
    let total = Number(req.body.total);
    let board;
    let toolList = []
    let toolIncomplete = []
    let newToolsId = []
    // หาข้อมูลบอร์ดที่ต้องการแก้
    try {
        board = await Board.findById(req.params.bid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find board by id.',
            500
        );
        return next(error);
    }

    // คำนวณอุปกรณ์ที่ใช้แล้วทำการแก้ไข
    for (var round = 0; round < board.tools.length; round++) {
        let tool;
        let toolId = board.tools[round].id;
        let calTool;
        let cntTool
        // หาอุปกรณ์ที่ต้องการแก้
        try {
            tool = await Tool.findById(toolId);
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not find tool by id in process forLoop.',
                500
            );
            return next(error);
        }

        // ข้อมูลเลขที่การเบิกอุปกรณ์
        try {
            cntTool = await HistoryCnt.findById("608386350b3e6333741b6c01");
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not find cntNumber.',
                500
            );
            return next(error);
        }

        // ผลลัพธ์จำนวนอุปกรณ์ที่ใช้
        calTool = Number(board.tools[round].total) * total
        // เก็บค่าว่าใช้อุปกรณ์อะไรบ้างในการเบิกบอร์ด
        toolList = [...toolList,
        {
            id: tool._id,
            toolName: tool.toolName,
            toolCode: tool.toolCode,
            type: tool.type,
            category: tool.category,
            size: tool.size,
            total: calTool
        }
        ]

        // ค่าติดลบที่ได้ จะเอาไปเก็บในอุปกรณ์คงค้าง 150 -200 = -50
        let calSumTotal = tool.total - calTool
        let sumTotal;
        let newActionType;
        if (calSumTotal < 0) {
            sumTotal = tool.total
            tool.total = 0
            newActionType = "requestIncomplete"
        } else {
            sumTotal = calTool
            tool.total = tool.total - calTool
            newActionType = "requestFromBoard"
        }

        let createActionEdit = [
            {
                code: cntTool.name + (cntTool.cntNumber + 1) + "-1",
                username: username,
                total: sumTotal,
                status: status,
                date: new Date().toString(),
                description: description,
                actionType: newActionType
            }
        ]

        // บันทึกข้อมูลประวัติการเบิกของครั้งแรกโดยไม่ได้เก็บข้อมูลไอดีของอุปกรณ์ไม่ครบ
        let newHistory = new HistoryTool({
            code: cntTool.name + (cntTool.cntNumber + 1),
            tid: tool._id,
            toolName: tool.toolName,
            boardName: board.boardName,
            boardCode: board.boardCode,
            boardType: board.type,
            type: tool.type,
            category: tool.category,
            size: tool.size,
            date: new Date(),
            total: sumTotal,
            username: username,
            status: status,
            actionType: newActionType,
            exp: new Date(new Date().getTime() + (1000 * 60) * (1440 * 180)),
            description: description,
            actionEdit: createActionEdit
        })

        try {
            await tool.save()
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not save a tool in process forLoop.',
                500
            );
            return next(error);
        }

        // บันทึกข้อมูลเลขที่การเบิก
        cntTool.cntNumber = cntTool.cntNumber + 1
        try {
            await cntTool.save();
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not save cntHistory.',
                500
            );
            return next(error);
        }


        try {
            await newHistory.save()
            newToolsId = [...newToolsId, newHistory._id]
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not save a history-tool in process forLoop.',
                500
            );
            return next(error);
        }

        // เก็บข้อมูลว่า ในการเบิกบอร์ดครั้งนี้ขาดอุปกรณ์อะไรบ้าง
        if (calSumTotal < 0) {
            let temArr = {
                tid: tool._id,
                htid: newHistory._id,
                toolName: tool.toolName,
                total: calSumTotal,
                type: tool.type,
                category: tool.category,
                size: tool.size
            }
            toolIncomplete = [...toolIncomplete, temArr]
        }
    }

    // บันทึกข้อมูลไปยัง ตารางอุปกรณ์ไม่ครบ
    let createIncompleteTool = new IncompleteTool({
        bid: board._id,
        username: username,
        status: status,
        imageProfile: image,
        boardName: board.boardName,
        boardCode: board.boardCode,
        date: new Date().toString(),
        tools: toolIncomplete,
        actionType: "requestFromBoard"
    })

    try {
        await createIncompleteTool.save()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save a incompleTool.',
            500
        );
        return next(error);
    }

    // ทำการเอาไอดีของตารางอุปกรณ์ไม่ครบ ไปเพิ่มในข้อมูลประวัติการเบิกอุปกรณ์ สำหรับ อุปกรณ์ที่มีไม่พอ
    // for (var round = 0; round < createIncompleteTool.tools.length; round++) {
    //     let incomId = createIncompleteTool.tools[round].htid
    //     let findhisTool;
    //     try {
    //         findhisTool = await HistoryTool.findById(incomId)
    //     } catch (err) {
    //         const error = new HttpError(
    //             'Something went wrong, could not save a incompleTool.',
    //             500
    //         );
    //         return next(error);
    //     }
    //     findhisTool.incompleteToolid = createIncompleteTool._id

    //     try {
    //         await findhisTool.save()
    //     } catch (err) {
    //         const error = new HttpError(
    //             'Something went wrong, could not save a id incomplete in db of history-tool.',
    //             500
    //         );
    //         return next(error);
    //     }
    // }

    let cntBoard;
    // ข้อมูลเลขที่การเบิกบอร์ด
    try {
        cntBoard = await HistoryCnt.findById("608386543e4e3458083fb2c0");
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find cntNumber.',
            500
        );
        return next(error);
    }

    let createActionEditBoard = [
        {
            code: cntBoard.name + (cntBoard.cntNumber + 1) + "-1",
            username: username,
            total: total,
            status: status,
            date: new Date().toString(),
            description: description,
            actionType: "request"
        }
    ]

    // บันทึกข้อมูลประวัติการเบิกของและเก็บข้อมูลไอดีของตารางอุปกรณ์ไม่ครบ
    let newHistoryBoard = new HistoryBoard({
        code: cntBoard.name + (cntBoard.cntNumber + 1),
        bid: board._id,
        tid: newToolsId,
        incompleteToolid: createIncompleteTool._id,
        boardName: board.boardName,
        boardCode: board.boardCode,
        date: new Date(),
        total: total,
        username: username,
        status: status,
        actionType: "requestFromBoard",
        exp: new Date(new Date().getTime() + (1000 * 60) * (1440 * 180)),
        description: description,
        actionEdit: createActionEditBoard,
        tools: toolList
    })

    board.total = board.total - total

    try {
        await newHistoryBoard.save()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save a history-board.',
            500
        );
        return next(error);
    }

    try {
        await board.save()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save a board.',
            500
        );
        return next(error);
    }

    // บันทึกข้อมูลเลขที่การเบิก
    cntBoard.cntNumber = cntBoard.cntNumber + 1
    try {
        await cntBoard.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save cntHistory.',
            500
        );
        return next(error);
    }


    res.status(201).json(board)
    console.log("request board and Incomplete successfully")
    // console.log(newHistoryBoard)
}

// การยกเลิกการเบิกบอร์ด
const cancelRequestBoard = async (req, res, next) => {
    const { username, description, status } = req.body;

    // หาข้อมูลประวัติการเบิกบอร์ด
    let histboard;
    try {
        histboard = await HistoryBoard.findById(req.params.htbid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a histboard.',
            500
        );
        return next(error);
    }

    // เริ่มค้นหาข้อมูล ประวัติการเบิกอุปกรณ์
    for (var round = 0; round < histboard.tid.length; round++) {
        let histool;
        let tool;
        try {
            histool = await HistoryTool.findById(histboard.tid[round]);
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not find a histool in forLoop.',
                500
            );
            return next(error);
        }

        if (histool.isDeleted === false) {
            // เริ่มขั้นตอนการคืนอุปกรณ์ไปยังสต๊อก
            try {
                tool = await Tool.findById(histool.tid);
            } catch (err) {
                const error = new HttpError(
                    'Something went wrong, could not find a tool in forLoop.',
                    500
                );
                return next(error);
            }

            let createActionEditTool =
            {
                code: histool.code + "-2",
                username: username,
                total: 0,
                status: status,
                date: new Date().toString(),
                description: description,
                actionType: "restore",
            }


            tool.total = tool.total + histool.total
            histool.actionEdit = [...histool.actionEdit, createActionEditTool]
            histool.total = 0

            // หลังจากแก้ไขข้อมูลแล้วให้เริ่มบันทึกข้อมูล
            try {
                await tool.save()
            } catch (err) {
                const error = new HttpError(
                    'Something went wrong, could not save a tool in process forLoop.',
                    500
                );
                return next(error);
            }

            try {
                await histool.save()
            } catch (err) {
                const error = new HttpError(
                    'Something went wrong, could not save a histool in process forLoop.',
                    500
                );
                return next(error);
            }
        } else {
            console.log("no data tool")
        }
    }

    // เริ่มแก้ไขข้อมูลบอร์ด
    let board;
    try {
        board = await Board.findById(histboard.bid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a board.',
            500
        );
        return next(error);
    }

    board.total = board.total + histboard.total

    try {
        await board.save()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save a board.',
            500
        );
        return next(error);
    }

    // เริ่มแก้ไขข้อมูลประวัติการเบิกบอร์ด
    let createActionEditBoard =
    {
        code: histboard.code + "-2",
        username: username,
        total: 0,
        status: status,
        date: new Date().toString(),
        description: description,
        actionType: "restore"
    }


    histboard.total = 0;
    histboard.actionEdit = [...histboard.actionEdit, createActionEditBoard]

    try {
        await histboard.save()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save a hisboard.',
            500
        );
        return next(error);
    }

    // ส่งข้อมูลไปยัง frontend
    let histbList;
    try {
        histbList = await HistoryBoard.find();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetch data of hisboard.',
            500
        );
        return next(error);
    }

    res.status(200).json(histbList);
    console.log("restore succussfully")
}

// การยกเลิกเบิกบอร์ด กรณี อุปกรณ์ไม่ครบ
const cancelRequestBoardandIncomplete = async (req, res, next) => {
    const { username, status, toolsId, description, incompleteId } = req.body
    let histboard;
    try {
        histboard = await HistoryBoard.findById(req.params.htbid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a histboard.',
            500
        );
        return next(error);
    }

    for (var round = 0; round < toolsId.length; round++) {
        let histool;
        let sum;
        // หาค่าจำนวนอุปกรณ์ที่ใช้ไปก่อนหน้านี้
        try {
            histool = await HistoryTool.findById(toolsId[round]);
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not find a history-tool in forLoop.',
                500
            );
            return next(error);
        }

        if (histool.isDeleted === false) {

            // หาอุปกรณ์ต่อโดยใช้ข้อมูลในประวัติอุปกรณ์ในการค้นหา
            try {
                tool = await Tool.findById(histool.tid);
            } catch (err) {
                const error = new HttpError(
                    'Something went wrong, could not find a tool in forLoop.',
                    500
                );
                return next(error);
            }

            let createActionEditTool =
            {
                code: histool.code + "-" + (histool.actionEdit.length + 1),
                username: username,
                total: 0,
                status: status,
                date: new Date().toString(),
                description: description,
                actionType: "restore",
            }


            // คืนของไปยังสต๊อก
            sum = tool.total + histool.total
            tool.total = sum
            histool.actionEdit = [...histool.actionEdit, createActionEditTool]
            histool.total = 0

            // หลังจากแก้ไขข้อมูลแล้วให้เริ่มบันทึกข้อมูล
            try {
                await tool.save()
            } catch (err) {
                const error = new HttpError(
                    'Something went wrong, could not save a tool in process forLoop.',
                    500
                );
                return next(error);
            }

            try {
                await histool.save()
            } catch (err) {
                const error = new HttpError(
                    'Something went wrong, could not save a histool in process forLoop.',
                    500
                );
                return next(error);
            }
        } else {
            console.log("no data tool")
        }
    }

    // ลบหน้าอุปกรณ์คงค้าง
    let incompleteBoard;
    // console.log(incompleteId)
    try {
        incompleteBoard = await IncompleteTool.findById(incompleteId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a tool in forLoop.',
            500
        );
        return next(error);
    }

    try {
        await incompleteBoard.remove()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete a incompleteBoard.',
            500
        );
        return next(error);
    }

    // แก้ไขข้อมูลหน้ารายการอุปกรณ์
    let board;
    try {
        board = await Board.findById(histboard.bid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a board.',
            500
        );
        return next(error);
    }

    board.total = board.total + histboard.total

    try {
        await board.save()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save a board.',
            500
        );
        return next(error);
    }

    // เริ่มแก้ไขข้อมูลประวัติการเบิกบอร์ด
    let createActionEditBoard =
    {
        code: histboard.code + "-" + (histboard.actionEdit.length + 1),
        username: username,
        total: 0,
        status: status,
        date: new Date().toString(),
        description: description,
        actionType: "restore"
    }


    histboard.total = 0;
    histboard.actionEdit = [...histboard.actionEdit, createActionEditBoard]

    try {
        await histboard.save()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save a hisboard.',
            500
        );
        return next(error);
    }

    // ส่งข้อมูลไปยัง frontend
    let histbList;
    try {
        histbList = await HistoryBoard.find();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetch data of hisboard.',
            500
        );
        return next(error);
    }

    res.status(200).json(histbList);
    console.log("restore succussfully")
}

// การคืนของ กรณี อุปกรณ์ไม่ครบ
const updateIncompleteBoard = async (req, res, next) => {
    const { tid, htid, description, username, status, tools } = req.body;
    let total = Number(req.body.total)
    let tool;
    let histool;
    let incompleteBoard;

    // หาข้อมูลอุปกรณ์
    try {
        tool = await Tool.findById(tid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a tool.',
            500
        );
        return next(error);
    }

    try {
        histool = await HistoryTool.findById(htid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a history-tool.',
            500
        );
        return next(error);
    }

    try {
        incompleteBoard = await IncompleteTool.findById(req.params.incompleteId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a IncompleteBoard.',
            500
        );
        return next(error);
    }

    // เริ่มแก้ไขจำนวนอุปกรณ์ในสต๊อก
    let calTotalTool = tool.total - total
    let newAction;
    if (calTotalTool !== 0) {
        newAction = "requestIncomplete"
    } else {
        newAction = "requestFromBoard"
    }
    // console.log(calTotalTool)
    tool.total = calTotalTool

    // เริ่มแก้ไขประวัติการเบิกบอร์ด
    let createActionEdit =
    {
        code: histool.code + "-" + (histool.actionEdit.length + 1),
        username: username,
        total: total,
        status: status,
        date: new Date().toString(),
        description: description,
        actionType: newAction
    }

    let calHistool = histool.total + total
    // console.log(calHistool)
    histool.total = calHistool
    histool.actionEdit = [...histool.actionEdit, createActionEdit]

    // เริ่มแก้ไขข้อมูลหน้าอุปกรณ์ไม่ครบ
    if (tools.length > 0) {
        incompleteBoard.tools = tools
        // console.log("leng > 0")
        // console.log(tools)
        try {
            await incompleteBoard.save()
            console.log("save success")
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not save a incompleteBoard.',
                500
            );
            return next(error);
        }


    } else if (tools.length === 0) {
        console.log("leng = 0")
        try {
            await incompleteBoard.remove()
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not delete a incompleteBoard.',
                500
            );
            return next(error);
        }
    }

    try {
        await tool.save()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save a tool.',
            500
        );
        return next(error);
    }

    try {
        await histool.save()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save a history-tool.',
            500
        );
        return next(error);
    }

    let incompleteBoardList;
    try {
        incompleteBoardList = await IncompleteTool.find();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching a incomplete-tool.',
            500
        );
        return next(error);
    }

    res.status(200).json(incompleteBoardList);
    console.log("update incompleteBoard successfully")
}

// การลบรายการบอร์ด
const deleteBoard = async (req, res, next) => {
    let boardId = req.params.bid;

    // หาข้อมูลบอร์ด
    let board;
    try {
        board = await Board.findById(boardId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find board by id.',
            500
        );
        return next(error);
    }

    // // ลบข้อมูลอุปกรณ์ที่อยู่ในประวัติการเบิกหรือเพิ่มอุปกรณ์
    // let hisboard;
    // try {
    //     hisboard = await HistoryBoard.find();
    // } catch (err) {
    //     const error = new HttpError(
    //         'Something went wrong, could not fetching data of history-tool.',
    //         500
    //     );
    //     return next(error);
    // }

    // for (var round = 0; round < hisboard.length; round++) {
    //     if (hisboard[round].bid === boardId) {
    //         hisboard[round].isDeleted = true

    //         // บันทึกข้อมูลอุปกรณ์
    //         try {
    //             await hisboard[round].save();
    //         } catch (err) {
    //             const error = new HttpError(
    //                 'Something went wrong, could not save data history-board.',
    //                 500
    //             );
    //             return next(error);
    //         }
    //     }
    // }

    // // ลบข้อมูลอุปกรณ์ที่อยู่ในหน้าอุปกรณ์คงค้าง
    // let incomplete;
    // try {
    //     incomplete = await IncompleteTool.find();
    // } catch (err) {
    //     const error = new HttpError(
    //         'Something went wrong, could not fetching data of incomplete board.',
    //         500
    //     );
    //     return next(error);
    // }

    // for (var round = 0; round < incomplete.length; round++) {
    //     if (incomplete[round].bid === boardId) {
    //         // console.log("delete incomplete", incomplete[round].tools.length)
    //         try {
    //             await incomplete[round].remove();
    //         } catch (err) {
    //             const error = new HttpError(
    //                 'Something went wrong, could not delete data tool.',
    //                 500
    //             );
    //             return next(error);
    //         }
    //     }
    // }

    // ลบรูปภาพของอุปกรณ์
    if (board.images.length !== 0) {
        for (var i = 0; i < board.images.length; i++) {
            fs.unlink(board.images[i].key, err => {
                if (err) console.log("can not find path of images");
                else console.log("delete images successfully")
            });
        }
    }

    // ลบรูปภาพโปรไฟล์ของอุปกรณ์
    if (board.imageProfile.key !== false) {
        fs.unlink(board.imageProfile.key, err => {
            if (err) console.log("can not find path of image");
            else console.log("delete image successfully")
        });
    }

    try {
        await board.remove();
        console.log("delete board successfully")
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete board by id.',
            500
        );
        return next(error);
    }

    res.json(board)
}

exports.getAllBoards = getAllBoards;
exports.getAllHistoryBoards = getAllHistoryBoards;
exports.getBoard = getBoard;
exports.getIncompleteBoard = getIncompleteBoard;
exports.editBoard = editBoard
exports.actionBoard = actionBoard;
exports.requestBoard = requestBoard;
exports.requestBoardandIncompleteTool = requestBoardandIncompleteTool;
exports.createBoard = createBoard;
exports.cancelRequestBoard = cancelRequestBoard;
exports.cancelRequestBoardandIncomplete = cancelRequestBoardandIncomplete;
exports.updateIncompleteBoard = updateIncompleteBoard;
exports.deleteBoard = deleteBoard;