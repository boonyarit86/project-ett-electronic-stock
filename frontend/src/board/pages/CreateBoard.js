import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useForm } from "../../shared/hooks/form-hook";
import { AuthContext } from "../../shared/context/auth-context";
import { VALIDATOR_REQUIRE } from "../../shared/utils/validators";
import { useDispatch, useSelector } from "react-redux";
import { getAllToolAction } from "../../actions/toolActions";
// import { useFilter } from "../../shared/util/SelectFilterBoard2";
import { createBoardAction } from "../../actions/boardActions";
import { useHistory } from "react-router-dom";

// Component
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import Input from "../../shared/components/FormElements/Input";
import Loading from "../../shared/components/UIElements/Loading";
import {
  Container,
  Paper,
  TextField,
  Button,
} from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";

// CSS
import "./CreateBoard.css";
import SelectTool from "../components/SelectTool";

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
  inputFilter: {
    margin: "20px 0px",
    padding: "0 5px",
  },
  PaperFilter: {
    padding: "10px",
  },
  margin: {
    margin: "10px 0",
  },
  form: {
    margin: "30px auto",
  },
}));

function CreateBoard() {
  // Function React
  const auth = useContext(AuthContext);
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  // Redux
  // const createBoard = useSelector((state) => state.createBoard);
  const { isLoading, errorMsg } = useSelector((state) => state.toolLists);
  const { isLoadingActions, errorMsgActions } = useSelector(
    (state) => state.boardLists
  );
  // ตัวแปรเก็บค่าและกำหนดค่า
  const [tools, setTools] = useState(null);
  const [file, setFile] = useState(null);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [boardCode, setBoardCode] = useState("");
  const [toolsSelected, setToolsSelected] = useState([]);

  const [formState, inputHandler] = useForm(
    {
      name: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  // Get tools
  useEffect(() => {
    dispatch(getAllToolAction(auth.token, setTools));
  }, []);

  // send data to front-end
  const onSubmit = async (e) => {
    e.preventDefault();
    let newBoard = {
      boardName: formState.inputs.name.value,
      boardCode: boardCode,
      type: type,
      avartar: file,
      description: description,
      tools: toolsSelected,
    };
    // console.log(newBoard);
    dispatch(createBoardAction(auth.token, newBoard, history));
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

  //   console.log(tools)

  return (
    <Container maxWidth="sm" className={classes.form}>
      {isLoadingActions && <Loading loading={isLoadingActions} />}
      <h1>การสร้างบอร์ด</h1>
      <Paper className="createboard-form">
        <form onSubmit={onSubmit}>
          <Input
            id="name"
            element="input"
            type="text"
            label="ชื่อบอร์ด"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="โปรดใส่ข้อมูล."
            onInput={inputHandler}
            required
          />
          <TextField
            label="รหัสบอร์ด"
            variant="outlined"
            fullWidth
            type="text"
            className={classes.input}
            onChange={(e) => setBoardCode(e.target.value)}
          />
          <h3>รายการอุปกรณ์ที่ใช้ในบอร์ด</h3>
          <Paper className={classes.PaperFilter}>
            {tools && (
              <SelectTool
                data={tools}
                toolsSelected={toolsSelected}
                setToolsSelected={setToolsSelected}
              />
            )}
          </Paper>

          <TextField
            label="ชนิดงาน"
            variant="outlined"
            fullWidth
            type="text"
            className={classes.input}
            onChange={(e) => setType(e.target.value)}
          />

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

export default CreateBoard;
