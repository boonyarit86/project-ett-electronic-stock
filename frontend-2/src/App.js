import React from "react";
import { useSelector, useDispatch } from "react-redux";
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
import Main from "./Layouts/Main";
import "./App.css";

function App() {
  const { token, logout, login } = useAuth();
  const { loading } = useSelector((state) => state.initialState);

  let routes;
  if (token) {
    routes = (
      <React.Fragment>
        <Route path="/" element={<Main />}></Route>
      </React.Fragment>
    );
  } else {
    routes = (
      <React.Fragment>
        <Route path="/" element={<Auth />}></Route>
      </React.Fragment>
    );
  }
  return (
    <div className="App">
      <AuthContext.Provider
        value={{
          token: token,
          userId: "",
          login: login,
          logout: logout,
        }}
      >
        <Router>
          {loading && <LoadingSpinner />}
          <Routes>
            {routes}

            {/* Catch all - replace with 404 component if you want */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
