import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const $host = axios.create({
  baseURL: API_URL,
});

export const $authHost = axios.create({
  baseURL: API_URL,
})

const authInterceptor = (config) => {
  const token = localStorage.getItem("token");

  if(token){
    config.headers.authorization = `Bearer ${token}`;
  }

  return config; 
}

$authHost.interceptors.request.use(authInterceptor);
