import {
  EDIT_USER_FAIL,
  EDIT_USER_REQUEST,
  EDIT_USER_SUCCESS,
  GET_USER_FAIL,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
} from "../constants/userConstants";
import catchErrors from "../shared/utils/catchErrors";
import Axios from "axios";

// const storedData = JSON.parse(localStorage.getItem('userData'));
const react_api_url = "http://localhost:5000/api/users";

export const getUserByIdAction = (token) => async (dispatch) => {
  dispatch({ type: GET_USER_REQUEST });
  try {
    await Axios.get(`${react_api_url}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => dispatch({ type: GET_USER_SUCCESS, payload: res.data }));
  } catch (error) {
    dispatch({
      type: GET_USER_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const editUserByIdAction = (user) => async (dispatch) => {
  console.log(user.avartar);
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
    await Axios.put(`${react_api_url}/edit/${user.id}`, formData).then((res) =>
      dispatch({ type: EDIT_USER_SUCCESS, payload: res.data })
    );
  } catch (error) {
    dispatch({
      type: EDIT_USER_FAIL,
      payload: catchErrors(error),
    });
  }
};
