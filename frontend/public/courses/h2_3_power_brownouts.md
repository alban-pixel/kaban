# H2.3 - Diagnostic Énergétique & Prévention des Chutes de Tension (Brownouts)

L'une des pannes les plus frustrantes en compétition FRC est le redémarrage (reboot) du roboRIO au milieu d'une action intense. Le robot s'immobilise soudainement pendant 30 secondes cruciales, devenant une cible facile pour la défense adverse. Cette panne est presque toujours due à une chute de tension critique de la batterie principale, appelée **Brownout**.

Comprendre la physique de l'alimentation électrique de votre robot et implémenter des stratégies logicielles et matérielles de prévention est indispensable pour garantir une fiabilité absolue sur le terrain.

---

## 🔋 1. Physique de la Batterie FRC & Modèle Mathématique de Chute de Tension

La batterie officielle autorisée en FRC est une batterie au plomb-acide de type **AGM (Absorbent Glass Mat)** étanche de **$12\text{ V}$** avec une capacité de **$18\text{ Ah}$** (ex : MK Battery ES18-12).

```
         SCHÉMA ÉQUIVALENT ÉLECTRIQUE DU ROBOT
         
         +-----[ BATTERIE IDÉALE (12.6V) ]-----+
         |                                     |
         +----------[ R_int (0.015 ohms) ]-----+  <-- Résistance Interne
         |                                     |
         +===========( Bornes Externes )=======+
         |                 |                   |
         |                 v                   |
         |         [ COURANT TOTAL I ]         |  <-- Accélération Swerve (300A+)
         |                 |                   |
         +========( Système de Contrôle )======+
```

### Le Concept de Résistance Interne ($R_{\text{int}}$)
Une batterie réelle n'est pas un générateur de tension parfait. Elle possède une **résistance interne** ($R_{\text{int}}$) due à la conductivité des plaques de plomb, de l'acide sulfurique et de l'usure chimique (sulfatation).
* Une batterie neuve, parfaitement chargée et chaude, a une résistance interne de **$0.011\ \Omega$ à $0.014\ \Omega$**.
* Une batterie usagée ou fatiguée affiche une résistance interne supérieure à **$0.022\ \Omega$**.

### Calcul de la tension aux bornes sous charge (Loi d'Ohm généralisée)
Lorsque le robot accélère brutalement, les 8 moteurs brushless du châssis Swerve et les moteurs de mécanisme s'activent simultanément. L'appel de courant global ($I$) peut grimper instantanément à **$300\text{ A}$ voire $400\text{ A}$**.

La tension réelle disponible aux bornes de la batterie ($V_{\text{bornes}}$) se calcule mathématiquement par la formule suivante :

$$
V_{\text{bornes}} = V_{\text{vide}} - I \times R_{\text{int}}
$$

Où :
* $V_{\text{vide}}$ est la tension de la batterie au repos ($\approx 12.6\text{ V}$ chargée à 100%).
* $I$ est l'intensité globale consommée par les moteurs ($\text{A}$).
* $R_{\text{int}}$ est la résistance interne de la batterie ($\Omega$).

:::important Exemple de calcul de Brownout
Comparons deux batteries de qualité différente lors d'un appel de courant de accélération maximale de $320\text{ A}$ :

#### Cas A : Batterie Neuve de Compétition ($R_{\text{int}} = 0.012\ \Omega$)

$$
V_{\text{bornes}} = 12.6\text{ V} - (320\text{ A} \times 0.012\,\Omega) = 12.6\text{ V} - 3.84\text{ V} = 8.76\text{ V}
$$

*La tension reste supérieure à $8\text{ V}$. Tout le système de contrôle fonctionne parfaitement.*

#### Cas B : Batterie Usagée de Stand ($R_{\text{int}} = 0.024\ \Omega$)

$$
V_{\text{bornes}} = 12.6\text{ V} - (320\text{ A} \times 0.024\,\Omega) = 12.6\text{ V} - 7.68\text{ V} = 4.92\text{ V}
$$

*La tension s'effondre sous la barre des $5\text{ V}$. C'est le Brownout immédiat !*
:::

---

## 🚨 2. Le Mécanisme de Protection du roboRIO face aux Baisses de Tension

Pour éviter sa propre extinction complète et protéger l'électronique de communication sensible (comme le module Wi-Fi radio), le roboRIO intègre un algorithme de délestage automatique (Brownout Protection Stages) :

```
 TENSION (V)
   12.6 |=========== ETAT DE MARCHE NORMAL (Tension stable)
        |
    6.8 |----------- STAGE 1 : Coupure du rail Servos 6V & Signaux PWM moteurs
        |
    6.3 |----------- STAGE 2 : Limitation CAN et désactivation des étages de puissance
        |
    4.5 |----------- STAGE 3 : Extinction logique du roboRIO (Reboot de 30 secondes)
        |
      0 +--------------------------------------------------------------------> TEMPS
```

* **Étape 1 (Tension $< 6.8\text{ V}$)** : Le roboRIO coupe l'alimentation du port Servo 6V et envoie des ordres aux contrôleurs de moteurs de désactiver leurs étages de puissance. Les moteurs cessent de pousser pendant quelques millisecondes pour laisser remonter la tension de la batterie.
* **Étape 2 (Tension $< 4.5\text{ V}$)** : Le convertisseur de tension interne du roboRIO ne parvient plus à maintenir l'alimentation logique de $3.3\text{ V}$ et $5\text{ V}$. Le processeur central du roboRIO s'éteint et redémarre complètement.

---

## 💻 3. Stratégies Logicielles de Prévention (Software Mitigation)

Les meilleures équipes FRC mondiales n'attendent pas de subir des coupures. Elles programment des garde-fous directement dans le code Java/C++ pour interdire les pics d'intensité destructeurs.

### 1. Limitation Logicielle du Courant (Stator & Supply Current Limits)
Les contrôleurs de moteurs modernes (Talon FX, Spark Max) permettent de configurer deux types de limites de courant :

* **Supply Current Limit (Courant d'alimentation)** : C'est le courant électrique réel qui sort de la batterie en direction du contrôleur. C'est elle qui protège la batterie des baisses de tension.
  * *Valeur recommandée pour propulsion Swerve* : Limitez à **$35\text{ A}$ ou $40\text{ A}$** par moteur.
* **Stator Current Limit (Courant statorique)** : C'est le courant de court-circuit qui circule à l'intérieur des bobinages du moteur brushless pour générer le couple mécanique. Elle protège le moteur contre la surchauffe thermique.
  * *Valeur recommandée* : Limitez à **$60\text{ A}$ ou $80\text{ A}$** pour préserver un excellent couple d'accélération à basse vitesse sans surcharger la batterie lors des démarrages.

```java
// Exemple d'implémentation Java WPILib pour un moteur Falcon 500 / Kraken (Talon FX)
TalonFXConfiguration config = new TalonFXConfiguration();

// Activer la limite de courant d'alimentation de 40 Ampères
config.CurrentLimits.SupplyCurrentLimitEnable = true;
config.CurrentLimits.SupplyCurrentLimit = 40.0; // Amps max sortant de la batterie
config.CurrentLimits.SupplyCurrentThreshold = 60.0; // Seuil de déclenchement temporaire
config.CurrentLimits.SupplyTimeThreshold = 0.1; // Durée autorisée au-delà du seuil (secondes)

// Activer la limite statorique pour protéger les bobines du moteur
config.CurrentLimits.StatorCurrentLimitEnable = true;
config.CurrentLimits.StatorCurrentLimit = 80.0; // Amps max internes aux bobines

moteurDrive.getConfigurator().apply(config);
```

### 2. Rampe d'Accélération (Slew Rate Limiters)
Un pic de courant se produit lors d'une accélération instantanée (lorsque le pilote pousse la manette de $0\%$ à $100\%$ en une milliseconde). 
En enveloppant la commande du pilote dans un **SlewRateLimiter**, on limite le taux de variation maximal de la consigne (ex : limiter la variation à $2.0$ unités par seconde). Le robot accélère toujours de manière ultra-rapide mais sans le pic de courant initial destructeur.

### 3. Compensation de Tension (Voltage Compensation)
La tension de la batterie évolue constamment pendant le match (de $12.6\text{ V}$ au repos à $9\text{ V}$ sous forte charge). Si vous demandez à vos moteurs $50\%$ de puissance, la tension effective appliquée changera continuellement selon l'effort global du châssis.
* En activant la **Voltage Compensation** à une valeur nominale de **$12.0\text{ V}$**, les contrôleurs de moteurs ajustent automatiquement leur rapport cyclique (Duty Cycle) en temps réel pour délivrer une tension stable et prévisible aux moteurs, quelle que soit la tension instantanée aux bornes de la batterie.

---

## 🛠️ 4. Triage Matériel des Batteries : L'outil "Battery Beak"

Afin de garantir que seules les batteries à faible résistance interne entrent sur le terrain en match de compétition, l'équipe STAN ROBOTIX applique un protocole de triage rigoureux.

```
                  DIAGNOSTIC DU BATTERY BEAK (Triage)
                  
      R_int < 0.015 ohms          0.015 - 0.020 ohms         > 0.020 ohms
   +-----------------------+   +-----------------------+   +-----------------------+
   |      COMPÉTITION      |   |     ENTRAÎNEMENT      |   |   À RECYCLER / SCRAP  |
   | (Batterie d'élite)    |   | (Stands et réglages)  |   | (Risque de Brownout)  |
   +-----------------------+   +-----------------------+   +-----------------------+
```

### Le fonctionnement du Battery Beak
Le *Battery Beak* (développé par WestCoast Products) est un testeur de batterie portable indispensable. Contrairement à un voltmètre classique qui mesure la tension à vide sans détecter une résistance interne défectueuse, le Battery Beak applique une série d'**appels de charge électrique contrôlés à court terme (15A et 30A)** pendant quelques millisecondes :
1. Il mesure la différence de tension exacte provoquée par la charge.
2. Il calcule instantanément la résistance interne dynamique de la batterie.
3. Il fournit une estimation de la capacité globale et du niveau de santé (SoH - State of Health).

### Protocole de marquage de l'équipe
Chaque batterie dispose d'une étiquette numérotée avec sa charte de couleur :
* **Étiquette Verte (Compétition)** : $R_{\text{int}} < 0.015\ \Omega$. Utilisée exclusivement lors des matches officiels.
* **Étiquette Orange (Entraînement / Stand)** : $R_{\text{int}}$ comprise entre $0.015\ \Omega$ et $0.020\ \Omega$. Parfaite pour les essais et réglages dans les stands.
* **Étiquette Rouge (À rebuter)** : $R_{\text{int}} > 0.020\ \Omega$. Danger de mort électrique en match. Ces batteries sont données à l'équipe de démonstration communautaire ou envoyées au recyclage.

:::warning Règle d'or matérielle : Le serrage des cosses
Une vis de borne de batterie mal serrée ou sans rondelle élastique (Lock washer) peut ajouter une résistance de contact parasite de plus de **$0.010\ \Omega$** à elle seule sous l'effet des vibrations !
* Serrez impérativement les écrous de batterie à l'aide de deux clés de $7/16\text{"}$ à un couple ferme d'environ **$5\text{ Nm}$**.
* Ajoutez une rondelle frein (rondelle Grower ou éventail) pour empêcher tout desserrage mécanique.
* Isolez soigneusement les cosses avec de la gaine thermo-rétractable ou de l'adhésif électrique de couleur pour éviter tout court-circuit accidentel par la chute d'un outil métallique.
:::

---

## 📚 Supports Supplémentaires

* 💻 **WestCoast Products Battery Beak Guide :** [Battery Beak Testing Guide](https://www.wcproducts.com/battery-beak)
* 📖 **WPILib Power Distribution Manual :** [Understanding roboRIO Brownouts](https://docs.wpilib.org/en/stable/docs/software/roborio-info/roborio-brownouts.html)
* 🧪 **FRC Battery Care & Diagnostics :** [Best Practices for Battery Longevity](https://chiefdelphi.com/)
