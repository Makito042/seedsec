import React, { useState } from 'react';
import { Sparkles, Activity, Upload, Play, Pause, Volume2 } from 'lucide-react';
import Home from './components/Home';
import { Metric } from './types';

const TOOLS = [
  { id: 'maize_vigor', name: 'Maize Vigor YOLOv8', model: 'YOLOv8 Object Detector', desc: 'Germination root counting & vigor assessment', icon: '🌽' },
  { id: 'veg_tomato', name: 'Tomato Species MobileNet', model: 'MobileNetV2 Classifier', desc: 'Screens for vegetable seed variety purity', icon: '🍅' },
  { id: 'seed_defect', name: 'Seed Surface ResNet', model: 'ResNet50 Defect Classifier', desc: 'Analyzes structural cracks & surface mold', icon: '🛡️' },
  { id: 'bioacoustic', name: 'Soil Bioacoustic Monitor', model: 'Acoustic Signal Processor', desc: 'Assesses soil fauna activity & soil health', icon: '🔊' }
];

const TOOL_SAMPLES: Record<string, string[]> = {
  maize_vigor: ['maize_vigor_high', 'maize_vigor_low'],
  veg_tomato: ['tomato_variety_roma', 'tomato_variety_moneymaker'],
  seed_defect: ['seed_defect_crack', 'seed_defect_premium'],
  bioacoustic: ['acoustic_loam', 'acoustic_sand']
};

const SAMPLES: Record<string, {
  image?: string;
  audioName?: string;
  online: Metric;
  offline: Metric;
}> = {
  'maize_vigor_high': {
    image: 'https://images.unsplash.com/photo-1551747147-226438885624?auto=format&fit=crop&q=80&w=1000',
    online: {
      label: 'High Vigor Maize',
      class: 'Vigor 3 (High Germination)',
      confidence: '97.4%',
      latency: '28.5 ms',
      size: '6.3 MB',
      advisory: 'Healthy primary root emergence. High vigor seed lot. Recommended for immediate sowing with row NPK.',
      boxes: [
        { t: 30, l: 20, w: 22, h: 22, label: 'Root Emerged: 97%' },
        { t: 45, l: 55, w: 25, h: 25, label: 'Root Emerged: 98%' }
      ]
    },
    offline: {
      label: 'High Vigor Maize',
      class: 'Vigor 3 (High Germination)',
      confidence: '88.1%',
      latency: '74.2 ms',
      size: '3.1 MB',
      advisory: 'High vigor detected offline. Ready for normal sowing density. Verify moisture first.'
    }
  },
  'maize_vigor_low': {
    image: 'https://images.unsplash.com/photo-1628359355624-813ca355568a?auto=format&fit=crop&q=80&w=1000',
    online: {
      label: 'Low Vigor Maize',
      class: 'Vigor 1 (Weak / Dormant)',
      confidence: '91.8%',
      latency: '31.2 ms',
      size: '6.3 MB',
      advisory: 'Slow root tip elongation. High probability of poor field emergence. Apply starter phosphate.'
    },
    offline: {
      label: 'Low Vigor Maize',
      class: 'Vigor 1 (Weak)',
      confidence: '82.5%',
      latency: '78.5 ms',
      size: '3.1 MB',
      advisory: 'Weak germination detected offline. Monitor soil warmth closely.'
    }
  },
  'tomato_variety_roma': {
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=1000',
    online: {
      label: 'Tomato Roma Seed',
      class: 'Roma Variety (98.7% Pure)',
      confidence: '98.7%',
      latency: '22.1 ms',
      size: '14.2 MB',
      advisory: 'Pure Solanum lycopersicum Roma cultivar. Standard spacing: 50x70cm. Highly resistant to Fusarium wilt.'
    },
    offline: {
      label: 'Tomato Roma Seed',
      class: 'Roma Variety',
      confidence: '91.3%',
      latency: '51.3 ms',
      size: '6.1 MB',
      advisory: 'Roma cultivar match verified. Prepare standard nursery starter soil.'
    }
  },
  'tomato_variety_moneymaker': {
    image: 'https://images.unsplash.com/photo-1594283187221-39c894982631?auto=format&fit=crop&q=80&w=1000',
    online: {
      label: 'Tomato MoneyMaker Seed',
      class: 'MoneyMaker Variety (96.5% Pure)',
      confidence: '96.5%',
      latency: '24.8 ms',
      size: '14.2 MB',
      advisory: 'MoneyMaker greenhouse/outdoor cultivar. Requires staking support. Tolerates high temperature humidity well.'
    },
    offline: {
      label: 'Tomato MoneyMaker Seed',
      class: 'MoneyMaker Variety',
      confidence: '89.0%',
      latency: '53.6 ms',
      size: '6.1 MB',
      advisory: 'MoneyMaker classification confirmed offline.'
    }
  },
  'seed_defect_crack': {
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=1000',
    online: {
      label: 'Fractured Seed',
      class: 'Mechanical Damage (Cracked)',
      confidence: '95.4%',
      latency: '35.1 ms',
      size: '25.6 MB',
      advisory: 'Structural fracture detected in seed coat. High risk of soil pathogen attack. Do not use for automated seed drillers.',
      boxes: [
        { t: 25, l: 35, w: 40, h: 30, label: 'Mechanical Fracture: 95%' }
      ]
    },
    offline: {
      label: 'Fractured Seed',
      class: 'Cracked Seed Coat',
      confidence: '87.2%',
      latency: '92.1 ms',
      size: '8.4 MB',
      advisory: 'Outer seed coat integrity failure. Handle carefully to prevent split embryonic damage.'
    }
  },
  'seed_defect_premium': {
    image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=1000',
    online: {
      label: 'Premium Seed',
      class: 'Premium Quality (Clean)',
      confidence: '99.1%',
      latency: '33.8 ms',
      size: '25.6 MB',
      advisory: 'Excellent surface integrity. Clean endosperm, no mold, no insect entry holes. Suitable for long-term silo storage.'
    },
    offline: {
      label: 'Premium Seed',
      class: 'Clean (No Defects)',
      confidence: '92.3%',
      latency: '89.6 ms',
      size: '8.4 MB',
      advisory: 'High-quality grade. Meets national seed quality distribution standards.'
    }
  },
  'acoustic_loam': {
    audioName: 'Sensor_Node_24A_Kigali.wav',
    online: {
      label: 'Bio-Active Loam',
      class: 'High Biotic Activity (Healthy Soil)',
      confidence: '94.2%',
      latency: '42.5 ms',
      size: '8.9 MB',
      advisory: 'High sound event frequency (18 events/min). High density of earthworms and beneficial soil micro-fauna. Soil aeration is excellent. No tillage recommended.',
      faunaDensity: 'High (Avg 24 organisms / m³)',
      bioticIndex: '8.4 / 10',
      acousticActivity: '18 events / min',
      dominantFauna: 'Earthworms (Oligochaeta) & Coleoptera Larvae',
      waveformSeed: 1
    },
    offline: {
      label: 'Bio-Active Loam',
      class: 'Healthy Biotic Activity',
      confidence: '88.5%',
      latency: '68.0 ms',
      size: '4.2 MB',
      advisory: 'Healthy micro-fauna activity recorded offline. Maintain organic matter inputs.',
      faunaDensity: 'Medium-High',
      bioticIndex: '7.8 / 10',
      acousticActivity: '14 events / min',
      dominantFauna: 'Oligochaeta & Carabidae',
      waveformSeed: 1
    }
  },
  'acoustic_sand': {
    audioName: 'Sensor_Node_09B_Kayonza.wav',
    online: {
      label: 'Depleted Sandy Soil',
      class: 'Low Biotic Activity (Depleted Soil)',
      confidence: '91.0%',
      latency: '41.1 ms',
      size: '8.9 MB',
      advisory: 'Very sparse bioacoustic signals (1.5 events/min). Depleted organic matter. High chemical fertilizer usage suspected. Introduce compost and cover cropping immediately.',
      faunaDensity: 'Low (Avg 3 organisms / m³)',
      bioticIndex: '2.1 / 10',
      acousticActivity: '1.5 events / min',
      dominantFauna: 'None detected (background micro-tremors)',
      waveformSeed: 2
    },
    offline: {
      label: 'Depleted Sandy Soil',
      class: 'Depleted Soil Profile',
      confidence: '81.4%',
      latency: '65.2 ms',
      size: '4.2 MB',
      advisory: 'Soil acoustically inactive offline. Apply mulching to encourage fauna colonization.',
      faunaDensity: 'Very Low',
      bioticIndex: '1.9 / 10',
      acousticActivity: '2 events / min',
      dominantFauna: 'None detected',
      waveformSeed: 2
    }
  }
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [activeToolId, setActiveToolId] = useState<string>('maize_vigor');
  const [selectedSample, setSelectedSample] = useState<string>('maize_vigor_high');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Metric | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const handleToolChange = (toolId: string) => {
    setActiveToolId(toolId);
    const presets = TOOL_SAMPLES[toolId];
    setSelectedSample(presets[0]);
    setResults(null);
    setIsPlayingAudio(false);
  };

  const triggerScan = () => {
    setLoading(true);
    setResults(null);
    setTimeout(() => {
      setLoading(false);
      const sample = SAMPLES[selectedSample];
      setResults(isOnline ? sample.online : sample.offline);
    }, 700);
  };

  const currentSampleData = SAMPLES[selectedSample];
  const activeTool = TOOLS.find(t => t.id === activeToolId) || TOOLS[0];
  const isAcoustic = activeToolId === 'bioacoustic';

  return (
    <div style={styles.appContainer}>
      {/* Header */}
      <header className="app-header">
        <div className="logo-group" onClick={() => setCurrentTab('home')}>
          <span className="logo-icon">🌱</span>
          <div>
            <h1 className="logo-text">SeedSec Rwanda</h1>
            <p className="logo-sub">Web Portal</p>
          </div>
        </div>
        <nav className="nav-menu">
          <button 
            onClick={() => setCurrentTab('home')}
            className={`nav-link ${currentTab === 'home' ? 'active' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => setCurrentTab('workspace')}
            className={`nav-link ${currentTab === 'workspace' ? 'active' : ''}`}
          >
            Diagnostic Workspace
          </button>
        </nav>
        <div className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? 'Cloud Engine Online' : 'Edge TFLite Active'}
        </div>
      </header>

      {/* Conditionally render Tab Content */}
      {currentTab === 'home' ? (
        <Home onEnterWorkspace={() => setCurrentTab('workspace')} />
      ) : (
        /* WORKSPACE INTERACTIVE DIAGNOSTIC SCREEN */
        <main className="workspace-layout">
          
          {/* Left Sidebar - Model Catalog */}
          <aside className="workspace-sidebar-card">
            <h3 className="sidebar-title">Diagnostic Tool Catalog</h3>
            <div className="tools-list">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolChange(tool.id)}
                  className={`tool-btn ${activeToolId === tool.id ? 'active' : ''}`}
                >
                  <span className="tool-btn-icon-box" style={{ fontSize: '1.25rem' }}>
                    {tool.icon}
                  </span>
                  <div className="tool-btn-info">
                    <span className="tool-btn-name">{tool.name}</span>
                    <span className="tool-btn-desc">{tool.desc}</span>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ fontWeight: 700, color: 'var(--accent-green)', display: 'block', marginBottom: '0.2rem' }}>💡 Selection Mode</span>
              Choose a model to load its environment and feed target agricultural samples.
            </div>
          </aside>

          {/* Right Main Pane - Active Tool Details */}
          <div className="workspace-detail-pane">
            
            {/* Ingestion & Preview Card */}
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}><Upload size={20} /> {activeTool.name} Ingestion</h2>
                <p style={styles.cardDesc}>Pipeline: {activeTool.model}</p>
              </div>

              {/* Toggle Model Pipeline */}
              <div style={styles.toggleRow}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Pipeline Model Runtime</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    {isOnline ? 'FastAPI Cloud Service (PyTorch)' : 'WebAssembly Local Engine (TFLite)'}
                  </p>
                </div>
                <button 
                  onClick={() => { setIsOnline(!isOnline); setResults(null); }}
                  style={{
                    ...styles.toggleBtn,
                    borderColor: isOnline ? 'var(--accent-green)' : 'var(--accent-orange)',
                    color: isOnline ? 'var(--accent-green)' : 'var(--accent-orange)'
                  }}
                >
                  {isOnline ? 'Switch to Offline' : 'Switch to Online'}
                </button>
              </div>

              {/* Interactive Ingestion Media Box */}
              {!isAcoustic ? (
                /* Computer Vision Image Frame */
                <div style={{
                  ...styles.previewFrame,
                  backgroundImage: `url(${currentSampleData.image})`
                }}>
                  {results && results.boxes && results.boxes.map((box, idx) => (
                    <div key={idx} style={{
                      position: 'absolute',
                      border: '2px solid red',
                      boxShadow: '0 0 8px red',
                      background: 'rgba(255,0,0,0.15)',
                      top: `${box.t}%`,
                      left: `${box.l}%`,
                      width: `${box.w}%`,
                      height: `${box.h}%`,
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      padding: '2px',
                      borderRadius: '2px',
                      pointerEvents: 'none'
                    }}>
                      {box.label}
                    </div>
                  ))}
                </div>
              ) : (
                /* Soil Bioacoustic Wave Player */
                <div className="waveform-box">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Volume2 size={20} style={{ color: 'var(--accent-green)' }} />
                      <div>
                        <h4 style={{ fontSize: '0.85rem', color: '#fff', margin: 0 }}>{currentSampleData.audioName}</h4>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>44.1kHz Bioacoustic Sensor</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      style={{
                        background: isPlayingAudio ? 'rgba(230, 162, 60, 0.15)' : 'rgba(103, 194, 58, 0.15)',
                        border: '1px solid ' + (isPlayingAudio ? 'var(--accent-orange)' : 'var(--accent-green)'),
                        color: isPlayingAudio ? 'var(--accent-orange)' : 'var(--accent-green)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {isPlayingAudio ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
                    </button>
                  </div>

                  <div className="waveform-display">
                    {Array.from({ length: 28 }).map((_, i) => {
                      const delay = (i % 7) * 0.12;
                      return (
                        <div 
                          key={i} 
                          className={`waveform-bar ${isPlayingAudio ? 'active' : ''}`}
                          style={{ 
                            height: isPlayingAudio ? undefined : `${20 + (i % 5) * 12}%`,
                            animationDelay: `${delay}s`,
                            margin: '0 1px',
                            flex: 1
                          }} 
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Target Sample Preset Chips */}
              <div style={styles.chipsSection}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Select Ingestion Presets:</p>
                <div style={styles.chipsRow}>
                  {TOOL_SAMPLES[activeToolId].map((sampleKey) => {
                    const displayName = sampleKey.includes('high') ? 'High Vigor' 
                                      : sampleKey.includes('low') ? 'Low Vigor'
                                      : sampleKey.includes('roma') ? 'Roma cultivar'
                                      : sampleKey.includes('money') ? 'MoneyMaker'
                                      : sampleKey.includes('crack') ? 'Cracked Surface'
                                      : sampleKey.includes('premium') ? 'Premium Grade'
                                      : sampleKey.includes('loam') ? 'Kigali Loam Node'
                                      : 'Kayonza Sand Node';

                    return (
                      <button 
                        key={sampleKey}
                        onClick={() => { setSelectedSample(sampleKey); setResults(null); }}
                        style={{ ...styles.chip, ...(selectedSample === sampleKey ? styles.chipActive : {}) }}
                      >
                        {displayName}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button onClick={triggerScan} style={styles.scanBtn}>
                ⚡ Run {isAcoustic ? 'Acoustic Processing' : 'Diagnostic Inference'}
              </button>
            </section>

            {/* Results Card */}
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}><Activity size={20} /> Diagnostic Analysis Log</h2>
                <p style={styles.cardDesc}>Classification telemetry and actionable crop advices</p>
              </div>

              {loading && (
                <div style={styles.resultsPlaceholder}>
                  <div style={styles.spinner}></div>
                  <p style={{ marginTop: '1rem' }}>Executing {isAcoustic ? 'acoustic wave analysis' : 'vision model inference'} pipeline...</p>
                </div>
              )}

              {!loading && !results && (
                <div style={styles.resultsPlaceholder}>
                  <Sparkles size={40} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '1rem' }} />
                  <p>Inference pipeline idle. Trigger processing from the ingestion card.</p>
                </div>
              )}

              {!loading && results && (
                <div style={styles.resultsContent}>
                  
                  {/* CV vs Acoustic Main Output details */}
                  <div style={styles.metricsGrid}>
                    <div style={{ ...styles.metricBox, borderLeft: '4px solid var(--accent-green)' }}>
                      <span style={styles.metricLabel}>{isAcoustic ? 'Soil Profile Status' : 'Classification Class'}</span>
                      <span style={styles.metricVal}>{results.class}</span>
                    </div>
                    <div style={{ ...styles.metricBox, borderLeft: '4px solid var(--accent-orange)' }}>
                      <span style={styles.metricLabel}>{isAcoustic ? 'Acoustic Confidence' : 'Model Confidence'}</span>
                      <span style={styles.metricVal}>{results.confidence}</span>
                    </div>
                  </div>

                  {/* Bioacoustic extra gauges */}
                  {isAcoustic && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div className="biotic-gauge-container">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SOIL BIOTIC HEALTH INDEX</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{results.bioticIndex}</span>
                        </div>
                        <div className="biotic-gauge-bar-outer">
                          <div 
                            className="biotic-gauge-bar-inner" 
                            style={{ width: results.bioticIndex ? `${parseFloat(results.bioticIndex) * 10}%` : '50%' }}
                          />
                        </div>
                      </div>

                      <div style={styles.specsCard}>
                        <div style={styles.specRow}>
                          <span>Fauna Signal Activity:</span>
                          <span style={{ color: '#fff', fontWeight: 600 }}>{results.acousticActivity}</span>
                        </div>
                        <div style={styles.specRow}>
                          <span>Fauna Density Estimate:</span>
                          <span style={{ color: '#fff', fontWeight: 600 }}>{results.faunaDensity}</span>
                        </div>
                        <div style={styles.specRow}>
                          <span>Dominant Fauna Type:</span>
                          <span style={{ color: '#fff', fontWeight: 600 }}>{results.dominantFauna}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sowing Advisory Box */}
                  <div style={styles.advisoryBox}>
                    <h4 style={{ color: 'var(--accent-green)', fontWeight: 700, margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>💡 Farmer Action Advisory</h4>
                    <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: 1.4 }}>{results.advisory}</p>
                  </div>

                  {/* Technical Specs */}
                  <div style={styles.specsCard}>
                    <div style={styles.specRow}>
                      <span>Backbone Architecture:</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{activeTool.model}</span>
                    </div>
                    <div style={styles.specRow}>
                      <span>Loaded Model Weight:</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{results.size}</span>
                    </div>
                    <div style={styles.specRow}>
                      <span>Inference Latency:</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{results.latency}</span>
                    </div>
                  </div>

                </div>
              )}
            </section>

          </div>
        </main>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  appContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  card: {
    background: 'var(--surface-color)',
    border: '1px solid var(--surface-border)',
    borderRadius: '20px',
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    height: 'fit-content'
  },
  cardHeader: {
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '0.75rem'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: 0
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
    marginBottom: 0
  },
  toggleRow: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  toggleBtn: {
    background: 'rgba(0,0,0,0.2)',
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  previewFrame: {
    width: '100%',
    height: '240px',
    borderRadius: '12px',
    border: '1px solid var(--surface-border)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  chipsSection: {
    marginTop: '0.25rem'
  },
  chipsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  chip: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'var(--text-muted)',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  chipActive: {
    borderColor: 'var(--accent-green)',
    background: 'rgba(103, 194, 58, 0.12)',
    color: '#fff',
    fontWeight: 600
  },
  scanBtn: {
    background: 'linear-gradient(135deg, #67c23a 0%, #4c9625 100%)',
    border: 'none',
    color: '#0b1308',
    padding: '0.85rem',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(103, 194, 58, 0.2)',
    transition: 'all 0.3s ease'
  },
  resultsPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 1.5rem',
    color: 'var(--text-muted)',
    border: '1px dashed rgba(255,255,255,0.05)',
    borderRadius: '12px',
    textAlign: 'center'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(103, 194, 58, 0.1)',
    borderTopColor: 'var(--accent-green)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  resultsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  metricBox: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    display: 'flex',
    flexDirection: 'column'
  },
  metricLabel: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase'
  },
  metricVal: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#fff',
    marginTop: '0.25rem'
  },
  advisoryBox: {
    background: 'rgba(103, 194, 58, 0.03)',
    border: '1px solid rgba(103, 194, 58, 0.1)',
    borderRadius: '10px',
    padding: '1rem'
  },
  specsCard: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  },
  specRow: {
    display: 'flex',
    justifyContent: 'space-between'
  }
};
