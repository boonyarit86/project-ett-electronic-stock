import {
  EDIT_USER_FAIL,
  EDIT_USER_REQUEST,
  EDIT_USER_SUCCESS,
  GET_USER_FAIL,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  GET_ALL_USER_REQUEST,
  GET_ALL_USER_SUCCESS,
  GET_ALL_USER_FAIL,
  APPROVE_USER_REQUEST,
  APPROVE_USER_FAIL,
  APPROVE_USER_SUCCESS,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAIL,
  EDIT_STATUS_USER_REQUEST,
  EDIT_STATUS_USER_SUCCESS,
  EDIT_STATUS_USER_FAIL,
} from "../constants/userConstants";
import catchErrors from "../shared/utils/catchErrors";
import Axios from "axios";
import { notifySuccess } from "../shared/components/UIElements/Toasts";

export const getAllUserAction = (token) => async (dispatch) => {
  dispatch({ type: GET_ALL_USER_REQUEST });
  try {
    await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) =>
      dispatch({ type: GET_ALL_USER_SUCCESS, payload: res.data })
    );
  } catch (error) {
    dispatch({
      type: GET_ALL_USER_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const getUserByIdAction = (token, setUnreadNotification) => async (dispatch) => {
  dispatch({ type: GET_USER_REQUEST });
  try {
    await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      dispatch({ type: GET_USER_SUCCESS, payload: res.data })
      setUnreadNotification && setUnreadNotification(res.data.unreadNotification)
    });
  } catch (error) {
    dispatch({
      type: GET_USER_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const editUserByIdAction = (token, user) => async (dispatch) => {
  dispatch({ type: EDIT_USER_REQUEST });

  try {
    let formData = new FormData();
    formData.append("email", user.email);
    formData.append("name", user.name);
    formData.append("password", user.password);
    formData.append("oldPassword", user.oldPassword);
    // กรณีผู้ใช้กำหนดรูปภาพมาอยู่แล้ว
    if (typeof user.avartar === "string") {
      formData.append("avartar", "");
    }
    // กรณีผู้เปลี่ยนรูปภาพใหม่
    if (typeof user.avartar === "object") {
      formData.append("avartar", user.avartar);
    }
    await Axios.put(
      `${process.env.REACT_APP_BACKEND_URL}/users/edit/${user.id}`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ).then((res) => {
      dispatch({ type: EDIT_USER_SUCCESS, payload: res.data });
      notifySuccess("แก้ไขข้อมูลเรียบร้อย");
    });
  } catch (error) {
    dispatch({
      type: EDIT_USER_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const approveUserAction = (token, userId) => async (dispatch) => {
  dispatch({ type: APPROVE_USER_REQUEST });
  try {
    await Axios.put(
      `${process.env.REACT_APP_BACKEND_URL}/users/approve/${userId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ).then((res) => {
      dispatch({ type: APPROVE_USER_SUCCESS, payload: userId });
      notifySuccess("อนุมัติเรียบร้อย");
    });
  } catch (error) {
    dispatch({
      type: APPROVE_USER_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const editStatusUserAction = (token, data) => async (dispatch) => {
  dispatch({ type: EDIT_STATUS_USER_REQUEST });
  try {
    await Axios.put(
      `${process.env.REACT_APP_BACKEND_URL}/users/edit/status/${data.userId}`,
      { newStatus: data.newStatus },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ).then((res) => {
      dispatch({ type: EDIT_STATUS_USER_SUCCESS, payload: data });
      notifySuccess("แก้ไขข้อมูลเรียบร้อย");
    });
  } catch (error) {
    dispatch({
      type: EDIT_STATUS_USER_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const deleteUserAction = (token, userId) => async (dispatch) => {
  dispatch({ type: DELETE_USER_REQUEST });
  try {
    await Axios.delete(`${process.env.REACT_APP_BACKEND_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      dispatch({ type: DELETE_USER_SUCCESS, payload: userId });
      notifySuccess("ลบข้อมูลผู้ใช้เรียบร้อย");
    });
  } catch (error) {
    dispatch({
      type: DELETE_USER_FAIL,
      payload: catchErrors(error),
    });
  }
};
