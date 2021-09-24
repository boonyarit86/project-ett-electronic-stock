import React, { useEffect, useState } from "react";
import {
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Divider,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete"
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: "10px 0",
  },
  selectGroup: {
    display: "flex",
    width: "100%",
  },
  typeSelect: {
    margin: "10px 5px 10px 0",
  },
  categorySelect: {
    margin: "10px 0 10px 5px",
  },
  listSelected: {
    border: "1px solid #ccc",
    borderRadius: "5px",
    margin: "10px 0"
}
}));

// Function Select รายการอุปกรณ์
function SelectTool({ data, toolsSelected, setToolsSelected }) {
  const classes = useStyles();
  const [total, setTotal] = useState("");
  const [tools, setTools] = useState([]);
  // select value --> "op1"
  const [toolType, setToolType] = useState("");
  const [toolCategory, setToolCategory] = useState("");
  const [toolName, setToolName] = useState("");
  // select options --> ["op1", "op2"]
  const [toolNameList, setToolNameList] = useState([]);
  const [toolCategoryList, setToolCategoryList] = useState([]);
  const [toolTypeList, setToolTypeList] = useState([]);
  // array value of select Components --> [{}]
  const [toolCategoryApi, setToolCategoryApi] = useState([]);
  const [toolNameApi, setToolNameApi] = useState([]);
  // after pass filtering all of select components
  const [tool, setTool] = useState(null);

  useEffect(async () => {
    let arr = [];
    await data.map((item, index) => {
      if (index === 0) {
        arr.push(item.type);
      } else {
        let isTheSame = arr.find((x) => x === item.type);
        if (!isTheSame) {
          arr.push(item.type);
        }
      }
    });
    setToolTypeList(arr);
    setTools(data);
  }, []);

  const onChangeToolType = async (e) => {
    let arr = [];
    setToolType(e.target.value);
    let findCategory = await tools.filter(
      (item) => item.type === e.target.value
    );
    await findCategory.map((item, index) => {
      if (index === 0) {
        arr.push(item.category);
      } else {
        let isFoundCate = arr.find((x) => x === item.category);
        if (!isFoundCate) {
          arr.push(item.category);
        }
      }
    });
    setToolCategoryApi(findCategory);
    setToolCategoryList(arr);
    setToolCategory("");
    setToolNameApi([]);
    setToolNameList([]);
    setToolName("");
    setTool(null);
  };

  const onChangeToolCategory = async (e) => {
    let arr = [];
    setToolCategory(e.target.value);
    let findName = await toolCategoryApi.filter(
      (item) => item.category === e.target.value
    );
    await findName.map((item, index) => {
      if (index === 0) {
        arr.push(item.toolName);
      } else {
        let isFoundName = arr.find((x) => x === item.toolName);
        if (!isFoundName) {
          arr.push(item.toolName);
        }
      }
    });
    setToolNameApi(findName);
    setToolNameList(arr);
    setToolName("");
    setTool(null);
    // console.log(findName)
  };

  const onChangeToolName = async (e) => {
    setToolName(e.target.value);
    let findName = await toolNameApi.filter(
      (item) => item.toolName === e.target.value
    );
    setTool(findName[0]);
    // console.log(findName)
  };

  const handleSelectedTool = async () => {
    let newData = tool;
    newData.total = total;
    let delToolFromList = await tools.filter(
      (item) => item._id !== newData._id
    );
    setTools(delToolFromList);
    setToolsSelected([...toolsSelected, newData]);
    setToolType("");
    setToolCategoryApi([]);
    setToolCategoryList([]);
    setToolCategory("");
    setToolNameApi([]);
    setToolNameList([]);
    setToolName("");
    setTool(null);
    setTotal("");
  };

  const deleteTool = async (tid) => {
    let findTool = await toolsSelected.find((item) => item._id === tid );
    if(findTool) {
        setTools([...tools, findTool])
    }
    let delToolFromList = await toolsSelected.filter((item) => item._id !== tid);
    setToolsSelected(delToolFromList);

    setToolType("");
    setToolCategoryApi([]);
    setToolCategoryList([]);
    setToolCategory("");
    setToolNameApi([]);
    setToolNameList([]);
    setToolName("");
    setTool(null);
    setTotal("");
  }

  return (
    <div>
      <div className={classes.selectGroup}>
        <FormControl
          variant="outlined"
          className={classes.typeSelect}
          style={{ width: "100%" }}
        >
          <InputLabel id="demo-simple-select-outlined-label">ชนิด</InputLabel>
          <Select
            labelId="demo-simple-select-outlined-label"
            id="demo-simple-select-outlined"
            value={toolType}
            onChange={onChangeToolType}
            label="ชนิด"
            fullWidth
          >
            {/* <MenuItem value="">
            <em>None</em>
          </MenuItem> */}
            {toolTypeList.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          variant="outlined"
          className={classes.categorySelect}
          style={{ width: "100%" }}
        >
          <InputLabel id="demo-simple-select-outlined-label">ประเภท</InputLabel>
          <Select
            labelId="demo-simple-select-outlined-label"
            id="demo-simple-select-outlined"
            value={toolCategory}
            onChange={onChangeToolCategory}
            label="ประเภท"
            fullWidth
            disabled={toolCategoryList.length === 0}
          >
            {toolCategoryList.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <FormControl
        variant="outlined"
        className={classes.margin}
        style={{ width: "100%" }}
      >
        <InputLabel id="demo-simple-select-outlined-label">
          ชื่ออุปกรณ์
        </InputLabel>
        <Select
          labelId="demo-simple-select-outlined-label"
          id="demo-simple-select-outlined"
          value={toolName}
          onChange={onChangeToolName}
          label="ชื่ออุปกรณ์"
          fullWidth
          disabled={toolNameList.length === 0}
        >
          {toolNameList.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="จำนวนอุปกรณ์"
        variant="outlined"
        type="number"
        fullWidth
        value={total}
        className={classes.margin}
        onChange={(e) => setTotal(e.target.value)}
      />
      <Button
        variant="contained"
        size="small"
        color="primary"
        className={classes.margin}
        onClick={handleSelectedTool}
        disabled={!tool || total === "" || total <= 0}
      >
        เพิ่ม
      </Button>
      <Divider />
      <h4>อุปกรณ์ที่ใช้ในบอร์ด</h4>
      {toolsSelected.length !== 0 && (
        <List className={classes.listSelected}>
          {toolsSelected.map((item) => (
            <ListItem key={item._id}>
              <ListItemText
                primary={item.toolName}
                secondary={`จำนวน ${item.total}`}
              />
              <ListItemSecondaryAction onClick={() => deleteTool(item._id)}>
                <IconButton edge="end" aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
}

export default SelectTool;
