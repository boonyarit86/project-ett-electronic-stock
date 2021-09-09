import { GET_ALL_TYPE_REQUEST } from "../constants/sttConstants";
import { CREATE_TOOL_REQUEST, CREATE_TOOL_SUCCESS, CREATE_TOOL_FAIL, GET_ALL_TOOL_SUCCESS, GET_ALL_TOOL_FAIL } from "../constants/toolConstants";

const initialState = {
    tools: [],
    errorMsg: null
};

export function toolListsReducers(state = initialState, action) {
    switch (action.type) {
        case CREATE_TOOL_REQUEST:
        case GET_ALL_TYPE_REQUEST:
            return {
                ...state,
                isLoading: true
            }
        case CREATE_TOOL_SUCCESS:
            return {
                ...state,
                isLoading: false,
                tools: [...state.tools, action.payload]
            }
        case GET_ALL_TOOL_SUCCESS:
            return {
                ...state,
                isLoading: false,
                tools: action.payload
            }
        case CREATE_TOOL_FAIL:
        case GET_ALL_TOOL_FAIL:
            return {
                ...state,
                isLoading: false,
                errorMsg: action.payload
            }
        default:
            return state
    }
}