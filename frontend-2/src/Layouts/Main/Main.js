import React from "react";
// import { useSelector } from "react-redux";
import "./Main.css";

const Main = (props) => {
  // const user = useSelector((state) => state.user.user);
  // const [state, SetState] = React.useState(0);

  return (
    <main className="main">
      {/* <button onClick={() => SetState((prev) => prev + 1)}>
        Re render {state}
      </button>
      Main section Hi there! {user?.name ? user.name : "Loading..."} */}
      {props.children}
    </main>
  );
};

export default Main;
