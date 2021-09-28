import { ACTION_BOARD_FAIL, ACTION_BOARD_REQUEST, ACTION_BOARD_SUCCESS, EDIT_INCOMPLETE_TOOL_REQUEST, CHECK_BOARD_FAIL, CHECK_BOARD_REQUEST, CHECK_BOARD_SUCCESS, CREATE_BOARD_FAIL, CREATE_BOARD_REQUEST, CREATE_BOARD_SUCCESS, DELETE_BOARD_FAIL, DELETE_BOARD_REQUEST, DELETE_BOARD_SUCCESS, EDIT_BOARD_FAIL, EDIT_BOARD_REQUEST, EDIT_BOARD_SUCCESS, GET_ALL_BOARD_FAIL, GET_ALL_BOARD_REQUEST, GET_ALL_BOARD_SUCCESS, GET_BOARD_FAIL, GET_BOARD_REQUEST, GET_BOARD_SUCCESS, HISTORY_BOARD_LIST_FAIL, HISTORY_BOARD_LIST_REQUEST, HISTORY_BOARD_LIST_SUCCESS, INCOMPLETE_TOOL_REQUEST, RESTORE_HISTORY_BOARD_FAIL, RESTORE_HISTORY_BOARD_REQUEST, RESTORE_HISTORY_BOARD_SUCCESS, DELETE_INCOMPLETE_TOOL_REQUEST, INCOMPLETE_TOOL_SUCCESS, EDIT_INCOMPLETE_TOOL_SUCCESS, DELETE_INCOMPLETE_TOOL_SUCCESS, INCOMPLETE_TOOL_FAIL, EDIT_INCOMPLETE_TOOL_FAIL, DELETE_INCOMPLETE_TOOL_FAIL } from "../constants/boardConstants";

const initialState = {
  errorMsg: null,
  msgs: null
};

export function boardListsReducers(state = initialState, action) {
  switch (action.type) {
    case GET_ALL_BOARD_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case CREATE_BOARD_REQUEST:
    case ACTION_BOARD_REQUEST:
    case CHECK_BOARD_REQUEST:
      return {
        ...state,
        isLoadingActions: true,
      };
    case GET_ALL_BOARD_SUCCESS:
      return {
        ...state,
        isLoading: false,
        msgs: null
      };
    case CREATE_BOARD_SUCCESS:
    case ACTION_BOARD_SUCCESS:
      return {
        ...state,
        isLoadingActions: false,
        errorMsgActions: null,
        msgs: null
      };
    case CHECK_BOARD_SUCCESS:
      return {
        ...state,
        isLoadingActions: false,
        msgs: action.payload,
        errorMsgActions: null
      }
    case GET_ALL_BOARD_FAIL:
      return {
        ...state,
        isLoading: false,
        errorMsg: action.payload,
      };
    case CREATE_BOARD_FAIL:
    case ACTION_BOARD_FAIL:
    case CHECK_BOARD_FAIL:
      return {
        ...state,
        isLoadingActions: false,
        errorMsgActions: action.payload,
        msgs: null
      };
    default:
      return state;
  }
}

export function boardListReducers(state = {}, action) {
  switch (action.type) {
    case GET_BOARD_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case EDIT_BOARD_REQUEST:
      return {
        ...state,
        isLoadingEdit: true,
      };
    case DELETE_BOARD_REQUEST:
      return {
        ...state,
        isLoadingDelete: true,
      };
    case GET_BOARD_SUCCESS:
      return {
        ...state,
        board: action.payload,
        isLoading: false,
        errorMsgDelete: null,
        errorMsgEdit: null,
        errorMsg: null
      };
    case EDIT_BOARD_SUCCESS:
      return {
        ...state,
        isLoadingEdit: false,
        board: action.payload,
        errorMsgDelete: null,
        errorMsgEdit: null,
        errorMsg: null
      };
    case DELETE_BOARD_SUCCESS:
      return {
        ...state,
        isLoadingDelete: false,
      };
    case GET_BOARD_FAIL:
      return {
        ...state,
        isLoading: false,
        errorMsg: action.payload,
      };
    case EDIT_BOARD_FAIL:
      return {
        ...state,
        isLoadingEdit: false,
        errorMsgEdit: action.payload,
      };
    case DELETE_BOARD_FAIL:
      return {
        ...state,
        isLoadingDelete: false,
        errorMsgDelete: action.payload,
      };
    default:
      return state;
  }
}

export function hisbsListsReducers(state = {}, action) {
  switch (action.type) {
    case HISTORY_BOARD_LIST_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case RESTORE_HISTORY_BOARD_REQUEST:
      return {
        ...state,
        isLoadingActions: true
      }
    case HISTORY_BOARD_LIST_SUCCESS:
      return {
        ...state,
        isLoading: false,
        hisbs: action.payload,
        errorMsg: null,
        errorMsgActions: null
      };
      case RESTORE_HISTORY_BOARD_SUCCESS:
        return {
          ...state,
          isLoadingActions: false,
          hisbs: action.payload,
          errorMsgActions: null,
          errorMsg: null
        }
    case HISTORY_BOARD_LIST_FAIL:
      return {
        ...state,
        isLoading: false,
        errorMsg: action.payload,
      };
    case RESTORE_HISTORY_BOARD_FAIL:
      return {
        ...state,
        isLoadingActions: false,
        errorMsgActions: action.payload
      }
    default:
      return state;
  }
}

export function incompleteToolReducers(state = {}, action) {
  switch (action.type) {
    case INCOMPLETE_TOOL_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case EDIT_INCOMPLETE_TOOL_REQUEST:
    case DELETE_INCOMPLETE_TOOL_REQUEST:
      return {
        ...state,
        isLoadingActions: true,
      };
    case INCOMPLETE_TOOL_SUCCESS:
      return {
        ...state,
        lists: action.payload,
        isLoading: false,
        errorMsgActions: null,
        errorMsg: null
      };
    case EDIT_INCOMPLETE_TOOL_SUCCESS:
    case DELETE_INCOMPLETE_TOOL_SUCCESS:
      return {
        ...state,
        isLoadingActions: false,
        lists: action.payload,
        errorMsgActions: null,
        errorMsg: null
      };
    case INCOMPLETE_TOOL_FAIL:
      return {
        ...state,
        isLoading: false,
        errorMsg: action.payload,
      };
    case EDIT_INCOMPLETE_TOOL_FAIL:
    case DELETE_INCOMPLETE_TOOL_FAIL:
      return {
        ...state,
        isLoadingActions: false,
        errorMsgActions: action.payload,
      };
    default:
      return state;
  }
}
