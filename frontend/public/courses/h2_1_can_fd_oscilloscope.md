# H2.1 - Topologie de Communication CAN FD & Diagnostic Oscilloscope

Dans un robot FRC moderne de niveau élite, les flux de données circulant entre le roboRIO (le cerveau) et les dizaines de contrôleurs de moteurs (Talon FX, Kraken X60) ou de capteurs (CANCoder, gyro) sont massifs. Historiquement, le bus de communication standard **CAN 2.0** suffisait. Cependant, l'avènement des propulsions Swerve à 8 ou 4 moteurs associés à de multiples asservissements en boucle fermée à haute fréquence a mis en évidence la saturation rapide de la bande passante.

Pour y remédier, la FRC utilise aujourd'hui le protocole ultra-performant **CAN FD (Flexible Data-rate)** développé par CTR Electronics et supporté par les contrôleurs de moteurs de dernière génération.

---

## 🏎️ 1. CAN classique (2.0) vs CAN FD : La Révolution des Débits

Le bus CAN (Controller Area Network) est un protocole de communication série robuste utilisé à l'origine dans l'automobile pour éliminer les kilomètres de câbles individuels.

```
+-----------------------------------------------------------------+
| COMPARATIF DE PRAMETRES DE TRANSMISSION                         |
+------------------------------+------------------+---------------+
| Paramètre                    | CAN Classique 2.0| CAN FD        |
+------------------------------+------------------+---------------+
| Débit de la phase d'arbitrage| 1 Mbps           | 1 Mbps        |
| Débit de la phase de données | 1 Mbps           | 8 à 10 Mbps   |
| Taille maximale du message   | 8 Octets         | 64 Octets     |
| Utilisation de la bande      | Saturation rapide| Ultra-fluide  |
+------------------------------+------------------+---------------+
```

### Le goulot d'étranglement du CAN 2.0
Sous le protocole CAN 2.0 (1 Mbps), chaque trame de données ne peut transporter que $8\text{ octets}$ de charge utile (payload). Pour surveiller la vitesse d'une roue Swerve, son courant électrique, sa température et sa position angulaire à une fréquence de $100\text{ Hz}$, un contrôleur de moteur doit émettre des dizaines de trames par seconde. 
* Avec 8 moteurs Swerve, un gyroscope et un encodeur absolu par roue, la charge totale du bus dépasse souvent **$85\%$**. 
* Au-delà de $80\%$ d'utilisation, des collisions de paquets se produisent, entraînant de la latence (lag) de commande, des pertes de signaux (CAN Frames stale) et des comportements chaotiques du robot en plein match.

### La solution : CAN FD
Le **CAN FD** (Flexible Data-rate) résout ce problème de deux manières révolutionnaires :
1. **Accélération de la vitesse de transmission (Data-rate)** : Alors que l'arbitrage (l'identification de la priorité du message) se fait toujours à $1\text{ Mbps}$ pour conserver la stabilité, la transmission des données réelles s'effectue à **$8$ ou $10\text{ Mbps}$** (sur le bus CANivore de CTR Electronics).
2. **Payload étendue** : La taille maximale d'un paquet passe de $8\text{ octets}$ à **$64\text{ octets}$**. On peut ainsi envoyer toutes les télémétries d'un moteur dans une seule trame optimisée, divisant drastiquement la surcharge administrative du protocole.

:::important Le CANivore de CTR Electronics
Le roboRIO ne supporte pas nativement le CAN FD sur son port CAN intégré. Pour bénéficier du CAN FD, les équipes doivent ajouter un module intermédiaire branché en USB-C sur le roboRIO : le **CANivore**. Ce module gère un bus CAN FD distinct, libérant ainsi le bus CAN classique du roboRIO pour les composants qui ne supportent pas le CAN FD (comme le Power Distribution Hub ou le Pneumatic Hub).
:::

---

## 🔌 2. Structure Physique & Impédance du Bus CAN

Pour qu'un bus de données transmette des informations à $10\text{ Mbps}$ sans erreur, la structure physique du câblage doit être irréprochable. Le bus CAN utilise une **paire de fils torsadés différentiels** : **CAN High (Jaune)** et **CAN Low (Vert)**.

```
                   120 ohms RESISTOR (roboRIO)
                         |
                 +-------+-------+
                 |               |
   CAN-H (Jaune) ================================================= CAN-H
   CAN-L (Vert)  ================================================= CAN-L
                 |               |
                 +-------+-------+
                         |
                   120 ohms RESISTOR (PDH / Fin de ligne)
```

### 1. Pourquoi torsader les fils ?
Torsader les fils vert et jaune permet d'annuler les **interférences électromagnétiques (EMI)** générées par les champs magnétiques intenses des moteurs et des variateurs de vitesse. Lorsqu'un parasite externe traverse la ligne torsadée, il affecte de manière identique le fil jaune (CAN-H) et le fil vert (CAN-L). Le récepteur calcule la différence de tension entre les deux fils :

$$
V_{\text{diff}} = V_{\text{CAN-H}} - V_{\text{CAN-L}}
$$

Puisque le parasite a augmenté la tension de la même valeur sur les deux lignes, la soustraction différentielle l'annule instantanément.

### 2. Les Résistances de Terminaison de $120\ \Omega$
À très haute fréquence de communication, le signal électrique se comporte comme une onde physique. Lorsqu'il arrive au bout du câble, si l'extrémité est laissée vide, l'onde "rebondit" et repart en sens inverse sur le bus, venant percuter et corrompre les paquets de données suivants.
* Pour absorber cette énergie et éliminer les échos, nous devons placer une **résistance de terminaison d'exactement $120\text{ ohms}$** à chaque extrémité physique du bus.
* Dans le câblage FRC standard, le roboRIO intègre la première résistance de $120\ \Omega$. L'autre extrémité du bus doit obligatoirement se terminer sur un équipement configuré avec sa résistance interne activée (souvent le commutateur physique à l'arrière du **Power Distribution Hub (PDH)** ou une résistance physique scellée en fin de chaîne).

:::tip Câblage en chaîne (Daisy Chain) vs Dérivation (Stubs)
* **Daisy Chain (Recommandé)** : Le câble entre dans un contrôleur de moteur et en ressort immédiatement pour aller au suivant. Cela évite les branches mortes.
* **Stubs (À éviter en CAN FD)** : Faire une ligne centrale et connecter les contrôleurs via de petites dérivations (Y-junctions). En CAN FD, les dérivations doivent impérativement mesurer **moins de $30\text{ cm}$** sous peine de générer des vagues de réflexion destructrices pour le signal.
:::

---

## 🔬 3. Diagnostic au Multimètre (Le Test Rapide en Stand)

En cas de panne totale du réseau CAN en compétition (voyants rouges clignotants sur tous les moteurs, absence de communication), la première étape de diagnostic s'effectue hors tension avec un simple multimètre configuré en mode **Ohmmètre** :

1. Éteignez complètement le disjoncteur principal du robot.
2. Branchez les pointes de touche du multimètre entre le fil jaune (CAN-H) et le fil vert (CAN-L) au niveau d'un connecteur intermédiaire ou sur les ports de test du PDH.

### Analyse des Résultats de Résistance globale ($R_{\text{bus}}$)

$$
\frac{1}{R_{\text{bus}}} = \frac{1}{120\,\Omega} + \frac{1}{120\,\Omega} = \frac{2}{120\,\Omega} \implies R_{\text{bus}} = 60\,\Omega
$$

* **Si la mesure donne environ $60\text{ ohms}$ ($\pm 5\ \Omega$)** : Le câblage physique est parfait. Les deux résistances de terminaison de $120\ \Omega$ sont bien présentes en parallèle.
* **Si la mesure donne environ $120\text{ ohms}$** : Une des deux résistances de terminaison est absente ou déconnectée. Le câble est probablement coupé quelque part ou le commutateur du PDH est sur "OFF". Les données peuvent passer mais le réseau subira des pertes intermittentes.
* **Si la mesure donne $0\text{ ohm}$ (ou proche)** : Court-circuit direct. Les fils jaune et vert se touchent physiquement quelque part (gaine écrasée, brin métallique rebelle dans un connecteur).
* **Si la mesure donne une résistance infinie ($\text{OL}$)** : Rupture complète du bus entre le point de mesure et les deux extrémités.

---

## 📈 4. Diagnostic Avancé à l'Oscilloscope Numérique

Lorsque le multimètre indique $60\text{ ohms}$ mais que le bus subit tout de même des déconnexions (erreurs de trame intermittentes), nous devons visualiser la "santé" électrique du signal à l'aide d'un **oscilloscope**.

```
    TENSION (V)
      5.0 |             
      3.5 |    _/\_/\_  <-- CAN High (Tension monte à 3.5V lors du bit dominant)
      2.5 |   /       \ 
      1.5 |   \_/\_/\_/ <-- CAN Low (Tension descend à 1.5V lors du bit dominant)
        0 +--------------------------------------------------------------------> TEMPS
```

### Le Signal Électrique CAN Sain
Sur un oscilloscope branché en mode différentiel (ou en observant CAN-H et CAN-L séparément par rapport à la masse) :
* **État Récessif (Bit logique 1)** : Aucun message n'est transmis. Les deux lignes CAN-H et CAN-L sont au même potentiel de repos d'environ **$2.5\text{ V}$**. La différence de tension est nulle ($0\text{ V}$).
* **État Dominant (Bit logique 0)** : Émission de données.
  * La ligne **CAN-H monte à $3.5\text{ V}$**.
  * La ligne **CAN-L descend à $1.5\text{ V}$**.
  * La différence de tension est d'exactement **$2.0\text{ V}$**.

### Signaux Distordus Typiques et Leurs Causes
En observant l'écran de l'oscilloscope, un œil averti peut identifier instantanément le problème physique sous-jacent :

#### 1. Les Bords Arrondis et Oscillations (Ringing)
* *Visuel* : Les transitions verticales nettes entre le bit 0 et le bit 1 ressemblent à des vagues oscillantes qui s'amortissent lentement. Le signal met du temps à revenir à $2.5\text{ V}$.
* *Cause* : Absence d'une résistance de terminaison de $120\ \Omega$. L'onde rebondit et vient perturber la fin du bit.
* *Conséquence* : À $10\text{ Mbps}$ (CAN FD), le récepteur lit la valeur du bit trop tôt et interprète des données erronées.

#### 2. Pics Verticaux Abrupts (Spikes) de Parasites
* *Visuel* : Des pics verticaux de tension gigantesques (dépassant parfois $8\text{ V}$) apparaissent périodiquement sur la ligne.
* *Cause* : Fils non torsadés passés à proximité immédiate des câbles de puissance d'un moteur brushless ou d'un compresseur pneumatique.
* *Conséquence* : Le roboRIO perd la synchronisation temporelle du bus et désactive temporairement le réseau CAN.

#### 3. Affaissement de Tension (Voltage Droop)
* *Visuel* : Les bits dominants ne parviennent pas à atteindre l'écart nominal de $2.0\text{ V}$ (CAN-H n'atteint que $3.0\text{ V}$ et CAN-L ne descend qu'à $2.0\text{ V}$).
* *Cause* : Résistance de contact excessive sur la ligne. C'est le résultat typique de l'utilisation de connecteurs à sertir de mauvaise qualité, oxydés ou mal serrés.

---

## 🛠️ 5. Protocole de Câblage Robuste pour STAN ROBOTIX

Pour éviter toute avarie de communication pendant les qualifications, l'équipe applique des règles de câblage strictes :
1. **Pas de connecteurs rapides type "Wago" ou dominos** sur le bus CAN principal. Utilisez uniquement des connecteurs étanches de haute qualité avec verrouillage mécanique (comme les connecteurs Molex SL ou des soudures directes protégées par de la gaine thermorétractable double paroi avec colle interne).
2. **Torsadez manuellement** vos câbles CAN à l'aide d'une perceuse électrique si vous utilisez du fil standard : effectuez au moins **1 torsion tous les $2\text{ cm}$** pour garantir une immunité maximale aux parasites.
3. **Cheminement séparé** : Ne faites jamais passer les câbles du bus CAN dans les mêmes goulottes ou colliers de serrage que les câbles de puissance épais de $12\text{V}$ provenant de la batterie ou allant aux moteurs de propulsion. Laissez une distance minimale de **$5\text{ cm}$** entre les deux réseaux.

---

## 📚 Supports Supplémentaires

* 💻 **CTR Electronics CAN FD Documentation :** [CTR CANivore User Guide](https://pro.ctr-electronics.com/canivore/)
* 📖 **WPILib Hardware Guide :** [CAN Bus Wiring Basics](https://docs.wpilib.org/en/stable/docs/hardware/hardware-basics/can-bus.html)
* 🧪 **Tektronix Application Note :** [Troubleshooting CAN Bus with an Oscilloscope](https://www.tek.com/)
