import React, { useState } from 'react';
import { 
  Gamepad2, Cpu, Copy, CheckCircle2, Info, ExternalLink, Image as ImageIcon
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

  // 1. Xbox Controller Mappings (C++ FRC WPILib Command-Based)
  const xboxMappings = {
    leftStick: {
      name: "Stick Analogique Gauche",
      type: "Axes 0 (X) & 1 (Y) + Clic 9",
      wpilibCpp: `// Déclaration (dans RobotContainer.h)
#include <frc2/command/button/CommandXboxController.h>
frc2::CommandXboxController m_driverController{0};

// Lecture de l'axe Y pour l'avance (DefaultDriveCommand.cpp)
// Note: l'axe Y est inversé par défaut dans WPILib (Avant = négatif)
double forwardSpeed = -m_driverController.GetLeftY();
double strafeSpeed = -m_driverController.GetLeftX();`,
      desc: "Principalement utilisé pour le déplacement du robot (Translations X/Y). L'axe Y est négatif vers l'avant, d'où la nécessité de l'inverser.",
      pos: "Milieu Gauche"
    },
    rightStick: {
      name: "Stick Analogique Droite",
      type: "Axes 4 (X) & 5 (Y) + Clic 10",
      wpilibCpp: `// Déclaration (dans RobotContainer.h)
#include <frc2/command/button/CommandXboxController.h>
frc2::CommandXboxController m_driverController{0};

// Lecture de la rotation (Swerve Drive)
double rotationSpeed = -m_driverController.GetRightX();`,
      desc: "Idéal pour piloter la vitesse angulaire (rotation) en Swerve Drive ou pour orienter une tourelle articulée.",
      pos: "Bas Droite"
    },
    buttonA: {
      name: "Bouton A (Vert)",
      type: "Bouton 1",
      wpilibCpp: `// Configuration des bindings (dans RobotContainer.cpp)
// Déclenche l'aspiration lorsque A est pressé
m_driverController.A().OnTrue(
  IntakeCommand(&m_intake).ToPtr()
);`,
      desc: "Bouton d'action rapide principal. Idéal pour activer l'aspiration (Intake) ou descendre un élévateur à son preset le plus bas.",
      pos: "Face droite (Bas)"
    },
    buttonB: {
      name: "Bouton B (Rouge)",
      type: "Bouton 2",
      wpilibCpp: `// Configuration des bindings (dans RobotContainer.cpp)
// Arrête tous les moteurs d'aspiration/lancement immédiatement
m_driverController.B().OnTrue(
  frc2::InstantCommand([this] { m_intake.Stop(); m_shooter.Stop(); }, {&m_intake, &m_shooter}).ToPtr()
);`,
      desc: "Utilisé pour des mécanismes secondaires ou pour couper immédiatement l'exécution des commandes actives (Emergency Stop).",
      pos: "Face droite (Droite)"
    },
    buttonX: {
      name: "Bouton X (Bleu)",
      type: "Bouton 3",
      wpilibCpp: `// Configuration des bindings (dans RobotContainer.cpp)
// Lance le volant du tireur (Shooter spin-up)
m_driverController.X().OnTrue(
  PrepareShooterCommand(&m_shooter).ToPtr()
);`,
      desc: "Idéal pour lancer l'accélération d'un volant de tir (Shooter spin-up) ou pour enclencher une commande de visée automatique.",
      pos: "Face droite (Gauche)"
    },
    buttonY: {
      name: "Bouton Y (Jaune)",
      type: "Bouton 4",
      wpilibCpp: `// Configuration des bindings (dans RobotContainer.cpp)
// Déploie les vérins du grimpeur (Climber)
m_driverController.Y().OnTrue(
  ClimbDeployCommand(&m_climber).ToPtr()
);`,
      desc: "Classiquement assigné au déploiement du grimpeur (Climber) ou pour élever le robot en fin de match.",
      pos: "Face droite (Haut)"
    },
    leftBumper: {
      name: "Gâchette Haute Gauche (LB)",
      type: "Bouton 5",
      wpilibCpp: `// Configuration des bindings (dans RobotContainer.cpp)
// Inverse le sens de l'intake tant que le bouton est maintenu (Eject)
m_driverController.LeftBumper().WhileTrue(
  EjectCommand(&m_intake).ToPtr()
);`,
      desc: "Bouton ON/OFF rapide. Très utilisé pour inverser le sens de l'intake en cas de bourrage de note ou de cube.",
      pos: "Bumper Gauche"
    },
    rightBumper: {
      name: "Gâchette Haute Droite (RB)",
      type: "Bouton 6",
      wpilibCpp: `// Configuration des bindings (dans RobotContainer.cpp)
// Relâche le projectile (Trigger final de tir)
m_driverController.RightBumper().OnTrue(
  FeedToShooterCommand(&m_feeder).ToPtr()
);`,
      desc: "Bouton ON/OFF rapide. Généralement configuré comme le déclencheur final pour libérer le projectile vers le shooter.",
      pos: "Bumper Droite"
    },
    leftTrigger: {
      name: "Gâchette Basse Gauche (LT)",
      type: "Axe 2",
      wpilibCpp: `// Lecture analogique (0.0 à 1.0)
double triggerVal = m_driverController.GetLeftTriggerAxis();

// Liaison Command-Based avec un seuil de déclenchement
m_driverController.LeftTrigger(0.5).OnTrue(
  SlowModeCommand(&m_drivetrain).ToPtr()
);`,
      desc: "Axe analogique très fluide. Pratique pour moduler la vitesse d'admission ou pour activer dynamiquement un mode de précision lente.",
      pos: "Arrière Gauche"
    },
    rightTrigger: {
      name: "Gâchette Basse Droite (RT)",
      type: "Axe 3",
      wpilibCpp: `// Lecture analogique (0.0 à 1.0)
double force = m_driverController.GetRightTriggerAxis();

// Liaison Command-Based avec un seuil de déclenchement (RT enfoncé à plus de 40%)
m_driverController.RightTrigger(0.4).WhileTrue(
  AimAndLockCommand(&m_drivetrain, &m_vision).ToPtr()
);`,
      desc: "Axe analogique. Utile pour la conduite progressive ou pour activer le verrouillage de cible par vision de manière analogique.",
      pos: "Arrière Droite"
    },
    dpad: {
      name: "Croix Directionnelle (D-Pad)",
      type: "Angles POV",
      wpilibCpp: `// Liaison Command-Based pour le bouton HAUT du D-Pad
m_driverController.POVUp().OnTrue(
  SetArmPositionCommand(&m_arm, ArmPosition::kHighGoal).ToPtr()
);

// Liaison pour le bouton BAS du D-Pad
m_driverController.POVDown().OnTrue(
  SetArmPositionCommand(&m_arm, ArmPosition::kFloorIntake).ToPtr()
);`,
      desc: "Retourne la direction sous forme d'angle en degrés. Utile pour sélectionner des presets discrets de bras ou réaligner le châssis face aux AprilTags (0°, 90°, 180°, 270°).",
      pos: "Bas Gauche"
    },
    backButton: {
      name: "Bouton Back (Retour)",
      type: "Bouton 7",
      wpilibCpp: `// Configuration des bindings (dans RobotContainer.cpp)
// Remet à zéro le cap du gyroscope (Gyro Reset / Calibration terrain)
m_driverController.Back().OnTrue(
  frc2::InstantCommand([this] { m_drivetrain.ZeroHeading(); }, {&m_drivetrain}).ToPtr()
);`,
      desc: "Bouton central gauche. Généralement réservé à la réinitialisation du cap du gyroscope (Gyro Reset / Field-oriented calibration).",
      pos: "Milieu Gauche"
    },
    startButton: {
      name: "Bouton Start",
      type: "Bouton 8",
      wpilibCpp: `// Configuration des bindings (dans RobotContainer.cpp)
// Bascule entre la conduite Field-Oriented et Robot-Oriented
m_driverController.Start().OnTrue(
  frc2::InstantCommand([this] { m_drivetrain.ToggleFieldOriented(); }, {&m_drivetrain}).ToPtr()
);`,
      desc: "Bouton central droit. Pratique pour alterner entre différents profils de pilotage ou basculer l'orientation du châssis.",
      pos: "Milieu Droite"
    }
  };

  // 2. Joystick Mappings (C++ FRC WPILib Command-Based)
  const joystickMappings = {
    trigger: {
      name: "Gâchette Principale (Trigger)",
      type: "Bouton 1",
      wpilibCpp: `// Déclaration (dans RobotContainer.h)
#include <frc/Joystick.h>
#include <frc2/command/button/JoystickButton.h>
frc::Joystick m_operatorStick{1}; // Port USB 1

// Binding (dans RobotContainer.cpp)
frc2::JoystickButton(&m_operatorStick, 1).OnTrue(
  ShootCommand(&m_shooter).ToPtr()
);`,
      desc: "Gâchette située sous l'index de la poignée. Assignée au lancement immédiat du tir en match.",
      pos: "Index"
    },
    thumb: {
      name: "Bouton de Pouce Latéral",
      type: "Bouton 2",
      wpilibCpp: `// Binding (dans RobotContainer.cpp)
// Active l'aspiration tant que pressé
frc2::JoystickButton(&m_operatorStick, 2).WhileTrue(
  IntakeCommand(&m_intake).ToPtr()
);`,
      desc: "Bouton situé sur le côté de la tête du manche. Facile d'accès sous le pouce.",
      pos: "Sommet (Pouce)"
    },
    stickX: {
      name: "Axe X (Gauche / Droite)",
      type: "Axe 0",
      wpilibCpp: `// Lecture (dans DefaultDriveCommand.cpp)
double strafe = m_operatorStick.GetX();`,
      desc: "Axe horizontal du manche. Utilisé pour les translations latérales en Swerve ou la rotation.",
      pos: "Déplacement Manche"
    },
    stickY: {
      name: "Axe Y (Avant / Arrière)",
      type: "Axe 1",
      wpilibCpp: `// Lecture (Inverser pour la marche avant : l'avant donne du négatif)
double throttleSpeed = -m_operatorStick.GetY();`,
      desc: "Axe vertical du manche. Par convention WPILib, l'avant renvoie une valeur négative.",
      pos: "Inclinaison Manche"
    },
    stickZ: {
      name: "Axe Z (Torsion / Twist)",
      type: "Axe 2",
      wpilibCpp: `// Lecture (Torsion horaire positif)
double twistValue = m_operatorStick.GetTwist();`,
      desc: "Obtenu en faisant pivoter le manche sur son propre axe vertical. Idéal pour faire pivoter le robot en Swerve Drive.",
      pos: "Torsion Manche"
    },
    throttle: {
      name: "Molette des gaz (Throttle)",
      type: "Axe 3",
      wpilibCpp: `// Lecture (Varie de -1.0 [Max avant] à 1.0 [Max arrière])
double rawThrottle = m_operatorStick.GetThrottle();

// Normaliser de 0.0 (vitesse min) à 1.0 (vitesse max) :
double speedFactor = (1.0 - rawThrottle) / 2.0;`,
      desc: "Axe curseur glissant situé à la base. Très utile pour brider ou configurer à la volée la vitesse maximale admissible du robot.",
      pos: "Curseur Base"
    },
    hatSwitch: {
      name: "Chapeau Chinois (POV / Hat Switch)",
      type: "Angles POV",
      wpilibCpp: `// Lecture de l'angle (0 = Haut, 90 = Droite, 180 = Bas, 270 = Gauche, -1 = Relâché)
int angle = m_operatorStick.GetPOV();

// Liaison conditionnelle dans la boucle périodique :
if (angle == 0) {
  m_arm.SetSetpoint(ArmPosition::kUpperScore);
}`,
      desc: "Mini joystick directionnel situé au sommet. Permet d'ajuster finement la visée caméra ou d'alterner les angles de tourelle.",
      pos: "Sommet"
    },
    btn3: {
      name: "Bouton Tête Gauche (Bouton 3)",
      type: "Bouton 3",
      wpilibCpp: `// Déclenche un alignement intelligent à gauche
frc2::JoystickButton(&m_operatorStick, 3).OnTrue(
  AlignLeftCommand(&m_vision).ToPtr()
);`,
      desc: "Bouton supérieur situé sur la partie gauche de la tête du manche.",
      pos: "Sommet Gauche"
    },
    btn4: {
      name: "Bouton Tête Droite (Bouton 4)",
      type: "Bouton 4",
      wpilibCpp: `// Déclenche un alignement intelligent à droite
frc2::JoystickButton(&m_operatorStick, 4).OnTrue(
  AlignRightCommand(&m_vision).ToPtr()
);`,
      desc: "Bouton supérieur situé sur la partie droite de la tête du manche.",
      pos: "Sommet Droite"
    },
    btn5: {
      name: "Bouton Tête Bas Gauche (Bouton 5)",
      type: "Bouton 5",
      wpilibCpp: `// Ramène le bras à la position d'aspiration au sol
frc2::JoystickButton(&m_operatorStick, 5).OnTrue(
  SetArmPositionCommand(&m_arm, ArmPosition::kFloor).ToPtr()
);`,
      desc: "Bouton inférieur situé sur la partie gauche de la tête du manche.",
      pos: "Sommet Bas-Gauche"
    },
    btn6: {
      name: "Bouton Tête Bas Droite (Bouton 6)",
      type: "Bouton 6",
      wpilibCpp: `// Ramène le bras à la position de stockage sécurisée (Stow)
frc2::JoystickButton(&m_operatorStick, 6).OnTrue(
  SetArmPositionCommand(&m_arm, ArmPosition::kStow).ToPtr()
);`,
      desc: "Bouton inférieur situé sur la partie droite de la tête du manche.",
      pos: "Sommet Bas-Droite"
    },
    baseButtons: {
      name: "Boutons de Base (7 à 12)",
      type: "Boutons 7 - 12",
      wpilibCpp: `// Liaison pour le bouton 7 de la base
frc2::JoystickButton(&m_operatorStick, 7).OnTrue(
  TestSubsystemCommand(&m_tester).ToPtr()
);

// Liaison pour le bouton 8 de la base
frc2::JoystickButton(&m_operatorStick, 8).OnTrue(
  CalibrateSensorsCommand(&m_sensors).ToPtr()
);`,
      desc: "Boutons poussoirs regroupés sur le socle gauche de la base. Idéal pour déclencher des séquences de test ou réétalonner des capteurs.",
      pos: "Base"
    }
  };

  // Documentation references from WPILib headers
  const xboxDocMethods = [
    { name: "double GetLeftX()", desc: "Lecture de la valeur X du stick analogique gauche. Droite positif." },
    { name: "double GetLeftY()", desc: "Lecture de la valeur Y du stick analogique gauche. Arrière positif." },
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
      desc: 'Topologie de câblage de base officielle. Indispensable pour raccorder les composants principaux de propulsion et l\'alimentation électrique générale.',
      components: [
        { name: "RoboRIO 1.0 / 2.0 (Cerveau)", desc: "Gère les signaux d'entrées/sorties (PWM, CAN, DIO, Analogiques) et l'interfaçage réseau WiFi." },
        { name: "Power Distribution Panel (PDP)", desc: "Boîtier de répartition du courant 12V vers les variateurs à l'aide de disjoncteurs thermiques de 10A à 40A." },
        { name: "Disjoncteur Principal 120A", desc: "Interrupteur coupe-circuit réarmable protégeant le robot contre les courts-circuits généraux." },
        { name: "Batterie FRC 12V 18Ah", desc: "Unique source d'énergie autorisée sur le robot, fournissant de forts appels de courant (jusqu'à plus de 300A)." },
        { name: "Talon SRX / Victor SPX", desc: "Variateurs de vitesse contrôlant les moteurs par bus CAN (boucle fermée) ou signal PWM classique." },
        { name: "Voltage Regulator Module (VRM)", desc: "Fournit du 5V et 12V ultra-régulés et protégés pour alimenter la radio sans fil et les caméras." }
      ]
    },
    {
      id: 'rev',
      name: 'Système REV Robotics',
      url: '/images/frc_control_system_rev.svg',
      desc: 'Configuration matérielle employant l\'écosystème matériel complet de REV Robotics avec bus CAN et alimentation intelligente.',
      components: [
        { name: "Power Distribution Hub (PDH)", desc: "Module d'alimentation 12V doté de 40 canaux fusibles, d'un monitoring télémétrique et d'une gestion intelligente des canaux commutés." },
        { name: "Pneumatic Hub (PH)", desc: "Contrôle les électrovannes pneumatiques en 12V/24V et régule le compresseur grâce à un capteur de pression analogique." },
        { name: "Radio Power Module (RPM)", desc: "Remplace le VRM pour alimenter la radio robot en fournissant du 18V passif PoE filtré contre les baisses de tension (brownouts)." },
        { name: "SPARK MAX Motor Controller", desc: "Variateur brushless intelligent relié au bus CAN, incluant le support des capteurs à effet Hall intégrés aux moteurs NEO." },
        { name: "Moteur NEO Brushless", desc: "Moteur triphasé synchrone de propulsion à haut rendement offrant un couple constant." }
      ]
    },
    {
      id: 'complete',
      name: 'Câblage Complet FRC',
      url: '/images/frc_control_system_complete.svg',
      desc: 'Schéma de topologie complet incluant le système de contrôle de vol, la pneumatique avancée, le compresseur et le routage des bus CAN/Ethernet.',
      components: [
        { name: "RoboRIO 2.0 Real-time", desc: "Système embarqué durci effectuant la boucle de contrôle d'asservissement en temps réel." },
        { name: "Compresseur pneumatique 12V", desc: "Alimente le circuit en air comprimé pour pressuriser les réservoirs jusqu'à 120 PSI maximum." },
        { name: "Électrovannes Solénoïdes", desc: "Valves commandées électriquement par le PH/PCM pour déplacer les pistons pneumatiques (double effet)." },
        { name: "Pressostat analogique", desc: "Mesure continuellement la pression d'air en PSI pour couper automatiquement le compresseur à 120 PSI." },
        { name: "Batterie & Fusible 120A", desc: "Sécurisation en entrée de puissance avec connecteurs SB50 blindés contre les déconnexions intempestives." }
      ]
    },
    {
      id: 'ctre',
      name: 'Schéma CTRE FRC',
      url: '/images/frc_control_system_ctre.png',
      desc: 'Topologie réseau avancée de Cross The Road Electronics (CTRE), exploitant le bus CAN FD étendu et les moteurs Kraken X60 avec Talon FX.',
      components: [
        { name: "RoboRIO 2.0 (Cerveau)", desc: "Contrôleur central relié en USB au CANivore pour décharger le bus de communication standard." },
        { name: "Radio Bi-bande VH-109", desc: "Nouvelle radio FRC WiFi 6E bi-bande pour des connexions de match ultra-rapides et immunisées contre le bruit de salle." },
        { name: "Robot Signal Light (RSL)", desc: "Feu indicateur orange obligatoire clignotant selon l'état d'armement du robot." },
        { name: "Kraken X60 (Talon FX intégré)", desc: "Moteur brushless de dernière génération à très haute densité de couple, intégrant son propre contrôleur Talon FX CAN FD." },
        { name: "CANivore (USB to CAN FD)", desc: "Interface USB convertissant le bus standard en un bus CAN FD rapide (1 Mbps), isolant la boucle de contrôle principale." },
        { name: "Spark MAX & Neo Vortex", desc: "Variateurs secondaires intégrés dans la même boucle d'alimentation électrique générale." }
      ]
    },
    {
      id: 'real',
      name: 'Photo du Montage Réel',
      url: '/images/real_hardware_setup.jpg',
      desc: 'Illustration physique d\'un banc d\'essai ou tableau de contrôle monté, idéal pour appréhender l\'agencement mécanique des câbles et des borniers.',
      components: [
        { name: "Plaque Polycarbonate texturée", desc: "Support isolant ajouré pour fixer les composants proprement et éviter les courts-circuits avec le châssis en aluminium." },
        { name: "Switch Ethernet (Brainboxes)", desc: "Commutateur compact alimenté en 12V permettant de relier le RoboRIO, la radio VH-109 et un Orange Pi ou Limelight." },
        { name: "Goulottes de Câblage", desc: "Canaux de protection en plastique permettant de cacher, regrouper et guider tous les fils électriques d'alimentation." },
        { name: "Borniers de distribution de masse", desc: "Raccordement centralisé des liaisons négatives (Ground) et de bus de données pour réduire les longueurs de câbles." },
        { name: "Kraken / Talon FX connecteurs", desc: "Câbles de bus de données blindés et connecteurs d'alimentation soudés proprement avec de la gaine thermo-rétractable." }
      ]
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
          Centre de documentation interactive des APIs C++ (WPILib) et de câblage de commande pour FRC.
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
                    <path d="M 250 50 C 250 20, 270 10, 280 -10" fill="none" stroke="#222" strokeWidth="6" style={{ pointerEvents: 'none' }} />

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
                    <path d="M 100 150 C 50 180, 40 280, 60 310 C 80 340, 140 330, 160 250 C 170 200, 120 180, 100 150 Z" fill="url(#grip-grad)" style={{ pointerEvents: 'none' }} />
                    <path d="M 400 150 C 450 180, 460 280, 440 310 C 420 340, 360 330, 340 250 C 330 200, 380 180, 400 150 Z" fill="url(#grip-grad)" style={{ pointerEvents: 'none' }} />

                    {/* Corps principal bleu */}
                    <path id="main-body" d="M 200 80 C 250 75, 250 75, 300 80 C 350 85, 380 100, 410 130 C 440 160, 450 220, 410 280 C 380 320, 340 330, 330 250 C 320 180, 280 180, 250 180 C 220 180, 180 180, 170 250 C 160 330, 120 320, 90 280 C 50 220, 60 160, 90 130 C 120 100, 150 85, 200 80 Z" fill="url(#body-grad)" stroke="#475569" strokeWidth="2" style={{ pointerEvents: 'none' }} />

                    {/* Base noire centrale */}
                    <path d="M 170 190 C 200 160, 300 160, 330 190 C 350 210, 340 260, 310 260 C 280 260, 270 230, 250 230 C 230 230, 220 260, 190 260 C 160 260, 150 210, 170 190 Z" fill="#151e2e" style={{ pointerEvents: 'none' }} />

                    {/* D-Pad (POV) */}
                    <g 
                      id="dpad" 
                      transform="translate(140, 140)"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredElement('dpad')}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      <circle cx="0" cy="0" r="35" fill={hoveredElement === 'dpad' ? 'var(--brand-red-alpha-20)' : '#232d3d'} style={{ pointerEvents: 'none' }} />
                      <path id="dpad-up" d="M -12 -30 L 12 -30 L 12 -12 L -12 -12 Z" fill={hoveredElement === 'dpad' ? 'var(--brand-red)' : '#0f172a'} style={{ pointerEvents: 'none' }} />
                      <path id="dpad-down" d="M -12 12 L 12 12 L 12 30 L -12 30 Z" fill={hoveredElement === 'dpad' ? 'var(--brand-red)' : '#0f172a'} style={{ pointerEvents: 'none' }} />
                      <path id="dpad-left" d="M -30 -12 L -12 -12 L -12 12 L -30 12 Z" fill={hoveredElement === 'dpad' ? 'var(--brand-red)' : '#0f172a'} style={{ pointerEvents: 'none' }} />
                      <path id="dpad-right" d="M 12 -12 L 30 -12 L 30 12 L 12 12 Z" fill={hoveredElement === 'dpad' ? 'var(--brand-red)' : '#0f172a'} style={{ pointerEvents: 'none' }} />
                      <rect x="-12" y="-12" width="24" height="24" fill={hoveredElement === 'dpad' ? 'var(--brand-red)' : '#0f172a'} style={{ pointerEvents: 'none' }} />
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
                      <circle cx="0" cy="0" r="28" fill="#0a0a0a" style={{ pointerEvents: 'none' }} />
                      <circle 
                        cx="0" 
                        cy="-2" 
                        r="22" 
                        fill={hoveredElement === 'leftStick' ? 'var(--brand-red-alpha-30)' : 'url(#stick-grad)'} 
                        stroke={hoveredElement === 'leftStick' ? 'var(--brand-red)' : 'none'}
                        strokeWidth={2}
                        style={{ pointerEvents: 'none' }}
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
                      <circle cx="0" cy="0" r="28" fill="#0a0a0a" style={{ pointerEvents: 'none' }} />
                      <circle 
                        cx="0" 
                        cy="-2" 
                        r="22" 
                        fill={hoveredElement === 'rightStick' ? 'var(--brand-red-alpha-30)' : 'url(#stick-grad)'} 
                        stroke={hoveredElement === 'rightStick' ? 'var(--brand-red)' : 'none'}
                        strokeWidth={2}
                        style={{ pointerEvents: 'none' }}
                      />
                    </g>

                    {/* Action Buttons A, B, X, Y */}
                    <g id="action-buttons" transform="translate(365, 140)">
                      <circle cx="0" cy="0" r="42" fill="#232d3d" style={{ pointerEvents: 'none' }} />
                      {/* X (Bleu) */}
                      <g 
                        id="button-x"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredElement('buttonX')}
                        onMouseLeave={() => setHoveredElement(null)}
                      >
                        <circle cx="-24" cy="0" r="11" fill={hoveredElement === 'buttonX' ? 'var(--brand-red)' : '#0033cc'} style={{ pointerEvents: 'none' }} />
                        <circle cx="-24" cy="-1" r="8" fill={hoveredElement === 'buttonX' ? '#ef4444' : '#3366ff'} style={{ pointerEvents: 'none' }} />
                        <text x="-27" y="3" fill="#fff" fontSize="9" fontWeight="800" style={{ pointerEvents: 'none' }}>X</text>
                      </g>
                      {/* Y (Jaune) */}
                      <g 
                        id="button-y"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredElement('buttonY')}
                        onMouseLeave={() => setHoveredElement(null)}
                      >
                        <circle cx="0" cy="-24" r="11" fill={hoveredElement === 'buttonY' ? 'var(--brand-red)' : '#cc9900'} style={{ pointerEvents: 'none' }} />
                        <circle cx="0" cy="-25" r="8" fill={hoveredElement === 'buttonY' ? '#ef4444' : '#ffcc00'} style={{ pointerEvents: 'none' }} />
                        <text x="-3" y="-21" fill="#000" fontSize="9" fontWeight="800" style={{ pointerEvents: 'none' }}>Y</text>
                      </g>
                      {/* B (Rouge) */}
                      <g 
                        id="button-b"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredElement('buttonB')}
                        onMouseLeave={() => setHoveredElement(null)}
                      >
                        <circle cx="24" cy="0" r="11" fill={hoveredElement === 'buttonB' ? 'var(--brand-red)' : '#cc0000'} style={{ pointerEvents: 'none' }} />
                        <circle cx="24" cy="-1" r="8" fill={hoveredElement === 'buttonB' ? '#ff6666' : '#ff3333'} style={{ pointerEvents: 'none' }} />
                        <text x="21" y="3" fill="#fff" fontSize="9" fontWeight="800" style={{ pointerEvents: 'none' }}>B</text>
                      </g>
                      {/* A (Vert) */}
                      <g 
                        id="button-a"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredElement('buttonA')}
                        onMouseLeave={() => setHoveredElement(null)}
                      >
                        <circle cx="0" cy="24" r="11" fill={hoveredElement === 'buttonA' ? 'var(--brand-red)' : '#008000'} style={{ pointerEvents: 'none' }} />
                        <circle cx="0" cy="23" r="8" fill={hoveredElement === 'buttonA' ? '#4ade80' : '#33cc33'} style={{ pointerEvents: 'none' }} />
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
                      <text x="213" y="142" fontSize="5" fill="#94a3b8" textAnchor="middle" fontFamily="sans-serif" style={{ pointerEvents: 'none' }}>BACK</text>
                      
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
                      <text x="287" y="142" fontSize="5" fill="#94a3b8" textAnchor="middle" fontFamily="sans-serif" style={{ pointerEvents: 'none' }}>START</text>
                      
                      {/* Home / Mode Logo Button */}
                      <g id="btn-home" transform="translate(250, 140)">
                        <circle cx="0" cy="0" r="14" fill="#1e293b" stroke="#475569" strokeWidth="1" style={{ pointerEvents: 'none' }} />
                        <circle cx="0" cy="0" r="10" fill="#0f172a" style={{ pointerEvents: 'none' }} />
                        <path d="M -4 -2 C -4 -4, -2 -6, 0 -6 C 2 -6, 4 -4, 4 -2 C 4 1, -4 4, -4 4 Z" fill="var(--brand-red)" style={{ pointerEvents: 'none' }} />
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
                    <path d="M 160 270 C 120 250, 80 260, 50 240" fill="none" stroke="#222" strokeWidth="5" style={{ pointerEvents: 'none' }} />

                    {/* Base Noire Feet */}
                    <g id="black-base-legs" style={{ pointerEvents: 'none' }}>
                      <path d="M 180 270 L 80 300 C 60 310, 60 340, 80 350 L 130 360 L 180 320 Z" fill="#0f172a" />
                      <path d="M 90 315 L 120 345 L 145 325 L 105 305 Z" fill="#1e293b" opacity="0.4" />
                      
                      <path d="M 320 270 L 420 300 C 440 310, 440 340, 420 350 L 370 360 L 320 320 Z" fill="#0f172a" />
                      <path d="M 410 315 L 380 345 L 355 325 L 395 305 Z" fill="#1e293b" opacity="0.4" />
                      
                      <path d="M 200 400 L 220 480 C 230 500, 270 500, 280 480 L 300 400 Z" fill="#0f172a" />
                      <path d="M 230 420 L 240 470 L 260 470 L 270 420 Z" fill="#1e293b" opacity="0.4" />
                    </g>

                    {/* Chassis central argenté */}
                    <path id="silver-chassis" d="M 250 250 C 350 250, 400 320, 360 380 C 330 420, 280 430, 250 430 C 220 430, 170 420, 140 380 C 100 320, 150 250, 250 250 Z" fill="url(#silver-base)" stroke="#475569" strokeWidth="2" style={{ pointerEvents: 'none' }} />

                    {/* Soufflet du manche */}
                    <g id="stick-boot" style={{ pointerEvents: 'none' }}>
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
                      <path id="base-btn-7" d="M 160 320 L 180 325 L 175 345 L 155 340 Z" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" style={{ pointerEvents: 'none' }} />
                      <path id="base-btn-8" d="M 185 327 L 205 330 L 200 350 L 180 347 Z" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" style={{ pointerEvents: 'none' }} />
                      <path id="base-btn-9" d="M 210 332 L 230 332 L 225 352 L 205 352 Z" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" style={{ pointerEvents: 'none' }} />
                      
                      <path id="base-btn-10" d="M 145 350 L 165 355 L 160 375 L 140 370 Z" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" style={{ pointerEvents: 'none' }} />
                      <path id="base-btn-11" d="M 170 357 L 190 360 L 185 380 L 165 377 Z" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" style={{ pointerEvents: 'none' }} />
                      <path id="base-btn-12" d="M 195 362 L 215 362 L 210 382 L 190 382 Z" fill={hoveredElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" style={{ pointerEvents: 'none' }} />
                    </g>

                    {/* Molette des gaz (Throttle) */}
                    <g 
                      id="throttle" 
                      transform="translate(340, 350)"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredElement('throttle')}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      <rect x="0" y="-15" width="20" height="40" rx="5" fill={hoveredElement === 'throttle' ? 'var(--brand-red)' : '#020617'} style={{ pointerEvents: 'none' }} />
                      <path d="M 5 -10 L 15 -10 L 15 20 L 5 20 Z" fill="#475569" style={{ pointerEvents: 'none' }} />
                      <rect x="-5" y="0" width="30" height="4" fill="#020617" style={{ pointerEvents: 'none' }} />
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
                        style={{ transition: 'all 0.15s', pointerEvents: 'none' }}
                      />
                      <path d="M 275 240 C 310 240, 340 250, 340 260 C 340 270, 300 275, 275 275 Z" fill="#0f172a" style={{ pointerEvents: 'none' }} />
                    </g>

                    {/* Tête du Manche */}
                    <path d="M 170 80 C 160 60, 170 40, 200 30 C 240 20, 280 40, 290 60 C 290 80, 270 90, 250 90 C 210 90, 180 100, 170 80 Z" fill="#1e293b" stroke="#475569" strokeWidth={1} style={{ pointerEvents: 'none' }} />

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
                      <circle cx="0" cy="0" r="16" fill={hoveredElement === 'hatSwitch' ? 'var(--brand-red)' : '#020617'} style={{ pointerEvents: 'none' }} />
                      <circle cx="0" cy="-2" r="12" fill="#475569" style={{ pointerEvents: 'none' }} />
                      <circle cx="0" cy="-4" r="8" fill="#0f172a" style={{ pointerEvents: 'none' }} />
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

            {/* Right Panel: Detail HUD, C++ Code Only & Documentation API */}
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

                  {/* Code Snippet Box (C++ Only) */}
                  <div style={styles.codeBlockContainer}>
                    <div style={styles.codeBlockHeader}>
                      <span>Exemple d'utilisation (C++ FRC WPILib)</span>
                      <button 
                        onClick={() => triggerCopy(activeController === 'xbox' 
                          ? xboxMappings[hoveredElement].wpilibCpp 
                          : joystickMappings[hoveredElement].wpilibCpp
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
                          ? xboxMappings[hoveredElement].wpilibCpp 
                          : joystickMappings[hoveredElement].wpilibCpp
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
                    Passez votre souris sur les boutons et joysticks à gauche pour afficher l'API C++ correspondante.
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
          /* TAB 2: WIRING DIAGRAM PANEL GALLERY WITH CUSTOM COMPONENT INFOS */
          <div className="glass-panel animate-fade" style={styles.wiringWorkspace}>
            
            {/* Wiring Gallery Selectors */}
            <div style={styles.wiringGallerySelector}>
              <div style={styles.wiringInfoTitle}>
                <h3 style={styles.wiringTitle}>Schémas Électriques et Câblages FRC</h3>
                <p style={styles.wiringDesc}>
                  Sélectionnez un schéma de montage officiel ou réel pour analyser l'agencement matériel et ses composants associés.
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

            {/* Schematic Layout & Side panel components list */}
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

              {/* Dynamic Description & Custom Components list */}
              <div style={styles.wiringGuide}>
                <div style={styles.wiringImageDetailCard}>
                  <h4 style={styles.guideTitle}>{selectedWiring.name}</h4>
                  <p style={styles.selectedWiringDesc}>{selectedWiring.desc}</p>
                </div>

                <h4 style={{ ...styles.guideTitle, marginTop: '1rem' }}>
                  Composants présents dans ce schéma ({selectedWiring.components.length})
                </h4>
                <div style={styles.guideList}>
                  {selectedWiring.components.map((comp, idx) => (
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
