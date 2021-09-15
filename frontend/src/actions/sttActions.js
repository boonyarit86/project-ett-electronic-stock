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
import catchErrors from "../shared/utils/catchErrors";
import Axios from "axios";

const react_api_url = "http://localhost:5000/api/stts";
const AuthToken = (token) => {
  return { Authorization: `Bearer ${token}` };
};

export const getAllTypeAction = (token) => async (dispatch) => {
  dispatch({ type: GET_ALL_TYPE_REQUEST });
  try {
    await Axios.get(`${react_api_url}/lists`, {
      headers: AuthToken(token),
    }).then((res) =>
      dispatch({ type: GET_ALL_TYPE_SUCCESS, payload: res.data })
    );
  } catch (error) {
    dispatch({
      type: GET_ALL_TYPE_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const addTypeAction = (token, data) => async (dispatch) => {
  dispatch({ type: ADD_TYPE_REQUEST });
  try {
    await Axios.post(`${react_api_url}/new/type`, data, {
      headers: AuthToken(token),
    }).then((res) => dispatch({ type: ADD_TYPE_SUCCESS, payload: res.data }));
  } catch (error) {
    dispatch({
      type: ADD_TYPE_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const addCategoryAction = (token, data) => async (dispatch) => {
  dispatch({ type: ADD_CATEGORY_REQUEST });
  try {
    await Axios.post(
      `${react_api_url}/new/category/${data.tid}`,
      { category: data.category },
      {
        headers: AuthToken(token),
      }
    ).then((res) =>
      dispatch({
        type: ADD_CATEGORY_SUCCESS,
        payload: { categorys: res.data, tid: data.tid, msgSuccess: "" },
      })
    );
  } catch (error) {
    dispatch({
      type: ADD_CATEGORY_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const editTypeAction = (token, data, tid) => async (dispatch) => {
  dispatch({ type: EDIT_TYPE_REQUEST });
  try {
    await Axios.put(`${react_api_url}/type/${tid}`, data, {
      headers: AuthToken(token),
    }).then((res) =>
      dispatch({
        type: EDIT_TYPE_SUCCESS,
        payload: { text: data.type, msgSuccess: res.data, tid },
      })
    );
  } catch (error) {
    dispatch({
      type: EDIT_TYPE_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const editCategoryAction =
  (token, data, tid, cid) => async (dispatch) => {
    dispatch({ type: EDIT_CATEGORY_REQUEST });
    try {
      await Axios.put(`${react_api_url}/category/${tid}/${cid}`, data, {
        headers: AuthToken(token),
      }).then((res) =>
        dispatch({
          type: EDIT_CATEGORY_SUCCESS,
          payload: { text: data.category, msgSuccess: res.data, tid, cid },
        })
      );
    } catch (error) {
      dispatch({
        type: EDIT_CATEGORY_FAIL,
        payload: catchErrors(error),
      });
    }
  };

export const deleteTypeAction = (token, tid) => async (dispatch) => {
  dispatch({ type: DELETE_TYPE_REQUEST });
  try {
    await Axios.delete(`${react_api_url}/type/${tid}`, {
      headers: AuthToken(token),
    }).then((res) =>
      dispatch({
        type: DELETE_TYPE_SUCCESS,
        payload: { tid, msgSuccess: res.data },
      })
    );
  } catch (error) {
    dispatch({
      type: DELETE_TYPE_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const deleteCategoryAction = (token, tid, cid) => async (dispatch) => {
  dispatch({ type: DELETE_CATEGORY_REQUEST });
  try {
    await Axios.delete(`${react_api_url}/category/${tid}/${cid}`, {
      headers: AuthToken(token),
    }).then((res) =>
      dispatch({
        type: DELETE_CATEGORY_SUCCESS,
        payload: { tid: tid, cid: cid, msgSuccess: res.data },
      })
    );
  } catch (error) {
    dispatch({
      type: DELETE_CATEGORY_FAIL,
      payload: catchErrors(error),
    });
  }
};
