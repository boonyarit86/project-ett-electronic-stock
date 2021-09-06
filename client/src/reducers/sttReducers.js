import { GET_ALL_TYPE_FAIL, GET_ALL_TYPE_REQUEST, GET_ALL_TYPE_SUCCESS } from "../constants/sttConstants";

const initialState = {
    lists: [],
    errorMsg: null
};

export function sttReducers (state = initialState, action) {
    switch (action.type) {
        case GET_ALL_TYPE_REQUEST:
            return {
                ...state,
                isLoading: true
            }
        case GET_ALL_TYPE_SUCCESS:
            return {
                ...state,
                isLoading: false,
                lists: action.payload
            }
        case GET_ALL_TYPE_FAIL:
            return {
                ...state,
                isLoading: false,
                lists: [],
                errorMsg: action.payload
            }
        default:
            return state
    }
}