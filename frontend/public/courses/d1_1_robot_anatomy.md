# D1.1 - Anatomie d'un Robot FRC

Pour concevoir et construire un robot FRC performant, il est indispensable de comprendre comment ses différentes parties mécaniques s'articulent. Un robot FRC de compétition est découpé en plusieurs sous-systèmes (subsystems).

:::info
**Le Châssis (Drivetrain)** est la fondation du robot. C'est lui qui lui permet de se déplacer à haute vitesse et d'esquiver les défenseurs adverses sur le terrain.
:::

---

## 🏎️ Les Types de Châssis (Drivetrains)

En FRC, il existe deux familles dominantes de transmission :

### 1. La Transmission Omnidirectionnelle (Swerve Drive)
Le Swerve est la norme absolue de la FRC moderne. Chaque roue est indépendante et peut tourner sur 360° tout en étant motrice.
* **Avantages** : Déplacement dans n'importe quelle direction instantanément (translation et rotation simultanées), évite facilement la défense, excellente maniabilité.
* **Inconvénients** : Coût élevé, programmation très complexe (cinématique vectorielle), poids supérieur.
* **Moteur type** : Kraken X60 ou NEO par module (2 moteurs par roue : un pour la vitesse, un pour la direction).

### 2. Le Châssis Classique (Tank Drive / West Coast Drive)
Un système à roues fixes parallèles (généralement 6 ou 8 roues) similaire aux chenilles d'un char d'assaut.
* **Avantages** : Extrêmement robuste, simple à programmer, excellent couple de poussée linéaire.
* **Inconvénients** : Impossible de se déplacer latéralement (strafe), vulnérable aux défenses latérales.

---

## 🛠️ Les Sous-Systèmes Clés (Subsystems)

En dehors du châssis, un robot dispose de mécanismes spécialisés pour interagir avec les éléments de jeu :

### 1. L'Intake (Le Ramasseur)
* **Rôle** : Récupérer les objets de jeu au sol ou depuis une station humaine.
* **Mécanique** : Rouleaux rotatifs en caoutchouc ou en silicone souple entraînés par courroies synchrones ou engrenages. 
* **Moteur recommandé** : NEO 550 ou NEO (couple moyen, légèreté).

### 2. L'Indexer / Conveyor (Le Convoyeur)
* **Rôle** : Transporter les objets du ramasseur vers le mécanisme de stockage ou de tir, de façon ordonnée.
* **Mécanique** : Bandes rugueuses, rouleaux ou guides en polycarbonate avec capteurs photoélectriques pour détecter la présence de l'objet.

### 3. Le Shooter (Le Lanceur)
* **Rôle** : Propulser l'objet de jeu dans la cible avec précision.
* **Mécanique** : Volants d'inertie (flywheels) tournant à haute vitesse (plus de 5000 RPM). La compression de l'objet lors de sa sortie est un facteur critique de répétabilité du tir.
* **Moteur recommandé** : Kraken X60 ou NEO (haute vitesse et couple dynamique élevé).

### 4. L'Élévateur ou Bras Articulé (Elevator / Arm)
* **Rôle** : Atteindre des cibles en hauteur ou soulever le robot.
* **Mécanique** : Systèmes de câbles/chaînes à poulies (cascade ou continu) ou bras pivotants mus par de forts rapports de réduction d'engrenages (gearbox).

---

## 🛡️ Le Périmètre du Robot & Les Bumpers (Pare-chocs)

La sécurité et la protection des composants internes sont régies par des règles mécaniques strictes :

* **Le Bumper Zone** : Zone fixe située à la base du robot (généralement entre 5 cm et 25 cm du sol) où doivent être installés les pare-chocs.
* **Les Bumpers** : Fabriqués obligatoirement avec des tubes de mousse de piscine de 2.5 pouces de diamètre et du contreplaqué de 0.75 pouce enveloppés de tissu robuste rouge ou bleu. Ils absorbent les impacts violents.
* **Frame Perimeter** : Le contour mécanique fermé du robot. Aucun composant rigide ne doit dépasser du périmètre en début de match sous peine de disqualification.

:::warning
**Risques de court-circuit sur le châssis !**
Tous les composants électriques doivent être isolés électriquement du cadre en aluminium (châssis). Une vérification à l'aide d'un multimètre (test de continuité) est obligatoire lors de l'inspection technique officielle avant chaque tournoi.
:::

---

## 📚 Supports Supplémentaires

* 🖥️ **Slides de Présentation :** [Slides D1.1 - Anatomie d'un Robot FRC](https://docs.google.com/presentation/d/1IMirGYkg5m0WvAMZfOa9wDqTR74IMB_VLnsSxgjjoD8/edit)
* 📖 **Encyclopédie non-officielle des mécanismes (Project Bucephalus) :** [FRC Mechanism Encyclopedia](https://www.projectb.net.au/resources/robot-mechanisms/#GPE)
* 📄 **REV FRC Robot Basics Guide :** [REV Robot Basics Guide PDF](https://www.revrobotics.com/content/docs/FRC-Robot-Basics-Guide.pdf)
