const express = require('express');
const mongoose = require('mongoose');
const usersRoutes = require("./routes/users-routes");
const cors = require('cors')
// const toolsRoutes = require("./routes/tools-routes");
// const boardsRoutes = require("./routes/boards-routes");
// const projectsRoutes = require("./routes/projects-routes");
// const notificationsRoutes = require("./routes/notifications-routes");
// const HttpError = require('./models/http-error');
// const path = require("path");


const app = express();

app.use(express.json());
app.use(cors());
// app.use('/uploads/images', express.static(path.join('uploads', 'images')));

// เพื่อทดสอบการใช้งาน MongoDB
// const Student = require("./models/students");
// app.post("/students", async (req, res) => {
//     let { fname, lname, studentFaculty, phone, address, studentId }  = req.body;
//     let newStudent = new Student({
//         fname,
//         lname,
//         studentFaculty,
//         phone,
//         address,
//         studentId
//     })

//     await newStudent.save()
//     res.status(201).json(newStudent)
// })

// ตัวสร้างข้อมูล รหัสการเบิกของต่างๆ ใช้ต่อเมื่อเริ่มใช้งานโปรแกรมนี้ครั้งแรก
// app.post("/cnt", (req, res) => {
//     let newHistoryCnt = new HistoryCnt({
//         name: "HP",
//         cntNumber: 1000
//     })

//     newHistoryCnt.save()
//     res.status(201).json(newHistoryCnt)
// })

app.use('/api/users', usersRoutes);
// app.use('/api/tools', toolsRoutes);
// app.use('/api/boards', boardsRoutes);
// app.use('/api/projects', projectsRoutes);
// app.use('/api/notifications', notificationsRoutes);

// --------- Real Server -----------
mongoose
    .connect(
        `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@mongo3-crud.7dsrv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
        { useUnifiedTopology: true, useNewUrlParser: true }
    )
    .then(() => {
        app.listen(process.env.PORT || 5000);
        console.log("server is running");
    })
    .catch(err => {
        console.log(err);
    })
    ;

// ------------ Mock Server --------------
// mongoose
//     .connect(
//         process.env.DB_TEMPORARY,
//         { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }
//     )
//     .then(() => {
//         app.listen(process.env.PORT || 5000, () => console.log("Server is running on port 5000"));
//     })
//     .catch(err => {
//         console.log(err);
//     })
//     ;