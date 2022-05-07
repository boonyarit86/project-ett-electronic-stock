import React from "react";
import "./Skeleton.css";

const Skeleton = React.memo((props) => {
  let element;
  if (props.element === "text") {
    element = (
      <div
        className={`skeleton skeleton__text ${
          props.size && `skeleton__text--${props.size}`
        }`}
      />
    );
  } else if (props.element === "image") {
    element = (
      <div
        className={`skeleton skeleton__image ${
          props.shape && `skeleton__image-shape--${props.shape}`
        }`}
        style={{ width: `${props.width}rem`, height: `${props.height}rem` }}
      ></div>
    );
  }

  return <React.Fragment>{element}</React.Fragment>;
});

export default Skeleton;
