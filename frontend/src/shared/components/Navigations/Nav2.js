import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";
import { getUserByIdAction } from "../../../actions/userActions";
import Axios from "axios";
import { io } from "socket.io-client";

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
} from "@material-ui/core";
import SlideBar from "./SlideBar";
// import Loading from "../UIElements/Loading";

// Icon
import MenuIcon from "@material-ui/icons/Menu";
import NotificationsIcon from "@material-ui/icons/Notifications";
import SettingsIcon from "@material-ui/icons/Settings";
import MoreIcon from "@material-ui/icons/MoreVert";
import Notification from "../UIElements/Notification";

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
    marginBottom: "5px",
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
  // menuNotification: {
  //   width: "250px",
  //   overflow: "initial",
  // },
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
  const [anchorElSetting, setAnchorElSetting] = React.useState(null);
  const [Hamburgur, setHamburgur] = React.useState(false);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const [data, setData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotification, setUnReadNotification] = useState(0);

  // User Data
  useEffect(() => {
      dispatch(getUserByIdAction(auth.token, setUnReadNotification, auth.logout));
  }, []);

  // Socket IO
  useEffect(() => {
    const socket = io("ws://localhost:5000");
    // const socket = io("https://ett-test.herokuapp.com");
    socket.on("notification-actions", (newNotification) => {
      //   console.log("Client: tool-added");
      setNotifications(newNotification);
    });
    socket.on("unreadNotification-actions", async (data) => {
      //   console.log("Client: tool-added");
      let findData = await data.find((item) => item._id === auth.userId);
      if (findData) {
        setUnReadNotification(findData.unreadNotification);
      }
    });
  }, []);

  // Notification
  useEffect(() => {
    let reqNotification = async () => {
      try {
        await Axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/notifications`
        ).then((res) => {
          setNotifications(res.data);
        });
      } catch (error) {}
    };
    reqNotification();
  }, []);

  // Search
  useEffect(() => {
    let reqSearchData = async () => {
      let tools = [];
      let boards = [];
      let newArr = [];
      try {
        await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/tools/`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }).then((res) => {
          tools = res.data;
        });
        await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/boards/`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }).then((res) => {
          boards = res.data;
        });
      } catch (error) {}
      if (tools.length !== 0) {
        await tools.map((tool) => {
          let newData = { id: tool._id, name: tool.toolName, status: "tool" };
          newArr = [...newArr, newData];
        });
      }
      if (boards.length !== 0) {
        await boards.map((board) => {
          let newData = {
            id: board._id,
            name: board.boardName,
            status: "board",
          };
          newArr = [...newArr, newData];
        });
      }
      setData(newArr);
    };
    reqSearchData();
  }, []);

  const isMenuOpen = Boolean(anchorEl);
  const isNotifiOpen = Boolean(anchorElNoti);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const isSettingOpen = Boolean(anchorElSetting);

  const handleSettingMenuOpen = (event) => {
    // console.log(event.currentTarget)
    setAnchorElSetting(event.currentTarget);
  };

  const handleProfileMenuOpen = (event) => {
    // console.log(event.currentTarget)
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationOpen = async (event) => {
    // console.log(event.currentTarget)
    setAnchorElNoti(event.currentTarget);
    setUnReadNotification(0);
    try {
      await Axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/notifications`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      ).then((res) => {});
    } catch (error) {}
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

  const handleMobileSettingMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleSettingMenuClose = () => {
    setAnchorElSetting(null);
    handleMobileSettingMenuClose();
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

  const menuId = "primary-search-account-menu";
  const settingMenuId = "primary-search-setting-menu";
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
      <Notification notifications={notifications} />
    </Menu>
  );

  const renderSettingMenu = (
    <Menu
      anchorEl={anchorElSetting}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={settingMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isSettingOpen}
      onClose={handleSettingMenuClose}
    >
      <Link to={"/setting1/tool1"}>
        <MenuItem onClick={handleSettingMenuClose}>
          ชนิด&ประเภทของอุปกรณ์
        </MenuItem>
      </Link>
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
      <MenuItem onClick={handleSettingMenuOpen}>
        <IconButton
          aria-label="stting of current user"
          aria-controls="primary-search-setting-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <SettingsIcon />
        </IconButton>
        <p>การตั่งค่า</p>
      </MenuItem>
      <MenuItem onClick={handleNotificationOpen}>
        <IconButton aria-label="show 11 new notifications" color="inherit">
          <Badge badgeContent={unreadNotification} color="secondary">
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
          <Avatar
            alt=""
            src={user.avartar ? user.avartar.url : "/images/profile.png"}
          />
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
            {auth.userStatus !== "none" ? (
              <Link to="/tool/list" className={classes.webName}>
                Electronic-Stock
              </Link>
            ) : (
              "Stock-Electronic"
            )}
          </Typography>

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
            <IconButton
              aria-label="setting"
              color="inherit"
              onClick={handleSettingMenuOpen}
            >
              <Badge color="secondary">
                <SettingsIcon />
              </Badge>
            </IconButton>
            {/* Notification Icon */}
            <IconButton
              aria-label="show 17 new notifications"
              color="inherit"
              onClick={handleNotificationOpen}
            >
              <Badge badgeContent={unreadNotification} color="secondary">
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
              <Avatar
                alt=""
                src={user.avartar ? user.avartar.url : "/images/profile.png"}
              />
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
      {renderSettingMenu}
      <SlideBar
        openHamburgur={openHamburgur}
        closeHamburgur={closeHamburgur}
        Hamburgur={Hamburgur}
      />
    </div>
  );
}
