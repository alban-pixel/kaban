# H1.2 - Bonnes Pratiques de Câblage

Un robot FRC performant mécaniquement mais mal câblé est un robot condamné à s'arrêter de façon intermittente ou à subir de graves avaries de communication en plein milieu d'une finale. Un câblage électrique de niveau industriel est donc requis.

---

## 📏 Choix du Calibre de Fil (Wire Gauge AWG)

Le diamètre d'un fil électrique détermine la quantité maximale d'intensité (Ampères) qu'il peut faire transiter de façon sécurisée sans surchauffer ou faire chuter la tension de façon dramatique (tension drop). En FRC, nous utilisons le standard **AWG (American Wire Gauge)** :

| Calibre (AWG) | Section ($mm^2$) | Usage type FRC | Fusible max autorisé |
| :--- | :--- | :--- | :--- |
| **6 AWG** | $13.3\text{ }mm^2$ | Connexions Batterie, Disjoncteur principal 120A, PDH principal | **Disjoncteur 120A** |
| **10 AWG / 12 AWG**| $5.2 / 3.3\text{ }mm^2$| Moteurs de traction très gourmands (Kraken, NEO) | **40 A** |
| **14 AWG / 16 AWG**| $2.1 / 1.3\text{ }mm^2$| Moteurs de puissance moyenne (NEO 550, compresseur) | **20 A / 30 A** |
| **18 AWG / 22 AWG**| $0.8 / 0.3\text{ }mm^2$| Alimentation roboRIO, capteurs DIO, réseau CAN Bus | **5 A / 10 A** |

---

## ✂️ L'Art du Sertissage (Crimping)

En FRC, **les soudures à l'étain sont formellement proscrites** sur les câbles de puissance ! Sous l'effet des vibrations intenses et répétées du robot, les soudures subissent de la fatigue mécanique et finissent par casser net. Nous utilisons exclusivement des **cosses serties à froid**.

:::tip
**Test du tir mécanique (Pull Test) :**
Une fois une cosse sertie sur votre fil, tirez fermement dessus à la main de toutes vos forces. Si le fil glisse ou si la cosse se détache, le sertissage est défaillant. Recommencez immédiatement. Une cosse bien sertie fusionne mécaniquement le métal du fil et de la cosse.
:::

### Les Connecteurs de Référence en FRC
* **Connecteurs Anderson Powerpole (PP45)** : Le standard absolu pour accoupler rapidement les moteurs brushless. Code couleur strict : **Rouge pour le Positif (+), Noir pour le Négatif (-)**.
* **Cosses tubulaires à anneau (Ring Terminals)** : Utilisées pour fixer solidement les gros câbles 6 AWG de la batterie au disjoncteur principal de 120A à l'aide de vis M6 serrées avec des rondelles freins (lockwashers).
* **Embouts de câble (Ferrules)** : Petits tubes en cuivre étamé à sertir au bout de chaque fil dénudé avant de l'insérer dans les bornes rapides à ressort (WAGO) de la PDH ou de la roboRIO. Cela évite que des brins de cuivre ne s'éparpillent et ne causent un court-circuit destructeur.

---

## 🎨 Organisation & Gestion des Câbles (Cable Management)

Un panneau électrique propre est un panneau facile à diagnostiquer rapidement entre deux matches tendus.

* **La Gaine Thermorétractable (Heat Shrink)** : Recouvrez systématiquement chaque connexion métallique dénudée avec de la gaine thermo de la bonne dimension pour assurer une isolation diélectrique irréprochable.
* **Le repérage couleur (Labeling)** : Marquez chaque câble à ses deux extrémités à l'aide de ruban de couleur ou d'étiquettes imprimées (ex. `MTR_SWERVE_FL` pour le moteur Swerve avant-gauche).
* **Fixation et Rangement** : Utilisez des colliers de serrage en nylon (Zip Ties), de la gaine tressée extensible (Snake skin) et des embases de fixation adhésives pour ancrer solidement vos faisceaux de câbles à la structure en aluminium du robot. Aucun fil ne doit pendre ou risquer de s'accrocher à un mécanisme mobile !

---

## 📚 Supports Supplémentaires

* 🖥️ **Slides de Présentation :** [Slides H1.2 - Câblage & Diagnostics](https://docs.google.com/presentation/d/1whyvTc-HmHIQoMQok2rVF6ahzuzkDI1A4BrMUjpHwMc/edit?slide=id.g2c2c9bf8b8_0_96)
* 📖 **Tutoriels d'assemblage électrique WPILib :** [WPILib Hardware Tutorials](https://docs.wpilib.org/en/stable/docs/hardware/hardware-tutorials/index.html#)
