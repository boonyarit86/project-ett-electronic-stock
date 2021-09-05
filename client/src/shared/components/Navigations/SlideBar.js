import React from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { ListItemIcon, ListItemText } from "@material-ui/core";
// import { AuthContext } from "../../context/auth-context";

// Components
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";

// Icon
import ListIcon from "@material-ui/icons/List";
import AddIcon from "@material-ui/icons/Add";
import RestorePageIcon from "@material-ui/icons/RestorePage";
import GroupIcon from "@material-ui/icons/Group";
import InputIcon from "@material-ui/icons/Input";
import HomeIcon from "@material-ui/icons/Home";

// Material UI
const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: "auto",
  },
  link: {},
});

export default function SlideBar(props) {
  const { Hamburgur, closeHamburgur, openHamburgur } = props;
  const classes = useStyles();
  // Redux
  const { user } = useSelector((state) => state.userData);

  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  // const [Hamburgur, setHamburgur] = React.useState(false);

  // const closeHamburgur = () => {
  //     setHamburgur(false);
  // }

  // const openHamburgur = () => {
  //     setHamburgur(true);
  // }

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = (anchor) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === "top" || anchor === "bottom",
      })}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        <Link className={classes.link} to="/" onClick={closeHamburgur}>
          <ListItem button>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="หน้าแรก" />
          </ListItem>
        </Link>
      </List>
      <Divider />
      <List>
        {user.status !== "none" && (
          <Link
            className={classes.link}
            to="/tool/list"
            onClick={closeHamburgur}
          >
            <ListItem button>
              <ListItemIcon>
                <ListIcon />
              </ListItemIcon>
              <ListItemText primary="รายการอุปกรณ์" />
            </ListItem>
          </Link>
        )}
        {user.status === "admin" || user.status === "staff" ? (
          <Link
            className={classes.link}
            to="/tool/new"
            onClick={closeHamburgur}
          >
            <ListItem button>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="สร้างอุปกรณ์" />
            </ListItem>
          </Link>
        ) : null}
        <Link
          className={classes.link}
          to="/historytool"
          onClick={closeHamburgur}
        >
          <ListItem button>
            <ListItemIcon>
              <RestorePageIcon />
            </ListItemIcon>
            <ListItemText primary="ประวัติการเบิก/เพิ่มอุปกรณ์" />
          </ListItem>
        </Link>
      </List>
      <Divider />
      <List>
        {user.status !== "none" && (
          <Link
            className={classes.link}
            to="/board/list"
            onClick={closeHamburgur}
          >
            <ListItem button>
              <ListItemIcon>
                <ListIcon />
              </ListItemIcon>
              <ListItemText primary="รายการบอร์ด" />
            </ListItem>
          </Link>
        )}
        {user.status === "admin" || user.status === "staff" ? (
          <React.Fragment>
            <Link
              className={classes.link}
              to="/board/new"
              onClick={closeHamburgur}
            >
              <ListItem button>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="สร้างบอร์ด" />
              </ListItem>
            </Link>
            <Link
              className={classes.link}
              to="/project/new"
              onClick={closeHamburgur}
            >
              <ListItem button>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="สร้างโปรเจค" />
              </ListItem>
            </Link>
            <Link
              className={classes.link}
              to="/board/request"
              onClick={closeHamburgur}
            >
              <ListItem button>
                <ListItemIcon>
                  <InputIcon />
                </ListItemIcon>
                <ListItemText primary="เบิกบอร์ด" />
              </ListItem>
            </Link>
          </React.Fragment>
        ) : null}
        <Link
          className={classes.link}
          to="/historyboard"
          onClick={closeHamburgur}
        >
          <ListItem button>
            <ListItemIcon>
              <RestorePageIcon />
            </ListItemIcon>
            <ListItemText primary="ประวัติการเบิก/เพิ่มบอร์ด" />
          </ListItem>
        </Link>
        {user.status !== "none" && (
          <Link
            className={classes.link}
            to="/historyproject"
            onClick={closeHamburgur}
          >
            <ListItem button>
              <ListItemIcon>
                <RestorePageIcon />
              </ListItemIcon>
              <ListItemText primary="ประวัติการเบิกโปรเจค" />
            </ListItem>
          </Link>
        )}
      </List>
      <Divider />
      <List>
        {user.status !== "none" && (
          <Link
            className={classes.link}
            to="/boardincomplete"
            onClick={closeHamburgur}
          >
            <ListItem button>
              <ListItemIcon>
                <ListIcon />
              </ListItemIcon>
              <ListItemText primary="อุปกรณ์ไม่ครบ" />
            </ListItem>
          </Link>
        )}
        {user.status === "admin" && (
          <Link
            className={classes.link}
            to="/purchase"
            onClick={closeHamburgur}
          >
            <ListItem button>
              <ListItemIcon>
                <ListIcon />
              </ListItemIcon>
              <ListItemText primary="หน้ารายการสั่งซื้อ" />
            </ListItem>
          </Link>
        )}
        {user.status === "admin" && (
          <Link
            className={classes.link}
            to="/auth/users"
            onClick={closeHamburgur}
          >
            <ListItem button>
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="จัดการเข้าถึงของผู้ใช้ทั้งหมด" />
            </ListItem>
          </Link>
        )}
      </List>
    </div>
  );

  return (
    <div>
      {/* <Button onClick={openHamburgur}>open</Button> */}
      <Drawer anchor="left" open={Hamburgur} onClose={closeHamburgur}>
        {list("left")}
      </Drawer>
    </div>
  );
}
