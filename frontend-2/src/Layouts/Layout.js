import { Outlet } from "react-router-dom";
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
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis ut
          placeat illum, explicabo tempora ratione laboriosam dolorum commodi
          ipsum dicta mollitia esse, tempore vero, dignissimos quia recusandae
          quisquam sit est. Maiores qui tempora odit nesciunt illum repudiandae
          accusamus soluta praesentium laborum quae! Deserunt iste neque quos
          ducimus, commodi ipsum dolor.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis ut
          placeat illum, explicabo tempora ratione laboriosam dolorum commodi
          ipsum dicta mollitia esse, tempore vero, dignissimos quia recusandae
          quisquam sit est. Maiores qui tempora odit nesciunt illum repudiandae
          accusamus soluta praesentium laborum quae! Deserunt iste neque quos
          ducimus, commodi ipsum dolor.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis ut
          placeat illum, explicabo tempora ratione laboriosam dolorum commodi
          ipsum dicta mollitia esse, tempore vero, dignissimos quia recusandae
          quisquam sit est. Maiores qui tempora odit nesciunt illum repudiandae
          accusamus soluta praesentium laborum quae! Deserunt iste neque quos
          ducimus, commodi ipsum dolor.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis ut
          placeat illum, explicabo tempora ratione laboriosam dolorum commodi
          ipsum dicta mollitia esse, tempore vero, dignissimos quia recusandae
          quisquam sit est. Maiores qui tempora odit nesciunt illum repudiandae
          accusamus soluta praesentium laborum quae! Deserunt iste neque quos
          ducimus, commodi ipsum dolor.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis ut
          placeat illum, explicabo tempora ratione laboriosam dolorum commodi
          ipsum dicta mollitia esse, tempore vero, dignissimos quia recusandae
          quisquam sit est. Maiores qui tempora odit nesciunt illum repudiandae
          accusamus soluta praesentium laborum quae! Deserunt iste neque quos
          ducimus, commodi ipsum dolor.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis ut
          placeat illum, explicabo tempora ratione laboriosam dolorum commodi
          ipsum dicta mollitia esse, tempore vero, dignissimos quia recusandae
          quisquam sit est. Maiores qui tempora odit nesciunt illum repudiandae
          accusamus soluta praesentium laborum quae! Deserunt iste neque quos
          ducimus, commodi ipsum dolor.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis ut
          placeat illum, explicabo tempora ratione laboriosam dolorum commodi
          ipsum dicta mollitia esse, tempore vero, dignissimos quia recusandae
          quisquam sit est. Maiores qui tempora odit nesciunt illum repudiandae
          accusamus soluta praesentium laborum quae! Deserunt iste neque quos
          ducimus, commodi ipsum dolor.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis ut
          placeat illum, explicabo tempora ratione laboriosam dolorum commodi
          ipsum dicta mollitia esse, tempore vero, dignissimos quia recusandae
          quisquam sit est. Maiores qui tempora odit nesciunt illum repudiandae
          accusamus soluta praesentium laborum quae! Deserunt iste neque quos
          ducimus, commodi ipsum dolor.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis ut
          placeat illum, explicabo tempora ratione laboriosam dolorum commodi
          ipsum dicta mollitia esse, tempore vero, dignissimos quia recusandae
          quisquam sit est. Maiores qui tempora odit nesciunt illum repudiandae
          accusamus soluta praesentium laborum quae! Deserunt iste neque quos
          ducimus, commodi ipsum dolor.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis ut
          placeat illum, explicabo tempora ratione laboriosam dolorum commodi
          ipsum dicta mollitia esse, tempore vero, dignissimos quia recusandae
          quisquam sit est. Maiores qui tempora odit nesciunt illum repudiandae
          accusamus soluta praesentium laborum quae! Deserunt iste neque quos
          ducimus, commodi ipsum dolor.
        </p>
      </Main>
      <Outlet />
    </div>
  );
};

export default Layout;
