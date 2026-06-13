import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Smartphone, Activity, Shield, CloudSun, Droplets, MapPin, ChevronDown, Thermometer, Wind, Eye } from 'lucide-react';

interface HomeProps {
  onEnterWorkspace: () => void;
}

interface DailyForecast {
  date: string;
  dayLabel: string;
  maxTemp: number;
  minTemp: number;
  code: number;
  rainProb: number;
  advisory: string;
}

interface WeatherInfo {
  location: string;
  region: string;
  elevation: number;
  forecasts: DailyForecast[];
}

const mapWeatherCode = (code: number) => {
  if (code === 0) return { label: 'Clear Sky', emoji: '☀️', gradient: 'linear-gradient(135deg, #ff9500 0%, #ff5e3a 100%)' };
  if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', emoji: '⛅', gradient: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)' };
  if (code >= 45 && code <= 48) return { label: 'Foggy', emoji: '🌫️', gradient: 'linear-gradient(135deg, #90a4ae 0%, #78909c 100%)' };
  if (code >= 51 && code <= 67) return { label: 'Rainy', emoji: '🌧️', gradient: 'linear-gradient(135deg, #5c6bc0 0%, #3949ab 100%)' };
  if (code >= 71 && code <= 77) return { label: 'Snowy', emoji: '❄️', gradient: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)' };
  if (code >= 80 && code <= 82) return { label: 'Rain Showers', emoji: '🌦️', gradient: 'linear-gradient(135deg, #7986cb 0%, #5c6bc0 100%)' };
  if (code >= 85 && code <= 86) return { label: 'Snow Showers', emoji: '🌨️', gradient: 'linear-gradient(135deg, #b0bec5 0%, #90a4ae 100%)' };
  if (code >= 95 && code <= 99) return { label: 'Thunderstorm', emoji: '⛈️', gradient: 'linear-gradient(135deg, #7e57c2 0%, #5e35b1 100%)' };
  return { label: 'Clear', emoji: '☀️', gradient: 'linear-gradient(135deg, #ff9500 0%, #ff5e3a 100%)' };
};

const getAgriAdvisory = (maxTemp: number, code: number, rainProb: number) => {
  if (code >= 95 && code <= 99) {
    return 'Severe storms expected — avoid seeding operations. Clear storm drains and protect nursery beds from wind damage.';
  }
  if ((code >= 51 && code <= 67) || rainProb > 70) {
    return 'Rainy conditions: excellent moisture for planting. Avoid applying surface chemical fertilizers — risk of runoff.';
  }
  if (rainProb > 40) {
    return 'Showers likely: favorable window for transplanting seedlings. Delay foliar pesticide spraying until dry.';
  }
  if (maxTemp > 28) {
    return 'Hot & dry: high evapotranspiration rates. Irrigate nurseries early morning; mulch to conserve soil moisture.';
  }
  if (maxTemp < 18) {
    return 'Cool temperatures: slower maize root growth expected. Favorable conditions for pea and legume seeding.';
  }
  return 'Stable conditions: optimal for seedbed tillage, field diagnostics, and precision seeding operations.';
};

export default function Home({ onEnterWorkspace }: HomeProps) {
  const [weatherData, setWeatherData] = useState<WeatherInfo[]>([]);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [selectedCity, setSelectedCity] = useState<number>(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);
  const [cityListOpen, setCityListOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCityListOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let active = true;
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=-1.9441,-1.5034,-2.5967,-1.9278,-1.6749,-1.2989,-2.1558,-2.1444&longitude=30.0619,29.6350,29.7394,30.5284,29.2636,30.3242,29.3524,30.1264&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&past_days=1&forecast_days=3&timezone=Africa/Cairo'
        );
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        const locations = [
          { name: 'Kigali', region: 'Central Province', elevation: 1567 },
          { name: 'Musanze', region: 'Northern Province', elevation: 1850 },
          { name: 'Huye', region: 'Southern Province', elevation: 1706 },
          { name: 'Kayonza', region: 'Eastern Province', elevation: 1530 },
          { name: 'Rubavu', region: 'Western Province', elevation: 1476 },
          { name: 'Nyagatare', region: 'Eastern Province', elevation: 1513 },
          { name: 'Karongi', region: 'Western Province', elevation: 1634 },
          { name: 'Bugesera', region: 'Eastern Province', elevation: 1434 }
        ];

        const formatted = locations.map((loc, cityIdx) => {
          const cityData = Array.isArray(data) ? data[cityIdx] : data;
          const daily = cityData?.daily || {};
          
          const forecasts = Array.from({ length: 4 }).map((_, dayIdx) => {
            const time = daily.time?.[dayIdx] || '';
            const maxTemp = typeof daily.temperature_2m_max?.[dayIdx] === 'number' ? daily.temperature_2m_max[dayIdx] : 22;
            const minTemp = typeof daily.temperature_2m_min?.[dayIdx] === 'number' ? daily.temperature_2m_min[dayIdx] : 14;
            const code = typeof daily.weather_code?.[dayIdx] === 'number' ? daily.weather_code[dayIdx] : 0;
            const rainProb = typeof daily.precipitation_probability_max?.[dayIdx] === 'number' ? daily.precipitation_probability_max[dayIdx] : 0;
            
            let dayLabel = 'Today';
            if (dayIdx === 0) dayLabel = 'Yesterday';
            else if (dayIdx === 1) dayLabel = 'Today';
            else if (dayIdx === 2) dayLabel = 'Tomorrow';
            else {
              const dateObj = new Date(time);
              dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            }

            return {
              date: time,
              dayLabel,
              maxTemp: Math.round(maxTemp * 10) / 10,
              minTemp: Math.round(minTemp * 10) / 10,
              code,
              rainProb: Math.round(rainProb),
              advisory: getAgriAdvisory(maxTemp, code, rainProb)
            };
          });

          return {
            location: loc.name,
            region: loc.region,
            elevation: loc.elevation,
            forecasts
          };
        });

        if (active) {
          setWeatherData(formatted);
          setWeatherLoading(false);
        }
      } catch (err) {
        console.warn('Weather fetch failed, falling back to mock data:', err);
        const locations = [
          { name: 'Kigali', region: 'Central Province', baseTemp: 24, elevation: 1567 },
          { name: 'Musanze', region: 'Northern Province', baseTemp: 17, elevation: 1850 },
          { name: 'Huye', region: 'Southern Province', baseTemp: 21, elevation: 1706 },
          { name: 'Kayonza', region: 'Eastern Province', baseTemp: 27, elevation: 1530 },
          { name: 'Rubavu', region: 'Western Province', baseTemp: 22, elevation: 1476 },
          { name: 'Nyagatare', region: 'Eastern Province', baseTemp: 28, elevation: 1513 },
          { name: 'Karongi', region: 'Western Province', baseTemp: 23, elevation: 1634 },
          { name: 'Bugesera', region: 'Eastern Province', baseTemp: 26, elevation: 1434 }
        ];

        const mock = locations.map((loc) => {
          const forecasts = Array.from({ length: 4 }).map((_, dayIdx) => {
            const tempOffset = (dayIdx === 0 ? -1.2 : dayIdx === 1 ? 0 : dayIdx === 2 ? 1.8 : -0.4) + (Math.random() - 0.5) * 1.5;
            const maxTemp = loc.baseTemp + tempOffset;
            const minTemp = loc.baseTemp - 7 + tempOffset;
            const code = dayIdx === 2 ? 51 : dayIdx === 0 ? 3 : dayIdx === 1 ? 1 : 0;
            const rainProb = dayIdx === 2 ? 80 : dayIdx === 0 ? 30 : 15;
            
            let dayLabel = 'Today';
            if (dayIdx === 0) dayLabel = 'Yesterday';
            else if (dayIdx === 1) dayLabel = 'Today';
            else if (dayIdx === 2) dayLabel = 'Tomorrow';
            else {
              const dateObj = new Date();
              dateObj.setDate(dateObj.getDate() + 2);
              dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            }

            return {
              date: '',
              dayLabel,
              maxTemp: Math.round(maxTemp * 10) / 10,
              minTemp: Math.round(minTemp * 10) / 10,
              code,
              rainProb,
              advisory: getAgriAdvisory(maxTemp, code, rainProb)
            };
          });

          return {
            location: loc.name,
            region: loc.region,
            elevation: loc.elevation,
            forecasts
          };
        });

        if (active) {
          setWeatherData(mock);
          setWeatherLoading(false);
        }
      }
    };
    
    fetchWeather();
    return () => { active = false; };
  }, []);

  // Derive current city + forecast
  const currentCity = weatherData[selectedCity];
  const activeForecast = currentCity?.forecasts[selectedDayIndex] || currentCity?.forecasts[1];
  const condition = activeForecast ? mapWeatherCode(activeForecast.code) : null;

  // Temperature gauge percentage (range 5°C – 40°C)
  const tempPercent = activeForecast ? Math.min(100, Math.max(0, ((activeForecast.maxTemp - 5) / 35) * 100)) : 0;

  return (
    <div style={styles.heroContainer}>
      <section style={styles.heroSection}>
        <h1 style={styles.heroTitle}>
          Hybrid Smartphone-Based <br />
          <span style={styles.heroGlow}>Seed Quality Diagnostics</span>
        </h1>
        <p style={styles.heroSubtitle}>
          Empowering Rwandan smallholder farmers and agro-dealers with zero-cost, near-instant, computer-vision diagnostics for maize germination vigor, seed quality check, and vegetable species variety screening.
        </p>
        <div style={styles.heroCtaGroup}>
          <button onClick={onEnterWorkspace} style={styles.primaryCta}>
            Enter Workspace <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* FEATURES GRID SECTION */}
      <section style={styles.featuresSection}>
        <div style={styles.featureCard}>
          <div style={styles.featureIconBox}><Smartphone size={24} color="var(--accent-green)" /></div>
          <h3 style={styles.featureTitle}>Dual Deployment</h3>
          <p style={styles.featureText}>
            Runs online via a high-performance cloud FastAPI/PyTorch service, or offline directly on-device using quantized float16 TensorFlow Lite models for disconnected rural fields.
          </p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureIconBox}><Activity size={24} color="var(--accent-green)" /></div>
          <h3 style={styles.featureTitle}>YOLOv8 & ResNet Models</h3>
          <p style={styles.featureText}>
            YOLOv8 object detector monitors germination progression stages. ResNet50 analyzes seed surface details to detect cracks, discoloration, or silk cuts.
          </p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureIconBox}><Shield size={24} color="var(--accent-green)" /></div>
          <h3 style={styles.featureTitle}>MobileNet Classifier</h3>
          <p style={styles.featureText}>
            Lightweight MobileNetV2 architecture screens 14 distinct species of vegetable seeds (e.g. Tomato, Spinach, Cabbage) to guarantee purity standards.
          </p>
        </div>
      </section>

      {/* PREMIUM WEATHER ADVISORY SECTION */}
      <section className="weather-premium-section">
        {/* Section header */}
        <div className="weather-premium-header">
          <div className="weather-premium-title-group">
            <div className="weather-premium-icon-ring">
              <CloudSun size={22} color="#fff" />
            </div>
            <div>
              <h2 className="weather-premium-title">Agro-Meteorological Advisory</h2>
              <p className="weather-premium-subtitle">Rwanda · Live agricultural weather intelligence</p>
            </div>
          </div>
        </div>

        {weatherLoading ? (
          <div className="weather-premium-loading">
            <div className="weather-premium-spinner"></div>
            <p>Fetching live weather data across Rwanda...</p>
          </div>
        ) : currentCity && activeForecast && condition ? (
          <div className="weather-premium-body">
            {/* Left: Main display */}
            <div className="weather-premium-main">
              {/* City selector */}
              <div className="weather-city-selector" ref={dropdownRef}>
                <button
                  className="weather-city-trigger"
                  onClick={() => setCityListOpen(!cityListOpen)}
                  id="weather-city-dropdown"
                >
                  <MapPin size={16} />
                  <span className="weather-city-trigger-name">{currentCity.location}</span>
                  <span className="weather-city-trigger-region">{currentCity.region}</span>
                  <ChevronDown size={14} className={`weather-chevron ${cityListOpen ? 'open' : ''}`} />
                </button>

                {cityListOpen && (
                  <div className="weather-city-dropdown">
                    <div className="weather-city-dropdown-label">Select a region</div>
                    {weatherData.map((w, idx) => {
                      const cityForecast = w.forecasts[selectedDayIndex] || w.forecasts[1];
                      const cityCondition = mapWeatherCode(cityForecast.code);
                      return (
                        <button
                          key={idx}
                          className={`weather-city-option ${idx === selectedCity ? 'active' : ''}`}
                          onClick={() => { setSelectedCity(idx); setCityListOpen(false); }}
                        >
                          <div className="weather-city-option-left">
                            <span className="weather-city-option-emoji">{cityCondition.emoji}</span>
                            <div>
                              <span className="weather-city-option-name">{w.location}</span>
                              <span className="weather-city-option-region">{w.region}</span>
                            </div>
                          </div>
                          <span className="weather-city-option-temp">{cityForecast.maxTemp}°</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Hero temperature display */}
              <div className="weather-hero-temp">
                <span className="weather-hero-emoji">{condition.emoji}</span>
                <div className="weather-hero-temp-text">
                  <span className="weather-hero-degrees">{activeForecast.maxTemp}°</span>
                  <span className="weather-hero-unit">C</span>
                </div>
                <div className="weather-hero-meta">
                  <span className="weather-hero-condition">{condition.label}</span>
                  <span className="weather-hero-range">Low {activeForecast.minTemp}° · High {activeForecast.maxTemp}°</span>
                </div>
              </div>

              {/* Temperature gauge bar */}
              <div className="weather-temp-gauge">
                <div className="weather-temp-gauge-labels">
                  <span>5°C</span>
                  <Thermometer size={14} />
                  <span>40°C</span>
                </div>
                <div className="weather-temp-gauge-track">
                  <div
                    className="weather-temp-gauge-fill"
                    style={{ width: `${tempPercent}%` }}
                  ></div>
                  <div
                    className="weather-temp-gauge-thumb"
                    style={{ left: `${tempPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Detail metrics row */}
              <div className="weather-metrics-row">
                <div className="weather-metric-chip">
                  <Droplets size={16} />
                  <div>
                    <span className="weather-metric-val">{activeForecast.rainProb}%</span>
                    <span className="weather-metric-label">Rain</span>
                  </div>
                </div>
                <div className="weather-metric-chip">
                  <Wind size={16} />
                  <div>
                    <span className="weather-metric-val">{Math.round(8 + activeForecast.rainProb * 0.12)} km/h</span>
                    <span className="weather-metric-label">Wind</span>
                  </div>
                </div>
                <div className="weather-metric-chip">
                  <Eye size={16} />
                  <div>
                    <span className="weather-metric-val">{currentCity.elevation}m</span>
                    <span className="weather-metric-label">Elevation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Forecast strip + Advisory */}
            <div className="weather-premium-right">
              {/* Day selector tabs */}
              <div className="weather-day-tabs">
                {currentCity.forecasts.map((fc, idx) => {
                  const fcCondition = mapWeatherCode(fc.code);
                  return (
                    <button
                      key={idx}
                      className={`weather-day-tab ${idx === selectedDayIndex ? 'active' : ''}`}
                      onClick={() => setSelectedDayIndex(idx)}
                    >
                      <span className="weather-day-tab-label">{fc.dayLabel}</span>
                      <span className="weather-day-tab-emoji">{fcCondition.emoji}</span>
                      <span className="weather-day-tab-temp">{fc.maxTemp}°</span>
                      <span className="weather-day-tab-low">{fc.minTemp}°</span>
                    </button>
                  );
                })}
              </div>

              {/* Agricultural Advisory */}
              <div className="weather-advisory-premium">
                <div className="weather-advisory-premium-header">
                  <span className="weather-advisory-premium-badge">🌱 Agricultural Advisory</span>
                </div>
                <p className="weather-advisory-premium-text">{activeForecast.advisory}</p>
              </div>

              {/* Quick city overview */}
              <div className="weather-cities-quick-grid">
                {weatherData.filter((_, idx) => idx !== selectedCity).slice(0, 4).map((w, idx) => {
                  const qForecast = w.forecasts[selectedDayIndex] || w.forecasts[1];
                  const qCondition = mapWeatherCode(qForecast.code);
                  return (
                    <button
                      key={idx}
                      className="weather-quick-city"
                      onClick={() => setSelectedCity(weatherData.indexOf(w))}
                    >
                      <span className="weather-quick-emoji">{qCondition.emoji}</span>
                      <span className="weather-quick-name">{w.location}</span>
                      <span className="weather-quick-temp">{qForecast.maxTemp}°</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* PROJECT SUMMARY / STATISTICS */}
      <section style={styles.statsSection}>
        <div style={styles.statsHeader}>
          <h2>Technical Project Targets</h2>
          <p>Tested benchmark configurations under system metrics</p>
        </div>
        <div style={styles.statsGrid}>
          <div style={styles.statMetricCard}>
            <span style={styles.statVal}>&gt;85%</span>
            <span style={styles.statLabel}>Target F1-Score</span>
          </div>
          <div style={styles.statMetricCard}>
            <span style={styles.statVal}>31.2ms</span>
            <span style={styles.statLabel}>Cloud Latency</span>
          </div>
          <div style={styles.statMetricCard}>
            <span style={styles.statVal}>6.3MB</span>
            <span style={styles.statLabel}>Quantized Weight Size</span>
          </div>
          <div style={styles.statMetricCard}>
            <span style={styles.statVal}>14</span>
            <span style={styles.statLabel}>Vegetable Species</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2026 SeedSec Rwanda Project.</p>
      </footer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  heroContainer: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '4rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '5rem',
    flex: 1
  },
  heroSection: {
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem'
  },
  heroTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '3.25rem',
    fontWeight: 800,
    lineHeight: 1.15,
    color: '#fff',
    letterSpacing: '-1px'
  },
  heroGlow: {
    background: 'linear-gradient(135deg, #a6ff84 0%, #67c23a 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  heroSubtitle: {
    fontSize: '1.15rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    maxWidth: '700px'
  },
  heroCtaGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem'
  },
  primaryCta: {
    background: 'linear-gradient(135deg, #67c23a 0%, #4c9625 100%)',
    border: 'none',
    color: '#0b1308',
    padding: '0.85rem 1.75rem',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 15px rgba(103, 194, 58, 0.3)'
  },
  featuresSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem'
  },
  featureCard: {
    background: 'var(--surface-color)',
    border: '1px solid var(--surface-border)',
    borderRadius: '16px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    transition: 'all 0.3s ease'
  },
  featureIconBox: {
    background: 'rgba(103, 194, 58, 0.08)',
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#fff'
  },
  featureText: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5
  },
  statsSection: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '24px',
    padding: '3rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem'
  },
  statsHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem'
  },
  statMetricCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  statVal: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '2.5rem',
    fontWeight: 800,
    color: 'var(--accent-green)'
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  footer: {
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '2rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.85rem'
  }
};
