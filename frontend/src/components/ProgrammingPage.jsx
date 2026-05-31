import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, Cpu, Copy, CheckCircle2, Info, ExternalLink, Image as ImageIcon,
  GitBranch, GitCommit, RefreshCw, Calendar, FileCode, ChevronDown, ChevronUp, AlertCircle,
  Lock, Network, Plus, Trash2, Edit3, Check, X, AlertTriangle
} from 'lucide-react';
import { api } from '../utils/api';

const GITHUB_REPOS_LIST = [
  { owner: 'stan-robotix-6622', name: '2026-StanRobotix-FRC', fullName: 'stan-robotix-6622/2026-StanRobotix-FRC' },
  { owner: 'stan-robotix-6622', name: '2026-StanRobotix-OffSeason', fullName: 'stan-robotix-6622/2026-StanRobotix-OffSeason' },
  { owner: 'stan-robotix-web', name: 'website', fullName: 'stan-robotix-web/website' },
  { owner: 'alban-pixel', name: 'kaban', fullName: 'alban-pixel/kaban' }
];

export default function ProgrammingPage() {
  const [activeTab, setActiveTab] = useState('mapping'); // 'mapping' | 'wiring' | 'github'
  const [activeController, setActiveController] = useState('xbox'); // 'xbox' | 'joystick'
  
  // Hover & Locked details state
  const [hoveredElement, setHoveredElement] = useState(null);
  const [lockedElement, setLockedElement] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleElementHover = (elementId) => {
    setHoveredElement(elementId);
  };

  const handleElementLeave = () => {
    if (lockedElement) {
      setHoveredElement(lockedElement);
    } else {
      setHoveredElement(null);
    }
  };

  const handleElementClick = (elementId) => {
    if (lockedElement === elementId) {
      setLockedElement(null);
    } else {
      setLockedElement(elementId);
      setHoveredElement(elementId);
    }
  };

  // GitHub News states
  const [commits, setCommits] = useState([]);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [commitsError, setCommitsError] = useState(null);
  const [selectedRepos, setSelectedRepos] = useState(['2026-StanRobotix-FRC', '2026-StanRobotix-OffSeason', 'website', 'kaban']);
  const [expandedCommits, setExpandedCommits] = useState({});

  const fetchCommits = async () => {
    setLoadingCommits(true);
    setCommitsError(null);
    try {
      const data = await api.getGithubCommits();
      setCommits(data || []);
    } catch (err) {
      console.error('Error fetching commits:', err);
      setCommitsError(err.message || 'Impossible de récupérer les commits depuis le serveur.');
    } finally {
      setLoadingCommits(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'github') {
      fetchCommits();
    }
  }, [activeTab]);

  // ==========================================
  // ROBOTS & CAN BUS CONFIGURATOR STATES
  // ==========================================
  const [robots, setRobots] = useState([]);
  const [selectedRobotId, setSelectedRobotId] = useState(null);
  const [canDevices, setCanDevices] = useState([]);
  const [loadingCan, setLoadingCan] = useState(false);
  const [canError, setCanError] = useState(null);

  // Modal states
  const [showAddRobotModal, setShowAddRobotModal] = useState(false);
  const [newRobotName, setNewRobotName] = useState('');
  const [newRobotDesc, setNewRobotDesc] = useState('');
  const [newRobotRepo, setNewRobotRepo] = useState('');
  const [isEditingRobot, setIsEditingRobot] = useState(false);

  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [newDeviceCanId, setNewDeviceCanId] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('Talon FX');
  const [newDeviceBus, setNewDeviceBus] = useState('rio');
  const [newDeviceSubsystem, setNewDeviceSubsystem] = useState('');
  const [newDeviceNotes, setNewDeviceNotes] = useState('');
  const [newDeviceBranch, setNewDeviceBranch] = useState('');

  // Git fetching states
  const [gitBranches, setGitBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [gitSubsystems, setGitSubsystems] = useState([]);
  const [loadingSubsystems, setLoadingSubsystems] = useState(false);

  // UI Filters
  const [canSearchQuery, setCanSearchQuery] = useState('');
  const [canFilterBus, setCanFilterBus] = useState('all');
  
  // Exporter tab
  const [showExporter, setShowExporter] = useState(false);
  const [copiedConstants, setCopiedConstants] = useState(false);

  const fetchBranchesForRepo = async (repoString) => {
    if (!repoString) {
      setGitBranches([]);
      return;
    }
    setLoadingBranches(true);
    try {
      const [owner, repo] = repoString.split('/');
      if (!owner || !repo) {
        setGitBranches([]);
        return;
      }
      const data = await api.getRepoBranches(owner, repo);
      setGitBranches(data.map(b => b.name) || []);
    } catch (err) {
      console.error('Error fetching branches:', err);
      setGitBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchSubsystemsForBranch = async (repoString, branchName) => {
    if (!repoString || !branchName) {
      setGitSubsystems([]);
      return;
    }
    setLoadingSubsystems(true);
    try {
      const [owner, repo] = repoString.split('/');
      if (!owner || !repo) {
        setGitSubsystems([]);
        return;
      }
      const data = await api.getRepoSubsystems(owner, repo, branchName);
      setGitSubsystems(data || []);
    } catch (err) {
      console.error('Error fetching subsystems:', err);
      setGitSubsystems([]);
    } finally {
      setLoadingSubsystems(false);
    }
  };

  const fetchRobots = async () => {
    setLoadingCan(true);
    setCanError(null);
    try {
      const data = await api.getRobots();
      setRobots(data || []);
      if (data && data.length > 0 && !selectedRobotId) {
        setSelectedRobotId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching robots:', err);
      setCanError('Impossible de charger la liste des robots.');
    } finally {
      setLoadingCan(false);
    }
  };

  const fetchCanDevices = async (robotId) => {
    if (!robotId) return;
    setLoadingCan(true);
    setCanError(null);
    try {
      const data = await api.getCanDevices(robotId);
      setCanDevices(data || []);
    } catch (err) {
      console.error('Error fetching CAN devices:', err);
      setCanError('Impossible de charger les périphériques CAN de ce robot.');
    } finally {
      setLoadingCan(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'canbus') {
      fetchRobots();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'canbus' && selectedRobotId) {
      fetchCanDevices(selectedRobotId);
    }
  }, [activeTab, selectedRobotId]);

  const handleCreateRobot = async (e) => {
    e.preventDefault();
    if (!newRobotName.trim()) return;
    try {
      setCanError(null);
      if (isEditingRobot) {
        const updated = await api.updateRobot(selectedRobotId, newRobotName.trim(), newRobotDesc.trim(), newRobotRepo.trim());
        setRobots(prev => prev.map(r => r.id === selectedRobotId ? updated : r).sort((a, b) => a.name.localeCompare(b.name)));
        setShowAddRobotModal(false);
        setNewRobotName('');
        setNewRobotDesc('');
        setNewRobotRepo('');
        setIsEditingRobot(false);
      } else {
        const newRobot = await api.createRobot(newRobotName.trim(), newRobotDesc.trim(), newRobotRepo.trim());
        setRobots(prev => [...prev, newRobot].sort((a, b) => a.name.localeCompare(b.name)));
        setSelectedRobotId(newRobot.id);
        setShowAddRobotModal(false);
        setNewRobotName('');
        setNewRobotDesc('');
        setNewRobotRepo('');
      }
    } catch (err) {
      console.error('Error saving robot:', err);
      alert(err.message || 'Erreur lors de l\'enregistrement du robot.');
    }
  };

  const handleOpenEditRobot = () => {
    const activeRobot = robots.find(r => r.id === selectedRobotId);
    if (!activeRobot) return;
    setNewRobotName(activeRobot.name);
    setNewRobotDesc(activeRobot.description || '');
    setNewRobotRepo(activeRobot.github_repo || '');
    setIsEditingRobot(true);
    setShowAddRobotModal(true);
  };

  const handleDeleteRobot = async (robotId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce robot et toutes ses configurations de bus CAN ?')) {
      return;
    }
    try {
      setCanError(null);
      await api.deleteRobot(robotId);
      const remainingRobots = robots.filter(r => r.id !== robotId);
      setRobots(remainingRobots);
      if (remainingRobots.length > 0) {
        setSelectedRobotId(remainingRobots[0].id);
      } else {
        setSelectedRobotId(null);
        setCanDevices([]);
      }
    } catch (err) {
      console.error('Error deleting robot:', err);
      alert(err.message || 'Erreur lors de la suppression du robot.');
    }
  };

  const handleOpenAddDevice = () => {
    setEditingDevice(null);
    setNewDeviceCanId('');
    setNewDeviceName('');
    setNewDeviceType('Talon FX');
    setNewDeviceBus('rio');
    setNewDeviceSubsystem('');
    setNewDeviceNotes('');
    setNewDeviceBranch('');
    setGitSubsystems([]);

    const activeRobot = robots.find(r => r.id === selectedRobotId);
    if (activeRobot && activeRobot.github_repo) {
      fetchBranchesForRepo(activeRobot.github_repo);
    } else {
      setGitBranches([]);
    }

    setShowAddDeviceModal(true);
  };

  const handleOpenEditDevice = (dev) => {
    setEditingDevice(dev);
    setNewDeviceCanId(dev.can_id.toString());
    setNewDeviceName(dev.name);
    setNewDeviceType(dev.device_type);
    setNewDeviceBus(dev.bus_type);
    setNewDeviceSubsystem(dev.subsystem || '');
    setNewDeviceNotes(dev.notes || '');
    setNewDeviceBranch(dev.git_branch || '');

    const activeRobot = robots.find(r => r.id === selectedRobotId);
    if (activeRobot && activeRobot.github_repo) {
      fetchBranchesForRepo(activeRobot.github_repo);
      if (dev.git_branch) {
        fetchSubsystemsForBranch(activeRobot.github_repo, dev.git_branch);
      } else {
        setGitSubsystems([]);
      }
    } else {
      setGitBranches([]);
      setGitSubsystems([]);
    }

    setShowAddDeviceModal(true);
  };

  const handleSaveDevice = async (e) => {
    e.preventDefault();
    if (newDeviceCanId === '' || !newDeviceName.trim()) return;
    const canIdInt = parseInt(newDeviceCanId);
    if (isNaN(canIdInt) || canIdInt < 0 || canIdInt > 62) {
      alert("L'ID CAN doit être un nombre entre 0 et 62.");
      return;
    }

    const payload = {
      can_id: canIdInt,
      name: newDeviceName.trim(),
      device_type: newDeviceType,
      bus_type: newDeviceBus,
      subsystem: newDeviceSubsystem.trim(),
      notes: newDeviceNotes.trim(),
      git_branch: newDeviceBranch.trim()
    };

    try {
      setCanError(null);
      if (editingDevice) {
        const updated = await api.updateCanDevice(editingDevice.id, payload);
        setCanDevices(prev => prev.map(d => d.id === editingDevice.id ? updated : d).sort((a, b) => a.can_id - b.can_id));
      } else {
        const created = await api.addCanDevice(selectedRobotId, payload);
        setCanDevices(prev => [...prev, created].sort((a, b) => a.can_id - b.can_id));
      }
      setShowAddDeviceModal(false);
    } catch (err) {
      console.error('Error saving CAN device:', err);
      alert(err.message || 'Erreur lors de la sauvegarde du périphérique.');
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm('Supprimer ce périphérique CAN ?')) return;
    try {
      setCanError(null);
      await api.deleteCanDevice(deviceId);
      setCanDevices(prev => prev.filter(d => d.id !== deviceId));
    } catch (err) {
      console.error('Error deleting CAN device:', err);
      alert(err.message || 'Erreur lors de la suppression.');
    }
  };

  const generateConstantsCode = () => {
    const robotName = robots.find(r => r.id === selectedRobotId)?.name || 'Robot';
    const cleanRobotName = robotName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    
    let code = `// Constantes du Bus CAN générées automatiquement pour ${robotName}\n`;
    code += `#ifndef CONSTANTS_${cleanRobotName}_H\n`;
    code += `#define CONSTANTS_${cleanRobotName}_H\n\n`;
    code += `namespace Constants {\n`;
    
    const subs = {};
    canDevices.forEach(d => {
      const s = d.subsystem.trim() || 'General';
      if (!subs[s]) subs[s] = [];
      subs[s].push(d);
    });

    Object.keys(subs).sort().forEach(sub => {
      code += `  // --- Sous-système: ${sub} ---\n`;
      subs[sub].forEach(d => {
        const varName = d.name
          .replace(/[^a-zA-Z0-9 ]/g, '')
          .split(' ')
          .map((word, i) => i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('');
        
        const detailsList = [];
        if (d.bus_type === 'canivore') detailsList.push('bus CANivore FD');
        if (d.git_branch) detailsList.push(`branche ${d.git_branch}`);
        const busComment = detailsList.length > 0 ? ` // ${detailsList.join(', ')}` : '';
        code += `  constexpr int k${varName.charAt(0).toUpperCase() + varName.slice(1)}CanID = ${d.can_id};${busComment}\n`;
      });
      code += `\n`;
    });
    
    code += `}\n\n`;
    code += `#endif // CONSTANTS_${cleanRobotName}_H\n`;
    return code;
  };

  const triggerCopyConstants = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedConstants(true);
    setTimeout(() => setCopiedConstants(false), 2000);
  };

  const toggleCommitExpand = (sha) => {
    setExpandedCommits(prev => ({
      ...prev,
      [sha]: !prev[sha]
    }));
  };

  const toggleRepoFilter = (repoName) => {
    setSelectedRepos(prev => 
      prev.includes(repoName)
        ? prev.filter(r => r !== repoName)
        : [...prev, repoName]
    );
  };

  function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffHr < 24) return `Il y a ${diffHr} h`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

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
      desc: "Bouton d'action rapide principal. Classiquement mappé pour l'admission (Intake) ou des presets de basse altitude.",
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

  const currentMapping = activeController === 'xbox' 
    ? (xboxMappings[hoveredElement] || {}) 
    : (joystickMappings[hoveredElement] || {});

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
        <button 
          onClick={() => setActiveTab('canbus')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'canbus' ? '3px solid var(--brand-red)' : '3px solid transparent',
            color: activeTab === 'canbus' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activeTab === 'canbus' ? '600' : '500'
          }}
        >
          <Network size={16} /> Bus CAN & Robots
        </button>
        <button 
          onClick={() => setActiveTab('github')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'github' ? '3px solid var(--brand-red)' : '3px solid transparent',
            color: activeTab === 'github' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activeTab === 'github' ? '600' : '500'
          }}
        >
          <GitBranch size={16} /> Github News
        </button>
      </div>

      {/* Active Tab Content Workspace */}
      <div style={styles.contentBody}>
        {activeTab === 'mapping' && (
          <div className="programming-mapping-grid">
            
            {/* Left panel: Controller Selection & SVG visualizer */}
            <div className="glass-panel" style={styles.controllerCard}>
              <div style={styles.controllerHeader}>
                <div style={styles.controllerSelectors}>
                  <button 
                    onClick={() => { setActiveController('xbox'); setHoveredElement(null); setLockedElement(null); }}
                    className={activeController === 'xbox' ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Logitech F310 / Xbox 360
                  </button>
                  <button 
                    onClick={() => { setActiveController('joystick'); setHoveredElement(null); setLockedElement(null); }}
                    className={activeController === 'joystick' ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Logitech Extreme 3D Pro
                  </button>
                </div>
                 <span style={styles.helperText}>Survolez un bouton pour inspecter son API, ou cliquez pour figer la vue</span>
              </div>

              {/* CONTROLLER 1: LOGITECH F310 / XBOX GAMEPAD SVG */}
              {activeController === 'xbox' && (
                <div style={styles.svgWrapper}>
                  <svg viewBox="0 0 500 350" style={styles.svg}>
                    <defs>
                      <linearGradient id="body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b4f7a" />
                        <stop offset="100%" stopColor="#1d283f" />
                      </linearGradient>
                      <linearGradient id="grip-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2c3545" />
                        <stop offset="100%" stopColor="#18202d" />
                      </linearGradient>
                      <radialGradient id="stick-grad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#444" />
                        <stop offset="80%" stopColor="#1c1c1c" />
                        <stop offset="100%" stopColor="#050505" />
                      </radialGradient>
                    </defs>

                    {/* Câble (Background) */}
                    <path d="M 250 50 C 250 20, 270 10, 280 -10" fill="none" stroke="#222" strokeWidth="6" style={{ pointerEvents: 'none' }} />

                    {/* Grips Noirs (Background) */}
                    <path d="M 100 150 C 50 180, 40 280, 60 310 C 80 340, 140 330, 160 250 C 170 200, 120 180, 100 150 Z" fill="url(#grip-grad)" stroke="#475569" strokeWidth="2" style={{ pointerEvents: 'none' }} />
                    <path d="M 400 150 C 450 180, 460 280, 440 310 C 420 340, 360 330, 340 250 C 330 200, 380 180, 400 150 Z" fill="url(#grip-grad)" stroke="#475569" strokeWidth="2" style={{ pointerEvents: 'none' }} />

                    {/* Corps principal bleu (Background) */}
                    <path id="main-body" d="M 200 80 C 250 75, 250 75, 300 80 C 350 85, 380 100, 410 130 C 440 160, 450 220, 410 280 C 380 320, 340 330, 330 250 C 320 180, 280 180, 250 180 C 220 180, 180 180, 170 250 C 160 330, 120 320, 90 280 C 50 220, 60 160, 90 130 C 120 100, 150 85, 200 80 Z" fill="url(#body-grad)" stroke="#475569" strokeWidth="2" style={{ pointerEvents: 'none' }} />

                    {/* Base noire centrale (Background) */}
                    <path d="M 170 190 C 200 160, 300 160, 330 190 C 350 210, 340 260, 310 260 C 280 260, 270 230, 250 230 C 230 230, 220 260, 190 260 C 160 260, 150 210, 170 190 Z" fill="#151e2e" style={{ pointerEvents: 'none' }} />

                    {/* Home / Mode Logo Button decoration (Background) */}
                    <g id="btn-home" transform="translate(250, 140)" style={{ pointerEvents: 'none' }}>
                      <circle cx="0" cy="0" r="14" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                      <circle cx="0" cy="0" r="10" fill="#0f172a" />
                      <path d="M -4 -2 C -4 -4, -2 -6, 0 -6 C 2 -6, 4 -4, 4 -2 C 4 1, -4 4, -4 4 Z" fill="var(--brand-red)" />
                    </g>

                    {/* Triggers & Bumpers (Interactive - Rendered on top of main body) */}
                    {/* LB (Bumper Gauche) */}
                    <path 
                      id="lb" 
                      d="M 120 90 C 120 60, 180 60, 200 80 L 150 100 Z" 
                      fill={hoveredElement === 'leftBumper' || lockedElement === 'leftBumper' ? 'var(--brand-red)' : '#222'} 
                      style={{ cursor: 'pointer', transition: 'all 0.15s', pointerEvents: 'all' }}
                      onMouseEnter={() => handleElementHover('leftBumper')}
                      onMouseLeave={handleElementLeave}
                      onClick={() => handleElementClick('leftBumper')}
                    />
                    {/* RB (Bumper Droit) */}
                    <path 
                      id="rb" 
                      d="M 380 90 C 380 60, 320 60, 300 80 L 350 100 Z" 
                      fill={hoveredElement === 'rightBumper' || lockedElement === 'rightBumper' ? 'var(--brand-red)' : '#222'} 
                      style={{ cursor: 'pointer', transition: 'all 0.15s', pointerEvents: 'all' }}
                      onMouseEnter={() => handleElementHover('rightBumper')}
                      onMouseLeave={handleElementLeave}
                      onClick={() => handleElementClick('rightBumper')}
                    />
                    {/* LT (Trigger Gauche) */}
                    <path 
                      id="lt" 
                      d="M 130 70 C 130 40, 170 40, 180 60 L 150 80 Z" 
                      fill={hoveredElement === 'leftTrigger' || lockedElement === 'leftTrigger' ? 'var(--brand-red)' : '#111'} 
                      style={{ cursor: 'pointer', transition: 'all 0.15s', pointerEvents: 'all' }}
                      onMouseEnter={() => handleElementHover('leftTrigger')}
                      onMouseLeave={handleElementLeave}
                      onClick={() => handleElementClick('leftTrigger')}
                    />
                    {/* RT (Trigger Droit) */}
                    <path 
                      id="rt" 
                      d="M 370 70 C 370 40, 330 40, 320 60 L 350 80 Z" 
                      fill={hoveredElement === 'rightTrigger' || lockedElement === 'rightTrigger' ? 'var(--brand-red)' : '#111'} 
                      style={{ cursor: 'pointer', transition: 'all 0.15s', pointerEvents: 'all' }}
                      onMouseEnter={() => handleElementHover('rightTrigger')}
                      onMouseLeave={handleElementLeave}
                      onClick={() => handleElementClick('rightTrigger')}
                    />

                    {/* D-Pad (POV) */}
                    <g 
                      id="dpad" 
                      transform="translate(140, 140)"
                    >
                      <circle cx="0" cy="0" r="35" fill={hoveredElement === 'dpad' || lockedElement === 'dpad' ? 'var(--brand-red-alpha-20)' : '#232d3d'} style={{ pointerEvents: 'none' }} />
                      <path id="dpad-up" d="M -12 -30 L 12 -30 L 12 -12 L -12 -12 Z" fill={hoveredElement === 'dpad' || lockedElement === 'dpad' ? 'var(--brand-red)' : '#0f172a'} style={{ pointerEvents: 'none' }} />
                      <path id="dpad-down" d="M -12 12 L 12 12 L 12 30 L -12 30 Z" fill={hoveredElement === 'dpad' || lockedElement === 'dpad' ? 'var(--brand-red)' : '#0f172a'} style={{ pointerEvents: 'none' }} />
                      <path id="dpad-left" d="M -30 -12 L -12 -12 L -12 12 L -30 12 Z" fill={hoveredElement === 'dpad' || lockedElement === 'dpad' ? 'var(--brand-red)' : '#0f172a'} style={{ pointerEvents: 'none' }} />
                      <path id="dpad-right" d="M 12 -12 L 30 -12 L 30 12 L 12 12 Z" fill={hoveredElement === 'dpad' || lockedElement === 'dpad' ? 'var(--brand-red)' : '#0f172a'} style={{ pointerEvents: 'none' }} />
                      <rect x="-12" y="-12" width="24" height="24" fill={hoveredElement === 'dpad' || lockedElement === 'dpad' ? 'var(--brand-red)' : '#0f172a'} style={{ pointerEvents: 'none' }} />
                      <circle cx="0" cy="0" r="35" fill="white" fillOpacity={0} style={{ cursor: 'pointer', pointerEvents: 'all' }} onMouseEnter={() => handleElementHover('dpad')} onMouseLeave={handleElementLeave} onClick={() => handleElementClick('dpad')} />
                    </g>

                    {/* Joysticks Analogiques */}
                    {/* Stick Gauche */}
                    <g 
                      id="left-stick" 
                      transform="translate(195, 220)"
                    >
                      <circle cx="0" cy="0" r="28" fill="#0a0a0a" style={{ pointerEvents: 'none' }} />
                      <circle 
                        cx="0" 
                        cy="-2" 
                        r="22" 
                        fill={hoveredElement === 'leftStick' || lockedElement === 'leftStick' ? 'var(--brand-red-alpha-30)' : 'url(#stick-grad)'} 
                        stroke={hoveredElement === 'leftStick' || lockedElement === 'leftStick' ? 'var(--brand-red)' : 'none'}
                        strokeWidth={2}
                        style={{ pointerEvents: 'none' }}
                      />
                      <circle cx="0" cy="0" r="28" fill="white" fillOpacity={0} style={{ cursor: 'pointer', pointerEvents: 'all' }} onMouseEnter={() => handleElementHover('leftStick')} onMouseLeave={handleElementLeave} onClick={() => handleElementClick('leftStick')} />
                    </g>
                    {/* Stick Droite */}
                    <g 
                      id="right-stick" 
                      transform="translate(305, 220)"
                    >
                      <circle cx="0" cy="0" r="28" fill="#0a0a0a" style={{ pointerEvents: 'none' }} />
                      <circle 
                        cx="0" 
                        cy="-2" 
                        r="22" 
                        fill={hoveredElement === 'rightStick' || lockedElement === 'rightStick' ? 'var(--brand-red-alpha-30)' : 'url(#stick-grad)'} 
                        stroke={hoveredElement === 'rightStick' || lockedElement === 'rightStick' ? 'var(--brand-red)' : 'none'}
                        strokeWidth={2}
                        style={{ pointerEvents: 'none' }}
                      />
                      <circle cx="0" cy="0" r="28" fill="white" fillOpacity={0} style={{ cursor: 'pointer', pointerEvents: 'all' }} onMouseEnter={() => handleElementHover('rightStick')} onMouseLeave={handleElementLeave} onClick={() => handleElementClick('rightStick')} />
                    </g>

                    {/* Action Buttons A, B, X, Y */}
                    <g id="action-buttons" transform="translate(365, 140)">
                      <circle cx="0" cy="0" r="42" fill="#232d3d" style={{ pointerEvents: 'none' }} />
                      {/* X (Bleu) */}
                      <g id="button-x">
                        <circle cx="-24" cy="0" r="11" fill={hoveredElement === 'buttonX' || lockedElement === 'buttonX' ? 'var(--brand-red)' : '#0033cc'} style={{ pointerEvents: 'none' }} />
                        <circle cx="-24" cy="-1" r="8" fill={hoveredElement === 'buttonX' || lockedElement === 'buttonX' ? '#ef4444' : '#3366ff'} style={{ pointerEvents: 'none' }} />
                        <text x="-27" y="3" fill="#fff" fontSize="9" fontWeight="800" style={{ pointerEvents: 'none' }}>X</text>
                        <circle cx="-24" cy="0" r="11" fill="white" fillOpacity={0} style={{ cursor: 'pointer', pointerEvents: 'all' }} onMouseEnter={() => handleElementHover('buttonX')} onMouseLeave={handleElementLeave} onClick={() => handleElementClick('buttonX')} />
                      </g>
                      {/* Y (Jaune) */}
                      <g id="button-y">
                        <circle cx="0" cy="-24" r="11" fill={hoveredElement === 'buttonY' || lockedElement === 'buttonY' ? 'var(--brand-red)' : '#cc9900'} style={{ pointerEvents: 'none' }} />
                        <circle cx="0" cy="-25" r="8" fill={hoveredElement === 'buttonY' || lockedElement === 'buttonY' ? '#ef4444' : '#ffcc00'} style={{ pointerEvents: 'none' }} />
                        <text x="-3" y="-21" fill="#000" fontSize="9" fontWeight="800" style={{ pointerEvents: 'none' }}>Y</text>
                        <circle cx="0" cy="-24" r="11" fill="white" fillOpacity={0} style={{ cursor: 'pointer', pointerEvents: 'all' }} onMouseEnter={() => handleElementHover('buttonY')} onMouseLeave={handleElementLeave} onClick={() => handleElementClick('buttonY')} />
                      </g>
                      {/* B (Rouge) */}
                      <g id="button-b">
                        <circle cx="24" cy="0" r="11" fill={hoveredElement === 'buttonB' || lockedElement === 'buttonB' ? 'var(--brand-red)' : '#cc0000'} style={{ pointerEvents: 'none' }} />
                        <circle cx="24" cy="-1" r="8" fill={hoveredElement === 'buttonB' || lockedElement === 'buttonB' ? '#ff6666' : '#ff3333'} style={{ pointerEvents: 'none' }} />
                        <text x="21" y="3" fill="#fff" fontSize="9" fontWeight="800" style={{ pointerEvents: 'none' }}>B</text>
                        <circle cx="24" cy="0" r="11" fill="white" fillOpacity={0} style={{ cursor: 'pointer', pointerEvents: 'all' }} onMouseEnter={() => handleElementHover('buttonB')} onMouseLeave={handleElementLeave} onClick={() => handleElementClick('buttonB')} />
                      </g>
                      {/* A (Vert) */}
                      <g id="button-a">
                        <circle cx="0" cy="24" r="11" fill={hoveredElement === 'buttonA' || lockedElement === 'buttonA' ? 'var(--brand-red)' : '#008000'} style={{ pointerEvents: 'none' }} />
                        <circle cx="0" cy="23" r="8" fill={hoveredElement === 'buttonA' || lockedElement === 'buttonA' ? '#4ade80' : '#33cc33'} style={{ pointerEvents: 'none' }} />
                        <text x="-3" y="27" fill="#fff" fontSize="9" fontWeight="800" style={{ pointerEvents: 'none' }}>A</text>
                        <circle cx="0" cy="24" r="11" fill="white" fillOpacity={0} style={{ cursor: 'pointer', pointerEvents: 'all' }} onMouseEnter={() => handleElementHover('buttonA')} onMouseLeave={handleElementLeave} onClick={() => handleElementClick('buttonA')} />
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
                        fill={hoveredElement === 'backButton' || lockedElement === 'backButton' ? 'var(--brand-red)' : '#0f172a'} 
                        style={{ cursor: 'pointer', transition: 'all 0.15s', pointerEvents: 'all' }}
                        onMouseEnter={() => handleElementHover('backButton')}
                        onMouseLeave={handleElementLeave}
                        onClick={() => handleElementClick('backButton')}
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
                        fill={hoveredElement === 'startButton' || lockedElement === 'startButton' ? 'var(--brand-red)' : '#0f172a'} 
                        style={{ cursor: 'pointer', transition: 'all 0.15s', pointerEvents: 'all' }}
                        onMouseEnter={() => handleElementHover('startButton')}
                        onMouseLeave={handleElementLeave}
                        onClick={() => handleElementClick('startButton')}
                      />
                      <text x="287" y="142" fontSize="5" fill="#94a3b8" textAnchor="middle" fontFamily="sans-serif" style={{ pointerEvents: 'none' }}>START</text>
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
                        <stop offset="0%" stopColor="#3d4e68" />
                        <stop offset="50%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                      <linearGradient id="legs-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2c3545" />
                        <stop offset="100%" stopColor="#18202d" />
                      </linearGradient>
                    </defs>

                    {/* Câble */}
                    <path d="M 160 270 C 120 250, 80 260, 50 240" fill="none" stroke="#222" strokeWidth="5" style={{ pointerEvents: 'none' }} />

                    {/* Base Noire Feet */}
                    <g id="black-base-legs" style={{ pointerEvents: 'none' }}>
                      <path d="M 180 270 L 80 300 C 60 310, 60 340, 80 350 L 130 360 L 180 320 Z" fill="url(#legs-grad)" stroke="#475569" strokeWidth="1.5" />
                      <path d="M 90 315 L 120 345 L 145 325 L 105 305 Z" fill="#38bdf8" opacity="0.15" />
                      
                      <path d="M 320 270 L 420 300 C 440 310, 440 340, 420 350 L 370 360 L 320 320 Z" fill="url(#legs-grad)" stroke="#475569" strokeWidth="1.5" />
                      <path d="M 410 315 L 380 345 L 355 325 L 395 305 Z" fill="#38bdf8" opacity="0.15" />
                      
                      <path d="M 200 400 L 220 480 C 230 500, 270 500, 280 480 L 300 400 Z" fill="url(#legs-grad)" stroke="#475569" strokeWidth="1.5" />
                      <path d="M 230 420 L 240 470 L 260 470 L 270 420 Z" fill="#38bdf8" opacity="0.15" />
                    </g>

                    {/* Chassis central argenté */}
                    <path id="silver-chassis" d="M 250 250 C 350 250, 400 320, 360 380 C 330 420, 280 430, 250 430 C 220 430, 170 420, 140 380 C 100 320, 150 250, 250 250 Z" fill="url(#silver-base)" stroke="#475569" strokeWidth="2" style={{ pointerEvents: 'none' }} />

                    {/* Soufflet du manche */}
                    <g id="stick-boot" style={{ pointerEvents: 'none' }}>
                      <ellipse cx="250" cy="300" rx="55" ry="25" fill="#111" />
                      <ellipse cx="250" cy="290" rx="45" ry="20" fill="#222" />
                      <ellipse cx="250" cy="280" rx="35" ry="15" fill="#111" />
                    </g>

                    {/* Tête du Manche background */}
                    <path d="M 170 80 C 160 60, 170 40, 200 30 C 240 20, 280 40, 290 60 C 290 80, 270 90, 250 90 C 210 90, 180 100, 170 80 Z" fill="#1e293b" stroke="#475569" strokeWidth={1} style={{ pointerEvents: 'none' }} />

                    {/* Stick Column */}
                    <g id="stick-column-group">
                      <path 
                        d="M 220 280 C 220 180, 180 150, 180 80 C 200 60, 240 50, 270 70 C 270 140, 280 180, 280 280 Z" 
                        fill={hoveredElement === 'stickY' || hoveredElement === 'stickX' || hoveredElement === 'stickZ' || lockedElement === 'stickY' || lockedElement === 'stickX' || lockedElement === 'stickZ' ? 'var(--brand-red-alpha-30)' : 'url(#stick-black)'} 
                        stroke={hoveredElement === 'stickY' || hoveredElement === 'stickX' || hoveredElement === 'stickZ' || lockedElement === 'stickY' || lockedElement === 'stickX' || lockedElement === 'stickZ' ? 'var(--brand-red)' : '#475569'}
                        strokeWidth={2}
                        style={{ transition: 'all 0.15s', pointerEvents: 'none' }}
                      />
                      <path d="M 275 240 C 310 240, 340 250, 340 260 C 340 270, 300 275, 275 275 Z" fill="#0f172a" style={{ pointerEvents: 'none' }} />
                      
                      {/* Interactive hitboxes: Split into Twist (Z), Axe X, and Axe Y */}
                      {/* Twist (Z): Top portion */}
                      <path 
                        d="M 180 70 L 270 70 L 275 140 L 190 140 Z" 
                        fill="white" 
                        fillOpacity={0} 
                        style={{ cursor: 'pointer', pointerEvents: 'all' }}
                        onMouseEnter={() => handleElementHover('stickZ')}
                        onMouseLeave={handleElementLeave}
                        onClick={() => handleElementClick('stickZ')}
                      />
                      {/* Axe X: Left-bottom portion */}
                      <path 
                        d="M 190 140 L 232 140 L 232 280 L 220 280 Z" 
                        fill="white" 
                        fillOpacity={0} 
                        style={{ cursor: 'pointer', pointerEvents: 'all' }}
                        onMouseEnter={() => handleElementHover('stickX')}
                        onMouseLeave={handleElementLeave}
                        onClick={() => handleElementClick('stickX')}
                      />
                      {/* Axe Y: Right-bottom portion */}
                      <path 
                        d="M 232 140 L 275 140 L 280 280 L 232 280 Z" 
                        fill="white" 
                        fillOpacity={0} 
                        style={{ cursor: 'pointer', pointerEvents: 'all' }}
                        onMouseEnter={() => handleElementHover('stickY')}
                        onMouseLeave={handleElementLeave}
                        onClick={() => handleElementClick('stickY')}
                      />
                    </g>

                    {/* Boutons de la Base (Côté Gauche) */}
                    <g id="base-buttons">
                      <path id="base-btn-7" d="M 160 320 L 180 325 L 175 345 L 155 340 Z" fill={hoveredElement === 'baseButtons' || lockedElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" style={{ pointerEvents: 'none' }} />
                      <path id="base-btn-8" d="M 185 327 L 205 330 L 200 350 L 180 347 Z" fill={hoveredElement === 'baseButtons' || lockedElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" style={{ pointerEvents: 'none' }} />
                      <path id="base-btn-9" d="M 210 332 L 230 332 L 225 352 L 205 352 Z" fill={hoveredElement === 'baseButtons' || lockedElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" style={{ pointerEvents: 'none' }} />
                      
                      <path id="base-btn-10" d="M 145 350 L 165 355 L 160 375 L 140 370 Z" fill={hoveredElement === 'baseButtons' || lockedElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" style={{ pointerEvents: 'none' }} />
                      <path id="base-btn-11" d="M 170 357 L 190 360 L 185 380 L 165 377 Z" fill={hoveredElement === 'baseButtons' || lockedElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" style={{ pointerEvents: 'none' }} />
                      <path id="base-btn-12" d="M 195 362 L 215 362 L 210 382 L 190 382 Z" fill={hoveredElement === 'baseButtons' || lockedElement === 'baseButtons' ? 'var(--brand-red)' : '#1e293b'} stroke="#475569" style={{ pointerEvents: 'none' }} />
                      
                      {/* Unified transparent polygon hitbox covering all 6 buttons and gaps */}
                      <polygon 
                        points="140,350 160,320 230,332 215,382 140,370" 
                        fill="white" 
                        fillOpacity={0} 
                        style={{ cursor: 'pointer', pointerEvents: 'all' }}
                        onMouseEnter={() => handleElementHover('baseButtons')}
                        onMouseLeave={handleElementLeave}
                        onClick={() => handleElementClick('baseButtons')}
                      />
                    </g>

                    {/* Molette des gaz (Throttle) */}
                    <g id="throttle" transform="translate(340, 350)">
                      <rect x="0" y="-15" width="20" height="40" rx="5" fill={hoveredElement === 'throttle' || lockedElement === 'throttle' ? 'var(--brand-red)' : '#020617'} style={{ pointerEvents: 'none' }} />
                      <path d="M 5 -10 L 15 -10 L 15 20 L 5 20 Z" fill="#475569" style={{ pointerEvents: 'none' }} />
                      <rect x="-5" y="0" width="30" height="4" fill="#020617" style={{ pointerEvents: 'none' }} />
                      <rect 
                        x="-5" 
                        y="-15" 
                        width="30" 
                        height="40" 
                        fill="white" 
                        fillOpacity={0} 
                        style={{ cursor: 'pointer', pointerEvents: 'all' }}
                        onMouseEnter={() => handleElementHover('throttle')}
                        onMouseLeave={handleElementLeave}
                        onClick={() => handleElementClick('throttle')}
                      />
                    </g>

                    {/* Gâchette Principale (Trigger) */}
                    <path 
                      id="trigger" 
                      d="M 175 85 C 160 95, 165 115, 175 120 C 180 115, 180 95, 175 85 Z" 
                      fill={hoveredElement === 'trigger' || lockedElement === 'trigger' ? 'var(--brand-red)' : '#f1f5f9'} 
                      stroke="#475569"
                      style={{ cursor: 'pointer', transition: 'all 0.15s', pointerEvents: 'all' }}
                      onMouseEnter={() => handleElementHover('trigger')}
                      onMouseLeave={handleElementLeave}
                      onClick={() => handleElementClick('trigger')}
                    />

                    {/* Bouton de Pouce Latéral */}
                    <ellipse 
                      id="thumb-btn" 
                      cx="215" 
                      cy="110" 
                      rx="12" 
                      ry="18" 
                      fill={hoveredElement === 'thumb' || lockedElement === 'thumb' ? 'var(--brand-red)' : '#e2e8f0'} 
                      transform="rotate(-20 215 110)" 
                      style={{ cursor: 'pointer', transition: 'all 0.15s', pointerEvents: 'all' }}
                      onMouseEnter={() => handleElementHover('thumb')}
                      onMouseLeave={handleElementLeave}
                      onClick={() => handleElementClick('thumb')}
                    />

                    {/* Chapeau multidirectionnel (POV / Hat Switch) */}
                    <g id="hat-switch" transform="translate(220, 35)">
                      <circle cx="0" cy="0" r="16" fill={hoveredElement === 'hatSwitch' || lockedElement === 'hatSwitch' ? 'var(--brand-red)' : '#020617'} style={{ pointerEvents: 'none' }} />
                      <circle cx="0" cy="-2" r="12" fill="#475569" style={{ pointerEvents: 'none' }} />
                      <circle cx="0" cy="-4" r="8" fill="#0f172a" style={{ pointerEvents: 'none' }} />
                      <circle 
                        cx="0" 
                        cy="0" 
                        r="16" 
                        fill="white" 
                        fillOpacity={0} 
                        style={{ cursor: 'pointer', pointerEvents: 'all' }}
                        onMouseEnter={() => handleElementHover('hatSwitch')}
                        onMouseLeave={handleElementLeave}
                        onClick={() => handleElementClick('hatSwitch')}
                      />
                    </g>

                    {/* Boutons supérieurs 3, 4, 5, 6 */}
                    <g id="top-buttons">
                      <polygon 
                        id="btn-top-1" 
                        points="190,40 205,35 200,45 185,50" 
                        fill={hoveredElement === 'btn3' || lockedElement === 'btn3' ? 'var(--brand-red)' : '#cbd5e1'} 
                        style={{ cursor: 'pointer', pointerEvents: 'all' }}
                        onMouseEnter={() => handleElementHover('btn3')}
                        onMouseLeave={handleElementLeave}
                        onClick={() => handleElementClick('btn3')}
                      />
                      <polygon 
                        id="btn-top-2" 
                        points="180,55 195,50 190,60 175,65" 
                        fill={hoveredElement === 'btn4' || lockedElement === 'btn4' ? 'var(--brand-red)' : '#cbd5e1'} 
                        style={{ cursor: 'pointer', pointerEvents: 'all' }}
                        onMouseEnter={() => handleElementHover('btn4')}
                        onMouseLeave={handleElementLeave}
                        onClick={() => handleElementClick('btn4')}
                      />
                      <polygon 
                        id="btn-top-3" 
                        points="245,35 260,40 255,50 240,45" 
                        fill={hoveredElement === 'btn5' || lockedElement === 'btn5' ? 'var(--brand-red)' : '#cbd5e1'} 
                        style={{ cursor: 'pointer', pointerEvents: 'all' }}
                        onMouseEnter={() => handleElementHover('btn5')}
                        onMouseLeave={handleElementLeave}
                        onClick={() => handleElementClick('btn5')}
                      />
                      <polygon 
                        id="btn-top-4" 
                        points="255,50 270,55 265,65 250,60" 
                        fill={hoveredElement === 'btn6' || lockedElement === 'btn6' ? 'var(--brand-red)' : '#cbd5e1'} 
                        style={{ cursor: 'pointer', pointerEvents: 'all' }}
                        onMouseEnter={() => handleElementHover('btn6')}
                        onMouseLeave={handleElementLeave}
                        onClick={() => handleElementClick('btn6')}
                      />
                    </g>
                  </svg>
                </div>
              )}
            </div>

            {/* Right Panel: Detail HUD, C++ Code Only & Documentation API */}
            <div style={styles.hudCard}>
              {hoveredElement && currentMapping.name ? (
                <div className="glass-panel animate-fade" style={styles.hudContent}>
                  
                  {/* Badge & Title */}
                  <div style={styles.hudHeader}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={styles.badge}>
                        {currentMapping.type}
                      </span>
                      {lockedElement === hoveredElement && (
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          fontSize: '0.68rem', 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          backgroundColor: 'var(--brand-red)', 
                          color: '#fff', 
                          fontWeight: '700',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>
                          <Lock size={10} /> Vue Figée
                        </span>
                      )}
                    </div>
                    <h3 style={styles.hudTitle}>
                      {currentMapping.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p style={styles.hudDesc}>
                    {currentMapping.desc}
                  </p>

                  <div style={styles.infoRow}>
                    <Info size={14} style={{ color: 'var(--brand-red)' }} />
                    <span style={styles.infoLabel}>Position standard : </span>
                    <span style={styles.infoValue}>
                      {currentMapping.pos}
                    </span>
                  </div>

                  {/* Code Snippet Box (C++ Only) */}
                  <div style={styles.codeBlockContainer}>
                    <div style={styles.codeBlockHeader}>
                      <span>Exemple d'utilisation (C++ FRC WPILib)</span>
                      <button 
                        onClick={() => triggerCopy(currentMapping.wpilibCpp)}
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
                        {currentMapping.wpilibCpp}
                      </code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="glass-panel" style={styles.hudEmpty}>
                  <Gamepad2 size={40} style={{ color: 'var(--text-light)', marginBottom: '14px' }} />
                  <h4>Survolez un composant</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '280px', marginTop: '4px' }}>
                    Survolez les boutons et joysticks à gauche pour afficher l'API C++ correspondante.
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
        )}
        {activeTab === 'wiring' && (
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
            <div className="programming-wiring-layout">
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

        {activeTab === 'canbus' && (
          <div className="glass-panel animate-fade" style={styles.canbusWorkspace}>
            {/* Robot Selector Card / Control Bar */}
            {(() => {
              const activeRobot = robots.find(r => r.id === selectedRobotId);
              const activeRobotGithubRepo = activeRobot?.github_repo || '';
              return (
                <div style={styles.canbusHeader}>
                  <div style={styles.robotSelectorGroup}>
                    <label style={styles.robotSelectorLabel}>Configuration du Robot :</label>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <select
                        value={selectedRobotId || ''}
                        onChange={(e) => setSelectedRobotId(e.target.value ? Number(e.target.value) : null)}
                        style={styles.robotSelect}
                      >
                        {robots.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                        {robots.length === 0 && (
                          <option value="">Aucun robot</option>
                        )}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingRobot(false);
                        setNewRobotName('');
                        setNewRobotDesc('');
                        setNewRobotRepo('');
                        setShowAddRobotModal(true);
                      }}
                      style={styles.btnSmallOk}
                      title="Ajouter un nouveau robot"
                    >
                      <Plus size={16} /> Nouveau
                    </button>

                    {selectedRobotId && (
                      <button
                        type="button"
                        onClick={handleOpenEditRobot}
                        style={styles.btnSmallNeutral}
                        title="Modifier les détails de ce robot"
                      >
                        <Edit3 size={16} /> Éditer
                      </button>
                    )}

                    {selectedRobotId && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRobot(selectedRobotId)}
                        className="btn-danger"
                        style={styles.btnDanger}
                        title="Supprimer ce robot"
                      >
                        <Trash2 size={16} /> Supprimer
                      </button>
                    )}
                  </div>

                  {selectedRobotId && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      {activeRobotGithubRepo && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                          <GitBranch size={12} style={{ color: '#10b981' }} />
                          <span>Dépôt : {activeRobotGithubRepo}</span>
                        </div>
                      )}
                      <div style={styles.robotDescText}>
                        {activeRobot?.description || "Pas de description."}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Error Message if any */}
            {canError && (
              <div className="error-box" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 1rem 0' }}>
                <AlertCircle size={20} />
                <div style={{ flex: 1 }}>{canError}</div>
              </div>
            )}

            {/* If no robot exists */}
            {robots.length === 0 && !loadingCan && (
              <div className="glass-panel" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3.5rem 2rem',
                borderRadius: 'var(--border-radius-lg)',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                border: '1px dashed var(--border-color)',
                textAlign: 'center',
                marginTop: '1.5rem'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <Cpu size={32} style={{ color: 'var(--brand-red)' }} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>Aucun Robot Enregistré</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '380px', marginTop: '6px', lineHeight: '1.5' }}>
                  Commencez par configurer le profil d'un robot pour lui assigner des périphériques (moteurs, capteurs) et valider ses adresses de bus CAN.
                </p>
                <button
                  onClick={() => setShowAddRobotModal(true)}
                  className="btn-primary"
                  style={{ marginTop: '1.25rem', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Plus size={16} /> Créer un premier robot
                </button>
              </div>
            )}

            {/* Main CAN Config Workspace */}
            {selectedRobotId && (
              <div className="programming-wiring-layout">
                {/* Left Column: Device grid/table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Search and Filters Bar */}
                  <div style={styles.canFiltersBar} className="glass-panel">
                    <div style={styles.searchFilterGroup}>
                      <input
                        type="text"
                        placeholder="Rechercher un ID, nom, sous-système..."
                        value={canSearchQuery}
                        onChange={(e) => setCanSearchQuery(e.target.value)}
                        style={styles.searchInput}
                      />

                      <select
                        value={canFilterBus}
                        onChange={(e) => setCanFilterBus(e.target.value)}
                        style={styles.filterSelect}
                      >
                        <option value="all">Tous les bus</option>
                        <option value="rio">RoboRIO CAN (Native)</option>
                        <option value="canivore">CANivore FD</option>
                      </select>
                    </div>

                    <button
                      onClick={handleOpenAddDevice}
                      className="btn-primary"
                      style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={16} /> Ajouter un périphérique
                    </button>
                  </div>

                  {/* Devices List Table */}
                  <div className="glass-panel" style={{ padding: '0px', overflowX: 'auto', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)' }}>
                    <table style={styles.canTable}>
                      <thead>
                        <tr style={styles.canTableHeaderRow}>
                          <th style={{ ...styles.canTableTh, width: '90px', textAlign: 'center' }}>ID CAN</th>
                          <th style={styles.canTableTh}>Nom du Périphérique</th>
                          <th style={styles.canTableTh}>Type</th>
                          <th style={styles.canTableTh}>Bus CAN</th>
                          <th style={styles.canTableTh}>Sous-système</th>
                          <th style={styles.canTableTh}>Notes</th>
                          <th style={{ ...styles.canTableTh, width: '100px', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          // Compute conflict keys: if any duplicate ID exists on the same bus
                          const busIdMap = {};
                          const conflicts = new Set();
                          canDevices.forEach(d => {
                            const key = `${d.bus_type}-${d.can_id}`;
                            if (busIdMap[key]) {
                              conflicts.add(key);
                            } else {
                              busIdMap[key] = true;
                            }
                          });

                          const filteredDevices = canDevices.filter(d => {
                            const term = canSearchQuery.toLowerCase().trim();
                            if (!term) return canFilterBus === 'all' || d.bus_type === canFilterBus;
                            
                            const matchesSearch = 
                              d.name.toLowerCase().includes(term) ||
                              (d.subsystem && d.subsystem.toLowerCase().includes(term)) ||
                              d.device_type.toLowerCase().includes(term) ||
                              d.can_id.toString() === term;
                              
                            const matchesBus = canFilterBus === 'all' || d.bus_type === canFilterBus;
                            return matchesSearch && matchesBus;
                          });

                          if (filteredDevices.length === 0) {
                            return (
                              <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'var(--text-muted)' }}>
                                  <div style={{ display: 'inline-flex', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.02)', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', border: '1px solid var(--border-color)' }}>
                                    <Cpu size={24} style={{ color: 'var(--text-light)', opacity: 0.6 }} />
                                  </div>
                                  <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' }}>Aucun périphérique CAN trouvé</div>
                                  <p style={{ fontSize: '0.82rem', opacity: 0.7, maxWidth: '280px', margin: '6px auto 0 auto', lineHeight: '1.4' }}>
                                    {canSearchQuery || canFilterBus !== 'all' 
                                      ? "Aucun résultat ne correspond aux filtres de recherche actuels." 
                                      : "Ce profil n'a aucun périphérique. Cliquez sur \"Ajouter un périphérique\" pour commencer."}
                                  </p>
                                </td>
                              </tr>
                            );
                          }

                          return filteredDevices.map(d => {
                            const hasConflict = conflicts.has(`${d.bus_type}-${d.can_id}`);
                            const outOfBounds = d.can_id < 0 || d.can_id > 62;
                            
                            // Visual badges logic
                            let badgeStyle = { ...styles.deviceBadge };
                            if (d.device_type === 'Talon FX' || d.device_type === 'CANcoder' || d.device_type === 'Talon SRX') {
                              badgeStyle.backgroundColor = 'rgba(16, 185, 129, 0.08)'; // CTRE green
                              badgeStyle.color = '#10b981';
                              badgeStyle.borderColor = 'rgba(16, 185, 129, 0.2)';
                            } else if (d.device_type === 'Spark MAX' || d.device_type === 'Spark Flex') {
                              badgeStyle.backgroundColor = 'rgba(245, 158, 11, 0.08)'; // REV yellow/orange
                              badgeStyle.color = '#f59e0b';
                              badgeStyle.borderColor = 'rgba(245, 158, 11, 0.2)';
                            } else {
                              badgeStyle.backgroundColor = 'rgba(167, 139, 250, 0.08)'; // standard purple
                              badgeStyle.color = '#a78bfa';
                              badgeStyle.borderColor = 'rgba(167, 139, 250, 0.2)';
                            }

                            return (
                              <tr
                                key={d.id}
                                className="can-table-row"
                                style={{
                                  ...styles.canTableRow,
                                  backgroundColor: hasConflict ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                                  borderLeft: hasConflict ? '3px solid #ef4444' : '3px solid transparent'
                                }}
                              >
                                {/* CAN ID Column with warning logic */}
                                <td style={{ ...styles.canTableCell, textAlign: 'center', fontWeight: 'bold' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    {hasConflict && (
                                      <AlertTriangle
                                        size={13}
                                        style={{ color: '#ef4444' }}
                                        title="Conflit de CAN ID sur le même bus !"
                                      />
                                    )}
                                    <span 
                                      className={hasConflict ? 'conflict-pulse' : ''} 
                                      style={{ 
                                        backgroundColor: hasConflict ? 'rgba(239, 68, 68, 0.15)' : outOfBounds ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.04)',
                                        color: hasConflict ? '#ef4444' : outOfBounds ? '#f59e0b' : 'var(--text-main)',
                                        fontSize: '0.92rem',
                                        fontWeight: '700',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        border: hasConflict ? '1px solid #ef4444' : outOfBounds ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                                        display: 'inline-block',
                                        minWidth: '32px',
                                        textAlign: 'center'
                                      }}
                                      title={outOfBounds ? "ID en dehors de la plage recommandée FRC (0-62)" : undefined}
                                    >
                                      {d.can_id}
                                    </span>
                                  </div>
                                </td>

                                {/* Name */}
                                <td style={{ ...styles.canTableCell, fontWeight: '600', color: 'var(--text-main)' }}>
                                  {d.name}
                                </td>

                                {/* Device Type */}
                                <td style={styles.canTableCell}>
                                  <span style={badgeStyle}>
                                    {d.device_type}
                                  </span>
                                </td>

                                {/* Bus type */}
                                <td style={styles.canTableCell}>
                                  <span style={{
                                    ...styles.busBadge,
                                    backgroundColor: d.bus_type === 'canivore' ? 'rgba(207, 39, 55, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                                    color: d.bus_type === 'canivore' ? 'var(--brand-red)' : 'var(--text-muted)',
                                    border: d.bus_type === 'canivore' ? '1px solid rgba(207, 39, 55, 0.15)' : '1px solid rgba(255, 255, 255, 0.06)'
                                  }}>
                                    {d.bus_type === 'canivore' ? 'CANivore FD' : 'RoboRIO CAN'}
                                  </span>
                                </td>

                                {/* Subsystem */}
                                <td style={styles.canTableCell}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: '600' }}>
                                      {d.subsystem || 'Général'}
                                    </span>
                                    {d.git_branch && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        <GitBranch size={10} style={{ color: '#10b981' }} />
                                        <span>{d.git_branch}</span>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* Notes */}
                                <td style={{ ...styles.canTableCell, fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.notes}>
                                  {d.notes || '—'}
                                </td>

                                {/* Inline Actions */}
                                <td style={{ ...styles.canTableCell, textAlign: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <button
                                      onClick={() => handleOpenEditDevice(d)}
                                      className="action-btn-edit"
                                      style={styles.actionBtnEdit}
                                      title="Modifier"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDevice(d.id)}
                                      className="action-btn-delete"
                                      style={styles.actionBtnDelete}
                                      title="Supprimer"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Column: Code exporter and quick stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Quick stats summary card */}
                  <div className="glass-panel" style={styles.statsCard}>
                    <h4 style={styles.sidebarSectionTitle}>Statistiques du Bus CAN</h4>
                    <div style={styles.statsList}>
                      <div style={styles.statsItem}>
                        <span style={styles.statsLabel}>Total périphériques :</span>
                        <span style={styles.statsValue}>{canDevices.length}</span>
                      </div>
                      <div style={styles.statsItem}>
                        <span style={styles.statsLabel}>Sur le bus RoboRIO :</span>
                        <span style={styles.statsValue}>{canDevices.filter(d => d.bus_type === 'rio').length}</span>
                      </div>
                      <div style={styles.statsItem}>
                        <span style={styles.statsLabel}>Sur le bus CANivore :</span>
                        <span style={styles.statsValue}>{canDevices.filter(d => d.bus_type === 'canivore').length}</span>
                      </div>
                      {(() => {
                        const busIdMap = {};
                        let conflictsCount = 0;
                        canDevices.forEach(d => {
                          const key = `${d.bus_type}-${d.can_id}`;
                          if (busIdMap[key]) {
                            conflictsCount++;
                          } else {
                            busIdMap[key] = true;
                          }
                        });
                        if (conflictsCount > 0) {
                          return (
                            <div style={{ ...styles.statsItem, color: '#ef4444', fontWeight: 'bold' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <AlertTriangle size={14} /> Conflits détectés :
                              </span>
                              <span>{conflictsCount}</span>
                            </div>
                          );
                        }
                        return (
                          <div style={{ ...styles.statsItem, color: '#10b981', fontWeight: '500' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Check size={14} /> Bus validé (aucun conflit)
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Exporter header / panel wrapped in simulated macOS/IDE titlebar */}
                  <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)' }}>
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderBottom: '1px solid var(--border-color)',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)', marginLeft: '6px' }}>Constants.h</span>
                      </div>
                      
                      <button
                        onClick={() => triggerCopyConstants(generateConstantsCode())}
                        className="btn-primary"
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: copiedConstants ? '#16a34a' : 'var(--brand-red)'
                        }}
                      >
                        {copiedConstants ? <CheckCircle2 size={11} /> : <Copy size={11} />}
                        <span>{copiedConstants ? 'Copié !' : 'Copier'}</span>
                      </button>
                    </div>
                    
                    <div style={{ padding: '1.25rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                        Copiez-collez ces constantes générées directement dans votre code C++ FRC pour synchroniser les IDs CAN matériels.
                      </p>
                      <pre style={styles.codeBlockExporter}>
                        <code>{generateConstantsCode()}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'github' && (
          <div className="glass-panel animate-fade" style={styles.githubWorkspace}>
            {/* Header / Controls */}
            <div style={styles.githubHeader}>
              <div style={styles.githubTitleGroup}>
                <h3 style={styles.githubTitle}>GitHub Commit Logs & News</h3>
                <p style={styles.githubDesc}>
                  Dernières activités de développement sur les dépôts de l'équipe STAN Robotix.
                </p>
              </div>

              <div style={styles.githubControls}>
                {/* Repository Filter Badges */}
                <div style={styles.repoFilters}>
                  {[
                    { name: '2026-StanRobotix-FRC', color: 'var(--brand-red)', bg: 'var(--brand-red-alpha-10)' },
                    { name: '2026-StanRobotix-OffSeason', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)' },
                    { name: 'website', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' },
                    { name: 'kaban', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }
                  ].map(repo => {
                    const isSelected = selectedRepos.includes(repo.name);
                    return (
                      <button
                        key={repo.name}
                        onClick={() => toggleRepoFilter(repo.name)}
                        style={{
                          ...styles.filterBtn,
                          borderColor: isSelected ? repo.color : 'var(--border-color)',
                          backgroundColor: isSelected ? repo.bg : 'transparent',
                          color: isSelected ? repo.color : 'var(--text-muted)'
                        }}
                      >
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: repo.color,
                          display: 'inline-block'
                        }}></span>
                        <span>{repo.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Refresh Button */}
                <button
                  onClick={fetchCommits}
                  disabled={loadingCommits}
                  style={styles.refreshBtn}
                  title="Rafraîchir"
                >
                  <RefreshCw 
                    size={16} 
                    style={loadingCommits ? styles.refreshBtnLoading : {}} 
                  />
                </button>
              </div>
            </div>

            {/* Content List */}
            {loadingCommits ? (
              <div style={styles.timeline}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={styles.skeletonCard}>
                    <div style={{ ...styles.skeletonText, width: '40px', height: '40px', borderRadius: '50%' }}></div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ ...styles.skeletonText, width: '30%', height: '16px' }}></div>
                      <div style={{ ...styles.skeletonText, width: '80%', height: '14px' }}></div>
                      <div style={{ ...styles.skeletonText, width: '50%', height: '12px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : commitsError ? (
              <div className="error-box" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={20} />
                <div style={{ flex: 1 }}>
                  <div>Une erreur est survenue lors de la récupération des commits :</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '2px' }}>{commitsError}</div>
                </div>
                <button onClick={fetchCommits} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  Réessayer
                </button>
              </div>
            ) : commits.filter(c => selectedRepos.includes(c.repo)).length === 0 ? (
              <div style={styles.hudEmpty}>
                <GitCommit size={40} style={{ color: 'var(--text-light)', marginBottom: '14px' }} />
                <h4>Aucun commit trouvé</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '320px', marginTop: '4px' }}>
                  Aucun commit ne correspond aux dépôts sélectionnés ou la liste est vide.
                </p>
              </div>
            ) : (
              <div style={styles.timeline}>
                {commits
                  .filter(c => selectedRepos.includes(c.repo))
                  .map(commit => {
                    const isExpanded = !!expandedCommits[commit.sha];
                    const repoColor = commit.repo === '2026-StanRobotix-FRC' 
                      ? 'var(--brand-red)' 
                      : commit.repo === '2026-StanRobotix-OffSeason' 
                        ? '#38bdf8' 
                        : commit.repo === 'website'
                          ? '#a78bfa'
                          : '#10b981';
                    const repoBg = commit.repo === '2026-StanRobotix-FRC' 
                      ? 'var(--brand-red-alpha-10)' 
                      : commit.repo === '2026-StanRobotix-OffSeason' 
                        ? 'rgba(56, 189, 248, 0.1)' 
                        : commit.repo === 'website'
                          ? 'rgba(167, 139, 250, 0.1)'
                          : 'rgba(16, 185, 129, 0.1)';

                    // Split message into title and description if multi-line
                    const msgLines = commit.message.split('\n');
                    const msgTitle = msgLines[0];
                    const msgDesc = msgLines.slice(1).join('\n').trim();

                    return (
                      <div 
                        key={commit.sha} 
                        style={styles.commitCard}
                        onClick={() => toggleCommitExpand(commit.sha)}
                      >
                        <div style={styles.commitHeader}>
                          {/* Colored vertical bar */}
                          <div style={{ ...styles.commitRepoIndicator, backgroundColor: repoColor }}></div>

                          {/* Author Avatar */}
                          {commit.author.avatar_url ? (
                            <img 
                              src={commit.author.avatar_url} 
                              alt={commit.author.name} 
                              style={styles.commitAvatar} 
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div style={{ ...styles.commitAvatar, display: 'flex', alignItems: 'center', justify: 'center', backgroundColor: 'var(--bg-column)' }}>
                              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                {commit.author.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}

                          {/* Info Panel */}
                          <div style={styles.commitMainInfo}>
                            <div style={styles.commitTitleRow}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ 
                                  ...styles.commitRepoBadge, 
                                  backgroundColor: repoBg,
                                  color: repoColor 
                                }}>
                                  {commit.repo}
                                </span>
                                <span style={{
                                  fontSize: '0.72rem',
                                  fontWeight: '600',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(255,255,255,0.05)',
                                  color: 'var(--text-muted)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <GitBranch size={10} style={{ color: repoColor }} />
                                  {commit.branch || 'master'}
                                </span>
                              </div>
                              
                              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                                {commit.sha.substring(0, 7)}
                              </span>
                            </div>

                            <div style={styles.commitMessage}>
                              {msgTitle}
                            </div>
                            {msgDesc && (
                              <div style={styles.commitSubMessage}>
                                {msgDesc}
                              </div>
                            )}

                            {/* Metadata */}
                            <div style={styles.commitMetaRow}>
                              <div style={styles.commitMetaItem}>
                                <span style={styles.commitAuthorName}>
                                  {commit.author.name}
                                </span>
                              </div>
                              <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--text-light)' }}></div>
                              <div style={styles.commitMetaItem}>
                                <Calendar size={12} />
                                <span>{formatRelativeTime(commit.author.date)}</span>
                              </div>
                              
                              {/* Stats badges */}
                              {commit.stats && (
                                <>
                                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--text-light)' }}></div>
                                  <div style={styles.commitStats}>
                                    {commit.stats.additions > 0 && (
                                      <span style={{ ...styles.statBadge, ...styles.statAdditions }}>
                                        +{commit.stats.additions}
                                      </span>
                                    )}
                                    {commit.stats.deletions > 0 && (
                                      <span style={{ ...styles.statBadge, ...styles.statDeletions }}>
                                        -{commit.stats.deletions}
                                      </span>
                                    )}
                                    {commit.files && commit.files.length > 0 && (
                                      <span style={{ ...styles.statBadge, ...styles.statFiles }}>
                                        <FileCode size={10} style={{ marginRight: '3px' }} />
                                        {commit.files.length} {commit.files.length > 1 ? 'fichiers' : 'fichier'}
                                      </span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div style={styles.commitActions} onClick={(e) => e.stopPropagation()}>
                            <a 
                              href={commit.html_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={styles.commitLink}
                              title="Voir sur GitHub"
                            >
                              <ExternalLink size={16} />
                            </a>
                            <button 
                              onClick={() => toggleCommitExpand(commit.sha)}
                              style={styles.expandBtn}
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded details (files list) */}
                        {isExpanded && commit.files && commit.files.length > 0 && (
                          <div style={styles.commitDetails} onClick={(e) => e.stopPropagation()}>
                            <div style={styles.filesListTitle}>Fichiers modifiés :</div>
                            <div style={styles.filesGrid}>
                              {commit.files.map((file, idx) => {
                                let statusColor = '#94a3b8';
                                if (file.status === 'added') statusColor = '#10b981';
                                else if (file.status === 'removed') statusColor = '#ef4444';
                                else if (file.status === 'modified') statusColor = '#f59e0b';
                                
                                return (
                                  <div key={idx} style={styles.fileItem}>
                                    <div style={styles.fileNameGroup}>
                                      <span style={{ ...styles.fileStatusDot, backgroundColor: statusColor }} title={file.status}></span>
                                      <span style={{ wordBreak: 'break-all' }}>{file.filename}</span>
                                    </div>
                                    <div style={file.additions > 0 || file.deletions > 0 ? styles.fileStats : { display: 'none' }}>
                                      {file.additions > 0 && <span style={{ color: '#10b981' }}>+{file.additions}</span>}
                                      {file.deletions > 0 && <span style={{ color: '#ef4444' }}>-{file.deletions}</span>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      {showAddRobotModal && (
        <div style={styles.modalOverlay} className="animate-fade">
          <div style={styles.modalContent} className="glass-panel animate-modal">
            <div style={styles.modalHeader}>
              <h3 style={{ ...styles.modalTitle, margin: 0 }}>
                {isEditingRobot ? 'Modifier le Robot' : 'Créer un nouveau Robot'}
              </h3>
              <button 
                onClick={() => setShowAddRobotModal(false)}
                className="modal-close-btn"
                style={styles.modalCloseBtn}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateRobot} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Nom du Robot *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Robot 2026 - Competition"
                  value={newRobotName}
                  onChange={(e) => setNewRobotName(e.target.value)}
                  style={styles.modalInput}
                  autoFocus
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Description</label>
                <textarea
                  placeholder="Ex: Swerve MK4i avec moteurs Falcon 500, mécanismes sur RoboRIO CAN standard."
                  value={newRobotDesc}
                  onChange={(e) => setNewRobotDesc(e.target.value)}
                  style={styles.modalTextarea}
                  rows={2}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Dépôt GitHub Associé (Optionnel)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select
                    value={GITHUB_REPOS_LIST.some(r => r.fullName === newRobotRepo) || newRobotRepo === '' ? newRobotRepo : '_custom_'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '_custom_') {
                        setNewRobotRepo('stan-robotix-6622/');
                      } else {
                        setNewRobotRepo(val);
                      }
                    }}
                    style={styles.modalSelect}
                  >
                    <option value="">-- Aucun dépôt associé --</option>
                    {GITHUB_REPOS_LIST.map(repo => (
                      <option key={repo.fullName} value={repo.fullName}>
                        {repo.fullName}
                      </option>
                    ))}
                    <option value="_custom_">Autre dépôt (saisie manuelle)...</option>
                  </select>
                  
                  {(!GITHUB_REPOS_LIST.some(r => r.fullName === newRobotRepo) && newRobotRepo !== '') && (
                    <input
                      type="text"
                      placeholder="Format: proprietaire/depot (ex: alban-pixel/kaban)"
                      value={newRobotRepo}
                      onChange={(e) => setNewRobotRepo(e.target.value)}
                      style={styles.modalInput}
                    />
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Associer un dépôt permet de charger dynamiquement ses branches Git et ses sous-systèmes existants.
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowAddRobotModal(false)}
                  className="btn-modal-cancel"
                  style={styles.btnModalCancel}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={styles.btnModalSubmit}
                >
                  {isEditingRobot ? 'Enregistrer les modifications' : 'Créer le Robot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddDeviceModal && (
        <div style={styles.modalOverlay} className="animate-fade">
          <div style={styles.modalContent} className="glass-panel animate-modal">
            <div style={styles.modalHeader}>
              <h3 style={{ ...styles.modalTitle, margin: 0 }}>
                {editingDevice ? 'Modifier le Périphérique CAN' : 'Ajouter un Périphérique CAN'}
              </h3>
              <button 
                onClick={() => setShowAddDeviceModal(false)}
                className="modal-close-btn"
                style={styles.modalCloseBtn}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveDevice} style={styles.modalForm}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>ID CAN * (0-62)</label>
                  <input
                    type="number"
                    min="0"
                    max="62"
                    required
                    placeholder="Ex: 12"
                    value={newDeviceCanId}
                    onChange={(e) => setNewDeviceCanId(e.target.value)}
                    style={styles.modalInput}
                    autoFocus={!editingDevice}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Bus CAN *</label>
                  <select
                    value={newDeviceBus}
                    onChange={(e) => setNewDeviceBus(e.target.value)}
                    style={styles.modalSelect}
                  >
                    <option value="rio">RoboRIO CAN (Native)</option>
                    <option value="canivore">CANivore FD</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Nom du Périphérique *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Front Left Drive Motor"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  style={styles.modalInput}
                />
              </div>

              {(() => {
                const activeRobot = robots.find(r => r.id === selectedRobotId);
                const activeRobotGithubRepo = activeRobot?.github_repo || '';
                return (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: activeRobotGithubRepo ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Type de Périphérique *</label>
                        <select
                          value={newDeviceType}
                          onChange={(e) => setNewDeviceType(e.target.value)}
                          style={styles.modalSelect}
                        >
                          <option value="Talon FX">Talon FX</option>
                          <option value="Spark MAX">Spark MAX</option>
                          <option value="Spark Flex">Spark Flex</option>
                          <option value="CANcoder">CANcoder</option>
                          <option value="Talon SRX">Talon SRX</option>
                          <option value="Power Distribution Hub (PDH)">Power Distribution Hub (PDH)</option>
                          <option value="Pneumatic Control Module (PCM)">Pneumatic Control Module (PCM)</option>
                          <option value="Pigeon 2.0">Pigeon 2.0</option>
                        </select>
                      </div>
                      
                      {activeRobotGithubRepo && (
                        <div style={styles.formGroup}>
                          <label style={styles.formLabel}>Branche Git (Optionnel)</label>
                          <select
                            value={newDeviceBranch}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewDeviceBranch(val);
                              fetchSubsystemsForBranch(activeRobotGithubRepo, val);
                            }}
                            style={styles.modalSelect}
                            disabled={loadingBranches}
                          >
                            <option value="">-- Choisir une branche --</option>
                            {gitBranches.map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                          {loadingBranches && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Chargement des branches...</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Sous-système (Optionnel)</label>
                      {activeRobotGithubRepo && newDeviceBranch && gitSubsystems.length > 0 ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <select
                            value={gitSubsystems.includes(newDeviceSubsystem) ? newDeviceSubsystem : (newDeviceSubsystem === '' ? '' : '_custom_')}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '_custom_') {
                                setNewDeviceSubsystem('');
                              } else {
                                setNewDeviceSubsystem(val);
                              }
                            }}
                            style={{ ...styles.modalSelect, flex: 1 }}
                            disabled={loadingSubsystems}
                          >
                            <option value="">-- Choisir un sous-système --</option>
                            {gitSubsystems.map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                            <option value="_custom_">Autre / Saisie libre...</option>
                          </select>

                          {(newDeviceSubsystem === '' || !gitSubsystems.includes(newDeviceSubsystem)) && (
                            <input
                              type="text"
                              placeholder="Saisir un nom de sous-système..."
                              value={newDeviceSubsystem}
                              onChange={(e) => setNewDeviceSubsystem(e.target.value)}
                              style={{ ...styles.modalInput, flex: 1 }}
                            />
                          )}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <input
                            type="text"
                            placeholder={activeRobotGithubRepo && newDeviceBranch ? (loadingSubsystems ? "Scan des fichiers GitHub..." : "Aucun sous-système détecté. Saisie libre...") : "Ex: Drivetrain, Intake, Shooter"}
                            value={newDeviceSubsystem}
                            onChange={(e) => setNewDeviceSubsystem(e.target.value)}
                            style={styles.modalInput}
                            disabled={loadingSubsystems}
                          />
                          {activeRobotGithubRepo && newDeviceBranch && loadingSubsystems && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Chargement en cours depuis GitHub...</span>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Notes / Commentaires</label>
                <textarea
                  placeholder="Commentaires additionnels ou cablage physique..."
                  value={newDeviceNotes}
                  onChange={(e) => setNewDeviceNotes(e.target.value)}
                  style={styles.modalTextarea}
                  rows={2}
                />
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowAddDeviceModal(false)}
                  className="btn-modal-cancel"
                  style={styles.btnModalCancel}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={styles.btnModalSubmit}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  mappingGrid: {},
  controllerCard: {
    borderRadius: 'var(--border-radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    backgroundColor: 'var(--bg-card)',
    maxWidth: '650px',
    width: '100%'
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
    top: '0px',
    maxWidth: '550px',
    width: '100%'
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
    minHeight: '340px',
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
  wiringLayout: {},
  imageCard: {
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
    backgroundColor: '#ffffff', // white background for blueprint contrast
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxWidth: '900px',
    width: '100%'
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
    gap: '12px',
    maxWidth: '550px',
    width: '100%'
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
  },
  githubWorkspace: {
    borderRadius: 'var(--border-radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '1.5rem',
    backgroundColor: 'var(--bg-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  githubHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1.25rem'
  },
  githubTitleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  githubTitle: {
    fontSize: '1.2rem',
    fontWeight: '700'
  },
  githubDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  githubControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  repoFilters: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  filterBtn: {
    padding: '6px 12px',
    fontSize: '0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid var(--border-color)',
    transition: 'all 0.2s',
    fontWeight: '500',
    backgroundColor: 'transparent'
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    border: '1px solid var(--border-color)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    color: 'var(--text-main)',
    transition: 'all 0.2s'
  },
  refreshBtnLoading: {
    animation: 'spin 1s linear infinite'
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  commitCard: {
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.01)',
    transition: 'all 0.2s',
    cursor: 'pointer'
  },
  commitHeader: {
    padding: '1rem 1.25rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start'
  },
  commitRepoIndicator: {
    width: '4px',
    alignSelf: 'stretch',
    borderRadius: '4px'
  },
  commitAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-column)',
    objectFit: 'cover'
  },
  commitMainInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  commitTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    flexWrap: 'wrap'
  },
  commitRepoBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  commitMessage: {
    fontSize: '0.92rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    lineHeight: '1.4'
  },
  commitSubMessage: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    whiteSpace: 'pre-wrap',
    marginTop: '4px'
  },
  commitMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: '2px'
  },
  commitMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  commitAuthorName: {
    fontWeight: '600',
    color: 'var(--text-main)'
  },
  commitStats: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center'
  },
  statBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center'
  },
  statAdditions: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981'
  },
  statDeletions: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444'
  },
  statFiles: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-light)'
  },
  commitActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0
  },
  expandBtn: {
    padding: '4px',
    color: 'var(--text-muted)',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  commitLink: {
    padding: '4px',
    color: 'var(--text-muted)',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center'
  },
  commitDetails: {
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: '1rem 1.25rem'
  },
  filesListTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  filesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  fileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255,255,255,0.015)',
    border: '1px solid rgba(255,255,255,0.03)',
    fontSize: '0.8rem'
  },
  fileNameGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-main)',
    fontFamily: 'monospace',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  fileStatusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%'
  },
  fileStats: {
    display: 'flex',
    gap: '6px',
    fontFamily: 'monospace',
    fontSize: '0.72rem',
    flexShrink: 0
  },
  skeletonCard: {
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
    padding: '1.25rem',
    display: 'flex',
    gap: '1rem',
    backgroundColor: 'rgba(255,255,255,0.01)'
  },
  skeletonText: {
    backgroundColor: 'var(--border-color)',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite'
  },
  canbusWorkspace: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    borderRadius: 'var(--border-radius-lg)',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)'
  },
  canbusHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1.25rem'
  },
  robotSelectorGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  robotSelectorLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-muted)'
  },
  robotSelect: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '8px 12px',
    fontSize: '0.9rem',
    outline: 'none',
    minWidth: '220px',
    transition: 'border-color var(--transition-fast)'
  },
  robotDescText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    maxWidth: '450px',
    textAlign: 'right',
    lineHeight: '1.4'
  },
  btnDanger: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    padding: '8px 14px',
    borderRadius: 'var(--border-radius-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },
  canFiltersBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    padding: '1rem',
    borderRadius: 'var(--border-radius-lg)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)'
  },
  searchInput: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '8px 14px',
    fontSize: '0.88rem',
    outline: 'none',
    width: '240px',
    transition: 'all var(--transition-fast)'
  },
  filterSelect: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '8px 14px',
    fontSize: '0.88rem',
    outline: 'none',
    transition: 'all var(--transition-fast)'
  },
  canTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
    color: 'var(--text-main)'
  },
  canTableHeaderRow: {
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'rgba(255, 255, 255, 0.01)'
  },
  canTableTh: {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    color: 'var(--text-muted)',
    fontSize: '0.82rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  canTableRow: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background var(--transition-fast)'
  },
  canTableCell: {
    padding: '14px 16px',
    verticalAlign: 'middle'
  },
  deviceBadge: {
    display: 'inline-block',
    fontSize: '0.78rem',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid transparent'
  },
  busBadge: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '3px 6px',
    borderRadius: '4px'
  },
  actionBtnEdit: {
    color: 'var(--text-muted)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)'
  },
  actionBtnDelete: {
    color: 'rgba(239, 68, 68, 0.7)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)'
  },
  statsCard: {
    padding: '1.25rem',
    borderRadius: 'var(--border-radius-lg)',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)'
  },
  statsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  statsItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: 'var(--text-light)',
    paddingBottom: '6px',
    borderBottom: '1px dashed rgba(255, 255, 255, 0.05)'
  },
  statsLabel: {
    color: 'var(--text-muted)'
  },
  statsValue: {
    fontWeight: '600',
    color: 'var(--text-main)'
  },
  codeBlockExporter: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '12px',
    fontSize: '0.8rem',
    maxHeight: '320px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    lineHeight: '1.4',
    color: '#e2e8f0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1.5rem'
  },
  modalContent: {
    width: '100%',
    maxWidth: '520px',
    borderRadius: 'var(--border-radius-lg)',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-premium)',
    overflow: 'hidden'
  },
  modalHeader: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  modalTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    color: 'var(--text-main)'
  },
  modalCloseBtn: {
    color: 'var(--text-muted)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '4px',
    transition: 'color var(--transition-fast)'
  },
  modalForm: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  formLabel: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: 'var(--text-muted)'
  },
  modalInput: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '8px 12px',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color var(--transition-fast)'
  },
  modalSelect: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '8px 12px',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color var(--transition-fast)'
  },
  modalTextarea: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '8px 12px',
    fontSize: '0.9rem',
    outline: 'none',
    resize: 'vertical',
    transition: 'border-color var(--transition-fast)'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '0.5rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem'
  },
  btnModalCancel: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-light)',
    padding: '8px 16px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },
  btnModalSubmit: {
    padding: '8px 16px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  btnSmallNeutral: {
    color: 'var(--text-light)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    padding: '8px 14px',
    borderRadius: 'var(--border-radius-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },
  btnSmallOk: {
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    padding: '8px 14px',
    borderRadius: 'var(--border-radius-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  }
};
