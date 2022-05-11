import React from "react";
// import { useDispatch } from "react-redux";
import "./Main.css";

const Main = (props) => {
  // const dispatch = useDispatch();

  return (
    <main className="main">
      {props.children}
    </main>
  );
};

export default Main;
