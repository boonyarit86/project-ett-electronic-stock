import React, { useState, useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "../../shared/hooks/form-hook";
import { getAllToolAction } from "../../actions/toolActions";
// import { createNotificationAction } from "../../actions/notificationActions";
import { Link } from "react-router-dom";
import { AuthContext } from "../../shared/context/auth-context";
// import { useHttpClient } from '../../shared/hooks/http-hook';

// Component
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead,
    TablePagination, TableRow, Avatar, Button, Card, CardContent, TextField
}
    from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
// import SelectFilter from '../../shared/components/UIElements/SelectFilter';
import Loading from '../../shared/components/UIElements/Loading';
// import ModalAction from './ModalAction';

// Icon
import RestorePageIcon from '@material-ui/icons/RestorePage';
import AddIcon from '@material-ui/icons/Add';
import VisibilityIcon from '@material-ui/icons/Visibility';

// CSS
import "./TableTool.css";

// ตัวกำหนดขนาด columns ของหน้านี้ เป็น function ของ material ui
const columns = [
    { label: 'รูปภาพ', minWidth: 60 },
    { label: 'ชื่ออุปกรณ์', minWidth: 120 },
    { label: 'รหัสอุปกรณ์', minWidth: 100 },
    {
        label: 'ชนิด', minWidth: 100, align: 'left',
    },
    {
        label: 'ประเภท', minWidth: 120, align: 'left',
    },
    {
        label: 'ขนาด', minWidth: 60, align: 'left',
    },
    {
        label: 'สถานะ', minWidth: 80, align: 'left',
    },
    {
        label: 'จำนวน', minWidth: 70, align: 'left',
    },
    {
        label: 'อื่นๆ', minWidth: 100, align: 'center',
    },
];

// CSS Material UI
const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    container: {
        maxHeight: 440,
    },
    btnAdd: {
        backgroundColor: "#28a745",
        color: "#fff"
    },
    input: {
        margin: "10px"
    }
}));

export default function TableTool() {

    // ตัวแปรของ function React
    const auth = useContext(AuthContext)
    const classes = useStyles()
    const dispatch = useDispatch()
    const { isLoading, tools, errorMsg } = useSelector((state) => state.toolLists);
    // ตัวแปรทั่วไปไว้เก็บค่าและกำหนดค่า
    // const [tools, setTools] = useState([])
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [openModal, setOpenModal] = useState(false)
    const [headerForm, setHeaderForm] = useState('')
    const [headerId, setHeaderId] = useState('')
    const [toolIndex, setToolIndex] = useState('')
    const [description, setDescription] = useState('')
    const [valueFilterType, setValueFilterType] = useState("ทั้งหมด")
    const [valueFilterStatus, setValueFilterStatus] = useState("ทั้งหมด")
    const [dataModal, setDataModal] = useState({})
    // const [msgError, setMsgError] = useState(false)
    const [defaultValue, setDefaultValue] = useState([])
    const [text, setText] = useState("")

    // function ตรวจสอบ error ของ Input ต่างๆ
    const [formState, inputHandler] = useForm(
        {
            total: {
                value: '',
                isValid: false
            }
        },
        false
    );

    useEffect(() => {
        dispatch(getAllToolAction(auth.token))
    }, [])

    // function การทำงานเกี่ยวกับหน้าตารางของ Material ui
    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value)
        setPage(0)
    };

    // function เปิด prompt
    const handleOpenModal = (index, header, tool) => {
        setHeaderForm(header + 'อุปกรณ์ ' + tool.toolName)
        setHeaderId(header)
        setToolIndex(index)
        setOpenModal(true)
        setDataModal(tool)
    };

    // function ปิด prompt
    // const handleCloseModal = () => {
    //     setOpenModal(false)
    //     setHeaderForm("")
    //     setToolIndex("")
    //     setDataModal({})
    // };

    // function เพิ่มอุปกรณ์ จะทำงานเมื่อผู้ใช้งานกดปุ่มเพิ่ม
    // const onSubmitAdd = async (e) => {
    //     e.preventDefault();
    //     // เตรียมข้อมูลที่จะส่งไป backend
    //     const data = {
    //         tid: dataModal._id,
    //         index: toolIndex,
    //         total: formState.inputs.total.value,
    //         actionType: "add",
    //         toolName: dataModal.toolName,
    //         description: description,
    //         userName: auth.userName,
    //         status: auth.userStatus
    //     }

    //     // ตรวจสอบว่าจำนวนอุปกรณ์ที่ต้องการเบิกมีค่าติดลบไหม
    //     if (formState.inputs.total.value < 0) {
    //         setMsgError("จำนวนอุปกรณ์ที่กรอกเข้าไปมีค่าติดลบไม่ได้")
    //         setOpenModal(false)
    //     }
    //     // ถ้าไม่มีข้อผิดพลาด ส่งข้อมูลไปยัง backend
    //     else {
    //         let newValue = tools
    //         // คำนวณว่าอุปกรณ์เหลือในสต๊อกเท่าไร แล้วอัพเดตข้อมูลในตารางรายการอุปกรณ์
    //         newValue[toolIndex].total = newValue[toolIndex].total + Number(formState.inputs.total.value)
    //         setTools(newValue)
    //         // Redux
    //         setOpenModal(false)
    //         await dispatch(addToolToTotal(data));

    //         // เมื่อเสร็จขั้นตอนแล้วกำหนดค่าทุกอย่างให้เป็นค่าว่าง
    //         setToolIndex("")
    //         setDescription("")
    //         setMsgError(false)
    //     }

    // }

    // function เบิกอุปกรณ์ จะทำงานเมื่อผู้ใช้งานกดปุ่มเบิก
    // const onSubmitRequest = async (e) => {
    //     e.preventDefault()
    //     // เตรียมข้อมูลที่จะส่งไป backend
    //     const data = {
    //         tid: dataModal._id,
    //         index: toolIndex,
    //         total: formState.inputs.total.value,
    //         actionType: "request",
    //         toolName: dataModal.toolName,
    //         description: description,
    //         userName: auth.userName,
    //         status: auth.userStatus
    //     }

    //     // ตรวจสอบว่าจำนวนอุปกรณ์ที่ต้องการเบิกมีค่าติดลบไหม
    //     if (formState.inputs.total.value <= 0) {
    //         setMsgError("จำนวนอุปกรณ์ที่กรอกเข้าไปต้องมีอย่างน้อย 1")
    //         setOpenModal(false)
    //     }
    //     // ตรวจสอบว่าอุปกรณ์ที่ต้องการเบิก มีค่าเกินมากกว่าจำนวนอุปกรณ์ที่อยู่ในสต๊อกไหม
    //     else if (Number(formState.inputs.total.value) > Number(dataModal.total)) {
    //         let calTool = Number(formState.inputs.total.value) - Number(dataModal.total)
    //         setMsgError(`${dataModal.toolName} ขาดจำนวน  - ${calTool} ตัว`)
    //         setOpenModal(false)
    //         // notifyErrorRequest()
    //     }
    //     // ถ้าไม่มีข้อผิดพลาด ส่งข้อมูลไปยัง backend
    //     else {
    //         let newValue = tools
    //         // คำนวณว่าอุปกรณ์เหลือในสต๊อกเท่าไร แล้วอัพเดตข้อมูลในตารางรายการอุปกรณ์
    //         newValue[toolIndex].total = newValue[toolIndex].total - Number(formState.inputs.total.value)
    //         if (newValue[toolIndex].total === 0) {
    //             let newNotification = [
    //                 {
    //                     post: `อุปกรณ์ ${newValue[toolIndex].toolName} หมด`,

    //                 }
    //             ]
    //             let newData = {
    //                 notifications: newNotification,
    //                 username: "ระบบสต๊อก",
    //                 status: "System",
    //                 image: "/images/profile.png"
    //             }
    //             await dispatch(createNotificationAction(newData))
    //             // console.log(newNotification)
    //         } else if (newValue[toolIndex].total < newValue[toolIndex].limit) {
    //             let newNotification = [
    //                 {
    //                     post: `อุปกรณ์ ${newValue[toolIndex].toolName} กำลังจะหมด จำนวนที่เหลือ ${newValue[toolIndex].total}`,
    //                 }
    //             ]
    //             let newData = {
    //                 notifications: newNotification,
    //                 username: "ระบบสต๊อก",
    //                 status: "System",
    //                 image: "/images/profile.png"
    //             }
    //             await dispatch(createNotificationAction(newData))
    //         }
    //         setTools(newValue)
    //         // Redux
    //         setOpenModal(false)
    //         await dispatch(requestToolToTotal(data));
    //         // เมื่อเสร็จขั้นตอนแล้วกำหนดค่าทุกอย่างให้เป็นค่าว่าง
    //         setToolIndex("")
    //         setDescription("")
    //         setMsgError(false)
    //     }
    // }

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
        <div>
            {/* {errorAction && <Alert variant="filled" severity="error"><AlertTitle>{errorAction}</AlertTitle></Alert>}
            {msgError !== false && <Alert severity="error">{msgError}</Alert>}
            {loadingAction && <Loading loading={loadingAction} />} */}
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
                                {tools.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((tool, index) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                            <TableCell align="left">
                                                <Avatar variant="square" src={tool.avartar.url} />
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
                                                {Number(tool.total) > Number(tool.limit) ?
                                                    <p>มี</p> :
                                                    Number(tool.total) === 0 ?
                                                        <p style={{ color: "red" }}>หมด</p> :
                                                        <p style={{ color: "orange" }}>กำลังจะหมด</p>
                                                }
                                            </TableCell>
                                            <TableCell align="left">
                                                <p>{tool.total}</p>
                                            </TableCell>
                                            <TableCell align="left">
                                                <div className="table-tool-btn-action">
                                                    <Button variant="contained" color="primary"
                                                        startIcon={<RestorePageIcon />}
                                                        onClick={() => handleOpenModal(index, "เบิก", tool)}
                                                        disabled={Number(tool.total) === 0}
                                                    >
                                                        เบิก
                                                    </Button>
                                                    {auth.status === "Admin" &&
                                                        <Button className={classes.btnAdd}
                                                            variant="contained"
                                                            startIcon={<AddIcon />}
                                                            onClick={() => handleOpenModal(index, "เพิ่ม", tool)}
                                                        >
                                                            เพิ่ม
                                                        </Button>
                                                    }
                                                    <Link to={`/${tool._id}/tool`}>
                                                        <Button variant="contained" color="default" startIcon={<VisibilityIcon />} >
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

            {/* <ModalAction
                handleCloseModal={handleCloseModal}
                onSubmitRequest={onSubmitRequest}
                onSubmitAdd={onSubmitAdd}
                inputHandler={inputHandler}
                formState={formState}
                openModal={openModal}
                headerForm={headerForm}
                headerId={headerId}
                description={description}
                setDescription={setDescription}
                data={dataModal}
            /> */}
        </div >
    );

}