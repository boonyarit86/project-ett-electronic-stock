import {
  CREATE_TOOL_REQUEST,
  CREATE_TOOL_SUCCESS,
  CREATE_TOOL_FAIL,
  GET_ALL_TOOL_SUCCESS,
  GET_ALL_TOOL_FAIL,
  GET_ALL_TOOL_REQUEST,
  ACTION_TOOL_REQUEST,
  ACTION_TOOL_SUCCESS,
  ACTION_TOOL_FAIL,
} from "../constants/toolConstants";

const initialState = {
  errorMsg: null,
};

export function toolListsReducers(state = initialState, action) {
  switch (action.type) {
    case GET_ALL_TOOL_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case CREATE_TOOL_REQUEST:
    case ACTION_TOOL_REQUEST:
      return {
        ...state,
        isLoadingActions: true,
      };
      case GET_ALL_TOOL_SUCCESS:
        return {
          ...state,
          isLoading: false,
        };
    case CREATE_TOOL_SUCCESS:
    case ACTION_TOOL_SUCCESS:
      return {
        ...state,
        isLoadingActions: false,
        errorMsgActions: null
      };
      case GET_ALL_TOOL_FAIL:
        return {
          ...state,
          isLoading: false,
          errorMsg: action.payload,
        };
    case CREATE_TOOL_FAIL:
    case ACTION_TOOL_FAIL:
      return {
        ...state,
        isLoadingActions: false,
        errorMsgActions: action.payload
      };
    default:
      return state;
  }
}
