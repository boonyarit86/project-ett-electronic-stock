import { GET_ALL_TYPE_FAIL, GET_ALL_TYPE_REQUEST, GET_ALL_TYPE_SUCCESS } from "../constants/sttConstants";
import catchErrors from "../shared/utils/catchErrors";
import Axios from "axios";

const react_api_url = "http://localhost:5000/api/stts";
const AuthToken = (token) => {
    return { Authorization: `Bearer ${token}` }
}

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
