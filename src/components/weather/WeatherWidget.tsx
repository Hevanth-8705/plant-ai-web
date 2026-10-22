import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Sun, 
  CloudRain, 
  Cloud, 
  CloudLightning, 
  CloudFog, 
  Droplets, 
  Thermometer, 
  Wind, 
  MapPin, 
  RefreshCw, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  ChevronDown,
  Search,
  ChevronUp,
  Sprout,
  ShieldAlert,
  Info
} from 'lucide-react';
import { WeatherData, Plant } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface WeatherWidgetProps {
  plants?: Plant[];
  onSelectPlant?: (plant: Plant) => void;
  className?: string;
}

const PRESET_CITIES = [
  { name: 'Current Location', lat: 37.7749, lon: -122.4194, isGps: true },
  { name: 'San Francisco, CA', lat: 37.7749, lon: -122.4194 },
  { name: 'New York, NY', lat: 40.7128, lon: -74.006 },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Melbourne, Australia', lat: -37.8136, lon: 144.9631 },
  { name: 'Mumbai, India', lat: 19.076, lon: 72.8777 },
  { name: 'Berlin, Germany', lat: 52.52, lon: 13.405 },
  { name: 'Seattle, WA', lat: 47.6062, lon: -122.3321 },
  { name: 'Austin, TX', lat: 30.2672, lon: -97.7431 },
];

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  plants = [],
  onSelectPlant,
  className = '',
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem('plantpal_weather_city') || 'San Francisco, CA';
  });
  const [unit, setUnit] = useState<'C' | 'F'>(() => {
    return (localStorage.getItem('plantpal_weather_unit') as 'C' | 'F') || 'C';
  });
  const [detectingGps, setDetectingGps] = useState<boolean>(false);
  const [showCityPicker, setShowCityPicker] = useState<boolean>(false);
  const [customCityInput, setCustomCityInput] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'info' | 'error' | 'success' } | null>(null);
  const [showAllDirectives, setShowAllDirectives] = useState<boolean>(false);

  // Clear transient status message
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const fetchWeather = async (lat?: number, lon?: number, city?: string) => {
    try {
      setLoading(true);
      const targetCity = city || selectedCity;
      const res = await api.weather.get({ lat, lon, city: targetCity });
      setWeather(res.weather);
      if (res.weather?.city) {
        setSelectedCity(res.weather.city);
        localStorage.setItem('plantpal_weather_city', res.weather.city);
      }
    } catch (err: any) {
      console.warn('Weather fetch error:', err);
      setStatusMessage({
        text: 'Could not fetch live weather. Showing standard garden microclimate.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleUnitToggle = (newUnit: 'C' | 'F') => {
    setUnit(newUnit);
    localStorage.setItem('plantpal_weather_unit', newUnit);
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setStatusMessage({
        text: 'Geolocation is not supported by your browser.',
        type: 'error',
      });
      return;
    }

    setDetectingGps(true);
    setStatusMessage({
      text: 'Acquiring local GPS coordinates...',
      type: 'info',
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingGps(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        fetchWeather(lat, lon, 'My Local Garden');
        setStatusMessage({
          text: 'Local coordinates locked. Weather updated!',
          type: 'success',
        });
      },
      (err) => {
        setDetectingGps(false);
        console.warn('Geolocation denied or unavailable:', err);
        setStatusMessage({
          text: 'Location permission was dismissed. Pick a city from the list or search.',
          type: 'error',
        });
      },
      { timeout: 8000 }
    );
  };

  const handleCitySelect = (cityObj: typeof PRESET_CITIES[0]) => {
    setShowCityPicker(false);
    if (cityObj.isGps) {
      handleUseGps();
    } else {
      fetchWeather(cityObj.lat, cityObj.lon, cityObj.name);
    }
  };

  const handleCustomCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCityInput.trim()) return;
    const query = customCityInput.trim();
    setShowCityPicker(false);
    setCustomCityInput('');
    fetchWeather(undefined, undefined, query);
  };

  // Unit conversion helpers
  const formatTemp = (celsius?: number) => {
    if (celsius === undefined || celsius === null) return '--';
    if (unit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  const getWeatherIcon = (code: number, isDay = true) => {
    if (code === 0) {
      return <Sun className="w-8 h-8 text-amber-500 animate-[spin_20s_linear_infinite]" />;
    }
    if ([1, 2].includes(code)) {
      return <CloudSun className="w-8 h-8 text-amber-500" />;
    }
    if (code === 3) {
      return <Cloud className="w-8 h-8 text-stone-400" />;
    }
    if ([45, 48].includes(code)) {
      return <CloudFog className="w-8 h-8 text-slate-400" />;
    }
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
      return <CloudRain className="w-8 h-8 text-sky-500" />;
    }
    if ([95, 96, 99].includes(code)) {
      return <CloudLightning className="w-8 h-8 text-indigo-500" />;
    }
    return <CloudSun className="w-8 h-8 text-amber-500" />;
  };

  // Cross-reference user's collection with current conditions
  const getImpactedPlants = () => {
    if (!weather || !plants || plants.length === 0) return { thirsty: [], misting: [], succulents: [] };

    const isHot = weather.temperature >= 26;
    const isDry = weather.humidity < 45;
    const isVeryHumid = weather.humidity > 75;

    const thirsty = isHot
      ? plants.filter((p) => 
          p.location === 'balcony' || 
          p.location === 'patio' || 
          p.location === 'garden_bed' || 
          p.category === 'vegetable' || 
          p.category === 'herb'
        )
      : [];

    const misting = isDry
      ? plants.filter((p) => 
          p.category === 'houseplant' || 
          p.category === 'foliage' || 
          p.category === 'flower'
        )
      : [];

    const succulents = isVeryHumid
      ? plants.filter((p) => p.category === 'succulent' || p.category === 'bonsai')
      : [];

    return { thirsty, misting, succulents };
  };

  const impacted = getImpactedPlants();
  const hasImpactedPlants = impacted.thirsty.length > 0 || impacted.misting.length > 0 || impacted.succulents.length > 0;

  if (loading && !weather) {
    return (
      <div className={`bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs animate-pulse space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-5 bg-stone-200 rounded w-48" />
          <div className="h-5 bg-stone-200 rounded w-28" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-20 bg-stone-100 rounded-2xl" />
          <div className="h-20 bg-stone-100 rounded-2xl" />
        </div>
        <div className="h-16 bg-emerald-950/10 rounded-2xl" />
      </div>
    );
  }

  if (!weather) return null;

  const { plantCareAdjustments } = weather;

  return (
    <div className={`relative bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 rounded-3xl border border-emerald-100 shadow-sm p-5 sm:p-6 space-y-5 overflow-hidden ${className}`}>
      {/* Background soft botanical watermark */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Location, GPS, Temperature Units, and Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 border-b border-stone-200/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shadow-2xs">
            <MapPin className="w-4 h-4" />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowCityPicker(!showCityPicker)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-900 hover:text-emerald-800 transition-colors focus:outline-none"
            >
              <span className="truncate max-w-[200px] sm:max-w-[280px]">{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            </button>

            {/* City Selector Dropdown */}
            {showCityPicker && (
              <div className="absolute left-0 mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-xl border border-stone-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Search any city input */}
                <form onSubmit={handleCustomCitySubmit} className="px-3 pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-1.5 bg-stone-50 rounded-xl px-2.5 py-1.5 border border-stone-200 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600">
                    <Search className="w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search city (e.g. Paris, Seattle)..."
                      value={customCityInput}
                      onChange={(e) => setCustomCityInput(e.target.value)}
                      className="w-full text-xs bg-transparent border-none focus:outline-none text-stone-800 placeholder-stone-400"
                    />
                  </div>
                </form>

                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Preset Gardening Zones
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {PRESET_CITIES.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => handleCitySelect(c)}
                      className="w-full text-left px-3.5 py-2 text-xs text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors flex items-center justify-between"
                    >
                      <span className="truncate">{c.name}</span>
                      {c.isGps && <Compass className="w-3 h-3 text-emerald-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* GPS Auto-Detect */}
          <button
            onClick={handleUseGps}
            disabled={detectingGps}
            className="p-1.5 px-2.5 text-stone-600 hover:text-emerald-800 hover:bg-emerald-50 bg-white/80 border border-stone-200/80 rounded-xl transition-colors text-xs font-medium flex items-center gap-1.5 shadow-2xs"
            title="Auto-detect my location via GPS"
          >
            <Compass className={`w-3.5 h-3.5 text-emerald-700 ${detectingGps ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-[11px] font-semibold">Use GPS</span>
          </button>

          {/* Celsius / Fahrenheit Toggle */}
          <div className="flex rounded-xl border border-stone-200 p-0.5 bg-stone-100 text-[11px] font-bold shadow-2xs">
            <button
              onClick={() => handleUnitToggle('C')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                unit === 'C' ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => handleUnitToggle('F')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                unit === 'F' ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              °F
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchWeather(weather.latitude, weather.longitude, selectedCity)}
            disabled={loading}
            className="p-2 text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 bg-white/80 border border-stone-200/80 rounded-xl transition-colors shadow-2xs"
            title="Refresh local weather"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-700' : ''}`} />
          </button>
        </div>
      </div>

      {/* Inline Feedback Banner (No intrusive window.alert) */}
      {statusMessage && (
        <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
          statusMessage.type === 'error'
            ? 'bg-rose-50 text-rose-800 border border-rose-200'
            : statusMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <Info className="w-4 h-4 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Meteorological Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch relative z-10">
        {/* Left Card: Temperature & General Weather Condition */}
        <div className="md:col-span-5 bg-white/90 rounded-2xl border border-emerald-100/90 p-4 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-amber-600" /> Temperature &amp; Sky
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full capitalize">
              {plantCareAdjustments.temperatureStatus.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4 py-1">
            <div className="p-3 bg-stone-50 rounded-2xl shadow-2xs border border-stone-100 shrink-0">
              {getWeatherIcon(weather.weatherCode, weather.isDay)}
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-sans">
                  {formatTemp(weather.temperature)}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  Feels {formatTemp(weather.apparentTemperature)}
                </span>
              </div>
              <p className="text-xs font-semibold text-emerald-900 capitalize mt-0.5">
                {weather.weatherDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
            <span>High: <strong className="text-stone-800">{formatTemp(weather.tempMax || weather.temperature + 2)}</strong></span>
            <span>Low: <strong className="text-stone-800">{formatTemp(weather.tempMin || weather.temperature - 3)}</strong></span>
            <span>Dew Point: <strong className="text-stone-800">{formatTemp(weather.dewPoint || weather.temperature - 4)}</strong></span>
          </div>
        </div>

        {/* Right Cards: Relative Humidity & Airflow/Precipitation */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Relative Humidity Card (Vital for Plant Care) */}
          <div className="bg-white/90 rounded-2xl border border-emerald-100/90 p-4 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-stone-500 text-[11px]">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-stone-500">
                <Droplets className="w-3.5 h-3.5 text-sky-600" /> Relative Humidity
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                plantCareAdjustments.humidityStatus === 'low'
                  ? 'bg-amber-100 text-amber-800'
                  : plantCareAdjustments.humidityStatus === 'high'
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {plantCareAdjustments.humidityStatus} ({weather.humidity}%)
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-2xl font-black text-stone-900">{weather.humidity}%</span>
                <span className="text-[11px] text-stone-500">
                  {weather.humidity < 40 ? 'Dry air' : weather.humidity > 70 ? 'Damp air' : 'Optimal'}
                </span>
              </div>

              {/* Progress Comfort Bar */}
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    weather.humidity < 40
                      ? 'bg-amber-500'
                      : weather.humidity > 75
                      ? 'bg-sky-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(weather.humidity, 100)}%` }}
                />
              </div>
            </div>

            <p className="text-[10px] text-stone-500 leading-tight">
              {weather.humidity < 40 
                ? 'Crisp air accelerates transpiration. Tropical foliage needs misting.'
                : weather.humidity > 75
                ? 'High ambient dampness slows soil evaporation. Provide air circulation.'
                : 'Balanced transpiration zone for indoor and outdoor botanical growth.'}
            </p>
          </div>

          {/* Wind & Rain Probability */}
          <div className="bg-white/90 rounded-2xl border border-emerald-100/90 p-4 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-stone-500 text-[11px]">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-stone-500">
                <Wind className="w-3.5 h-3.5 text-teal-600" /> Airflow &amp; Rain
              </span>
              <span className="text-[10px] bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded-full">
                {weather.isDay ? 'Daylight' : 'Night'}
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-2xl font-black text-stone-900">{weather.windSpeed} <span className="text-xs font-normal text-stone-500">km/h</span></span>
                <span className="text-xs font-bold text-sky-700">
                  {weather.precipitationProbability ?? 0}% rain
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                {weather.precipitationProbability && weather.precipitationProbability > 40
                  ? 'Rain expected: Outdoor pots get watered naturally'
                  : 'No significant rain: Manual hydration required'}
              </p>
            </div>

            <p className="text-[10px] text-stone-500 leading-tight">
              {weather.windSpeed > 20
                ? 'Brisk winds accelerate pot drying; shield delicate balcony stems.'
                : 'Calm gentle airflow encourages steady gas exchange.'}
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Botanical Care Adjustments Panel */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-4 sm:p-5 shadow-sm space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-emerald-800 text-emerald-200">
              <Sparkles className="w-4 h-4 text-emerald-300" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide font-serif">
              Weather-Adjusted Plant Care Recommendations
            </h4>
          </div>

          <span className="text-[10px] bg-emerald-800/80 text-emerald-200 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-700/50">
            {formatTemp(weather.temperature)} • {weather.humidity}% RH
          </span>
        </div>

        {/* 2-Column Core Directives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-emerald-100/90 leading-relaxed pt-1">
          {/* Watering Need */}
          <div className="bg-emerald-900/60 rounded-xl p-3 border border-emerald-800/60 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px] uppercase tracking-wider">
              <Droplets className="w-3.5 h-3.5" /> Watering Schedule Adjustment
            </div>
            <p className="text-stone-100 text-xs">
              {plantCareAdjustments.wateringAdvice}
            </p>
          </div>

          {/* Humidity Need */}
          <div className="bg-emerald-900/60 rounded-xl p-3 border border-emerald-800/60 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px] uppercase tracking-wider">
              <Wind className="w-3.5 h-3.5" /> Humidity &amp; Foliage Care
            </div>
            <p className="text-stone-100 text-xs">
              {plantCareAdjustments.humidityAdvice}
            </p>
          </div>
        </div>

        {/* General Climate Tip */}
        <div className="flex items-start gap-2 pt-1 text-xs text-emerald-200/90">
          <span className="text-sm">🌱</span>
          <p className="italic">{plantCareAdjustments.generalTip}</p>
        </div>

        {/* Actionable Directives List (Expandable) */}
        {plantCareAdjustments.actionableDirectives && plantCareAdjustments.actionableDirectives.length > 0 && (
          <div className="pt-2 border-t border-emerald-800/80 space-y-2">
            <button
              onClick={() => setShowAllDirectives(!showAllDirectives)}
              className="text-[11px] text-emerald-300 hover:text-white font-semibold flex items-center gap-1.5 transition-colors focus:outline-none"
            >
              <span>Today's Weather Action Checklist ({plantCareAdjustments.actionableDirectives.length} tips)</span>
              {showAllDirectives ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAllDirectives && (
              <ul className="space-y-1.5 pl-1 animate-in fade-in duration-150">
                {plantCareAdjustments.actionableDirectives.map((dir, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-emerald-100/90">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{dir}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Collection Impact: Cross-referenced with the user's specific plants */}
      {hasImpactedPlants && (
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              <span>Collection Impact Today</span>
            </div>
            <span className="text-[10px] text-stone-500">
              Plants sensitive to current {formatTemp(weather.temperature)} / {weather.humidity}% RH
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-0.5">
            {impacted.misting.map((plant) => (
              <button
                key={`imp-m-${plant.id}`}
                onClick={() => onSelectPlant?.(plant)}
                className="inline-flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-stone-800 transition-colors text-xs text-left"
              >
                <img src={plant.photoUrl} alt={plant.name} className="w-6 h-6 rounded-lg object-cover" />
                <div>
                  <span className="font-bold block leading-none">{plant.name}</span>
                  <span className="text-[10px] text-amber-800">Needs misting (Low RH)</span>
                </div>
              </button>
            ))}

            {impacted.thirsty.map((plant) => (
              <button
                key={`imp-t-${plant.id}`}
                onClick={() => onSelectPlant?.(plant)}
                className="inline-flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-stone-800 transition-colors text-xs text-left"
              >
                <img src={plant.photoUrl} alt={plant.name} className="w-6 h-6 rounded-lg object-cover" />
                <div>
                  <span className="font-bold block leading-none">{plant.name}</span>
                  <span className="text-[10px] text-sky-800">Check soil (Warm climate)</span>
                </div>
              </button>
            ))}

            {impacted.succulents.map((plant) => (
              <button
                key={`imp-s-${plant.id}`}
                onClick={() => onSelectPlant?.(plant)}
                className="inline-flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-stone-800 transition-colors text-xs text-left"
              >
                <img src={plant.photoUrl} alt={plant.name} className="w-6 h-6 rounded-lg object-cover" />
                <div>
                  <span className="font-bold block leading-none">{plant.name}</span>
                  <span className="text-[10px] text-purple-800">Dry roots (High RH)</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
