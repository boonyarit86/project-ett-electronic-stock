// import { Outlet } from "react-router-dom";
import Header from "./Header/Header";
import Main from "./Main/Main";
import Sidebar from "./Sidebar/Sidebar";
import "./Layout.css";

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <Sidebar />
      <Main>
  
      </Main>
    </div>
  );
};

export default Layout;
