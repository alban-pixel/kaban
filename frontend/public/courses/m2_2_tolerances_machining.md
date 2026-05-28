# M2.2 - Tolérances Géométriques & Ajustements d'Usinage en Robotique FRC

Sur un logiciel de CAO comme Onshape, toutes les pièces sont virtuellement parfaites : les axes font exactement $12.700\text{ mm}$ de diamètre, les entraxes d'engrenages s'alignent au micromètre près et les plaques découpées sont d'une planéité infinie. 

Dans l'atelier d'usinage réel, la perfection n'existe pas. Les fraiseuses CNC, les découpeuses jet d'eau/laser et les imprimantes 3D ont toutes des **limites physiques de précision géométrique et de tolérance de fabrication** (généralement comprises entre $\pm 0.02\text{ mm}$ et $\pm 0.25\text{ mm}$ selon la machine et le matériau). Si vous concevez vos pièces à la cote nominale exacte, le robot sera impossible à assembler à la main ou subira des frictions énergétiques considérables qui détruiront vos moteurs et videront vos batteries.

---

## 🐻 1. Ajustements de Roulements et Système ISO (H7/g6, H7/p6)

Le diamètre extérieur nominal d'un roulement FRC classique à collerette de $1/2\text{"}$ (standard mondial de l'industrie pour les arbres hexagonaux) est d'exactement **$1.125\text{ pouce}$** ($28.575\text{ mm}$). 

Pour monter ce roulement dans une plaque d'aluminium (flasque de boîte de vitesses ou structure de châssis), nous utilisons le système d'ajustements standardisés ISO adaptés à la FRC :

```
             DIAMÈTRE DE CONCEPTION DU TROU (CAD)
   < 1.124 in          1.125 in          > 1.126 in
-------|-------------------|-------------------|-------
   PRESS-FIT           NOMINAL             SLIP-FIT
 (Serré fort/H7/p6)  (Ne rentre pas)    (Glissant/H7/g6)
```

### Ajustement Serré (Press-Fit - Type H7/p6)
Le diamètre extérieur du roulement est légèrement supérieur à celui du logement. La bague externe du roulement est comprimée radialement, ce qui l'empêche de tourner dans le vide lors des rotations d'axes rapides.
* **Cote CAO recommandée (Fraisage CNC)** : **$1.122\text{ in}$ à $1.124\text{ in}$** (soit $28.50\text{ mm}$ à $28.55\text{ mm}$).
* **Méthode d'assemblage** : Le roulement doit être inséré en force à l'aide d'un maillet en caoutchouc souple ou d'une presse hydraulique manuelle d'établi (Arbor Press).

### Ajustement Glissant (Slip-Fit - Type H7/g6)
Le roulement pénètre et sort de son logement avec une très légère friction à la main. C'est l'ajustement idéal pour les modules démontables rapidement dans les stands pendant les matches de qualification stressants.
* **Cote CAO recommandée (Fraisage CNC)** : **$1.126\text{ in}$ à $1.128\text{ in}$** (soit $28.60\text{ mm}$ à $28.65\text{ mm}$).
* **Sécurisation** : Puisque le roulement peut glisser librement, il doit être retenu axialement par une plaque de retenue ou la collerette intégrée du roulement appuyée contre la structure métallique.

---

## ⚙️ 2. Évolution des Axes FRC : Hexagonal $1/2\text{"}$ vs Profils Cannelés Spline

Transmettre le couple de rotation depuis un moteur vers une roue ou un bras pivotant exige une liaison d'arbre robuste.

```
       PROFIL HEXAGONAL 1/2"               PROFIL CANNELÉ SPLINE
     - Standard FRC économique           - Standard Haute Performance
     - Jeu angulaire à l'usure           - Contact réparti à 100%
     
             /\                                    / \
            /  \                               *--*   *--*
           |    |                             |           |
           |    |                             *--*   *--*
            \  /                               \   /
             \/                                 *--*
```

### L'axe Hexagonal de $1/2\text{"}$ (Standard Historique)
Le standard FRC absolu est l'axe hexagonal de **$0.500\text{ pouce}$** de plat à plat ($12.70\text{ mm}$). La forme hexagonale élimine le besoin d'ajouter des clavettes (keys) qui fragilisent les arbres et se perdent facilement.
* **Jeu d'ajustement CAO** : Les arbres hexagonaux achetés chez les fournisseurs (WCP, Andymark) sont pré-calibrés négativement (environ $-0.002\text{ in}$) pour s'insérer naturellement dans les roulements hex. 
* **Usinage interne** : Si vous devez découper vous-même un alésage hex femelle dans un pignon à l'aide d'une CNC ou d'un jet d'eau, dessinez le trou à **$0.503\text{ in}$ à $0.505\text{ in}$** de plat à plat pour conserver un ajustement glissant fonctionnel.

### Les Profils Cannelés (Splines - Falcon Spline, Kraken Spline, MAXSpline)
Pour éliminer le jeu angulaire (backlash) inhérent aux formes hexagonales et maximiser la surface d'engrènement sous fort couple, les concepteurs utilisent des profils cannelés (Spline) :
* **Kraken/Falcon Spline** : Profil cannelé circulaire à haute densité de dents. Il est impossible de tordre cet axe sous le couple d'un moteur de propulsion Swerve.
* **MAXSpline (Rev Robotics)** : Un grand tube cannelé externe en aluminium de $25\text{ mm}$. C'est l'arbre roi pour les bras articulés lourds : son grand diamètre offre un moment polaire de résistance à la torsion extraordinaire tout en permettant de faire passer des fils électriques ou des axes concentriques à l'intérieur du tube vide.

---

## 🔗 3. Arrêt Axial & Retenue : Le Piège Chimique du Polycarbonate

Conserver les pièces centrées et les empêcher de glisser le long d'un axe rotatif est vital. Voici les méthodes industrielles sûres :

### 1. Circlips (Snap Rings)
* Méthode la plus légère et professionnelle. Elle consiste à usiner une gorge annulaire sur l'axe hex à l'aide d'un tour mécanique.
* **Cote CAO de gorge** : Pour un axe de $1/2\text{"}$ hex, la gorge doit avoir un diamètre de **$0.461\text{ in}$** ($11.71\text{ mm}$) et une épaisseur de **$0.043\text{ in}$** ($1.09\text{ mm}$) pour accueillir un anneau élastique externe standard de $1/2\text{"}$.

### 2. Entretoises Imprimées 3D (PETG / TPU)
* Au lieu d'utiliser des bagues d'arrêt métalliques à vis (Shaft Collars) qui pèsent lourd et ont la fâcheuse habitude de se desserrer sous l'effet des vibrations répétées en match :
* Mesurez l'espace vide exact entre vos pignons sur Onshape, modélisez une entretoise cylindrique creuse et imprimez-la en 3D à l'atelier en quelques minutes.

:::danger CAUTION : La destruction chimique du Polycarbonate par le frein filet !
C'est l'une des erreurs les plus fréquentes et dévastatrices commises par les équipes débutantes. 
* Le frein filet liquide standard (comme le **Loctite 242 bleu** ou le **Loctite 262 rouge**) est composé de polymères anaérobies contenant des solvants organiques agressifs.
* Si vous appliquez du Loctite sur une vis à proximité d'une plaque de protection ou d'un engrenage en **Polycarbonate (Lexan)**, le produit va migrer par capillarité.
* Au contact du Loctite, le Polycarbonate subit une réaction chimique violente de **fissuration sous contrainte environnementale (Environmental Stress Cracking)**. En moins de 24 heures, le plastique perd toute sa résistance mécanique et éclate littéralement en miettes au moindre impact de match !
* **Règle absolue** : N'utilisez JAMAIS de frein filet Loctite à proximité de pièces en polycarbonate. Pour sécuriser les vis dans du polycarbonate, utilisez des écrous autofreinés en nylon (**Nyloc Nuts**) ou des colles cyanoacrylates spéciales sans solvant.
:::

---

## 📐 4. Tolérances selon la Technologie de Fabrication

Concevoir une pièce exige d'anticiper la machine-outil qui va la découper. Voici les tolérances réelles à anticiper dans vos modèles Onshape :

| Technologie de fabrication | Précision typique | Matériau FRC courant | Conséquence sur le modèle CAO (Onshape) |
| :--- | :--- | :--- | :--- |
| **Fraisage CNC Router** | $\pm 0.05\text{ mm}$ | Aluminium (6061 / 7075) | Très précis. Les perçages de roulements peuvent être dessinés à $1.124\text{ in}$ pour un press-fit parfait. |
| **Découpe Jet d'Eau** | $\pm 0.15\text{ mm}$ | Acier, Épaisses plaques d'Alu | Présence d'une conicité naturelle (le jet d'eau s'élargit en profondeur). Ajoutez un jeu de $+0.05\text{ mm}$ sur tous les diamètres de perçage. |
| **Découpe Laser CO2/Fibre**| $\pm 0.10\text{ mm}$ | Polycarbonate, Acrylique | Le faisceau brûle une petite zone de matière (trait de coupe ou *Kerf*). Ajoutez un jeu de $+0.08\text{ mm}$ sur les fentes et emboîtements. |
| **Impression 3D FDM** | $\pm 0.20\text{ mm}$ | PLA, PETG, Nylon-CF | Les filaments plastiques se dilatent légèrement à l'extrusion thermique. Dessinez les alésages d'axes de $1/2\text{"}$ hex à **$0.510\text{ in}$** pour éviter de devoir limer le plastique après impression. |

---

## 🏛️ 5. Notions Simplifiées de GD&T (Tolérancement Géométrique)

En ingénierie avancée, tolérer le diamètre d'un trou ne suffit pas. Nous devons contrôler la forme géométrique globale en appliquant les principes de GD&T (Geometric Dimensioning and Tolerancing) :

### Coaxialité (Concentricity)
* *Définition* : L'alignement parfait des centres de deux arbres ou perçages cylindriques partageant le même axe théorique.
* *Application FRC* : Indispensable dans la fabrication de flasques de boîtes de vitesses. Si le trou de roulement d'entrée et le trou du roulement de sortie ne sont pas strictement coaxiaux, l'arbre fléchit à chaque rotation, provoquant un échauffement thermique du moteur et la destruction rapide des engrenages.

### Parallélisme (Parallelism)
* *Définition* : L'assurance que deux plans ou lignes de référence restent équidistants sur toute leur longueur.
* *Application FRC* : Crucial dans la conception de coulisses d'ascenseur télescopique (Elevator). Si les deux rails de guidage en profilé aluminium ne sont pas rigoureusement parallèles au millimètre près, l'ascenseur se coince (binding) lors de sa montée.

### Planéité (Flatness)
* *Définition* : La planéité d'une face plane solide par rapport à un plan de référence parfait.
* *Application FRC* : Lors du soudage d'un châssis ou de l'assemblage de tôles pliées en aluminium. Une mauvaise planéité d'une plaque de support moteur tord l'engrènement et augmente l'intensité électrique consommée par le moteur.

---

## 📚 Supports Supplémentaires

* 💻 **Onshape Learning Materials - GD&T Intro :** [Introduction to GD&T](https://learn.onshape.com/)
* 📖 **FRC Materials Guide - Chief Delphi community discussion :** [Loctite and Polycarbonate Warning Threads](https://www.chiefdelphi.com/)
* 🛠️ **Machinery's Handbook (L'encyclopédie mondiale de l'usinage) :** [Fits and Tolerances standard reference](https://www.industrialpress.com/)
