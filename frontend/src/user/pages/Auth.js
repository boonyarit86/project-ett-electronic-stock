import React, { useState, useContext } from "react";
import { registerAction, loginAction } from "../../actions/userActions";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "../../shared/hooks/form-hook";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_REQUIRE,
} from "../../shared/utils/validators";
import { AuthContext } from "../../shared/context/auth-context";

// Component
import Input from "../../shared/components/FormElements/Input";
import Loading from "../../shared/components/UIElements/Loading";
import { Alert, AlertTitle } from "@material-ui/lab";

// CSS
import "./Auth.css";

function Auth() {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch()
  const { isLoading, serverMsg } = useSelector((state) => state.userState)
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // function จับ error ของ Input
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
    const { email, password } = formState.inputs;
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          password2: undefined,
        },
        email.isValid && password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: "",
            isValid: false,
          },
          password2: {
            value: "",
            isValid: false,
          },
        },
        false
      );
    }
    setIsLoginMode((prevMode) => !prevMode);
  };

  // ส่งข้อมูลไปยังฐานข้อมูล
  const onSubmit = async (e) => {
    const { password, password2, email, name } = formState.inputs;
    let user;

    e.preventDefault();

    if (!isLoginMode) {
      processRegister();
    }

    if (isLoginMode) {
      processLogin();
    }

    async function processRegister() {
      if (
        !isPasswordTheSameAsConfirmPassword(password.value, password2.value)
      ) {
        setErrorMsg("รหัสผ่านไม่ถูกต้อง")
      } else {
        user = {
          email: email.value,
          name: name.value,
          password: password.value,
        };
        dispatch(registerAction(user, setErrorMsg, setIsLoginMode));
      }

      function isPasswordTheSameAsConfirmPassword(password, passwordConfirm) {
        return password === passwordConfirm;
      }
    }

    async function processLogin() {
      user = {
        email: email.value,
        password: password.value,
      };
      dispatch(loginAction(user, setErrorMsg, setIsLoginMode, auth));
    }

  };

  return (
    <form onSubmit={onSubmit}>
      {isLoading && <Loading loading={isLoading} />}
      <div className="GroupLogin">
        <h2 className="GroupLogin-h2">
          {isLoginMode ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
        </h2>
        {(errorMsg || serverMsg) && (
          <Alert variant="filled" severity="error">
            <AlertTitle>{errorMsg || serverMsg}</AlertTitle>
          </Alert>
        )}
        <Alert variant="filled" severity="info" style={{ marginTop: "10px" }}>
          <AlertTitle>
            For testing: Email: admin@hotmail.com and Password: 123456
          </AlertTitle>
        </Alert>
        <div className="GroupInput">
          <Input
            id="email"
            element="input"
            type="email"
            label="อีเมล์"
            validators={[VALIDATOR_EMAIL()]}
            errorText="โปรดใส่อีเมล์ให้ถูกต้อง."
            onInput={inputHandler}
            shrink={true}
            required
          />
        </div>

        {!isLoginMode && (
          <div className="GroupInput">
            <Input
              id="name"
              element="input"
              type="text"
              label="ชื่อในระบบ"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="โปรดใส่ข้อมูล."
              onInput={inputHandler}
              shrink={true}
              required
            />
          </div>
        )}

        <div className="GroupInput">
          <Input
            id="password"
            element="input"
            type="password"
            label="รหัสผ่าน"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="โปรดใส่รหัสผ่าน"
            onInput={inputHandler}
            shrink={true}
            required
          />
        </div>

        {!isLoginMode && (
          <div className="GroupInput">
            <Input
              id="password2"
              element="input"
              type="password"
              label="ยืนยันรหัสผ่าน"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="โปรดใส่รหัสผ่าน"
              onInput={inputHandler}
              shrink={true}
              required
            />
          </div>
        )}
        <p className="auth-link" onClick={switchModeHandler}>
          {isLoginMode ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
        </p>
        <div>
          <button
            type="submit"
            className="btnSubmit"
            disabled={!formState.isValid}
          >
            {isLoginMode ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default Auth;