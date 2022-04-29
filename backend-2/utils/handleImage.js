const Cloudinary = require("../utils/cloudinary");

const deleteOneImage = async (public_id, dataModel = null) => {
  await Cloudinary.uploader
    .destroy(public_id)
    .then(() => {
      if (dataModel) dataModel.avatar = {};
    })
    .catch((err) => {
      throw next(new AppError(err.message, err.http_code || 400));
    });
};

const uploadOneImage = async (imagePath, dataModel) => {
  await Cloudinary.uploader
    .upload(imagePath)
    .then((res) => {
      dataModel.avatar = { url: res.secure_url, public_id: res.public_id };
    })
    .catch((err) => {
      throw next(new AppError(err.message, err.http_code || 400));
    });
};

exports.deleteOneImage = deleteOneImage;
exports.uploadOneImage = uploadOneImage;
