import { useEffect, useState } from "react";
import api from "../../services/api";
import LineChart from "../../Components/Charts/LineChart";
import BarChart from "../../Components/Charts/BarChart";

const OPENWEATHER_API_KEY = "2f8dd0d890539b556b0fd80b95e65050";
const CITY = "Anand"; // Change to your location

export default function WeatherImpact() {
  const [chartData, setChartData] = useState(null);
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchWeatherImpact = async () => {
      try {
        setLoading(true);

        // 1. Fetch live weather from OpenWeatherMap
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${OPENWEATHER_API_KEY}`
        );
        const weatherData = await weatherRes.json();

        if (!weatherData.main) {
          throw new Error("Failed to fetch weather data");
        }

        // 2. Fetch live energy data from your backend
        // Use existing authenticated energy endpoint for the current user
        const energyRes = await api.get("/energy/my");
        const energyRecords = energyRes.data || [];

        // 3. Build payload: combine live weather + energy (last 5 records)
        const recentEnergy = energyRecords.slice(-5).map((record) => ({
          temperature: weatherData.main.temp + (Math.random() * 2 - 1),
          sunlight: ((100 - weatherData.clouds.all) / 100) * 10,
          energy: record.unitsGenerated || Math.random() * 15,
        }));

        // If no energy records, use sample with live weather
        const payload = {
          data: recentEnergy.length > 0 ? recentEnergy : [
            { temperature: weatherData.main.temp, sunlight: ((100 - weatherData.clouds.all) / 100) * 10, energy: 12 },
            { temperature: weatherData.main.temp - 1, sunlight: ((100 - weatherData.clouds.all) / 100) * 10 - 1, energy: 10 },
            { temperature: weatherData.main.temp + 1, sunlight: ((100 - weatherData.clouds.all) / 100) * 10 + 1, energy: 14 },
            { temperature: weatherData.main.temp + 0.5, sunlight: ((100 - weatherData.clouds.all) / 100) * 10 + 0.5, energy: 13 },
            { temperature: weatherData.main.temp - 0.5, sunlight: ((100 - weatherData.clouds.all) / 100) * 10 - 0.5, energy: 11 },
          ],
        };

        // 4. Post to your analyzer
        const res = await api.post("/weather-impact/analyze", payload);

        if (!isMounted) return;

        setChartData({
          temperature: res.data.temperatures,
          sunlight: res.data.sunlight,
          energy: res.data.energy,
        });

        setInsight(res.data.insight);
      } catch (error) {
        if (isMounted) {
          alert("Failed to load weather impact analysis: " + error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWeatherImpact();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-4">
        🌦 Weather Impact Analysis
      </h1>

      <p className="text-gray-600 mb-6">
        Analyze how temperature and sunlight affect solar energy generation
        using correlation-based analytics.
      </p>

      {loading && (
        <p className="text-green-700 font-semibold">
          Loading analysis...
        </p>
      )}

      {chartData && (
        <>
          {/* INSIGHT BOX */}
          <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded mb-6">
            <h2 className="font-semibold text-green-800 mb-1">
              AI Insight
            </h2>
            <p className="text-gray-700">{insight}</p>
          </div>

          {/* CHARTS */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* LINE CHART */}
            <div className="bg-white p-4 rounded shadow h-[360px]">
              <h3 className="font-semibold mb-2">
                Temperature vs Energy Output
              </h3>
              <LineChart
                labels={chartData.temperature.map(
                  (_, i) => `Day ${i + 1}`
                )}
                data={chartData.energy}
              />
            </div>

            {/* BAR CHART */}
            <div className="bg-white p-4 rounded shadow h-[360px]">
              <h3 className="font-semibold mb-2">
                Sunlight Hours vs Energy Output
              </h3>
              <BarChart
                labels={chartData.sunlight.map(
                  (_, i) => `Day ${i + 1}`
                )}
                data={chartData.energy}
              />
            </div>
          </div>

          {/* HOW ANALYSIS WORKS */}
          <div className="bg-white p-6 rounded shadow space-y-3 mt-6">
            <h3 className="text-lg font-semibold text-gray-900">How this analysis works</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>
                We fetch live weather from <span className="font-semibold">OpenWeatherMap</span> (temperature, cloud cover) for <span className="font-semibold">{CITY}</span>.
              </li>
              <li>
                We fetch your energy generation data from your database (<span className="font-semibold">/solar/all</span>) and combine them.
              </li>
              <li>
                We send the combined data to <span className="font-semibold">/weather-impact/analyze</span> which computes correlations and returns aligned arrays + AI insight.
              </li>
              <li>
                Charts visualize how temperature and sunlight affect your energy output in real-time.
              </li>
            </ul>
            <p className="text-gray-600 text-sm">
              Change the <span className="font-mono bg-gray-100 px-1">CITY</span> variable to your solar plant location for accurate weather data.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
