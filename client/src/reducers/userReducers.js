import { EDIT_USER_FAIL, EDIT_USER_REQUEST, EDIT_USER_SUCCESS, GET_USER_FAIL, GET_USER_REQUEST, GET_USER_SUCCESS } from "../constants/userConstants";

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
        case EDIT_USER_REQUEST:
            return {
                ...state,
                isLoadingEdit: true
            }
        case GET_USER_SUCCESS:
            return {
                ...state,
                isLoading: false,
                user: action.payload
            };
        case EDIT_USER_SUCCESS:
            return {
                ...state,
                isLoadingEdit: false,
                user: action.payload,
                errorMsgEdit: null
            }
        case GET_USER_FAIL:
            return{
                ...state,
                errorMsg: action.payload,
                isLoading: false
            };
        case EDIT_USER_FAIL:
            return {
                ...state,
                isLoadingEdit: false,
                errorMsgEdit: action.payload
            }
        default:
            return state;        
    }
}