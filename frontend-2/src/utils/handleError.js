const catchError = (error, setMessage) => {
  console.error(error.response.data.message);
  setMessage(error.response.data.message);
  setTimeout(() => {
    setMessage(null);
  }, 10000);
};

const catchRequestError = (error, setMessage) => {
  console.error(error.response.data.message);
  setMessage(error.response.data.message);
};

export { catchError, catchRequestError };