import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { useForm } from "../../shared/hooks/form-hook";
import { VALIDATOR_REQUIRE } from "../../shared/utils/validators";
import { Container, Paper, TextField, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getBoardAction, editBoardAction } from "../../actions/boardActions";
import { AuthContext } from "../../shared/context/auth-context";
import { getAllToolAction } from "../../actions/toolActions";

// Component
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import ImageUploadMultiple from "../../shared/components/FormElements/ImageUploadMultiple";
import Input from "../../shared/components/FormElements/Input";
import { Alert, AlertTitle } from "@material-ui/lab";
import Loading from "../../shared/components/UIElements/Loading";
import SelectTool from "../components/SelectTool";

// CSS
import "./EditBoard.css";

// CSS Material UI
const useStyles = makeStyles((theme) => ({
  container: {
    margin: "30px auto",
  },
  margin: {
    margin: "10px 0",
  },
  PaperFilter: {
    padding: "10px",
  }
}));

function EditBoard() {
  // function React
  const auth = useContext(AuthContext);
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const boardId = useParams().bid;
  // Redux
  const { board, isLoading, errorMsg, isLoadingEdit, errorMsgEdit } =
    useSelector((state) => state.boardList);
  // ตัวแปรเก็บค่า
  const [file, setFile] = useState(board.avartar ? board.avartar.url : null);
  const [files, setFiles] = useState(board.images ? board.images : null);
  const [filesDel, setFilesDel] = useState([]);
  const [limit, setLimit] = useState(board.limit || "");
  const [description, setDescription] = useState(board.description || "");
  const [boardCode, setBoardCode] = useState(board.boardCode || "");
  const [type, setType] = useState(board.type || "");
  const [toolsSelected, setToolsSelected] = useState([]);
  const [tools, setTools] = useState([]);
  const [formState, inputHandler] = useForm(
    {
      name: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  // เรียกข้อมูลจากฐานข้อมูล
  useEffect(() => {
    dispatch(getBoardAction(auth.token, boardId));
    dispatch(getAllToolAction(auth.token, setTools));
    return () => {};
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    let newBoard = {
      id: board._id,
      boardName: formState.inputs.name.value,
      boardCode: boardCode,
      type: type,
      avartar: file,
      limit: limit,
      description: description,
      images: files,
      imagesDel: filesDel,
      tools: toolsSelected
    };
    console.log(newBoard)
    // console.log(tool.type + " : " + tool.category)
    dispatch(editBoardAction(auth.token, newBoard, history));
    // setIsEditSuccess(true);
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
    <Container className={classes.container}>
      {isLoadingEdit && <Loading loading={isLoadingEdit} />}
      {!isLoadingEdit && errorMsgEdit && (
        <div style={{ margin: "10px" }}>
          <Alert variant="filled" severity="error">
            <AlertTitle>{errorMsgEdit}</AlertTitle>
          </Alert>
        </div>
      )}
      <>
        <h1>แก้ไข {board.boardName}</h1>
        <Paper>
          <form onSubmit={onSubmit}>
            <Input
              id="name"
              element="input"
              type="text"
              label="ชื่ออุปกรณ์"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="โปรดใส่ข้อมูล."
              onInput={inputHandler}
              initialValue={board.boardName}
              initialValid={true}
              required
            />
            <TextField
              label="รหัสอุปกรณ์"
              variant="outlined"
              fullWidth
              type="text"
              value={boardCode}
              className={classes.margin}
              onChange={(e) => setBoardCode(e.target.value)}
            />
            <div className="edittool-input-group">
              <TextField
                label="ตัวเลขการแจ้งเตือน"
                variant="outlined"
                helperText="เมื่อจำนวนบอร์ดน้อยกว่าค่านี้จะมีการแจ้งเตือนสถานะ"
                type="number"
                fullWidth
                value={limit}
                className={classes.margin}
                onChange={(e) => setLimit(e.target.value)}
              />
              <TextField
                label="ชนิดบอร์ด"
                variant="outlined"
                fullWidth
                type="text"
                value={type}
                className={classes.margin}
                onChange={(e) => setType(e.target.value)}
              />
            </div>
            <h3>รายการอุปกรณ์ที่ใช้ในบอร์ด</h3>
            <Paper className={classes.PaperFilter}>
            { tools.length !== 0 && ( <SelectTool
              data={tools}
              toolsSelected={toolsSelected}
              setToolsSelected={setToolsSelected}
              initialValue={board.tools}
            /> )}
            </Paper>
            <ImageUpload file={file} setFile={setFile} />
            <ImageUploadMultiple
              files={files}
              setFiles={setFiles}
              setFilesDel={setFilesDel}
              filesDel={filesDel}
            />
            <TextField
              id="outlined-multiline-flexible"
              label="รายละเอียดเพิ่มเติม"
              multiline
              rowsMax={4}
              variant="outlined"
              fullWidth
              className={classes.margin}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              className={classes.margin}
              disabled={!formState.isValid}
            >
              อัพเดต
            </Button>
          </form>
        </Paper>
      </>
    </Container>
  );
}

export default EditBoard;
