import React from "react";
import Axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Backdrop from "../../Components/Backdrop/Backdrop";
import Button from "../../Components/Button/Button";
import Heading from "../../Components/Text/Heading";
import ModalAction from "../../Components/Modal/ModalAction";
import Slider from "../../Components/Slider/Slider";
import StatusText from "../../Components/Tag/StatusText";
import ToastList from "../../Components/Toast/ToastList";
import Title from "../../Components/Text/Title";
import Toast from "../../Components/Toast/Toast";
import { getTool, resetTool } from "../../Redux/features/toolSlice";
import { checkStatus } from "../../utils";
import { catchError } from "../../utils/handleError";
import { endLoading, startLoading } from "../../Redux/features/stateSlice";
import { AuthContext } from "../../context/auth-context";

import "./ToolDetail.css";

const warningText = [
  { text: "ประวัติการเบิกและเพิ่มอุปกรณ์", id: "t1" },
  { text: "ข้อมูลอุปกรณ์ที่บันทึกไว้ในบอร์ดต่างๆ", id: "t2" },
  { text: "ข้อมูลอุปกรณ์ในหน้าอุปกรณ์ไม่ครบ", id: "t3" },
];

const ToolDetail = () => {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toolId = useParams().toolId;
  const tool = useSelector((state) => state.tool.tool);
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    dispatch(getTool(toolId));
    if (tool) {
      let newImagesArr = [];
      if (tool?.avatar?.url) {
        newImagesArr.unshift(tool.avatar);
      }
      if (tool?.images?.length > 0) {
        newImagesArr = [...newImagesArr, ...tool.images]
      }
      if (newImagesArr.length > 0) {
        setPreviewImage(newImagesArr[0].url);
      } else {
        setPreviewImage("/images/avatars/user-2.jpg");
      }
      setImages(newImagesArr);
    }

    return () => {
      dispatch(resetTool());
    };
  }, [dispatch, tool, toolId]);

  const changedPreviewImg = (img, id) => {
    let imgElement = document.getElementById(id);
    let allImgs = document.querySelectorAll(".slider__img");

    allImgs.forEach((item) => {
      if (item.getAttribute("class").includes("active")) {
        item.classList.remove("active");
      }
    });
    imgElement.classList.add("active");
    setPreviewImage(img);
  };

  const handleModal = () => {
    setOpenModal((prev) => !prev);
  };

  const onSubmitDeleting = async (e) => {
    let mainElement = document.querySelector(".main");
    let menu = document.querySelectorAll(".sidebar__item");
    let newItemActive = document.getElementById("m2");
    e.preventDefault();
    console.log(tool._id);

    try {
      dispatch(startLoading());
      await Axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/tools/${tool._id}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      ).then((res) => {
        menu.forEach((item) => {
          let isItemActive = item.getAttribute("class").includes("active");
          if (isItemActive) {
            item.classList.remove("active");
          }
        });

        newItemActive.classList.add("active");
        dispatch(endLoading());
        navigate("/toolList");
      });
    } catch (error) {
      dispatch(endLoading());
      catchError(error, setErrorMessage);
      mainElement.scrollTo(0, 0);
    }

    setOpenModal(false);
  };

  if (!tool) {
    return <div />;
  }

  return (
    <div className="itemDetail">
      <p className="u-mg-b">รายการอุปกรณ์ : {tool.toolName}</p>
      <Heading type="main" text="รายละเอียดอุปกรณ์" className="u-mg-b" />
      {errorMessage && (
        <Toast
          element="error"
          type="default"
          message={errorMessage}
          className="u-mg-b"
        />
      )}
      <div className="itemDetail__container">
        <div className="itemDetail__images-box">
          <img src={previewImage} alt="avatar" className="itemDetail__avatar" />
          <Slider id="tSlider" images={images} onClick={changedPreviewImg} />
        </div>
        <div className="itemDetail__content-box">
          <Title>{tool.toolName}</Title>

          <article className="itemDetail__article">
            <div className="itemDetail__content">
              <p className="itemDetail__title">รหัสอุปกรณ์</p>
              <p className="itemDetail__text">{tool.toolCode}</p>
            </div>
            <div className="itemDetail__content">
              <p className="itemDetail__title">จำนวนอุปกรณ์</p>
              <p className="itemDetail__text">{tool.total}</p>
            </div>
            <div className="itemDetail__content">
              <p className="itemDetail__title">ชนิด</p>
              <p className="itemDetail__text">
                {tool?.type?.name ? tool.type.name : "ไม่ได้กำหนด"}
              </p>
            </div>
            <div className="itemDetail__content">
              <p className="itemDetail__title">ประเภท</p>
              <p className="itemDetail__text">
                {tool?.category?.name ? tool.category.name : "ไม่ได้กำหนด"}
              </p>
            </div>
            <div className="itemDetail__content">
              <p className="itemDetail__title">
                ค่าตัวเลขน้อยกว่าที่กำหนดจะมีการแจ้งเตือน
              </p>
              <p className="itemDetail__text">{tool.limit}</p>
            </div>
            <div className="itemDetail__content">
              <p className="itemDetail__title">สถานะ</p>
              <StatusText
                className="itemDetail__tool-status"
                text={checkStatus(tool).text}
                type={checkStatus(tool).type}
              />
            </div>
            <div className="itemDetail__description">
              <p className="itemDetail__title">รายละเอียดเพิ่มเติม</p>
              <p className="itemDetail__text">{tool.description}</p>
            </div>
          </article>

          <div className="btn__group">
            <Button
              element="link"
              type="button"
              path={`/toolList/${tool._id}/update`}
              className="btn-primary-blue"
            >
              แก้ไข
            </Button>
            <Button
              element="button"
              type="button"
              className="btn-secondary-red"
              onClick={handleModal}
            >
              ลบ
            </Button>
            <Button
              element="link"
              type="button"
              path="/toolList"
              className="btn-primary-grey"
            >
              กลับ
            </Button>
          </div>
        </div>
      </div>

      {openModal && (
        <React.Fragment>
          <ModalAction
            title="ลบ"
            itemName={`อุปกรณ์ ${tool.toolName}`}
            onClick={handleModal}
          >
            <div className="modal__form">
              <ToastList
                element="error"
                type="light"
                message="การทำขั้นตอนนี้ข้อมูลที่เกี่ยวข้องจะถูกลบไปด้วย"
                article={warningText}
              />
              <div className="btn__group justify--left">
                <Button
                  type="button"
                  element="button"
                  className="btn-white"
                  onClick={handleModal}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="button"
                  element="button"
                  className="btn-secondary-red"
                  onClick={onSubmitDeleting}
                >
                  ลบ
                </Button>
              </div>
            </div>
          </ModalAction>
          <Backdrop black style={{ zIndex: 100 }} />
        </React.Fragment>
      )}
    </div>
  );
};

export default ToolDetail;
