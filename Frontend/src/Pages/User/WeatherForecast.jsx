export default function WeatherForecast() {
  return (
    <div className="p-6 card">
      <h1 className="title">Weather Forecast</h1>

      <p>🌡 Temperature: 32°C</p>
      <p>☁ Cloud Cover: 40%</p>
      <p>🌤 Sunlight Hours: 6.5 hrs</p>

      <p className="mt-3 text-yellow-600">
        ⚠ Expected generation drop: 15%
      </p>
    </div>
  );
}
