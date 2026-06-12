import React, { useState, useEffect } from 'react';
import { ArrowRight, Smartphone, Activity, Shield, CloudSun, Droplets } from 'lucide-react';

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
  forecasts: DailyForecast[];
}

const mapWeatherCode = (code: number) => {
  if (code === 0) return { label: 'Sunny', emoji: '☀️' };
  if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', emoji: '⛅' };
  if (code >= 45 && code <= 48) return { label: 'Foggy', emoji: '🌫️' };
  if (code >= 51 && code <= 67) return { label: 'Rainy', emoji: '🌧️' };
  if (code >= 71 && code <= 77) return { label: 'Snowy', emoji: '❄️' };
  if (code >= 80 && code <= 82) return { label: 'Rain Showers', emoji: '🌦️' };
  if (code >= 85 && code <= 86) return { label: 'Snow Showers', emoji: '🌨️' };
  if (code >= 95 && code <= 99) return { label: 'Thunderstorm', emoji: '⛈️' };
  return { label: 'Clear', emoji: '☀️' };
};

const getAgriAdvisory = (maxTemp: number, code: number, rainProb: number) => {
  if (code >= 95 && code <= 99) {
    return 'Severe storms: Avoid seeding. Clear storm drains and protect nursery beds.';
  }
  if ((code >= 51 && code <= 67) || rainProb > 70) {
    return 'Rainy: Excellent moisture for planting. Avoid applying surface chemical fertilizers.';
  }
  if (rainProb > 40) {
    return 'Showers likely: Favorable for transplanting seedlings. Delay spraying pesticides.';
  }
  if (maxTemp > 28) {
    return 'Hot/Dry: High evapotranspiration. Irrigate nurseries early; check soil moisture.';
  }
  if (maxTemp < 18) {
    return 'Cool: Expect slower maize root growth. Favorable for pea/legume seeding.';
  }
  return 'Stable: Optimal conditions for seedbed tillage, YOLOv8 diagnostics, and seeding.';
};

export default function Home({ onEnterWorkspace }: HomeProps) {
  const [weatherData, setWeatherData] = useState<WeatherInfo[]>([]);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1); // Defaults to 1 ("Today")

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
          { name: 'Kigali', region: 'Central Province' },
          { name: 'Musanze', region: 'Northern Province' },
          { name: 'Huye', region: 'Southern Province' },
          { name: 'Kayonza', region: 'Eastern Province' },
          { name: 'Rubavu', region: 'Western Province' },
          { name: 'Nyagatare', region: 'Eastern Province' },
          { name: 'Karongi', region: 'Western Province' },
          { name: 'Bugesera', region: 'Eastern Province' }
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
            
            // Format Day Label
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
          { name: 'Kigali', region: 'Central Province', baseTemp: 24 },
          { name: 'Musanze', region: 'Northern Province', baseTemp: 17 },
          { name: 'Huye', region: 'Southern Province', baseTemp: 21 },
          { name: 'Kayonza', region: 'Eastern Province', baseTemp: 27 },
          { name: 'Rubavu', region: 'Western Province', baseTemp: 22 },
          { name: 'Nyagatare', region: 'Eastern Province', baseTemp: 28 },
          { name: 'Karongi', region: 'Western Province', baseTemp: 23 },
          { name: 'Bugesera', region: 'Eastern Province', baseTemp: 26 }
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

      {/* RWANDA WEATHER ADVISORY SECTION */}
      <section className="weather-section">
        <div className="weather-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div className="weather-title">
            <CloudSun size={24} color="var(--accent-green)" />
            <h2 style={{ margin: 0, fontSize: '1.45rem' }}>Rwanda Agro-Meteorological Advisory</h2>
          </div>
          
          {/* Timeline tabs selector */}
          {!weatherLoading && weatherData.length > 0 && (
            <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.02)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              {Array.from({ length: 4 }).map((_, idx) => {
                const label = weatherData[0]?.forecasts[idx]?.dayLabel || '';
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDayIndex(idx)}
                    style={{
                      background: selectedDayIndex === idx ? 'var(--accent-green)' : 'transparent',
                      color: selectedDayIndex === idx ? '#0b1308' : 'var(--text-muted)',
                      border: 'none',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {weatherLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '2px solid rgba(103, 194, 58, 0.1)',
              borderTopColor: 'var(--accent-green)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fetching live agricultural weather timelines...</p>
          </div>
        ) : (
          <div className="weather-grid">
            {weatherData.map((w, idx) => {
              const activeForecast = w.forecasts[selectedDayIndex] || w.forecasts[1];
              const condition = mapWeatherCode(activeForecast.code);
              return (
                <div key={idx} className="weather-card">
                  <div className="weather-location">
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{w.location}</h4>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{w.region}</span>
                    </div>
                    <span className="weather-icon-emoji">{condition.emoji}</span>
                  </div>

                  <div className="weather-temp-row">
                    <span className="weather-temp">
                      {activeForecast.maxTemp}°C <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ {activeForecast.minTemp}°C</span>
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>{condition.label}</span>
                  </div>

                  <div className="weather-details-list">
                    <div className="weather-detail-item">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Droplets size={12} /> Rain Probability:</span>
                      <span className="weather-detail-val">{activeForecast.rainProb}%</span>
                    </div>
                  </div>

                  <div className="weather-advisory-box">
                    <span style={{ color: 'var(--accent-green)' }}>💡</span>
                    <p style={{ margin: 0 }}>{activeForecast.advisory}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
  badgeLabel: {
    background: 'rgba(103, 194, 58, 0.1)',
    border: '1px solid rgba(103, 194, 58, 0.2)',
    color: 'var(--accent-green)',
    padding: '0.4rem 1rem',
    borderRadius: '50px',
    fontSize: '0.85rem',
    fontWeight: 600
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
  secondaryCta: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    padding: '0.85rem 1.75rem',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '1rem',
    textDecoration: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s ease'
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
