import React, { useState } from 'react';
import { 
  Calculator, Settings, ShieldAlert, Compass, ExternalLink, 
  RefreshCw, Layers, CheckCircle2, Copy, FileText, HelpCircle, 
  Activity, Wrench, Shield, Link, HelpCircle as HelpIcon, Play,
  Wind, CircleDot, Database, Bookmark, AlertTriangle
} from 'lucide-react';

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState('calculators'); // 'calculators' | 'info' | 'shortcuts'
  const [activeCalc, setActiveCalc] = useState('gear'); // 'gear' | 'belt-chain' | 'pneumatics' | 'flywheel' | 'arm-elevator' | 'motor-playground'

  // --- 1. Gear Ratio Calculator State ---
  const [gearDriver, setGearDriver] = useState(12);
  const [gearDriven, setGearDriven] = useState(36);
  const [motorRpm, setMotorRpm] = useState(6000);
  const [motorTorque, setMotorTorque] = useState(3.8); // N.m

  // --- 2. Belt & Chain Calculator State ---
  const [pitch, setPitch] = useState(5); // mm (5mm HTD is FRC standard)
  const [teeth1, setTeeth1] = useState(18);
  const [teeth2, setTeeth2] = useState(30);
  const [desiredCenter, setDesiredCenter] = useState(150); // mm

  // --- 3. Pneumatics Calculator State ---
  const [boreSize, setBoreSize] = useState(1.0625); // inches (standard 1-1/16")
  const [pressure, setPressure] = useState(60); // PSI (FRC working limit)
  const [rodSize, setRodSize] = useState(0.3125); // inches (standard 5/16")

  // --- 4. Flywheel Calculator State ---
  const [wheelDiam, setWheelDiam] = useState(4); // inches (standard 4" wheel)
  const [flywheelRpm, setFlywheelRpm] = useState(5000);
  const [compressionRatio, setCompressionRatio] = useState(0.85); // 15% compression

  // --- 5. Arm & Elevator Calculator State ---
  const [mechType, setMechType] = useState('elevator'); // 'arm' | 'elevator'
  const [weight, setWeight] = useState(15); // kg (standard robot mechanism weight)
  const [armLength, setArmLength] = useState(0.6); // meters (or drum radius for elevator)
  const [elevatorRadius, setElevatorRadius] = useState(25); // mm
  const [mechReduction, setMechReduction] = useState(15); // overall gear reduction ratio
  const [selectedMotorType, setSelectedMotorType] = useState('kraken');

  // --- 6. Motor Playground State ---
  const [playMotorA, setPlayMotorA] = useState('kraken');
  const [playMotorB, setPlayMotorB] = useState('neo');

  // Unit Converter State (Separate tab helper)
  const [inchVal, setInchVal] = useState(1);
  const [mmVal, setMmVal] = useState(25.4);
  const [ozInVal, setOzInVal] = useState(13.88);
  const [kgCmVal, setKgCmVal] = useState(1);
  const [nmVal, setNmVal] = useState(0.098);

  const [copiedLink, setCopiedLink] = useState(null);

  // Copy helper
  const triggerCopy = (url, name) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(name);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Motors Database FRC
  const motorsDb = {
    neo: {
      name: 'REV NEO Brushless',
      freeSpeed: 5676, // RPM
      stallTorque: 3.36, // N.m
      stallCurrent: 105, // A
      kt: 0.075, // N.m/A
      peakPower: 406, // W
      notes: 'Moteur polyvalent standard économique REV.',
      color: '#ffa500'
    },
    neo550: {
      name: 'REV NEO 550',
      freeSpeed: 11000, // RPM
      stallTorque: 0.97, // N.m
      stallCurrent: 100, // A
      kt: 0.022, // N.m/A
      peakPower: 278, // W
      notes: 'Compact, idéal pour admissions (intakes) et petits sous-systèmes.',
      color: '#38bdf8'
    },
    kraken: {
      name: 'WCP Kraken X60',
      freeSpeed: 6000, // RPM
      stallTorque: 9.37, // N.m
      stallCurrent: 366, // A
      kt: 0.095, // N.m/A (3.8 Nm real @ 40A FRC breaker limit)
      peakPower: 1102, // W
      notes: 'Le standard absolu de puissance FRC. Rendement exceptionnel.',
      color: '#cf2737'
    },
    falcon: {
      name: 'VEX Falcon 500',
      freeSpeed: 6380, // RPM
      stallTorque: 4.69, // N.m
      stallCurrent: 257, // A
      kt: 0.082, // N.m/A (3.2 Nm @ 40A limit)
      peakPower: 783, // W
      notes: 'Prédécesseur du Kraken, moteur brushless historique FRC.',
      color: '#06b6d4'
    }
  };

  // --- CALCULATION FORMULAS ---

  // 1. Gear Ratio outputs
  const gearRatio = gearDriven > 0 && gearDriver > 0 ? (gearDriven / gearDriver).toFixed(2) : 0;
  const drivenRpm = gearRatio > 0 ? (motorRpm / gearRatio).toFixed(0) : 0;
  const drivenTorque = gearRatio > 0 ? (motorTorque * gearRatio).toFixed(1) : 0;

  // 2. Belt & Chain outputs
  const calcBeltTeeth = () => {
    // Standard FRC belt length formula
    const C = desiredCenter;
    const D = (pitch * teeth2) / Math.PI;
    const d = (pitch * teeth1) / Math.PI;
    const term1 = 2 * C;
    const term2 = (Math.PI / 2) * (D + d);
    const term3 = Math.pow(D - d, 2) / (4 * C);
    const totalLengthMm = term1 + term2 + term3;
    const calculatedTeeth = totalLengthMm / pitch;
    return {
      length: totalLengthMm.toFixed(1),
      teeth: Math.round(calculatedTeeth)
    };
  };
  const beltResults = calcBeltTeeth();

  // Exact center distance based on actual rounded belt teeth
  const getExactCenter = (actualTeeth) => {
    const L = actualTeeth * pitch;
    const D = (pitch * teeth2) / Math.PI;
    const d = (pitch * teeth1) / Math.PI;
    const b = 2 * L - Math.PI * (D + d);
    const rad = Math.pow(b, 2) - 8 * Math.pow(D - d, 2);
    if (rad < 0) return 0;
    const C = (b + Math.sqrt(rad)) / 8;
    return C.toFixed(2);
  };
  const exactCenter = getExactCenter(beltResults.teeth);

  // 3. Pneumatics outputs
  const calcPneumaticsForce = () => {
    const psiVal = parseFloat(pressure) || 0;
    const areaExt = Math.PI * Math.pow(parseFloat(boreSize) / 2, 2);
    const areaRet = areaExt - (Math.PI * Math.pow(parseFloat(rodSize) / 2, 2));
    
    // Force in lbs, then converted to kg-force (1 lb = 0.453592 kg)
    const forceExtLbs = areaExt * psiVal;
    const forceRetLbs = areaRet * psiVal;
    return {
      extLbs: forceExtLbs.toFixed(1),
      retLbs: forceRetLbs.toFixed(1),
      extKg: (forceExtLbs * 0.453592).toFixed(1),
      retKg: (forceRetLbs * 0.453592).toFixed(1)
    };
  };
  const pneuForce = calcPneumaticsForce();

  // 4. Flywheel outputs
  const calcFlywheelSurfaceSpeed = () => {
    // speed = RPM * diameter * pi / (12 * 60) in ft/s
    const rpm = parseFloat(flywheelRpm) || 0;
    const diam = parseFloat(wheelDiam) || 0;
    const surfSpeedFps = (rpm * diam * Math.PI) / 720;
    const ballExitSpeedFps = surfSpeedFps * parseFloat(compressionRatio); // approximate exit velocity under compression
    return {
      surfFps: surfSpeedFps.toFixed(1),
      surfMps: (surfSpeedFps * 0.3048).toFixed(1),
      ballFps: ballExitSpeedFps.toFixed(1),
      ballMps: (ballExitSpeedFps * 0.3048).toFixed(1)
    };
  };
  const flywheelSpeed = calcFlywheelSurfaceSpeed();

  // 5. Arm & Elevator outputs
  const calcArmElevatorLift = () => {
    const motor = motorsDb[selectedMotorType];
    const red = parseFloat(mechReduction) || 1;
    // Current limit is 40A standard FRC
    const activeMotorStallTorque = Math.min(motor.stallTorque, motor.kt * 40);
    const stallTorqueOutput = activeMotorStallTorque * red; // N.m

    let maxWeightKg = 0;
    let loadSpeedMps = 0;
    let timeSeconds = 0;

    if (mechType === 'elevator') {
      const r = (parseFloat(elevatorRadius) || 20) / 1000; // mm to meters
      // force = torque / r
      const maxForceN = stallTorqueOutput / r;
      maxWeightKg = maxForceN / 9.81;

      // Speed at 50% max speed (typical FRC loaded target)
      const drumSpeedRps = (motor.freeSpeed / 2) / red / 60;
      loadSpeedMps = drumSpeedRps * (2 * Math.PI * r);
      timeSeconds = 1.0 / loadSpeedMps; // Travel time per 1 meter
    } else {
      const len = parseFloat(armLength) || 0.5; // meters
      // torque = F * len -> F = torque / len
      const maxForceN = stallTorqueOutput / len;
      maxWeightKg = maxForceN / 9.81;

      // Loaded rotational speed (deg/s)
      const armRps = (motor.freeSpeed / 2) / red / 60;
      const degPerSec = armRps * 360;
      loadSpeedMps = degPerSec; // represent deg/s in output field
      timeSeconds = 90 / degPerSec; // time for 90 degree sweep
    }

    return {
      maxWeight: maxWeightKg.toFixed(1),
      loadedSpeed: loadSpeedMps.toFixed(1),
      time: timeSeconds.toFixed(2),
      outputTorque: stallTorqueOutput.toFixed(1)
    };
  };
  const lifterStats = calcArmElevatorLift();

  const clearanceData = [
    { size: 'M2', pitch: '0.40 mm', drillTight: '2.05 mm', drillFree: '2.20 mm', tapDrill: '1.60 mm' },
    { size: 'M2.5', pitch: '0.45 mm', drillTight: '2.55 mm', drillFree: '2.70 mm', tapDrill: '2.05 mm' },
    { size: 'M3', pitch: '0.50 mm', drillTight: '3.10 mm', drillFree: '3.30 mm', tapDrill: '2.50 mm' },
    { size: 'M4', pitch: '0.70 mm', drillTight: '4.10 mm', drillFree: '4.30 mm', tapDrill: '3.30 mm' },
    { size: 'M5', pitch: '0.80 mm', drillTight: '5.10 mm', drillFree: '5.50 mm', tapDrill: '4.20 mm' },
    { size: 'M6', pitch: '1.00 mm', drillTight: '6.10 mm', drillFree: '6.60 mm', tapDrill: '5.00 mm' },
    { size: 'M8', pitch: '1.25 mm', drillTight: '8.20 mm', drillFree: '9.00 mm', tapDrill: '6.80 mm' },
  ];

  const linksData = [
    { 
      category: "Raccourcis Officiels FRC 2026", 
      items: [
        { name: "2026 Official PDF Manual", url: "https://firstfrc.blob.core.windows.net/frc2026/Manual/2026FRCGameManual.pdf", desc: "Le manuel de jeu officiel complet en version PDF." },
        { name: "2026 Unofficial Web Manual", url: "https://frc-manual.recg.org/", desc: "Version web rapide et ergonomique du manuel, idéale pour mobile ou tablette." },
        { name: "2026 Q&A", url: "https://frc-qa.firstinspires.org/", desc: "Forum officiel des questions/réponses de règlement par les arbitres (FIRST)." }
      ]
    },
    { 
      category: "Ressources & Recherches", 
      items: [
        { name: "FRC Resources", url: "https://www.firstinspires.org/resource-library/frc/technical-resources", desc: "Bibliothèque officielle des documentations techniques et règlements de sécurité." },
        { name: "2026 Team/Event Search", url: "https://www.firstinspires.org/team-event-search", desc: "Recherchez des équipes, des compétitions et des résultats en direct." },
        { name: "2026 FRC-Events", url: "https://frc-events.firstinspires.org/", desc: "Portail officiel de classement mondial et statistiques des matches en cours." }
      ]
    },
    { 
      category: "Communauté & Conception", 
      items: [
        { name: "Open Alliance", url: "https://www.theopenalliance.com/", desc: "Alliance d'équipes partageant leurs conceptions CAD (Onshape) et codes en temps réel tout au long de la saison." },
        { name: "Chief Delphi Forum", url: "https://www.chiefdelphi.com/", desc: "Le forum communautaire mondial de discussion technique et stratégique FRC." },
        { name: "ReCalc Original Web", url: "https://recalc.apetech.co/", desc: "L'outil web de référence d'analyse des mécanismes de transmission FRC." }
      ]
    }
  ];

  return (
    <div style={styles.container}>
      {/* Header Banner */}
      <div style={styles.header}>
        <div style={styles.headerTitleGroup}>
          <Calculator size={26} style={{ color: 'var(--brand-red)' }} />
          <h2 style={styles.headerTitle}>STAN ReCalc & FRC Resources</h2>
        </div>
        <p style={styles.headerSubtitle}>
          Centre mécatronique et calculateurs de référence FRC pour le club **STAN ROBOTIX**.
        </p>
      </div>

      {/* Primary Category Selector Tabs */}
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
          <Settings size={16} /> FRC Calculators Hub
        </button>
        <button 
          onClick={() => setActiveTab('info')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'info' ? '3px solid var(--brand-red)' : '3px solid transparent',
            color: activeTab === 'info' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activeTab === 'info' ? '600' : '500'
          }}
        >
          <Database size={16} /> Information & Playgrounds
        </button>
        <button 
          onClick={() => setActiveTab('shortcuts')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'shortcuts' ? '3px solid var(--brand-red)' : '3px solid transparent',
            color: activeTab === 'shortcuts' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activeTab === 'shortcuts' ? '600' : '500'
          }}
        >
          <Bookmark size={16} /> Shortcuts & 2026 Manuals
        </button>
      </div>

      {/* Main Workspace Frame */}
      <div style={styles.contentBody}>

        {/* TAB 1: ALL FRC CALCULATORS */}
        {activeTab === 'calculators' && (
          <div style={styles.calcLayout}>
            {/* Sidebar with all FRC Calculators */}
            <div style={styles.calcSidebar}>
              <button 
                onClick={() => setActiveCalc('gear')}
                style={{
                  ...styles.calcSidebarBtn,
                  backgroundColor: activeCalc === 'gear' ? 'var(--brand-red-alpha-10)' : 'transparent',
                  color: activeCalc === 'gear' ? 'var(--brand-red)' : 'var(--text-main)',
                  borderLeft: activeCalc === 'gear' ? '3px solid var(--brand-red)' : '3px solid transparent',
                  fontWeight: activeCalc === 'gear' ? '600' : '500'
                }}
              >
                <Layers size={14} /> Gear Ratio & Reductions
              </button>
              <button 
                onClick={() => setActiveCalc('belt-chain')}
                style={{
                  ...styles.calcSidebarBtn,
                  backgroundColor: activeCalc === 'belt-chain' ? 'var(--brand-red-alpha-10)' : 'transparent',
                  color: activeCalc === 'belt-chain' ? 'var(--brand-red)' : 'var(--text-main)',
                  borderLeft: activeCalc === 'belt-chain' ? '3px solid var(--brand-red)' : '3px solid transparent',
                  fontWeight: activeCalc === 'belt-chain' ? '600' : '500'
                }}
              >
                <Wrench size={14} /> Belt & Chain Calculator
              </button>
              <button 
                onClick={() => setActiveCalc('pneumatics')}
                style={{
                  ...styles.calcSidebarBtn,
                  backgroundColor: activeCalc === 'pneumatics' ? 'var(--brand-red-alpha-10)' : 'transparent',
                  color: activeCalc === 'pneumatics' ? 'var(--brand-red)' : 'var(--text-main)',
                  borderLeft: activeCalc === 'pneumatics' ? '3px solid var(--brand-red)' : '3px solid transparent',
                  fontWeight: activeCalc === 'pneumatics' ? '600' : '500'
                }}
              >
                <Wind size={14} /> Pneumatics Force
              </button>
              <button 
                onClick={() => setActiveCalc('flywheel')}
                style={{
                  ...styles.calcSidebarBtn,
                  backgroundColor: activeCalc === 'flywheel' ? 'var(--brand-red-alpha-10)' : 'transparent',
                  color: activeCalc === 'flywheel' ? 'var(--brand-red)' : 'var(--text-main)',
                  borderLeft: activeCalc === 'flywheel' ? '3px solid var(--brand-red)' : '3px solid transparent',
                  fontWeight: activeCalc === 'flywheel' ? '600' : '500'
                }}
              >
                <CircleDot size={14} /> Flywheel / Shooter
              </button>
              <button 
                onClick={() => setActiveCalc('arm-elevator')}
                style={{
                  ...styles.calcSidebarBtn,
                  backgroundColor: activeCalc === 'arm-elevator' ? 'var(--brand-red-alpha-10)' : 'transparent',
                  color: activeCalc === 'arm-elevator' ? 'var(--brand-red)' : 'var(--text-main)',
                  borderLeft: activeCalc === 'arm-elevator' ? '3px solid var(--brand-red)' : '3px solid transparent',
                  fontWeight: activeCalc === 'arm-elevator' ? '600' : '500'
                }}
              >
                <Activity size={14} /> Arm & Elevator Loads
              </button>
            </div>

            {/* Inner Dashboard Canvas */}
            <div className="glass-panel animate-fade" style={styles.calcWorkspaceCard}>

              {/* 1. GEAR RATIO CALCULATOR */}
              {activeCalc === 'gear' && (
                <div style={styles.calcFlex}>
                  <div style={styles.calcInputs}>
                    <h3 style={styles.calcTitle}>Ratio & Reductions Simple</h3>
                    <p style={styles.calcDesc}>Estimez la vitesse et le couple en sortie d'un train d'engrenage simple pour vos configurations mécatroniques.</p>
                    <div style={styles.inputGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Pignon Menant (N1)</label>
                        <input type="number" value={gearDriver} onChange={(e) => setGearDriver(Math.max(1, parseInt(e.target.value) || 1))} style={styles.input} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Pignon Mené (N2)</label>
                        <input type="number" value={gearDriven} onChange={(e) => setGearDriven(Math.max(1, parseInt(e.target.value) || 1))} style={styles.input} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Régime Moteur (RPM)</label>
                        <input type="number" value={motorRpm} onChange={(e) => setMotorRpm(Math.max(0, parseInt(e.target.value) || 0))} style={styles.input} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Couple Moteur (N.m)</label>
                        <input type="number" step="0.1" value={motorTorque} onChange={(e) => setMotorTorque(Math.max(0, parseFloat(e.target.value) || 0))} style={styles.input} />
                      </div>
                    </div>
                  </div>

                  <div style={styles.calcResults}>
                    <h4 style={styles.resultsHeading}>Résultats Démultiplication</h4>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Rapport final :</span>
                      <span style={styles.resultValue}>{gearRatio} : 1</span>
                    </div>
                    <div style={styles.resultDivider}></div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Vitesse finale :</span>
                      <span style={styles.resultValueHighlight}>{drivenRpm} RPM</span>
                    </div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Couple final théorique :</span>
                      <span style={{...styles.resultValueHighlight, color: '#10b981'}}>{drivenTorque} N.m</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. BELT & CHAIN CALCULATOR */}
              {activeCalc === 'belt-chain' && (
                <div style={styles.calcFlex}>
                  <div style={styles.calcInputs}>
                    <h3 style={styles.calcTitle}>Belt & Chain Center Distance Calculator</h3>
                    <p style={styles.calcDesc}>Trouvez le nombre exact de dents de courroie ou maillons requis en fonction du pas (pitch standard HTD 5mm) et de l'entraxe visé.</p>
                    <div style={styles.inputGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Pas / Pitch (mm)</label>
                        <select value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} style={styles.select}>
                          <option value="5">5 mm (FRC HTD standard)</option>
                          <option value="3">3 mm (REV GT2 léger)</option>
                          <option value="6.35">6.35 mm (Chaîne FRC #25)</option>
                          <option value="9.525">9.525 mm (Chaîne #35)</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Dents Poulie 1</label>
                        <input type="number" value={teeth1} onChange={(e) => setTeeth1(Math.max(1, parseInt(e.target.value) || 1))} style={styles.input} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Dents Poulie 2</label>
                        <input type="number" value={teeth2} onChange={(e) => setTeeth2(Math.max(1, parseInt(e.target.value) || 1))} style={styles.input} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Entraxe Visé / Desired Center (mm)</label>
                        <input type="number" value={desiredCenter} onChange={(e) => setDesiredCenter(Math.max(10, parseFloat(e.target.value) || 10))} style={styles.input} />
                      </div>
                    </div>
                  </div>

                  <div style={styles.calcResults}>
                    <h4 style={styles.resultsHeading}>Spécifications Courroie/Chaîne</h4>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Longueur totale estimée :</span>
                      <span style={styles.resultValue}>{beltResults.length} mm</span>
                    </div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Maillons / Dents arrondis :</span>
                      <span style={{...styles.resultValueHighlight, color: 'var(--brand-red)'}}>{beltResults.teeth} dents</span>
                    </div>
                    <div style={styles.resultDivider}></div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Entraxe exact calculé :</span>
                      <span style={{...styles.resultValueHighlight, color: '#10b981'}}>{exactCenter} mm</span>
                    </div>
                    <span style={styles.currentLimitHelpText}>
                      * Note : Prévoyez toujours une tolérance d'installation de +0.05 mm à +0.1 mm en fabrication CNC/Laser pour garantir la tension parfaite de la courroie sans ajouter de tendeur.
                    </span>
                  </div>
                </div>
              )}

              {/* 3. PNEUMATICS FORCE CALCULATOR */}
              {activeCalc === 'pneumatics' && (
                <div style={styles.calcFlex}>
                  <div style={styles.calcInputs}>
                    <h3 style={styles.calcTitle}>Calculateur de Force Vérin Pneumatique</h3>
                    <p style={styles.calcDesc}>Estimez la force mécanique exercée par vos pistons pneumatiques en extension et en rétraction (en tenant compte du diamètre de la tige).</p>
                    <div style={styles.inputGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Bore / Diamètre Piston (pouces)</label>
                        <select value={boreSize} onChange={(e) => setBoreSize(parseFloat(e.target.value))} style={styles.select}>
                          <option value="0.75">0.75" (3/4 pouce)</option>
                          <option value="1.0625">1.0625" (1-1/16 pouce - FRC standard)</option>
                          <option value="1.5">1.5" (1-1/2 pouce)</option>
                          <option value="2.0">2.0" (2 pouces)</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Tige / Rod Diameter (pouces)</label>
                        <select value={rodSize} onChange={(e) => setRodSize(parseFloat(e.target.value))} style={styles.select}>
                          <option value="0.25">0.25" (1/4 pouce)</option>
                          <option value="0.3125">0.3125" (5/16 pouce)</option>
                          <option value="0.5">0.5" (1/2 pouce)</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Pression de Travail (PSI)</label>
                        <input type="number" value={pressure} onChange={(e) => setPressure(Math.max(0, parseInt(e.target.value) || 0))} style={styles.input} />
                      </div>
                    </div>
                  </div>

                  <div style={styles.calcResults}>
                    <h4 style={styles.resultsHeading}>Force de Poussée</h4>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Extension (Pousser) :</span>
                      <span style={styles.resultValueHighlight}>{pneuForce.extKg} kg ({pneuForce.extLbs} lbs)</span>
                    </div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Rétraction (Tirer) :</span>
                      <span style={{...styles.resultValueHighlight, color: 'var(--brand-red)'}}>{pneuForce.retKg} kg ({pneuForce.retLbs} lbs)</span>
                    </div>
                    <div style={styles.resultDivider}></div>
                    <span style={styles.currentLimitHelpText}>
                      * La pression maximale de travail en FRC est limitée par le règlement officiel à 60 PSI (4.13 bars) en sortie de régulateur.
                    </span>
                  </div>
                </div>
              )}

              {/* 4. FLYWHEEL / SHOOTER CALCULATOR */}
              {activeCalc === 'flywheel' && (
                <div style={styles.calcFlex}>
                  <div style={styles.calcInputs}>
                    <h3 style={styles.calcTitle}>Flywheel / Shooter Exit Velocity</h3>
                    <p style={styles.calcDesc}>Estimez la vitesse de sortie théorique d'un projectile (Notes FRC, balles) propulsé par un volant d'inertie de lanceur.</p>
                    <div style={styles.inputGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Diamètre du volant d'inertie (pouces)</label>
                        <input type="number" step="0.5" value={wheelDiam} onChange={(e) => setWheelDiam(Math.max(0.1, parseFloat(e.target.value) || 0.1))} style={styles.input} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Régime du volant (RPM)</label>
                        <input type="number" step="100" value={flywheelRpm} onChange={(e) => setFlywheelRpm(Math.max(0, parseInt(e.target.value) || 0))} style={styles.input} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Efficacité de compression (glissement)</label>
                        <select value={compressionRatio} onChange={(e) => setCompressionRatio(parseFloat(e.target.value))} style={styles.select}>
                          <option value="1.0">100% (Prise directe parfaite, sans glissement)</option>
                          <option value="0.85">85% (Glissement de contact de compression standard)</option>
                          <option value="0.75">75% (Glissement lourd / volant léger)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={styles.calcResults}>
                    <h4 style={styles.resultsHeading}>Vélocité de Lancement</h4>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Vitesse de surface roue :</span>
                      <span style={styles.resultValue}>{flywheelSpeed.surfMps} m/s ({flywheelSpeed.surfFps} ft/s)</span>
                    </div>
                    <div style={styles.resultDivider}></div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Vitesse de sortie projectile :</span>
                      <span style={{...styles.resultValueHighlight, color: '#10b981'}}>{flywheelSpeed.ballMps} m/s</span>
                    </div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>En pieds par seconde :</span>
                      <span style={styles.resultValueHighlight}>{flywheelSpeed.ballFps} ft/s</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. ARM & ELEVATOR CALCULATOR */}
              {activeCalc === 'arm-elevator' && (
                <div style={styles.calcFlex}>
                  <div style={styles.calcInputs}>
                    <h3 style={styles.calcTitle}>Calculateur de charges Mécanismes Lourds</h3>
                    <p style={styles.calcDesc}>Vérifiez si votre réducteur offre un couple de maintien suffisant sous la limite de disjoncteur FRC de 40A.</p>
                    <div style={styles.inputGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Type de Mécanisme</label>
                        <select value={mechType} onChange={(e) => setMechType(e.target.value)} style={styles.select}>
                          <option value="elevator">Élévateur Linéaire (Spool / Poulie)</option>
                          <option value="arm">Bras Articulé (Pivot angulaire)</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Moteur associé</label>
                        <select value={selectedMotorType} onChange={(e) => setSelectedMotorType(e.target.value)} style={styles.select}>
                          <option value="kraken">Kraken X60</option>
                          <option value="neo">REV NEO</option>
                          <option value="neo550">NEO 550</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Masse en mouvement (kg)</label>
                        <input type="number" value={weight} onChange={(e) => setWeight(Math.max(1, parseFloat(e.target.value) || 1))} style={styles.input} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Démultiplication / Ratio total</label>
                        <input type="number" value={mechReduction} onChange={(e) => setMechReduction(Math.max(1, parseFloat(e.target.value) || 1))} style={styles.input} />
                      </div>
                      {mechType === 'elevator' ? (
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Rayon Enrouleur / Poulie (mm)</label>
                          <input type="number" value={elevatorRadius} onChange={(e) => setElevatorRadius(Math.max(1, parseInt(e.target.value) || 1))} style={styles.input} />
                        </div>
                      ) : (
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Longueur du Bras (mètres)</label>
                          <input type="number" step="0.1" value={armLength} onChange={(e) => setArmLength(Math.max(0.1, parseFloat(e.target.value) || 0.1))} style={styles.input} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={styles.calcResults}>
                    <h4 style={styles.resultsHeading}>Analyse Limites sous 40A</h4>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Masse de calage max (Stall Load) :</span>
                      <span style={{...styles.resultValueHighlight, color: 'var(--brand-red)'}}>{lifterStats.maxWeight} kg</span>
                    </div>
                    <div style={styles.resultDivider}></div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>{mechType === 'elevator' ? 'Vitesse de montée target :' : 'Vitesse angulaire target :'}</span>
                      <span style={styles.resultValue}>{lifterStats.loadedSpeed} {mechType === 'elevator' ? 'm/s' : '°/s'}</span>
                    </div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>{mechType === 'elevator' ? 'Temps de montée (pour 1m) :' : 'Temps de rotation (90°) :'}</span>
                      <span style={{...styles.resultValueHighlight, color: '#10b981'}}>{lifterStats.time} secondes</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 2: GENERAL REFERENCE & PLAYGROUNDS */}
        {activeTab === 'info' && (
          <div style={styles.convertersGrid}>
            
            {/* MOTOR PLAYGROUND COMPARATOR */}
            <div className="glass-panel" style={styles.convCard}>
              <h3 style={styles.calcTitle}>Motor Playground FRC</h3>
              <p style={styles.calcDesc}>Comparez côte-à-côte les performances réelles des moteurs brushless phares de la FRC.</p>
              
              <div style={styles.playgroundSelectors}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Moteur A</label>
                  <select value={playMotorA} onChange={(e) => setPlayMotorA(e.target.value)} style={styles.select}>
                    <option value="kraken">Kraken X60</option>
                    <option value="neo">REV NEO</option>
                    <option value="neo550">NEO 550</option>
                    <option value="falcon">Falcon 500</option>
                  </select>
                </div>
                <div style={styles.playgroundVs}>VS</div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Moteur B</label>
                  <select value={playMotorB} onChange={(e) => setPlayMotorB(e.target.value)} style={styles.select}>
                    <option value="kraken">Kraken X60</option>
                    <option value="neo">REV NEO</option>
                    <option value="neo550">NEO 550</option>
                    <option value="falcon">Falcon 500</option>
                  </select>
                </div>
              </div>

              {/* Side-by-side comparison table */}
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Paramètres</th>
                      <th style={{...styles.th, color: motorsDb[playMotorA].color}}>{motorsDb[playMotorA].name}</th>
                      <th style={{...styles.th, color: motorsDb[playMotorB].color}}>{motorsDb[playMotorB].name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={styles.tr}>
                      <td style={styles.td}>Vitesse Libre (Free Speed)</td>
                      <td style={styles.td}>{motorsDb[playMotorA].freeSpeed} RPM</td>
                      <td style={styles.td}>{motorsDb[playMotorB].freeSpeed} RPM</td>
                    </tr>
                    <tr style={styles.tr}>
                      <td style={styles.td}>Couple calage max (Peak Stall)</td>
                      <td style={styles.td}>{motorsDb[playMotorA].stallTorque} N.m</td>
                      <td style={styles.td}>{motorsDb[playMotorB].stallTorque} N.m</td>
                    </tr>
                    <tr style={styles.tr}>
                      <td style={styles.td}>Constant de couple ($K_t$)</td>
                      <td style={styles.td}>{motorsDb[playMotorA].kt.toFixed(3)} N.m/A</td>
                      <td style={styles.td}>{motorsDb[playMotorB].kt.toFixed(3)} N.m/A</td>
                    </tr>
                    <tr style={styles.tr}>
                      <td style={styles.td}>Couple réel bridé (40A)</td>
                      <td style={{...styles.td, fontWeight: '700'}}>{Math.min(motorsDb[playMotorA].stallTorque, motorsDb[playMotorA].kt * 40).toFixed(2)} N.m</td>
                      <td style={{...styles.td, fontWeight: '700'}}>{Math.min(motorsDb[playMotorB].stallTorque, motorsDb[playMotorB].kt * 40).toFixed(2)} N.m</td>
                    </tr>
                    <tr style={styles.tr}>
                      <td style={styles.td}>Puissance max théorique</td>
                      <td style={styles.td}>{motorsDb[playMotorA].peakPower} W</td>
                      <td style={styles.td}>{motorsDb[playMotorB].peakPower} W</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* QUICK UNIT CONVERTERS & CLEARENCE */}
            <div className="glass-panel" style={styles.convCard}>
              <h3 style={styles.calcTitle}>Convertisseur rapide & Perçages Vis</h3>
              <p style={styles.calcDesc}>Passez instantanément du système impérial au système métrique pour vos fixations ou calculs.</p>
              
              <div style={styles.convRow}>
                <div style={styles.convInputGroup}>
                  <label style={styles.label}>Pouces (inches)</label>
                  <input type="number" value={inchVal} onChange={(e) => { const v = parseFloat(e.target.value) || 0; setInchVal(v); setMmVal(+(v * 25.4).toFixed(3)); }} style={styles.input} />
                </div>
                <div style={styles.convSeparator}>↔</div>
                <div style={styles.convInputGroup}>
                  <label style={styles.label}>Millimètres (mm)</label>
                  <input type="number" value={mmVal} onChange={(e) => { const v = parseFloat(e.target.value) || 0; setMmVal(v); setInchVal(+(v / 25.4).toFixed(3)); }} style={styles.input} />
                </div>
              </div>

              <div style={{ ...styles.tableWrapper, marginTop: '10px' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Taille</th>
                      <th style={styles.th}>Trou taraud</th>
                      <th style={styles.th}>Serré</th>
                      <th style={styles.th}>Libre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clearanceData.slice(2, 6).map((d, index) => (
                      <tr key={index} style={styles.tr}>
                        <td style={{...styles.td, fontWeight: '700'}}>{d.size}</td>
                        <td style={{...styles.td, color: 'var(--brand-red)', fontWeight: '600'}}>{d.tapDrill}</td>
                        <td style={styles.td}>{d.drillTight}</td>
                        <td style={styles.td}>{d.drillFree}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: USEFUL LINKS & SHORTCUTS */}
        {activeTab === 'shortcuts' && (
          <div style={styles.shortcutsContainer}>
            <div style={styles.warningAlert}>
              <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
              <span>
                Ces raccourcis et liens officiels de la saison FRC sont fournis comme référence pour faciliter l'accès de l'équipe lors des phases de conception (CAD) et de programmation.
              </span>
            </div>

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
    flex: 1,
    minHeight: '450px'
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
    backgroundColor: 'var(--bg-card)',
    minHeight: '400px'
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
  playgroundSelectors: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px'
  },
  playgroundVs: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--brand-red)',
    marginTop: '20px'
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
    transition: 'transform var(--transition-fast)'
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
    borderRadius: '4px'
  },
  externalLink: {
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'inline-flex'
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
  },
  shortcutsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  warningAlert: {
    padding: '12px 16px',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    borderRadius: 'var(--border-radius-md)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.85rem',
    color: '#d97706',
    lineHeight: '1.4'
  },
  currentLimitHelpText: {
    fontSize: '0.75rem',
    color: 'var(--text-light)',
    fontStyle: 'italic',
    lineHeight: '1.3',
    marginTop: '6px'
  }
};
