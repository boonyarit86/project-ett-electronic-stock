import React, { useState, useContext } from "react";
import Axios from "axios";
import { useDispatch } from "react-redux";
import { AiOutlineClose } from "react-icons/ai";
import { useForm } from "../../hooks/form-hook";
import { AuthContext } from "../../context/auth-context";
import { catchError } from "../../utils/handleError";
import { setUser } from "../../Redux/features/userSlice";
import { startLoading, endLoading } from "../../Redux/features/stateSlice";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../utils/validators";
import Button from "../Button/Button";
import InputWithValidator from "../../Components/InputWithValidator/InputWithValidator";
import Toast from "../Toast/Toast";
import Title from "../Text/Title";
import UploadOneImage from "../Button/UploadOneImage";
import "./EditProfile.css";

const EditProfile = (props) => {
  const user = props.user;
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [fileDeleted, setFileDeleted] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      name: {
        value: "",
        isValid: false,
      },
      oldPassword: {
        value: "",
        isValid: true,
      },
      newPassword: {
        value: "",
        isValid: true,
      },
      newPasswordConfirm: {
        value: "",
        isValid: true,
      },
    },
    false
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    const { email, name, newPassword, oldPassword, newPasswordConfirm } =
      formState.inputs;
    let avatar = Boolean(fileDeleted) ? JSON.stringify(fileDeleted) : null;
  
    try {
      dispatch(startLoading());
      let formData = new FormData();
      formData.append("email", email.value);
      formData.append("name", name.value);
      formData.append("password", newPassword.value);
      formData.append("passwordConfirm", newPasswordConfirm.value);
      formData.append("oldPassword", oldPassword.value);
      formData.append("avatar", avatar);
      formData.append("image", file);
      await Axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/users/${user._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      ).then((res) => {
        dispatch(setUser(res.data.data.user));
        dispatch(endLoading());
        setSuccessMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
        setTimeout(() => setSuccessMessage(null), 10000);
      });
    } catch (error) {
      dispatch(endLoading());
      catchError(error, setErrorMessage);
    }
  };

  const omitValues = () => {
    let { newPassword, newPasswordConfirm, oldPassword } = formState.inputs;
    return (
      Boolean(newPassword.value !== "" && !newPassword.isValid) ||
      Boolean(newPasswordConfirm.value !== "" && !newPasswordConfirm.isValid) ||
      Boolean(oldPassword.value !== "" && !oldPassword.isValid)
    );
  };

  return (
    <div className="editProfile">
      <div className="profile__header">
        <Title className="profile__h3">แก้ไขโพรไฟล์</Title>
        <AiOutlineClose
          className="profile__close-icon icon--medium"
          onClick={props.onClick}
        />
      </div>
      {errorMessage && (
        <Toast
          element="error"
          type="default"
          message={errorMessage}
          style={{ marginBottom: "1rem" }}
        />
      )}
      {successMessage && (
        <Toast
          element="success"
          type="default"
          message={successMessage}
          style={{ marginBottom: "1rem" }}
        />
      )}
      <form className="editProfile__form" onSubmit={onSubmit}>
        <InputWithValidator
          element="input"
          type="email"
          label="อีเมล์"
          id="email"
          placeholder="กรุณากรอกอีเมล์ของคุณ"
          validators={[VALIDATOR_EMAIL()]}
          onInput={inputHandler}
          errorMessage="กรุณากรอกอีเมล์ของคุณ"
          initialValid={true}
          initialValue={user.email}
          required
          fullWidth
        />
        <div className="input__group editProfile__input-group">
          <InputWithValidator
            element="input"
            type="text"
            label="ชื่อผู้ใช้งาน"
            id="name"
            placeholder="กรุณากรอกชื่อของคุณ"
            validators={[VALIDATOR_REQUIRE()]}
            onInput={inputHandler}
            errorMessage="กรุณากรอกชื่อของคุณ"
            initialValid={true}
            initialValue={user.name}
            required
            fullWidth
          />
          <InputWithValidator
            element="input"
            type="password"
            label="รหัสผ่านเก่า"
            id="oldPassword"
            placeholder="กรุณากรอกรหัสผ่านเก่าของคุณ"
            validators={[VALIDATOR_MINLENGTH(4)]}
            onInput={inputHandler}
            errorMessage="โปรดใส่รหัสผ่านอย่างน้อย 4 ตัว"
            helperText="รหัสผ่านต้องมีอย่างน้อย 4 ตัว"
            initialValid={true}
            fullWidth
          />
        </div>
        <div className="input__group editProfile__input-group">
          <InputWithValidator
            element="input"
            type="password"
            label="รหัสผ่านใหม่"
            id="newPassword"
            placeholder="กรุณากรอกรหัสผ่านใหม่ของคุณ"
            validators={[VALIDATOR_MINLENGTH(4)]}
            onInput={inputHandler}
            errorMessage="โปรดใส่รหัสผ่านอย่างน้อย 4 ตัว"
            helperText="รหัสผ่านต้องมีอย่างน้อย 4 ตัว"
            initialValid={true}
            fullWidth
          />
          <InputWithValidator
            element="input"
            type="password"
            label="ยืนยันรหัสผ่านใหม่"
            id="newPasswordConfirm"
            placeholder="กรุณายืนยันรหัสผ่านใหม่ของคุณ"
            validators={[VALIDATOR_MINLENGTH(4)]}
            onInput={inputHandler}
            errorMessage="โปรดใส่รหัสผ่านอย่างน้อย 4 ตัว"
            helperText="รหัสผ่านต้องมีอย่างน้อย 4 ตัว"
            initialValid={true}
            fullWidth
          />
        </div>
        <UploadOneImage
          setFile={setFile}
          setFileDeleted={setFileDeleted}
          initialValue={user?.avatar?.url ? user.avatar : null}
        />
        <div className="btn__group">
          <Button
            type="submit"
            element="button"
            className="btn-primary-blue"
            disabled={!formState.isValid && omitValues()}
          >
            บันทึก
          </Button>
          <Button
            type="button"
            element="button"
            className="btn-primary-blue--outline"
            onClick={props.onClick}
          >
            ยกเลิก
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
