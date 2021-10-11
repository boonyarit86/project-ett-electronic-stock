import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// import Swiper from 'swiper/react/swiper';
// import SwiperSlide from "swiper/react/swiper-slide";
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from "swiper";

import "swiper/components/navigation/navigation.scss";
import "swiper/swiper.scss";
import "swiper/components/pagination/pagination.scss";
import "swiper/components/scrollbar/scrollbar.scss";

import "./SlideImagePreview.css";

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

// component รูปภาพแบบสไลค์
const SlideImagePreview = (props) => {
  const { images, setPreviewImg, image } = props;
  const [imgIndex, setImgIndex] = useState(99);

  const onChangImg = (img, index) => {
    setPreviewImg(img);
    setImgIndex(index);
  }

  return (
    <Swiper
      spaceBetween={20}
      slidesPerView={4}
      navigation
      // pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
      style={{ width: "90%" }}
    >
      {image && (
        <SwiperSlide
          className="slide-img"
          onClick={() => onChangImg(image.url, 99)}
          style={{ padding: 0, border: imgIndex === 99 ? "2px solid #ff5733" : "1px solid #000" }}
        >
          <img src={image.url} alt={""} />
        </SwiperSlide>
      )}
      {images.map((slide, index) => (
        <SwiperSlide
          className="slide-img"
          key={index}
          onClick={() => onChangImg(slide.url, index)}
          style={{ padding: 0, border: imgIndex === index ? "2px solid #ff5733" : "1px solid #000" }}
        >
          <img src={slide.url} alt={index} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default SlideImagePreview;
