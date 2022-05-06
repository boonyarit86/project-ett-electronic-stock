import { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import Axios from "axios";
import { setUser } from "../Redux/features/userSlice";

let logoutTimer;
const url = process.env.REACT_APP_BACKEND_URL;

export const useAuth = () => {
  const dispatch = useDispatch();
  const [token, setToken] = useState(false);
  const [tokenExpirationDate, setTokenExpirationDate] = useState(false);

  // function นี้ให้ผู้ใช้มีระยะเวลาใช้งานเว็บแค่ 1 ชั่วโมง หลังจากนั้นระบบจะทำการ logout auto
  const login = useCallback(
    async (token, userId, userData, expirationDate) => {
      setToken(token);

      if (!userData && Boolean(userId)) {
        await Axios.get(`${url}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => {
            dispatch(setUser(res.data.data.user));
          })
          .catch((error) => {
            // Show error on Modal and Do it later.
            console.error(error);
            console.error(error.response.data.message);
          });
      }

      if (userData) {
        dispatch(setUser(userData));
      }

      // 60000(มิลลิเซก) * 1 = 1 นาที
      // (1000 * 60) * 60 = 1 ชั่วโมง
      const tokenExpirationDate =
        expirationDate || new Date(new Date().getTime() + 1000 * 60 * 6000);
      setTokenExpirationDate(tokenExpirationDate);
      localStorage.setItem(
        "userData",
        JSON.stringify({
          token: token,
          userId: userId,
          expiration: tokenExpirationDate.toISOString(),
        })
      );
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    setToken(null);
    setTokenExpirationDate(null);
    localStorage.removeItem("userData");
  }, []);

  // ทำงานเมื่อระยะเวลาใช้งานเว็บครบ 1 ชั่วโมง
  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime =
        tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  // ตรวจสอบว่า token ของการ login 1 ชั่วโมง ครบเวลายัง หากยังไม่ครบเวลา ผู้ใช้ไม่ต้อง login ใหม่ ตอนที่หากผู้ใช้ปิดเว็บแล้วเปิดเว็บขึ้นมาใหม่
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.token &&
      storedData.userId &&
      new Date(storedData.expiration) > new Date()
    ) {
      login(
        storedData.token,
        storedData.userId,
        null,
        new Date(storedData.expiration)
      );
    }
  }, [login]);

  return { login, logout, token };
};