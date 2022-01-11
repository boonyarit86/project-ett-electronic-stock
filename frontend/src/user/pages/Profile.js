import React, { useEffect, useContext } from "react";
import { Container, Paper } from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { getUserByIdAction } from "../../actions/userActions";
import { AuthContext } from "../../shared/context/auth-context";

// components
import Loading from "../../shared/components/UIElements/Loading";
import { Alert, AlertTitle } from "@material-ui/lab";

export default function Profile() {
  // function React
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  // Redux
  const { user, isLoading, errorMsg } = useSelector((state) => state.userData);

  // เรียกข้อมูลจากฐานข้อมูล
  useEffect(() => {
    dispatch(getUserByIdAction(auth.token));
  }, []);

  if (isLoading) {
    return <Loading loading={isLoading} />;
  }

  if (!isLoading && errorMsg) {
    return (
      <div style={{margin: "10px"}}>
        <Alert variant="filled" severity="error">
          <AlertTitle>{errorMsg}</AlertTitle>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <Container maxWidth="sm">
        <h1 style={{ textAlign: "center" }}>โพรไฟล์</h1>
        <Paper
          style={{
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxSizing: "border-box",
          }}
        >
          <img
            style={{
              width: "200px",
              borderRadius: "5px",
            }}
            src={ user.avartar ? user.avartar.url : "/images/profile.png"}
            alt="jpg"
          />
          <h4>{user.name}</h4>
          <p>อีเมล์: {user.email}</p>
          <p style={{ margin: "0px" }}>สถานะ: {user.status}</p>
        </Paper>
      </Container>
    </div>
  );
}
