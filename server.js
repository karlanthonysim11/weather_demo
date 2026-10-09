// Our server: the only place that knows the API key
require("dotenv").config({ quiet: true });
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.WEATHER_API_KEY;

app.use(express.static("public"));

app.get("/api/weather", async (req, res) => {
  const city = req.query.city || "Manila";
  const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log(response.status, city); // debugging habit: always look at the status code first

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Request failed" });
    }

    res.json({
      city: data.location.name,
      country: data.location.country,
      tempC: data.current.temp_c,
      condition: data.current.condition.text,
      icon: "https:" + data.current.condition.icon,
    });
  } catch (err) {
    // Their server or our internet is down: fail gracefully, don't crash
    console.error(err.message);
    res.status(503).json({ error: "Weather unavailable, try again later" });
  }
});

app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));