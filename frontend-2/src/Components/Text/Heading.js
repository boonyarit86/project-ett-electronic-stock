import React from "react";
import "./Heading.css";

const Heading = React.memo(({ type, text }) => {
  if (type === "main") return <h1 className="heading--main">{text}</h1>;

  return <h2 className="heading--sub">{text}</h2>;
});

export default Heading;
