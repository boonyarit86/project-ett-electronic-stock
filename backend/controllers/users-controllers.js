const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");
const isEmail = require("validator/lib/isEmail");
const cloudinary = require("../utils/cloudinary");


// const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;

// เรียกดูข้อมูลผู้ใช้งานทั้งหมด
const getUsers = async (req, res) => {
  let users;
  try {
    users = await UserModel.find();
  } catch (error) {
    console.log(error);
    res.status(500).send("can not retrieve All user lists due to server error");
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
    existingUser = await UserModel.findOne({ email: email }).select(
      "+password"
    );

    if (!existingUser) return res.status(401).send("There is no user ");

    let isValidPassword = false;
    isValidPassword = await bcrypt.compare(password, existingUser.password);

    if (!isValidPassword) {
      return res.status(401).send("password is incorrect");
    }

    if (existingUser.status === "none") {
      return res.status(403).send("Waiting for approvement");
    }
    console.log(existingUser)
    let token;
    token = jwt.sign(
      { userId: existingUser.id },
      process.env.JWT_KEY,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({token, userStatus: existingUser.status, userId: existingUser.id});
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Can not login due to server error");
  }
};

// แก้ไขข้อมูลโปรไฟล์
const editProfile = async (req, res) => {
  const { email, name, password, oldPassword } = req.body;

  if (!isEmail(email)) return res.status(401).send("Invalid Email");

  let findData;
  // หาข้อมูล document ที่ต้องการแกไข
  try {
    findData = await UserModel.findById(req.params.uid).select("+password");
    if (!findData) return res.status(401).send("Not found user");

    // แก้ไขข้อมูล
    findData.email = email;
    findData.name = name;
    
    if (password !== "") {
      
      if (password.length < 6) {
        return res.status(401).send("Password must be at least 6 characters");
      }

      let isValidPassword = false;
      isValidPassword = await bcrypt.compare(oldPassword, findData.password);
  
      if (!isValidPassword) {
        return res.status(401).send("password is incorrect");
      }
      let hashedPassword;
      hashedPassword = await bcrypt.hash(password, 12);
      if (!hashedPassword)
        return res
          .status(401)
          .send("can not hashed password. please try to use new password");
      findData.password = hashedPassword;
    }

    // ถ้ามีการอัพโหลดรูปใหม่ ให้ทำการลบรูปภาพเก่าใน Aws S3 และอัพโหลดรูปภาพใหม่ไปแทน
    if (req.file !== undefined) {
      // console.log(findData.avartar.public_id)
      if (findData.avartar.public_id !== undefined) {
        await cloudinary.uploader.destroy(findData.avartar.public_id);
      }
      await cloudinary.uploader.upload(req.file.path, (error, result) => {
        if (error) res.status(401).send("can not upload image on clound");
        else
          findData.avartar = {
            url: result.secure_url,
            public_id: result.public_id,
          };
      });
    }

    await findData.save();
    res.status(200).json(findData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Can not edit your profile due to server error");
  }
};

// อนุมัติผู้ใช้งาน
const approveUser = async (req, res) => {
  try {
    let user = await UserModel.findById(req.params.uid);
    if(!user) return res.status(401).send("can not find this user on database")

    user.status = "user"

    await user.save();
    res.status(200).send("approved successfully");

  } catch (error) {
    console.error(error);
    res.status(500).send("Can not approve due to server error");
  }
  
};

// อนุมัติผู้ใช้งาน
const editStatusUser = async (req, res) => {
  try {
    let user = await UserModel.findById(req.params.uid);
    if(!user) return res.status(401).send("can not find this user on database")

    user.status = req.body.newStatus

    await user.save();
    res.status(200).send("edit status successfully");

  } catch (error) {
    console.error(error);
    res.status(500).send("Can not edit status due to server error");
  }
  
};

// ลบผู้ใช้งานหรือปฎิเสธการอนุมัติ
const deleteUser = async (req, res) => {
  try {
    let user = await UserModel.findById(req.params.uid);
    if(!user) return res.status(401).send("can not find this user on database")

    if(user.avartar.public_id !== undefined) {
      await cloudinary.uploader.destroy(user.avartar.public_id)
    }

    await user.remove();
    res.status(200).send("deleted successfully");

  } catch (error) {
    console.error(error);
    res.status(500).send("Can not deleted due to server error");
  }
};

exports.getUsers = getUsers;
exports.getUser = getUser;
exports.signup = signup;
exports.login = login;
exports.editProfile = editProfile;
exports.approveUser = approveUser;
exports.editStatusUser = editStatusUser;
exports.deleteUser = deleteUser;
