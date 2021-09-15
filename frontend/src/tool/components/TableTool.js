import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useForm } from "../../shared/hooks/form-hook";
import { toolActions } from "../../actions/toolActions";
// import { createNotificationAction } from "../../actions/notificationActions";
import { Link } from "react-router-dom";
// import Axios from "axios";

// Component
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Avatar,
  Button,
} from "@material-ui/core";
// import SelectFilter from '../../shared/components/UIElements/SelectFilter';
import ModalAction from "./ModalAction";

// Icon
import RestorePageIcon from "@material-ui/icons/RestorePage";
import AddIcon from "@material-ui/icons/Add";
import VisibilityIcon from "@material-ui/icons/Visibility";

// CSS
import "./TableTool.css";

// ตัวกำหนดขนาด columns ของหน้านี้ เป็น function ของ material ui
const columns = [
  { label: "รูปภาพ", minWidth: 60 },
  { label: "ชื่ออุปกรณ์", minWidth: 120 },
  { label: "รหัสอุปกรณ์", minWidth: 100 },
  {
    label: "ชนิด",
    minWidth: 100,
    align: "left",
  },
  {
    label: "ประเภท",
    minWidth: 120,
    align: "left",
  },
  {
    label: "ขนาด",
    minWidth: 60,
    align: "left",
  },
  {
    label: "สถานะ",
    minWidth: 80,
    align: "left",
  },
  {
    label: "จำนวน",
    minWidth: 70,
    align: "left",
  },
  {
    label: "อื่นๆ",
    minWidth: 100,
    align: "center",
  },
];

// CSS Material UI
const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  container: {
    maxHeight: 440,
  },
  btnAdd: {
    backgroundColor: "#28a745",
    color: "#fff",
  },
  input: {
    margin: "10px",
  },
}));

export default function TableTool({ tools, auth, dispatch }) {
  // ตัวแปรของ function React
  const classes = useStyles();
  // ตัวแปรทั่วไปไว้เก็บค่าและกำหนดค่า
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const [headerForm, setHeaderForm] = useState("");
  const [tool, setTool] = useState({});
  const [action, setAction] = useState(null);
  const [description, setDescription] = useState("");
  // const [valueFilterType, setValueFilterType] = useState("ทั้งหมด");
  // const [valueFilterStatus, setValueFilterStatus] = useState("ทั้งหมด");
  // const [dataModal, setDataModal] = useState({});
  // const [defaultValue, setDefaultValue] = useState([]);
  // const [text, setText] = useState("");

  // function ตรวจสอบ error ของ Input ต่างๆ
  const [formState, inputHandler] = useForm(
    {
      total: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  // function การทำงานเกี่ยวกับหน้าตารางของ Material ui
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // function เปิด prompt
  const handleOpenModal = (actionType, data) => {
    setHeaderForm(actionType + " อุปกรณ์ " + data.toolName);
    setOpenModal(true);
    setTool(data);
    setAction(actionType);
  };

  // function ปิด prompt
  const handleCloseModal = () => {
    setOpenModal(false);
    setHeaderForm("");
    setTool({});
    setAction(null);
  };

  // function เบิกและเพิ่มอุปกรณ์
  const onSubmitActions = async (e) => {
    e.preventDefault();
    let toolTotal = Number(formState.inputs.total.value);
    const data = {
      total: toolTotal,
      actionType: action,
      description: description,
    };
    dispatch(toolActions(auth.token, data, tool._id))
    setOpenModal(false);
    setDescription("");
    setTool({});
    setAction(null);
    setHeaderForm("")
  };

  // function ค้นหาชื่ออุปกรณ์ในตาราง
  // const onTextChanged = (e) => {
  //     const value = e.target.value;
  //     let suggestions = []
  //     if (value.length > 0) {
  //         // หาข้อมูลโดยใช้ตัวแปร name เช่น props.data[0].name ของข้อมูลด้านบน
  //         const regex = new RegExp(`^${value}`, 'i');
  //         suggestions = tools.sort().filter(res => regex.test(res.toolName))
  //     }

  //     // ถ้าไม่ได้พิมพ์อะไรให้กำหนดข้อมูลเป็นค่า default
  //     if (value.length === 0) {
  //         suggestions = defaultValue
  //     }
  //     setText(value);
  //     setTools(suggestions)
  // }

  return (
    <div>
      <React.Fragment>
        {/* <SelectFilter
                    label="ชนิด"
                    defaultValue={defaultValue}
                    data={tools} setData={setTools}
                    filterType="type"
                    setValueFilterType={setValueFilterType}
                    valueFilterType={valueFilterType}
                    valueFilterStatus={valueFilterStatus}
                    setValueFilterStatus={setValueFilterStatus}
                />
                <SelectFilter
                    label="สถานะ"
                    defaultValue={defaultValue}
                    data={tools} setData={setTools}
                    filterType="status"
                    setValueFilterType={setValueFilterType}
                    valueFilterType={valueFilterType}
                    valueFilterStatus={valueFilterStatus}
                    setValueFilterStatus={setValueFilterStatus}
                /> */}
        {/* <TextField
                    label="ค้นหาชื่ออุปกรณ์"
                    type="text"
                    className={classes.input}
                    value={text} onChange={onTextChanged}
                /> */}

        <Paper className={classes.root}>
          <TableContainer className={classes.container}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableCell
                      key={index}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tools
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((tool, index) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                        <TableCell align="left">
                          <Avatar variant="square" src={tool.avartar ? tool.avartar.url : "/images/profile.png"} />
                        </TableCell>
                        <TableCell align="left">
                          <p>{tool.toolName}</p>
                        </TableCell>
                        <TableCell align="left">
                          <p>{tool.toolCode}</p>
                        </TableCell>
                        <TableCell align="left">
                          <p>{tool.type}</p>
                        </TableCell>
                        <TableCell align="left">
                          <p>{tool.category}</p>
                        </TableCell>
                        <TableCell align="left">
                          <p>{tool.size}</p>
                        </TableCell>
                        <TableCell align="left">
                          {Number(tool.total) > Number(tool.limit) ? (
                            <p>มี</p>
                          ) : Number(tool.total) === 0 ? (
                            <p style={{ color: "red" }}>หมด</p>
                          ) : (
                            <p style={{ color: "orange" }}>กำลังจะหมด</p>
                          )}
                        </TableCell>
                        <TableCell align="left">
                          <p>{tool.total}</p>
                        </TableCell>
                        <TableCell align="left">
                          <div className="table-tool-btn-action">
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<RestorePageIcon />}
                              onClick={() => handleOpenModal("เบิก", tool)}
                              disabled={Number(tool.total) === 0}
                            >
                              เบิก
                            </Button>
                            {auth.userStatus === "admin" && (
                              <Button
                                className={classes.btnAdd}
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenModal("เพิ่ม", tool)}
                              >
                                เพิ่ม
                              </Button>
                            )}
                            <Link to={`/${tool._id}/tool`}>
                              <Button
                                variant="contained"
                                color="default"
                                startIcon={<VisibilityIcon />}
                              >
                                ดู
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={tools.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Paper>
      </React.Fragment>
      {/* // } */}

      {/* Prompt Request & Add Form */}

      <ModalAction
        handleCloseModal={handleCloseModal}
        onSubmitActions={onSubmitActions}
        inputHandler={inputHandler}
        formState={formState}
        openModal={openModal}
        headerForm={headerForm}
        description={description}
        setDescription={setDescription}
        data={tool}
      />
    </div>
  );
}
