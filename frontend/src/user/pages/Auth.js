import React, { useState, useEffect, useContext } from "react";
// import { useDispatch, useSelector } from "react-redux";
import { useForm } from "../../shared/hooks/form-hook";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_REQUIRE,
} from "../../shared/utils/validators";
import catchErrors from "../../shared/utils/catchErrors";
import Axios from "axios";
// import { registerAction, loginAction } from "../../actions/userAction";
import { AuthContext } from "../../shared/context/auth-context";
// import { makeStyles } from '@material-ui/core/styles';

// Component
import Input from "../../shared/components/FormElements/Input";
import Loading from "../../shared/components/UIElements/Loading";
import { Alert, AlertTitle } from "@material-ui/lab";
// import { Select, MenuItem, FormControl, InputLabel } from "@material-ui/core";

// CSS
import "./Auth.css";

// CSS Material UI
// const useStyles = makeStyles((theme) => ({
//     formControl: {
//         width: "100%",
//         margin: "20px 0"
//     },
//     selectEmpty: {
//         marginTop: theme.spacing(2),
//     },
// }));

function Auth() {
  // const classes = useStyles()
  const auth = useContext(AuthContext);
  // const dispatch = useDispatch()
  // const authUser = useSelector((state) => state.authUser)
  const [isLoginMode, setIsLoginMode] = useState(true);
  // const [successLogin, setSuccessLogin] = useState(false)
  // const [successRegister, setSuccessRegister] = useState(false)
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    return () => {};
  }, []);

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
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          password2: undefined,
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
    e.preventDefault();
    // ข้อมูลการสมัครสมาชิก
    if (!isLoginMode) {
      let isPassword =
        formState.inputs.password.value === formState.inputs.password2.value;
      if (!isPassword) {
        console.log("Password Wrong");
      } else {
        let data = {
          email: formState.inputs.email.value,
          name: formState.inputs.name.value,
          password: formState.inputs.password.value,
        };
        try {
          setLoading(true);
          await Axios.post(`${process.env.REACT_APP_BACKEND_URL}/users/signup`, data);
          setLoading(false);
          setIsLoginMode(!isLoginMode);
        } catch (error) {
          setLoading(false);
          setErrorMsg(catchErrors(error));
        }
      }
    }
    // ข้อมูลการเข้าสู่ระบบ
    if (isLoginMode) {
      let data = {
        email: formState.inputs.email.value,
        password: formState.inputs.password.value,
      };
      try {
        setLoading(true);
        await Axios.post(`${process.env.REACT_APP_BACKEND_URL}/users/login`, data).then(
          (res) => auth.login(res.data.token, res.data.userStatus)
        );
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setErrorMsg(catchErrors(error));
      }
    }
  };

  return (
    <form onSubmit={onSubmit}>
      {loading && <Loading loading={loading} />}
      <div className="GroupLogin">
        <h2 className="GroupLogin-h2">
          {isLoginMode ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
        </h2>
        {errorMsg && (
          <Alert variant="filled" severity="error">
            <AlertTitle>{errorMsg}</AlertTitle>
          </Alert>
        )}
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
