import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { useForm } from "../../shared/hooks/form-hook";
import { VALIDATOR_REQUIRE } from "../../shared/utils/validators";
import { Container, Paper, TextField, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
// import { typeAndcategory_select } from "../../Api";
import { getToolAction, editToolAction } from "../../actions/toolActions";
import { AuthContext } from "../../shared/context/auth-context";

// Component
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
// import ImageUploadMultiple from "../../shared/components/FormElements/ImageUploadMultiple";
import Input from "../../shared/components/FormElements/Input";
// import SelectType from "../components/SelectType";
// import SelectCategory from "../components/SelectCategory";
import { Alert, AlertTitle } from "@material-ui/lab";
import Loading from "../../shared/components/UIElements/Loading";

// CSS
import "./EditTool.css";

// CSS Material UI
const useStyles = makeStyles((theme) => ({
  container: {
    margin: "30px auto",
  },
  margin: {
    margin: "10px 0",
  },
}));

function EditTool() {
  // function React
  const auth = useContext(AuthContext);
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const toolId = useParams().tid;
  // Redux
  const { tool, isLoading, errorMsg, isLoadingEdit, errorMsgEdit } =
    useSelector((state) => state.toolList);
  // const editTool = useSelector((state) => state.editTool)
  // ตัวแปรเก็บค่า
  const [file, setFile] = useState(tool.avartar ? tool.avartar.url : false);
  const [files, setFiles] = useState(tool.images ? tool.images : false);
  const [filesDel, setFilesDel] = useState([]);
  const [limit, setLimit] = useState(tool.limit || "");
  const [size, setSize] = useState(tool.size || "");
  const [description, setDescription] = useState(tool.description || "");
  const [toolCode, settoolCode] = useState(tool.toolCode || "");
  //   const [selectValue] = useState(typeAndcategory_select);
//   const [categoryValue, setCategoryValue] = useState("");
  //   const [categorySelect, setCategorySelect] = useState([]);
  //   const [isEditSuccess, setIsEditSuccess] = useState(false);

  const [formState, inputHandler] = useForm(
    {
      name: {
        value: "",
        isValid: false,
      },
      //   type: {
      //     value: "",
      //     isValid: false,
      //   },
    },
    false
  );

  // เรียกข้อมูลจากฐานข้อมูล
  useEffect(() => {
    dispatch(getToolAction(auth.token, toolId));
    return () => {};
  }, []);

  //   useEffect(() => {
  //     if (editTool.editSuccess && isEditSuccess) {
  //       setIsEditSuccess(false);
  //       history.push(`/${toolId}/tool`);
  //     }
  //     return () => {};
  //   }, [isEditSuccess]);

  const onSubmit = (e) => {
    e.preventDefault();
    let newTool = {
      id: tool._id,
      toolName: formState.inputs.name.value,
      toolCode: toolCode,
      type: tool.type,
      category: tool.category,
      size: size,
      avartar: file,
      limit: limit,
      description: description,
      images: files,
      imagesDel: filesDel,
    };

    dispatch(editToolAction(auth.token, newTool, history));
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
        <h1>แก้ไข {tool.toolName}</h1>
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
              initialValue={tool.toolName}
              initialValid={true}
              required
            />
            <TextField
              label="รหัสอุปกรณ์"
              variant="outlined"
              fullWidth
              type="text"
              value={toolCode}
              className={classes.margin}
              onChange={(e) => settoolCode(e.target.value)}
            />
            <div className="edittool-input-group">
              <TextField
                label="ตัวเลขการแจ้งเตือน"
                variant="outlined"
                helperText="เมื่อจำนวนอุปกรณ์น้อยกว่าค่านี้จะมีการแจ้งเตือนสถานะ"
                type="number"
                fullWidth
                value={limit}
                className={classes.margin}
                onChange={(e) => setLimit(e.target.value)}
              />
              <TextField
                label="ขนาด"
                variant="outlined"
                type="text"
                fullWidth
                value={size}
                className={classes.margin}
                onChange={(e) => setSize(e.target.value)}
              />
            </div>
            <div className="edittool-input-group">
              {/* <SelectType
                selectValue={selectValue}
                id="type"
                filterName="ชนิด"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="โปรดเลือกข้อมูล."
                onInput={inputHandler}
                setCategorySelect={setCategorySelect}
                initialValue={tool.type}
                initialValid={true}
                required
              />
              <SelectCategory
                selectValue={categorySelect}
                setCategoryValue={setCategoryValue}
                categoryValue={categoryValue}
                initialValue={tool.category}
              /> */}
            </div>
            <ImageUpload file={file} setFile={setFile} />
            {/* <ImageUploadMultiple
              files={files}
              setFiles={setFiles}
              setFilesDel={setFilesDel}
              filesDel={filesDel}
            /> */}
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

export default EditTool;
