# T2.2 - Analyse de Logs Post-Match (AdvantageScope & Glass)

En compétition de haut niveau, corriger un bug sur le robot ou optimiser un mécanisme ne se fait pas par intuition ou "sentiment". L'ingénierie moderne repose entièrement sur la **télémétrie et l'analyse de données factuelles**. À chaque fois que le robot s'élance sur le terrain, il enregistre des milliers d'informations par seconde (courant électrique des moteurs, vitesses, trajectoires odométriques, alertes logiques).

Pour décoder ces informations après chaque match, nous utilisons deux outils standardisés de la WPILib : **AdvantageScope** et **Glass**.

---

## 💻 1. Qu'est-ce que AdvantageScope & Le Format `.wpilog` ?

**AdvantageScope** (conçu par l'équipe FRC 6328) est le logiciel d'analyse de logs le plus performant du circuit. Il permet d'ouvrir les fichiers journaux enregistrés localement sur la clé USB branchée dans le roboRIO.

```
       [ ROBOT FRC EN MATCH ]
                 |
                 v (Enregistrement en direct sur clé USB roboRIO)
         [ FICHIER .wpilog ]  <--- Fichier binaire compressé à 100 Hz
                 |
                 v (Extraction dans le stand post-match)
       +------------------------------------+
       |          ADVANTAGESCOPE            |
       |                                    |
       |  - Graphes de courbes temporelles  |
       |  - Visualisation 3D du Swerve      |
       |  - Overlay vidéo de match          |
       +------------------------------------+
```

### Le format de fichier `.wpilog`
Le roboRIO utilise la bibliothèque de journalisation ultra-rapide et compressée **DataLog** de WPILib. Elle génère un fichier binaire compressé portant l'extension `.wpilog`.
* Ce fichier binaire enregistre les variables à une fréquence de **$50\text{ Hz}$ à $250\text{ Hz}$** avec un impact négligeable sur les performances du processeur du roboRIO.
* Le fichier stocke l'historique complet de toutes les entrées/sorties du bus CAN, l'état de la batterie, les commandes conducteurs et les positions de tous les axes.

---

## 🔎 2. Trois Cas Classiques de Diagnostics Réels (Cas Pratiques)

En chargeant le fichier `.wpilog` d'un match précédent dans AdvantageScope, le Pit Crew peut résoudre des énigmes techniques qui semblaient invisibles depuis les tribunes :

### Cas Diagnostic 1 : Échauffement et Surcharge Moteur (Stall & Thermal Throttling)
* **Le Problème constaté en match** : Le bras articulé du robot s'est soudainement affaissé en fin de match et semblait n'avoir plus aucune force pour soulever les pièces de jeu.
* **Analyse des courbes sur AdvantageScope** :
  * Glissez dans le graphique la courbe de vitesse du moteur du bras pivotant : `Vitesse = 0.0 rad/s`.
  * Glissez le courant statorique : `Stator Current = 78.0 Amps` continu pendant plus de 10 secondes.
  * Glissez la courbe de température interne du moteur : la température grimpe de $40^\circ\text{C}$ à **$110^\circ\text{C}$** en flèche.
* **Le Diagnostic** : Le moteur est resté bloqué en position de blocage (Stall), tentant de forcer contre un obstacle structurel. Pour éviter de brûler son propre bobinage, le micrologiciel du moteur a activé son **protection thermique (Thermal Throttling)**, bridant automatiquement le courant de sortie à $15\text{ A}$, ce qui a provoqué l'affaissement mécanique du bras.
* **La Solution en Stand** : Ajuster la butée mécanique, augmenter le rapport de réduction mécanique ou réduire drastiquement la limite de courant statorique à $40\text{ A}$ dans le code.

---

### Cas Diagnostic 2 : Patinage des Roues (Drivetrain Wheel Slip)
* **Le Problème constaté en match** : Le robot semble glisser ou perdre le contrôle de son cap odométrique lors des accélérations franches au milieu du terrain.
* **Analyse des courbes sur AdvantageScope** :
  * Comparez la vitesse théorique demandée par le pilote (courbe `Velocity Setpoint`) et la vitesse réelle lue sur les encodeurs des 4 modules Swerve.
  * *Observation* : Lors de l'accélération, la vitesse réelle du module Swerve Avant-Gauche fait un pic vertical à **$6.2\text{ m/s}$**, alors que le robot ne se déplace physiquement qu'à $4.0\text{ m/s}$ selon le gyroscope IMU et que les 3 autres roues sont stables à $4.0\text{ m/s}$.
* **Le Diagnostic** : La roue avant-gauche a perdu toute adhérence sur la moquette et patine dans le vide (Wheel Slip). La dérive de l'odométrie provient de cette perte d'adhérence.
* **La Solution en Stand** : Remplacer immédiatement la bande de roulement en caoutchouc (Tread) usée de la roue avant-gauche ou activer un algorithme d'anti-patinage (Traction Control) limitant l'accélération si la vitesse de la roue diverge de l'accélération globale de l'IMU.

---

### Cas Diagnostic 3 : Déconnexion Réseau & Micro-Coupures (Packet Loss)
* **Le Problème constaté en match** : Le robot s'est arrêté d'un coup pendant $2\text{ secondes}$ au milieu du match avant de repartir comme si de rien n'était.
* **Analyse des courbes sur AdvantageScope** :
  * Affichez la courbe de tension de la batterie (`Battery Voltage`).
  * Affichez la courbe de perte de paquets réseau (`Packet Loss` ou `DS Connection Link`).
  * *Observation* : Au moment exact de la panne, la tension de la batterie affiche une baisse à **$4.8\text{ V}$** causée par un impact de collision extrême. Simultanément, la liaison réseau se coupe complètement et redevient active après $2.5\text{ secondes}$ d'inactivité.
* **Le Diagnostic** : L'impact a généré un choc électrique. Bien que le roboRIO n'ait pas redémarré complètement (la tension est restée juste au-dessus des $4.5\text{ V}$), la chute de tension a provoqué l'arrêt momentané du régulateur de tension de la radio Wi-Fi (VRM/RPM) ou du switch réseau Ethernet. Il a fallu $2$ secondes à la radio ou au switch pour relancer la communication.
* **La Solution en Stand** : Raccorder la radio Wi-Fi sur son port d'alimentation POE (Power over Ethernet) sécurisé, brancher la radio sur le module d'alimentation régulé redondant (REV Radio Power Module) et resserrer les connexions RJ45 à l'aide de colle chaude ou de clips mécaniques.

---

## 📊 3. Glass : Visualisation et Réglage PID en Temps Réel

Alors que AdvantageScope est utilisé pour analyser des données enregistrées après l'action, **Glass** est l'outil officiel de la WPILib pour visualiser des données **en temps réel et en direct** via une connexion filaire ou Wi-Fi dans le stand.

```
       EVALUATION GRAPHIQUE SUR GLASS (PID Tuning)
       
  VALEUR (V/RPM/m)
      ^
      |           __/\__                 <-- Réponse oscillante sous-amortie (Kp trop grand)
      |          /      \_____           <-- Réponse idéale amortie (Kd bien réglé)
      |        /----------------\        <-- Consigne Cible (Setpoint)
      |      /
      |    /
      +------------------------------------> TEMPS
```

### Cas d'usage principal : Le réglage de PID "à chaud"
Glass intègre un générateur de graphiques (Plotter) extrêmement puissant et réactif :
1. Connectez le robot à votre ordinateur de stand par câble USB-C ou Ethernet.
2. Lancez Glass et connectez-le à l'adresse IP du robot (`10.66.22.2` ou via NetworkTables).
3. Ouvrez un graphique et glissez-y deux variables : la consigne de position (`Setpoint`) et la mesure de l'encodeur (`Measured Position`).
4. Dans le panneau de commande de Glass, modifiez en direct les valeurs des gains $K_p$, $K_i$ et $K_d$ stockées dans les NetworkTables.
5. Déclenchez le mouvement du robot : observez la courbe de réponse instantanément. Si vous observez des oscillations, réduisez $K_p$ ou augmentez $K_d$ en observant la déformation de la courbe à l'écran en temps réel jusqu'à obtenir un signal amorti et stable.

---

## 📚 Supports Supplémentaires

* 💻 **AdvantageScope Official Github Repository :** [AdvantageScope Releases and User Guide](https://github.com/Mechanical-Advantage/AdvantageScope)
* 📖 **WPILib Logging Utility :** [On-Robot Telemetry Logging with DataLog](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html)
* 🧪 **Glass Plotter Guide :** [WPILib Docs - Using Glass Utility](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/index.html)
