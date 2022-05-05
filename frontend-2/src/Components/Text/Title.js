import React from "react";
import './Title.css';

const Title = React.memo((props) => {
  return <h3 className="title">{props.children}</h3>;
});

export default Title;