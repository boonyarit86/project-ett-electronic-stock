import { toast } from "react-toastify";

export const notifySuccess = (text) => {
  toast.success(text, {
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 3000,
    className: "notify-default",
  });
};

export const notifyError = (text) => {
    toast.error(text, {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000,
      className: "notify-default",
    });
  };
