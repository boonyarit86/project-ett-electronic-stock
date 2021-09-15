import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

// Components
import { Button, Avatar, Badge } from "@material-ui/core";

// Icon
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';

// CSS
// import './ImageUpload.css';

// CSS Material UI
const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    input: {
        display: 'none',
    },
    square: {
        margin: "20px 0"
    },
    btnDelete: {
        cursor: "pointer"
    }
}));

// function การอัพโหลดรุปภาพแบบทีละรูป
const ImageUpload = props => {
    const classes = useStyles();
    // รับบค่าจากภายนอกเข้ามา 2 ค่า
    const { file, setFile, initialValue } = props;
    // โชวรูปภาพที่เราอัปโหลด แต่ไม่นำค่านี้ไปเก็บในฐานข้อมูล แต่จะใช้ ตัวแปร file แทน
    const [previewUrl, setPreviewUrl] = useState();
    
    useEffect(() => {
        // set ค่า ไฟลรูปภาพเมื่อมีข้อมูล เบื่องต้นอยู่แล้ว 
        if (file) {
            setPreviewUrl(file)
        } else {
            setPreviewUrl(initialValue)
        }
        return () => {

        }
    }, [initialValue])

    // useEffect(() => {
    //     // console.log("refresh")
    //     return () => {

    //     }
    // }, [file])

    // Function ทำงานต่อเมื่อกดอัพโหลดรูปภาพจาก ปุ่ม
    const pickedHandler = e => {
        setFile(e.target.files[0]);
        const fileReader = new FileReader();
        fileReader.onload = () => {
            setPreviewUrl(fileReader.result);
        };
        fileReader.readAsDataURL(e.target.files[0])

    };

    // function ลบรูปภาพ
    const deleteImage = () => {
        setPreviewUrl(false)
        setFile(null)
    }

    return (
        <div className="form-control">
            <h4>รูปภาพโปรไฟล์</h4>
            { previewUrl &&
                <div className={classes.square}>
                    <Badge color="secondary" badgeContent="x" onClick={deleteImage} className={classes.btnDelete} >
                        <Avatar variant="square" src={previewUrl} />
                    </Badge>
                </div>}
            <input
                accept="image/*"
                className={classes.input}
                id="contained-button-file"
                type="file"
                onChange={pickedHandler}
            />
            <label htmlFor="contained-button-file">
                <Button variant="contained" color="default" component="span" startIcon={<AddAPhotoIcon />}>
                    อัพโหลด
                </Button>
            </label>
        </div>
    );
};

export default ImageUpload;