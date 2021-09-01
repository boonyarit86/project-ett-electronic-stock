import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";
import { getUserByIdAction } from "../../../actions/userActions";
// import { useHttpClient } from "../../hooks/http-hook";
// import { getNotificationAction, clearNotificationAction } from "../../../actions/notificationActions";
// import { toolListAction } from "../../../actions/toolActions";
// import { boardListAction } from "../../../actions/boardActions";
// import { time } from "../../util/Time";

// Component
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Typography,
  IconButton,
  Toolbar,
  AppBar,
  TextField,
  Card,
  CardContent,
} from "@material-ui/core";
import SlideBar from "./SlideBar";
// import Loading from "../UIElements/Loading";

// Icon
import MenuIcon from "@material-ui/icons/Menu";
import NotificationsIcon from "@material-ui/icons/Notifications";
import MoreIcon from "@material-ui/icons/MoreVert";

// CSS
import "./Nav.css";

// CSS Material UI
const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  webName: {
    color: "#fff",
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    // backgroundColor: fade(theme.palette.common.white, 0.15),
    // '&:hover': {
    //     backgroundColor: fade(theme.palette.common.white, 0.25),
    // },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  menuNotification: {
    width: "250px",
    overflow: "initial",
  },
}));

export default function Nav2() {
  // function React
  const history = useHistory();
  const auth = useContext(AuthContext);
  const classes = useStyles();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userData);
  // ตัวแปรกำหนดค่า
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElNoti, setAnchorElNoti] = React.useState(null);
  const [Hamburgur, setHamburgur] = React.useState(false);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const [data, setData] = useState([]);
//   const [tools, setTools] = useState([]);
//   const [boards, setBoards] = useState([]);
//   const [notificationList, setNotificationList] = useState([]);

  useEffect(() => {
    dispatch(getUserByIdAction(auth.token));
  }, []);

  const isMenuOpen = Boolean(anchorEl);
  const isNotifiOpen = Boolean(anchorElNoti);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    // console.log(event.currentTarget)
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationOpen = async (event) => {
    // console.log(event.currentTarget)
    setAnchorElNoti(event.currentTarget);
    // try {
    //     await dispatch(clearNotificationAction(auth.userId))
    // } catch (error) {

    // }
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleNotificationClose = () => {
    setAnchorElNoti(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  // Handle SlideBar
  const openHamburgur = () => {
    setHamburgur(true);
  };

  const closeHamburgur = () => {
    setHamburgur(false);
  };

  // Handle Search and Link
  const handleSearch = (event, value) => {
    if (value) {
      if (value.status === "tool") {
        history.push(`/${value.id}/tool`);
      } else {
        history.push(`/${value.id}/board`);
      }
    }
  };

  const handleLogout = () => {
    auth.logout();
  };

  // if (isLoading) {
  //     return (
  //         <div className="center">
  //             <Loading loading={isLoading} />
  //         </div>
  //     );
  // }

  // if (error && !isLoading) {
  //     return (
  //         <div>
  //             <Card className={classes.card}><CardContent>ไม่มีข้อมูล</CardContent></Card>
  //         </div>
  //     );
  // }

  const menuId = "primary-search-account-menu";
  const renderNotification = (
    <Menu
      anchorEl={anchorElNoti}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isNotifiOpen}
      onClose={handleNotificationClose}
    >
      {/* <MenuItem onClick={handleNotificationClose} className={classes.menuNotification} > */}
      <div className="container-notification">
        <h2>ล่าสุด</h2>
        {/* {notifications.length !== 0 && notifications.map((item, index) => {
                    let lastDate = new Date(new Date(notifications[notifications.length - 1 - index].date).getTime() + 1000 * 60 * 1440).getTime();
                    let currentDate = new Date().getTime()
                    if (lastDate > currentDate) {
                        return (
                            <div className="list-notification" key={index}>
                                <div className="detail-notification">
                                    <Avatar alt="" src="/images/profile.png" />
                                    <div className="profile-detail-notification"><p>{notifications[notifications.length - 1 - index].username} <span>({notifications[notifications.length - 1 - index].status})</span></p></div>
                                </div>
                                <div className="text-notification">
                                    <p>{notifications[notifications.length - 1 - index].post}</p>
                                    <p>{formatDate(notifications[notifications.length - 1 - index].date)} {formatTime(notifications[notifications.length - 1 - index].date)}</p>
                                </div>
                            </div>
                        )
                    }
                })} */}

        <h2>ก่อนหน้านี้</h2>
        {/* {notifications.length !== 0 && notifications.map((item, index) => {
                    let lastDate = new Date(new Date(notifications[notifications.length - 1 - index].date).getTime() + 1000 * 60 * 1440).getTime();
                    let currentDate = new Date().getTime()
                    if (lastDate < currentDate) {
                        return (
                            <React.Fragment key={index}>
                                <div className="list-notification">
                                    <div className="detail-notification">
                                        <Avatar alt="" src="/images/profile.png" />
                                        <div className="profile-detail-notification"><p>{notifications[notifications.length - 1 - index].username} <span>({notifications[notifications.length - 1 - index].status})</span></p></div>
                                    </div>
                                    <div className="text-notification">
                                        <p>{notifications[notifications.length - 1 - index].post}</p>
                                        <p>{formatDate(notifications[notifications.length - 1 - index].date)}</p>
                                    </div>
                                </div>
                            </React.Fragment>
                        )
                    }
                })} */}
      </div>
    </Menu>
  );

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <Link to={"/profile/"}>
        <MenuItem onClick={handleMenuClose}>โปรไฟล์</MenuItem>
      </Link>
      <Link to={`/profile/edit`}>
        <MenuItem onClick={handleMenuClose}>แก้ไขโปรไฟล์</MenuItem>
      </Link>
      <MenuItem onClick={handleLogout}>ออกจากระบบ</MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";

  // Mobile Version
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleNotificationOpen}>
        <IconButton aria-label="show 11 new notifications" color="inherit">
          <Badge badgeContent={11} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>การแจ้งเตือน</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <Avatar alt="" src={user.avartar ? user.avartar.url : "/images/profile.png"} />
        </IconButton>
        <p>โปรไฟล์</p>
      </MenuItem>
    </Menu>
  );

  return (
    <div className={classes.grow}>
      <AppBar position="static">
        <Toolbar>
          {/* Hamburgur Icon */}
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="open drawer"
            onClick={openHamburgur}
          >
            <MenuIcon />
          </IconButton>

          {/* Header */}
          <Typography className={classes.title} variant="h6" noWrap>
            <Link to="/tool/list" className={classes.webName}>
              Stock-Electronic
            </Link>
          </Typography>

          {/* Search Icon */}
          {/* <div className={classes.search}> */}
          {/* <div className={classes.searchIcon}>
                            <SearchIcon />
                        </div> */}
          {/* <InputBase
                            placeholder="ค้นหา…"
                            classes={{
                                root: classes.inputRoot,
                                input: classes.inputInput,
                            }}
                            inputProps={{ 'aria-label': 'search' }}
                        /> */}
          <div className={classes.search} id="nav-search">
            <Autocomplete
              // freeSolo
              onChange={handleSearch}
              // id="free-solo-2-demo"
              // disableClearable
              options={data}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="ค้นหา..."
                  margin="normal"
                  variant="outlined"
                  InputProps={{ ...params.InputProps }}
                  className={classes.inputRoot}
                />
              )}
            />
          </div>
          {/* </div> */}

          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            {/* Notification Icon */}
            <IconButton
              aria-label="show 17 new notifications"
              color="inherit"
              onClick={handleNotificationOpen}
            >
              <Badge badgeContent={0} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Account Icon */}
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              {/* <AccountCircle /> */}
              <Avatar alt="" src={user.avartar ? user.avartar.url : "/images/profile.png"} />
            </IconButton>
          </div>

          {/* show an icon when responsive */}
          <div className={classes.sectionMobile}>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      {renderNotification}
      <SlideBar
        openHamburgur={openHamburgur}
        closeHamburgur={closeHamburgur}
        Hamburgur={Hamburgur}
      />
    </div>
  );
}
