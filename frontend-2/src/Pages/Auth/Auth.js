import Axios from "axios";
import React, { useState, useContext } from "react";
import { useDispatch } from "react-redux";

// Components
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../utils/validators";
import Button from "../../Components/Button/Button";
import Heading from "../../Components/Text/Heading";
import Input from "../../Components/Input/InputWithValidator";
import Title from "../../Components/Text/Title";
import Toast from "../../Components/Toast/Toast";

import { startLoading, endLoading } from "../../Redux/features/stateSlice";
import { AuthContext } from "../../context/auth-context";
import { catchError } from "../../utils/handleError";
import { useForm } from "../../hooks/form-hook";

import "./Auth.css";

const Auth = () => {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  // const auth = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  // function เปลี่ยนแบบฟอร์มระหว่าง Login และ Register โดย function จะกำหนดหน้า Login ขึ้นก่อน
  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          passwordConfirm: undefined,
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: "",
            isValid: false,
          },
          passwordConfirm: {
            value: "",
            isValid: false,
          },
        },
        false
      );
    }
    setIsLoginMode((prevMode) => !prevMode);
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    const { email, name, password, passwordConfirm } = formState.inputs;
    let data;

    try {
      dispatch(startLoading());
      // Login mode
      if (isLoginMode) {
        data = { email: email.value, password: password.value };
        await Axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/users/login`,
          data
        ).then((res) => {
          let userId = res.data.data.user._id;
          let userData = res.data.data.user;
          auth.login(res.data.token, userId, userData);
        });
      }
      // Register mode
      else {
        data = {
          email: email.value,
          password: password.value,
          passwordConfirm: passwordConfirm.value,
          name: name.value,
        };
        await Axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/users/register`,
          data
        ).then((res) => {
          setSuccessMessage("สมัครสมาชิกเรียบร้อยแล้ว");
          setTimeout(() => setSuccessMessage(null), 10000);
          setIsLoginMode(true);
        });
      }
      dispatch(endLoading());
    } catch (error) {
      dispatch(endLoading());
      catchError(error, setErrorMessage);
    }
  };

  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__intro">
          <img
            className="auth__logo u-mg-l"
            src="./images/logo.svg"
            alt="logo"
          />
          <div className="auth__intro-box">
            <img
              className="auth__intro-image"
              src="./images/intro/auth-intro.svg"
              alt="img-intro"
            />
            <Title>ระบบสต๊อกจัดการข้อมูลสินค้าอิเล็กทรอนิกส์</Title>
            <p>
              สามารถเพิ่ม, ลบ, แก้ไข, เก็บข้อมูลประวิติการใช้งานอุปกรณ์
              อิเล็กทรอนิกส์ต่างๆ และยังคำนวณจำนวนอุปกรณ์ที่
              ต้องใช้ได้อย่างแม่นยำ
            </p>
          </div>
        </div>

        <div className="auth__form">
          <form className="auth__form-box" onSubmit={onSubmit}>
            <Heading type="sub" text={isLoginMode ? "เข้าสู่ระบบ" : "สมัครสมาชิก"} />
            {errorMessage && (
              <Toast element="error" type="default" message={errorMessage} />
            )}
            {successMessage && (
              <Toast
                element="success"
                type="default"
                message={successMessage}
              />
            )}
            <Input
              element="input"
              type="email"
              label="อีเมล์"
              id="email"
              placeholder="กรุณากรอกอีเมล์ของคุณ"
              validators={[VALIDATOR_EMAIL()]}
              onInput={inputHandler}
              errorMessage="กรุณากรอกอีเมล์ของคุณ"
              required
              fullWidth
            />
            {!isLoginMode && (
              <Input
                element="input"
                type="text"
                label="ชื่อผู้ใช้งาน"
                id="name"
                placeholder="กรุณากรอกชื่อของคุณ"
                validators={[VALIDATOR_REQUIRE()]}
                onInput={inputHandler}
                errorMessage="กรุณากรอกชื่อของคุณ"
                required
                fullWidth
              />
            )}
            <Input
              element="input"
              type="password"
              label="รหัสผ่าน"
              id="password"
              placeholder="กรุณากรอกรหัสผ่านของคุณ"
              validators={[VALIDATOR_MINLENGTH(4)]}
              onInput={inputHandler}
              errorMessage="โปรดใส่รหัสผ่านอย่างน้อย 4 ตัว"
              helperText="รหัสผ่านต้องมีอย่างน้อย 4 ตัว"
              required
              fullWidth
            />
            {!isLoginMode && (
              <Input
                element="input"
                type="password"
                label="ยืนยันรหัสผ่าน"
                id="passwordConfirm"
                placeholder="กรุณายืนยันรหัสผ่านของคุณ"
                validators={[VALIDATOR_MINLENGTH(4)]}
                onInput={inputHandler}
                errorMessage="โปรดใส่รหัสผ่านอย่างน้อย 4 ตัว"
                helperText="รหัสผ่านต้องมีอย่างน้อย 4 ตัว"
                required
                fullWidth
              />
            )}
            <p className="auth__text">
              {isLoginMode ? "ยังไม่ได้สมัครสมาชิก?" : "เป็นสมาชิกแล้วใช่ไหม?"}{" "}
              <span className="auth__link" onClick={switchModeHandler}>
                คลิกที่นี่
              </span>
            </p>
            <Button
              type="submit"
              element="button"
              className="btn-primary-blue fullWidth"
              disabled={!formState.isValid}
            >
              {isLoginMode ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
