import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://8080-firebase-campusepulse-1751938588410.cluster-44kx2eiocbhe2tyk3zoyo3ryuo.cloudworkstations.dev/api",
  timeout: 10000,
});

export default axiosInstance;