import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useForm } from "../../shared/hooks/form-hook";
import { boardActions } from "../../actions/boardActions";
import { Link } from "react-router-dom";

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
import ModalAction from "./ModalAction";

// Icon
import RestorePageIcon from "@material-ui/icons/RestorePage";
import AddIcon from "@material-ui/icons/Add";
import VisibilityIcon from "@material-ui/icons/Visibility";

// CSS
import "./TableBoard.css";

// ตัวกำหนดขนาด columns ของหน้านี้ เป็น function ของ material ui
const columns = [
  { label: "รูปภาพ", minWidth: 60 },
  { label: "ชื่อบอร์ด", minWidth: 120 },
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
  { label: "รหัสบอร์ด", minWidth: 100 },
  {
    label: "ชนิด",
    minWidth: 100,
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

export default function TableBoard({ boards, auth, dispatch }) {
  // ตัวแปรของ function React
  const classes = useStyles();
  // ตัวแปรทั่วไปไว้เก็บค่าและกำหนดค่า
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const [headerForm, setHeaderForm] = useState("");
  const [board, setBoard] = useState({});
  const [action, setAction] = useState(null);
  const [description, setDescription] = useState("");

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
    setHeaderForm(actionType + " บอร์ด " + data.boardName);
    setOpenModal(true);
    setBoard(data);
    setAction(actionType);
  };

  // function ปิด prompt
  const handleCloseModal = () => {
    setOpenModal(false);
    setHeaderForm("");
    setBoard({});
    setAction(null);
  };


  // function เบิกและเพิ่มอุปกรณ์
  const onSubmitActions = async (e) => {
    e.preventDefault();
    let boardTotal = Number(formState.inputs.total.value);
    const data = {
      total: boardTotal,
      actionType: action,
      description: description,
    };
    dispatch(boardActions(auth.token, data, board._id))
    setOpenModal(false);
    setDescription("");
    setBoard({});
    setAction(null);
    setHeaderForm("")
  };

  return (
    <div>
      <React.Fragment>

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
                {boards
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((board, index) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                        <TableCell align="left">
                          <Avatar variant="square" src={board.avartar ? board.avartar.url : "/images/profile.png"} />
                        </TableCell>
                        <TableCell align="left">
                          <p>{board.boardName}</p>
                        </TableCell>
                        <TableCell align="left">
                          {Number(board.total) > Number(board.limit) ? (
                            <p>มี</p>
                          ) : Number(board.total) === 0 ? (
                            <p style={{ color: "red" }}>หมด</p>
                          ) : (
                            <p style={{ color: "orange" }}>กำลังจะหมด</p>
                          )}
                        </TableCell>
                        <TableCell align="left">
                          <p style={{ color: "#137333" }}>{board.total}</p>
                        </TableCell>
                        <TableCell align="left">
                          <p>{board.boardCode}</p>
                        </TableCell>
                        <TableCell align="left">
                          <p>{board.type}</p>
                        </TableCell>
                        <TableCell align="left">
                          <div className="table-board-btn-action">
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<RestorePageIcon />}
                              onClick={() => handleOpenModal("เบิก", board)}
                              disabled={Number(board.total) === 0}
                            >
                              เบิก
                            </Button>
                            {auth.userStatus !== "user" && (
                              <Button
                                className={classes.btnAdd}
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenModal("เพิ่ม", board)}
                              >
                                เพิ่ม
                              </Button>
                            )}
                            <Link to={`/${board._id}/board`}>
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
            count={boards.length}
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
        data={board}
      />
    </div>
  );
}
