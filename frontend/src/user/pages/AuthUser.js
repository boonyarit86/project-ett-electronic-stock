import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import {
  getAllUserAction,
  approveUserAction,
  deleteUserAction,
  editStatusUserAction
} from "../../actions/userActions";
import { AuthContext } from "../../shared/context/auth-context";

// Components
import {
  Card,
  CardContent,
  Avatar,
  Button,
  ButtonGroup,
} from "@material-ui/core";
import ModalSubmit from "../components/ModalSubmit";
import { Alert, AlertTitle } from "@material-ui/lab";
import Loading from "../../shared/components/UIElements/Loading";
import { ToastContainer } from "react-toastify";

// Icon
import DeleteIcon from "@material-ui/icons/Delete";

// CSS
import "./AuthUser.css";

// CSS Material UI
const useStyles = makeStyles((theme) => ({
  image: {
    margin: "0 auto",
    width: theme.spacing(10),
    height: theme.spacing(10),
  },
  button: {
    margin: "0 5px",
  },
  card: {
    width: "90%",
    margin: "0 auto",
  },
  marginFilter: {},
  btnGroup: {
    margin: "10px 0"
  }
}));

function AuthUser() {
  // function React
  const classes = useStyles();
  const auth = useContext(AuthContext);
  // Redux
  const dispatch = useDispatch();
  const { userLists, isLoading, errorMsg, isLoadingEdit, errorMsgEdit } =
    useSelector((state) => state.authUser);
  // ตัวแปรเก็บค่า
  const [openPromptDelete, setOpenPromptDelete] = useState(false);
  const [openPromptApprove, setOpenPromptApprove] = useState(false);
  const [userId, setUserId] = useState("");
  const [userIndex, setUserIndex] = useState("");

  // ดึงข้อมูลมาแสดงบนหน้าจอ
  useEffect(() => {
    dispatch(getAllUserAction(auth.token));
    return () => {};
  }, []);

  // เปิดแบบฟอร์มลบข้อมูล
  const handleOpenPromptDelete = (id) => {
    setUserId(id);
    setOpenPromptDelete(true);
  };

  // ปิดแบบฟอร์มลบข้อมูล
  const handleClosePromptDelete = () => {
    setOpenPromptDelete(false);
    setUserId("");
  };

  // เปิดแบบฟอร์มอนุมัติผู้ใช้งาน
  const handleOpenPromptApprove = (id, index) => {
    setUserId(id);
    setUserIndex(index);
    setOpenPromptApprove(true);
  };

  // ปิดแบบฟอร์มอนุมัติผู้ใช้งาน
  const handleClosePromptApprove = () => {
    setOpenPromptApprove(false);
    setUserId("");
    setUserIndex("");
  };

  // function ลบผู้ใช้งานออกจากระบบ
  const handleSubmitPromptDelete = (e) => {
    e.preventDefault();
    setOpenPromptDelete(false);
    dispatch(deleteUserAction(auth.token, userId));
    setUserId("");
  };

  // function อนุมัติผู้ใช้งาน
  const handleSubmitPromptApprove = (e) => {
    e.preventDefault();
    setOpenPromptApprove(false);
    dispatch(approveUserAction(auth.token, userId));
    setUserId("");
    setUserIndex("");
  };

  const handleStatusUser = (userId, status) => {
    // console.log(uid + " : " + status);
    dispatch(editStatusUserAction(auth.token, { userId, newStatus: status }));
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
    <div className="container-users">
      {isLoadingEdit && <Loading loading={isLoadingEdit} />}
      {!isLoadingEdit && errorMsgEdit && (
        <div style={{ margin: "10px" }}>
          <Alert variant="filled" severity="error">
            <AlertTitle>{errorMsgEdit}</AlertTitle>
          </Alert>
        </div>
      )}
      <h1>การจัดการเข้าถึงของผู้ใช้ทั้งหมด</h1>
      <h3>ผู้ใช้งานในระบบ</h3>
      <React.Fragment>
        <div className="user-in-system">
          {userLists !== undefined &&
            userLists.map((user, index) => {
              if (user.status !== "none" && user.status !== "admin") {
                return (
                  <Card className="card-item" key={index}>
                    <CardContent>
                      <Avatar
                        className={classes.image}
                        alt=""
                        src={
                          user.avartar
                            ? user.avartar.url
                            : "/images/profile.png"
                        }
                      />
                      <h3>ชื่อในระบบ: {user.name}</h3>
                      <p>สถานะ {user.status}</p>
                      <ButtonGroup
                        variant="contained"
                        color="primary"
                        aria-label="contained primary button group"
                        className={classes.btnGroup}
                      >
                        <Button 
                        onClick={() => handleStatusUser(user._id, `${user.status === "staff" ? "user" : "staff"}`)}>
                          {user.status === "staff" ? "user" : "staff"}
                        </Button>
                        <Button 
                        onClick={() => handleStatusUser(user._id, "none")}>
                          none
                        </Button>
                      </ButtonGroup>
                      <Button
                        variant="contained"
                        color="secondary"
                        className={classes.button}
                        startIcon={<DeleteIcon />}
                        onClick={() => handleOpenPromptDelete(user._id)}
                      >
                        ลบออกจากระบบ
                      </Button>
                    </CardContent>
                  </Card>
                );
              }
            })}

          {userLists !== undefined &&
            userLists.filter(
              (user) => user.status === "user" || user.status === "admin"
            ).length === 0 && (
              <Card className={classes.card}>
                <CardContent>ไม่มีข้อมูล</CardContent>
              </Card>
            )}
        </div>

        <h3>รอการอนุมัติ</h3>
        <div className="user-in-system">
          {userLists !== undefined &&
            userLists.map((user, index) => {
              if (user.status === "none") {
                return (
                  <Card className="card-item" key={index}>
                    <CardContent>
                      <Avatar
                        className={classes.image}
                        alt=""
                        src="/images/profile.png"
                      />
                      <h3>ชื่อในระบบ: {user.name}</h3>
                      <p>สถานะ รอการอนุมัติ</p>
                      <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={() => handleOpenPromptApprove(user._id, index)}
                      >
                        อนุมัติ
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        className={classes.button}
                        startIcon={<DeleteIcon />}
                        onClick={() => handleOpenPromptDelete(user._id)}
                      >
                        ปฏิเสธ
                      </Button>
                    </CardContent>
                  </Card>
                );
              }
            })}

          {userLists !== undefined &&
            userLists.filter((user) => user.status === "none").length === 0 && (
              <Card className={classes.card}>
                <CardContent>ไม่มีข้อมูล</CardContent>
              </Card>
            )}
        </div>
      </React.Fragment>

      <ToastContainer />

      <ModalSubmit
        openPrompt={openPromptDelete}
        setOpenPrompt={setOpenPromptDelete}
        handleClosePrompt={handleClosePromptDelete}
        handleSubmitPrompt={handleSubmitPromptDelete}
      />

      <ModalSubmit
        openPrompt={openPromptApprove}
        setOpenPrompt={setOpenPromptApprove}
        handleClosePrompt={handleClosePromptApprove}
        handleSubmitPrompt={handleSubmitPromptApprove}
      />
    </div>
  );
}

export default AuthUser;
