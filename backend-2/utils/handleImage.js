const Cloudinary = require("../utils/cloudinary");
const AppError = require("../utils/appError");
const { hasImage, hasFile, hasImageArray } = require("./index");

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

const deleteAllImage = async (images) => {
  await Promise.all([
    images.map(async (img) => {
      await Cloudinary.uploader
        .destroy(img.public_id)
        .then(() => {
          // Do something (Alternative)
        })
        .catch((err) => {
          throw next(new AppError(err.message, err.http_code || 400));
        });
    }),
  ]);
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

const handleOneImage = async (data, file, avatar) => {
  if (hasImage(avatar) && hasImage(data.avatar)) {
    await deleteOneImage(data.avatar.public_id, data);
  }
  // Check user uploads new image
  if (hasFile(file)) {
    await uploadOneImage(file.path, data);
  }
};

const deleteManyImages = async (imagesDeleted, data) => {
  imagesDeleted.forEach((imgDel) => {
    data.images = data.images.filter(
      (img) => img.public_id !== imgDel.public_id
    );
  });
  await Promise.all(
    imagesDeleted.map(async (img) => {
      await Cloudinary.uploader
        .destroy(img.public_id)
        .then(() => console.log("Delete img successfully"))
        .catch((err) => {
          throw next(new AppError(err.message, err.http_code || 400));
        });
    })
  );
};
const uploadManyImages = async (newImages, data) => {
  await Promise.all(
    newImages.map(async (img) => {
      await Cloudinary.uploader
        .upload(img.path)
        .then((res) => {
          data.images.push({ url: res.secure_url, public_id: res.public_id });
        })
        .catch((err) => {
          throw next(new AppError(err.message, err.http_code || 400));
        });
    })
  );
};

const handleManyImages = async (data, file, fileDeleted) => {
  if (hasImageArray(file)) {
    await uploadManyImages(file, data);
  }
  if (hasImageArray(fileDeleted)) {
    await deleteManyImages(fileDeleted, data);
  }
};

exports.deleteOneImage = deleteOneImage;
exports.deleteAllImage = deleteAllImage;
exports.uploadOneImage = uploadOneImage;
exports.handleOneImage = handleOneImage;
exports.uploadManyImages = uploadManyImages;
exports.deleteManyImages = deleteManyImages;
exports.handleManyImages = handleManyImages;
