import {ToastContainer} from "react-toastify";

function useReactToastify(){
  //Todo => useReactToastify
  return(
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  );
}

export default useReactToastify;
