import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { useForm } from "../../shared/hooks/form-hook";
import { VALIDATOR_REQUIRE } from "../../shared/utils/validators";
import { getAllTypeAction } from "../../actions/sttActions";
import { AuthContext } from "../../shared/context/auth-context";

// Components
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import Input from "../../shared/components/FormElements/Input";
import { Container, Paper, TextField, Button } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
// import SelectType from '../components/SelectType';
// import SelectCategory from '../components/SelectCategory';
import Loading from "../../shared/components/UIElements/Loading";
import { createToolAction } from "../../actions/toolActions";
import SelectCategory from "../components/SelectCategory";
import SelectTypeValidator from "../components/SelectTypeValidator";

// CSS
import "./CreateTool.css";

// CSS Material UI
const useStyles = makeStyles((theme) => ({
  textarea: {
    margin: "20px 0",
  },
  input: {
    margin: "20px 0",
  },
  button: {
    margin: "20px 0",
  },
  form: {
    margin: "30px auto",
  },
}));

function CreateTool() {
  // Function React
  const classes = useStyles();
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const history = useHistory();
  // Redux
  const { isLoading, lists, errorMsg } = useSelector((state) => state.sttData);
  const { isLoadingActions, errorMsgActions } = useSelector(
    (state) => state.toolLists
  );
  // ตัวแปรเก็บค่า
  const [size, setSize] = useState("");
  const [description, setDescription] = useState("");
  const [toolCode, setToolCode] = useState("");
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");

  const [formState, inputHandler] = useForm(
    {
      name: {
        value: "",
        isValid: false,
      },
    },
    {
      type: {
        value: false,
        isValid: false,
      },
    },
    false
  );

  useEffect(() => {
    dispatch(getAllTypeAction(auth.token));

    return () => {};
  }, []);

  const onChangeSelectCategory = (e) => {
    let data = e.target.value;
    setCategory(data);
  };

  // send data to front-end
  const onSubmit = async (e) => {
    e.preventDefault();

    let newTool = {
      toolName: formState.inputs.name.value,
      toolCode: toolCode,
      type: formState.inputs.type.value._id,
      category: category !== "" ? category._id : "",
      size: size,
      avartar: file,
      description: description,
    };
    // console.log(newTool)
    dispatch(createToolAction(auth.token, newTool, history));
    setCategory("");
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
    <Container maxWidth="sm" className={classes.form}>
      <h1>การสร้างอุปกรณ์</h1>
      {isLoadingActions && <Loading loading={isLoadingActions} />}
      <Paper className="createtool-form">
        <form onSubmit={onSubmit}>
          <Input
            id="name"
            element="input"
            type="text"
            label="ชื่ออุปกรณ์"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="โปรดใส่ข้อมูล."
            onInput={inputHandler}
            required
          />
          <TextField
            label="รหัสอุปกรณ์"
            variant="outlined"
            fullWidth
            type="text"
            className={classes.input}
            onChange={(e) => setToolCode(e.target.value)}
          />
          <div className="createtool-input-group">
            <SelectTypeValidator
              id="type"
              filterName="ชนิด"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="โปรดเลือกข้อมูล."
              onInput={inputHandler}
              data={lists}
              setCategory={setCategory}
              required
            />

            <SelectCategory
              data={formState.inputs.type ? formState.inputs.type.value : false}
              onChange={onChangeSelectCategory}
              value={category}
            />
          </div>
          <div className="createtool-input-group">
            <TextField
              label="ขนาด"
              variant="outlined"
              fullWidth
              type="text"
              className={classes.input}
              onChange={(e) => setSize(e.target.value)}
            />
          </div>
          <ImageUpload file={file} setFile={setFile} />
          <TextField
            id="outlined-multiline-flexible"
            label="รายละเอียดเพิ่มเติม"
            multiline
            rowsMax={4}
            variant="outlined"
            fullWidth
            className={classes.textarea}
            onChange={(e) => setDescription(e.target.value)}
          />
          {!isLoadingActions && errorMsgActions && (
            <div style={{ margin: "10px" }}>
              <Alert variant="filled" severity="error">
                <AlertTitle>{errorMsgActions}</AlertTitle>
              </Alert>
            </div>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className={classes.button}
            disabled={!formState.isValid}
          >
            ยืนยัน
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default CreateTool;
