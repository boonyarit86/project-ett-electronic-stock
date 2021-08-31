const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");
const isEmail = require("validator/lib/isEmail");

const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;

// const aws = require('aws-sdk');

// You can get those keys from My Security from Credentials of Aws S3
// aws.config.update({
//     accessKeyId: process.env.accessKeyId,
//     secretAccessKey: process.env.secretAccessKey
// });

// const s3 = new aws.S3();

// เรียกดูข้อมูลผู้ใช้งานทั้งหมด
const getUsers = async (req, res) => {
  let users;
  try {
    users = await UserModel.find();
  } catch (error) {
    console.log(error);
    res.status(500).send("can not retrieve all users due to server error");
  }
  res.status(200).json(users);
};

// โปรไฟล์ผู้ใช้
const getUser = async (req, res) => {
  const userId = req.userId;
  let user;
  try {
    user = await UserModel.findById(userId);
  } catch (error) {
    console.log(error);
    res.status(500).send("can not retrieve user due to server error");
  }
  res.status(200).json(user);
};

// สมัครสมาชิก
const signup = async (req, res) => {
  // console.log('Image: ', req.file.location);
  // console.log('Image-path: ', req.file.path);

  const { name, email, password } = req.body;

  if (!isEmail(email)) return res.status(401).send("Invalid Email");

  if (password.length < 6) {
    return res.status(401).send("Password must be at least 6 characters");
  }

  try {
    let user;
    user = await UserModel.findOne({ email: email.toLowerCase() });
    if (user) {
      res.status("401").send("This email has already registerd");
    }

    let hashedPassword = await bcrypt.hash(password, 10);
    user = new UserModel({
      email,
      name,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Can not register due to server error");
  }
};

// เข้าสู่ระบบ
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!isEmail(email)) return res.status(401).send("Invalid Email");

  if (password.length < 6) {
    return res.status(401).send("Password must be at least 6 characters");
  }

  try {
    let existingUser;
    existingUser = await UserModel.findOne({ email: email }).select("+password");

    if (!existingUser) return res.status(401).send("There is no user ");

    let isValidPassword = false;
    isValidPassword = await bcrypt.compare(password, existingUser.password);

    if (!isValidPassword) {
      return res.status(401).send("password is incorrect");
    }

    // if (existingUser.status === "none") {
    //   return res.status(403).send("Waiting for approvement");
    // }

    let token;
    token = jwt.sign(
      { userId: existingUser.id },
      process.env.JWT_KEY,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json(token);
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Can not login due to server error");
  }
};

// แก้ไขข้อมูลโปรไฟล์
const editProfile = async (req, res, next) => {
  const { email, name, password, firstName, lastName, phone, department } =
    req.body;
  let findData;
  // หาข้อมูล document ที่ต้องการแกไข
  try {
    findData = await User.findById(req.params.uid);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find user.",
      500
    );
    return next(error);
  }

  // แก้ไขข้อมูล
  findData.email = email;
  findData.name = name;
  findData.firstName = firstName;
  findData.lastName = lastName;
  findData.phone = phone;
  findData.department = department;

  if (password !== "") {
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      const error = new HttpError(
        "Could not create user, please try again.",
        500
      );
      return next(error);
    }
    findData.password = hashedPassword;
  }

  // ถ้ามีการอัพโหลดรูปใหม่ ให้ทำการลบรูปภาพเก่าใน Aws S3 และอัพโหลดรูปภาพใหม่ไปแทน
  if (req.file !== undefined) {
    if (findData.key !== "") {
      fs.unlink(findData.keyImage, (err) => {
        if (err) console.log(err);
        else console.log("delete image successfully");
      });
    }
    findData.image = "http://localhost:5000/" + req.file.path;
    findData.keyImage = req.file.path;
  }

  // Loop all of images after all delete it.
  // for (var i = 0; i < files.length; i++) {
  //     console.log(files[i]);
  //     s3.deleteObject({
  //         Bucket: 'project-utcc',
  //         Key: files[i]
  //     }, (err, data) => {
  //         if (err) console.log("can not delete an image in Aws S3")
  //         else console.log("delete an image in Aws S3 successfully.")
  //     })
  // }

  // console.log(findData)

  // บันทึกข้อมูล
  try {
    await findData.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not edit user.",
      500
    );
    return next(error);
  }
  res.status(200).json(findData);
  console.log("edit success");
  // console.log(findData)
};

// อนุมัติผู้ใช้งาน
const approveUser = async (req, res, next) => {
  let findData;
  try {
    findData = await User.findById(req.params.uid);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find user.",
      500
    );
    return next(error);
  }

  findData.status = "User";
  try {
    await findData.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update user.",
      500
    );
    return next(error);
  }

  res.status(200).json(findData);
  console.log("save successfully");

  /* 
    เอาไอดีจาก Token Json(req.userData ถูกสร้างขึ้นตอนที่ผู้ใช้ทำการเข้าสู่ระบบและข้อมูลจะถูกบันทึกใน backend เป็นตัวแปรแบบ global )
    มาเปรียบเทียบกับ Id ที่ได้รับจาก Front-end เพื่อป้องกันผู้ใช้งานแก้ไขข้อมูลผ่าน Postman หรืออื่นๆ ที่ไม่ได้ผ่านทางเว็บแอป
     */
  // console.log("test: " + req.userData)
  // if (findData._id.toString() !== req.userData.userId) {
  //     console.log(true)
  //     const error = new HttpError(
  //         'You are not allowed to edit this place.',
  //         401
  //     );
  //     return next(error);
  // }
};

// ลบผู้ใช้งานหรือปฎิเสธการอนุมัติ
const deleteUser = async (req, res, next) => {
  let findData;
  try {
    findData = await User.findById(req.params.uid);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find user.",
      500
    );
    return next(error);
  }

  if (findData.keyImage !== "") {
    fs.unlink(findData.keyImage, (err) => {
      if (err) console.log(err);
      else console.log("delete image successfully");
    });
  }

  try {
    await findData.remove();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete user.",
      500
    );
    return next(error);
  }

  res.status(200).json({ msg: "delete successfully" });
};

exports.getUsers = getUsers;
exports.getUser = getUser;
exports.signup = signup;
exports.login = login;
exports.editProfile = editProfile;
exports.approveUser = approveUser;
exports.deleteUser = deleteUser;
