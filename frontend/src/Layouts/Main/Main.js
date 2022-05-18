import React from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { getTool } from "../../Redux/features/toolSlice";
import "./Main.css";

const Main = (props) => {
  // const dispatch = useDispatch();
  // const { tools, tool } = useSelector((state) => state.tool);
  // console.log(tool)

  return (
    <main className="main">
      {/* <p>Tools: {tools.length}</p>
      <p>Tool: {tool ? "Found" : "Not found"}</p>
      <button onClick={() => dispatch(getTool("6279c9e852e875438f335076"))}>Get item</button> */}
      {props.children}
    </main>
  );
};

export default Main;
