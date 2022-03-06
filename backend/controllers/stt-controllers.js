const SttModel = require("../models/setting-tool-type");
const catchError = require("../utils/catchError");

const getAllTypeTool = async (req, res) => {
    try {
        const Alldata = await SttModel.find();
        res.status(200).json(Alldata);
    } catch (error) {
        catchError(res, "ไม่สามารถเรียกข้อมูลได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง", 500, error);
    }
}

const getTypeTool = async (req, res) => {
    let typeToolId = req.params.tid;
    try {
        const data = await SttModel.findById(typeToolId);
        if(!data) return res.status(401).send("ไม่พบข้อมูลในฐานข้อมูล");
        res.status(200).json(data);
    } catch (error) {
        catchError(res, "ไม่สามารถเรียกข้อมูลได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง", 500, error);
    }
}

const addTypeTool = async (req, res) => {
    let newType = req.body.type.toLowerCase();
    try {
        if(newType.length === 0) return res.status(401).send("ตัวหนังสือต้องมีอย่างน้อย 1 ตัว");
        const AllData = await SttModel.find();
        const isType = await AllData.filter((item) => item.type === newType).length > 0;
        if(isType) return res.status(401).send("มีข้อมูลนี้แล้วในฐานข้อมูล");
        const newStt = new SttModel({ type: newType })
        await newStt.save();
        res.status(201).json(newStt)
    } catch (error) {
        catchError(res, "ไม่สามารถเพิ่มข้อมูลได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง", 500, error);
    }
}

const addCategoryTool = async (req, res) => {
    let typeToolId = req.params.tid;
    let newCategory = req.body.category.toLowerCase();
    try {
        if(newCategory.length === 0) return res.status(401).send("ตัวหนังสือต้องมีอย่างน้อย 1 ตัว");
        let data = await SttModel.findById(typeToolId);
        if(!data) return res.status(401).send("ไม่พบข้อมูลในฐานข้อมูล");
        const isCategory = await data.categorys.filter((item) => item.category === newCategory).length > 0;
        if(isCategory) return res.status(401).send("มีข้อมูลนี้แล้วในฐานข้อมูล");
        await data.categorys.unshift({ category: newCategory})
        await data.save();
        res.status(201).json(data.categorys)
    } catch (error) {
        catchError(res, "ไม่สามารถเพิ่มข้อมูลได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง", 500, error);
    }
}

const editTypeTool = async (req, res) => {
    let typeToolId = req.params.tid;
    let newType = req.body.type.toLowerCase();
    try {
        if(newType.length === 0) return res.status(401).send("ตัวหนังสือต้องมีอย่างน้อย 1 ตัว");
        let data = await SttModel.findById(typeToolId);
        if(!data) return res.status(401).send("ไม่พบข้อมูลในฐานข้อมูล");
        const AllData = await SttModel.find();
        const isType = await AllData.filter((item) => item.type === newType).length > 0;
        if(isType) return res.status(401).send("มีข้อมูลนี้แล้วในฐานข้อมูล");
        data.type = newType;
        await data.save();
        res.status(200).send("แก้ไขรายการสำเร็จ")
    } catch (error) {
        catchError(res, "ไม่สามารถแก้ไขข้อมูลได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง", 500, error);
    }
}

const editCategoryTool = async (req, res) => {
    let typeToolId = req.params.tid;
    let categoryToolId = req.params.cid;
    let newCategory = req.body.category.toLowerCase();
    try {
        if(newCategory.length === 0) return res.status(401).send("ตัวหนังสือต้องมีอย่างน้อย 1 ตัว");
        let data = await SttModel.findById(typeToolId);
        if(!data) return res.status(401).send("ไม่พบข้อมูลในฐานข้อมูล");
        const categoryIndex = await data.categorys.map((item) => item._id.toString()).indexOf(categoryToolId);
        data.categorys[categoryIndex].category = newCategory; 
        await data.save();
        res.status(200).send("แก้ไขรายการสำเร็จ")
    } catch (error) {
        catchError(res, "ไม่สามารถแก้ไขข้อมูลได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง", 500, error);
    }
}

const deleteTypeTool = async (req, res) => {
    let typeToolId = req.params.tid;
    try {
        let data = await SttModel.findById(typeToolId);
        if(!data) return res.status(401).send("ไม่พบข้อมูลในฐานข้อมูล");
        await data.remove();
        res.status(200).send("ลบรายการสำเร็จ")
    } catch (error) {
        catchError(res, "ไม่สามารถลบข้อมูลได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง", 500, error);
    }
}

const deleteCategoryTool = async (req, res) => {
    let typeToolId = req.params.tid;
    let categoryToolId = req.params.cid;
    
    try {
        let data = await SttModel.findById(typeToolId);
        if(!data) return res.status(401).send("ไม่พบข้อมูลในฐานข้อมูล");
        const removeCategoryTool = await data.categorys.map((item) => item._id.toString()).indexOf(categoryToolId)

        await data.categorys.splice(removeCategoryTool, 1)
        await data.save();
        res.status(200).send("ลบรายการสำเร็จ")
    } catch (error) {
        catchError(res, "ไม่สามารถลบข้อมูลได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง", 500, error);
    }
}

exports.getAllTypeTool = getAllTypeTool;
exports.getTypeTool = getTypeTool;
exports.addTypeTool = addTypeTool;
exports.addCategoryTool = addCategoryTool;
exports.editTypeTool = editTypeTool;
exports.editCategoryTool = editCategoryTool;
exports.deleteTypeTool = deleteTypeTool;
exports.deleteCategoryTool = deleteCategoryTool;
