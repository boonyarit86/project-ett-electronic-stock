import { CREATE_TOOL_FAIL, CREATE_TOOL_REQUEST, CREATE_TOOL_SUCCESS, GET_ALL_TOOL_FAIL, GET_ALL_TOOL_REQUEST, GET_ALL_TOOL_SUCCESS } from "../constants/toolConstants";
import catchErrors from "../shared/utils/catchErrors";
import Axios from "axios";

const react_api_url = "http://localhost:5000/api/tools";
const AuthToken = (token) => {
    return { Authorization: `Bearer ${token}` }
}

export const getAllToolAction = (token) => async (dispatch) => {
  dispatch({ type: GET_ALL_TOOL_REQUEST });
  try {
    await Axios.get(`${react_api_url}/`, {
      headers: AuthToken(token),
    }).then((res) =>
      dispatch({ type: GET_ALL_TOOL_SUCCESS, payload: res.data })
    );
  } catch (error) {
    dispatch({
      type: GET_ALL_TOOL_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const createToolAction = (token, tool) => async (dispatch) => {
    dispatch({ type: CREATE_TOOL_REQUEST });
  
    try {
      let formData = new FormData();
      formData.append("toolName", tool.toolName);
      formData.append("toolCode", tool.toolCode);
      formData.append("size", tool.size);
      formData.append("type", tool.type);
      formData.append("category", tool.category);
      formData.append("description", tool.description);
      // กรณีผู้ใช้กำหนดรูปภาพมาอยู่แล้ว
      if (typeof tool.avartar === null) {
        formData.append("avartar", "");
      }
      // กรณีผู้เปลี่ยนรูปภาพใหม่
      if (typeof tool.avartar === "object") {
        formData.append("avartar", tool.avartar);
      }
      await Axios.post(`${react_api_url}/create`, formData, {
        headers: AuthToken(token),
      }).then((res) => dispatch({ type: CREATE_TOOL_SUCCESS, payload: res.data }));
    } catch (error) {
      dispatch({
        type: CREATE_TOOL_FAIL,
        payload: catchErrors(error),
      });
    }
  };