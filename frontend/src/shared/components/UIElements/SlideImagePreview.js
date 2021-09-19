import React, { useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
// import Swiper from 'swiper/react/swiper';
// import SwiperSlide from "swiper/react/swiper-slide";
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';

// import 'swiper/components/navigation/navigation.scss';
// import 'swiper/swiper.scss';
// import 'swiper/components/pagination/pagination.scss';
// import 'swiper/components/scrollbar/scrollbar.scss';
// import 'swiper/css'

// import "./SlideImagePreview.css";

// SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

//

import "swiper/css";
import "swiper/css/pagination"
import "swiper/css/navigation"

// import "./styles.css";

// component รูปภาพแบบสไลค์
const SlideImagePreview = (props) => {
    const { images, setPreviewImg } = props;

    return (
        <Swiper
            spaceBetween={20}
            slidesPerView={4}
            navigation
            // pagination={{ clickable: true }}
            scrollbar={{ draggable: true }}
            style={{width: "90%"}}
        >
            {images !== undefined && images.map((slide, index) => (
                <SwiperSlide className="slide-img" key={index} onClick={() => setPreviewImg(slide.location)} style={{padding: 0}}  >
                    <img src={slide.location} alt={index} />
                </SwiperSlide>
            ))}
        </Swiper>
    )

}

export default SlideImagePreview;