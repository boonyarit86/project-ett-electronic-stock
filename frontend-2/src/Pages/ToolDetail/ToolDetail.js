import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Button from "../../Components/Button/Button";
import Heading from "../../Components/Text/Heading";
import Slider from "../../Components/Slider/Slider";
import StatusText from "../../Components/Tag/StatusText";
import Title from "../../Components/Text/Title";
import { getTool, resetTool } from "../../Redux/features/toolSlice";
import { checkStatus } from "../../utils";
import "./ToolDetail.css";

const ToolDetail = () => {
  const dispatch = useDispatch();
  const toolId = useParams().toolId;
  const tool = useSelector((state) => state.tool.tool);
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    dispatch(getTool(toolId));
    if (tool) {
      let newImagesArr = imagesData;
      newImagesArr.unshift({
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWNF0SzA0NX5edmpURFtNJQzDCQjtBN9XeYQ&usqp=CAU",
      });
      setImages(newImagesArr);
      setPreviewImage(
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWNF0SzA0NX5edmpURFtNJQzDCQjtBN9XeYQ&usqp=CAU"
      );
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

  if (!tool) {
    return <div />;
  }

  return (
    <div className="itemDetail">
      <p className="u-mg-b">รายการอุปกรณ์ : {tool.toolName}</p>
      <Heading type="main" text="รายละเอียดอุปกรณ์" className="u-mg-b" />
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
              <p className="itemDetail__text">
                {tool.description} This HTML file is a template. If you open it
                directly in the browser, you will see an empty page. You can add
                webfonts, meta tags, or analytics to this file. The build step
                will place the bundled scripts into the body tag.
              </p>
            </div>
          </article>

          <div className="btn__group">
            <Button
              element="link"
              type="button"
              path="/"
              className="btn-primary-blue"
            >
              แก้ไข
            </Button>
            <Button
              element="button"
              type="button"
              className="btn-secondary-red"
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
    </div>
  );
};

export default ToolDetail;

let imagesData = [
  {
    url: "https://cdn.donmai.us/original/fd/de/__yukinoshita_yukino_yahari_ore_no_seishun_lovecome_wa_machigatteiru_drawn_by_mahdi__fddef510ee9f978926b323a93afb387d.png",
  },
  {
    url: "https://cdn.donmai.us/original/fd/de/__yukinoshita_yukino_yahari_ore_no_seishun_lovecome_wa_machigatteiru_drawn_by_mahdi__fddef510ee9f978926b323a93afb387d.png",
  },
  {
    url: "https://cdn.donmai.us/original/fd/de/__yukinoshita_yukino_yahari_ore_no_seishun_lovecome_wa_machigatteiru_drawn_by_mahdi__fddef510ee9f978926b323a93afb387d.png",
  },
  {
    url: "https://cdn.donmai.us/original/fd/de/__yukinoshita_yukino_yahari_ore_no_seishun_lovecome_wa_machigatteiru_drawn_by_mahdi__fddef510ee9f978926b323a93afb387d.png",
  },
  {
    url: "https://cdn.donmai.us/original/fd/de/__yukinoshita_yukino_yahari_ore_no_seishun_lovecome_wa_machigatteiru_drawn_by_mahdi__fddef510ee9f978926b323a93afb387d.png",
  },
  //   {
  //     url: "https://cdn.donmai.us/original/fd/de/__yukinoshita_yukino_yahari_ore_no_seishun_lovecome_wa_machigatteiru_drawn_by_mahdi__fddef510ee9f978926b323a93afb387d.png",
  //   },
  //   {
  //     url: "https://cdn.donmai.us/original/fd/de/__yukinoshita_yukino_yahari_ore_no_seishun_lovecome_wa_machigatteiru_drawn_by_mahdi__fddef510ee9f978926b323a93afb387d.png",
  //   },
  //   {
  //     url: "https://cdn.donmai.us/original/fd/de/__yukinoshita_yukino_yahari_ore_no_seishun_lovecome_wa_machigatteiru_drawn_by_mahdi__fddef510ee9f978926b323a93afb387d.png",
  //   },
];
