import React from 'react';
import { CircularProgress, Backdrop } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';

// CSS 
import "./Loading.css";

// CSS Mterial UI
const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

function Loading(props) {

    const classes = useStyles()

    return (
        <Backdrop open={props.loading} className={classes.backdrop}>
            <div className="loading">
                <CircularProgress />
            </div>
        </Backdrop>
    )
}

export default Loading
