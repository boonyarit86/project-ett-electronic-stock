const Project = require("../models/history-project");
const HistoryTool = require("../models/history-tool");
const HistoryProject = require("../models/history-project");
const Tool = require("../models/tool");
const HttpError = require('../models/http-error');
const fs = require("fs")
const IncompleteTool = require("../models/incomplete-tool");
const HistoryCnt = require("../models/history-cnt");


// const aws = require('aws-sdk');

// You can get those keys from My Security from Credentials of Aws S3
// aws.config.update({
//     accessKeyId: process.env.accessKeyId,
//     secretAccessKey: process.env.secretAccessKey
// });

// const s3 = new aws.S3();

// รับข้อมูลประวัติการเบิกโปรเจคทั้งหมด
const getAllHistoryProjects = async (req, res, next) => {
    let historyProjects;
    try {
        historyProjects = await HistoryProject.find();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching history board.',
            500
        );
        return next(error);
    }

    // ลบข้อมูลที่หมดอายุ
    for (var round = 0; round < historyProjects.length; round++) {
        let expHistory = new Date(historyProjects[round].exp).getTime()
        let currentDate = new Date().getTime();
        if (expHistory < currentDate) {
            try {
                await historyProjects[round].remove()
            } catch (err) {
                const error = new HttpError(
                    'Something went wrong, could not remove history-project that expired.',
                    500
                );
                return next(error);
            }
        }
    }

    // เรียงลำดับข้อมูล โดยเอาวันที่ล่าสุดขึ้นมาก่อน
    let responseData = []
    for (var round = 0; round < historyProjects.length; round++) {
        let index = historyProjects.length - 1 - round
        responseData = [...responseData, historyProjects[index]]
    }

    res.json(responseData);
}

// รับข้อมูลการเบิกโปรเจคที่ผู้ใช้เลือก
const getProject = async (req, res, next) => {
    let project;
    try {
        project = await HistoryProject.findById(req.params.pid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetching data.',
            500
        );
        return next(error);
    }
    res.json(project);
}

// การสร้างโปรเจคใหม่
const createProject = async (req, res, next) => {
    let newToolsId = []
    let toolList = []
    const { projectName, projectCode, type, images, imageProfile,
        description, oldImages, delImages, username, status,
        companyName, startDate, endDate } = req.body;
    let total = Number(req.body.total)
    let tools = JSON.parse(req.body.tools)

    // ตัวแปรรูปภาพที่จะถูกลบ
    // let delImgArr = []

    // เริ่มจัดการข้อมูลรูปภาพก่อน
    let newImageProfile;

    // ผู้ใช้งานกำหนดรูปภาพใหม่
    if (imageProfile === "true") {
        // ถ้าไม่มีรุปภาพเก่าในระบบ ให้เพิ่มอย่างเดียว
        console.log("add images to db")
        newImageProfile = { location: 'http://localhost:5000/' + req.files[0].path, key: req.files[0].path }
    }
    else if (imageProfile === "false") {
        console.log("default Image")
        newImageProfile = { location: "/images/profile.png", key: false }
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
    }


    // คำนวณอุปกรณ์ที่ใช้แล้วทำการแก้ไข
    for (var round = 0; round < tools.length; round++) {
        let tool;
        let toolId = tools[round].id;
        let cntTool;

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
        // calTool = Number(board.tools[round].total) * total
        toolList = [...toolList,
        {
            id: tool._id,
            toolName: tool.toolName,
            toolCode: tool.toolCode,
            type: tool.type,
            category: tool.category,
            size: tool.size,
            total: Number(tools[round].total),
            imageProfile: tool.imageProfile
        }
        ]

        let createActionEdit = [
            {
                code: cntTool.name + (cntTool.cntNumber + 1) + "-1",
                username: username,
                total: Number(tools[round].total),
                status: status,
                date: new Date().toString(),
                description: description,
                actionType: "requestFromProject",
            }
        ]

        // บันทึกข้อมูลประวัติการเบิกของ
        let newHistory = new HistoryTool({
            code: cntTool.name + (cntTool.cntNumber + 1),
            tid: tool._id,
            toolName: tool.toolName,
            boardName: projectName,
            boardCode: projectCode,
            boardType: type,
            type: tool.type,
            category: tool.category,
            size: tool.size,
            date: new Date(),
            total: Number(tools[round].total),
            username: username,
            status: status,
            actionType: "requestFromProject",
            exp: new Date(new Date().getTime() + (1000 * 60) * (1440 * 180)),
            description: description,
            actionEdit: createActionEdit
        })

        // บันทึกค่าอุปกรณ์ โดยนำค่าที่ต้องการใช้ มาลบกับ จำนวนอุปกรณ์ในสต๊อก
        tool.total = tool.total - Number(tools[round].total)

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

    let cntProject;
    // ข้อมูลเลขที่การเบิกบอร์ด
    try {
        cntProject = await HistoryCnt.findById("6083865f43d263195cee4f43");
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find cntNumber.',
            500
        );
        return next(error);
    }

    let createActionEditProject = [
        {
            code: cntProject.name + (cntProject.cntNumber + 1) + "-1",
            username: username,
            total: total,
            status: status,
            date: new Date().toString(),
            description: description,
            actionType: "request"
        }
    ]



    let newProject = new Project({
        code: cntProject.name + (cntProject.cntNumber + 1),
        tid: newToolsId,
        projectName: projectName,
        projectCode: projectCode,
        incompleteToolid: "none",
        type: type,
        companyName: companyName,
        startDate: startDate,
        endDate: endDate,
        date: new Date(),
        total: total,
        imageProfile: newImageProfile,
        images: newImgArr,
        username: username,
        status: status,
        actionType: "requestFromProject",
        exp: new Date(new Date().getTime() + (1000 * 60) * (1440 * 180)),
        description: description,
        actionEdit: createActionEditProject,
        tools: tools
    })


    try {
        await newProject.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save data.',
            500
        );
        return next(error);
    }

    // บันทึกข้อมูลเลขที่การเบิก
    cntProject.cntNumber = cntProject.cntNumber + 1
    try {
        await cntProject.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save cntHistory.',
            500
        );
        return next(error);
    }

    res.status(201).json(newProject);
    // console.log(newProject);
    console.log("create project successfully")
}

// การสร้างโปรเจค กรณีอุปกรณ์ไม่ครบ
const createProjectandIncomplete = async (req, res, next) => {
    let newToolsId = []
    let toolList = []
    let toolIncomplete = []
    // console.log(req.body.oldImages)
    const { projectName, projectCode, type, images, imageProfile,
        description, oldImages, delImages, username, status,
        companyName, startDate, endDate, image2 } = req.body;
    let total = Number(req.body.total)
    let tools = JSON.parse(req.body.tools)

    // ตัวแปรรูปภาพที่จะถูกลบ
    // let delImgArr = []

    // เริ่มจัดการข้อมูลรูปภาพก่อน
    let newImageProfile;

    // ผู้ใช้งานกำหนดรูปภาพใหม่
    if (imageProfile === "true") {
        // ถ้าไม่มีรุปภาพเก่าในระบบ ให้เพิ่มอย่างเดียว
        console.log("add images to db")
        newImageProfile = { location: 'http://localhost:5000/' + req.files[0].path, key: req.files[0].path }
    }
    else if (imageProfile === "false") {
        console.log("default Image")
        newImageProfile = { location: "/images/profile.png", key: false }
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
    }


    // คำนวณอุปกรณ์ที่ใช้แล้วทำการแก้ไข
    for (var round = 0; round < tools.length; round++) {
        let tool;
        let toolId = tools[round].id;
        let calTool;
        let cntTool;
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
        calTool = Number(tools[round].total)
        toolList = [...toolList,
        {
            id: tool._id,
            toolName: tool.toolName,
            toolCode: tool.toolCode,
            type: tool.type,
            category: tool.category,
            size: tool.size,
            total: calTool,
            imageProfile: tool.imageProfile
        }
        ]

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
            newActionType = "requestFromProject"
        }

        let createActionEdit = [
            {
                code: cntTool.name + (cntTool.cntNumber + 1) + "-1",
                username: username,
                total: sumTotal,
                status: status,
                date: new Date().toString(),
                description: description,
                actionType: newActionType,
            }
        ]

        // บันทึกข้อมูลประวัติการเบิกของ
        let newHistory = new HistoryTool({
            code: cntTool.name + (cntTool.cntNumber + 1),
            tid: tool._id,
            toolName: tool.toolName,
            boardName: projectName,
            boardCode: projectCode,
            boardType: type,
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
        bid: "none",
        username: username,
        status: status,
        imageProfile: image2,
        boardName: projectName,
        boardCode: projectCode,
        date: new Date().toString(),
        tools: toolIncomplete,
        actionType: "requestFromProject"
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

    let cntProject;
    // ข้อมูลเลขที่การเบิกบอร์ด
    try {
        cntProject = await HistoryCnt.findById("6083865f43d263195cee4f43");
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find cntNumber.',
            500
        );
        return next(error);
    }

    let createActionEditProject = [
        {
            code: cntProject.name + (cntProject.cntNumber + 1) + "-1",
            username: username,
            total: total,
            status: status,
            date: new Date().toString(),
            description: description,
            actionType: "request"
        }
    ]

    let newProject = new Project({
        code: cntProject.name + (cntProject.cntNumber + 1),
        tid: newToolsId,
        projectName: projectName,
        projectCode: projectCode,
        incompleteToolid: createIncompleteTool._id,
        type: type,
        companyName: companyName,
        startDate: startDate,
        endDate: endDate,
        date: new Date(),
        total: total,
        imageProfile: newImageProfile,
        images: newImgArr,
        username: username,
        status: status,
        actionType: "requestFromProject",
        exp: new Date(new Date().getTime() + (1000 * 60) * (1440 * 180)),
        description: description,
        actionEdit: createActionEditProject,
        tools: tools
    })

    // บันทึกข้อมูลเลขที่การเบิก
    cntProject.cntNumber = cntProject.cntNumber + 1
    try {
        await cntProject.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save cntHistory.',
            500
        );
        return next(error);
    }

    try {
        await newProject.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save data.',
            500
        );
        return next(error);
    }

    res.status(201).json(newProject);
    // console.log(newProject);
    console.log("create project successfully")
}

// การยกเลิกเบิกโปรเจค
const cancelRequestProject = async (req, res, next) => {
    const { username, description, status } = req.body;
    // let tid = JSON.parse()
    let project;
    try {
        project = await HistoryProject.findById(req.params.pid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a project.',
            500
        );
        return next(error);
    }

    // เริ่มค้นหาข้อมูล ประวัติการเบิกอุปกรณ์
    for (var round = 0; round < project.tid.length; round++) {
        let histool;
        let tool;
        try {
            histool = await HistoryTool.findById(project.tid[round]);
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
                code: histool.code + "-" + (histool.actionEdit.length + 1),
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
            console.log("no data")
        }
    }

    // เริ่มแก้ไขข้อมูลประวัติการเบิกบอร์ด
    let createActionEditProject =
    {
        code: project.code + "-" + (project.actionEdit.length + 1),
        username: username,
        total: 0,
        status: status,
        date: new Date().toString(),
        description: description,
        actionType: "restore"
    }


    project.total = 0;
    project.actionEdit = [...project.actionEdit, createActionEditProject]

    try {
        await project.save()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save a hisboard.',
            500
        );
        return next(error);
    }

    // ส่งข้อมูลไปยัง frontend
    let projectList;
    try {
        projectList = await HistoryProject.find();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetch data of hisboard.',
            500
        );
        return next(error);
    }

    res.status(200).json(projectList);
    console.log("restore succussfully")
}

// การคืนของ กรณี อุปกรณ์ไม่ครบ
const updateIncompleteProject = async (req, res, next) => {
    const { tid, htid, description, username, status, tools } = req.body;
    let total = Number(req.body.total)

    let tool;
    let histool;
    let incompleteBoard;

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
        newAction = "requestFromProject"
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

// การยกเลิกเบิกโปรเจค กรณี อุปกรณ์ไม่ครบ
const cancelRequestProjectandIncomplete = async (req, res, next) => {
    // console.log("backend work")
    const { username, status, toolsId, description, incompleteId } = req.body
    let histProject;
    try {
        histProject = await Project.findById(req.params.pid);
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

        // หาอุปกรณ์ต่อโดยใช้ข้อมูลในประวัติอุปกรณ์ในการค้นหา
        if (histool.isDeleted === false) {
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


            // // คืนของไปยังสต๊อก
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
            // console.log("have data")
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

    // // เริ่มแก้ไขข้อมูลประวัติการเบิกบอร์ด
    let createActionEditProject =
    {
        code: histProject.code + "-" + (histProject.actionEdit.length + 1),
        username: username,
        total: 0,
        status: status,
        date: new Date().toString(),
        description: description,
        actionType: "restore"
    }


    histProject.total = 0;
    histProject.actionEdit = [...histProject.actionEdit, createActionEditProject]

    try {
        await histProject.save()
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not save a hisboard.',
            500
        );
        return next(error);
    }

    // // ส่งข้อมูลไปยัง frontend
    let histpList;
    try {
        histpList = await Project.find();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not fetch data of hisproject.',
            500
        );
        return next(error);
    }

    res.status(200).json(histpList);
    console.log("restore succussfully")
}

exports.getProject = getProject
exports.createProject = createProject
exports.createProjectandIncomplete = createProjectandIncomplete
exports.getAllHistoryProjects = getAllHistoryProjects
exports.cancelRequestProject = cancelRequestProject
exports.updateIncompleteProject = updateIncompleteProject
exports.cancelRequestProjectandIncomplete = cancelRequestProjectandIncomplete