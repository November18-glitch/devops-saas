import axios from "axios";
const BASE = "http://127.0.0.1:8000";

const instance = axios.create({
  baseURL: BASE,
});

function setAuth(token) {
  if (token) instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete instance.defaults.headers.common["Authorization"];
}

async function register({ full_name, email, password }) {
  const res = await instance.post("/auth/register", { full_name, email, password });
  return res.data;
}
async function login({ email, password }) {
  const res = await instance.post("/auth/login", { email, password });
  return res.data;
}
async function getMe(token){
  setAuth(token);
  const res = await instance.get("/auth/me").catch(()=>null);
  return res?.data ?? null;
}

/* projects */
async function getProjects(token){
  setAuth(token);
  const res = await instance.get("/projects/");
  return res.data;
}
async function createProject(data, token){
  setAuth(token);
  const res = await instance.post("/projects/", data);
  return res.data;
}
async function updateProject(id, data, token){
  setAuth(token);
  const res = await instance.put(`/projects/${id}`, data);
  return res.data;
}
async function deleteProject(id, token){
  setAuth(token);
  const res = await instance.delete(`/projects/${id}`);
  return res.data;
}

/* github connect (frontend gets token from redirect and posts it) */
async function connectGithub(token, github_token){
  setAuth(token);
  const res = await instance.post("/auth/github/connect", { token: github_token });
  return res.data;
}

export default {
  setAuth,
  register,
  login,
  getMe,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  connectGithub
};
