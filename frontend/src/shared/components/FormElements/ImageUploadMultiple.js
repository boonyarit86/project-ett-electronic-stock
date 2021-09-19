import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { Button, Avatar, Badge } from "@material-ui/core"

// Icon
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';

// CSS
import './ImageUploadMultiple.css';



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
        margin: "10px 10px 20px 0"
    },
    btnDelete: {
        cursor: "pointer"
    }
}));

// function การอัพโหลดรุปภาพหลายรูปพร้อมกัน
function ImageUploadMultiple(props) {

    const classes = useStyles();
    const { files, setFiles, setFilesDel, filesDel } = props;
    const [previewfiles, setPreviewFiles] = useState([]);

    useEffect(() => {
        // set ค่า ไฟลรูปภาพเมื่อมีข้อมูล เบื่องต้นอยู่แล้ว 
        if (files) {
            setPreviewFiles(files)
        }
        return () => {

        }
    }, [])

    const pickedHandler = e => {
        // console.log(typeof(e.target.files[0]))
        if (e.target.files) {
            // covert e.target.files to be a new array
            const filesArray = Array.from(e.target.files).map((file) => URL.createObjectURL(file));
            setPreviewFiles((prevImages) => prevImages.concat(filesArray));
            // submit files first.
            if (!files) {
                setFiles(e.target.files);
            }
            // submit files morn than 1.
            else {
                // temporaryArr = [...files, ...e.target.files]
                setFiles([...files, ...e.target.files])
            }
        }

    }

    const deleteImage = async (image, index) => {
        // set new array of previewfiles variant after deleting a image.
        let delImg;
        if (image.public_id) {
            delImg = await previewfiles.filter((prevImages) => prevImages.public_id !== image.public_id);
            setFilesDel([...filesDel, image])
        }
        else {
            delImg = await previewfiles.filter((prevImages) => prevImages !== image);
        }
        const delfile = Array.from(files).filter((res, id) => id !== index);
        // const filterFiles = await files.filter((file) => file.name !==); 

        setPreviewFiles(delImg);
        setFiles(delfile)

        if (delImg.length === 0) {
            setPreviewFiles([]);
            setFiles([]);
        }
    }

    // const renderPhotos = (source) => {
    //     return source.map((photo, index) => {
    //         // return <img src={photo} alt="" key={photo} />
    //         return <SwiperSlide className="slide-img" key={photo} >
    //             <img src={photo} alt="" />
    //             <div className="cancle" onClick={() => deleteImage(photo, index)}><span>x</span></div>
    //         </SwiperSlide>
    //     })
    // }

    const renderPhotos = (source) => {
        return source.map((photo, index) => {
            return (
                <div className={classes.square} key={index}>
                    <Badge color="secondary" badgeContent="x" className={classes.btnDelete} onClick={() => deleteImage(photo, index)} >
                        <Avatar variant="square" src={photo.url || photo} />
                    </Badge>
                </div>
            )
        })
    }

    return (
        <div className="form-control">
            <h4>รูปภาพอื่นๆ</h4>
            { previewfiles && <div className="uploadMultiple-container">{renderPhotos(previewfiles)}</div>}
            <input
                accept="image/*"
                className={classes.input}
                id="contained-button-files"
                type="file"
                onChange={pickedHandler}
                multiple
            />
            <label htmlFor="contained-button-files">
                <Button variant="contained" color="default" component="span" startIcon={<AddAPhotoIcon />}>
                    อัพโหลด
                </Button>
            </label>
        </div>
    );
}

export default ImageUploadMultiple
