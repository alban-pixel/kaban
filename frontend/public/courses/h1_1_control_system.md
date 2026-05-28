# H1.1 - Le Système de Contrôle FRC

Le système de contrôle d'un robot FRC est son "cerveau" et sa "moelle épinière". C'est un ensemble standardisé de composants électroniques industriels connectés via un réseau CAN bus, alimentés par une batterie de 12V.

---

## 🧠 Le Contrôleur Principal : NI roboRIO 2.0

La **roboRIO** est l'ordinateur embarqué industriel développé par National Instruments qui exécute votre code de contrôle (Java/C++/Python).

* **Système d'exploitation** : Real-Time Linux.
* **Interfaces clés** :
  * **CAN Port** : Réseau de communication avec les contrôleurs moteurs.
  * **PWM Ports** : Contrôle d'anciens servomoteurs ou de LEDs.
  * **DIO (Digital Input/Output)** : Connexion de capteurs tout-ou-rien (microswitchs, capteurs optiques).
  * **Analog In** : Connexion de potentiomètres ou de capteurs de pression.
  * **Ethernet / USB** : Programmation du robot et communication réseau.

---

## ⚡ La Distribution de Puissance (PDH / PDP)

### 1. Power Distribution Hub (REV PDH)
Le standard moderne de distribution électrique. C'est elle qui reçoit le courant de la batterie de 12V et le distribue aux moteurs via des fusibles disjoncteurs.
* Dispose de **24 canaux** à forte intensité (jusqu'à 40A).
* Intègre des sorties isolées et régulées de 12V et 5V pour la roboRIO et la radio.
* Permet la télémétrie complète du courant consommé par canal en temps réel (pratique pour détecter des points durs mécaniques).

---

## 🎛️ Les Contrôleurs de Moteur (Motor Controllers)

Chaque moteur brushless nécessite son propre contrôleur intelligent pour décoder sa position angulaire et lui injecter les impulsions électriques triphasées requises :

### 1. WCP Talon FX (Intégré au Kraken X60)
Le contrôleur de moteur (dérivé du Talon FX) est directement intégré à l'arrière physique du moteur Kraken X60.
* **Avantages** : Aucun câblage de phase moteur à faire, gain de place massif, réduction du risque de fils desserrés.
* **Protocole** : CAN bus (Phoenix Pro API).

### 2. REV SPARK MAX / SPARK Flex (Pour NEO et NEO 550)
* **SPARK MAX** : Nécessite deux faisceaux de câbles séparés (1 faisceau de 3 phases de puissance, 1 câble de capteur d'encodeur à 6 broches).
* **SPARK Flex** : Conçu pour s'emboîter directement à l'arrière des nouveaux moteurs NEO Vortex sans câbles de phase apparents.

---

## 🌐 Le Réseau de Communication : Le CAN Bus

Le **CAN Bus (Controller Area Network)** est un protocole de communication industriel standard qui permet à la roboRIO de contrôler des dizaines de moteurs et de lire des capteurs avec un seul bus de communication bifilaire.

:::important
**Règles absolues du câblage CAN Bus :**
1. Le réseau se compose d'une paire torsadée de fils **Vert (CAN Low)** et **Jaune (CAN High)**. Torsader les fils protège le signal des interférences électromagnétiques générées par la puissance des moteurs.
2. Le bus est câblé en **chaîne continue (daisy chain)** : roboRIO -> Contrôleur 1 -> Contrôleur 2 -> ... -> PDH.
3. La chaîne CAN doit obligatoirement se terminer par une **résistance de terminaison de 120 Ohms** (intégrée et activable par un switch physique à l'arrière de la PDH).
:::

---

## 📶 La Communication Sans-Fil : La Radio

Pour piloter le robot à distance, FIRST utilise une radio Wi-Fi dédiée (REV Radio ou OpenMesh) fonctionnant en fréquences restreintes et cryptées de 2.4 GHz et 5 GHz lors des tournois officiels.

:::warning
**Perte de communication en match (Brownout) !**
La radio est extrêmement sensible aux micro-coupures de tension. Si la batterie chute sous les 4.5V lors d'un appel brusque de courant des moteurs, la radio s'éteint et met plus de **45 secondes** à redémarrer, immobilisant le robot. Il est capital d'utiliser un **RPM (Radio Power Module)** ou un régulateur de tension dédié (VRM) câblé sur un canal secouru de la PDH.
:::

---

## 📚 Supports Supplémentaires

* 🖥️ **Slides de Présentation :** [Slides H1.1 - Électronique FRC](https://docs.google.com/presentation/d/1HGakEB6jhE4WON5OCA4wB5tr2pTyJo5cIO3TNS4YmfQ/edit)
* 📖 **Documentation Officielle WPILib :** [WPILib Hardware Basics](https://docs.wpilib.org/en/stable/docs/hardware/hardware-basics/index.html)
