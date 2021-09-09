import React from "react";
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";
import { Container } from "@material-ui/core";
import { AuthContext } from "./shared/context/auth-context";
import { useAuth } from './shared/hooks/auth-hook';

// Components
import Nav from "./shared/components/Navigations/Nav";
import Nav2 from "./shared/components/Navigations/Nav2";
// import ToolList from "./tool/pages/ToolList";
// import CreateTool from "./tool/pages/CreateTool";
// import CreateBoard from "./board/page/CreateBoard";
// import CreateProject from "./board/page/CreateProject";
// import BoardList from "./board/page/BoardList";
// import BoardRequest from "./board/page/BoardRequest";
// import EditProfile from "./user/pages/EditProfile";
// import DetailTool from "./tool/pages/DetailTool";
// import DetailBoard from "./board/page/DetailBoard";
// import EditBoard from "./board/page/EditBoard";
// import EditTool from "./tool/pages/EditTool";
// import BoardIncomplete from "./board/page/BoardIncomplete";
// import HistoryTool from "./tool/pages/HistoryTool";
// import HistoryBoard from "./board/page/HistoryBoard";
// import HistoryProject from "./board/page/HistoryProject";
// import DetailHistoryProject from "./board/page/DetailHistoryProject";
// import EditProject from "./board/page/EditProject";
import Home from "./Home";
import Auth from "./user/pages/Auth";
import Profile from "./user/pages/Profile";
import EditProfile from "./user/pages/EditProfile";
import AuthUser from "./user/pages/AuthUser";

// CSS
import "./App.css";
import CreateTool from "./tool/pages/CreateTool";
import SettingToolDetail from "./tool/pages/SettingToolDetail";
import ToolLists from "./tool/pages/ToolLists";
// import Purchase from "./shared/pages/Purchase";



function App() {

  const { token, login, logout } = useAuth()
  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/profile" exact>
          <Profile />
        </Route>
        <Route path="/profile/edit">
          <EditProfile />
        </Route>
        <Route path="/auth/users">
          <AuthUser />
        </Route>
        <Route path="/tool/list">
          <ToolLists />
        </Route>
        <Route path="/tool/new">
          <CreateTool />
        </Route>
        <Route path="/setting/tool">
          <SettingToolDetail />
        </Route>
        <Redirect to="/" />
      </Switch>
    )
  }
  else {
    routes = (
      <Switch>
        <Route path="/auth" exact>
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token, token: token, 
        login: login, logout: logout
      }}>
      <Router>
        {token ? <Nav2 /> : <Nav />}
        {/* <Nav /> */}
        <Container maxWidth="lg">
          {routes}
        </Container>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
