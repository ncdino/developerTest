import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_BASE_URL || "https://front-mission.bigs.or.kr",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
