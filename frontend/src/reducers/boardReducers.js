import { ACTION_BOARD_FAIL, ACTION_BOARD_REQUEST, ACTION_BOARD_SUCCESS, CREATE_BOARD_FAIL, CREATE_BOARD_REQUEST, CREATE_BOARD_SUCCESS, GET_ALL_BOARD_FAIL, GET_ALL_BOARD_REQUEST, GET_ALL_BOARD_SUCCESS } from "../constants/boardConstants";

const initialState = {
  errorMsg: null,
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
      return {
        ...state,
        isLoadingActions: true,
      };
    case GET_ALL_BOARD_SUCCESS:
      return {
        ...state,
        isLoading: false,
      };
    case CREATE_BOARD_SUCCESS:
    case ACTION_BOARD_SUCCESS:
      return {
        ...state,
        isLoadingActions: false,
        errorMsgActions: null,
      };
    case GET_ALL_BOARD_FAIL:
      return {
        ...state,
        isLoading: false,
        errorMsg: action.payload,
      };
    case CREATE_BOARD_FAIL:
    case ACTION_BOARD_FAIL:
      return {
        ...state,
        isLoadingActions: false,
        errorMsgActions: action.payload,
      };
    default:
      return state;
  }
}

// export function toolListReducers(state = {}, action) {
//   switch (action.type) {
//     case GET_TOOL_REQUEST:
//       return {
//         ...state,
//         isLoading: true,
//       };
//     case EDIT_TOOL_REQUEST:
//       return {
//         ...state,
//         isLoadingEdit: true,
//       };
//     case DELETE_TOOL_REQUEST:
//       return {
//         ...state,
//         isLoadingDelete: true,
//       };
//     case GET_TOOL_SUCCESS:
//       return {
//         ...state,
//         tool: action.payload,
//         isLoading: false,
//       };
//     case EDIT_TOOL_SUCCESS:
//       return {
//         ...state,
//         isLoadingEdit: false,
//         tool: action.payload,
//       };
//     case DELETE_TOOL_SUCCESS:
//       return {
//         ...state,
//         isLoadingDelete: false,
//       };
//     case GET_TOOL_FAIL:
//       return {
//         ...state,
//         isLoading: false,
//         errorMsg: action.payload,
//       };
//     case EDIT_TOOL_FAIL:
//       return {
//         ...state,
//         isLoadingEdit: false,
//         errorMsgEdit: action.payload,
//       };
//     case DELETE_TOOL_FAIL:
//       return {
//         ...state,
//         isLoadingDelete: false,
//         errorMsgDelete: action.payload,
//       };
//     default:
//       return state;
//   }
// }

// export function histsListsReducers(state = {}, action) {
//   switch (action.type) {
//     case HISTORY_TOOL_LIST_REQUEST:
//       return {
//         ...state,
//         isLoading: true,
//       };
//     case RESTORE_HISTORY_TOOL_REQUEST:
//       return {
//         ...state,
//         isLoadingActions: true
//       }
//     case HISTORY_TOOL_LIST_SUCCESS:
//       return {
//         ...state,
//         isLoading: false,
//         hists: action.payload,
//         errorMsg: null,
//         errorMsgActions: null
//       };
//       case RESTORE_HISTORY_TOOL_SUCCESS:
//         return {
//           ...state,
//           isLoadingActions: false,
//           hists: action.payload,
//           errorMsgActions: null,
//           errorMsg: null
//         }
//     case HISTORY_TOOL_LIST_FAIL:
//       return {
//         ...state,
//         isLoading: false,
//         errorMsg: action.payload,
//       };
//     case RESTORE_HISTORY_TOOL_FAIL:
//       return {
//         ...state,
//         isLoadingActions: false,
//         errorMsgActions: action.payload
//       }
//     default:
//       return state;
//   }
// }
