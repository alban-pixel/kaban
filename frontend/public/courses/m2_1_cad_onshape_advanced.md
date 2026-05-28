# M2.1 - Conception Paramétrique Descendante (Top-Down Design) avec Onshape

Dans les projets d'ingénierie complexes comme un robot FRC de compétition, la conception traditionnelle ascendante (Bottom-Up) — où l'on dessine chaque pièce isolément avant de tenter de les assembler — montre très vite ses limites de robustesse. Si vous modifiez la largeur du châssis mécanique de quelques pouces en fin de saison pour des raisons de maniabilité, vous devez corriger manuellement des dizaines de plaques, d'axes transversaux et de profilés individuels. C'est une source d'erreurs d'inattention fatales en match.

Pour éviter cela, les équipes FRC professionnelles appliquent la **Conception Paramétrique Descendante (Top-Down Design / Skeleton Modeling)**.

---

## 📐 1. Le Paradigme de l'Esquisse Maîtresse (Master Sketch)

La technique de l'**Esquisse Maîtresse (Master Sketch ou Skeleton Model)** consiste à centraliser l'ADN dimensionnel complet du robot dans un fichier unique, servant de "squelette géométrique 2D".

```
+-------------------------------------------------------------+
|                        MASTER SKETCH                        |
|  - Largeur/Longueur hors-tout du châssis (Frame Perimeter)  |
|  - Axe de rotation principal du bras pivotant               |
|  - Hauteurs limites de départ de match (hauteur max WPILib) |
+-------------------------------------------------------------+
                               |
       +-----------------------+-----------------------+
       | (Derive)              | (Derive)              |
       v                       v                       v
[Part Studio : Swerve]  [Part Studio : Intake]  [Part Studio : Shooter]
```

### Principes Algorithmiques d'une Esquisse Maîtresse
1. **Unicité de la Source de Vérité (SSOT)** : Toutes les cotes maîtresses critiques du robot (ex. : limites géométriques imposées par le règlement, entraxes moteurs principaux, hauteurs de tir cibles) sont modélisées dans un Part Studio dédié nommé `00_MASTER_SKETCH` placé en tête du projet.
2. **Aucune extrusion 3D** : Ce fichier ne contient que des esquisses 2D extrêmement propres, documentées et contraintes géométriquement.
3. **Propagation par Dérivation (Derive Tool)** : Dans le Part Studio individuel de chaque sous-système (ex. : l'Intake), le premier outil utilisé est **Derive**. On importe le squelette géométrique depuis le fichier `00_MASTER_SKETCH`.

### Guide Pas-à-Pas de Mise en Œuvre
1. Créez un Part Studio `00_MASTER_SKETCH`.
2. Sur le plan de dessus (`Top Plan`), tracez le périmètre du châssis (Frame Perimeter) avec ses cotes de largeur (`#width`) et de longueur (`#length`).
3. Sur le plan de face (`Front Plan`), dessinez la cinématique du robot : l'arc de cercle de rotation d'un bras pivotant, sa position d'extension maximale, et la zone d'impact des pièces de jeu.
4. Dans le Part Studio `02_INTAKE`, cliquez sur l'icône **Derive**, sélectionnez `00_MASTER_SKETCH` et cochez l'esquisse cinématique.
5. Utilisez ces lignes dérivées transparentes pour dessiner les flancs en polycarbonate de votre Intake.

:::tip La magie de la mise à jour dynamique
Si la direction technique décide de rétrécir le robot pour passer plus facilement entre les obstacles du terrain, modifiez une seule cote numérique dans `00_MASTER_SKETCH`. En quelques secondes de calcul en tâche de fond, Onshape met à jour automatiquement la structure du châssis, l'Intake, les fixations et les longueurs d'axes dans tous les fichiers liés, sans casser vos assemblages !
:::

---

## 🗃️ 2. Concevoir dans un Seul Espace : Multi-Part Part Studios

Contrairement aux logiciels de CAO historiques (comme SolidWorks classique) qui forcent une architecture "un fichier = une pièce", le noyau géométrique d'Onshape repose sur les **Multi-Part Part Studios**.

### Le Concept
Un Part Studio est un atelier de conception dans lequel vous pouvez modéliser **plusieurs corps solides distincts simultanément** à partir d'une série d'esquisses imbriquées.

```
       +------------------------------------+
       |       PART STUDIO : GEARBOX        |
       |                                    |
       |  [Esquisse commune des entraxes]   |
       |                                    |
       |      +------------------------+    |
       |      | Plaque Flasque Gauche  |    |
       |      +------------------------+    |
       |                  | (coaxialité)    |
       |      +------------------------+    |
       |      | Plaque Flasque Droite  |    |
       |      +------------------------+    |
       |                  |                 |
       |      [ Axes hex & Entretoises ]    |
       +------------------------------------+
```

### Cas Pratique : Boîte de Vitesses Double Flasque
Au lieu de concevoir la plaque de flanc A et la plaque de flanc B dans deux fichiers séparés :
1. Dessinez une esquisse centrale contenant l'emplacement de tous les axes, roulements et moteurs.
2. Extrudez la **plaque de flanc A** (Solid 1).
3. Sur un plan décalé en profondeur (Offset Plane), extrudez la **plaque de flanc B** (Solid 2) en réutilisant exactement les mêmes cercles d'esquisse.
4. Extrudez les **axes** et les **entretoises** entre les deux plaques en s'appuyant directement sur leurs faces internes respectives.

### Avantages Industriels Majeurs
* **Coaxialité garantie à $100\%$** : Puisque les trous de roulements des deux plaques proviennent de la même esquisse parente unique, il est mathématiquement impossible d'avoir un désalignement d'axes (qui détruirait le rendement de vos engrenages).
* **Vitesse de modélisation** : Les modifications d'entraxes ou de positions moteurs se font en un seul endroit et se répercutent instantanément sur tous les corps solides co-dépendants.

---

## 🔌 3. Mate Connectors : La Révolution des Assemblages Stables

Dans les logiciels de CAO traditionnels, l'assemblage de pièces s'effectue en superposant des contraintes géométriques élémentaires : coïncidence de face, concentricité de perçage, parallélisme. Cette méthode génère un grand nombre de contraintes imbriquées très instables. Si vous modifiez un congé (fillet) sur une pièce en amont, les contraintes d'assemblage se cassent, provoquant des triangles d'erreur rouges en cascade.

Onshape résout ce problème structurel grâce aux **Mate Connectors**.

### Qu'est-ce qu'un Mate Connector ?
Un **Mate Connector** est un système de coordonnées cartésiennes tridimensionnel local (contenant un point d'origine $O$ et trois axes orthogonaux $X, Y, Z$) qui est attaché de manière rigide à une entité géométrique (face, arête, sommet, centre de perçage).

```
          Z (Bleu)
          ^
          |   / Y (Vert)
          |  /
          | /
          +-------> X (Rouge)
        (Origine)
```

### Comment l'utiliser pour un assemblage indestructible ?
* Pour assembler deux pièces (par exemple, un moteur Swerve sur le châssis), vous n'avez besoin que d'**une seule contrainte** : un **Fastened Mate** qui aligne le Mate Connector A (situé sous la collerette du moteur) avec le Mate Connector B (situé au centre du perçage de la plaque de châssis).
* **Résistance aux modifications** : Si vous changez la forme extérieure du moteur ou si vous ajoutez des trous de ventilation, la contrainte reste parfaitement valide et stable car le Mate Connector est intrinsèquement lié au repère géométrique local d'origine, et non aux faces périphériques.
* **Mate Connectors explicites** : Au lieu de laisser le logiciel calculer un Mate Connector implicite lors de l'assemblage, créez des Mate Connectors explicites directement au sein de vos Part Studios. Par exemple, marquez le centre géométrique exact d'un sous-assemblage cinématique complexe. L'importation et le positionnement dans l'assemblage final se feront en un seul clic !

---

## ⚡ 4. L'utilisation des FeatureScripts Professionnels FRC

L'un des plus grands super-pouvoirs d'Onshape est sa communauté Open Source de développeurs qui conçoivent des **FeatureScripts**. Un FeatureScript est une macro de programmation écrite en langage d'Onshape permettant d'ajouter des outils de modélisation automatisés sur mesure.

Pour concevoir à la vitesse de l'éclair, l'équipe STAN ROBOTIX utilise quotidiennement les FeatureScripts FRC standardisés :

### 1. **Tube Converter (par Julia's FRC Tools)**
* *Problème* : Dessiner un tube en aluminium de $2\text{"} \times 1\text{"}$ avec un motif de perçages de $1/2\text{"}$ espacés de $1\text{"}$ pour alléger la structure prend plusieurs heures et d'innombrables esquisses répétitives.
* *Solution FeatureScript* : Sélectionnez une simple ligne d'esquisse 3D, définissez l'épaisseur du tube, et le script génère instantanément le tube complet en aluminium avec tous les perçages réguliers à tolérance nominale et les congés d'angle usine en un seul clic.

### 2. **FRC Spur Gear Generator**
* *Problème* : Modéliser un engrenage droit parfait avec une denture en développante de cercle précise est extrêmement complexe mathématiquement.
* *Solution FeatureScript* : Saisissez simplement le module de l'engrenage (ou son diametral pitch DP), le nombre de dents, le diamètre de l'alésage central (ex : $1/2\text{"}$ hex), et le script génère la géométrie parfaite de l'engrenage prêt pour l'usinage ou l'impression 3D.

### 3. **Pocketing / Lightening Tool**
* *Problème* : Retirer de la matière (évider) sur une plaque d'aluminium pour réduire son poids tout en conservant sa rigidité structurelle sous forme de treillis triangulaire (pocketing) est fastidieux.
* *Solution FeatureScript* : Sélectionnez la face de la plaque, définissez la largeur des membrures de force (ex: $0.180\text{ in}$), et le script évide automatiquement la plaque selon un motif en nid d'abeille ou de treillis ultra-optimisé.

:::important Comment installer ces FeatureScripts ?
Cliquez sur le bouton **Add custom features** en haut à droite de l'interface Onshape, recherchez la bibliothèque publique `FRC FeatureScripts` et ajoutez les scripts créés par les équipes d'élite (comme l'équipe FRC 2910 ou 1678). Ils apparaîtront directement dans votre barre d'outils de modélisation.
:::

---

## 🌳 5. Le Contrôle de Version en Temps Réel (Onshape VCS)

Onshape intègre nativement un système de contrôle de version similaire à **Git** pour le code source. Il n'y a pas de bouton "Enregistrer", chaque clic est enregistré dans l'historique cloud sécurisé du document.

```
       [Version 1.0 : Châssis de Base]
                      |
        +-------------+-------------+
        v (Branch A)                v (Branch B)
  [Intake à Rouleaux]        [Intake à Pince]
        |                           |
  (Tests CAO finis)                 |
        v                           v
  [Merge : Branch A dans Main]  [Conservée pour archives]
```

### Bonnes Pratiques de Collaboration
* **Créer des Branches** : Lorsque vous testez une nouvelle géométrie mécanique (par exemple, tester si l'Intake doit avoir 3 ou 4 rouleaux), ne modifiez pas le fichier principal de l'équipe. Créez une branche nommée `concept_intake_3_rouleaux`. 
* **Travailler en parallèle** : Deux membres de l'équipe peuvent travailler simultanément sur deux branches différentes du même robot sans risquer d'écraser le travail de l'autre (impossible sur SolidWorks ou Inventor sans serveur PDM complexe).
* **Fusionner (Merge)** : Une fois le prototype physique ou virtuel validé par l'équipe, fusionnez la branche de test dans la branche principale (`Main`).
* **Créer des Versions / Jalons (Milestones)** : Figez des versions stables (ex. : `V1.0 - Robot complet pour usinage CNC`) pour empêcher toute modification accidentelle d'une pièce en cours de fabrication à l'atelier.

---

## 🚀 6. Optimisation des Performances CAO des Grands Assemblages

À mesure que le robot s'enrichit de centaines de vis, écrous, roulements et engrenages, la CAO peut ralentir, provoquant des saccades d'affichage ou des temps de chargement de page interminables dans votre navigateur.

### Règle d'or : Limiter la modélisation de la visserie (Fasteners)
* **N'importez pas toutes les vis et écrous individuels** dans les grands assemblages de travail. Utilisez le bouton **Replicate** pour assembler la quincaillerie uniquement lorsque l'assemblage final est figé et prêt pour la nomenclature de commande (BOM).
* **Simplifiez les modèles importés** : Les modèles CAO téléchargés directement des sites fournisseurs (WCP, Rev, McMaster-Carr) contiennent souvent des détails géométriques internes superflus (comme les bobinages internes des moteurs ou les filetages physiques précis des vis). Supprimez ces fonctionnalités internes ou utilisez des modèles simplifiés d'encombrement extérieur pour libérer de la mémoire graphique.
* **Utilisez les Sous-Assemblages (Sub-Assemblies)** : Ne construisez pas le robot complet dans un seul assemblage racine. Créez un assemblage distinct pour chaque mécanisme (Swerve module, Intake, Elevator, Shooter) et importez ces blocs fonctionnels simplifiés dans l'assemblage global du robot (`00_ROBOT_COMPLET`).

---

## 📚 Supports Supplémentaires

* 💻 **Onshape Learning Center Advanced Courses :** [Onshape Advanced Assembly Modeling](https://learn.onshape.com/courses/advanced-assembly-modeling)
* 📖 **Spectrum 3847 CAD & Design Guide :** [Spectrum Design Rules](http://design.spectrum3847.org/)
* 🛠️ **FRC Designs Library (CAO de robots de championnats du monde) :** [FRC Designs CAD Archive](https://www.frcdesigns.com/)
