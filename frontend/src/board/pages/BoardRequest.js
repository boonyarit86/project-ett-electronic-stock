import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  getAllBoardAction,
  checkBoardAction,
  requestBoardAction
} from "../../actions/boardActions";
import { makeStyles } from "@material-ui/core/styles";
import { useForm } from "../../shared/hooks/form-hook";
import { VALIDATOR_REQUIRE } from "../../shared/utils/validators";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "../../shared/context/auth-context";

// Component
import Input from "../../shared/components/FormElements/Input";
import SelectValidation from "../../shared/components/FormElements/SelectValidation";
import { Container, Paper, Button, TextField } from "@material-ui/core";
import Loading from "../../shared/components/UIElements/Loading";
import { Alert, AlertTitle } from "@material-ui/lab";

// CSS
import "./BoardRequest.css";
import Messages from "../components/Messages";

// CSS Material UI
const useStyles = makeStyles((theme) => ({
  textarea: {
    margin: "0px 0",
  },
  input: {
    margin: "20px 0",
  },
  button: {
    margin: "10px 0",
  },
  btnCheck: {
    margin: "10px 0",
    backgroundColor: "#FFC107",
  },
  inputFilter: {
    margin: "20px 0px",
    padding: "0 5px",
  },
  PaperFilter: {
    padding: "10px",
  },
}));

function BoardRequest() {
  // ตัวแปร function ของ React
  const auth = useContext(AuthContext);
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  // Redux
  const { isLoading, errorMsg, isLoadingActions, errorMsgActions, msgs } =
    useSelector((state) => state.boardLists);
  // ตัวแปรไว้เก็บค่า
  const [boards, setBoards] = useState([]);
  const [description, setDescription] = useState("");

  // ตัวจับ error ของ Input หรือ Select
  const [formState, inputHandler] = useForm(
    {
      boardId: {
        value: "",
        isValid: false,
      },
      total: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  // function นี้ทำงานก่อนเมื่อเปิดเว็บมาหน้านี้
  // Get boards
  useEffect(() => {
    dispatch(getAllBoardAction(auth.token, setBoards));
  }, []);

  // function จัดการข้อมูลเมื่อกดปุ่มยืนยันการเบิก
  const onSubmit = async (e) => {
    e.preventDefault();

    // เตรียมข้อมูลการเบิกบอร์ดที่ต้องการส่งไปยัง backend
    if(msgs) {
      dispatch(requestBoardAction(auth.token, {msgs: msgs, description: description}, history))
    }
  };

  // function ตรวจสอบอุปกรณ์ของการเบิกบอร์ด
  const onSubmitCheck = () => {
    const boardId = formState.inputs.boardId.value;
    const selectedTotal = formState.inputs.total.value;
    let data = { total: selectedTotal }
    dispatch(checkBoardAction(auth.token, data, boardId))
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
    <Container maxWidth="sm">
      <h1>การเบิกบอร์ด</h1>
      {isLoadingActions && <Loading loading={isLoadingActions} />}
      {!isLoadingActions && errorMsgActions && (
        <div style={{ margin: "10px" }}>
          <Alert variant="filled" severity="error">
            <AlertTitle>{errorMsgActions}</AlertTitle>
          </Alert>
        </div>
      )}
      <Paper className="request-board-form">
        <form onSubmit={onSubmit}>
          <div>
            <SelectValidation
              id="boardId"
              data={boards}
              filterName="ชื่อบอร์ด"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="โปรดเลือกข้อมูล."
              onInput={inputHandler}
              required
            />
          </div>
          <div>
            <Input
              id="total"
              element="input"
              type="number"
              label="จำนวนบอร์ด"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="โปรดใส่ข้อมูล."
              onInput={inputHandler}
              required
            />
          </div>
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

          <Button
            type="button"
            variant="contained"
            fullWidth
            className={classes.btnCheck}
            disabled={!formState.isValid}
            onClick={onSubmitCheck}
          >
            ตรวจสอบ
          </Button>
          { msgs && <Messages msgs={msgs} />}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className={classes.button}
            disabled={!msgs}
          >
            ยืนยัน
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default BoardRequest;
