import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "./shared/context/auth-context";
import { getUserByIdAction } from "./actions/userActions";

// Components
import Loading from "./shared/components/UIElements/Loading";
import { Card, CardContent } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";

// CSS
import "./Home.css";

function Home() {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const { user, isLoading, errorMsg } = useSelector((state) => state.userData);

  useEffect(() => {
    dispatch(getUserByIdAction(auth.token));
  }, []);

  if (isLoading) {
    return <Loading loading={isLoading} />;
  }

  if (!isLoading && errorMsg) {
    return (
      <div style={{ margin: "10px" }}>
        <Alert variant="filled" severity="error">
          <AlertTitle>{errorMsg}</AlertTitle>
        </Alert>
      </div>
    );
  }

  return (
    <div className="HomePage__container">
      <div className="HomePage__intro">
        <div className="HomePage__intro__contents">
          <h1>
            Electronic-Stock <span>เว็บแอปพลิเคชัน</span>
            จัดการข้อมูลรายการอุปกรณ์อิเล็กทรอนิกส์
          </h1>
          <p>
            จัดเก็บข้อมูล, คำนวณการใช้งานอุปกรณ์อิเล็กทรอนิกส์ได้อย่างแม่นยำ.
          </p>
        </div>
        <div className="HomePage__intro__icon">
          <img src="./images/icon-elec1.jpg" alt="" />
        </div>
      </div>

      <div className="HomePage__news">
        <h1>ข่าวสารรายละเอียดการอัปเดตต่าง ๆ</h1>
        <Card>
          <CardContent>ไม่มีข้อมูล</CardContent>
        </Card>
      </div>
    </div>
  );

  // return (
  //   <div>
  //     <h1>
  //       ยินดีต้อนรับ {user.name} ({user.status})
  //     </h1>
  //     <div>
  //       <h2>เกี่ยวกับบริษัท</h2>
  //       <div className="home-img">
  //         <img src="/images/ett-pic.jpg" alt="" />
  //       </div>
  //       <div>
  //         <p>
  //           อีทีที ผู้นำด้านวงการไมโครอิเล็กทรอนิกส์
  //           รับวิจัยและผลิตสินค้าในงานด้านไมโครอิเล็กทรอนิกส์
  //           และระบบควบคุมอัตโนมัติ
  //           มีผลงานวิจัยและผลิตสินค้าให้กับบริษัทชั้นนำมากมาย
  //           รับประกันในคุณภาพผลงาน สามารถทำงานได้รวมทั้งความซื่อตรงในวิชาชีพ
  //           รับประกันความลับและลิขสิทธิ์ ของตัวสินค้า ให้กับ ท่าน
  //           เป็นที่ยอมรับของวงการนานนับ 10 ปี
  //           เพียงท่านกำหนดรูปแบบการทำงานของเครื่องที่ต้องการ หรือ
  //           มีบอร์ดตัวอย่างจากต่างประเทศ สั่งทำ ได้ตั้งแต่ 5-10 ชิ้น หรือหลาย
  //           พันชิ้น
  //           เพื่อนำไปใช้งานทั่วไปหรือใช้ทดแทนสินค้าต่างประเทศที่มีราคาแพง
  //           ท่านสามารถลดค่าใช้จ่ายในการวิจัยพัฒนาสินค้า
  //           ลดการนำเข้าบอร์ดจากต่างประเทศ สนใจสามารถติดต่อรับบริการได้ที่ บริษัท
  //           อีทีที
  //         </p>
  //       </div>
  //     </div>
  //   </div>
  // );
}

export default Home;
