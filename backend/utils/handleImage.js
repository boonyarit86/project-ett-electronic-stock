const cloudinary = require("./cloudinary");

const deleteImageInCloudinary = async (image) => {
    await cloudinary.uploader.destroy(image, (error, res) => {
      if (error) console.log("can not delete image");
      else console.log("delete image");
    });
  }

exports.deleteImageInCloudinary = deleteImageInCloudinary;