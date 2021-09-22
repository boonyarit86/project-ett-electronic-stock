import {
  ADD_CATEGORY_FAIL,
  ADD_CATEGORY_REQUEST,
  ADD_CATEGORY_SUCCESS,
  ADD_TYPE_FAIL,
  ADD_TYPE_REQUEST,
  ADD_TYPE_SUCCESS,
  DELETE_CATEGORY_FAIL,
  DELETE_CATEGORY_REQUEST,
  DELETE_CATEGORY_SUCCESS,
  DELETE_TYPE_FAIL,
  DELETE_TYPE_REQUEST,
  DELETE_TYPE_SUCCESS,
  EDIT_CATEGORY_FAIL,
  EDIT_CATEGORY_REQUEST,
  EDIT_CATEGORY_SUCCESS,
  EDIT_TYPE_FAIL,
  EDIT_TYPE_REQUEST,
  EDIT_TYPE_SUCCESS,
  GET_ALL_TYPE_FAIL,
  GET_ALL_TYPE_REQUEST,
  GET_ALL_TYPE_SUCCESS,
} from "../constants/sttConstants";

const initialState = {
  lists: [],
  errorMsg: null,
};

export function sttReducers(state = initialState, action) {
  switch (action.type) {
    case GET_ALL_TYPE_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case ADD_TYPE_REQUEST:
    case ADD_CATEGORY_REQUEST:
    case EDIT_TYPE_REQUEST:
    case EDIT_CATEGORY_REQUEST:
    case DELETE_TYPE_REQUEST:
    case DELETE_CATEGORY_REQUEST:
      return {
        ...state,
        isLoadingEdit: true,
      };
    case GET_ALL_TYPE_SUCCESS:
      return {
        ...state,
        lists: action.payload,
        isLoading: false,
      };
    case ADD_TYPE_SUCCESS:
      return {
        ...state,
        isLoadingEdit: false,
        lists: [...state.lists, action.payload],
      };
    case ADD_CATEGORY_SUCCESS:
      return {
        ...state,
        isLoadingEdit: false,
        lists: state.lists.map((item) => {
          if (item._id === action.payload.tid) {
            item.categorys = action.payload.categorys;
            return item;
          }
          return item;
        }),
      };
    case EDIT_TYPE_SUCCESS:
      return {
        ...state,
        isLoadingEdit: false,
        lists: state.lists.map((item) => {
          if (item._id === action.payload.tid) {
            item.type = action.payload.text;
            return item;
          }
          return item;
        }),
      };
    case EDIT_CATEGORY_SUCCESS:
        return {
            ...state,
            isLoadingEdit: false,
            lists: state.lists.map((item) => {
                item.categorys = item.categorys.map((cate) => {
                    if(cate._id === action.payload.cid) {
                        cate.category = action.payload.text
                        console.log(cate)
                        return cate
                    }
                    return cate
                } );
            return item;
            })
        }
    case DELETE_TYPE_SUCCESS:
      return {
        ...state,
        isLoadingEdit: false,
        lists: state.lists.filter((item) => item._id !== action.payload.tid),
      };
    case DELETE_CATEGORY_SUCCESS:
      return {
        ...state,
        isLoadingEdit: false,
        lists: state.lists.map((item) => {
          if (item._id === action.payload.tid) {
            item.categorys = item.categorys.filter(
              (category) => category._id !== action.payload.cid
            );
            console.log(item);
            return item;
          }
          return item;
        }),
      };
    case GET_ALL_TYPE_FAIL:
      return {
        ...state,
        isLoading: false,
        lists: [],
        errorMsg: action.payload,
      };
    case ADD_TYPE_FAIL:
    case ADD_CATEGORY_FAIL:
    case EDIT_TYPE_FAIL:
    case EDIT_CATEGORY_FAIL:
    case DELETE_TYPE_FAIL:
    case DELETE_CATEGORY_FAIL:
      return {
        ...state,
        isLoadingEdit: false,
        errorMsgEdit: action.payload,
      };
    default:
      return state;
  }
}
