import React, { useEffect } from "react";
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
          onClick={() => setPreviewImg(image.url)}
          style={{ padding: 0 }}
        >
          <img src={image.url} alt={""} />
        </SwiperSlide>
      )}
      {images.map((slide, index) => (
        <SwiperSlide
          className="slide-img"
          key={index}
          onClick={() => setPreviewImg(slide.url)}
          style={{ padding: 0 }}
        >
          <img src={slide.url} alt={index} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default SlideImagePreview;
