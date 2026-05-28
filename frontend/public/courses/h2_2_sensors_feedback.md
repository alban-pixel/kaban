# H2.2 - Capteurs Physiques et Asservissement Matériel (Hardware Closed-Loop)

Dans un système robotique autonome ou semi-autonome, les capteurs sont les yeux et les oreilles de votre machine. Concevoir des algorithmes d'asservissement sophistiqués (comme un PID ou un profil de mouvement trapézoïdal) ne sert à rien si les capteurs renvoient des informations bruitées, en retard, ou s'ils se brisent sous les chocs violents inhérents aux matches FRC.

Pour atteindre des performances de classe mondiale, l'équipe STAN ROBOTIX met en place une topologie d'**Asservissement Matériel (Hardware-based Closed-Loop)**, où les capteurs communiquent directement avec les processeurs internes des contrôleurs de moteurs, court-circuitant la latence du roboRIO.

---

## 🧭 1. Les Encodeurs Absolus Magnétiques (CANCoder) & Asservissement Swerve

Pour piloter un châssis **Swerve (roues directionnelles indépendantes)**, le robot doit connaître avec une précision absolue et en temps réel l'orientation angulaire de chaque roue au démarrage du match.

```
       ROUE DE PROPULSION SWERVE (Directionnelle)
       
              +--------------------------+
              |    Moteur de Pivot       |
              +--------------------------+
                           |
                           v  (Engrènement)
                   +---------------+
                   | CANCoder Unit | <--- Encodeur absolu monté
                   +---------------+      directement sur l'arbre final
                           |
                           v
                     [ ROUE SWERVE ] (Pivot à 360°)
```

### Encodeur Relatif vs Encodeur Absolu
* **Encodeurs Relatifs (Intégrés aux moteurs Falcon/Kraken)** : Ils mesurent la variation relative de position par rapport à un point de départ arbitraire. Si le robot est allumé avec ses roues tordues à $45^\circ$, le moteur considère cette position d'allumage comme son zéro absolu ($0^\circ$). Le robot partira alors de travers !
* **Encodeurs Absolus (CANCoder de CTR Electronics)** : Ils utilisent un capteur à effet Hall magnétique qui lit l'orientation d'un aimant polarisé diamétralement fixé sur l'arbre de pivot. Il connaît la position réelle et absolue sur $360^\circ$ dès la première milliseconde d'allumage, sans exiger de procédure d'étalonnage (homing-free).

### L'Architecture d'Asservissement Matériel Décentralisé
La plupart des équipes débutantes commettent l'erreur de lire la valeur de l'encodeur absolu sur le roboRIO, de calculer la commande moteur dans le code Java/C++, puis d'envoyer la consigne au moteur via le bus CAN. Cette méthode souffre de la **latence de boucle du roboRIO (20ms / 50Hz)** et des délais du bus CAN.

Pour une réactivité maximale, nous configurons l'asservissement directement au niveau du matériel (moteur Kraken/Talon FX) :
1. L'encodeur **CANCoder** est physiquement raccordé sur le même bus CAN FD que le contrôleur de moteur **Talon FX**.
2. Dans le code, nous configurons le Talon FX pour qu'il utilise le CANCoder comme sa **source de feedback à distance (Remote Feedback Device)**.
3. Le calcul de la boucle fermée de position (PID interne) s'effectue directement sur le processeur du Talon FX à une fréquence de **$1000\text{ Hz}$ (1 milliseconde)**.
4. L'alignement de la roue Swerve devient incroyablement réactif, fluide, et n'occupe aucune ressource processeur sur le roboRIO.

---

## ⚡ 2. Capteurs Laser Time-of-Flight (ToF) vs Cellules Photoélectriques

Détecter la présence d'une pièce de jeu (une note, un cône ou un cube) à l'intérieur du mécanisme d'Intake ou du convoyeur est l'étape déclencheuse de tous les automatismes du robot (indexage automatique, blocage de l'Intake, préparation du tir).

```
         CAPTEUR DE DÉTECTION DE PIÈCE DE JEU (Intake)
         
          +---------------+         
          |   Capteur     | ======== (Faisceau Laser Invisible 940nm) ======>
          | Time-of-Flight| 
          +---------------+ 
                                         [ PIÈCE DE JEU ] (Obstacle)
                                                |
                                                v (Réflexion de la lumière)
                            <======== Retour du faisceau ===================
```

### Le Fiasco des Capteurs Infrarouges Analogiques Communs
Les capteurs infrarouges de proximité classiques (comme les Sharp GP) mesurent l'intensité de la lumière réfléchie pour estimer la distance. C'est une méthode extrêmement vulnérable en compétition FRC :
* **Dépendance de couleur** : Un cube noir ou une pièce de jeu sombre absorbe l'infrarouge et semblera beaucoup plus éloignée qu'un cône jaune vif.
* **Pollution lumineuse des stades** : Les projecteurs de télévision et l'éclairage intense des stades de compétition saturent les récepteurs infrarouges, provoquant de fausses détections ou des aveuglements complets.

### La Solution Industrielle : Time-of-Flight (ToF)
Les capteurs Time-of-Flight (comme le module de *Playing With Fusion* utilisant la puce STMicroelectronics VL53L1X) mesurent physiquement le **temps de vol de la lumière** :
1. Une diode laser VCSEL émet une impulsion lumineuse infrarouge invisible à **$940\text{ nm}$**.
2. L'impulsion rebondit sur l'obstacle et revient vers un récepteur de photons ultra-rapide (SPAD).
3. Le processeur interne du capteur calcule la distance exacte en mesurant le temps écoulé $t$ à l'aide de la constante de la vitesse de la lumière $c$ :

$$
\text{Distance} = \frac{c \times t}{2}
$$

* **Avantages** : La mesure est totalement indépendante de la couleur de la pièce de jeu, de sa réflectivité, et reste insensible aux flashs d'appareils photo ou aux projecteurs du terrain. La précision est de l'ordre de **$\pm 2\text{ mm}$** jusqu'à $4\text{ mètres}$ !

---

## 🛡️ 3. Capteurs de Proximité Inductifs : Les Fins de Course Indestructibles

Pour empêcher un ascenseur vertical (Elevator) ou un bras pivotant lourd de dépasser ses limites physiques et de s'auto-détruire contre son propre châssis, nous devons installer des capteurs de fin de course.

```
       CAPTEUR INDUCTIF (Indestructible)      FIN DE COURSE MÉCANIQUE (Fragile)
       
             +-------+                                     /
             |       | === [Pas de contact]               o--- (Bras pliable)
             | (===) | <--- Champ Magnétique               \
             +-------+                                     
                 |                                         
                 v                                         
          [ Plaque Métal ] (Cible)                 [ Impact Direct ] (Risque de casse)
```

### La fragilité des interrupteurs mécaniques (Micro-switches)
Les fins de course à levier mécanique exigent un contact physique direct pour s'activer. Sous l'effet des secousses violentes d'un match FRC, ces leviers en métal fin se plient, se désalignent ou se brisent net lors d'un choc à pleine vitesse.

### L'Inductif : La Détection Solide-State Sans Contact
Un capteur de proximité inductif détecte la présence de cibles métalliques à courte distance (généralement de $2\text{ mm}$ à $8\text{ mm}$) sans aucun contact physique :
1. Le capteur émet un champ magnétique alternatif haute fréquence à son extrémité.
2. Lorsqu'un objet métallique (plaque en aluminium ou vis en acier) pénètre dans ce champ, des **courants de Foucault (Eddy currents)** sont induits à la surface du métal.
3. Ces courants créent une charge sur le circuit oscillateur du capteur, ce qui atténue l'amplitude des oscillations.
4. Un circuit comparateur détecte cette perte d'amplitude et bascule l'état de la sortie électrique (de type NPN ou PNP).

### Avantages Majeurs en FRC
* **Indestructibilité totale** : Le capteur est encapsulé dans un corps en laiton nickelé ou plastique scellé IP67 étanche à la poussière de stand. Il n'y a aucune pièce mobile susceptible de s'user ou de se gripper.
* **Fonctionnement par frôlement** : Le mécanisme peut frôler le capteur à haute vitesse sans jamais le percuter physiquement.

:::warning Attention aux métaux non-ferreux !
La distance de détection d'un capteur inductif dépend du type de métal de la cible. Les fiches techniques indiquent la distance pour l'acier doux. Pour l'**aluminium** (qui est le métal de base de nos robots FRC), la distance de détection doit être multipliée par un facteur de correction thermique (généralement **$0.40$**) car l'aluminium est moins magnétique.
* Si le capteur a une portée nominale de $5\text{ mm}$ sur de l'acier, il ne détectera une plaque d'aluminium qu'à **$2\text{ mm}$** ! Ajustez vos conceptions CAO en conséquence.
:::

---

## 🎨 4. Tableau Synthétique d'Intégration des Capteurs en FRC

Pour vous guider dans le choix de l'instrumentation de vos robots, voici la matrice d'ingénierie de STAN ROBOTIX :

| Type de Capteur | Technologie physique | Cas d'usage FRC idéal | Raccordement électrique | Avantage principal |
| :--- | :--- | :--- | :--- | :--- |
| **CANCoder** | Encodeur Magnétique Absolu | Pivot de module Swerve, Bras pivotants à $360^\circ$ | Réseau CAN (FD de préférence) | Mémorisation de la position hors tension |
| **PWF ToF Sensor** | Laser Time-of-Flight | Détection de note dans le Shooter, Indexeur | Réseau CAN ou port $I^2C$ | Insensible à la lumière externe et à la couleur |
| **Capteur Inductif**| Électromagnétique sans contact| Fin de course d'ascenseur, Zéro de bras pivotant | Entrée numérique roboRIO (DIO) | Résistant aux chocs violents directs |
| **Limelight 3G** | Vision artificielle par caméra | Alignement automatique sur AprilTags, odométrie | Réseau Ethernet via Switch RJ45 | Calcul de pose tridimensionnel en temps réel |
| **Pigeon 2.0 (IMU)**| Gyroscope MEMS 9 axes | Maintien du cap du robot (Field-Oriented Drive) | Réseau CAN (sur le CANivore) | Zéro dérive de cap pendant les 2 min 30 de match |

---

## 📚 Supports Supplémentaires

* 💻 **CTR Electronics Sensors Guide :** [CANCoder User Manual](https://pro.ctr-electronics.com/cancoder/)
* 📖 **Playing With Fusion Tech Sheet :** [Time-of-Flight Sensor specifications](https://www.playingwithfusion.com/)
* 🛠️ **WPILib Sensor Documentation :** [Using Proximity Sensors in FRC Java/C++](https://docs.wpilib.org/en/stable/docs/software/hardware-apis/sensors/proximity-sensors.html)
