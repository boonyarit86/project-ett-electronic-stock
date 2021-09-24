import {
  CREATE_BOARD_FAIL,
  CREATE_BOARD_REQUEST,
  CREATE_BOARD_SUCCESS,
  GET_ALL_BOARD_FAIL,
  GET_ALL_BOARD_REQUEST,
  GET_ALL_BOARD_SUCCESS,
} from "../constants/boardConstants";
import catchErrors from "../shared/utils/catchErrors";
import Axios from "axios";

// Components
import {
  notifySuccess,
  notifyError,
} from "../shared/components/UIElements/Toasts";

// const react_api_url = "http://localhost:5000/api/tools";
const AuthToken = (token) => {
  return { Authorization: `Bearer ${token}` };
};

export const getAllBoardAction =
  (token, setBoards, setDefaultValue) => async (dispatch) => {
    dispatch({ type: GET_ALL_BOARD_REQUEST });
    try {
      await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/boards`, {
        headers: AuthToken(token),
      }).then((res) => {
        setBoards(res.data);
        setDefaultValue && setDefaultValue(res.data);
        dispatch({ type: GET_ALL_BOARD_SUCCESS });
      });
    } catch (error) {
      dispatch({
        type: GET_ALL_BOARD_FAIL,
        payload: catchErrors(error),
      });
    }
  };

export const createBoardAction =
  (token, board, history) => async (dispatch) => {
    dispatch({ type: CREATE_BOARD_REQUEST });

    try {
      let formData = new FormData();
      formData.append("boardName", board.boardName);
      formData.append("boardCode", board.boardCode);
      formData.append("type", board.type);
      formData.append("tools", JSON.stringify(board.tools));
      formData.append("description", board.description);
      // กรณีผู้ใช้กำหนดรูปภาพมาอยู่แล้ว
      if (typeof board.avartar === null) {
        formData.append("avartar", "");
      }
      // กรณีผู้เปลี่ยนรูปภาพใหม่
      if (typeof board.avartar === "object") {
        formData.append("avartar", board.avartar);
      }
      await Axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/boards/create`,
        formData,
        {
          headers: AuthToken(token),
        }
      ).then((res) => {
        dispatch({ type: CREATE_BOARD_SUCCESS, payload: res.data });
        history.push("/board/list");
        // history.push("/");
      });
    } catch (error) {
      dispatch({
        type: CREATE_BOARD_FAIL,
        payload: catchErrors(error),
      });
    }
  };
