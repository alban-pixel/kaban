# M2.3 - Réductions Lourdes & Boîtes de Vitesses (Planétaires & Cycloïdales)

Lorsqu'on conçoit des sous-systèmes FRC soumis à des couples extrêmes — comme un bras pivotant de $15\text{ kg}$, un élévateur lourd ou un treuil de suspension (Climber) — les moteurs classiques même très puissants (Kraken X60, Falcon 500, NEO) ne peuvent pas être connectés directement. Leurs vitesses à vide dépassent $6000\text{ RPM}$, tandis que leur couple de blocage direct n'est que de quelques Newton-mètres ($3.6\text{ Nm}$ à $4.2\text{ Nm}$ sous $40\text{ A}$).

Pour soulever des charges massives de manière contrôlée, nous devons échanger de la vitesse de rotation contre du couple en concevant des **systèmes de réductions mécaniques lourds**.

---

## ⚙️ 1. Théorie du Couple et des Réductions Composées (Compound Reductions)

Pour démultiplier la vitesse et multiplier le couple d'un moteur, nous utilisons des trains d'engrenages. Le rapport de réduction total $R_t$ d'un système est défini par le rapport des vitesses d'entrée $\omega_e$ et de sortie $\omega_s$ :

$$
R_t = \frac{\omega_e}{\omega_s}
$$

### Multiplication du Couple et Rendement Physique
Le couple théorique en sortie $T_s$ est égal au couple d'entrée $T_e$ multiplié par $R_t$. Cependant, en physique réelle, chaque engrenage génère des frictions. Nous devons introduire le **rendement mécanique** ($\eta$) :

$$
T_s = T_e \times R_t \times \eta^N
$$

Où :
* $T_s$ est le couple de sortie réel ($\text{Nm}$)
* $T_e$ est le couple d'entrée ($\text{Nm}$)
* $R_t$ est le rapport de réduction
* $\eta$ est le rendement d'une seule étape d'engrenage (généralement $\eta \approx 0.97$ à $0.98$ pour des pignons droits bien lubrifiés, soit $2\%$ à $3\%$ de perte par étape)
* $N$ est le nombre total d'étapes d'engrenages successives (le nombre de paires d'engrènement)

:::warning Pertes énergétiques cumulées
Si vous concevez un réducteur à engrenages droits à 4 étages pour obtenir un très grand rapport de réduction, le rendement global chute :

$$
\eta_{\text{global}} = (0.97)^4 \approx 0.885 \quad (11.5\% \text{ de pertes sous forme de chaleur !})
$$

Il est donc crucial de limiter le nombre d'étages en maximisant le rapport de chaque étage individuel, ou d'utiliser des types de réducteurs plus denses comme les réducteurs planétaires ou cycloïdaux.
:::

---

## 🪐 2. Physique des Réducteurs Épicycloïdaux (Planétaires)

Les boîtes de vitesses planétaires (ex. *VersaPlanetary* de VEX, *UltraPlanetary* de REV, ou les étages d'entrée *Sport* de chez Andymark) sont les réducteurs compacts les plus courants en FRC. Ils permettent d'obtenir des réductions massives dans un espace cylindrique extrêmement réduit.

```
       +-----------------------------------+
       |            RING GEAR              |
       |        (Couronne Externe)         |
       |                                   |
       |       /---\       /---\           |
       |      |Planet|     |Planet|          |
       |       \---/ \   / \---/           |
       |              \ /                  |
       |             /---\                 |
       |            | Sun |                |
       |             \---/                 |
       |              / \                  |
       |       /---/ /   \ /---\           |
       |      |Planet|     |Planet|          |
       |       \---/       \---/           |
       |                                   |
       |           CARRIER PLATE           |
       |        (Porte-Satellites)         |
       +-----------------------------------+
```

### Anatomie d'un Train Épicycloïdal
Un étage planétaire est composé de trois éléments distincts :
1. **Le Planétaire (Sun Gear)** : Le pignon central connecté directement à l'arbre moteur.
2. **Les Satellites (Planet Gears)** : 3 ou 4 petits pignons qui orbitent autour du planétaire central.
3. **La Couronne (Ring Gear)** : La denture interne périphérique fixe qui enveloppe le mécanisme.
4. **Le Porte-Satellites (Carrier Plate)** : La plaque rigide qui relie les axes des satellites et transmet le mouvement de rotation de sortie.

### Calcul du Rapport de Réduction Planétaire
En FRC, la couronne externe (Ring) est fixe, le pignon central (Sun) est menant (entrée), et le porte-satellites (Carrier) est mené (sortie). Le rapport de réduction $R_p$ de cet étage se calcule mathématiquement par la formule suivante :

$$
R_p = \frac{N_{\text{ring}}}{N_{\text{sun}}} + 1
$$

Où :
* $N_{\text{ring}}$ est le nombre de dents de la couronne périphérique fixe.
* $N_{\text{sun}}$ est le nombre de dents du pignon soleil d'entrée.

:::info Exemple d'application
Si un étage planétaire possède une couronne de $60\text{ dents}$ et un pignon soleil de $15\text{ dents}$, le rapport de réduction est :

$$
R_p = \frac{60}{15} + 1 = 4 + 1 = 5
$$

Le rapport est de $5:1$ (et non $4:1$ comme on pourrait le penser intuitivement en divisant les diamètres primitifs). L'ajout du $+1$ provient du fait que le porte-satellites orbite dans le même sens que le pignon central d'entrée, ce qui réduit la vitesse relative perçue.
:::

### Avantages & Limites des Planétaires en FRC
* **Avantages** : Alignement coaxial parfait (l'arbre d'entrée et de sortie sont sur le même axe), aucun effort radial sur les arbres moteurs, empilement modulaire (ex: un étage $5:1$ vissé sur un étage $4:1$ donne immédiatement une réduction totale de $20:1$).
* **Limites** : Sensibilité aux surcharges de couple sur les derniers étages. L'arbre hexagonal de sortie de $1/2\text{"}$ ou la petite plaque du porte-satellites peut se cisailler ou se tordre si le couple final dépasse $80\text{ Nm}$.

---

## 🌀 3. Les Réducteurs Cycloïdaux Imprimés 3D (Custom Cycloidal Drives)

Pour les articulations à très forte contrainte (par exemple, le pivot principal d'un bras d'Intake ou un grimpeur télescopique), les équipes de niveau élite FRC fabriquent de plus en plus leurs propres **réducteurs cycloïdaux**. Ces réducteurs offrent des rapports massifs (jusqu'à $50:1$ sur un seul étage) avec un jeu mécanique (backlash) quasi nul et une résistance physique exceptionnelle.

```
       +------------------------------------+
       |          BAGUE DE CHEVILLES        |
       |             (Ring Pins)            |
       |                                    |
       |              *  *  *               |
       |           *           *            |
       |         *    /\___/\    *          |
       |        *    /       \    *         |
       |        *   |  ( O )  |   *         |
       |        *    \       /    *         |
       |         *    \_____/    *          |
       |           *           *            |
       |              *  *  *               |
       |                                    |
       |           DISQUE CYCLOÏDE          |
       |           (Cycloidal Disc)         |
       +------------------------------------+
```

### Principe de Fonctionnement
Un réducteur cycloïdal ne possède pas d'engrenages droits classiques. Il repose sur un mouvement excentrique alternatif :
1. **L'arbre d'entrée** comporte un maneton ou roulement excentré (came excentrique) décalé de la ligne médiane de quelques millimètres.
2. Ce mouvement excentrique pousse un **Disque Cycloïdal** (comportant $N$ lobes arrondis) contre une bague circulaire fixe composée de **$P$ chevilles ou rouleaux (Pins)**.
3. À chaque tour complet de l'arbre d'entrée excentrique, le disque cycloïdal progresse d'une fraction de tour dans le sens inverse.
4. Des rouleaux de sortie traversent des trous surdimensionnés dans le disque pour récupérer la rotation pure du disque sans le balancement excentrique.

### Formule Mathématique du Rapport Cycloïdal
Le rapport de démultiplication théorique $R_c$ d'un étage cycloïdal est défini par :

$$
R_c = \frac{N}{P - N}
$$

Dans la conception standard, le nombre de chevilles de la bague fixe ($P$) est supérieur d'exactement $1$ au nombre de lobes du disque cycloïdal ($N$), c'est-à-dire $P = N + 1$. Le rapport de réduction devient alors :

$$
R_c = \frac{N}{(N + 1) - N} = N
$$

Le rapport est donc d'exactement $N:1$, où $N$ est le nombre de lobes du disque cycloïdal.

:::important Élimination du jeu (Backlash) et Réversibilité
* **Jeu quasi-nul** : Contrairement aux engrenages droits ou planétaires qui nécessitent un espace libre minimal (backlash) entre les dents pour éviter le blocage, les lobes d'un disque cycloïdal sont constamment en contact physique progressif avec plusieurs chevilles simultanément. Il n'y a aucun jeu angulaire à la sortie.
* **Non-réversibilité naturelle** : À des rapports élevés ($>40:1$), le réducteur cycloïdal devient extrêmement difficile à faire tourner à l'envers depuis la sortie. C'est un atout majeur en FRC : si le robot s'éteint en fin de match alors qu'il est suspendu en l'air, le réducteur cycloïdal bloque mécaniquement la descente sans consommer d'électricité ni nécessiter de frein pneumatique complexe !
:::

### Le Secret Mécanique : Le Disque Cycloïdal Équilibré (Dual-Disc Design)
Parce que le disque cycloïdal est déplacé de manière excentrique par rapport à l'arbre d'entrée central, un réducteur à un seul disque génère des vibrations centrifuges phénoménales à haute vitesse (lorsque le moteur d'entrée tourne à $6000\text{ RPM}$).

Pour éliminer ce fléau dynamique, les ingénieurs utilisent un système à **double disque équilibré (Dual-Disc Design)** :
* Deux disques cycloïdaux identiques sont placés côte à côte sur l'arbre d'entrée.
* Les deux cames excentriques de l'arbre d'entrée sont usinées avec un déphasage angulaire d'exactement **$180^\circ$**.
* Ainsi, les forces d'inertie centrifuges radiales des deux disques s'annulent mutuellement à chaque instant géométrique. La rotation est parfaitement fluide, sans vibration et l'usure des roulements est minimisée.

---

## 📊 4. Planétaires vs Cycloïdaux : Guide de Sélection en FRC

Pour vous guider dans vos choix de CAO lors de la phase conceptuelle, voici le tableau comparatif d'ingénierie appliquée :

| Critère d'évaluation | Réducteur Planétaire (ex. Versa) | Réducteur Cycloïdal (Imprimé 3D / CNC) | Train d'Engrenages Droits (Spur Gearbox) |
| :--- | :--- | :--- | :--- |
| **Rapport de réduction optimal** | Moyen ($3:1$ à $100:1$ par empilement) | Ultra-élevé ($30:1$ à $100:1$ sur 1 seul étage) | Faible à Moyen ($2:1$ à $20:1$) |
| **Compacité volumique** | Excellente (Diamètre réduit, forme axiale) | Moyenne (Forme aplatie mais grand diamètre radial) | Faible (Prend beaucoup de place en largeur) |
| **Jeu angulaire (Backlash)** | Moyen ($\approx 1^\circ$ à $2^\circ$, s'additionne par étage) | Quasi-nul ($\approx 0.05^\circ$) | Faible ($\approx 0.5^\circ$) |
| **Résistance mécanique brute** | Moyenne (Limitation thermique et cisaillement hex) | Exceptionnelle (Force répartie sur plusieurs lobes) | Très élevée (Si pignons larges de $3/8\text{"}$ ou $1/2\text{"}$) |
| **Coût de fabrication** | Élevé (Achat de modules commerciaux usinés) | Très faible (Imprimé à l'atelier + visserie standard) | Moyen (Achat de pignons individuels + plaques CNC) |
| **Complexité de conception CAO**| Ultra-simple (Modèle CAO fournisseur à importer) | Élevée (Calcul géométrique précis de la courbe cycloïde)| Moyenne (Entraxes précis et calcul d'engrènement) |
| **Cas d'usage FRC typique** | Rotation d'Intake léger, convoyeur, galets | Pivot de bras principal, articulation d'épaule, Climber | Châssis de propulsion (Drivetrain), Shooter à haute vitesse |

---

## 🧮 5. Dimensionnement & Calculs de Contraintes pour les Arbres de Sortie

Le point faible récurrent de toute boîte de vitesses lourdement démultipliée en FRC est la **torsion de l'arbre de sortie**. Si un bras mécanique applique un couple de $150\text{ Nm}$ sur un arbre hexagonal en aluminium de $1/2\text{"}$, cet arbre va subir une contrainte de cisaillement qui peut dépasser la limite d'élasticité du matériau.

### Calcul de la Contrainte de Torsional Shear
Pour un arbre cylindrique plein de rayon $r$ soumis à un couple $T$, la contrainte de cisaillement maximale $\tau_{\max}$ est donnée par la formule de torsion :

$$
\tau_{\max} = \frac{T \times r}{J}
$$

Où :
* $T$ est le couple appliqué ($\text{Nm}$)
* $r$ est le rayon externe de l'axe ($\text{m}$)
* $J$ est le moment d'inertie polaire de la section transversale ($\text{m}^4$). Pour un arbre cylindrique parfait de diamètre $d$ :

$$
J = \frac{\pi \times d^4}{32}
$$

Pour un axe hexagonal de $1/2\text{"}$ ($12.70\text{ mm}$ de plat à plat), la géométrie hexagonale concentre localement les contraintes au niveau des angles vifs. On utilise un facteur de correction de forme, mais la contrainte reste proportionnelle à l'inverse du cube du diamètre ($d^3$).

:::important Règle empirique de sécurité FRC (Yield Strength limits)
* **Aluminium 7075-T6** (Axe hex standard de qualité) : Limite d'élasticité au cisaillement $\tau_y \approx 220\text{ MPa}$. Ne dépassez jamais un couple fonctionnel de **$85\text{ Nm}$** sur un arbre de $1/2\text{"}$ hex sous peine de torsion plastique permanente !
* **Acier 4140 Chromoly** (Axe hex en acier trempé) : Limite d'élasticité $\tau_y \approx 450\text{ MPa}$. Permet de supporter des couples allant jusqu'à **$180\text{ Nm}$** sur le même diamètre de $1/2\text{"}$ hex.
* **Arbre cannelé MAXSpline ou 3/4" Hex** : En passant à un diamètre d'arbre de $3/4\text{"}$ ($19.05\text{ mm}$) ou au profil cannelé de REV Robotics (MAXSpline), le moment polaire $J$ augmente de façon exponentielle ($d^4$). Vous pouvez supporter plus de **$350\text{ Nm}$** en toute sécurité !
:::

---

## 🔨 6. Recommandations de Fabrication pour Boîtes Imprimées 3D

Si vous concevez une boîte de vitesses ou un réducteur cycloïdal avec des flasques imprimés en 3D à l'atelier :
1. **Épaisseur des parois** : Ne concevez jamais de parois inférieures à $8\text{ mm}$ pour des structures porteuses de roulements.
2. **Pourcentage de remplissage (Infill)** : Utilisez un remplissage à **$100\%$** avec un motif rectiligne ou gyroscopique (Gyroid). Le remplissage à $100\%$ élimine les micro-vides et évite que les bagues extérieures des roulements ne s'écrasent dans le plastique sous forte charge radiale.
3. **Nombre de périmètres (Shells)** : Configurez au moins **6 à 8 périmètres extérieurs** dans votre logiciel de tranchage (Slicer). C'est le nombre de périmètres horizontaux et verticaux qui donne sa rigidité structurelle à la pièce imprimée, pas seulement l'infill.
4. **Matériau adapté** :
   * **PLA** : Trop fragile, éclate sous les impacts de match. À proscrire pour les boîtes lourdes.
   * **PETG** : Bon compromis, résistant chimiquement à la graisse d'engrenages, mais flexible sous charge continue.
   * **Nylon chargé en fibre de carbone (PA-CF / NylonX)** : Le matériau roi pour la FRC. Rigidité proche de l'aluminium, coefficient de friction ultra-faible pour les engrenages internes et excellente résistance thermique face à l'échauffement des moteurs.

---

## 📚 Supports Supplémentaires

* 💻 **VEX Technical Information - Gearboxes :** [VEX Mechanical Applications Guide](https://www.vexrobotics.com/pro)
* 📖 **JVN Mechanical Design Calculator (FRC Spreadsheet standard) :** [JVN Design Tool](https://chiefdelphi.com/t/jvn-calculator-features/161405)
* 🎬 **Cycloidal Drive Design in CAD Video Tutorial :** [Designing Custom Cycloidal Drives on Youtube](https://www.youtube.com/results?search_query=cycloidal+drive+cad+design)
