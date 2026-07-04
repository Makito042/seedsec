import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Smartphone, Activity, Shield, CloudSun, Droplets, MapPin, ChevronDown, Thermometer, Wind, Eye, Leaf, BarChart3, Zap, Camera, Mountain, Globe } from 'lucide-react';

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
  if (code === 0) return { label: 'Clear Sky', emoji: '', gradient: 'linear-gradient(135deg, #ff9500 0%, #ff5e3a 100%)' };
  if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', emoji: '', gradient: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)' };
  if (code >= 45 && code <= 48) return { label: 'Foggy', emoji: '', gradient: 'linear-gradient(135deg, #90a4ae 0%, #78909c 100%)' };
  if (code >= 51 && code <= 67) return { label: 'Rainy', emoji: '', gradient: 'linear-gradient(135deg, #5c6bc0 0%, #3949ab 100%)' };
  if (code >= 71 && code <= 77) return { label: 'Snowy', emoji: '', gradient: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)' };
  if (code >= 80 && code <= 82) return { label: 'Rain Showers', emoji: '', gradient: 'linear-gradient(135deg, #7986cb 0%, #5c6bc0 100%)' };
  if (code >= 85 && code <= 86) return { label: 'Snow Showers', emoji: '', gradient: 'linear-gradient(135deg, #b0bec5 0%, #90a4ae 100%)' };
  if (code >= 95 && code <= 99) return { label: 'Thunderstorm', emoji: '', gradient: 'linear-gradient(135deg, #7e57c2 0%, #5e35b1 100%)' };
  return { label: 'Clear', emoji: '', gradient: 'linear-gradient(135deg, #ff9500 0%, #ff5e3a 100%)' };
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

/* Animated counter hook */
function useCountUp(target: number, duration: number = 2000, startOnMount: boolean = true) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnMount) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started, startOnMount]);

  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, target, duration]);

  return { value, ref };
}

const GALLERY_ITEMS = [
  {
    src: '/images/rwanda_hills.png',
    title: 'Land of a Thousand Hills',
    subtitle: 'Rwanda\'s iconic terraced hillsides — where 70% of the population depends on agriculture',
    icon: <Mountain size={16} />
  },
  {
    src: '/images/rwanda_farming.png',
    title: 'Precision Smallholder Farming',
    subtitle: 'Terraced agriculture across volcanic highlands, growing maize, beans, and coffee',
    icon: <Globe size={16} />
  },
  {
    src: '/images/rwanda_seeds.png',
    title: 'Seeds of Tomorrow',
    subtitle: 'AI-powered quality diagnostics ensure every seed meets national certification standards',
    icon: <Camera size={16} />
  }
];

export default function Home({ onEnterWorkspace }: HomeProps) {
  const [weatherData, setWeatherData] = useState<WeatherInfo[]>([]);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [selectedCity, setSelectedCity] = useState<number>(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);
  const [cityListOpen, setCityListOpen] = useState<boolean>(false);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-rotate gallery
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveGalleryIdx(prev => (prev + 1) % GALLERY_ITEMS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

  const FEATURES = [
    {
      icon: <Smartphone size={24} color="var(--accent-green)" />,
      title: 'Dual Deployment',
      text: 'Runs online via a high-performance cloud FastAPI/PyTorch service, or offline directly on-device using quantized float16 TensorFlow Lite models for disconnected rural fields.',
      tag: 'HYBRID'
    },
    {
      icon: <Activity size={24} color="var(--accent-green)" />,
      title: 'YOLOv8 & ResNet Models',
      text: 'YOLOv8 object detector monitors germination progression stages. ResNet50 analyzes seed surface details to detect cracks, discoloration, or silk cuts.',
      tag: 'DETECTION'
    },
    {
      icon: <Shield size={24} color="var(--accent-green)" />,
      title: 'MobileNet Classifier',
      text: 'Lightweight MobileNetV2 architecture screens 14 distinct species of vegetable seeds (e.g. Tomato, Spinach, Cabbage) to guarantee purity standards.',
      tag: 'CLASSIFY'
    }
  ];

  const stat1 = useCountUp(85, 2000);
  const stat2 = useCountUp(31, 1800);
  const stat3 = useCountUp(6, 1500);
  const stat4 = useCountUp(14, 1600);

  const STATS = [
    { val: stat1.value, suffix: '%', prefix: '>', label: 'Target F1-Score', icon: <BarChart3 size={20} />, ref: stat1.ref },
    { val: stat2.value, suffix: 'ms', prefix: '', label: 'Cloud Latency', icon: <Zap size={20} />, ref: stat2.ref },
    { val: stat3.value, suffix: 'MB', prefix: '', label: 'Quantized Weight', icon: <Smartphone size={20} />, ref: stat3.ref },
    { val: stat4.value, suffix: '', prefix: '', label: 'Vegetable Species', icon: <Leaf size={20} />, ref: stat4.ref }
  ];

  return (
    <div className="home-container">
      {/* ===================== CINEMATIC HERO SECTION ===================== */}
      <section className="hero-cinematic">
        {/* Background image with parallax */}
        <div className="hero-cinematic-bg">
          <img 
            src="/images/rwanda_hills.png" 
            alt="Rwanda's rolling green hills" 
            className="hero-cinematic-img"
          />
          <div className="hero-cinematic-overlay" />
        </div>

        {/* Content */}
        <div className="hero-cinematic-content">
          <div className="hero-cinematic-badge">
            <span className="hero-badge-dot" />
            Research-Grade Seed Intelligence Platform
          </div>
          <h1 className="hero-cinematic-title">
            Hybrid Smartphone-Based <br />
            <span className="hero-glow-text">Seed Quality Diagnostics</span>
          </h1>
          <p className="hero-cinematic-subtitle">
            Empowering Rwandan smallholder farmers and agro-dealers with zero-cost, near-instant, 
            computer-vision diagnostics for maize germination vigor, seed quality check, and vegetable species variety screening.
          </p>
          <div className="hero-cinematic-cta-group">
            <button onClick={onEnterWorkspace} className="hero-cta-primary" id="hero-enter-workspace-btn">
              Enter Workspace <ArrowRight size={18} />
            </button>
            <button className="hero-cta-secondary" id="hero-docs-btn">
              View Documentation
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="hero-scroll-indicator">
            <div className="hero-scroll-dot" />
          </div>
        </div>
      </section>

      {/* ===================== RWANDA PHOTO GALLERY ===================== */}
      <section className="rwanda-gallery-section">
        <div className="section-header-premium">
          <div className="section-header-badge">
            <Camera size={14} />
            The Beauty of Rwanda
          </div>
          <h2 className="section-title-premium">Land of a Thousand Hills</h2>
          <p className="section-subtitle-premium">
            Where cutting-edge AI meets centuries of agricultural heritage — building a smarter, more food-secure Rwanda
          </p>
        </div>

        <div className="gallery-showcase">
          {/* Main active image */}
          <div className="gallery-main-frame">
            {GALLERY_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className={`gallery-slide ${idx === activeGalleryIdx ? 'active' : ''}`}
              >
                <img src={item.src} alt={item.title} className="gallery-slide-img" />
                <div className="gallery-slide-overlay" />
                <div className="gallery-slide-caption">
                  <div className="gallery-caption-icon">{item.icon}</div>
                  <h3 className="gallery-caption-title">{item.title}</h3>
                  <p className="gallery-caption-text">{item.subtitle}</p>
                </div>
              </div>
            ))}

            {/* Progress bar */}
            <div className="gallery-progress-bar">
              {GALLERY_ITEMS.map((_, idx) => (
                <button
                  key={idx}
                  className={`gallery-progress-dot ${idx === activeGalleryIdx ? 'active' : ''}`}
                  onClick={() => setActiveGalleryIdx(idx)}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnails strip */}
          <div className="gallery-thumbs-strip">
            {GALLERY_ITEMS.map((item, idx) => (
              <button
                key={idx}
                className={`gallery-thumb ${idx === activeGalleryIdx ? 'active' : ''}`}
                onClick={() => setActiveGalleryIdx(idx)}
              >
                <img src={item.src} alt={item.title} className="gallery-thumb-img" />
                <div className="gallery-thumb-overlay" />
                <span className="gallery-thumb-label">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURES GRID ===================== */}
      <section className="features-section-premium">
        <div className="section-header-premium">
          <div className="section-header-badge">
            <Zap size={14} />
            Core Technology
          </div>
          <h2 className="section-title-premium">Precision Agriculture AI Stack</h2>
          <p className="section-subtitle-premium">
            Three specialized deep learning models working in concert to diagnose seed quality at every stage
          </p>
        </div>
        <div className="features-grid-premium">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card-premium">
              <div className="feature-card-glow" />
              <div className="feature-top-row">
                <div className="feature-icon-ring">{f.icon}</div>
                <span className="feature-tag-pill">{f.tag}</span>
              </div>
              <h3 className="feature-card-title">{f.title}</h3>
              <p className="feature-card-text">{f.text}</p>
              <div className="feature-card-divider" />
              <button className="feature-learn-more" onClick={onEnterWorkspace}>
                Try it now <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== WEATHER ADVISORY ===================== */}
      <section className="weather-premium-section">
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
                      return (
                        <button
                          key={idx}
                          className={`weather-city-option ${idx === selectedCity ? 'active' : ''}`}
                          onClick={() => { setSelectedCity(idx); setCityListOpen(false); }}
                        >
                          <div className="weather-city-option-left">
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
                  return (
                    <button
                      key={idx}
                      className={`weather-day-tab ${idx === selectedDayIndex ? 'active' : ''}`}
                      onClick={() => setSelectedDayIndex(idx)}
                    >
                      <span className="weather-day-tab-label">{fc.dayLabel}</span>
                      <span className="weather-day-tab-temp">{fc.maxTemp}°</span>
                      <span className="weather-day-tab-low">{fc.minTemp}°</span>
                    </button>
                  );
                })}
              </div>

              {/* Agricultural Advisory */}
              <div className="weather-advisory-premium">
                <div className="weather-advisory-premium-header">
                  <span className="weather-advisory-premium-badge">Agricultural Advisory</span>
                </div>
                <p className="weather-advisory-premium-text">{activeForecast.advisory}</p>
              </div>

              {/* Quick city overview */}
              <div className="weather-cities-quick-grid">
                {weatherData.filter((_, idx) => idx !== selectedCity).slice(0, 4).map((w, idx) => {
                  const qForecast = w.forecasts[selectedDayIndex] || w.forecasts[1];
                  return (
                    <button
                      key={idx}
                      className="weather-quick-city"
                      onClick={() => setSelectedCity(weatherData.indexOf(w))}
                    >
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

      {/* ===================== ANIMATED STATS ===================== */}
      <section className="stats-section-premium">
        <div className="section-header-premium" style={{ textAlign: 'center' }}>
          <div className="section-header-badge" style={{ margin: '0 auto' }}>
            <BarChart3 size={14} />
            Benchmarks
          </div>
          <h2 className="section-title-premium">Technical Project Targets</h2>
          <p className="section-subtitle-premium">
            Tested benchmark configurations under system metrics
          </p>
        </div>
        <div className="stats-grid-premium">
          {STATS.map((s, i) => (
            <div key={i} className="stat-card-premium" ref={s.ref}>
              <div className="stat-icon-glow">{s.icon}</div>
              <span className="stat-value-premium">{s.prefix}{s.val}{s.suffix}</span>
              <span className="stat-label-premium">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="footer-premium">
        <div className="footer-inner-premium">
          <div className="footer-brand">
            <span className="footer-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={20} color="var(--accent-green)" />
            </span>
            <div>
              <p className="footer-brand-name">SeedSec Rwanda</p>
              <p className="footer-brand-sub">University of Rwanda · 2026</p>
            </div>
          </div>
          <div className="footer-links-premium">
            <a href="#" className="footer-link-premium">Documentation</a>
            <span className="footer-divider-premium">·</span>
            <a href="#" className="footer-link-premium">GitHub</a>
            <span className="footer-divider-premium">·</span>
            <a href="#" className="footer-link-premium">API</a>
          </div>
        </div>
        <div className="footer-bottom-bar">
          <p>Built for Rwandan agriculture</p>
        </div>
      </footer>
    </div>
  );
}
