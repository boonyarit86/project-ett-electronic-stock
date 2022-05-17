import React from "react";
import { useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/auth-hook";
import { AuthContext } from "./context/auth-context";
import Auth from "./Pages/Auth/Auth";
import LoadingSpinner from "./Components/LoadingSpinner/LoadingSpinner";
import Layout from "./Layouts/Layout";
import "./App.css";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Sidebar from "./Layouts/Sidebar/Sidebar";
import Header from "./Layouts/Header/Header";
// import "./Layouts/Layout.css";
import Main from "./Layouts/Main/Main";
import CreateTool from "./Pages/CreateTool/CreateTool";
import ToolList from "./Pages/ToolList/ToolList";
import ToolDetail from "./Pages/ToolDetail/ToolDetail";
import UpdateTool from "./Pages/UpdateTool/UpdateTool";
import ToolHistory from "./Pages/ToolHistory/ToolHistory";
import BoardList from "./Pages/BoardList/BoardList";
import BoardDetail from "./Pages/BoardDetail/BoardDetail";
import CreateBoard from "./Pages/CreateBoard/CreateBoard";
import RequestBoard from "./Pages/RequestBoard/RequestBoard";
import InsufficientTool from "./Pages/InsufficientTool/InsufficientTool";
import BoardHistory from "./Pages/BoardHistory/BoardHistory";
import UpdateBoard from "./Pages/UpdateBoard/UpdateBoard";
import AuthUser from "./Pages/AuthUser/AuthUser";
import SettingTool from "./Pages/SettingTool/SettingTool";

function App() {
  const { token, logout, login, userId, handleSidebar, isSidebarOpen, handleCloseSidebar } = useAuth();
  const { loading } = useSelector((state) => state.initialState);

  let routes;
  if (token) {
    routes = (
      <Router>
        {loading && <LoadingSpinner />}
        <Layout>
          <Header />
          <Sidebar />
          <Main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/toolList" element={<ToolList />} />
              <Route path="/toolList/:toolId" element={<ToolDetail />} />
              <Route path="/toolList/:toolId/update" element={<UpdateTool />} />
              <Route path="/createTool" element={<CreateTool />} />
              <Route path="/tool/history" element={<ToolHistory />} />
              <Route path="/boardList" element={<BoardList />} />
              <Route path="/boardList/:boardId" element={<BoardDetail />} />
              <Route path="/boardList/:boardId/update" element={<UpdateBoard />} />
              <Route path="/createBoard" element={<CreateBoard />} />
              <Route path="/requestBoard" element={<RequestBoard />} />
              <Route path="/board/history" element={<BoardHistory />} />
              <Route path="/insTool" element={<InsufficientTool />} />
              <Route path="/authUser" element={<AuthUser />} />
              <Route path="/setting" element={<SettingTool />} />
              {/* Catch all - replace with 404 component if you want */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Main>
        </Layout>
      </Router>
    );
  } else {
    routes = (
      <Router>
        {loading && <LoadingSpinner />}
        <Routes>
          <Route path="/" element={<Auth />}></Route>
          {/* Catch all - replace with 404 component if you want */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }
  return (
    <div className="App">
      <AuthContext.Provider
        value={{
          token: token,
          userId: userId,
          login: login,
          logout: logout,
          handleSidebar: handleSidebar,
          isSidebarOpen: isSidebarOpen,
          handleCloseSidebar: handleCloseSidebar
        }}
      >
        {routes}
      </AuthContext.Provider>
    </div>
  );
}

export default App;
