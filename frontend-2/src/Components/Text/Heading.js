import React from "react";
import "./Heading.css";

const Heading = React.memo((props) => {
  if (props.type === "main") return <h1 className={`heading--main ${props.className}`}>{props.text}</h1>;

  return <h2 className={`heading--sub ${props.className}`}>{props.text}</h2>;
});

export default Heading;
