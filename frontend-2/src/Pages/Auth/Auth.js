import React, { useState } from "react";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../utils/validators";
import { useForm } from "../../hooks/form-hook";
import Title from "../../Components/Text/Title";

import "./Auth.css";
import Input from "../../Components/InputWithValidator/InputWithValidator";
import Heading from "../../Components/Text/Heading";
import Button from "../../Components/Button/Button";

const Auth = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);

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
          <form className="auth__form-box">
            <Heading type="sub" text="เข้าสู่ระบบ" />
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
              helperText="รหัสผ่านต้องมอย่างน้อย 4 ตัว"
              required
              fullWidth
            />
            {!isLoginMode && (
              <Input
                element="input"
                type="password"
                label="รหัสผ่าน"
                id="passwordConfirm"
                placeholder="กรุณายืนยันรหัสผ่านของคุณ"
                validators={[VALIDATOR_MINLENGTH(4)]}
                onInput={inputHandler}
                errorMessage="โปรดใส่รหัสผ่านอย่างน้อย 4 ตัว"
                helperText="รหัสผ่านต้องมอย่างน้อย 4 ตัว"
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
              type="button"
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
