# M1.3 - Conception Mécanique de Mécanismes FRC

Passer du concept 3D à un mécanisme fiable sur le terrain demande l'application de principes de physique éprouvés. Nous allons étudier la conception des trois mécanismes les plus fréquents en FRC : les Ramasseurs (Intakes), les Lanceurs (Shooters), et les Systèmes Linéaires (Elevators).

---

## 🌪️ 1. Les Ramasseurs (Intakes)

L'Intake est la première ligne de contact avec l'élément de jeu. Un mauvais Intake limite l'efficacité globale de tout le robot.

### Règle d'or : "Touch it, Own it"
L'Intake doit agripper la pièce de jeu dès le premier contact physique et l'avaler immédiatement. Si la pièce rebondit ou s'échappe, la conception est défaillante.

### Paramètres de Conception
* **Vitesse de surface (Surface Speed)** : La vitesse tangentielle des rouleaux de l'Intake doit être **1,5 à 2 fois supérieure** à la vitesse de déplacement maximale du robot au sol. Cela garantit que le robot peut avaler un objet tout en fonçant vers lui sans ralentir.
* **Choix des Rouleaux (Rollers)** : Utilisez des tubes en polycarbonate (PC) recouverts de caoutchouc adhérent, de bandes en silicone souple ou de roulettes souples (ex. roues de compression *REV* ou *Andymark* de dureté 35A à 50A).
* **Flottaison Mécanique (Intake pivotant)** : Un bon Intake est monté sur bras pivotant activé par vérin pneumatique ou moteur à friction glissante, permettant de s'ajuster aux irrégularités du terrain ou de s'escamoter à l'intérieur du périmètre du robot pour éviter la casse lors des collisions.

---

## 🎯 2. Les Lanceurs (Shooters)

Les Shooters propulsent les pièces de jeu à haute vitesse dans des cibles parfois distantes de plusieurs mètres.

### La Compression de la Pièce de Jeu (Compression)
Pour transférer efficacement l'énergie cinétique des volants d'inertie (flywheels) à la pièce de jeu (souvent en mousse compressible), celle-ci doit être pincée lors du passage.
* **Compression type** : Généralement comprise entre **$0.5\text{ pouce}$** et **$1.5\text{ pouce}$** de déformation par rapport au diamètre nominal de la pièce. Une compression insuffisante provoque le glissement du volant (slippage) et un tir trop court ; une compression excessive risque de bloquer le moteur (jam) ou d'endommager la pièce.

### Le Rôle de l'Inertie
Lorsqu'un projectile passe dans le Shooter, il ralentit instantanément les volants d'inertie.
* **Solution** : Ajouter des disques d'acier ou de laiton (flywheel weights) de part et d'autre des roues de tir pour stocker de l'énergie cinétique. Cela diminue la perte de vitesse (voltage sag) lors du tir et permet d'enchaîner les projectiles à haute cadence avec une précision constante.

---

## 🚀 3. Les Systèmes Linéaires (Elevators)

Les ascenseurs verticaux permettent d'atteindre des hauteurs importantes pour marquer des points ou suspendre le robot en fin de match.

```
Cascade Rigging (Poulies indépendantes à chaque étage)
  [Moteur] -> Entraîne le premier étage -> Entraîne le second en cascade.
  Avantage : Vitesse très élevée, tension uniforme du câble.

Continu Rigging (Câble unique serpentant tous les étages)
  Avantage : Plus simple à concevoir mécaniquement, effort moteur constant.
```

### Protection contre le Basculement
* Utilisez des rails en aluminium extrudé de type 80/20 ou des tubes rigides coulissants sur des patins en PEHD (Polyéthylène Haute Densité) ou des roulements à billes ajustés pour éliminer tout jeu angulaire (slop) sous forte charge.

---

## ⚙️ Courroies Synchrones (Timing Belts) vs Chaînes

Pour distribuer la puissance des moteurs vers les axes :

### 1. Les Courroies Synchrones (HTD 5mm Pitch)
C'est le standard de l'industrie FRC pour l'entraînement à haut rendement et faible entretien.
* **Avantages** : Extrêmement légères, aucun graissage requis, très silencieuses.
* **Calcul d'entraxe (Center-to-Center)** : L'entraxe mécanique entre deux poulies doit être calculé au millième de millimètre près à l'aide de formules géométriques d'esquisse CAO pour éviter tout glissement (saut de dent) sans avoir à ajouter de tendeurs lourds.

### 2. Les Chaînes à Rouleaux (#25 ou #35)
* **Avantages** : Tolérance élevée aux erreurs d'alignement ou d'entraxe, possibilité de raccourcir la chaîne facilement à l'aide d'un dérive-chaîne.
* **Usage** : Idéal pour les transmissions à couple très lourd (bras pivotants, grimpeurs).

---

## 📚 Supports Supplémentaires

* 🖥️ **Slides de Présentation :** [Slides M1.3 - Conception de Mécanismes](https://docs.google.com/presentation/d/e/2PACX-1vRaIkRvKioVmcl1P6vpddYPYC43QjaxsRZu6qavmp3lNpBcQ0noBf91Pv4N8DwSDgcxdfG2IoPqTNs7/pub?start=false&loop=false&delayms=3000)
* 📖 **The Unofficial FRC Mechanism Encyclopedia :** [Project Bucephalus](https://www.projectb.net.au/resources/robot-mechanisms/#GPE)
