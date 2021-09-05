const express = require("express");
const {
  getAllTypeTool,
  addTypeTool,
  editTypeTool,
  deleteTypeTool,
  getTypeTool,
  addCategoryTool,
  deleteCategoryTool,
  editCategoryTool,
} = require("../controllers/stt-controllers");
// const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/lists", getAllTypeTool);
router.get("/list/:tid", getTypeTool);

router.post("/new/type", addTypeTool);
router.post("/new/category/:tid", addCategoryTool);

router.put("/type/:tid", editTypeTool);
router.put("/category/:tid/:cid", editCategoryTool);

router.delete("/type/:tid", deleteTypeTool);
router.delete("/category/:tid/:cid", deleteCategoryTool);

module.exports = router;
