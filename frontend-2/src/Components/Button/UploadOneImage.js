import React, { useState } from "react";
import { MdAddPhotoAlternate } from "react-icons/md";
import Avatar from "../Avatar/Avatar";
import "./UploadOneImage.css";

const UploadOneImage = (props) => {
  const { setFile, setFileDeleted, initialValue } = props;
  const [previewUrl, setPreviewUrl] = useState(initialValue?.url ? initialValue.url : null);

  const pickedHandler = (e) => {
    if(initialValue) {
      setFileDeleted(initialValue);
    }
    setFile(e.target.files[0]);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(e.target.files[0]);
  };

  const deleteImage = () => {
    setFileDeleted(initialValue);
    setPreviewUrl(null);
    setFile(null);
  };

  return (
    <div className="form-upload">
      <h4 className="form-upload__header">รูปภาพโปรไฟล์</h4>
      {previewUrl && (
        <div className="form-upload__preview">
          <div className="form-upload__image">
            <div className="form-upload__delete-icon icon--medium" onClick={deleteImage}>
              <span>X</span>
            </div>
            <Avatar
              className="icon--large"
              shape="square"
              src={previewUrl}
              alt="preview image"
            />
          </div>
        </div>
      )}
      <input
        accept="image/*"
        className="form-upload__input"
        id="button-file"
        type="file"
        onChange={pickedHandler}
      />
      <label htmlFor="button-file" className="form-upload__btn">
        <MdAddPhotoAlternate className="icon--medium" />
        <span>อัพโหลด</span>
      </label>
    </div>
  );
};

export default UploadOneImage;
