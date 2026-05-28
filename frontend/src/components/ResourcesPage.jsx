import React, { useState } from 'react';
import { 
  Calculator, Settings, ShieldAlert, Compass, ExternalLink, 
  RefreshCw, Layers, CheckCircle2, Copy, FileText, HelpCircle, Activity
} from 'lucide-react';

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState('calculators'); // 'calculators' | 'converters' | 'links'
  const [activeCalculator, setActiveCalculator] = useState('gear'); // 'gear' | 'gearbox-matrix'

  // Gear Ratio State
  const [gearDriver, setGearDriver] = useState(12);
  const [gearDriven, setGearDriven] = useState(36);
  const [motorRpm, setMotorRpm] = useState(100);
  const [motorTorque, setMotorTorque] = useState(2.5); // N.m

  // FRC Gearbox Matrix State
  const [selectedMechanism, setSelectedMechanism] = useState('drivetrain');
  const [selectedMotor, setSelectedMotor] = useState('kraken');
  const [currentLimit, setCurrentLimit] = useState(40); // FRC standard current limit in Amps (default 40A)

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

  // Motors Database FRC (With real-world linear torque constants Kt verified by CTR & REV)
  const motorsDb = {
    neo: {
      name: 'REV NEO Brushless',
      freeSpeed: 5676, // RPM
      stallTorque: 3.36, // N.m (Theoretical stall)
      stallCurrent: 105, // A
      kt: 0.075, // N.m/A (Real-world linear torque constant)
      peakPower: 406, // W
      notes: 'Moteur polyvalent FRC par excellence. Fiable, bon rapport couple/vitesse.',
      color: '#ffa500'
    },
    neo550: {
      name: 'REV NEO 550',
      freeSpeed: 11000, // RPM
      stallTorque: 0.97, // N.m (Theoretical stall)
      stallCurrent: 100, // A
      kt: 0.022, // N.m/A (Real-world linear torque constant)
      peakPower: 278, // W
      notes: 'Ultra compact et léger. Vitesse très élevée mais chauffe rapidement sous forte charge. Perte de couple rapide à basse vitesse.',
      color: '#38bdf8'
    },
    kraken: {
      name: 'WCP Kraken X60',
      freeSpeed: 6000, // RPM
      stallTorque: 9.37, // N.m (Peak stall under FOC)
      stallCurrent: 366, // A (Maximum phase current)
      kt: 0.095, // N.m/A (Real-world linear torque constant, yielding ~3.8 Nm at 40A)
      peakPower: 1102, // W
      notes: 'Le monstre de puissance FRC actuel. Refroidissement intégré, couple massif, rendement exceptionnel.',
      color: '#cf2737'
    }
  };

  // FRC Mechanisms Database
  const mechanismsDb = {
    drivetrain: {
      name: 'Châssis / Base Pilotable (Drivetrain)',
      minRatio: 4.5,
      maxRatio: 8.5,
      recommendedMotor: 'kraken',
      suitability: {
        kraken: 'Recommandé (Performance maximale, forte accélération)',
        neo: 'Adapté (Choix standard et économique)',
        neo550: 'CRITIQUE (Absolument proscrit: surchauffe et casse immédiate)'
      },
      notes: 'Exige une forte accélération et une résistance aux impacts. Les modules Swerve (ex: MAXSwerve, SDS MK4i) utilisent des réductions typiques de 5.5:1 à 6.75:1.'
    },
    arm: {
      name: 'Bras Articulé / Pivot (Heavy Arm / Joint)',
      minRatio: 50.0,
      maxRatio: 150.0,
      recommendedMotor: 'kraken',
      suitability: {
        kraken: 'Idéal (Couple de maintien élevé, puissance sous contrôle)',
        neo: 'Recommandé (Très bon comportement avec un MAXPlanetary)',
        neo550: 'Déconseillé (Sauf très petits mécanismes légers)'
      },
      notes: 'Réduction massive obligatoire pour contrer la gravité et éviter le "backdrive". Ajoutez un ressort à gaz d\'équilibrage et utilisez des freins moteurs intégrés (Brake mode).'
    },
    elevator: {
      name: 'Élévateur (Elevator / Lift)',
      minRatio: 8.0,
      maxRatio: 25.0,
      recommendedMotor: 'neo',
      suitability: {
        kraken: 'Excellent (Vitesse ascensionnelle fulgurante)',
        neo: 'Recommandé (Excellent contrôle de position avec encodeur)',
        neo550: 'Risqué (Seulement sur mini-chariots ou indexeurs verticaux)'
      },
      notes: 'Attention au couple requis lors de la montée à pleine charge. L\'utilisation d\'un cliquet anti-retour ou d\'un frein pneumatique prévient la chute libre hors tension.'
    },
    shooter: {
      name: 'Lanceur / Volant d\'inertie (Shooter)',
      minRatio: 1.0,
      maxRatio: 2.0,
      recommendedMotor: 'kraken',
      suitability: {
        kraken: 'Idéal (Récupération de RPM ultra-rapide entre les tirs)',
        neo: 'Très bon (Performances classiques éprouvées)',
        neo550: 'Non adapté (Inertie thermique insuffisante)'
      },
      notes: 'Généralement configuré en prise directe (1:1) ou légère multiplication/réduction 1.5:1. Utilisez un volant d\'inertie lourd pour stabiliser la vitesse lors du passage des notes/balles.'
    },
    intake: {
      name: 'Admission / Rouleaux (Intake / Roller)',
      minRatio: 3.0,
      maxRatio: 10.0,
      recommendedMotor: 'neo550',
      suitability: {
        kraken: 'Surdimensionné (Trop lourd et puissant pour ce besoin)',
        neo: 'Excellent (Robuste et fiable)',
        neo550: 'Idéal (Léger, compact, haut régime parfait pour attraper les objets)'
      },
      notes: 'Transmettez le mouvement par courroies crantées (HTD 5mm) ou roues en polyuréthane. Permet au moteur de sauter des crans ou glisser en cas de blocage sans casser.'
    }
  };

  // Active matrix selection data
  const currentMotor = motorsDb[selectedMotor];
  const currentMechanism = mechanismsDb[selectedMechanism];

  // FRC Breaker & Software current limit physics
  // Use real linear Torque Constant (Kt) from motors database
  const kt = currentMotor.kt;
  const limitedMotorStallTorque = Math.min(currentMotor.stallTorque, kt * currentLimit);

  // Live estimated speed & torque output for selected combo
  const avgReduction = ((currentMechanism.minRatio + currentMechanism.maxRatio) / 2);
  const estOutputRpm = (currentMotor.freeSpeed / avgReduction).toFixed(0);
  const estStallTorqueTheoretical = (currentMotor.stallTorque * avgReduction).toFixed(1);
  const estStallTorqueLimited = (limitedMotorStallTorque * avgReduction).toFixed(1);

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
      category: 'Documentation & Règles FRC', 
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
          <Settings size={16} /> Calculateurs & Réductions FRC
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
                <Layers size={16} /> Rapport d'Engrenages Simple
              </button>
              <button 
                onClick={() => setActiveCalculator('gearbox-matrix')}
                style={{
                  ...styles.calcSidebarBtn,
                  backgroundColor: activeCalculator === 'gearbox-matrix' ? 'var(--brand-red-alpha-10)' : 'transparent',
                  color: activeCalculator === 'gearbox-matrix' ? 'var(--brand-red)' : 'var(--text-main)',
                  fontWeight: activeCalculator === 'gearbox-matrix' ? '600' : '500',
                  borderLeft: activeCalculator === 'gearbox-matrix' ? '3px solid var(--brand-red)' : '3px solid transparent'
                }}
              >
                <Activity size={16} /> Matrice Réductions & Moteurs FRC
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

              {/* 1.2 FRC Gearbox Matrix Chart */}
              {activeCalculator === 'gearbox-matrix' && (
                <div style={styles.calcFlex}>
                  <div style={styles.calcInputs}>
                    <h3 style={styles.calcTitle}>Matrice de Sélection Réducteurs & Moteurs FRC</h3>
                    <p style={styles.calcDesc}>
                      Sélectionnez un mécanisme de robot FRC et un moteur brushless de référence pour visualiser les réductions conseillées et les performances théoriques estimées.
                    </p>
                    
                    {/* Setup selectors */}
                    <div style={styles.inputGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>1. Choisir le Mécanisme FRC</label>
                        <select 
                          value={selectedMechanism}
                          onChange={(e) => setSelectedMechanism(e.target.value)}
                          style={styles.select}
                        >
                          <option value="drivetrain">Base Pilotable / Drivetrain</option>
                          <option value="arm">Bras Articulé / Pivot Lourd</option>
                          <option value="elevator">Élévateur / Lift</option>
                          <option value="shooter">Lanceur (Shooter)</option>
                          <option value="intake">Admission / Intake (Rouleaux)</option>
                        </select>
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>2. Choisir le Moteur FRC</label>
                        <div style={styles.motorRadioGroup}>
                          <button 
                            type="button"
                            onClick={() => setSelectedMotor('kraken')}
                            style={{
                              ...styles.motorBadgeBtn,
                              backgroundColor: selectedMotor === 'kraken' ? 'var(--brand-red-alpha-20)' : 'transparent',
                              border: selectedMotor === 'kraken' ? '1px solid var(--brand-red)' : '1px solid var(--border-color)',
                              color: selectedMotor === 'kraken' ? 'var(--brand-red)' : 'var(--text-main)'
                            }}
                          >
                            Kraken X60
                          </button>
                          <button 
                            type="button"
                            onClick={() => setSelectedMotor('neo')}
                            style={{
                              ...styles.motorBadgeBtn,
                              backgroundColor: selectedMotor === 'neo' ? 'rgba(255, 165, 0, 0.15)' : 'transparent',
                              border: selectedMotor === 'neo' ? '1px solid #ffa500' : '1px solid var(--border-color)',
                              color: selectedMotor === 'neo' ? '#ffa500' : 'var(--text-main)'
                            }}
                          >
                            NEO
                          </button>
                          <button 
                            type="button"
                            onClick={() => setSelectedMotor('neo550')}
                            style={{
                              ...styles.motorBadgeBtn,
                              backgroundColor: selectedMotor === 'neo550' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                              border: selectedMotor === 'neo550' ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                              color: selectedMotor === 'neo550' ? '#38bdf8' : 'var(--text-main)'
                            }}
                          >
                            NEO 550
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* FRC Current Limits / Breaker Config */}
                    <div style={{ ...styles.formGroup, marginTop: '8px' }}>
                      <label style={styles.label}>3. Limite d'Intensité logicielle / Disjoncteur PDP-PDH (Amps)</label>
                      <div style={styles.currentLimitInputRow}>
                        <input 
                          type="range"
                          min="10"
                          max="120"
                          step="5"
                          value={currentLimit}
                          onChange={(e) => setCurrentLimit(parseInt(e.target.value))}
                          style={styles.rangeInput}
                        />
                        <span style={styles.currentLimitBadge}>{currentLimit} A</span>
                        <button 
                          onClick={() => setCurrentLimit(40)} 
                          style={styles.resetLimitBtn}
                          title="Réinitialiser à 40A (Standard FRC)"
                        >
                          Reset FRC (40A)
                        </button>
                      </div>
                      <span style={styles.currentLimitHelpText}>
                        * Les robots FRC limitent le courant par programmation (généralement à 40A) pour préserver la batterie et éviter de déclencher les breakers thermiques.
                      </span>
                    </div>

                    {/* Compatibility Alert & Guidance */}
                    <div style={styles.suitabilityPanel}>
                      <span style={styles.suitabilityHeading}>Compatibilité Mécanique :</span>
                      <div style={{
                        ...styles.suitabilityStatus,
                        color: currentMechanism.suitability[selectedMotor].includes('CRITIQUE') || currentMechanism.suitability[selectedMotor].includes('proscrit') ? '#ef4444' :
                               currentMechanism.suitability[selectedMotor].includes('Recommandé') || currentMechanism.suitability[selectedMotor].includes('Idéal') || currentMechanism.suitability[selectedMotor].includes('Excellent') ? '#10b981' : '#f59e0b'
                      }}>
                        <ShieldAlert size={16} /> {currentMechanism.suitability[selectedMotor]}
                      </div>
                      <p style={styles.suitabilityDesc}>{currentMechanism.notes}</p>
                    </div>

                    {/* FRC Advice panel */}
                    <div style={styles.advicePanel}>
                      <h5 style={styles.adviceTitle}>Physique du Moteur sous Limite d'Intensité :</h5>
                      <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        Constante de couple ($K_t$) de ce moteur : <strong>{kt.toFixed(4)} N.m/A</strong>.<br />
                        À <strong>{currentLimit} A</strong>, le couple de calage maximal au niveau de l'arbre moteur est bridé à 
                        <strong style={{ color: 'var(--brand-red)' }}> {limitedMotorStallTorque.toFixed(2)} N.m </strong> 
                        (au lieu de {currentMotor.stallTorque} N.m en calage théorique libre sous {currentMotor.stallCurrent}A).
                      </p>
                    </div>
                  </div>

                  {/* Estimated output parameters on this mechanism */}
                  <div style={styles.calcResults}>
                    <h4 style={styles.resultsHeading}>Spécifications Réelles ({currentLimit}A)</h4>
                    
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Moteur sélectionné :</span>
                      <span style={{ ...styles.resultValue, color: currentMotor.color }}>{currentMotor.name}</span>
                    </div>

                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Vitesse à vide (Free Speed) :</span>
                      <span style={styles.resultValue}>{currentMotor.freeSpeed} RPM</span>
                    </div>

                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Couple Stall Max Théorique :</span>
                      <span style={{ ...styles.resultValue, textDecoration: 'line-through', opacity: 0.6 }}>{currentMotor.stallTorque} N.m</span>
                    </div>

                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Couple Stall Réel Bridé ({currentLimit}A) :</span>
                      <span style={{ ...styles.resultValue, color: 'var(--brand-red)', fontWeight: '700' }}>{limitedMotorStallTorque.toFixed(2)} N.m</span>
                    </div>

                    <div style={styles.resultDivider}></div>

                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Vitesse de sortie ({avgReduction.toFixed(1)}:1) :</span>
                      <span style={styles.resultValueHighlight}>{estOutputRpm} RPM</span>
                    </div>

                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Couple de calage réels à l'arbre :</span>
                      <span style={{ ...styles.resultValueHighlight, color: '#10b981' }}>{estStallTorqueLimited} N.m</span>
                    </div>

                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Couple de calage théorique libre :</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{estStallTorqueTheoretical} N.m</span>
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
    gap: '12px',
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
  motorRadioGroup: {
    display: 'flex',
    gap: '8px',
    marginTop: '2px'
  },
  motorBadgeBtn: {
    flex: 1,
    padding: '8px 4px',
    fontSize: '0.8rem',
    fontWeight: '600',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },
  currentLimitInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '4px'
  },
  rangeInput: {
    flex: 1,
    height: '6px',
    backgroundColor: 'var(--border-color)',
    borderRadius: '9999px',
    appearance: 'none',
    outline: 'none',
    cursor: 'pointer'
  },
  currentLimitBadge: {
    backgroundColor: 'var(--brand-red-alpha-20)',
    color: 'var(--brand-red)',
    fontWeight: '700',
    fontSize: '0.85rem',
    padding: '4px 10px',
    borderRadius: '9999px',
    minWidth: '50px',
    textAlign: 'center'
  },
  resetLimitBtn: {
    backgroundColor: 'var(--bg-column)',
    color: 'var(--text-main)',
    fontSize: '0.75rem',
    padding: '6px 12px',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    fontWeight: '600'
  },
  currentLimitHelpText: {
    fontSize: '0.725rem',
    color: 'var(--text-light)',
    fontStyle: 'italic'
  },
  suitabilityPanel: {
    marginTop: '10px',
    padding: '12px 14px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderLeft: '4px solid var(--brand-red)',
    borderRadius: '0 var(--border-radius-sm) var(--border-radius-sm) 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  suitabilityHeading: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase'
  },
  suitabilityStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    fontWeight: '700'
  },
  suitabilityDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.3'
  },
  advicePanel: {
    marginTop: '8px',
    padding: '12px 14px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)'
  },
  adviceTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '6px'
  },
  adviceList: {
    listStyleType: 'disc',
    paddingLeft: '18px',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
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
