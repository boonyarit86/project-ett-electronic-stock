import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { restoreBoardAction } from "../../actions/boardActions";
import { time } from "../../shared/utils/Time";

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
  Button,
} from "@material-ui/core";

// Icon
import RestoreIcon from "@material-ui/icons/Restore";
import DescriptionIcon from "@material-ui/icons/Description";
import ModalSubmit from "./ModalSubmitBoard";
import ModalDescription from "./ModalDescription2";

// CSS
// import "./TableTool.css";

// ตัวกำหนดขนาด columns ของหน้านี้ เป็น function ของ material ui
const columns = [
  { label: "เลขที่การใช้งาน", minWidth: 100 },
  { label: "วันที่", minWidth: 70 },
  { label: "ชื่อบอร์ด", minWidth: 170 },
  {
    label: "ชื่อผู้เบิก",
    minWidth: 100,
  },
  {
    label: "สถานะผู้เบิก",
    minWidth: 100,
  },
  {
    label: "จำนวน",
    minWidth: 70,
  },
  {
    label: "เวลา",
    minWidth: 70,
  },
  {
    label: "วันหมดอายุ",
    minWidth: 70,
  },
  {
    label: "อื่นๆ",
    minWidth: 250,
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
  actionAdd: {
    color: "#28a745",
  },
  actionRequest: {
    color: "#dc3545",
  },
  input: {
    margin: "10px",
  },
  btn: {
    marginRight: "10px",
  },
}));

export default function HistoryTableBoard({ hisbs, auth, dispatch, setData }) {
  // ตัวแปรของ function React
  const classes = useStyles();
  // ตัวแปรทั่วไปไว้เก็บค่าและกำหนดค่า
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [description, setDescription] = useState(null);
  const [openRestore, setOpenRestore] = useState(false);
  const [openDescription, setOpenDescription] = useState(false);
  const [dataSubmit, setDataSubmit] = useState({});
  const [dataDes, setDataDes] = useState({});

  const [formatDate, formatTime] = time();

  // function การทำงานเกี่ยวกับหน้าตารางของ Material ui
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleOpenRestore = (item) => {
    setOpenRestore(true);
    setDataSubmit(item);
  };

  const handleCloseRestore = () => {
    setOpenRestore(false);
    setDescription(null);
    setDataSubmit({});
  };

  // จัดการข้อมูลการยกเลิกเบิกของ เมื่อกดปุ่มยืนยัน
  const handleSubmitRestore = () => {
    let data = {
      hbid: dataSubmit._id,
      bid: dataSubmit.board._id,
      description: description,
    };
    let path;
    if(dataSubmit.actionType === "เบิก" || dataSubmit.actionType === "เพิ่ม") {
      path = "restore"
    } else if (dataSubmit.actionType === "เบิกบอร์ดแบบชุด") {
      path = "restore/boardandtools"
    }
    dispatch(restoreBoardAction(auth.token, data, path, setData));
    // console.log(data)
    setDescription(null);
    setOpenRestore(false);
    setDataSubmit({});
  };

  const handleOpenDescription = (description) => {
    setDataDes(description);
    setOpenDescription(true);
  };

  const handleCloseDescription = () => {
    setOpenDescription(false);
    setDataDes({});
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
                {hisbs
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((hisb, index) => {
                    return (
                      <TableRow key={index} hover role="checkbox" tabIndex={-1}>
                        <TableCell>{hisb.code}</TableCell>
                        <TableCell>{formatDate(hisb.date)}</TableCell>
                        <TableCell>{hisb.board.boardName}</TableCell>
                        <TableCell>{hisb.user ? hisb.user.name : "ไม่มีข้อมูล"}</TableCell>
                        <TableCell>{hisb.user ? hisb.user.status : "ไม่มีข้อมูล"}</TableCell>
                        <TableCell>
                          {hisb.actionType === "เพิ่ม" ? (
                            <span className={classes.actionAdd}>
                              + {hisb.total}
                            </span>
                          ) : (
                            <span className={classes.actionRequest}>
                              - {hisb.total}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{formatTime(hisb.date)}</TableCell>
                        <TableCell>{formatDate(hisb.exp)}</TableCell>
                        <TableCell>
                          <div>
                            {auth.userStatus !== "user" && hisb.total !== 0 && (
                              <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<RestoreIcon />}
                                className={classes.btn}
                                onClick={() => handleOpenRestore(hisb)}
                              >
                                ยกเลิก
                              </Button>
                            )}
                            <Button
                              variant="contained"
                              color="default"
                              startIcon={<DescriptionIcon />}
                              onClick={() => handleOpenDescription(hisb)}
                            >
                              เพิ่มเติม
                            </Button>
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
            count={hisbs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Paper>
      </React.Fragment>
      {/* // } */}

      {openRestore && (
        <ModalSubmit
          handleClosePrompt={handleCloseRestore}
          handleSubmitPrompt={handleSubmitRestore}
          openPrompt={openRestore}
          setDescription={setDescription}
          item={dataSubmit}
        />
      )}

      {openDescription && (
        <ModalDescription
          openPrompt={openDescription}
          handleClosePrompt={handleCloseDescription}
          data={dataDes}
        />
      )}

      {/* Prompt Request & Add Form */}
    </div>
  );
}
