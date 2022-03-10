import React, { useState, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { AuthContext } from "../../shared/context/auth-context";
import {
  getAllTypeAction,
  addTypeAction,
  deleteTypeAction,
  addCategoryAction,
  deleteCategoryAction,
  editTypeAction,
  editCategoryAction
} from "../../actions/sttActions";

// Components
import { Container, Paper } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import InputAdd from "../components/InputAdd";
import Loading from "../../shared/components/UIElements/Loading";
import SelectType from "../components/SelectType";
import TypeAction from "../components/TypeAction";
import CategoryLists from "../components/CategoryLists";
import ModalEditCategory from "../components/ModalEditCategory";
import { ToastContainer } from "react-toastify";


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
  header: {
    textAlign: "center"
  },
  paper: {
    padding: "10px 20px"
  }
}));

function SettingTool() {
  const classes = useStyles();
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const { isLoading, lists, errorMsg, isLoadingEdit, errorMsgEdit } =
    useSelector((state) => state.sttData);
  const [newType, setNewType] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [typeList, setTypeList] = useState({});
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    dispatch(getAllTypeAction(auth.token));
  }, []);

  const onChangeAddType = (e) => {
    setNewType(e.target.value);
  };

  const onChangeEditType = (e) => {
    setType(e.target.value);
  };

  const onChangeEditCategory = (e) => {
    setCategory(e.target.value);
  };

  const onChangeAddCategory = (e) => {
    setNewCategory(e.target.value);
  };

  const onChangeSelectType = (e) => {
    let data = e.target.value;
    setType(data.type);
    setTypeList(data);
  };

  const handleAddType = () => {
    dispatch(addTypeAction(auth.token, { type: newType }));
    setNewType("");
  };

  const handleEditType = () => {
    dispatch(editTypeAction(auth.token, { type: type }, typeList._id));
    setType("");
  };

  const handleEditCategory = () => {
    setOpenModal(false);
    dispatch(editCategoryAction(auth.token, { category: category }, typeList._id, categoryId));
    setCategory("");
    setCategoryId("");
  };

  const handleAddCategory = () => {
    let data = { tid: typeList._id, category: newCategory };
    dispatch(addCategoryAction(auth.token, data));
    setNewCategory("");
  };

  const handleDelete = () => {
    dispatch(deleteTypeAction(auth.token, typeList._id));
    setTypeList({});
    setType("");
  };

  const handleDeleteCategory = (cid) => {
    dispatch(deleteCategoryAction(auth.token, typeList._id, cid));
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCategory("");
    setCategoryId("");
  };

  const handleOpenModal = (text, cid) => {
    setOpenModal(true);
    setCategory(text);
    setCategoryId(cid);
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
      {isLoadingEdit && <Loading loading={isLoadingEdit} />}
      {!isLoadingEdit && errorMsgEdit && (
        <div style={{ margin: "10px" }}>
          <Alert variant="filled" severity="error">
            <AlertTitle>{errorMsgEdit}</AlertTitle>
          </Alert>
        </div>
      )}
      <Paper className={classes.paper}>
        <h3 className={classes.header}>ตั้งค่าอินพุตชนิดและประเภทของอุปกรณ์</h3>
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
        {typeList.type && (
          <TypeAction
            onClick={handleDelete}
            onChangeEdit={onChangeEditType}
            state={typeList}
            newState={type}
            onSubmitEdit={handleEditType}
          />
        )}
        {typeList.type && (
          <InputAdd
            onSubmit={handleAddCategory}
            onChange={onChangeAddCategory}
            state={newCategory}
            text="เพิ่มประเภทอุปกรณ์"
          />
        )}
        {typeList.categorys && (
          <CategoryLists
            state={typeList.categorys}
            handleDelete={handleDeleteCategory}
            handleModal={handleOpenModal}
          />
        )}
      </Paper>
      <ModalEditCategory
        onSubmit={handleEditCategory}
        value={category}
        onChange={onChangeEditCategory}
        openModal={openModal}
        handleCloseModal={handleCloseModal}
      />
      <ToastContainer />
    </Container>
  );
}

export default SettingTool;
