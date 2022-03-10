const cloudinary = require("./cloudinary");

const deleteImageInCloudinary = async (image) => {
  await cloudinary.uploader.destroy(image, (error, res) => {
    if (error) console.log("can not delete image");
    else console.log("delete image");
  });
};

const uploadMultipleImageToCloudinary = async (images, imageArr, avartarExist) => {
  for (var round = 0; round < images.length; round++) {
    // not Avartar
    if (round === 0 && avartarExist) continue;
    else await uploadImage(images[round].path, imageArr);
  }

  async function uploadImage(imagePath, imageArr) {
    await cloudinary.uploader.upload(imagePath, (error, result) => {
      if (error) {
        console.log("can not upload image on clound");
      } else {
        imageArr.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    });
  }
}

exports.deleteImageInCloudinary = deleteImageInCloudinary;
exports.uploadMultipleImageToCloudinary = uploadMultipleImageToCloudinary;
