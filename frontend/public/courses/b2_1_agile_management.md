# B2.1 - Gestion de Projet Agile & Cycle Sprint (Build Season de 8 Semaines)

Une équipe de robotique FRC performante ne se résume pas à un groupe de techniciens passionnés assemblant des pièces de métal dans un garage. Elle fonctionne comme une véritable **start-up d'ingénierie industrielle**. Avec un budget annuel dépassant souvent les $20\ 000\text{ €}$, des dizaines de membres aux compétences variées et un délai de développement ultra-court (la fameuse *Build Season*), la gestion de projet est le pilier invisible qui sépare les équipes championnes des autres.

Pour relever ce défi, l'équipe STAN ROBOTIX applique les méthodologies de **Gestion de Projet Agile** et la gestion visuelle par **Tableaux Kanban**.

---

## 📊 1. Le Tableau Kanban : Gérer les flux de travail (Workflow)

Le **Kanban** (mot japonais signifiant "panneau" ou "carte") est un système d'organisation visuelle conçu à l'origine par les ingénieurs de Toyota pour optimiser les lignes de production. Il repose sur un tableau divisé en colonnes représentant les étapes successives d'avancement du projet :

```
       +-------------------------------------------------------+
       |             TABLEAU KANBAN STAN ROBOTIX               |
       +-----------+-------------+-------------+---------------+
       |  BACKLOG  | EN COURS    | EN PHASE DE |    TERMINÉ    |
       | (À faire) |   (Doing)   | TEST (Test) |    (Done)     |
       +-----------+-------------+-------------+---------------+
       | [Tâche A] |  [Tâche C]  |  [Tâche E]  |   [Tâche F]   |
       | [Tâche B] |  [Tâche D]  |             |   [Tâche G]   |
       +-----------+-------------+-------------+---------------+
```

### Les Règles d'Or du Kanban FRC
1. **Visualisation Globale** : Chaque tâche technique (ex : "Usiner le flanc de l'Intake", "Câbler le capteur ToF", "Ajuster le gain Kp du bras") est inscrite sur une carte physique ou virtuelle indiquant son niveau de priorité, son responsable et sa date d'échéance.
2. **Limitation du Travail en Cours (WIP - Work In Progress)** : C'est la règle la plus importante. Pour éviter que les membres de l'équipe ne commencent dix tâches simultanément sans en terminer aucune, la colonne "EN COURS" est bridée à un nombre maximum de cartes (ex : 3 cartes maximum par sous-équipe). On ne commence une nouvelle tâche que lorsqu'une tâche active est déplacée vers "TEST" ou "TERMINÉ".
3. **Définition de Terminé (DoD - Definition of Done)** : Une tâche n'est pas "terminée" simplement parce que le code est écrit ou la pièce découpée. Pour passer dans la colonne "TERMINÉ", elle doit respecter la DoD de l'équipe : double vérification mécanique par un mentor, code compilé sans erreur et validé sur le robot réel lors d'un test physique d'au moins 3 cycles de fonctionnement parfaits.

---

## ⏳ 2. Le Sprint de la Build Season : Jalons des 8 Semaines

La *Build Season* commence le premier samedi de janvier (le *Kickoff*) avec la révélation mondiale des règles du jeu de la saison. L'équipe dispose d'exactement **$8\text{ semaines}$** avant sa première compétition. Nous découpons ce sprint géant en jalons hebdomadaires stricts :

```
 [ Kickoff ]
      |
   Semaine 1 : Analyse des règles, modélisation stratégique & CAO conceptuelle
      |
   Semaine 2 : Prototypage rapide en bois/3D & validation physique des concepts
      |
   Semaine 3 : CAO complète détaillée et figée (CAD Frozen)
      |
   Semaine 4 : Usinage CNC intensif & fabrication de toutes les pièces
      |
   Semaine 5 : Assemblage mécanique & câblage électrique propre (Wiring)
      |
   Semaine 6 : Programmation des asservissements PID/Vision & tests initiaux
      |
   Semaine 7 : Entraînement intensif des pilotes (Driver Practice) & routines auto
      |
   Semaine 8 : Optimisation des cycles de jeu, triage des stands et préparation valise
      |
 [ Match 1 ]
```

### Les Jalons Clés Indépassables

#### Semaine 1 & 2 : Prototypage et Stratégie
* *Objectif* : Ne concevez pas un robot complet sur ordinateur sans avoir validé les principes physiques. Fabriquez des prototypes rapides en bois contreplaqué découpé au laser et actionnés à la visseuse sans fil pour tester si les rouleaux attrapent bien la pièce de jeu.
* *Jalon critique* : Choix final du concept validé par un vote collégial le 10e jour après le Kickoff.

#### Semaine 3 : CAO Figée (CAD Frozen)
* *Objectif* : Le modèle 3D global du robot sur Onshape doit être achevé et validé à $95\%$. Toutes les pièces sur mesure doivent être prêtes pour la découpe CNC. Aucune modification structurelle majeure n'est autorisée après ce jalon.

#### Semaine 5 : Robot Prêt pour le Code (Robot Ready)
* *Objectif* : L'assemblage mécanique et le câblage électrique sont terminés. Le robot est posé sur ses roues, sous tension. Il est entièrement légué à l'équipe de programmation pour les 3 semaines suivantes.

---

## ⚠️ 3. Gestion des Goulots d'Étranglement (Bottlenecks)

Dans toute build season, des conflits de ressources se produisent, ralentissant l'avancée du projet. Nous identifions et résolvons ces **goulots d'étranglement** de manière proactive :

### 1. Le goulot de la Fraiseuse CNC (Usinage)
* *Problème* : Tout le monde a besoin de ses plaques en aluminium découpées en Semaine 4, créant une file d'attente interminable devant l'unique fraiseuse CNC de l'atelier.
* *Solution Agile* : Priorisation des pièces d'usinage. Le châssis de propulsion (Drivetrain) doit toujours être usiné en priorité absolue pour que le robot puisse rouler le plus tôt possible. Les plaques d'Intake ou de Shooter, plus faciles à prototyper temporairement en bois ou en plastique 3D, sont usinées en dernier.

### 2. Le goulot du Robot Unique (Software vs Hardware)
* *Problème* : L'équipe mécanique a besoin du robot pour ajuster des ajustements physiques, tandis que l'équipe programmation en a besoin pour tester le code, créant des tensions d'accès au matériel.
* *Solution Agile* :
  * **Concevoir un robot jumeau d'entraînement simple (Drivetrain de pratique)** : Permet aux codeurs de tester l'odométrie et la vision en direct pendant que les mécaniciens assemblent le robot officiel de compétition.
  * **Simulation logicielle** : Utiliser les outils de simulation 2D/3D de WPILib pour valider le code d'asservissement PID et de trajectoire autonome avant même que le robot réel ne soit construit.

---

## 📚 Supports Supplémentaires

* 💻 **Agile Alliance Guide :** [Introduction to Kanban and Scrum Methodologies](https://www.agilealliance.org/agile101/)
* 📖 **Spectrum 3847 FRC Design Guide :** [Timeline and Build Season Milestones](https://www.spectrum3847.org/)
* 🎬 **FRC Robot in 3 Days (Ri3D) :** [Learning rapid prototyping under massive time limits on Youtube](https://www.youtube.com/)
