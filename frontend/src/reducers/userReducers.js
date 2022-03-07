import {
  APPROVE_USER_FAIL,
  APPROVE_USER_REQUEST,
  APPROVE_USER_SUCCESS,
  DELETE_USER_FAIL,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  EDIT_STATUS_USER_FAIL,
  EDIT_STATUS_USER_REQUEST,
  EDIT_STATUS_USER_SUCCESS,
  EDIT_USER_FAIL,
  EDIT_USER_REQUEST,
  EDIT_USER_SUCCESS,
  GET_ALL_USER_FAIL,
  GET_ALL_USER_REQUEST,
  GET_ALL_USER_SUCCESS,
  GET_USER_FAIL,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  LOGIN_USER_FAIL,
  LOGIN_USER_REQUEST,
  LOGIN_USER_SUCCESS,
  REGISTER_USER_FAIL,
  REGISTER_USER_REQUEST,
  REGISTER_USER_SUCCESS,
} from "../constants/userConstants";

const initialState = {
  user: {},
  errorMsg: null,
};

const initialState1 = {
  user: null,
  errorMsg: null,
  isLoading: false,
};

export function userDataReducers(state = initialState, action) {
  switch (action.type) {
    case GET_USER_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case EDIT_USER_REQUEST:
      return {
        ...state,
        isLoadingEdit: true,
      };
    case GET_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload,
      };
    case EDIT_USER_SUCCESS:
      return {
        ...state,
        isLoadingEdit: false,
        user: action.payload,
        errorMsgEdit: null,
      };
    case GET_USER_FAIL:
      return {
        ...state,
        errorMsg: action.payload,
        isLoading: false,
      };
    case EDIT_USER_FAIL:
      return {
        ...state,
        isLoadingEdit: false,
        errorMsgEdit: action.payload,
      };
    default:
      return state;
  }
}

export function authUserReducers(state = {}, action) {
  switch (action.type) {
    case GET_ALL_USER_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case APPROVE_USER_REQUEST:
    case EDIT_STATUS_USER_REQUEST:
    case DELETE_USER_REQUEST:
      return {
        ...state,
        isLoadingEdit: true,
      };
    case GET_ALL_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        userLists: action.payload,
      };
    case APPROVE_USER_SUCCESS:
      return {
        ...state,
        isLoadingEdit: false,
        userLists: state.userLists.map((item) => {
          if (item._id === action.payload) {
            item.status = "user";
          }
          return item;
        }),
      };
    case EDIT_STATUS_USER_SUCCESS:
      return {
        ...state,
        isLoadingEdit: false,
        userLists: state.userLists.map((item) => {
          if (item._id === action.payload.userId) {
            item.status = action.payload.newStatus;
          }
          return item;
        }),
      };
    case DELETE_USER_SUCCESS:
      return {
        ...state,
        isLoadingEdit: false,
        userLists: state.userLists.filter(
          (item) => item._id !== action.payload
        ),
      };
    case GET_ALL_USER_FAIL:
      return {
        ...state,
        isLoading: false,
        userLists: [],
        errorMsg: action.payload,
      };
    case APPROVE_USER_FAIL:
    case EDIT_STATUS_USER_FAIL:
    case DELETE_USER_FAIL:
      return {
        ...state,
        isLoadingEdit: false,
        errorMsgEdit: action.payload,
      };
    default:
      return state;
  }
}

export const userReducer = (state = initialState1, action) => {
  switch (action.type) {
    case REGISTER_USER_REQUEST:
    case LOGIN_USER_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case REGISTER_USER_SUCCESS:
    case LOGIN_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
      };
    case REGISTER_USER_FAIL:
    case LOGIN_USER_FAIL:
      return {
        ...state,
        isLoading: false,
        errorMsg: action.payload
      };
    default:
        return state;
  }
};
