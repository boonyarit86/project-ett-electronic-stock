import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { useForm } from "../../shared/hooks/form-hook";
import { VALIDATOR_REQUIRE } from "../../shared/utils/validators";
import { Container, Paper, TextField, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getToolAction, editToolAction } from "../../actions/toolActions";
import { AuthContext } from "../../shared/context/auth-context";
import { getAllTypeAction } from "../../actions/sttActions";

// Component
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import ImageUploadMultiple from "../../shared/components/FormElements/ImageUploadMultiple";
import Input from "../../shared/components/FormElements/Input";
import { Alert, AlertTitle } from "@material-ui/lab";
import Loading from "../../shared/components/UIElements/Loading";
import SelectCategory from "../components/SelectCategory";
import SelectTypeValidator from "../components/SelectTypeValidator";

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
  const { lists } = useSelector((state) => state.sttData);
  // ตัวแปรเก็บค่า
  const [file, setFile] = useState(tool.avartar ? tool.avartar.url : null);
  const [files, setFiles] = useState(tool.images ? tool.images : null);
  const [filesDel, setFilesDel] = useState([]);
  const [limit, setLimit] = useState(tool.limit || "");
  const [size, setSize] = useState(tool.size || "");
  const [description, setDescription] = useState(tool.description || "");
  const [toolCode, settoolCode] = useState(tool.toolCode || "");
  const [category, setCategory] = useState(false);
  const [type, setType] = useState(false);
  const [formState, inputHandler] = useForm(
    {
      name: {
        value: "",
        isValid: false,
      },
      type: {
        value: false,
        isValid: false,
      },
    },
    false
  );

  // เรียกข้อมูลจากฐานข้อมูล
  useEffect(() => {
    dispatch(getAllTypeAction(auth.token));
    dispatch(getToolAction(auth.token, toolId));
    return () => {};
  }, []);

  useEffect(async () => {
    if (tool && lists.length !== 0) {
      let findDataType = await lists.find((item) => item._id === tool.type);
      let findDataCate = await findDataType.categorys.find(
        (item) => item._id === tool.category
      );
      if(!findDataCate) {
        setCategory("")
      } else {
        setCategory(findDataCate);
      }
      setType(findDataType);
    }
  }, [tool && lists]);

  const onChangeSelectCategory = (e) => {
    let data = e.target.value;
    setCategory(data);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    let newTool = {
      id: tool._id,
      toolName: formState.inputs.name.value,
      toolCode: toolCode,
      type: formState.inputs.type.value._id,
      category: category !== "" ? category._id : "",
      size: size,
      avartar: file,
      limit: limit,
      description: description,
      images: files,
      imagesDel: filesDel,
    };
    // console.log(newTool)
    // console.log(tool.type + " : " + tool.category)
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
              {type && (<SelectTypeValidator
                id="type"
                filterName="ชนิด"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="โปรดเลือกข้อมูล."
                onInput={inputHandler}
                data={lists}
                setCategory={setCategory}
                initialValue={type}
                initialValid={true}
                required
              />)}

              {category !== false && (
                <SelectCategory
                  data={
                    formState.inputs.type ? formState.inputs.type.value : false
                  }
                  onChange={onChangeSelectCategory}
                  value={category}
                />
              )}
            </div>
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

export default EditTool;
