import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from 'redux-thunk';
import { userDataReducers, authUserReducers } from "./reducers/userReducers";

const inititalState = [];
const reducer = combineReducers({
    userData: userDataReducers,
    authUser: authUserReducers
});

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, inititalState, composeEnhancer(applyMiddleware(thunk)));
export default store;
