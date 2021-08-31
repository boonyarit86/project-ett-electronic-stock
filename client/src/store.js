import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from 'redux-thunk';
import userReducers from "./reducers/userReducers";

const inititalState = [];
const reducer = combineReducers({
    userData: userReducers
});

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, inititalState, composeEnhancer(applyMiddleware(thunk)));
export default store;
