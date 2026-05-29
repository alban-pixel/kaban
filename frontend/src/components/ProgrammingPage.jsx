import React, { useState } from 'react';
import { 
  Gamepad2, Cpu, Copy, CheckCircle2, Info, Compass, ShieldAlert, Zap, Network
} from 'lucide-react';

export default function ProgrammingPage() {
  const [activeTab, setActiveTab] = useState('mapping'); // 'mapping' | 'wiring'
  const [activeController, setActiveController] = useState('xbox'); // 'xbox' | 'joystick'
  
  // Hover details state
  const [hoveredElement, setHoveredElement] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const triggerCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // 1. Xbox 360 controller mappings data
  const xboxMappings = {
    leftStick: {
      name: "Stick Analogique Gauche",
      type: "Axes 0 (X) & 1 (Y)",
      wpilib: "double x = controller.getLeftX();\ndouble y = controller.getLeftY();",
      desc: "Utilisé principalement pour le déplacement (Drivetrain). L'axe Y est inversé par défaut dans WPILib (négatif vers l'avant).",
      pos: { x: "Gauche/Milieu", buttonId: "Axis 0 / 1" }
    },
    rightStick: {
      name: "Stick Analogique Droite",
      type: "Axes 4 (X) & 5 (Y)",
      wpilib: "double x = controller.getRightX();\ndouble y = controller.getRightY();",
      desc: "Idéal pour la rotation fine du robot ou l'orientation d'un bras de pivotement.",
      pos: { x: "Droite/Bas", buttonId: "Axis 4 / 5" }
    },
    buttonA: {
      name: "Bouton A (Vert)",
      type: "Bouton 1",
      wpilib: "controller.a().onTrue(new MyCommand());",
      desc: "Bouton standard d'action rapide. Idéal pour activer l'aspiration (Intake) ou descendre un élévateur.",
      pos: { x: "Bouton Bas", buttonId: "Button 1" }
    },
    buttonB: {
      name: "Bouton B (Rouge)",
      type: "Bouton 2",
      wpilib: "controller.b().onTrue(new MyCommand());",
      desc: "Souvent utilisé pour stopper les mécanismes en cours d'exécution ou exécuter des actions d'urgence.",
      pos: { x: "Bouton Droite", buttonId: "Button 2" }
    },
    buttonX: {
      name: "Bouton X (Bleu)",
      type: "Bouton 3",
      wpilib: "controller.x().onTrue(new MyCommand());",
      desc: "Utilisé pour des mécanismes secondaires, comme la préparation du lanceur (Shooter spin-up).",
      pos: { x: "Bouton Gauche", buttonId: "Button 3" }
    },
    buttonY: {
      name: "Bouton Y (Jaune)",
      type: "Bouton 4",
      wpilib: "controller.y().onTrue(new MyCommand());",
      desc: "Utilisé principalement pour le déploiement du grimpeur (Climber) en fin de match.",
      pos: { x: "Bouton Haut", buttonId: "Button 4" }
    },
    leftBumper: {
      name: "Gâchette Haute Gauche (LB)",
      type: "Bouton 5",
      wpilib: "controller.leftBumper().onTrue(new MyCommand());",
      desc: "Interrupteur tout-ou-rien (ON/OFF). Très utilisé pour inverser le sens de l'intake (Eject).",
      pos: { x: "Bumper Gauche", buttonId: "Button 5" }
    },
    rightBumper: {
      name: "Gâchette Haute Droite (RB)",
      type: "Bouton 6",
      wpilib: "controller.rightBumper().onTrue(new MyCommand());",
      desc: "Interrupteur tout-ou-rien (ON/OFF). Souvent mappé pour tirer le projectile (Shooter trigger).",
      pos: { x: "Bumper Droite", buttonId: "Button 6" }
    },
    leftTrigger: {
      name: "Gâchette Basse Gauche (LT)",
      type: "Axe 2",
      wpilib: "double val = controller.getLeftTriggerAxis();",
      desc: "Axe analogique variant de 0.0 (relâché) à 1.0 (enfoncé). Pratique pour doser la vitesse d'admission.",
      pos: { x: "Gâchette Analogique Gauche", buttonId: "Axis 2" }
    },
    rightTrigger: {
      name: "Gâchette Basse Droite (RT)",
      type: "Axe 3",
      wpilib: "double val = controller.getRightTriggerAxis();\n// Ou avec déclencheur :\ncontroller.rightTrigger().onTrue(new ShootCommand());",
      desc: "Axe analogique variant de 0.0 à 1.0. Idéal pour doser la puissance de tir ou l'accélération.",
      pos: { x: "Gâchette Analogique Droite", buttonId: "Axis 3" }
    },
    dpad: {
      name: "Croix Directionnelle (D-Pad / POV)",
      type: "Angle (POV Hat)",
      wpilib: "controller.povUp().onTrue(new MyCommand()); // 0°\ncontroller.povDown().onTrue(new MyCommand()); // 180°",
      desc: "Renvoie des angles : 0° (Haut), 90° (Droite), 180° (Bas), 270° (Gauche). Utilisé pour des ajustements micrométriques (Trims) ou les presets.",
      pos: { x: "Flèches", buttonId: "POV Angles" }
    },
    backButton: {
      name: "Bouton Back (Retour)",
      type: "Bouton 7",
      wpilib: "controller.back().onTrue(new InstantCommand(drivetrain::zeroHeading));",
      desc: "Idéal pour réinitialiser le cap du gyroscope (Gyro reset / Field-oriented calibration).",
      pos: { x: "Bouton Option Gauche", buttonId: "Button 7" }
    },
    startButton: {
      name: "Bouton Start (Démarrer)",
      type: "Bouton 8",
      wpilib: "controller.start().onTrue(new MyCommand());",
      desc: "Idéal pour basculer les modes de conduite (ex: changer le profil de vitesse lente/rapide).",
      pos: { x: "Bouton Option Droite", buttonId: "Button 8" }
    }
  };

  // 2. Logitech Extreme 3D Pro mappings data
  const joystickMappings = {
    trigger: {
      name: "Gâchette Principale (Trigger)",
      type: "Bouton 1",
      wpilib: "JoystickButton trigger = new JoystickButton(joystick, 1);\ntrigger.onTrue(new ShootCommand());",
      desc: "Le bouton situé sous l'index. Idéal pour le tir (Shooting) ou l'action critique principale.",
      pos: { x: "Index de la poignée", buttonId: "Button 1" }
    },
    thumb: {
      name: "Bouton de Pouce Latéral",
      type: "Bouton 2",
      wpilib: "JoystickButton thumb = new JoystickButton(joystick, 2);\nthumb.onTrue(new IntakeCommand());",
      desc: "Placé idéalement pour le pouce. Souvent utilisé pour déployer l'intake ou activer le recentrage automatique.",
      pos: { x: "Côté de la tête", buttonId: "Button 2" }
    },
    stickX: {
      name: "Axe X (Gauche / Droite)",
      type: "Axe 0",
      wpilib: "double xVal = joystick.getX();",
      desc: "Axe horizontal principal. Utilisé pour le déplacement latéral ou la rotation (Swerve / Arcade Drive).",
      pos: { x: "Rotation latérale du manche", buttonId: "Axis 0" }
    },
    stickY: {
      name: "Axe Y (Avant / Arrière)",
      type: "Axe 1",
      wpilib: "double yVal = -joystick.getY(); // Inverser pour l'avant",
      desc: "Axe vertical principal. L'avant donne une valeur négative par standard FRC, d'où l'inversion nécessaire.",
      pos: { x: "Inclinaison du manche", buttonId: "Axis 1" }
    },
    stickZ: {
      name: "Axe Z (Torsion du manche)",
      type: "Axe 2",
      wpilib: "double rotation = joystick.getTwist();",
      desc: "Obtenu en tournant le manche sur lui-même. Très utilisé pour la rotation du robot en conduite crabe (Swerve).",
      pos: { x: "Rotation axiale du manche", buttonId: "Axis 2" }
    },
    throttle: {
      name: "Molette des gaz (Throttle)",
      type: "Axe 3",
      wpilib: "double throttle = (1.0 - joystick.getThrottle()) / 2.0; // Normaliser 0 à 1",
      desc: "Levier situé à l'avant de la base. Parfait pour limiter la vitesse maximale globale du robot à l'entraînement.",
      pos: { x: "Curseur de la base", buttonId: "Axis 3" }
    },
    hatSwitch: {
      name: "Chapeau Chinois (POV / Hat Switch)",
      type: "Angle (POV Hat)",
      wpilib: "int angle = joystick.getPOV();",
      desc: "Petit joystick multidirectionnel au sommet du manche. Renvoie des incréments d'angle (0, 45, 90, 135, etc.).",
      pos: { x: "Sommet du manche", buttonId: "POV Angles" }
    },
    btn3: {
      name: "Bouton Tête 3",
      type: "Bouton 3",
      wpilib: "JoystickButton btn3 = new JoystickButton(joystick, 3);",
      desc: "Bouton supérieur gauche sur la tête du joystick.",
      pos: { x: "Tête gauche", buttonId: "Button 3" }
    },
    btn4: {
      name: "Bouton Tête 4",
      type: "Bouton 4",
      wpilib: "JoystickButton btn4 = new JoystickButton(joystick, 4);",
      desc: "Bouton supérieur droit sur la tête du joystick.",
      pos: { x: "Tête droite", buttonId: "Button 4" }
    },
    btn5: {
      name: "Bouton Tête 5",
      type: "Bouton 5",
      wpilib: "JoystickButton btn5 = new JoystickButton(joystick, 5);",
      desc: "Bouton inférieur gauche sur la tête du joystick.",
      pos: { x: "Tête bas-gauche", buttonId: "Button 5" }
    },
    btn6: {
      name: "Bouton Tête 6",
      type: "Bouton 6",
      wpilib: "JoystickButton btn6 = new JoystickButton(joystick, 6);",
      desc: "Bouton inférieur droit sur la tête du joystick.",
      pos: { x: "Tête bas-droit", buttonId: "Button 6" }
    },
    baseButtons: {
      name: "Boutons de Base (7 à 12)",
      type: "Boutons 7, 8, 9, 10, 11, 12",
      wpilib: "JoystickButton btn7 = new JoystickButton(joystick, 7);\n// ... jusqu'à 12",
      desc: "Idéal pour déclencher des alignements automatiques sur le terrain (AprilTags) ou des positions prédéfinies de bras.",
      pos: { x: "Base du joystick", buttonId: "Buttons 7-12" }
    }
  };

  // Component description data for CTRE wiring diagram
  const wiringComponents = [
    { name: "RoboRIO 2.0", desc: "Le cerveau du robot. Il exécute le programme Java, gère les connexions USB (Caméras), l'Ethernet, et la boucle CAN." },
    { name: "Robot Radio (VH-109)", desc: "Assure la communication sans fil 2.4/5GHz ou WiFi 6 avec le PC de contrôle sur les stands et sur l'arène de match." },
    { name: "Power Distribution Panel", desc: "Distribue l'énergie de la batterie 12V vers tous les moteurs et capteurs via des disjoncteurs thermiques (de 10A à 40A)." },
    { name: "Spark MAX & Talon SRX", desc: "Variateurs de vitesse gérant les moteurs brushless (NEO) et brushed. Ils se connectent en boucle sur le réseau CAN." },
    { name: "Kraken X60 & Talon FX", desc: "Moteurs Brushless haute performance avec variateur intégré (Talon FX). Directement câblés au bus CAN." }
  ];

  return (
    <div style={styles.container}>
      {/* Header Banner */}
      <div style={styles.header}>
        <div style={styles.headerTitleGroup}>
          <Gamepad2 size={26} style={{ color: 'var(--brand-red)' }} />
          <h2 style={styles.headerTitle}>STAN Robotix Programming & Mapping</h2>
        </div>
        <p style={styles.headerSubtitle}>
          Outil interactif d'adressage des manettes et de câblage matériel pour les programmeurs de **STAN ROBOTIX**.
        </p>
      </div>

      {/* Tabs Selector */}
      <div style={styles.tabContainer}>
        <button 
          onClick={() => setActiveTab('mapping')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'mapping' ? '3px solid var(--brand-red)' : '3px solid transparent',
            color: activeTab === 'mapping' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activeTab === 'mapping' ? '600' : '500'
          }}
        >
          <Gamepad2 size={16} /> Mappage des Contrôleurs
        </button>
        <button 
          onClick={() => setActiveTab('wiring')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'wiring' ? '3px solid var(--brand-red)' : '3px solid transparent',
            color: activeTab === 'wiring' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activeTab === 'wiring' ? '600' : '500'
          }}
        >
          <Cpu size={16} /> Câblage Matériel FRC
        </button>
      </div>

      {/* Active Tab Content Workspace */}
      <div style={styles.contentBody}>
        {activeTab === 'mapping' ? (
          <div style={styles.mappingGrid}>
            
            {/* Left panel: Controller Selection & SVG visualizer */}
            <div className="glass-panel" style={styles.controllerCard}>
              <div style={styles.controllerHeader}>
                <div style={styles.controllerSelectors}>
                  <button 
                    onClick={() => { setActiveController('xbox'); setHoveredElement(null); }}
                    className={activeController === 'xbox' ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Manette Xbox 360 / Logitech F310
                  </button>
                  <button 
                    onClick={() => { setActiveController('joystick'); setHoveredElement(null); }}
                    className={activeController === 'joystick' ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Logitech Extreme 3D Pro
                  </button>
                </div>
                <span style={styles.helperText}>Survolez un bouton pour voir son mappage FRC</span>
              </div>

              {/* CONTROLLER 1: INTERACTIVE XBOX SVG */}
              {activeController === 'xbox' && (
                <div style={styles.svgWrapper}>
                  <svg viewBox="0 0 500 350" style={styles.svg}>
                    {/* Controller Body Shadow */}
                    <path 
                      d="M 120,80 C 180,80 220,100 250,100 C 280,100 320,80 380,80 C 430,80 470,120 450,220 C 430,300 380,310 340,280 C 310,250 280,240 250,240 C 220,240 190,250 160,280 C 120,310 70,300 50,220 C 30,120 70,80 120,80 Z" 
                      fill="#1e293b" 
                      stroke="#475569" 
                      strokeWidth="4" 
                    />

                    {/* Bumpers & Triggers */}
                    {/* Left Trigger (LT) */}
                    <path 
                      d="M 100,50 L 140,55 L 140,75 L 90,70 Z" 
                      fill={hoveredElement === 'leftTrigger' ? 'var(--brand-red)' : '#334155'} 
                      stroke="#64748b" 
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('leftTrigger')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    {/* Right Trigger (RT) */}
                    <path 
                      d="M 400,50 L 360,55 L 360,75 L 410,70 Z" 
                      fill={hoveredElement === 'rightTrigger' ? 'var(--brand-red)' : '#334155'} 
                      stroke="#64748b" 
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('rightTrigger')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />

                    {/* Left Bumper (LB) */}
                    <path 
                      d="M 100,75 C 130,78 170,85 190,87 L 190,95 C 170,92 130,85 100,80 Z" 
                      fill={hoveredElement === 'leftBumper' ? 'var(--brand-red)' : '#475569'} 
                      stroke="#64748b" 
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('leftBumper')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    {/* Right Bumper (RB) */}
                    <path 
                      d="M 400,75 C 370,78 330,85 310,87 L 310,95 C 330,92 370,85 400,80 Z" 
                      fill={hoveredElement === 'rightBumper' ? 'var(--brand-red)' : '#475569'} 
                      stroke="#64748b" 
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('rightBumper')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />

                    {/* Left Analog Stick */}
                    <circle 
                      cx="140" 
                      cy="150" 
                      r="25" 
                      fill={hoveredElement === 'leftStick' ? 'var(--brand-red-alpha-20)' : '#0f172a'} 
                      stroke={hoveredElement === 'leftStick' ? 'var(--brand-red)' : '#64748b'} 
                      strokeWidth="3"
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('leftStick')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    <circle cx="140" cy="150" r="10" fill="#334155" />

                    {/* Right Analog Stick */}
                    <circle 
                      cx="310" 
                      cy="210" 
                      r="25" 
                      fill={hoveredElement === 'rightStick' ? 'var(--brand-red-alpha-20)' : '#0f172a'} 
                      stroke={hoveredElement === 'rightStick' ? 'var(--brand-red)' : '#64748b'} 
                      strokeWidth="3"
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('rightStick')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    <circle cx="310" cy="210" r="10" fill="#334155" />

                    {/* D-Pad (POV) */}
                    <g 
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredElement('dpad')}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      {/* Vertical Bar */}
                      <rect 
                        x="185" 
                        y="185" 
                        width="20" 
                        height="50" 
                        rx="4" 
                        fill={hoveredElement === 'dpad' ? 'var(--brand-red)' : '#334155'} 
                        stroke="#64748b" 
                      />
                      {/* Horizontal Bar */}
                      <rect 
                        x="170" 
                        y="200" 
                        width="50" 
                        height="20" 
                        rx="4" 
                        fill={hoveredElement === 'dpad' ? 'var(--brand-red)' : '#334155'} 
                        stroke="#64748b" 
                      />
                    </g>

                    {/* Action Buttons A, B, X, Y */}
                    {/* Y Button */}
                    <circle 
                      cx="360" 
                      cy="120" 
                      r="12" 
                      fill={hoveredElement === 'buttonY' ? 'var(--brand-red)' : '#eab308'} 
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('buttonY')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    <text x="357" y="124" fill="#000" fontSize="11" fontWeight="800" style={{ pointerEvents: 'none' }}>Y</text>

                    {/* X Button */}
                    <circle 
                      cx="325" 
                      cy="150" 
                      r="12" 
                      fill={hoveredElement === 'buttonX' ? 'var(--brand-red)' : '#2563eb'} 
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('buttonX')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    <text x="321" y="154" fill="#fff" fontSize="11" fontWeight="800" style={{ pointerEvents: 'none' }}>X</text>

                    {/* B Button */}
                    <circle 
                      cx="395" 
                      cy="150" 
                      r="12" 
                      fill={hoveredElement === 'buttonB' ? 'var(--brand-red)' : '#dc2626'} 
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('buttonB')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    <text x="391" y="154" fill="#fff" fontSize="11" fontWeight="800" style={{ pointerEvents: 'none' }}>B</text>

                    {/* A Button */}
                    <circle 
                      cx="360" 
                      cy="180" 
                      r="12" 
                      fill={hoveredElement === 'buttonA' ? 'var(--brand-red)' : '#16a34a'} 
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('buttonA')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    <text x="356" y="184" fill="#fff" fontSize="11" fontWeight="800" style={{ pointerEvents: 'none' }}>A</text>

                    {/* Back Button */}
                    <circle 
                      cx="220" 
                      cy="150" 
                      r="8" 
                      fill={hoveredElement === 'backButton' ? 'var(--brand-red)' : '#475569'} 
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('backButton')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    <text x="212" y="138" fill="var(--text-muted)" fontSize="8" fontWeight="600" style={{ pointerEvents: 'none' }}>BACK</text>

                    {/* Start Button */}
                    <circle 
                      cx="280" 
                      cy="150" 
                      r="8" 
                      fill={hoveredElement === 'startButton' ? 'var(--brand-red)' : '#475569'} 
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('startButton')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    <text x="272" y="138" fill="var(--text-muted)" fontSize="8" fontWeight="600" style={{ pointerEvents: 'none' }}>START</text>
                  </svg>
                </div>
              )}

              {/* CONTROLLER 2: INTERACTIVE FLIGHT STICK LOGITECH */}
              {activeController === 'joystick' && (
                <div style={styles.svgWrapper}>
                  <svg viewBox="0 0 400 450" style={styles.svg}>
                    {/* Joystick Base shape */}
                    <ellipse 
                      cx="200" 
                      cy="360" 
                      rx="120" 
                      ry="50" 
                      fill="#1e293b" 
                      stroke="#475569" 
                      strokeWidth="4" 
                    />
                    
                    {/* Base Inner Ring */}
                    <ellipse cx="200" cy="360" rx="60" ry="25" fill="#0f172a" stroke="#334155" />

                    {/* Throttle slider (Axis 3) */}
                    <rect 
                      x="180" 
                      y="390" 
                      width="40" 
                      height="12" 
                      rx="3" 
                      fill={hoveredElement === 'throttle' ? 'var(--brand-red)' : '#475569'} 
                      stroke="#64748b" 
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('throttle')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    <text x="182" y="415" fill="var(--text-muted)" fontSize="9" fontWeight="600">THROTTLE</text>

                    {/* Stick Column */}
                    <path 
                      d="M 185,350 L 175,150 L 225,150 L 215,350 Z" 
                      fill="#334155" 
                      stroke="#475569" 
                      strokeWidth="2" 
                    />

                    {/* Vertical stick axis hover overlay */}
                    <path 
                      d="M 180,340 L 175,170 L 225,170 L 220,340 Z"
                      fill={hoveredElement === 'stickX' || hoveredElement === 'stickY' || hoveredElement === 'stickZ' ? 'var(--brand-red-alpha-10)' : 'transparent'}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredElement('stickY')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />

                    {/* Stick Head */}
                    <path 
                      d="M 160,150 L 160,90 L 240,90 L 240,150 Z" 
                      fill="#1e293b" 
                      stroke="#475569" 
                      strokeWidth="2" 
                    />

                    {/* Thumb Button (Button 2) */}
                    <circle 
                      cx="230" 
                      cy="125" 
                      r="8" 
                      fill={hoveredElement === 'thumb' ? 'var(--brand-red)' : '#475569'} 
                      stroke="#64748b"
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('thumb')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    <text x="242" y="128" fill="var(--text-muted)" fontSize="9" fontWeight="700">Btn 2</text>

                    {/* Hat Switch (POV) */}
                    <circle 
                      cx="200" 
                      cy="110" 
                      r="12" 
                      fill={hoveredElement === 'hatSwitch' ? 'var(--brand-red)' : '#0f172a'} 
                      stroke="#64748b" 
                      strokeWidth="2"
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('hatSwitch')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    <circle cx="200" cy="110" r="4" fill="#ef4444" />

                    {/* Head buttons 3, 4, 5, 6 */}
                    <circle 
                      cx="180" 
                      cy="135" 
                      r="6" 
                      fill={hoveredElement === 'btn3' ? 'var(--brand-red)' : '#cf2737'} 
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredElement('btn3')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    <circle 
                      cx="220" 
                      cy="135" 
                      r="6" 
                      fill={hoveredElement === 'btn4' ? 'var(--brand-red)' : '#cf2737'} 
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredElement('btn4')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    <circle 
                      cx="180" 
                      cy="150" 
                      r="6" 
                      fill={hoveredElement === 'btn5' ? 'var(--brand-red)' : '#cf2737'} 
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredElement('btn5')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    <circle 
                      cx="220" 
                      cy="150" 
                      r="6" 
                      fill={hoveredElement === 'btn6' ? 'var(--brand-red)' : '#cf2737'} 
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredElement('btn6')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />

                    {/* Trigger (Button 1, back of stick) */}
                    <path 
                      d="M 168,145 L 155,150 L 158,162 L 172,156 Z" 
                      fill={hoveredElement === 'trigger' ? 'var(--brand-red)' : '#4b5563'} 
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('trigger')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    <text x="122" y="160" fill="var(--text-muted)" fontSize="9" fontWeight="700">Trigger (1)</text>

                    {/* Base Buttons 7 to 12 (Mapped collectively for clarity) */}
                    <g 
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredElement('baseButtons')}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      {/* Left base buttons */}
                      <circle cx="110" cy="340" r="8" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#475569'} stroke="#334155" />
                      <circle cx="105" cy="355" r="8" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#475569'} stroke="#334155" />
                      <circle cx="100" cy="370" r="8" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#475569'} stroke="#334155" />
                      {/* Right base buttons */}
                      <circle cx="290" cy="340" r="8" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#475569'} stroke="#334155" />
                      <circle cx="295" cy="355" r="8" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#475569'} stroke="#334155" />
                      <circle cx="300" cy="370" r="8" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#475569'} stroke="#334155" />
                      <text x="75" y="400" fill="var(--text-muted)" fontSize="9" fontWeight="700">Boutons de Base (7-12)</text>
                    </g>
                  </svg>
                </div>
              )}
            </div>

            {/* Right Panel: Detail HUD and API code generator */}
            <div style={styles.hudCard}>
              {hoveredElement ? (
                <div className="glass-panel animate-fade" style={styles.hudContent}>
                  <div style={styles.hudHeader}>
                    <span style={styles.badge}>
                      {activeController === 'xbox' ? xboxMappings[hoveredElement].type : joystickMappings[hoveredElement].type}
                    </span>
                    <h3 style={styles.hudTitle}>
                      {activeController === 'xbox' ? xboxMappings[hoveredElement].name : joystickMappings[hoveredElement].name}
                    </h3>
                  </div>

                  <p style={styles.hudDesc}>
                    {activeController === 'xbox' ? xboxMappings[hoveredElement].desc : joystickMappings[hoveredElement].desc}
                  </p>

                  <div style={styles.infoRow}>
                    <Info size={14} style={{ color: 'var(--brand-red)' }} />
                    <span style={styles.infoLabel}>Position standard : </span>
                    <span style={styles.infoValue}>
                      {activeController === 'xbox' ? xboxMappings[hoveredElement].pos.x : joystickMappings[hoveredElement].pos.x}
                    </span>
                  </div>

                  <div style={styles.codeBlockContainer}>
                    <div style={styles.codeBlockHeader}>
                      <span>Code WPILib Java</span>
                      <button 
                        onClick={() => triggerCopy(activeController === 'xbox' ? xboxMappings[hoveredElement].wpilib : joystickMappings[hoveredElement].wpilib)}
                        style={styles.copyBtn}
                        title="Copier le code"
                      >
                        {copiedCode ? (
                          <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                    <pre style={styles.codeBlock}>
                      <code>
                        {activeController === 'xbox' ? xboxMappings[hoveredElement].wpilib : joystickMappings[hoveredElement].wpilib}
                      </code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="glass-panel" style={styles.hudEmpty}>
                  <Gamepad2 size={40} style={{ color: 'var(--text-light)', marginBottom: '14px' }} />
                  <h4>Sélectionnez un composant</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '280px', marginTop: '4px' }}>
                    Passez votre souris sur les différents boutons et axes de la manette à gauche pour inspecter sa configuration FRC.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* TAB 2: WIRING DIAGRAM PANEL */
          <div className="glass-panel animate-fade" style={styles.wiringWorkspace}>
            <div style={styles.wiringHeader}>
              <div>
                <h3 style={styles.wiringTitle}>Schéma de câblage du système FRC (CTRE)</h3>
                <p style={styles.wiringDesc}>
                  Ce schéma représente la topologie électrique et réseau standard FRC d'une boucle CAN, d'une alimentation PDP et du système de contrôle RoboRIO.
                </p>
              </div>
              <a 
                href="/images/frc_control_system_ctre.png" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary"
                style={{ padding: '8px 14px', fontSize: '0.85rem', textDecoration: 'none' }}
              >
                Ouvrir en plein écran
              </a>
            </div>

            <div style={styles.wiringLayout}>
              <div style={styles.imageCard}>
                <img 
                  src="/images/frc_control_system_ctre.png" 
                  alt="FRC Control System Wiring" 
                  style={styles.wiringImage} 
                />
              </div>

              {/* Hardware component guides */}
              <div style={styles.wiringGuide}>
                <h4 style={styles.guideTitle}>Guide des composants</h4>
                <div style={styles.guideList}>
                  {wiringComponents.map((comp, idx) => (
                    <div key={idx} style={styles.guideItem}>
                      <div style={styles.guideHeader}>
                        <div style={styles.guideDot}></div>
                        <span style={styles.guideName}>{comp.name}</span>
                      </div>
                      <p style={styles.guideDesc}>{comp.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
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
    padding: '1.5rem'
  },
  header: {
    marginBottom: '1.5rem'
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  headerTitle: {
    fontSize: '1.5rem',
    color: 'var(--text-main)'
  },
  headerSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '4px'
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    gap: '24px',
    marginBottom: '1.5rem'
  },
  tabBtn: {
    padding: '10px 4px',
    fontSize: '0.9rem',
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
  mappingGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '1.5rem',
    alignItems: 'start',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr'
    }
  },
  controllerCard: {
    borderRadius: 'var(--border-radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    backgroundColor: 'var(--bg-card)'
  },
  controllerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  controllerSelectors: {
    display: 'flex',
    gap: '10px'
  },
  helperText: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontWeight: '500'
  },
  svgWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 'var(--border-radius-md)',
    minHeight: '350px'
  },
  svg: {
    width: '100%',
    maxHeight: '350px'
  },
  hudCard: {
    position: 'sticky',
    top: '0px'
  },
  hudContent: {
    borderRadius: 'var(--border-radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: 'var(--bg-card)'
  },
  hudHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px'
  },
  badge: {
    display: 'inline-block',
    fontSize: '0.7rem',
    padding: '2px 8px',
    borderRadius: '9999px',
    backgroundColor: 'var(--brand-red-alpha-10)',
    color: 'var(--brand-red)',
    fontWeight: '700',
    alignSelf: 'start',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  hudTitle: {
    fontSize: '1.2rem',
    color: 'var(--text-main)',
    fontWeight: '700'
  },
  hudDesc: {
    fontSize: '0.88rem',
    color: 'var(--text-main)',
    lineHeight: '1.5'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
    marginTop: '6px'
  },
  infoLabel: {
    color: 'var(--text-muted)',
    fontWeight: '600'
  },
  infoValue: {
    color: 'var(--text-main)',
    fontWeight: '600'
  },
  codeBlockContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '12px',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    overflow: 'hidden'
  },
  codeBlockHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 12px',
    backgroundColor: 'rgba(0,0,0,0.1)',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border-color)'
  },
  copyBtn: {
    color: 'var(--text-muted)',
    ':hover': {
      color: 'var(--text-main)'
    }
  },
  codeBlock: {
    backgroundColor: '#090d16',
    padding: '12px',
    fontSize: '0.8rem',
    color: '#e2e8f0',
    overflowX: 'auto',
    margin: 0,
    fontFamily: 'Courier New, monospace'
  },
  hudEmpty: {
    borderRadius: 'var(--border-radius-lg)',
    border: '1px dashed var(--border-color)',
    padding: '3rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: '280px',
    backgroundColor: 'rgba(255,255,255,0.01)',
    color: 'var(--text-main)'
  },
  
  // WIRING DIAGRAM STYLES
  wiringWorkspace: {
    borderRadius: 'var(--border-radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '1.5rem',
    backgroundColor: 'var(--bg-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  wiringHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem'
  },
  wiringTitle: {
    fontSize: '1.2rem',
    fontWeight: '700'
  },
  wiringDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '4px'
  },
  wiringLayout: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '1.5rem',
    alignItems: 'start',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr'
    }
  },
  imageCard: {
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
    backgroundColor: '#ffffff', // white background for diagram contrast
    padding: '10px'
  },
  wiringImage: {
    width: '100%',
    height: 'auto',
    display: 'block',
    borderRadius: '4px'
  },
  wiringGuide: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  guideTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-main)'
  },
  guideList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  guideItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '10px',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  guideHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  guideDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--brand-red)'
  },
  guideName: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-main)'
  },
  guideDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4'
  }
};
