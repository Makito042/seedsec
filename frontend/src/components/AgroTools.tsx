import React, { useState } from 'react';
import { Calculator, Database, FileSpreadsheet, Trash2, ShieldAlert, Sparkles } from 'lucide-react';

interface AgroToolsProps {
  historyLogs: any[];
  onClearHistory: () => void;
}

const CROP_SPECS = {
  maize: {
    name: 'Maize (Zea mays)',
    defaultDensity: 53333, // plants/ha (75cm x 25cm)
    seedWeight1000: 300, // grams per 1000 seeds
    spacing: '75 cm x 25 cm',
    depth: '5.0 cm',
    purity: 98,
    advisory: 'Ensure optimal soil moisture before sowing. Apply NPK at planting and urea top-dressing at 4-6 weeks.'
  },
  tomato: {
    name: 'Tomato (Solanum lycopersicum)',
    defaultDensity: 22222, // plants/ha (75cm x 60cm)
    seedWeight1000: 3, // grams per 1000 seeds
    spacing: '75 cm x 60 cm',
    depth: '1.5 cm',
    purity: 99,
    advisory: 'Raise in nursery beds for 4 weeks. Transplant on raised beds during cool hours. Stake plants to support fruit load.'
  },
  cabbage: {
    name: 'Cabbage (Brassica oleracea)',
    defaultDensity: 37037, // plants/ha (60cm x 45cm)
    seedWeight1000: 4, // grams per 1000 seeds
    spacing: '60 cm x 45 cm',
    depth: '1.0 cm',
    purity: 97,
    advisory: 'Requires high nitrogen organic fertilizer. Control diamondback moths (DBM) with regular pest scouting.'
  },
  spinach: {
    name: 'Spinach (Spinacia oleracea)',
    defaultDensity: 111111, // plants/ha (30cm x 30cm)
    seedWeight1000: 10, // grams per 1000 seeds
    spacing: '30 cm x 30 cm',
    depth: '2.0 cm',
    purity: 98,
    advisory: 'Best suited for cool environments. Keep soil consistently moist to prevent premature bolting.'
  }
};

export default function AgroTools({ historyLogs, onClearHistory }: AgroToolsProps) {
  // Calculator States
  const [cropType, setCropType] = useState<keyof typeof CROP_SPECS>('maize');
  const [vigorLevel, setVigorLevel] = useState<'high' | 'medium' | 'low'>('high');
  const [areaSize, setAreaSize] = useState<number>(1.0);
  const [areaUnit, setAreaUnit] = useState<'ha' | 'acre'>('ha');

  const spec = CROP_SPECS[cropType];

  // Derive Germination % based on vigor
  const getGermination = (level: 'high' | 'medium' | 'low') => {
    if (level === 'high') return 95;
    if (level === 'medium') return 80;
    return 60;
  };

  const germination = getGermination(vigorLevel);

  // Seeding Rate Calculation
  // Formula: Seed Rate (kg/ha) = (Plant Density * 1000-Seed Weight (g)) / (Germination % * Purity % * 10)
  const density = spec.defaultDensity;
  const purity = spec.purity;
  const seedRatePerHa = (density * spec.seedWeight1000) / (germination * purity * 10);
  const roundedSeedRate = Math.round(seedRatePerHa * 100) / 100;

  // Total seeds weight based on area size
  const multiplier = areaUnit === 'ha' ? areaSize : areaSize * 0.4047; // 1 acre = 0.4047 ha
  const totalWeightNeeded = Math.round(roundedSeedRate * multiplier * 10) / 10;
  const expectedPlants = Math.round(density * multiplier);

  // CSV Exporter Simulation
  const exportToCSV = () => {
    const headers = 'Scan ID,Timestamp,Tool Name,Diagnostic Outcome,Confidence,Mode,Status\n';
    const rows = historyLogs.map(log => 
      `"${log.id}","${log.timestamp}","${log.toolName}","${log.class}","${log.confidence}","${log.mode}","${log.status}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `seedsec_rwanda_diagnostic_log_${new Date().toISOString().slice(0,10)}.csv`);
    a.click();
  };

  return (
    <div style={styles.container}>
      {/* Page Title Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Agro-Tools & Audit Database</h1>
          <p style={styles.subtitle}>Sowing rate calculations & local audit history (Table 3.1 Schema)</p>
        </div>
      </div>

      <div style={styles.grid}>
        
        {/* Left Side: Sowing Rate Calculator */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              <Calculator size={20} color="var(--accent-green)" /> Sowing Rate & Spacing Calculator
            </h2>
            <p style={styles.cardDesc}>Calculate exact seed requirements and spatial density based on detected vigor levels.</p>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Select Target Crop</label>
            <select 
              value={cropType} 
              onChange={(e) => setCropType(e.target.value as any)} 
              style={styles.select}
            >
              {Object.keys(CROP_SPECS).map((key) => (
                <option key={key} value={key}>{CROP_SPECS[key as keyof typeof CROP_SPECS].name}</option>
              ))}
            </select>
          </div>

          <div style={styles.formRow}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Sowing Plot Size</label>
              <input 
                type="number" 
                min="0.1" 
                step="0.1" 
                value={areaSize} 
                onChange={(e) => setAreaSize(parseFloat(e.target.value) || 0)} 
                style={styles.input} 
              />
            </div>
            <div style={{ ...styles.formGroup, width: '100px' }}>
              <label style={styles.label}>Unit</label>
              <select 
                value={areaUnit} 
                onChange={(e) => setAreaUnit(e.target.value as any)} 
                style={styles.select}
              >
                <option value="ha">Hectares</option>
                <option value="acre">Acres</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Seed Vigor Quality Class</label>
            <div style={styles.vigorButtonGroup}>
              {['high', 'medium', 'low'].map((level) => (
                <button
                  key={level}
                  onClick={() => setVigorLevel(level as any)}
                  style={{
                    ...styles.vigorBtn,
                    ...(vigorLevel === level ? styles.vigorBtnActive : {}),
                    ...(level === 'low' && vigorLevel === 'low' ? styles.vigorBtnLow : {})
                  }}
                >
                  {level.toUpperCase()} {level === 'high' ? '🌱' : level === 'medium' ? '⛅' : '⚠️'}
                </button>
              ))}
            </div>
          </div>

          {/* Vigor Warnings for Farmers */}
          {vigorLevel === 'low' && (
            <div style={styles.warningBox}>
              <ShieldAlert size={18} color="var(--accent-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--accent-orange)' }}>
                <strong>Low Vigor Detected:</strong> Sowing rate has been increased by 58% to compensate for low expected germination rate ({germination}%). Consider treating seeds with bio-stimulants or sourcing certified lots.
              </p>
            </div>
          )}

          {/* Live Dynamic Output Card */}
          <div style={styles.outputBox}>
            <h3 style={styles.outputTitle}>Agronomic Recommendations</h3>
            <div style={styles.outputGrid}>
              <div style={styles.outputItem}>
                <span style={styles.outputLabel}>Expected Germination</span>
                <span style={{ ...styles.outputVal, color: vigorLevel === 'low' ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                  {germination}%
                </span>
              </div>
              <div style={styles.outputItem}>
                <span style={styles.outputLabel}>Recommended Seed Rate</span>
                <span style={styles.outputVal}>{roundedSeedRate} kg/ha</span>
              </div>
              <div style={styles.outputItem}>
                <span style={styles.outputLabel}>Total Seeds Weight</span>
                <span style={{ ...styles.outputVal, color: 'var(--accent-green)', fontWeight: 800 }}>
                  {totalWeightNeeded} kg
                </span>
              </div>
              <div style={styles.outputItem}>
                <span style={styles.outputLabel}>Expected Crop Stand</span>
                <span style={styles.outputVal}>{expectedPlants.toLocaleString()} plants</span>
              </div>
            </div>

            <div style={styles.spacingSpecs}>
              <div style={styles.specRow}>
                <span>Recommended Spacing:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{spec.spacing}</span>
              </div>
              <div style={styles.specRow}>
                <span>Sowing Target Depth:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{spec.depth}</span>
              </div>
            </div>

            <div style={styles.advisoryTextBox}>
              <span style={{ color: 'var(--accent-green)', marginRight: '0.35rem' }}>📢</span>
              <span>{spec.advisory}</span>
            </div>
          </div>
        </section>

        {/* Right Side: Scan Audit Database History */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={styles.cardTitle}>
                <Database size={20} color="var(--accent-green)" /> Scan Audit Database
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={exportToCSV} style={styles.actionBtn}>
                  <FileSpreadsheet size={14} /> Export CSV
                </button>
                <button onClick={onClearHistory} style={styles.dangerBtn}>
                  <Trash2 size={14} /> Clear Log
                </button>
              </div>
            </div>
            <p style={styles.cardDesc}>Stored metadata configurations matching Table 3.1 research dataset entries.</p>
          </div>

          <div style={styles.logList}>
            {historyLogs.length === 0 ? (
              <div style={styles.emptyLogs}>
                <Sparkles size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Audit log is currently empty. Run diagnostics in the Workspace tab.</p>
              </div>
            ) : (
              historyLogs.map((log, index) => (
                <div key={index} style={styles.logCard}>
                  <div style={styles.logCardTop}>
                    <span style={styles.logId}>{log.id}</span>
                    <span style={styles.logTime}>{log.timestamp}</span>
                  </div>
                  <div style={styles.logCardBody}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={styles.logTool}>{log.toolName}</span>
                      <span style={{
                        ...styles.logMode,
                        color: log.mode.includes('Offline') ? 'var(--accent-orange)' : 'var(--accent-green)'
                      }}>{log.mode}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={styles.logClass}>{log.class}</span>
                      <span style={styles.logConfidence}>{log.confidence} Conf.</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '3rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
    flex: 1
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '1.25rem'
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '2rem',
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.5px',
    margin: 0
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
    margin: 0
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
    gap: '2rem'
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
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: 0
  },
  cardDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
    margin: 0
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  formRow: {
    display: 'flex',
    gap: '1rem'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  select: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '0.6rem 0.8rem',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer'
  },
  input: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '0.6rem 0.8rem',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none'
  },
  vigorButtonGroup: {
    display: 'flex',
    gap: '0.5rem'
  },
  vigorBtn: {
    flex: 1,
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'var(--text-muted)',
    padding: '0.6rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  vigorBtnActive: {
    background: 'rgba(103, 194, 58, 0.12)',
    borderColor: 'var(--accent-green)',
    color: '#fff'
  },
  vigorBtnLow: {
    background: 'rgba(230, 162, 60, 0.12)',
    borderColor: 'var(--accent-orange)',
    color: '#fff'
  },
  warningBox: {
    background: 'rgba(230, 162, 60, 0.05)',
    border: '1px solid rgba(230, 162, 60, 0.15)',
    borderRadius: '10px',
    padding: '0.85rem',
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'flex-start'
  },
  outputBox: {
    background: 'rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '1.25rem',
    marginTop: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  outputTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: 0
  },
  outputGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem'
  },
  outputItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem'
  },
  outputLabel: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)'
  },
  outputVal: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#fff'
  },
  spacingSpecs: {
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '0.85rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  },
  specRow: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  advisoryTextBox: {
    background: 'rgba(103, 194, 58, 0.02)',
    border: '1px solid rgba(103, 194, 58, 0.05)',
    borderRadius: '8px',
    padding: '0.75rem',
    fontSize: '0.8rem',
    lineHeight: 1.4,
    color: 'var(--text-main)',
    display: 'flex',
    alignItems: 'flex-start'
  },
  actionBtn: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    padding: '0.4rem 0.65rem',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    transition: 'all 0.2s ease'
  },
  dangerBtn: {
    background: 'rgba(245, 108, 108, 0.1)',
    border: '1px solid rgba(245, 108, 108, 0.2)',
    borderRadius: '6px',
    padding: '0.4rem 0.65rem',
    color: '#f56c6c',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    transition: 'all 0.2s ease'
  },
  logList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    maxHeight: '450px',
    overflowY: 'auto',
    paddingRight: '0.25rem'
  },
  emptyLogs: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 1rem',
    border: '1px dashed rgba(255,255,255,0.05)',
    borderRadius: '12px',
    color: 'var(--text-muted)',
    textAlign: 'center'
  },
  logCard: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '0.85rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  logCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.72rem'
  },
  logId: {
    color: 'var(--accent-green)',
    fontWeight: 700
  },
  logTime: {
    color: 'var(--text-muted)'
  },
  logCardBody: {
    display: 'flex',
    flexDirection: 'column'
  },
  logTool: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#fff'
  },
  logMode: {
    fontSize: '0.72rem',
    fontWeight: 600
  },
  logClass: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  },
  logConfidence: {
    fontSize: '0.8rem',
    color: '#fff',
    fontWeight: 600
  }
};
