import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from '@material-ui/core/styles';
import { useForm } from "../../shared/hooks/form-hook";
import { VALIDATOR_REQUIRE } from "../../shared/utils/validators";
// import { typeAndcategory_select } from "../../Api";

// Components
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import Input from "../../shared/components/FormElements/Input";
import { Container, Paper, TextField, Button } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
// import SelectType from '../components/SelectType';
// import SelectCategory from '../components/SelectCategory';
import Loading from '../../shared/components/UIElements/Loading';
// import { createtoolAction } from "../../actions/toolActions";


// CSS
import "./CreateTool.css";

// CSS Material UI
const useStyles = makeStyles((theme) => ({
    textarea: {
        margin: "20px 0"
    },
    input: {
        margin: "20px 0"
    },
    button: {
        margin: "20px 0"
    },
    form: {
        margin: "30px auto"
    }
}));

function CreateTool() {
    // Function React
    const classes = useStyles();
    const dispatch = useDispatch();
    const history = useHistory();
    // Redux
    const createTool = useSelector((state) => state.createTool)
    // const { loading, error } = createTool;
    // ตัวแปรเก็บค่า
    const [size, setSize] = useState('');
    const [description, setDescription] = useState('');
    const [toolCode, setToolCode] = useState('');
    const [file, setFile] = useState(null);
    // const [selectValue] = useState(typeAndcategory_select);
    const [categoryValue, setCategoryValue] = useState("");
    const [categorySelect, setCategorySelect] = useState([]);
    const [createSuccess, setCreateSuccess] = useState(false);

    const [formState, inputHandler] = useForm(
        {
            name: {
                value: '',
                isValid: false
            }
        },
        {
            type: {
                value: '',
                isValid: false
            }
        },
        false
    );

    // ทำการเปลี่ยนหน้าเมื่อสร้างข้อมูลใหม่ได้สำเร็จ
    useEffect(() => {
        // if (createSuccess && !loading) {
        //     history.push("/tool/list");
        //     setCreateSuccess(false);
        // }
        return () => {

        }
    }, [])


    // send data to front-end
    const onSubmit = async (e) => {
        e.preventDefault();

        let newTool = {
            toolName: formState.inputs.name.value,
            toolCode: toolCode,
            total: 0,
            type: formState.inputs.type.value,
            category: categoryValue,
            size: size,
            imageProfile: file,
            description: description
        }

        // await dispatch(createtoolAction(newTool))
        // console.log(newTool);
        setCreateSuccess(true);
    }

    return (
        <Container maxWidth="sm" className={classes.form}>
            <h1>การสร้างอุปกรณ์</h1>
            {/* {loading && <Loading loading={loading} />} */}
            {/* {error && <Alert variant="filled" severity="error"><AlertTitle>{error}</AlertTitle></Alert>} */}
            <Paper className="createtool-form"> 
                <form onSubmit={onSubmit} >
                    <Input
                        id="name"
                        element="input"
                        type="text"
                        label="ชื่ออุปกรณ์"
                        validators={[VALIDATOR_REQUIRE()]}
                        errorText="โปรดใส่ข้อมูล."
                        onInput={inputHandler}
                        required
                    />
                    <TextField
                        label="รหัสอุปกรณ์"
                        variant="outlined"
                        fullWidth
                        type="text"
                        className={classes.input}
                        onChange={(e) => setToolCode(e.target.value)}
                    />
                    {/* <div className="createtool-input-group">
                        <SelectType
                            selectValue={selectValue}
                            id="type"
                            filterName="ชนิด"
                            validators={[VALIDATOR_REQUIRE()]}
                            errorText="โปรดเลือกข้อมูล."
                            onInput={inputHandler}
                            setCategorySelect={setCategorySelect}
                            required />
                        <SelectCategory selectValue={categorySelect} setCategoryValue={setCategoryValue} categoryValue={categoryValue} />
                    </div> */}
                    <div className="createtool-input-group">
                        <TextField
                            label="ขนาด"
                            variant="outlined"
                            fullWidth
                            type="text"
                            className={classes.input}
                            onChange={(e) => setSize(e.target.value)}
                        />
                    </div>
                    <ImageUpload file={file} setFile={setFile} />
                    <TextField
                        id="outlined-multiline-flexible"
                        label="รายละเอียดเพิ่มเติม"
                        multiline
                        rowsMax={4}
                        variant="outlined"
                        fullWidth
                        className={classes.textarea}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        className={classes.button}
                        disabled={!formState.isValid}
                    >
                        ยืนยัน
                    </Button>
                </form>
            </Paper>
        </Container>
    )
}

export default CreateTool