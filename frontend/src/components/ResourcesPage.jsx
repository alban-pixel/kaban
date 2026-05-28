import React, { useState } from 'react';
import { 
  Calculator, Settings, Zap, Compass, ExternalLink, 
  RefreshCw, Layers, CheckCircle2, Copy, FileText 
} from 'lucide-react';

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState('calculators'); // 'calculators' | 'converters' | 'links'
  const [activeCalculator, setActiveCalculator] = useState('gear'); // 'gear' | 'battery'

  // Gear Ratio State
  const [gearDriver, setGearDriver] = useState(12);
  const [gearDriven, setGearDriven] = useState(36);
  const [motorRpm, setMotorRpm] = useState(100);
  const [motorTorque, setMotorTorque] = useState(2.5); // N.m

  // Battery Life State
  const [batteryCapacity, setBatteryCapacity] = useState(2200); // mAh
  const [motorCount, setMotorCount] = useState(4);
  const [avgDraw, setAvgDraw] = useState(1.5); // A per motor
  const [auxDraw, setAuxDraw] = useState(0.5); // A total (RasPi, sensors, controller)
  const [dischargeLimit, setDischargeLimit] = useState(80); // % safe discharge

  // Unit Converter State
  const [inchVal, setInchVal] = useState(1);
  const [mmVal, setMmVal] = useState(25.4);
  const [ozInVal, setOzInVal] = useState(13.88);
  const [kgCmVal, setKgCmVal] = useState(1);
  const [nmVal, setNmVal] = useState(0.098);

  const [copiedLink, setCopiedLink] = useState(null);

  // Copy indicator helper
  const triggerCopy = (url, name) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(name);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Calculations for Gear Ratio
  const gearRatio = gearDriven > 0 && gearDriver > 0 ? (gearDriven / gearDriver).toFixed(2) : 0;
  const drivenRpm = gearRatio > 0 ? (motorRpm / gearRatio).toFixed(1) : 0;
  const drivenTorque = gearRatio > 0 ? (motorTorque * gearRatio).toFixed(2) : 0;

  // Calculations for Battery
  const totalAvgAmps = (motorCount * avgDraw) + auxDraw;
  const safeCapacityAh = (batteryCapacity / 1000) * (dischargeLimit / 100);
  const estimatedHours = totalAvgAmps > 0 ? safeCapacityAh / totalAvgAmps : 0;
  const estimatedMinutes = (estimatedHours * 60).toFixed(0);

  // Clearance guide search state
  const [clearanceSearch, setClearanceSearch] = useState('');
  const clearanceData = [
    { size: 'M2', pitch: '0.40 mm', drillTight: '2.05 mm', drillFree: '2.20 mm', tapDrill: '1.60 mm' },
    { size: 'M2.5', pitch: '0.45 mm', drillTight: '2.55 mm', drillFree: '2.70 mm', tapDrill: '2.05 mm' },
    { size: 'M3', pitch: '0.50 mm', drillTight: '3.10 mm', drillFree: '3.30 mm', tapDrill: '2.50 mm' },
    { size: 'M4', pitch: '0.70 mm', drillTight: '4.10 mm', drillFree: '4.30 mm', tapDrill: '3.30 mm' },
    { size: 'M5', pitch: '0.80 mm', drillTight: '5.10 mm', drillFree: '5.50 mm', tapDrill: '4.20 mm' },
    { size: 'M6', pitch: '1.00 mm', drillTight: '6.10 mm', drillFree: '6.60 mm', tapDrill: '5.00 mm' },
    { size: 'M8', pitch: '1.25 mm', drillTight: '8.20 mm', drillFree: '9.00 mm', tapDrill: '6.80 mm' },
  ];

  const filteredClearance = clearanceData.filter(d => 
    d.size.toLowerCase().includes(clearanceSearch.toLowerCase())
  );

  const linksData = [
    { 
      category: 'Documentation & Règles', 
      items: [
        { name: 'FRC WPILib Docs', url: 'https://docs.wpilib.org/en/stable/', desc: 'La bible absolue de programmation pour robots de compétition FRC (C++, Java, Python).' },
        { name: 'Rules FTC (First Tech Challenge)', url: 'https://www.firstinspires.org/resource-library/ftc/game-manuals', desc: 'Règlements officiels, spécifications des moteurs et guides d\'inspection de conformité technique.' },
        { name: 'GitHub STAN ROBOTIX', url: 'https://github.com/alban-pixel', desc: 'Dépôts collaboratifs de notre club pour les designs de cartes et softwares embarqués.' }
      ]
    },
    { 
      category: 'Modélisation CAD & Pièces', 
      items: [
        { name: 'GrabCAD Community', url: 'https://grabcad.com/library', desc: 'Base de données géante de pièces en 3D CAD gratuites et assemblages mécatroniques.' },
        { name: 'McMaster-Carr Catalog', url: 'https://www.mcmaster.com/', desc: 'Trouvez tous les modèles CAO 3D précis d\'engrenages, roulements, vis et connecteurs pour l\'intégration.' },
        { name: 'Onshape Education', url: 'https://www.onshape.com/fr/', desc: 'Plateforme CAD cloud de modélisation collaborative en temps réel.' }
      ]
    },
    { 
      category: 'Électronique & Embarqué', 
      items: [
        { name: 'Raspberry Pi Standard Pinout', url: 'https://pinout.xyz/', desc: 'Plan détaillé interactif des GPIOs, bus I2C, SPI et UART de toutes les versions de RasPi.' },
        { name: 'Arduino Language Reference', url: 'https://www.arduino.cc/reference/en/', desc: 'Documentation officielle pour le codage rapide de microcontrôleurs embarqués et de drivers de moteurs.' },
        { name: 'Pololu Robotics Power Specs', url: 'https://www.pololu.com/', desc: 'Fiches et calculateurs de couples pour motoréducteurs de précision.' }
      ]
    }
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitleGroup}>
          <Calculator size={24} style={{ color: 'var(--brand-red)' }} />
          <h2 style={styles.headerTitle}>Ressources Utiles & Calculateurs</h2>
        </div>
        <p style={styles.headerSubtitle}>
          Boîte à outils de conception et de calcul robotique pour le club <strong>STAN ROBOTIX</strong>.
        </p>
      </div>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button 
          onClick={() => setActiveTab('calculators')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'calculators' ? '3px solid var(--brand-red)' : '3px solid transparent',
            color: activeTab === 'calculators' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activeTab === 'calculators' ? '600' : '500'
          }}
        >
          <Settings size={16} /> Calculateurs Mécaniques
        </button>
        <button 
          onClick={() => setActiveTab('converters')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'converters' ? '3px solid var(--brand-red)' : '3px solid transparent',
            color: activeTab === 'converters' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activeTab === 'converters' ? '600' : '500'
          }}
        >
          <RefreshCw size={16} /> Convertisseurs & Tolérances
        </button>
        <button 
          onClick={() => setActiveTab('links')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'links' ? '3px solid var(--brand-red)' : '3px solid transparent',
            color: activeTab === 'links' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activeTab === 'links' ? '600' : '500'
          }}
        >
          <Compass size={16} /> Liens & Documentation
        </button>
      </div>

      {/* Main Workspace */}
      <div style={styles.contentBody}>
        
        {/* TAB 1: CALCULATORS */}
        {activeTab === 'calculators' && (
          <div style={styles.calcLayout}>
            {/* Left Nav for Calculators */}
            <div style={styles.calcSidebar}>
              <button 
                onClick={() => setActiveCalculator('gear')}
                style={{
                  ...styles.calcSidebarBtn,
                  backgroundColor: activeCalculator === 'gear' ? 'var(--brand-red-alpha-10)' : 'transparent',
                  color: activeCalculator === 'gear' ? 'var(--brand-red)' : 'var(--text-main)',
                  fontWeight: activeCalculator === 'gear' ? '600' : '500',
                  borderLeft: activeCalculator === 'gear' ? '3px solid var(--brand-red)' : '3px solid transparent'
                }}
              >
                <Layers size={16} /> Rapport d'Engrenages
              </button>
              <button 
                onClick={() => setActiveCalculator('battery')}
                style={{
                  ...styles.calcSidebarBtn,
                  backgroundColor: activeCalculator === 'battery' ? 'var(--brand-red-alpha-10)' : 'transparent',
                  color: activeCalculator === 'battery' ? 'var(--brand-red)' : 'var(--text-main)',
                  fontWeight: activeCalculator === 'battery' ? '600' : '500',
                  borderLeft: activeCalculator === 'battery' ? '3px solid var(--brand-red)' : '3px solid transparent'
                }}
              >
                <Zap size={16} /> Autonomie Batterie & Courant
              </button>
            </div>

            {/* Calculator Card Workspace */}
            <div className="glass-panel" style={styles.calcWorkspaceCard}>
              
              {/* 1.1 Gear Ratio Calculator */}
              {activeCalculator === 'gear' && (
                <div style={styles.calcFlex}>
                  <div style={styles.calcInputs}>
                    <h3 style={styles.calcTitle}>Calculateur de Rapport d'Engrenages</h3>
                    <p style={styles.calcDesc}>Calculez le ratio, le couple démultiplié et la vitesse de sortie d'un train d'engrenage simple.</p>
                    
                    <div style={styles.inputGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Dents Pignon Moteur (N1 - Menant)</label>
                        <input 
                          type="number" 
                          value={gearDriver} 
                          onChange={(e) => setGearDriver(Math.max(1, parseInt(e.target.value) || 1))}
                          style={styles.input} 
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Dents Roue de Sortie (N2 - Mené)</label>
                        <input 
                          type="number" 
                          value={gearDriven} 
                          onChange={(e) => setGearDriven(Math.max(1, parseInt(e.target.value) || 1))}
                          style={styles.input} 
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Vitesse du Moteur (RPM)</label>
                        <input 
                          type="number" 
                          value={motorRpm} 
                          onChange={(e) => setMotorRpm(Math.max(0, parseFloat(e.target.value) || 0))}
                          style={styles.input} 
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Couple du Moteur (N.m)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={motorTorque} 
                          onChange={(e) => setMotorTorque(Math.max(0, parseFloat(e.target.value) || 0))}
                          style={styles.input} 
                        />
                      </div>
                    </div>
                  </div>

                  <div style={styles.calcResults}>
                    <h4 style={styles.resultsHeading}>Résultats Estimés</h4>
                    
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Rapport d'engrenage global :</span>
                      <span style={styles.resultValue}>{gearRatio} : 1</span>
                    </div>

                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Réduction mécanique :</span>
                      <span style={{
                        ...styles.resultValueBadge,
                        backgroundColor: parseFloat(gearRatio) >= 1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: parseFloat(gearRatio) >= 1 ? '#10b981' : '#ef4444'
                      }}>
                        {parseFloat(gearRatio) >= 1 ? 'Démultiplication (Force)' : 'Multiplication (Vitesse)'}
                      </span>
                    </div>

                    <div style={styles.resultDivider}></div>

                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Vitesse de sortie finale :</span>
                      <span style={styles.resultValueHighlight}>{drivenRpm} RPM</span>
                    </div>

                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Couple de sortie final :</span>
                      <span style={styles.resultValueHighlight}>{drivenTorque} N.m</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 1.2 Battery Draw Calculator */}
              {activeCalculator === 'battery' && (
                <div style={styles.calcFlex}>
                  <div style={styles.calcInputs}>
                    <h3 style={styles.calcTitle}>Calculateur d'Autonomie & Capacité</h3>
                    <p style={styles.calcDesc}>Estimez l'autonomie utile de votre robot en fonction de la capacité de votre LiPo/NiMH et du courant consommé.</p>
                    
                    <div style={styles.inputGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Capacité Batterie (mAh)</label>
                        <input 
                          type="number" 
                          step="100"
                          value={batteryCapacity} 
                          onChange={(e) => setBatteryCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                          style={styles.input} 
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Nombre de Moteurs Actifs</label>
                        <input 
                          type="number" 
                          value={motorCount} 
                          onChange={(e) => setMotorCount(Math.max(0, parseInt(e.target.value) || 0))}
                          style={styles.input} 
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Courant Moyen par Moteur (Amps)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={avgDraw} 
                          onChange={(e) => setAvgDraw(Math.max(0, parseFloat(e.target.value) || 0))}
                          style={styles.input} 
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Courant Auxiliaire Total (Raspberry/Lidar - Amps)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={auxDraw} 
                          onChange={(e) => setAuxDraw(Math.max(0, parseFloat(e.target.value) || 0))}
                          style={styles.input} 
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Seuil de Décharge de Sécurité (%)</label>
                        <select 
                          value={dischargeLimit}
                          onChange={(e) => setDischargeLimit(parseInt(e.target.value))}
                          style={styles.select}
                        >
                          <option value="50">50% (Très Conservateur LiPo)</option>
                          <option value="80">80% (Conseillé LiPo/LiFe)</option>
                          <option value="90">90% (NiMH standard)</option>
                          <option value="100">100% (Décharge totale à éviter)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={styles.calcResults}>
                    <h4 style={styles.resultsHeading}>Résultats Estimés</h4>
                    
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Courant total consommé :</span>
                      <span style={styles.resultValue}>{totalAvgAmps.toFixed(2)} A</span>
                    </div>

                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Capacité utile disponible :</span>
                      <span style={styles.resultValue}>{safeCapacityAh.toFixed(2)} Ah</span>
                    </div>

                    <div style={styles.resultDivider}></div>

                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Autonomie Estimée en Charge :</span>
                      <span style={{...styles.resultValueHighlight, color: 'var(--brand-red)'}}>{estimatedMinutes} Minutes</span>
                    </div>

                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Durée de fonctionnement :</span>
                      <span style={styles.resultValue}>~ {(estimatedMinutes / 60).toFixed(1)} heure(s)</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 2: CONVERTERS & CLEARANCES */}
        {activeTab === 'converters' && (
          <div style={styles.convertersGrid}>
            
            {/* Quick Conversion Cards */}
            <div className="glass-panel" style={styles.convCard}>
              <h3 style={styles.calcTitle}>Convertisseur d'unités de mesures</h3>
              <p style={styles.calcDesc}>Passez instantanément du système impérial au système métrique pour vos fixations ou calculs de moteurs.</p>
              
              <div style={styles.convRow}>
                <div style={styles.convInputGroup}>
                  <label style={styles.label}>Pouces (inches)</label>
                  <input 
                    type="number" 
                    value={inchVal} 
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      setInchVal(v);
                      setMmVal(+(v * 25.4).toFixed(4));
                    }}
                    style={styles.input} 
                  />
                </div>
                <div style={styles.convSeparator}>↔</div>
                <div style={styles.convInputGroup}>
                  <label style={styles.label}>Millimètres (mm)</label>
                  <input 
                    type="number" 
                    value={mmVal} 
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      setMmVal(v);
                      setInchVal(+(v / 25.4).toFixed(4));
                    }}
                    style={styles.input} 
                  />
                </div>
              </div>

              <div style={styles.convDivider}></div>

              <div style={styles.convRow}>
                <div style={styles.convInputGroup}>
                  <label style={styles.label}>Couple oz-in</label>
                  <input 
                    type="number" 
                    value={ozInVal} 
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      setOzInVal(v);
                      setKgCmVal(+(v * 0.072007).toFixed(4));
                      setNmVal(+(v * 0.007062).toFixed(4));
                    }}
                    style={styles.input} 
                  />
                </div>
                <div style={styles.convSeparator}>↔</div>
                <div style={styles.convInputGroup}>
                  <label style={styles.label}>Couple kg-cm</label>
                  <input 
                    type="number" 
                    value={kgCmVal} 
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      setKgCmVal(v);
                      setOzInVal(+(v / 0.072007).toFixed(2));
                      setNmVal(+(v * 0.0980665).toFixed(4));
                    }}
                    style={styles.input} 
                  />
                </div>
                <div style={styles.convSeparator}>↔</div>
                <div style={styles.convInputGroup}>
                  <label style={styles.label}>Couple N.m</label>
                  <input 
                    type="number" 
                    value={nmVal} 
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      setNmVal(v);
                      setOzInVal(+(v / 0.007062).toFixed(2));
                      setKgCmVal(+(v / 0.0980665).toFixed(2));
                    }}
                    style={styles.input} 
                  />
                </div>
              </div>
            </div>

            {/* Clearance & Tap Drill Table */}
            <div className="glass-panel" style={styles.convCard}>
              <div style={styles.convCardHeader}>
                <h3 style={styles.calcTitle}>Tolérances & Perçages Vis Métriques</h3>
                <input 
                  type="text"
                  placeholder="Filtrer (ex: M3)..."
                  value={clearanceSearch}
                  onChange={(e) => setClearanceSearch(e.target.value)}
                  style={styles.tableSearchInput}
                />
              </div>
              <p style={styles.calcDesc}>Renseignements de perçages pour le taraudage direct ou les trous de passage (serrés/libres).</p>
              
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Taille</th>
                      <th style={styles.th}>Pas de vis</th>
                      <th style={styles.th}>Trou taraud</th>
                      <th style={styles.th}>Passage Serré</th>
                      <th style={styles.th}>Passage Libre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClearance.map((d, index) => (
                      <tr key={index} style={{
                        ...styles.tr,
                        backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent'
                      }}>
                        <td style={{...styles.td, fontWeight: '700'}}>{d.size}</td>
                        <td style={styles.td}>{d.pitch}</td>
                        <td style={{...styles.td, color: 'var(--brand-red)', fontWeight: '600'}}>{d.tapDrill}</td>
                        <td style={styles.td}>{d.drillTight}</td>
                        <td style={styles.td}>{d.drillFree}</td>
                      </tr>
                    ))}
                    {filteredClearance.length === 0 && (
                      <tr>
                        <td colSpan="5" style={styles.tdEmpty}>Aucun résultat correspondant.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: USEFUL LINKS */}
        {activeTab === 'links' && (
          <div style={styles.linksGrid}>
            {linksData.map((category, idx) => (
              <div key={idx} className="glass-panel" style={styles.categoryCard}>
                <h3 style={styles.categoryTitle}>{category.category}</h3>
                <div style={styles.linksList}>
                  {category.items.map((link, lIdx) => (
                    <div key={lIdx} style={styles.linkItem}>
                      <div style={styles.linkHeader}>
                        <span style={styles.linkLabel}>{link.name}</span>
                        <div style={styles.linkButtons}>
                          <button 
                            onClick={() => triggerCopy(link.url, link.name)} 
                            style={styles.copyBtn}
                            title="Copier le lien"
                          >
                            {copiedLink === link.name ? (
                              <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={styles.externalLink}
                            title="Ouvrir le site"
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>
                      <p style={styles.linkDesc}>{link.desc}</p>
                      <span style={styles.linkUrlText}>{link.url}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--bg-board)',
    overflowY: 'auto',
    padding: '2rem',
    color: 'var(--text-main)'
  },
  header: {
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  headerTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    letterSpacing: '-0.3px'
  },
  headerSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)'
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    gap: '24px',
    marginBottom: '1.5rem'
  },
  tabBtn: {
    padding: '10px 4px',
    fontSize: '0.925rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all var(--transition-fast)'
  },
  contentBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  calcLayout: {
    display: 'flex',
    gap: '20px',
    flex: 1
  },
  calcSidebar: {
    width: '240px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  calcSidebarBtn: {
    padding: '12px 14px',
    fontSize: '0.875rem',
    borderRadius: 'var(--border-radius-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'left',
    transition: 'all var(--transition-fast)'
  },
  calcWorkspaceCard: {
    flex: 1,
    borderRadius: 'var(--border-radius-lg)',
    padding: '1.75rem',
    boxShadow: 'var(--shadow-md)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-card)'
  },
  calcFlex: {
    display: 'flex',
    gap: '30px',
    height: '100%',
    flexWrap: 'wrap'
  },
  calcInputs: {
    flex: 1.3,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: '300px'
  },
  calcTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'var(--text-main)'
  },
  calcDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    marginBottom: '8px'
  },
  inputGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '14px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.775rem',
    fontWeight: '600',
    color: 'var(--text-muted)'
  },
  input: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '9px 12px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.875rem',
    width: '100%'
  },
  select: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '9px 12px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  calcResults: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    minWidth: '280px',
    justifyContent: 'center'
  },
  resultsHeading: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    borderBottom: '1px dashed var(--border-color)',
    paddingBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  resultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px'
  },
  resultLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  resultValue: {
    fontSize: '0.95rem',
    fontWeight: '600'
  },
  resultValueBadge: {
    fontSize: '0.75rem',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontWeight: '700'
  },
  resultDivider: {
    borderTop: '1px solid var(--border-color)',
    margin: '4px 0'
  },
  resultValueHighlight: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'var(--brand-red)'
  },
  convertersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px'
  },
  convCard: {
    borderRadius: 'var(--border-radius-lg)',
    padding: '1.75rem',
    backgroundColor: 'var(--bg-card)',
    boxShadow: 'var(--shadow-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  convCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px'
  },
  tableSearchInput: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '6px 12px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.8rem',
    maxWidth: '180px'
  },
  convRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px'
  },
  convInputGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  convSeparator: {
    fontSize: '1.2rem',
    color: 'var(--brand-red)',
    fontWeight: '700',
    marginTop: '18px'
  },
  convDivider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '14px 0'
  },
  tableWrapper: {
    overflowX: 'auto',
    marginTop: '10px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.825rem',
    textAlign: 'left'
  },
  th: {
    padding: '10px 8px',
    color: 'var(--text-muted)',
    borderBottom: '2px solid var(--border-color)',
    fontWeight: '600'
  },
  tr: {
    borderBottom: '1px solid var(--border-color)'
  },
  td: {
    padding: '10px 8px'
  },
  tdEmpty: {
    padding: '20px 8px',
    textAlign: 'center',
    color: 'var(--text-muted)'
  },
  linksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  categoryCard: {
    borderRadius: 'var(--border-radius-lg)',
    padding: '1.5rem',
    backgroundColor: 'var(--bg-card)',
    boxShadow: 'var(--shadow-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  categoryTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--brand-red)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px'
  },
  linksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  linkItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '10px',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'transform var(--transition-fast)',
    ':hover': {
      transform: 'translateY(-1px)'
    }
  },
  linkHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px'
  },
  linkLabel: {
    fontWeight: '600',
    fontSize: '0.85rem'
  },
  linkButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  copyBtn: {
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    ':hover': {
      color: 'var(--text-main)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    }
  },
  externalLink: {
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'inline-flex',
    ':hover': {
      color: 'var(--brand-red)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    }
  },
  linkDesc: {
    fontSize: '0.775rem',
    color: 'var(--text-muted)',
    lineHeight: '1.3'
  },
  linkUrlText: {
    fontSize: '0.7rem',
    color: 'var(--brand-red)',
    opacity: 0.8,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  }
};
