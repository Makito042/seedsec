import React, { useState, useEffect } from 'react';
import { Calculator, Database, FileSpreadsheet, Trash2, ShieldAlert, Sparkles } from 'lucide-react';

interface AgroToolsProps {
  historyLogs: any[];
  onClearHistory: () => void;
  detectedVigorLevel?: 'high' | 'medium' | 'low' | null;
  detectedCropType?: string | null;
}

const CROP_SPECS = {
  maize: {
    name: 'Maize (Zea mays)',
    defaultDensity: 53333,
    seedWeight1000: 300,
    spacing: '75 cm x 25 cm',
    depth: '5.0 cm',
    purity: 98,
    advisory: 'Ensure optimal soil moisture before sowing. Apply NPK at planting and urea top-dressing at 4-6 weeks.'
  },
  tomato: {
    name: 'Tomato (Solanum lycopersicum)',
    defaultDensity: 22222,
    seedWeight1000: 3,
    spacing: '75 cm x 60 cm',
    depth: '1.5 cm',
    purity: 99,
    advisory: 'Raise in nursery beds for 4 weeks. Transplant on raised beds during cool hours. Stake plants to support fruit load.'
  },
  cabbage: {
    name: 'Cabbage (Brassica oleracea)',
    defaultDensity: 37037,
    seedWeight1000: 4,
    spacing: '60 cm x 45 cm',
    depth: '1.0 cm',
    purity: 97,
    advisory: 'Requires high nitrogen organic fertilizer. Control diamondback moths (DBM) with regular pest scouting.'
  },
  spinach: {
    name: 'Spinach (Spinacia oleracea)',
    defaultDensity: 111111,
    seedWeight1000: 10,
    spacing: '30 cm x 30 cm',
    depth: '2.0 cm',
    purity: 98,
    advisory: 'Best suited for cool environments. Keep soil consistently moist to prevent premature bolting.'
  },
  carrot: {
    name: 'Carrot (Daucus carota)',
    defaultDensity: 500000,
    seedWeight1000: 1.5,
    spacing: '20 cm x 5 cm',
    depth: '1.0 cm',
    purity: 95,
    advisory: 'Sow directly in loose, stone-free sandy soil. Thin seedlings once they reach 5 cm height. Avoid transplanting.'
  },
  chili: {
    name: 'Chili (Capsicum annuum)',
    defaultDensity: 25000,
    seedWeight1000: 5,
    spacing: '60 cm x 45 cm',
    depth: '1.5 cm',
    purity: 98,
    advisory: 'Optimal germination at 25-30°C. Keep soil warm and damp. Transplant to field after 6-8 weeks in nursery.'
  },
  onion: {
    name: 'Onion (Allium cepa)',
    defaultDensity: 400000,
    seedWeight1000: 4,
    spacing: '15 cm x 10 cm',
    depth: '1.5 cm',
    purity: 97,
    advisory: 'Raise seedlings in nursery bed for 6-8 weeks. Transplant when pencil thickness. Apply potash-rich fertilizer at bulbing stage.'
  },
  cucumber: {
    name: 'Cucumber (Cucumis sativus)',
    defaultDensity: 11111,
    seedWeight1000: 25,
    spacing: '120 cm x 60 cm',
    depth: '2.5 cm',
    purity: 98,
    advisory: 'Requires warm soil above 18°C. Train vines on trellis for better air circulation and harvest quality.'
  },
  cauliflower: {
    name: 'Cauliflower (Brassica oleracea var. botrytis)',
    defaultDensity: 27778,
    seedWeight1000: 3.5,
    spacing: '60 cm x 60 cm',
    depth: '1.0 cm',
    purity: 97,
    advisory: 'Start in seedbed and transplant after 4-6 weeks. Ensure high organic matter and consistent moisture. Blanch curds by tying leaves.'
  },
  radish: {
    name: 'Radish (Raphanus sativus)',
    defaultDensity: 333333,
    seedWeight1000: 10,
    spacing: '15 cm x 5 cm',
    depth: '1.5 cm',
    purity: 96,
    advisory: 'Fast-growing root crop (25-30 days). Sow directly in well-drained loamy soil. Avoid delays in harvesting to prevent pithy roots.'
  },
  bitter_melon: {
    name: 'Bitter Melon (Momordica charantia)',
    defaultDensity: 8333,
    seedWeight1000: 60,
    spacing: '150 cm x 80 cm',
    depth: '3.0 cm',
    purity: 95,
    advisory: 'Pre-soak seeds in warm water for 24 hours. Crack the seed coat slightly to enhance germination. Train on strong trellis system.'
  },
  bottle_gourd: {
    name: 'Bottle Gourd (Lagenaria siceraria)',
    defaultDensity: 5556,
    seedWeight1000: 120,
    spacing: '200 cm x 90 cm',
    depth: '3.5 cm',
    purity: 95,
    advisory: 'Plant in well-draining sandy loam with full sun. Keep soil moist but not waterlogged. Provide strong trellis or ground creeping space.'
  },
  coriander: {
    name: 'Coriander (Coriandrum sativum)',
    defaultDensity: 400000,
    seedWeight1000: 10,
    spacing: '20 cm x 10 cm',
    depth: '1.5 cm',
    purity: 96,
    advisory: 'Crush seeds gently before sowing to improve germination. Prefers cooler weather. Successive sowing every 3 weeks for continuous harvest.'
  },
  hyacinth_bean: {
    name: 'Hyacinth Bean (Lablab purpureus)',
    defaultDensity: 22222,
    seedWeight1000: 250,
    spacing: '75 cm x 60 cm',
    depth: '4.0 cm',
    purity: 97,
    advisory: 'Nitrogen-fixing legume that improves soil fertility. Provide trellis support. Harvest pods young for best edibility.'
  }
};

export default function AgroTools({ historyLogs, onClearHistory, detectedVigorLevel, detectedCropType }: AgroToolsProps) {
  // Calculator States
  const [cropType, setCropType] = useState<keyof typeof CROP_SPECS>('maize');
  const [vigorLevel, setVigorLevel] = useState<'high' | 'medium' | 'low'>('high');
  const [areaSize, setAreaSize] = useState<number>(1.0);
  const [areaUnit, setAreaUnit] = useState<'ha' | 'acre'>('ha');
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(false);
  const [isCropAutoDetected, setIsCropAutoDetected] = useState<boolean>(false);

  // Auto-set vigor level when scan result arrives from Workspace
  useEffect(() => {
    if (detectedVigorLevel) {
      setVigorLevel(detectedVigorLevel);
      setIsAutoDetected(true);
    }
  }, [detectedVigorLevel]);

  // Auto-set crop type when scan result arrives from Workspace
  useEffect(() => {
    if (detectedCropType && detectedCropType in CROP_SPECS) {
      setCropType(detectedCropType as keyof typeof CROP_SPECS);
      setIsCropAutoDetected(true);
    }
  }, [detectedCropType]);

  const spec = CROP_SPECS[cropType];

  // Derive Germination % based on vigor
  const getGermination = (level: 'high' | 'medium' | 'low') => {
    if (level === 'high') return 95;
    if (level === 'medium') return 80;
    return 60;
  };

  const germination = getGermination(vigorLevel);

  // Parse vigor level from a scan class string
  const parseVigorFromClass = (cls: string): 'high' | 'medium' | 'low' | null => {
    const lower = cls.toLowerCase();
    if (lower.includes('high') || lower.includes('vigor 3')) return 'high';
    if (lower.includes('medium') || lower.includes('moderate') || lower.includes('vigor 2')) return 'medium';
    if (lower.includes('low') || lower.includes('vigor 1')) return 'low';
    return null;
  };

  // Parse crop type from class or tool name
  const parseCropFromClass = (cls: string, tool: string): keyof typeof CROP_SPECS | null => {
    const lower = (cls + ' ' + tool).toLowerCase();
    if (lower.includes('maize') || lower.includes('corn') || lower.includes('defect')) return 'maize';
    if (lower.includes('tomato')) return 'tomato';
    if (lower.includes('cabbage')) return 'cabbage';
    if (lower.includes('spinach') && !lower.includes('malabar') && !lower.includes('water')) return 'spinach';
    if (lower.includes('carrot')) return 'carrot';
    if (lower.includes('chili')) return 'chili';
    if (lower.includes('onion')) return 'onion';
    if (lower.includes('cucumber')) return 'cucumber';
    if (lower.includes('cauliflower')) return 'cauliflower';
    if (lower.includes('radish')) return 'radish';
    if (lower.includes('bitter melon')) return 'bitter_melon';
    if (lower.includes('bottle gourd')) return 'bottle_gourd';
    if (lower.includes('coriander')) return 'coriander';
    if (lower.includes('hyacinth bean')) return 'hyacinth_bean';
    if (lower.includes('malabar spinach') || lower.includes('water spinach')) return 'spinach';
    return null;
  };

  const isClickableLog = (log: any) => {
    const tool = log.toolName || '';
    const cls = log.class || '';
    return (
      tool.includes('Vigor') || 
      tool.includes('Species') || 
      tool.includes('Defect') || 
      cls.toLowerCase().includes('tomato') || 
      cls.toLowerCase().includes('cabbage') || 
      cls.toLowerCase().includes('spinach') || 
      cls.toLowerCase().includes('maize')
    );
  };

  const handleLogClick = (log: any) => {
    if (!isClickableLog(log)) return;

    // Detect and apply Vigor if applicable
    const parsedVigor = parseVigorFromClass(log.class || '');
    if (parsedVigor) {
      setVigorLevel(parsedVigor);
      setIsAutoDetected(true);
    }

    // Detect and apply Crop Type
    const parsedCrop = parseCropFromClass(log.class || '', log.toolName || '');
    if (parsedCrop) {
      setCropType(parsedCrop);
      setIsCropAutoDetected(true);
    }
  };

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={styles.label}>Select Target Crop</label>
              {isCropAutoDetected && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#0b1308',
                  background: 'var(--accent-green)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  letterSpacing: '0.3px'
                }}>AUTO-DETECTED FROM SCAN</span>
              )}
            </div>
            <select 
              value={cropType} 
              onChange={(e) => { setCropType(e.target.value as any); setIsCropAutoDetected(false); }} 
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={styles.label}>Seed Vigor Quality Class</label>
              {isAutoDetected && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#0b1308',
                  background: 'var(--accent-green)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  letterSpacing: '0.3px'
                }}>AUTO-DETECTED FROM SCAN</span>
              )}
            </div>
            <div style={styles.vigorButtonGroup}>
              {['high', 'medium', 'low'].map((level) => (
                <button
                  key={level}
                  onClick={() => { setVigorLevel(level as any); setIsAutoDetected(false); }}
                  style={{
                    ...styles.vigorBtn,
                    ...(vigorLevel === level ? styles.vigorBtnActive : {}),
                    ...(level === 'low' && vigorLevel === 'low' ? styles.vigorBtnLow : {})
                  }}
                >
                  {level.toUpperCase()}
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
              historyLogs.map((log, index) => {
                const clickable = isClickableLog(log);
                return (
                  <div 
                    key={index} 
                    onClick={() => handleLogClick(log)}
                    style={{
                      ...styles.logCard,
                      cursor: clickable ? 'pointer' : 'default',
                      borderLeft: clickable ? '3px solid var(--accent-green)' : '3px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                    title={clickable ? 'Click to load this scan result into the calculator' : undefined}
                  >
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
                    {clickable && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--accent-green)', fontWeight: 600, marginTop: '-0.15rem' }}>
                        Tap to load into calculator
                      </div>
                    )}
                  </div>
                );
              })
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
    padding: 'clamp(1rem, 3vw, 3rem) clamp(0.75rem, 2vw, 1.5rem)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(1.25rem, 3vw, 2.5rem)',
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
    fontSize: 'clamp(1.3rem, 3vw, 2rem)',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
    gap: 'clamp(1rem, 2vw, 2rem)'
  },
  card: {
    background: 'rgba(22, 38, 18, 0.5)',
    backdropFilter: 'blur(12px)',
    border: '1px solid var(--surface-border)',
    borderRadius: '20px',
    padding: 'clamp(1rem, 2.5vw, 1.75rem)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    height: 'fit-content'
  },
  cardHeader: {
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '0.75rem'
  },
  cardTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
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
    margin: '0.25rem 0 0 0'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  formRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const
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
    gap: '0.4rem',
    flexWrap: 'wrap' as const
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '0.75rem'
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
