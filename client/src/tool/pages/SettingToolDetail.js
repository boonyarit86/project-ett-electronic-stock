import React, { useState, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { AuthContext } from "../../shared/context/auth-context";
import { getAllTypeAction } from "../../actions/sttActions";

import { Container, Paper, TextField, Button } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import InputAdd from "../components/InputAdd";
import Loading from "../../shared/components/UIElements/Loading";
import SelectType from "../components/SelectType";
import TypeDelete from "../components/TypeDelete";
import CategoryLists from "../components/CategoryLists";

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

function SettingTool() {
  const classes = useStyles();
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const { isLoading, lists, errorMsg } = useSelector((state) => state.sttData);
  const [newType, setNewType] = useState("");
  const [newCategory, setNewCategory] = useState("");
  //   const [type, setType] = useState("");
  const [typeList, setTypeList] = useState({});

  useEffect(() => {
    dispatch(getAllTypeAction(auth.token));
  }, []);

  const onChangeAddType = (e) => {
    setNewType(e.target.value);
  };

  const onChangeAddCategory = (e) => {
    setNewCategory(e.target.value);
  };

  const onChangeSelectType = (e) => {
    let data = e.target.value;
    console.log(data);
    setTypeList(data);
  };

  const handleAddType = () => {
    console.log(newType);
    setNewType("");
  };

  const handleAddCategory = () => {
    console.log(newCategory);
    setNewCategory("");
  };

  const handleDelete = () => {
    let data = { tid: typeList._id }
    console.log(data);
    setTypeList({});
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
      {/* {isLoadingEdit && <Loading loading={isLoadingEdit} />}
      {!isLoadingEdit && errorMsgEdit && (
        <div style={{ margin: "10px" }}>
          <Alert variant="filled" severity="error">
            <AlertTitle>{errorMsgEdit}</AlertTitle>
          </Alert>
        </div>
      )} */}
      <Paper className="createtool-form">
        <div>setting</div>
        <InputAdd
          onSubmit={handleAddType}
          onChange={onChangeAddType}
          state={newType}
          text="เพิ่มชนิดอุปกรณ์"
        />
        <SelectType
          data={lists}
          onChange={onChangeSelectType}
          state={typeList}
        />
        {typeList.type && <TypeDelete onClick={handleDelete} state={typeList} />}
        {typeList.type && <InputAdd
          onSubmit={handleAddCategory}
          onChange={onChangeAddCategory}
          state={newCategory}
          text="เพิ่มประเภทอุปกรณ์"
        />}
        {typeList.categorys && <CategoryLists state={typeList.categorys} /> }
      </Paper>
    </Container>
  );
}

export default SettingTool;
