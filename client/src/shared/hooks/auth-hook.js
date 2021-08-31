import { useState, useCallback, useEffect } from 'react';

let logoutTimer;

export const useAuth = () => {
    const [token, setToken] = useState(false);
    const [tokenExpirationDate, setTokenExpirationDate] = useState(false);

    // function กำหนดตัวแปรเกียวกับโปรไฟล์แบบ global และ กำหนด token json ให้ผู้ใช้มีระยะเวลาใช้งานเว็บแค่ 1 ชั่วโมง หลังจากนั้นระบบจะทำการ logout auto
    const login = useCallback((token, expirationDate) => {
        setToken(token);

        // 60000(มิลลิเซก) * 1 = 1 นาที 
        // (1000 * 60) * 60 = 1 ชั่วโมง
        const tokenExpirationDate =
            expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
        setTokenExpirationDate(tokenExpirationDate);
        localStorage.setItem(
            'userData',
            JSON.stringify({
                token: token,
                expiration: tokenExpirationDate.toISOString()
            })
        );
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setTokenExpirationDate(null);
        localStorage.removeItem('userData');
    }, []);

    // ทำงานเมื่อระยะเวลาใช้งานเว็บครบ 1 ชั่วโมง
    useEffect(() => {
        if (token && tokenExpirationDate) {
            const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
            logoutTimer = setTimeout(logout, remainingTime);
        } else {
            clearTimeout(logoutTimer);
        }
    }, [token, logout, tokenExpirationDate]);

    // ตรวจสอบว่า token ของการ login 1 ชั่วโมง ครบเวลายัง หากยังไม่ครบเวลา ผู้ใช้ไม่ต้อง login ใหม่ ตอนที่หากผู้ใช้ปิดเว็บแล้วเปิดเว็บขึ้นมาใหม่
    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('userData'));
        if (
            storedData &&
            storedData.token &&
            new Date(storedData.expiration) > new Date()
        ) {
            login(storedData.token, new Date(storedData.expiration));
        }
    }, [login]);

    return { token, login, logout,  };
};