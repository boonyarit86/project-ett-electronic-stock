import React from "react";
import {
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";

// Icon
import VisibilityIcon from "@material-ui/icons/Visibility";

const columns = [
  { label: "รูปภาพ", minWidth: 100 },
  { label: "ชื่ออุปกรณ์", minWidth: 100 },
  { label: "รหัสอุปกรณ์", minWidth: 100 },
  {
    label: "ชนิด",
    minWidth: 100,
    align: "left",
  },
  {
    label: "ประเภท",
    minWidth: 100,
    align: "left",
  },
  {
    label: "ขนาด",
    minWidth: 100,
    align: "left",
  },
  {
    label: "จำนวนที่ใช้ในบอร์ด",
    minWidth: 120,
    align: "left",
  },
  {
    label: "อื่นๆ",
    minWidth: 170,
    align: "left",
  },
];

// CSS Material UI
const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  container: {
    maxHeight: 440,
    margin: "30px 0",
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  textarea: {
    margin: "10px 0",
  },
  btnEdit: {
    backgroundColor: "#343a40",
    color: "#fff",
  },
}));

export function TableTool({ tools }) {
    
  const classes = useStyles();

  return (
    <>
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
              {tools.map((tool, index) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={tool._id}>
                    <TableCell align="left">
                      <Avatar
                        variant="square"
                        src={
                          tool.tool.avartar
                            ? tool.tool.avartar.url
                            : "/images/profile.png"
                        }
                      />
                    </TableCell>
                    <TableCell align="left">
                      <p>{tool.tool.toolName}</p>
                    </TableCell>
                    <TableCell align="left">
                      <p>{tool.tool.toolCode}</p>
                    </TableCell>
                    <TableCell align="left">
                      <p>{tool.tool.type}</p>
                    </TableCell>
                    <TableCell align="left">
                      <p>
                        {tool.tool.category === ""
                          ? "ไม่ได้กำหนด"
                          : tool.tool.category}
                      </p>
                    </TableCell>
                    <TableCell align="left">
                      <p>{tool.tool.size}</p>
                    </TableCell>
                    <TableCell align="left">
                      <p>{tool.total}</p>
                    </TableCell>
                    <TableCell align="left">
                      <div className="table-board-btn-action">
                        <Link to={`/${tool.tool._id}/tool`}>
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
      </Paper>
    </>
  );
}
