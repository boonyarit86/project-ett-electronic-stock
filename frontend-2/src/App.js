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
// import Layout from "./Layouts/Layout";
import "./App.css";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Sidebar from "./Layouts/Sidebar/Sidebar";
import Header from "./Layouts/Header/Header";
import "./Layouts/Layout.css";
import Main from "./Layouts/Main/Main";

function App() {
  const { token, logout, login, userId } = useAuth();
  const { loading } = useSelector((state) => state.initialState);

  let routes;
  if (token) {
    routes = (
      <Router>
        {loading && <LoadingSpinner />}
        <div className="layout">
          <Header />
          <Sidebar />
          <Main>
            <Routes>
              <Route path="/" element={<Dashboard />}></Route>
              {/* Catch all - replace with 404 component if you want */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Main>
        </div>
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
        }}
      >
        {routes}
      </AuthContext.Provider>
    </div>
  );
}

export default App;
