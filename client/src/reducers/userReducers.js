import { GET_USER_FAIL, GET_USER_REQUEST, GET_USER_SUCCESS } from "../constants/userConstants";

const initialState = {
    user: {},
    errorMsg: null
};

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_USER_REQUEST:
            return {
                ...state,
                isLoading: true
            };
        case GET_USER_SUCCESS:
            return {
                ...state,
                isLoading: false,
                user: action.payload
            };
        case GET_USER_FAIL:
            return{
                ...state,
                errorMsg: action.payload,
                isLoading: false
            };
        default:
            return state;        
    }
}