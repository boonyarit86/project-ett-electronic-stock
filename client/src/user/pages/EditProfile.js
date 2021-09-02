import React, { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { useParams } from "react-router-dom";
import { useForm } from "../../shared/hooks/form-hook";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_EMAIL,
} from "../../shared/utils/validators";
import { makeStyles } from "@material-ui/core/styles";
import { AuthContext } from "../../shared/context/auth-context";
import {
  getUserByIdAction,
  editUserByIdAction,
} from "../../actions/userActions";

// Component
import {
  Container,
  Paper,
  Button,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from "@material-ui/core";
import Input from "../../shared/components/FormElements/Input";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import SaveIcon from "@material-ui/icons/Save";
import Loading from "../../shared/components/UIElements/Loading";
import { Alert, AlertTitle } from "@material-ui/lab";

// CSS Material UI
const useStyles = makeStyles((theme) => ({
  button: {
    margin: "10px 10px 0 0",
  },
  paddingForm: {
    padding: "10px 20px",
  },
  input: {
    margin: "10px 0",
  },
  formControl: {
    width: "100%",
    margin: "20px 0",
  },
  containerEditProfile: {
    margin: "30px auto",
  },
}));

function EditProfile() {
  // function React
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const classes = useStyles();
  // Redux
  const { user, isLoading, errorMsg, isLoadingEdit, errorMsgEdit } =
    useSelector((state) => state.userData);
  // ตัวแปรกำหนดค่า
  const [file, setFile] = useState(user.avartar ? user.avartar.url : null);
  const [password, setPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");

  useEffect(() => {
    dispatch(getUserByIdAction(auth.token));
    return () => {};
  }, []);

  // ตรวจจับ Error ของ Input
  const [formState, inputHandler] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      name: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  // function แก้ไขข้อมูล
  const handleSubmitEdit = (e) => {
    e.preventDefault();
    const { email, name } = formState.inputs;
    const data = {
      id: user._id,
      email: email.value,
      name: name.value,
      password: password,
      oldPassword: oldPassword,
      avartar: file,
    };
    dispatch(editUserByIdAction(data));

    setFile(null);
    setPassword("");
    setOldPassword("");
  };

  if (isLoading) {
    return <Loading loading={isLoading} />;
  }

  if (!isLoading && errorMsg) {
    return (
      <div style={{ margin: "10px" }}>
        <Alert variant="filled" severity="error">
          <AlertTitle>{errorMsg}</AlertTitle>
        </Alert>
      </div>
    );
  }

  return (
    <Container maxWidth="sm" className={classes.containerEditProfile}>
      {isLoadingEdit && <Loading loading={isLoadingEdit} />}
      {!isLoadingEdit && errorMsgEdit && (
        <div style={{ margin: "10px" }}>
          <Alert variant="filled" severity="error">
            <AlertTitle>{errorMsgEdit}</AlertTitle>
          </Alert>
        </div>
      )}
      <h1>แก้ไขโปรไฟล์</h1>
      <Paper className={classes.paddingForm}>
        <Input
          id="email"
          element="input"
          type="email"
          label="อีเมล์"
          validators={[VALIDATOR_EMAIL()]}
          errorText="โปรดกรอกอีเมล์ของคุณ."
          onInput={inputHandler}
          initialValue={user.email}
          initialValid={true}
          required
          disabled={user.status === "Admin" || user.status === "Manager"}
        />
        <Input
          id="name"
          element="input"
          type="text"
          label="ชื่อในระบบ"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="โปรดกรอกชื่อของคุณ."
          onInput={inputHandler}
          initialValue={user.name}
          initialValid={true}
          required
        />
        <TextField
          label="รหัสผ่านใหม่"
          variant="outlined"
          fullWidth
          type="password"
          className={classes.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="รหัสผ่านเดิม"
          variant="outlined"
          fullWidth
          type="password"
          className={classes.input}
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <ImageUpload file={file} setFile={setFile} />

        <div className="EditProfile-action">
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            size="small"
            disabled={!formState.isValid}
            onClick={handleSubmitEdit}
            startIcon={<SaveIcon />}
          >
            บันทึก
          </Button>
          <Button
            className={classes.button}
            variant="contained"
            color="secondary"
            size="small"
          >
            ยกเลิก
          </Button>
        </div>
      </Paper>
    </Container>
  );
}

export default EditProfile;
