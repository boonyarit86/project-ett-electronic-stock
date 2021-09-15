import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

// Component
import { Toolbar, AppBar } from "@material-ui/core";

// CSS
import "./Nav.css";

// CSS Material UI
const useStyles = makeStyles((theme) => ({
    grow: {
        flexGrow: 1,
    },
    title: {
        display: 'block',
        margin: "0 auto",
        [theme.breakpoints.up('sm')]: {
            margin: "0"


        },
    },
    webName: {
        color: "#fff",
        textAlign: "center"
    },
    sectionDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
        },
    }
}));

// Nav นี้จะแสดงที่หน้าเข้าสู่ระบบกับสมัครสมาชิก
export default function Nav() {
    const classes = useStyles()

    return (
        <div className={classes.grow}>
            <AppBar position="static">
                <Toolbar>
                    <h1 className={classes.title}>Stock-Electronic</h1>
                </Toolbar>
            </AppBar>
        </div>
    );
}