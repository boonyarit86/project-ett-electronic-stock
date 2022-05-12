import React, { useState, memo } from "react";
import { MdAddPhotoAlternate } from "react-icons/md";
import Avatar from "../Avatar/Avatar";
import "./UploadOneImage.css";

const UploadManyImage = memo((props) => {
  const { files, setFiles, setFilesDeleted, initialValue } = props;
  const [previewFiles, setPreviewFiles] = useState(
    initialValue?.length > 0 ? initialValue : []
  );

  const pickedHandler = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map((file) => {
        return { url: URL.createObjectURL(file), public_id: file.lastModified, isNew: true };
      });
      setPreviewFiles((prevImages) => prevImages.concat(filesArray));
      setFiles((prevImages) => prevImages.concat(Array.from(e.target.files)));
    }
  };

  const deleteImage = (id, isNew) => {
    if (initialValue && !isNew) {
      let imgDeleted = initialValue.find((img) => img.public_id === id);
      setFilesDeleted((prev) => [...prev, imgDeleted]);
    }

    let delPreviewImg = previewFiles.filter((prevImages) => prevImages.public_id !== id);
    const delfile = files.filter((res) => {
    return res.lastModified !== id
  });

    setPreviewFiles(delPreviewImg);
    setFiles(delfile)
  };

  return (
    <div className="form-upload">
      <h4 className="form-upload__header">รูปภาพอื่น (อัพโหลดได้ไม่เกิน 3 รูปต่อครั้ง)</h4>
      {previewFiles.length > 0 && (
        <div className="form-upload__preview">
          {previewFiles.map((img) => (
            <div className="form-upload__image" key={img.public_id}>
              <div
                className="form-upload__delete-icon icon--medium"
                onClick={() => deleteImage(img.public_id, img?.isNew ? img.isNew : false)}
              >
                <span>X</span>
              </div>
              <Avatar
                className="icon--large"
                shape="square"
                src={img.url}
                alt="preview image"
              />
            </div>
          ))}
        </div>
      )}
      <input
        accept="image/*"
        className="form-upload__input"
        id="button-files"
        type="file"
        onChange={pickedHandler}
        multiple
      />
      <label htmlFor="button-files" className="form-upload__btn">
        <MdAddPhotoAlternate className="icon--medium" />
        <span>อัพโหลด</span>
      </label>
      <p className="form-upload__helperText">การอัพโหลดรูปภาพหลายรูปอาจจะใช้เวลา</p>
    </div>
  );
});

export default UploadManyImage;
