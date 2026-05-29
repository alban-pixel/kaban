import React, { useState } from 'react';
import { 
  Gamepad2, Cpu, Copy, CheckCircle2, Info, ExternalLink, Image as ImageIcon
} from 'lucide-react';

export default function ProgrammingPage() {
  const [activeTab, setActiveTab] = useState('mapping'); // 'mapping' | 'wiring'
  const [activeController, setActiveController] = useState('xbox'); // 'xbox' | 'joystick'
  const [codeLang, setCodeLang] = useState('cpp'); // 'cpp' | 'java'
  
  // Hover details state
  const [hoveredElement, setHoveredElement] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const triggerCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // 1. Xbox Controller Mappings
  const xboxMappings = {
    leftStick: {
      name: "Stick Analogique Gauche",
      type: "Axes 0 (X) & 1 (Y) + Clic 9",
      wpilibCpp: `// Déclaration\nfrc::XboxController controller{0};\n\n// Lecture des Axes\ndouble x = controller.GetLeftX();\ndouble y = controller.GetLeftY();\n\n// Lecture du Clic\nbool clicked = controller.GetLeftStickButton();`,
      wpilibJava: `// Déclaration\nXboxController controller = new XboxController(0);\n\n// Lecture des Axes\ndouble x = controller.getLeftX();\ndouble y = controller.getLeftY();\n\n// Lecture du Clic\nboolean clicked = controller.getLeftStickButton();`,
      desc: "Principalement utilisé pour le déplacement du robot. Dans WPILib, l'axe Y est inversé par défaut (l'avant donne une valeur négative, l'arrière est positif).",
      pos: "Milieu Gauche"
    },
    rightStick: {
      name: "Stick Analogique Droite",
      type: "Axes 4 (X) & 5 (Y) + Clic 10",
      wpilibCpp: `// Déclaration\nfrc::XboxController controller{0};\n\n// Lecture des Axes\ndouble x = controller.GetRightX();\ndouble y = controller.GetRightY();\n\n// Lecture du Clic\nbool clicked = controller.GetRightStickButton();`,
      wpilibJava: `// Déclaration\nXboxController controller = new XboxController(0);\n\n// Lecture des Axes\ndouble x = controller.getRightX();\ndouble y = controller.getRightY();\n\n// Lecture du Clic\nboolean clicked = controller.getRightStickButton();`,
      desc: "Idéal pour l'orientation de tourelles, de bras pivotants, ou la rotation fine du châssis.",
      pos: "Bas Droite"
    },
    buttonA: {
      name: "Bouton A (Vert)",
      type: "Bouton 1",
      wpilibCpp: `// Lecture directe\nbool state = controller.GetAButton();\n\n// Mode Command (C++)\nfrc2::JoystickButton(&controller, frc::XboxController::Button::kA)\n    .OnTrue(MyCommand().ToPtr());`,
      wpilibJava: `// Lecture directe\nboolean state = controller.getAButton();\n\n// Mode Command (Java)\ncontroller.a().onTrue(new MyCommand());`,
      desc: "Bouton d'action rapide principal. Classiquement mappé pour l'admission (Intake) ou des presets de basse altitude.",
      pos: "Face droite (Bas)"
    },
    buttonB: {
      name: "Bouton B (Rouge)",
      type: "Bouton 2",
      wpilibCpp: `// Lecture directe\nbool state = controller.GetBButton();\n\n// Mode Command (C++)\nfrc2::JoystickButton(&controller, frc::XboxController::Button::kB)\n    .OnTrue(MyCommand().ToPtr());`,
      wpilibJava: `// Lecture directe\nboolean state = controller.getBButton();\n\n// Mode Command (Java)\ncontroller.b().onTrue(new MyCommand());`,
      desc: "Utilisé pour des mécanismes secondaires ou pour annuler immédiatement l'exécution des commandes actives.",
      pos: "Face droite (Droite)"
    },
    buttonX: {
      name: "Bouton X (Bleu)",
      type: "Bouton 3",
      wpilibCpp: `// Lecture directe\nbool state = controller.GetXButton();\n\n// Mode Command (C++)\nfrc2::JoystickButton(&controller, frc::XboxController::Button::kX)\n    .OnTrue(MyCommand().ToPtr());`,
      wpilibJava: `// Lecture directe\nboolean state = controller.getXButton();\n\n// Mode Command (Java)\ncontroller.x().onTrue(new MyCommand());`,
      desc: "Idéal pour lancer l'accélération d'un volant de tir (Shooter spin-up) ou l'activation de presets.",
      pos: "Face droite (Gauche)"
    },
    buttonY: {
      name: "Bouton Y (Jaune)",
      type: "Bouton 4",
      wpilibCpp: `// Lecture directe\nbool state = controller.GetYButton();\n\n// Mode Command (C++)\nfrc2::JoystickButton(&controller, frc::XboxController::Button::kY)\n    .OnTrue(MyCommand().ToPtr());`,
      wpilibJava: `// Lecture directe\nboolean state = controller.getYButton();\n\n// Mode Command (Java)\ncontroller.y().onTrue(new MyCommand());`,
      desc: "Classiquement assigné au déploiement du grimpeur (Climber) ou pour amener le robot à sa hauteur maximale.",
      pos: "Face droite (Haut)"
    },
    leftBumper: {
      name: "Gâchette Haute Gauche (LB)",
      type: "Bouton 5",
      wpilibCpp: `// Lecture directe\nbool state = controller.GetLeftBumperButton();\n\n// Mode Command\nfrc2::JoystickButton(&controller, frc::XboxController::Button::kLeftBumper)\n    .OnTrue(MyCommand().ToPtr());`,
      wpilibJava: `// Lecture directe\nboolean state = controller.getLeftBumperButton();\n\n// Mode Command\ncontroller.leftBumper().onTrue(new MyCommand());`,
      desc: "Bouton ON/OFF rapide. Souvent utilisé pour inverser le sens de l'intake en cas de bourrage (Eject).",
      pos: "Bumper Gauche"
    },
    rightBumper: {
      name: "Gâchette Haute Droite (RB)",
      type: "Bouton 6",
      wpilibCpp: `// Lecture directe\nbool state = controller.GetRightBumperButton();\n\n// Mode Command\nfrc2::JoystickButton(&controller, frc::XboxController::Button::kRightBumper)\n    .OnTrue(MyCommand().ToPtr());`,
      wpilibJava: `// Lecture directe\nboolean state = controller.getRightBumperButton();\n\n// Mode Command\ncontroller.rightBumper().onTrue(new MyCommand());`,
      desc: "Bouton ON/OFF rapide. Souvent configuré comme gâchette d'activation finale de tir (Shoot trigger).",
      pos: "Bumper Droite"
    },
    leftTrigger: {
      name: "Gâchette Basse Gauche (LT)",
      type: "Axe 2",
      wpilibCpp: `// Lecture analogique (0.0 à 1.0)\ndouble value = controller.GetLeftTriggerAxis();\n\n// Mode Command avec seuil\ncontroller.LeftTrigger(0.5, &eventLoop).OnTrue(MyCommand().ToPtr());`,
      wpilibJava: `// Lecture analogique (0.0 à 1.0)\ndouble value = controller.getLeftTriggerAxis();\n\n// Mode Command avec seuil\ncontroller.leftTrigger(0.5).onTrue(new MyCommand());`,
      desc: "Axe analogique très fluide. Pratique pour moduler la vitesse d'admission ou doser l'accélération progressive.",
      pos: "Arrière Gauche"
    },
    rightTrigger: {
      name: "Gâchette Basse Droite (RT)",
      type: "Axe 3",
      wpilibCpp: `// Lecture analogique (0.0 à 1.0)\ndouble value = controller.GetRightTriggerAxis();\n\n// Mode Command avec seuil\ncontroller.RightTrigger(0.5, &eventLoop).OnTrue(MyCommand().ToPtr());`,
      wpilibJava: `// Lecture analogique (0.0 à 1.0)\ndouble value = controller.getRightTriggerAxis();\n\n// Mode Command avec seuil\ncontroller.rightTrigger(0.5).onTrue(new MyCommand());`,
      desc: "Axe analogique. Utile pour la conduite progressive ou pour doser la puissance et l'inclinaison d'un lanceur.",
      pos: "Arrière Droite"
    },
    dpad: {
      name: "Croix Directionnelle (D-Pad)",
      type: "Angles POV",
      wpilibCpp: `// Lecture de l'angle (0 = Haut, 90 = Droite, 180 = Bas, 270 = Gauche, -1 = Relâché)\nint angle = controller.GetPOV();`,
      wpilibJava: `// Lecture de l'angle (0 = Haut, 90 = Droite, 180 = Bas, 270 = Gauche, -1 = Relâché)\nint angle = controller.getPOV();`,
      desc: "Retourne la direction sous forme d'angle en degrés. Idéal pour sélectionner des modes de presets discrets ou faire des micro-ajustements.",
      pos: "Bas Gauche"
    },
    backButton: {
      name: "Bouton Back (Retour)",
      type: "Bouton 7",
      wpilibCpp: `// Lecture directe\nbool state = controller.GetBackButton();\n\n// Mode Command\nfrc2::JoystickButton(&controller, frc::XboxController::Button::kBack)\n    .OnTrue(InstantCommand([this] { drivetrain.ZeroHeading(); }).ToPtr());`,
      wpilibJava: `// Lecture directe\nboolean state = controller.getBackButton();\n\n// Mode Command\ncontroller.back().onTrue(new InstantCommand(drivetrain::zeroHeading));`,
      desc: "Bouton central gauche. Généralement utilisé pour étalonner ou remettre à zéro le cap du gyroscope (Gyro Reset).",
      pos: "Milieu Gauche"
    },
    startButton: {
      name: "Bouton Start",
      type: "Bouton 8",
      wpilibCpp: `// Lecture directe\nbool state = controller.GetStartButton();\n\n// Mode Command\nfrc2::JoystickButton(&controller, frc::XboxController::Button::kStart)\n    .OnTrue(MyCommand().ToPtr());`,
      wpilibJava: `// Lecture directe\nboolean state = controller.getStartButton();\n\n// Mode Command\ncontroller.start().onTrue(new MyCommand());`,
      desc: "Bouton central droit. Pratique pour alterner entre différents profils de pilotage (ex: mode vitesse lente vs rapide).",
      pos: "Milieu Droite"
    }
  };

  // 2. Joystick Mappings
  const joystickMappings = {
    trigger: {
      name: "Gâchette Principale (Trigger)",
      type: "Bouton 1",
      wpilibCpp: `// Lecture directe\nbool state = joystick.GetTrigger();\n\n// Mode Command\nfrc2::JoystickButton(&joystick, 1).OnTrue(ShootCommand().ToPtr());`,
      wpilibJava: `// Lecture directe\nboolean state = joystick.getTrigger();\n\n// Mode Command\nnew JoystickButton(joystick, 1).onTrue(new MyCommand());`,
      desc: "Gâchette située sous l'index de la poignée. Assignée aux tirs rapides et actions immédiates critiques.",
      pos: "Index"
    },
    thumb: {
      name: "Bouton de Pouce Latéral",
      type: "Bouton 2",
      wpilibCpp: `// Lecture directe (Note: GetTop() est disponible pour le bouton de pouce)\nbool state = joystick.GetRawButton(2);`,
      wpilibJava: `// Lecture directe\nboolean state = joystick.getRawButton(2);`,
      desc: "Bouton situé sur le côté de la tête du manche. Facile d'accès sous le pouce. Pratique pour activer ou désactiver les moteurs d'indexation.",
      pos: "Sommet (Pouce)"
    },
    stickX: {
      name: "Axe X (Gauche / Droite)",
      type: "Axe 0",
      wpilibCpp: `// Lecture (Droite positif, Gauche négatif)\ndouble value = joystick.GetX();`,
      wpilibJava: `// Lecture (Droite positif, Gauche négatif)\ndouble value = joystick.getX();`,
      desc: "Axe horizontal du manche. Utilisé pour les translations latérales en mode Swerve ou la rotation en Arcade Drive.",
      pos: "Déplacement Manche"
    },
    stickY: {
      name: "Axe Y (Avant / Arrière)",
      type: "Axe 1",
      wpilibCpp: `// Lecture (Arrière positif, Avant négatif - Inverser pour la marche avant)\ndouble value = -joystick.GetY();`,
      wpilibJava: `// Lecture (Arrière positif, Avant négatif - Inverser pour la marche avant)\ndouble value = -joystick.getY();`,
      desc: "Axe vertical du manche. Par convention WPILib, l'avant renvoie une valeur négative. Pensez à inverser la valeur.",
      pos: "Inclinaison Manche"
    },
    stickZ: {
      name: "Axe Z (Torsion / Twist)",
      type: "Axe 2",
      wpilibCpp: `// Lecture (Torsion horaire positif)\ndouble value = joystick.GetTwist();`,
      wpilibJava: `// Lecture (Torsion horaire positif)\ndouble value = joystick.getTwist();`,
      desc: "Obtenu en faisant pivoter le manche sur son propre axe vertical. Idéal pour commander directement l'orientation angulaire en Swerve Drive.",
      pos: "Torsion Manche"
    },
    throttle: {
      name: "Molette des gaz (Throttle)",
      type: "Axe 3",
      wpilibCpp: `// Lecture (Varie de -1.0 [Max avant] à 1.0 [Max arrière])\ndouble value = joystick.GetThrottle();\n\n// Normaliser de 0.0 à 1.0 si nécessaire :\ndouble speedFactor = (1.0 - value) / 2.0;`,
      wpilibJava: `// Lecture (Varie de -1.0 [Max avant] à 1.0 [Max arrière])\ndouble value = joystick.getThrottle();\n\n// Normaliser de 0.0 à 1.0 si nécessaire :\ndouble speedFactor = (1.0 - value) / 2.0;`,
      desc: "Axe curseur glissant situé à la base. Très utile pour brider ou configurer à la volée la vitesse maximale admissible du robot.",
      pos: "Curseur Base"
    },
    hatSwitch: {
      name: "Chapeau Chinois (POV / Hat Switch)",
      type: "Angles POV",
      wpilibCpp: `// Lecture de l'angle (-1 [Relâché], 0 [Haut], 90 [Droite]...)\nint angle = joystick.GetPOV();`,
      wpilibJava: `// Lecture de l'angle (-1 [Relâché], 0 [Haut], 90 [Droite]...)\nint angle = joystick.getPOV();`,
      desc: "Mini joystick directionnel situé au sommet. Permet d'ajuster finement la visée caméra ou d'alterner les angles de tourelle.",
      pos: "Sommet"
    },
    btn3: {
      name: "Bouton Tête Gauche (Bouton 3)",
      type: "Bouton 3",
      wpilibCpp: `bool state = joystick.GetRawButton(3);`,
      wpilibJava: `boolean state = joystick.getRawButton(3);`,
      desc: "Bouton supérieur situé sur la partie gauche de la tête du manche.",
      pos: "Sommet Gauche"
    },
    btn4: {
      name: "Bouton Tête Droite (Bouton 4)",
      type: "Bouton 4",
      wpilibCpp: `bool state = joystick.GetRawButton(4);`,
      wpilibJava: `boolean state = joystick.getRawButton(4);`,
      desc: "Bouton supérieur situé sur la partie droite de la tête du manche.",
      pos: "Sommet Droite"
    },
    btn5: {
      name: "Bouton Tête Bas Gauche (Bouton 5)",
      type: "Bouton 5",
      wpilibCpp: `bool state = joystick.GetRawButton(5);`,
      wpilibJava: `boolean state = joystick.getRawButton(5);`,
      desc: "Bouton inférieur situé sur la partie gauche de la tête du manche.",
      pos: "Sommet Bas-Gauche"
    },
    btn6: {
      name: "Bouton Tête Bas Droite (Bouton 6)",
      type: "Bouton 6",
      wpilibCpp: `bool state = joystick.GetRawButton(6);`,
      wpilibJava: `boolean state = joystick.getRawButton(6);`,
      desc: "Bouton inférieur situé sur la partie droite de la tête du manche.",
      pos: "Sommet Bas-Droite"
    },
    baseButtons: {
      name: "Boutons de Base (7 à 12)",
      type: "Boutons 7 - 12",
      wpilibCpp: `// Exemple pour le Bouton 7\nbool btn7 = joystick.GetRawButton(7);\n\n// Exemple pour le Bouton 8\nbool btn8 = joystick.GetRawButton(8);`,
      wpilibJava: `// Exemple pour le Bouton 7\nboolean btn7 = joystick.getRawButton(7);\n\n// Exemple pour le Bouton 8\nboolean btn8 = joystick.getRawButton(8);`,
      desc: "Boutons poussoirs regroupés sur le socle gauche de la base. Très utilisés pour déclencher l'alignement semi-automatique par vision (AprilTags) ou configurer l'autonomie.",
      pos: "Base"
    }
  };

  // Documentation references from WPILib headers
  const xboxDocMethods = [
    { name: "double GetLeftX()", desc: "Lecture de la valeur X du stick analogique gauche. Droite positif." },
    { name: "double GetLeftY()", desc: "Lecture de la valeur Y du stick analogique gauche. Arrière positif (inversé par rapport aux standards habituels)." },
    { name: "double GetRightX()", desc: "Lecture de la valeur X du stick analogique droit. Droite positif." },
    { name: "double GetRightY()", desc: "Lecture de la valeur Y du stick analogique droit. Arrière positif." },
    { name: "double GetLeftTriggerAxis()", desc: "Lecture de l'axe analogique de la gâchette gauche, retournant une valeur de 0.0 à 1.0." },
    { name: "double GetRightTriggerAxis()", desc: "Lecture de l'axe analogique de la gâchette droite, de 0.0 à 1.0." },
    { name: "bool GetAButton()", desc: "Retourne vrai si le bouton A est enfoncé." },
    { name: "bool GetAButtonPressed()", desc: "Retourne vrai si le bouton A a été pressé depuis la dernière vérification." },
    { name: "bool GetAButtonReleased()", desc: "Retourne vrai si le bouton A a été relâché depuis la dernière vérification." },
    { name: "bool GetBButton()", desc: "Retourne vrai si le bouton B est enfoncé." },
    { name: "bool GetXButton()", desc: "Retourne vrai si le bouton X est enfoncé." },
    { name: "bool GetYButton()", desc: "Retourne vrai si le bouton Y est enfoncé." },
    { name: "bool GetLeftBumperButton()", desc: "Retourne vrai si le bumper gauche (LB) est enfoncé." },
    { name: "bool GetRightBumperButton()", desc: "Retourne vrai si le bumper droit (RB) est enfoncé." },
    { name: "bool GetLeftStickButton()", desc: "Retourne vrai si le stick gauche est enfoncé." },
    { name: "bool GetRightStickButton()", desc: "Retourne vrai si le stick droit est enfoncé." },
    { name: "bool GetBackButton()", desc: "Retourne vrai si le bouton BACK est enfoncé." },
    { name: "bool GetStartButton()", desc: "Retourne vrai si le bouton START est enfoncé." },
    { name: "int GetPOV()", desc: "Retourne l'angle actuel du D-Pad en degrés (0 à 360, par incréments de 45). Retourne -1 si relâché." }
  ];

  const joystickDocMethods = [
    { name: "double GetX()", desc: "Obtient la valeur de l'axe horizontal (X) principal du manche. Droite positif." },
    { name: "double GetY()", desc: "Obtient la valeur de l'axe vertical (Y) principal du manche. Arrière positif." },
    { name: "double GetZ()", desc: "Obtient la valeur de l'axe Z. Typiquement lié à la torsion (twist)." },
    { name: "double GetTwist()", desc: "Obtient la torsion angulaire du manche sur lui-même." },
    { name: "double GetThrottle()", desc: "Obtient la valeur de la molette des gaz (Throttle) située à la base. Varie de -1.0 à 1.0." },
    { name: "bool GetTrigger()", desc: "Vérifie si la gâchette principale (Button 1) est actuellement enfoncée." },
    { name: "bool GetTriggerPressed()", desc: "Vérifie si la gâchette principale a été pressée depuis la dernière vérification." },
    { name: "bool GetTriggerReleased()", desc: "Vérifie si la gâchette principale a été relâchée depuis la dernière vérification." },
    { name: "bool GetTop()", desc: "Vérifie l'état du bouton de pouce (Button 2) situé au sommet." },
    { name: "bool GetTopPressed()", desc: "Vérifie si le bouton de pouce a été pressé depuis la dernière vérification." },
    { name: "bool GetTopReleased()", desc: "Vérifie si le bouton de pouce a été relâché depuis la dernière vérification." },
    { name: "bool GetRawButton(int button)", desc: "Lecture de l'état logique de n'importe quel bouton connecté au port USB (ex: 1 à 12)." },
    { name: "double GetRawAxis(int axis)", desc: "Lecture de l'état logique de n'importe quel axe analogique connecté (ex: 0 à 3)." },
    { name: "double GetMagnitude()", desc: "Obtient la norme de la direction vectorielle formée par le manche." },
    { name: "units::radian_t GetDirection()", desc: "Obtient l'orientation angulaire en radians formée par la direction du manche." }
  ];

  // 3. Image Metadata for Wiring & Hardware Schematics
  const WIRING_IMAGES = [
    {
      id: 'basic',
      name: 'Schéma de Base FRC',
      url: '/images/frc_control_system_basic.svg',
      desc: 'Topologie de câblage de base officielle. Indispensable pour câbler le RoboRIO, le PDP, le disjoncteur principal de 120A, la batterie et les moteurs standard.'
    },
    {
      id: 'rev',
      name: 'Système REV Robotics',
      url: '/images/frc_control_system_rev.svg',
      desc: 'Configuration matérielle employant l\'écosystème REV Robotics : Power Distribution Hub (PDH), Pneumatic Hub (PH), disjoncteurs et variateurs Spark MAX.'
    },
    {
      id: 'complete',
      name: 'Schéma Complet FRC',
      url: '/images/frc_control_system_complete.svg',
      desc: 'Schéma global exhaustif incluant tous les modules du système de contrôle, les modules pneumatiques et le routage complet des bus Ethernet et CAN.'
    },
    {
      id: 'ctre',
      name: 'Schéma CTRE FRC',
      url: '/images/frc_control_system_ctre.png',
      desc: 'Topologie réseau avancée de Cross The Road Electronics (CTRE), exploitant le bus CAN étendu et les moteurs Kraken X60.'
    },
    {
      id: 'real',
      name: 'Photo du Montage Réel',
      url: '/images/real_hardware_setup.jpg',
      desc: 'Illustration physique d\'un banc d\'essai ou tableau de contrôle monté, idéal pour appréhender l\'agencement mécanique des câbles et des borniers.'
    }
  ];

  const [activeWiringImage, setActiveWiringImage] = useState('basic');

  const selectedWiring = WIRING_IMAGES.find(img => img.id === activeWiringImage) || WIRING_IMAGES[0];

  return (
    <div style={styles.container}>
      {/* Header Banner */}
      <div style={styles.header}>
        <div style={styles.headerTitleGroup}>
          <Gamepad2 size={26} style={{ color: 'var(--brand-red)' }} />
          <h2 style={styles.headerTitle}>STAN Robotix Programming & Mappings</h2>
        </div>
        <p style={styles.headerSubtitle}>
          Centre interactif de documentation des APIs de contrôleurs et des schémas de câblage matériel FRC.
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
                    Logitech F310 / Xbox 360
                  </button>
                  <button 
                    onClick={() => { setActiveController('joystick'); setHoveredElement(null); }}
                    className={activeController === 'joystick' ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Logitech Extreme 3D Pro
                  </button>
                </div>
                <span style={styles.helperText}>Survolez un bouton pour inspecter son API</span>
              </div>

              {/* CONTROLLER 1: LOGITECH F310 / XBOX GAMEPAD SVG */}
              {activeController === 'xbox' && (
                <div style={styles.svgWrapper}>
                  <svg viewBox="0 0 500 350" style={styles.svg}>
                    <defs>
                      <linearGradient id="body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2c3a59" />
                        <stop offset="100%" stopColor="#121824" />
                      </linearGradient>
                      <linearGradient id="grip-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0a0a0a" />
                        <stop offset="100%" stopColor="#1e1e1e" />
                      </linearGradient>
                      <radialGradient id="stick-grad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#444" />
                        <stop offset="80%" stopColor="#1c1c1c" />
                        <stop offset="100%" stopColor="#050505" />
                      </radialGradient>
                    </defs>

                    {/* Câble */}
                    <path d="M 250 50 C 250 20, 270 10, 280 -10" fill="none" stroke="#222" strokeWidth="6" />

                    {/* Triggers & Bumpers */}
                    {/* LB (Bumper Gauche) */}
                    <path 
                      id="lb" 
                      d="M 120 90 C 120 60, 180 60, 200 80 L 150 100 Z" 
                      fill={hoveredElement === 'leftBumper' ? 'var(--brand-red)' : '#222'} 
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('leftBumper')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    {/* RB (Bumper Droit) */}
                    <path 
                      id="rb" 
                      d="M 380 90 C 380 60, 320 60, 300 80 L 350 100 Z" 
                      fill={hoveredElement === 'rightBumper' ? 'var(--brand-red)' : '#222'} 
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('rightBumper')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    {/* LT (Trigger Gauche) */}
                    <path 
                      id="lt" 
                      d="M 130 70 C 130 40, 170 40, 180 60 L 150 80 Z" 
                      fill={hoveredElement === 'leftTrigger' ? 'var(--brand-red)' : '#111'} 
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('leftTrigger')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    {/* RT (Trigger Droit) */}
                    <path 
                      id="rt" 
                      d="M 370 70 C 370 40, 330 40, 320 60 L 350 80 Z" 
                      fill={hoveredElement === 'rightTrigger' ? 'var(--brand-red)' : '#111'} 
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('rightTrigger')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />

                    {/* Grips Noirs (Poignées) */}
                    <path d="M 100 150 C 50 180, 40 280, 60 310 C 80 340, 140 330, 160 250 C 170 200, 120 180, 100 150 Z" fill="url(#grip-grad)" />
                    <path d="M 400 150 C 450 180, 460 280, 440 310 C 420 340, 360 330, 340 250 C 330 200, 380 180, 400 150 Z" fill="url(#grip-grad)" />

                    {/* Corps principal bleu */}
                    <path id="main-body" d="M 200 80 C 250 75, 250 75, 300 80 C 350 85, 380 100, 410 130 C 440 160, 450 220, 410 280 C 380 320, 340 330, 330 250 C 320 180, 280 180, 250 180 C 220 180, 180 180, 170 250 C 160 330, 120 320, 90 280 C 50 220, 60 160, 90 130 C 120 100, 150 85, 200 80 Z" fill="url(#body-grad)" stroke="#475569" strokeWidth="2" />

                    {/* Base noire centrale */}
                    <path d="M 170 190 C 200 160, 300 160, 330 190 C 350 210, 340 260, 310 260 C 280 260, 270 230, 250 230 C 230 230, 220 260, 190 260 C 160 260, 150 210, 170 190 Z" fill="#151e2e" />

                    {/* D-Pad (POV) */}
                    <g 
                      id="dpad" 
                      transform="translate(140, 140)"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredElement('dpad')}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      <circle cx="0" cy="0" r="35" fill={hoveredElement === 'dpad' ? 'var(--brand-red-alpha-20)' : '#232d3d'} />
                      <path id="dpad-up" d="M -12 -30 L 12 -30 L 12 -12 L -12 -12 Z" fill={hoveredElement === 'dpad' ? 'var(--brand-red)' : '#0f172a'} />
                      <path id="dpad-down" d="M -12 12 L 12 12 L 12 30 L -12 30 Z" fill={hoveredElement === 'dpad' ? 'var(--brand-red)' : '#0f172a'} />
                      <path id="dpad-left" d="M -30 -12 L -12 -12 L -12 12 L -30 12 Z" fill={hoveredElement === 'dpad' ? 'var(--brand-red)' : '#0f172a'} />
                      <path id="dpad-right" d="M 12 -12 L 30 -12 L 30 12 L 12 12 Z" fill={hoveredElement === 'dpad' ? 'var(--brand-red)' : '#0f172a'} />
                      <rect x="-12" y="-12" width="24" height="24" fill={hoveredElement === 'dpad' ? 'var(--brand-red)' : '#0f172a'} />
                    </g>

                    {/* Joysticks Analogiques */}
                    {/* Stick Gauche */}
                    <g 
                      id="left-stick" 
                      transform="translate(195, 220)"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredElement('leftStick')}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      <circle cx="0" cy="0" r="28" fill="#0a0a0a" />
                      <circle 
                        cx="0" 
                        cy="-2" 
                        r="22" 
                        fill={hoveredElement === 'leftStick' ? 'var(--brand-red-alpha-30)' : 'url(#stick-grad)'} 
                        stroke={hoveredElement === 'leftStick' ? 'var(--brand-red)' : 'none'}
                        strokeWidth={2}
                      />
                    </g>
                    {/* Stick Droite */}
                    <g 
                      id="right-stick" 
                      transform="translate(305, 220)"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredElement('rightStick')}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      <circle cx="0" cy="0" r="28" fill="#0a0a0a" />
                      <circle 
                        cx="0" 
                        cy="-2" 
                        r="22" 
                        fill={hoveredElement === 'rightStick' ? 'var(--brand-red-alpha-30)' : 'url(#stick-grad)'} 
                        stroke={hoveredElement === 'rightStick' ? 'var(--brand-red)' : 'none'}
                        strokeWidth={2}
                      />
                    </g>

                    {/* Action Buttons A, B, X, Y */}
                    <g id="action-buttons" transform="translate(365, 140)">
                      <circle cx="0" cy="0" r="42" fill="#232d3d" />
                      {/* X (Bleu) */}
                      <g 
                        id="button-x"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredElement('buttonX')}
                        onMouseLeave={() => setHoveredElement(null)}
                      >
                        <circle cx="-24" cy="0" r="11" fill={hoveredElement === 'buttonX' ? 'var(--brand-red)' : '#0033cc'} />
                        <circle cx="-24" cy="-1" r="8" fill={hoveredElement === 'buttonX' ? '#ef4444' : '#3366ff'} />
                        <text x="-27" y="3" fill="#fff" fontSize="9" fontWeight="800" style={{ pointerEvents: 'none' }}>X</text>
                      </g>
                      {/* Y (Jaune) */}
                      <g 
                        id="button-y"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredElement('buttonY')}
                        onMouseLeave={() => setHoveredElement(null)}
                      >
                        <circle cx="0" cy="-24" r="11" fill={hoveredElement === 'buttonY' ? 'var(--brand-red)' : '#cc9900'} />
                        <circle cx="0" cy="-25" r="8" fill={hoveredElement === 'buttonY' ? '#ef4444' : '#ffcc00'} />
                        <text x="-3" y="-21" fill="#000" fontSize="9" fontWeight="800" style={{ pointerEvents: 'none' }}>Y</text>
                      </g>
                      {/* B (Rouge) */}
                      <g 
                        id="button-b"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredElement('buttonB')}
                        onMouseLeave={() => setHoveredElement(null)}
                      >
                        <circle cx="24" cy="0" r="11" fill={hoveredElement === 'buttonB' ? 'var(--brand-red)' : '#cc0000'} />
                        <circle cx="24" cy="-1" r="8" fill={hoveredElement === 'buttonB' ? '#ff6666' : '#ff3333'} />
                        <text x="21" y="3" fill="#fff" fontSize="9" fontWeight="800" style={{ pointerEvents: 'none' }}>B</text>
                      </g>
                      {/* A (Vert) */}
                      <g 
                        id="button-a"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredElement('buttonA')}
                        onMouseLeave={() => setHoveredElement(null)}
                      >
                        <circle cx="0" cy="24" r="11" fill={hoveredElement === 'buttonA' ? 'var(--brand-red)' : '#008000'} />
                        <circle cx="0" cy="23" r="8" fill={hoveredElement === 'buttonA' ? '#4ade80' : '#33cc33'} />
                        <text x="-3" y="27" fill="#fff" fontSize="9" fontWeight="800" style={{ pointerEvents: 'none' }}>A</text>
                      </g>
                    </g>

                    {/* Central Buttons */}
                    <g id="center-buttons">
                      {/* Back */}
                      <rect 
                        id="btn-back" 
                        x="205" 
                        y="125" 
                        width="16" 
                        height="10" 
                        rx="5" 
                        fill={hoveredElement === 'backButton' ? 'var(--brand-red)' : '#0f172a'} 
                        style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={() => setHoveredElement('backButton')}
                        onMouseLeave={() => setHoveredElement(null)}
                      />
                      <text x="213" y="142" fontSize="5" fill="#94a3b8" textAnchor="middle" fontFamily="sans-serif">BACK</text>
                      
                      {/* Start */}
                      <rect 
                        id="btn-start" 
                        x="279" 
                        y="125" 
                        width="16" 
                        height="10" 
                        rx="5" 
                        fill={hoveredElement === 'startButton' ? 'var(--brand-red)' : '#0f172a'} 
                        style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={() => setHoveredElement('startButton')}
                        onMouseLeave={() => setHoveredElement(null)}
                      />
                      <text x="287" y="142" fontSize="5" fill="#94a3b8" textAnchor="middle" fontFamily="sans-serif">START</text>
                      
                      {/* Home / Mode Logo Button */}
                      <g id="btn-home" transform="translate(250, 140)">
                        <circle cx="0" cy="0" r="14" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                        <circle cx="0" cy="0" r="10" fill="#0f172a" />
                        <path d="M -4 -2 C -4 -4, -2 -6, 0 -6 C 2 -6, 4 -4, 4 -2 C 4 1, -4 4, -4 4 Z" fill="var(--brand-red)" />
                      </g>
                    </g>
                  </svg>
                </div>
              )}

              {/* CONTROLLER 2: LOGITECH EXTREME 3D PRO SVG */}
              {activeController === 'joystick' && (
                <div style={styles.svgWrapper}>
                  <svg viewBox="0 0 500 550" style={styles.svg}>
                    <defs>
                      <linearGradient id="silver-base" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f8fafc" />
                        <stop offset="50%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#64748b" />
                      </linearGradient>
                      <linearGradient id="stick-black" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#334155" />
                        <stop offset="50%" stopColor="#0f172a" />
                        <stop offset="100%" stopColor="#020617" />
                      </linearGradient>
                    </defs>

                    {/* Câble */}
                    <path d="M 160 270 C 120 250, 80 260, 50 240" fill="none" stroke="#222" strokeWidth="5" />

                    {/* Base Noire Feet */}
                    <g id="black-base-legs">
                      <path d="M 180 270 L 80 300 C 60 310, 60 340, 80 350 L 130 360 L 180 320 Z" fill="#0f172a" />
                      <path d="M 90 315 L 120 345 L 145 325 L 105 305 Z" fill="#1e293b" opacity="0.4" />
                      
                      <path d="M 320 270 L 420 300 C 440 310, 440 340, 420 350 L 370 360 L 320 320 Z" fill="#0f172a" />
                      <path d="M 410 315 L 380 345 L 355 325 L 395 305 Z" fill="#1e293b" opacity="0.4" />
                      
                      <path d="M 200 400 L 220 480 C 230 500, 270 500, 280 480 L 300 400 Z" fill="#0f172a" />
                      <path d="M 230 420 L 240 470 L 260 470 L 270 420 Z" fill="#1e293b" opacity="0.4" />
                    </g>

                    {/* Chassis central argenté */}
                    <path id="silver-chassis" d="M 250 250 C 350 250, 400 320, 360 380 C 330 420, 280 430, 250 430 C 220 430, 170 420, 140 380 C 100 320, 150 250, 250 250 Z" fill="url(#silver-base)" stroke="#475569" strokeWidth="2" />

                    {/* Soufflet du manche */}
                    <g id="stick-boot">
                      <ellipse cx="250" cy="300" rx="55" ry="25" fill="#111" />
                      <ellipse cx="250" cy="290" rx="45" ry="20" fill="#222" />
                      <ellipse cx="250" cy="280" rx="35" ry="15" fill="#111" />
                    </g>

                    {/* Boutons de la Base (Côté Gauche) */}
                    <g 
                      id="base-buttons" 
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredElement('baseButtons')}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      <path id="base-btn-7" d="M 160 320 L 180 325 L 175 345 L 155 340 Z" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" />
                      <path id="base-btn-8" d="M 185 327 L 205 330 L 200 350 L 180 347 Z" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" />
                      <path id="base-btn-9" d="M 210 332 L 230 332 L 225 352 L 205 352 Z" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" />
                      
                      <path id="base-btn-10" d="M 145 350 L 165 355 L 160 375 L 140 370 Z" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" />
                      <path id="base-btn-11" d="M 170 357 L 190 360 L 185 380 L 165 377 Z" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" />
                      <path id="base-btn-12" d="M 195 362 L 215 362 L 210 382 L 190 382 Z" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" />
                    </g>

                    {/* Molette des gaz (Throttle) */}
                    <g 
                      id="throttle" 
                      transform="translate(340, 350)"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredElement('throttle')}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      <rect x="0" y="-15" width="20" height="40" rx="5" fill={hoveredElement === 'throttle' ? 'var(--brand-red)' : '#020617'} />
                      <path d="M 5 -10 L 15 -10 L 15 20 L 5 20 Z" fill="#475569" />
                      <rect x="-5" y="0" width="30" height="4" fill="#020617" />
                    </g>

                    {/* Stick Column */}
                    <g 
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredElement('stickY')}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      <path 
                        d="M 220 280 C 220 180, 180 150, 180 80 C 200 60, 240 50, 270 70 C 270 140, 280 180, 280 280 Z" 
                        fill={hoveredElement === 'stickY' || hoveredElement === 'stickX' || hoveredElement === 'stickZ' ? 'var(--brand-red-alpha-30)' : 'url(#stick-black)'} 
                        stroke={hoveredElement === 'stickY' || hoveredElement === 'stickX' || hoveredElement === 'stickZ' ? 'var(--brand-red)' : 'none'}
                        strokeWidth={2}
                        style={{ transition: 'all 0.15s' }}
                      />
                      <path d="M 275 240 C 310 240, 340 250, 340 260 C 340 270, 300 275, 275 275 Z" fill="#0f172a" />
                    </g>

                    {/* Tête du Manche */}
                    <path d="M 170 80 C 160 60, 170 40, 200 30 C 240 20, 280 40, 290 60 C 290 80, 270 90, 250 90 C 210 90, 180 100, 170 80 Z" fill="#1e293b" stroke="#475569" strokeWidth={1} />

                    {/* Gâchette Principale (Trigger) */}
                    <path 
                      id="trigger" 
                      d="M 175 85 C 160 95, 165 115, 175 120 C 180 115, 180 95, 175 85 Z" 
                      fill={hoveredElement === 'trigger' ? 'var(--brand-red)' : '#f1f5f9'} 
                      stroke="#475569"
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('trigger')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />

                    {/* Bouton de Pouce Latéral */}
                    <ellipse 
                      id="thumb-btn" 
                      cx="215" 
                      cy="110" 
                      rx="12" 
                      ry="18" 
                      fill={hoveredElement === 'thumb' ? 'var(--brand-red)' : '#e2e8f0'} 
                      transform="rotate(-20 215 110)" 
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={() => setHoveredElement('thumb')}
                      onMouseLeave={() => setHoveredElement(null)}
                    />

                    {/* Chapeau multidirectionnel (POV / Hat Switch) */}
                    <g 
                      id="hat-switch" 
                      transform="translate(220, 35)"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredElement('hatSwitch')}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      <circle cx="0" cy="0" r="16" fill={hoveredElement === 'hatSwitch' ? 'var(--brand-red)' : '#020617'} />
                      <circle cx="0" cy="-2" r="12" fill="#475569" />
                      <circle cx="0" cy="-4" r="8" fill="#0f172a" />
                    </g>

                    {/* Boutons supérieurs 3, 4, 5, 6 */}
                    <g id="top-buttons">
                      <polygon 
                        id="btn-top-1" 
                        points="190,40 205,35 200,45 185,50" 
                        fill={hoveredElement === 'btn3' ? 'var(--brand-red)' : '#cbd5e1'} 
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredElement('btn3')}
                        onMouseLeave={() => setHoveredElement(null)}
                      />
                      <polygon 
                        id="btn-top-2" 
                        points="180,55 195,50 190,60 175,65" 
                        fill={hoveredElement === 'btn4' ? 'var(--brand-red)' : '#cbd5e1'} 
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredElement('btn4')}
                        onMouseLeave={() => setHoveredElement(null)}
                      />
                      <polygon 
                        id="btn-top-3" 
                        points="245,35 260,40 255,50 240,45" 
                        fill={hoveredElement === 'btn5' ? 'var(--brand-red)' : '#cbd5e1'} 
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredElement('btn5')}
                        onMouseLeave={() => setHoveredElement(null)}
                      />
                      <polygon 
                        id="btn-top-4" 
                        points="255,50 270,55 265,65 250,60" 
                        fill={hoveredElement === 'btn6' ? 'var(--brand-red)' : '#cbd5e1'} 
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredElement('btn6')}
                        onMouseLeave={() => setHoveredElement(null)}
                      />
                    </g>
                  </svg>
                </div>
              )}
            </div>

            {/* Right Panel: Detail HUD, Code Selector & Documentation List */}
            <div style={styles.hudCard}>
              {hoveredElement ? (
                <div className="glass-panel animate-fade" style={styles.hudContent}>
                  
                  {/* Badge & Title */}
                  <div style={styles.hudHeader}>
                    <span style={styles.badge}>
                      {activeController === 'xbox' ? xboxMappings[hoveredElement].type : joystickMappings[hoveredElement].type}
                    </span>
                    <h3 style={styles.hudTitle}>
                      {activeController === 'xbox' ? xboxMappings[hoveredElement].name : joystickMappings[hoveredElement].name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p style={styles.hudDesc}>
                    {activeController === 'xbox' ? xboxMappings[hoveredElement].desc : joystickMappings[hoveredElement].desc}
                  </p>

                  <div style={styles.infoRow}>
                    <Info size={14} style={{ color: 'var(--brand-red)' }} />
                    <span style={styles.infoLabel}>Position standard : </span>
                    <span style={styles.infoValue}>
                      {activeController === 'xbox' ? xboxMappings[hoveredElement].pos : joystickMappings[hoveredElement].pos}
                    </span>
                  </div>

                  {/* Code Selector & Box */}
                  <div style={styles.codeBlockContainer}>
                    <div style={styles.codeBlockHeader}>
                      <span>Exemple d'utilisation</span>
                      <div style={styles.langSelector}>
                        <button 
                          onClick={() => setCodeLang('cpp')}
                          style={{
                            ...styles.langBtn,
                            backgroundColor: codeLang === 'cpp' ? 'var(--brand-red-alpha-20)' : 'transparent',
                            color: codeLang === 'cpp' ? 'var(--text-main)' : 'var(--text-muted)'
                          }}
                        >
                          C++
                        </button>
                        <button 
                          onClick={() => setCodeLang('java')}
                          style={{
                            ...styles.langBtn,
                            backgroundColor: codeLang === 'java' ? 'var(--brand-red-alpha-20)' : 'transparent',
                            color: codeLang === 'java' ? 'var(--text-main)' : 'var(--text-muted)'
                          }}
                        >
                          Java
                        </button>
                      </div>
                      <button 
                        onClick={() => triggerCopy(activeController === 'xbox' 
                          ? (codeLang === 'cpp' ? xboxMappings[hoveredElement].wpilibCpp : xboxMappings[hoveredElement].wpilibJava)
                          : (codeLang === 'cpp' ? joystickMappings[hoveredElement].wpilibCpp : joystickMappings[hoveredElement].wpilibJava)
                        )}
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
                        {activeController === 'xbox' 
                          ? (codeLang === 'cpp' ? xboxMappings[hoveredElement].wpilibCpp : xboxMappings[hoveredElement].wpilibJava)
                          : (codeLang === 'cpp' ? joystickMappings[hoveredElement].wpilibCpp : joystickMappings[hoveredElement].wpilibJava)
                        }
                      </code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="glass-panel" style={styles.hudEmpty}>
                  <Gamepad2 size={40} style={{ color: 'var(--text-light)', marginBottom: '14px' }} />
                  <h4>Survoler un composant</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '280px', marginTop: '4px' }}>
                    Passez votre souris sur les zones interactives de la manette pour afficher la documentation API WPILib.
                  </p>
                </div>
              )}

              {/* Class API Documentation reference block */}
              <div className="glass-panel" style={styles.docPanel}>
                <div style={styles.docHeader}>
                  <h4 style={styles.docPanelTitle}>
                    {activeController === 'xbox' ? "Classe frc::XboxController" : "Classe frc::Joystick"}
                  </h4>
                  <a 
                    href={activeController === 'xbox' 
                      ? "https://github.wpilib.org/allwpilib/docs/release/cpp/classfrc_1_1_xbox_controller.html"
                      : "https://github.wpilib.org/allwpilib/docs/release/cpp/classfrc_1_1_joystick.html"
                    }
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={styles.docLink}
                  >
                    Doc WPILib <ExternalLink size={12} />
                  </a>
                </div>
                
                <p style={styles.docMeta}>
                  {activeController === 'xbox' 
                    ? "#include <frc/XboxController.h> (C++)" 
                    : "#include <frc/Joystick.h> (C++)"
                  }
                </p>

                <div style={styles.docMethodsList}>
                  <div style={styles.methodsHeader}>Méthodes publiques de référence :</div>
                  {(activeController === 'xbox' ? xboxDocMethods : joystickDocMethods).map((method, idx) => (
                    <div key={idx} style={styles.methodItem}>
                      <code style={styles.methodName}>{method.name}</code>
                      <span style={styles.methodDesc}>{method.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: WIRING DIAGRAM PANEL GALLERY */
          <div className="glass-panel animate-fade" style={styles.wiringWorkspace}>
            
            {/* Wiring Selectors & Controls */}
            <div style={styles.wiringGallerySelector}>
              <div style={styles.wiringInfoTitle}>
                <h3 style={styles.wiringTitle}>Schémas Électriques et Câblages FRC</h3>
                <p style={styles.wiringDesc}>
                  Sélectionnez un schéma de montage officiel ou réel pour analyser l'agencement matériel.
                </p>
              </div>
              
              <div style={styles.wiringTabs}>
                {WIRING_IMAGES.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveWiringImage(item.id)}
                    style={{
                      ...styles.wiringTabBtn,
                      backgroundColor: activeWiringImage === item.id ? 'var(--brand-red)' : 'rgba(255,255,255,0.03)',
                      color: activeWiringImage === item.id ? '#fff' : 'var(--text-muted)',
                      border: activeWiringImage === item.id ? '1px solid var(--brand-red)' : '1px solid var(--border-color)'
                    }}
                  >
                    <ImageIcon size={14} />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Schematic Display area */}
            <div style={styles.wiringLayout}>
              <div style={styles.imageCard}>
                <div style={styles.imageHeaderControls}>
                  <span style={styles.activeImageBadge}>
                    Fichier : {selectedWiring.url.split('/').pop()}
                  </span>
                  <a 
                    href={selectedWiring.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-primary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Ouvrir en plein écran <ExternalLink size={12} />
                  </a>
                </div>
                <img 
                  src={selectedWiring.url} 
                  alt={selectedWiring.name} 
                  style={styles.wiringImage} 
                />
              </div>

              {/* Guide / Description details side panel */}
              <div style={styles.wiringGuide}>
                <div style={styles.wiringImageDetailCard}>
                  <h4 style={styles.guideTitle}>{selectedWiring.name}</h4>
                  <p style={styles.selectedWiringDesc}>{selectedWiring.desc}</p>
                </div>

                <h4 style={{ ...styles.guideTitle, marginTop: '1rem' }}>Composants clés du système FRC</h4>
                <div style={styles.guideList}>
                  <div style={styles.guideItem}>
                    <div style={styles.guideHeader}>
                      <div style={styles.guideDot}></div>
                      <span style={styles.guideName}>RoboRIO 2.0 (Cerveau)</span>
                    </div>
                    <p style={styles.guideDesc}>Exécute le code C++/Java, gère le Wi-Fi (via Radio), les ports USB des caméras, la boucle réseau CAN et les entrées/sorties analogiques.</p>
                  </div>
                  <div style={styles.guideItem}>
                    <div style={styles.guideHeader}>
                      <div style={styles.guideDot}></div>
                      <span style={styles.guideName}>PDH / PDP (Alimentation)</span>
                    </div>
                    <p style={styles.guideDesc}>Distribue l'énergie de la batterie 12V vers les variateurs de vitesse et les sous-systèmes via des fusibles réarmables.</p>
                  </div>
                  <div style={styles.guideItem}>
                    <div style={styles.guideHeader}>
                      <div style={styles.guideDot}></div>
                      <span style={styles.guideName}>Variateurs Spark MAX / Talon FX</span>
                    </div>
                    <p style={styles.guideDesc}>Assurent le contrôle haute performance des moteurs brushless (NEO, Kraken X60) connectés sur le bus réseau CAN.</p>
                  </div>
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
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 'var(--border-radius-md)',
    minHeight: '400px'
  },
  svg: {
    width: '100%',
    maxHeight: '480px'
  },
  hudCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
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
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    overflow: 'hidden'
  },
  codeBlockHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 12px',
    backgroundColor: 'rgba(0,0,0,0.2)',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border-color)'
  },
  langSelector: {
    display: 'flex',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '4px',
    padding: '2px'
  },
  langBtn: {
    padding: '2px 8px',
    fontSize: '0.7rem',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all var(--transition-fast)'
  },
  copyBtn: {
    color: 'var(--text-muted)',
    cursor: 'pointer',
    border: 'none',
    background: 'none'
  },
  codeBlock: {
    backgroundColor: '#070a13',
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
    minHeight: '220px',
    backgroundColor: 'rgba(255,255,255,0.01)',
    color: 'var(--text-main)'
  },

  // DOC PANEL REFERENCE STYLES
  docPanel: {
    borderRadius: 'var(--border-radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '1.25rem',
    backgroundColor: 'var(--bg-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  docHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  docPanelTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--text-main)'
  },
  docLink: {
    fontSize: '0.75rem',
    color: 'var(--brand-red)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '600'
  },
  docMeta: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: '3px 6px',
    borderRadius: '3px',
    alignSelf: 'start'
  },
  docMethodsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '6px',
    maxHeight: '280px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  methodsHeader: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-muted)'
  },
  methodItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    paddingBottom: '6px',
    borderBottom: '1px solid rgba(255,255,255,0.03)'
  },
  methodName: {
    fontSize: '0.75rem',
    color: '#38bdf8',
    fontFamily: 'monospace'
  },
  methodDesc: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)'
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
  wiringGallerySelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1.25rem'
  },
  wiringInfoTitle: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  wiringTitle: {
    fontSize: '1.2rem',
    fontWeight: '700'
  },
  wiringDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  wiringTabs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  wiringTabBtn: {
    padding: '6px 12px',
    fontSize: '0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s'
  },
  wiringLayout: {
    display: 'grid',
    gridTemplateColumns: '1.3fr 0.7fr',
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
    backgroundColor: '#ffffff', // white background for blueprint contrast
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  imageHeaderControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    padding: '6px 10px',
    borderRadius: '4px'
  },
  activeImageBadge: {
    fontSize: '0.72rem',
    fontFamily: 'monospace',
    color: '#94a3b8'
  },
  wiringImage: {
    width: '100%',
    height: 'auto',
    display: 'block',
    borderRadius: '4px',
    maxHeight: '600px',
    objectFit: 'contain'
  },
  wiringGuide: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  wiringImageDetailCard: {
    padding: '12px',
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)'
  },
  selectedWiringDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    marginTop: '6px'
  },
  guideTitle: {
    fontSize: '0.95rem',
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
