const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");
const isEmail = require("validator/lib/isEmail");
const cloudinary = require("../utils/cloudinary");
const catchError = require("../utils/catchError");
const { deleteImageInCloudinary } = require("../utils/handleImage");

// const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;

// ---------------------- Helper Functions -----------------------

function imageExist(image) {
  return image !== undefined;
}

// -------------------- Main Functions --------------------------

// เรียกดูข้อมูลผู้ใช้งานทั้งหมด
const getUsers = async (req, res) => {
  let users;
  try {
    users = await UserModel.find();
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถเรียกข้อมูลได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }
  res.status(200).json(users);
};

// โปรไฟล์ผู้ใช้
const getUser = async (req, res) => {
  const userId = req.userId;
  let user;
  try {
    user = await UserModel.findById(userId);
    res.status(200).json(user);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถเรียกข้อมูลได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }
};

// สมัครสมาชิก
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!isEmail(email)) return res.status(401).send("รูปแบบอีเมล์ไม่ถูกต้อง");

    if (password.length < 6)
      return res.status(401).send("รหัสผ่านต้องมีอย่างน้อย 6 ตัว");

    let emailExist = await UserModel.findOne({ email: email.toLowerCase() });
    if (emailExist) return res.status(401).send("อีเมล์นี้ได้ถูกใช้งานแล้ว");

    let newUser = await createNewuser(password);

    res.status(201).json(newUser);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถสมัครสมาชิกได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }

  async function createNewuser(password) {
    let hashedPassword = await bcrypt.hash(password, 10);
    let user = new UserModel({
      email,
      name,
      password: hashedPassword,
    });
    await user.save();
    return user;
  }
};

// เข้าสู่ระบบ
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!isEmail(email)) return res.status(401).send("รูปแบบอีเมล์ไม่ถูกต้อง");

    if (password.length < 6)
      return res.status(401).send("รหัสผ่านต้องมีอย่างน้อย 6 ตัว");

    let existingUser = await UserModel.findOne({ email: email }).select(
      "+password"
    );
    if (!existingUser) return res.status(401).send("ไม่มีข้อมูลผู้ใช้ในระบบ");

    let isValidPassword = false;
    isValidPassword = await bcrypt.compare(password, existingUser.password);
    if (!isValidPassword) return res.status(401).send("รหัสผ่านไม่ถูกต้อง");

    if (userNotapproved(existingUser.status))
      return res.status(403).send("กำลังรอการอนุมัติ");

    let userId = existingUser.id;
    let userStatus = existingUser.status;
    let token = createToken(userId);

    res.status(200).json({
      token,
      userStatus,
      userId,
    });
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถเข้าสู่ระบบได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }

  function createToken(userId) {
    let settingToken = [
      { userId: userId },
      process.env.JWT_KEY,
      { expiresIn: "1h" },
    ];

    return jwt.sign(...settingToken);
  }
  function userNotapproved(status) {
    return status === "none";
  }
};

// แก้ไขข้อมูลโปรไฟล์
const editProfile = async (req, res) => {
  const { email, name, password, oldPassword } = req.body;

  if (!isEmail(email)) return res.status(401).send("รูปแบบอีเมล์ไม่ถูกต้อง");

  let findData;
  // หาข้อมูล document ที่ต้องการแกไข
  try {
    findData = await UserModel.findById(req.params.uid).select("+password");
    let avartar_id = findData.avartar.public_id;

    if (!findData)
      return res
        .status(401)
        .send("ไม่พบข้อมูลผู้ใช้งานในระบบ โปรดลองใหม่อีกครั้ง");

    // แก้ไขข้อมูล
    findData.email = email;
    findData.name = name;

    if (passwordNotEmpty(password)) {
      if (password.length < 6) {
        return res.status(401).send("รหัสผ่านต้องมีอย่างน้อย 6 ตัว");
      }

      let isValidPassword = false;
      isValidPassword = await bcrypt.compare(oldPassword, findData.password);

      if (!isValidPassword) {
        return res.status(401).send("รหัสผ่านไม่ถูกต้อง");
      }
      let hashedPassword;
      hashedPassword = await bcrypt.hash(password, 12);

      if (!hashedPassword)
        return res
          .status(401)
          .send("ไม่สามารถเปลี่ยนรหัสผ่านได้ โปรดใช้รหัสผ่านอย่างอื่น");

      findData.password = hashedPassword;
    }

    if (imageExist(req.file)) {
      if (avartarExist(avartar_id)) {
        await deleteImageInCloudinary(avartar_id);
      }
      await uploadAvartarToCloudinary(req.file.path, findData);
    }

    await findData.save();
    res.status(200).json(findData);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถแก้ไขข้อมูลได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }

  function avartarExist(avartar) {
    return avartar !== undefined;
  }

  async function uploadAvartarToCloudinary(imagePath, user) {
    await cloudinary.uploader.upload(imagePath, (error, result) => {
      if (error)
        res
          .status(401)
          .send("ไม่สามารถอัปโหลดรูปภาพ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
      else
        user.avartar = {
          url: result.secure_url,
          public_id: result.public_id,
        };
    });
  }

  function passwordNotEmpty(password) {
    return password !== "";
  }
};

// อนุมัติผู้ใช้งาน
const approveUser = async (req, res) => {
  try {
    let user = await UserModel.findById(req.params.uid);
    if (!user) return res.status(401).send("ไม่พบข้อมูลนี้บนฐานข้อมูล");

    user.status = "user";

    await user.save();
    res.status(200).send("อนุมัติสำเร็จ");
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถแก้ไขข้อมูลได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }
};

// อนุมัติผู้ใช้งาน
const editStatusUser = async (req, res) => {
  try {
    let user = await UserModel.findById(req.params.uid);
    if (!user) return res.status(401).send("ไม่พบข้อมูลนี้บนฐานข้อมูล");

    user.status = req.body.newStatus;

    await user.save();
    res.status(200).send("แก้ไขข้อมูลสำเร็จ");
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถแก้ไขข้อมูลได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }
};

// ลบผู้ใช้งานหรือปฎิเสธการอนุมัติ
const deleteUser = async (req, res) => {
  try {
    let user = await UserModel.findById(req.params.uid);
    if (!user) return res.status(401).send("ไม่พบข้อมูลนี้บนฐานข้อมูล");

    if (imageExist(user.avartar.public_id)) {
      await deleteImageInCloudinary(user.avartar.public_id);
    }

    await user.remove();
    res.status(200).send("ลบข้อมูลสำเร็จ");
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถลบข้อมูลได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
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
