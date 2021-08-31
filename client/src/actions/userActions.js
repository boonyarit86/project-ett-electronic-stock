import { GET_USER_FAIL, GET_USER_REQUEST, GET_USER_SUCCESS } from "../constants/userConstants";
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
        payload: catchErrors(error)
    });
  }
};
