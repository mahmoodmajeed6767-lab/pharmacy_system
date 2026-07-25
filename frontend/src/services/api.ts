// import axios from "axios";

// const api = axios.create({
//   baseURL: "https://pharmacysystem-production-a423.up.railway.app/api/v1",
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;
import axios from "axios";

alert("THIS IS THE NEW API.TS");

const api = axios.create({
  baseURL: "https://pharmacysystem-production-a423.up.railway.app/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;