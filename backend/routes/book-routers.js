const express = require("express");
const Book = require("../modules/book");
const router = express.Router();
const io = require("../index");

router.get("/lists", async (req, res) => {
  //  console.log(io)
  // console.log("work")
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.send(error);
  }
});

router.post("/", async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    const books = await Book.find();
    io.emit("order-added", books);
    res.status(201).json(books);
  } catch (error) {
    res.send(error);
  }
});

router.put("/:oid", async (req, res) => {
  try {
    const book = await Book.findById(req.params.oid);
    if (!book) return res.status(401);
    if(book.name === "sold") {
      book.name = "Coming Soon";
    } else {
      book.name = "sold";
    }
    await book.save();
    const books = await Book.find();
    io.emit("order-edit", books);
    res.status(201).send(books);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
