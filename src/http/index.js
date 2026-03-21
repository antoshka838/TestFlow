import axios from "axios";

export const $host = axios.create({
  baseURL: "http://localhost:1337/",
});

export const $authHost = axios.create({
  baseURL: "http://localhost:1337/",
})

const authInterceptor = (config) => {
  const token = localStorage.getItem("token");

  if(token){
    config.headers.authorization = `Bearer ${token}`;
  }

  return config; 
}

$authHost.interceptors.request.use(authInterceptor);
