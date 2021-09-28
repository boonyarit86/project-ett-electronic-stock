import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import { Container } from "@material-ui/core";
import { AuthContext } from "./shared/context/auth-context";
import { useAuth } from "./shared/hooks/auth-hook";

// Components
import Nav from "./shared/components/Navigations/Nav";
import Nav2 from "./shared/components/Navigations/Nav2";
import Loading from "./shared/components/UIElements/Loading";

// CSS
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

// import ToolList from "./tool/pages/ToolList";
// import CreateTool from "./tool/pages/CreateTool";
// import CreateBoard from "./board/page/CreateBoard";
// import CreateProject from "./board/page/CreateProject";
// import BoardList from "./board/page/BoardList";
// import BoardRequest from "./board/page/BoardRequest";
// import EditProfile from "./user/pages/EditProfile";
// import DetailBoard from "./board/page/DetailBoard";
// import EditBoard from "./board/page/EditBoard";
// import BoardIncomplete from "./board/page/BoardIncomplete";
// import HistoryTool from "./tool/pages/HistoryTool";
// import HistoryBoard from "./board/page/HistoryBoard";
// import HistoryProject from "./board/page/HistoryProject";
// import DetailHistoryProject from "./board/page/DetailHistoryProject";
// import EditProject from "./board/page/EditProject";

// import Home from "./Home";
// import Auth from "./user/pages/Auth";
// import Profile from "./user/pages/Profile";
// import EditProfile from "./user/pages/EditProfile";
// import AuthUser from "./user/pages/AuthUser";
// import CreateTool from "./tool/pages/CreateTool";
// import SettingToolDetail from "./tool/pages/SettingToolDetail";
// import EditTool from "./tool/pages/EditTool";
// import ToolLists from "./tool/pages/ToolLists";
// import DetailTool from "./tool/pages/DetailTool";
const Home = React.lazy(() => import("./Home"));
const Auth = React.lazy(() => import("./user/pages/Auth"));
const Profile = React.lazy(() => import("./user/pages/Profile"));
const EditProfile = React.lazy(() => import("./user/pages/EditProfile"));
const AuthUser = React.lazy(() => import("./user/pages/AuthUser"));
const CreateTool = React.lazy(() => import("./tool/pages/CreateTool"));
const SettingToolDetail = React.lazy(() =>
  import("./tool/pages/SettingToolDetail")
);
const EditTool = React.lazy(() => import("./tool/pages/EditTool"));
const ToolLists = React.lazy(() => import("./tool/pages/ToolLists"));
const DetailTool = React.lazy(() => import("./tool/pages/DetailTool"));
const HistoryTool = React.lazy(() => import("./tool/pages/HistoryTool"));
const CreateBoard = React.lazy(() => import("./board/pages/CreateBoard"));
const BoardLists = React.lazy(() => import("./board/pages/BoardLists"));
const DetailBoard = React.lazy(() => import("./board/pages/DetailBoard"));
const EditBoard = React.lazy(() => import("./board/pages/EditBoard"));
const HistoryBoard = React.lazy(() => import("./board/pages/HistoryBoard"));
const BoardRequest = React.lazy(() => import("./board/pages/BoardRequest"));
const BoardIncomplete = React.lazy(() => import("./board/pages/BoardIncomplete"));



// import Purchase from "./shared/pages/Purchase";

function App() {
  const { token, userStatus, login, logout } = useAuth();
  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/tool/list">
          <ToolLists />
        </Route>
        {/* <Route path="/" exact>
          <ToolLists />
        </Route> */}
        <Route path="/tool/new">
          <CreateTool />
        </Route>
        <Route path="/:tid/tool" exact>
          <DetailTool />
        </Route>
        <Route path="/tool/:tid" exact>
          <EditTool />
        </Route>
        <Route path="/historytool">
          <HistoryTool />
        </Route>
        <Route path="/board/list">
          <BoardLists />
        </Route>
        <Route path="/board/request">
          <BoardRequest />
        </Route>
        <Route path="/board/new">
          <CreateBoard />
        </Route>
        <Route path="/:bid/board" exact>
          <DetailBoard />
        </Route>
        <Route path="/board/:bid" exact>
          <EditBoard />
        </Route>
        <Route path="/boardincomplete">
          <BoardIncomplete />
        </Route>
        <Route path="/historyboard">
          <HistoryBoard />
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
       
        <Route path="/setting1/tool1">
          <SettingToolDetail />
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/auth" exact>
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userStatus: userStatus,
        login: login,
        logout: logout,
      }}
    >
      <Router>
        {token ? <Nav2 /> : <Nav />}
        {/* <Nav /> */}
        <Container maxWidth="lg">
          <Suspense
            fallback={
              <Loading loading={true} />
            }
          >
            {routes}
          </Suspense>
        </Container>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
