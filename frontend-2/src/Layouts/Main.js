import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const Main = () => {
  const user = useSelector((state) => state.user.user);

  return (
    <main className="App">
      <h1>Hi There! {user?.name ? user.name : "Loading..."}</h1>
      <Outlet />
    </main>
  );
};

export default Main;
