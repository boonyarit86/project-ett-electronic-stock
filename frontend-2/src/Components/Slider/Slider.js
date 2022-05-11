import React from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import "./Slider.css";

const Slider = (props) => {
  const slideForward = () => {
    let slider = document.getElementById(props.id);
    slider.scrollLeft = slider.scrollLeft + 500;
  };

  const slideBack = () => {
    let slider = document.getElementById(props.id);
    slider.scrollLeft = slider.scrollLeft - 500;
  };

  return (
    <div className="slider">
      {props.images.length > 5 && (
        <React.Fragment>
          <div className="slider__arrow-box back" onClick={slideBack}>
            <IoIosArrowBack className="slider__arrow-back icon--medium" />
          </div>
          <div className="slider__arrow-box forward" onClick={slideForward}>
            <IoIosArrowForward className="slider__arrow-forward icon--medium" />
          </div>
        </React.Fragment>
      )}
      <div className="slider__images" id={props.id}>
        {props.images.map((img, index) => (
          <img
            className={`slider__img ${index === 0 ? "active" : ""}`}
            src={img.url}
            alt="img"
            id={`${props.id}--${index}`}
            key={index}
            onClick={() => props.onClick(img.url, `${props.id}--${index}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;
