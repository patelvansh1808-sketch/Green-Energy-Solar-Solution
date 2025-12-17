import api from "./api";

const API_KEY = "2f8dd0d890539b556b0fd80b95e65050";

export const getWeatherData = async (city) => {
  const res = await api.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
  );
  return res.data;
};
