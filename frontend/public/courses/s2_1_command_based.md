# S2.1 - Programmation WPILib Command-Based & Asynchronisme

En informatique industrielle comme en robotique FRC, structurer un code de manière propre, découplée et réutilisable est indispensable. Les programmes simplistes constitués d'une unique boucle séquentielle géante (de type `IterativeRobot`) deviennent rapidement illisibles et impossibles à déboguer dès que le robot doit exécuter plusieurs actions complexes en parallèle (par exemple : ajuster l'angle du Shooter tout en indexant une pièce de jeu et en conduisant de manière autonome).

Pour répondre à ce besoin, l'équipe STAN ROBOTIX utilise exclusivement le paradigme d'architecture **WPILib Command-Based**.

---

## 🏛️ 1. L'Architecture Orientée Composants : Subsystems & Commands

L'architecture Command-Based découpe le programme du robot en deux blocs fonctionnels hautement découplés : les **Subsystems** (le matériel) et les **Commands** (les actions).

```
  [ TRIGGERS / BOUTONS ] (Interface Conducteur)
             |
             v  (Déclenche)
       +-----------+
       |  COMMAND  |  <--- Algorithme et logique asynchrone (ex: ShooterRoutine)
       +-----------+
             |
             v  (Requiert / Réserve)
       +-----------+
       | SUBSYSTEM |  <--- Encapsulation du matériel (moteurs, capteurs)
       +-----------+
```

### 1. Les Sous-Systèmes (Subsystems)
Un **Subsystem** est une classe Java/C++ qui encapsule un ensemble cohérent de matériel physique (moteurs, capteurs de fin de course, électrovannes pneumatiques) et expose des méthodes publiques propres d'utilisation, sans jamais laisser les autres classes manipuler directement les contrôleurs de moteurs.
* *Rôle clé* : Un sous-système ne contient **aucune logique temporelle complexe** ni boucle d'attente bloquante. Il se contente de répondre à des ordres instantanés (ex: `setElevatorHeight(double meters)`) et de lire ses capteurs.
* *Méthode `periodic()`* : Appelée automatiquement à chaque cycle de $20\text{ ms}$ (50 Hz), elle sert exclusivement à mettre à jour la télémétrie sur le tableau de bord (SmartDashboard/AdvantageKit).

### 2. Les Commandes (Commands)
Une **Command** est un bloc algorithmique qui définit une action spécifique à réaliser sur un ou plusieurs sous-systèmes. Une commande possède un cycle de vie standardisé géré par l'ordonnanceur (`CommandScheduler`) :

* **`initialize()`** : Appelée une seule fois lorsque la commande démarre. On y configure les états initiaux (ex : lancer la rampe d'accélération d'un moteur).
* **`execute()`** : Appelée périodiquement tous les cycles de $20\text{ ms}$. C'est ici que l'on calcule les consignes d'asservissement.
* **`isFinished()`** : Renvoie un booléen (`true`/`false`) indiquant si la commande a terminé son travail (ex : l'ascenseur a atteint sa hauteur cible).
* **`end(boolean interrupted)`** : Appelée une seule fois lorsque `isFinished()` renvoie `true` ou si une autre commande prioritaire a annulé celle-ci. On y sécurise le robot en coupant les moteurs.

:::important Le concept des Requirements (Réservations)
Pour éviter qu'un robot n'essaie de réaliser deux actions contradictoires sur le même matériel (par exemple, demander à l'ascenseur de monter ET de descendre en même temps), chaque commande doit **déclarer ses exigences (Requirements)** :

```java
// Dans le constructeur de la commande
addRequirements(m_elevator);
```

Si l'opérateur déclenche la commande B requérant `m_elevator` alors que la commande A s'exécute, l'ordonnanceur annule instantanément la commande A, appelle `A.end(true)` pour couper les moteurs, puis démarre la commande B. Cela évite les blocages matériels et les conflits logiques.
:::

---

## 🔗 2. Composition de Commandes Complexes : L'Orchestration Asynchrone

La véritable puissance du modèle Command-Based réside dans sa capacité à assembler des commandes élémentaires (comme `DeployIntake` ou `RunShooter`) en séquences hautement complexes sans utiliser de structures d'attente bloquantes de type `Thread.sleep()` (qui bloqueraient complètement le roboRIO).

Pour cela, nous utilisons des **Command Groups** :

```
1. SequentialCommandGroup (Séquentiel)
   [ Action A ] === (Finit) ===> [ Action B ] === (Finit) ===> [ Action C ]

2. ParallelCommandGroup (Parallèle standard)
   +-- [ Action A ] --+
   +-- [ Action B ] --+ === (Toutes finissent) ===> [ Fin globale ]
   +-- [ Action C ] --+

3. ParallelDeadlineGroup (Parallèle avec horloge mère)
   +-- [ Action A (DEADLINE / Maitresse) ] --+
   +-- [ Action B (Esclave)              ] --+ === (A finit, B et C sont coupées) ===> [ Fin ]
   +-- [ Action C (Esclave)              ] --+
```

### 1. SequentialCommandGroup
Exécute les commandes les unes après les autres. La commande suivante ne démarre que lorsque la précédente renvoie `isFinished() == true`.
* *Cas d'usage* : **Routine de tir autonome** : Déployer l'Intake $\rightarrow$ Ramasser la note $\rightarrow$ Rétracter l'Intake $\rightarrow$ Lancer le Shooter $\rightarrow$ Pousser la note dans les galets.

### 2. ParallelCommandGroup
Exécute toutes les commandes incluses simultanément. Le groupe se termine lorsque **toutes** les commandes membres ont terminé leur travail.

### 3. ParallelDeadlineGroup
Exécute toutes les commandes en parallèle, mais se termine dès que la commande désignée comme **"Deadline (maîtresse)"** se termine, interrompant immédiatement toutes les autres commandes esclaves encore actives.
* *Cas d'usage* : **Ramassage minuté** : Faire tourner les rouleaux d'Intake en parallèle du déploiement pneumatique pendant une durée maximale de $3\text{ secondes}$ (la deadline étant un temporisateur `WaitCommand(3)`).

---

## ⌨️ 3. Syntaxe Moderne WPILib & Inline Commands (Lambdas)

Avec les dernières versions de WPILib en Java, il n'est plus nécessaire de créer un fichier de classe physique de 50 lignes pour chaque petite commande. Nous utilisons la **syntaxe à base d'expressions lambdas (Inline Commands)**, extrêmement compacte et lisible.

Voici un exemple comparatif d'écriture d'une commande d'indexage automatique de pièce de jeu :

```java
// Syntaxe Inline ultra-élégante directement dans RobotContainer.java
Command autoIndexCommand = 
    // Étape 1 : Démarrer le convoyeur
    m_indexer.run(() -> m_indexer.setPower(0.5))
    // Étape 2 : Attendre que le capteur laser Time-of-Flight détecte la pièce
    .until(() -> m_tofSensor.getDistanceMeters() < 0.15)
    // Étape 3 : Couper le convoyeur à la fin
    .finallyDo((interrupted) -> m_indexer.stop());
```

### Les Triggers et le Binding sur Manette
Lier ces comportements asynchrones aux boutons de la manette du conducteur (DriverController) se fait via un mécanisme déclaratif d'écoute d'événements (Event-Driven Binding) :

```java
// Lancer l'indexage automatique dès que le bouton A de la manette XBox est pressé
m_driverController.a().onTrue(autoIndexCommand);

// Lancer le tir à la volée tant que la gâchette droite est enfoncée
m_driverController.rightTrigger()
    .whileTrue(
        new ParallelCommandGroup(
            m_shooter.run(() -> m_shooter.setRPM(4500)),
            m_drivetrain.driveAimingAtTargetCommand()
        )
    );
```

---

## 📚 Supports Supplémentaires

* 💻 **WPILib Command-Based Programming Guide :** [WPILib Docs - Command-Based](https://docs.wpilib.org/en/stable/docs/software/commandbased/index.html)
* 📖 **Team 254 (The Cheesy Poofs) Architecture Presentations :** [FRC State Machines & Code Architecture](https://www.team254.com/)
* 🎬 **Flipped Classroom - Command-Based Video Series :** [WPILib Command-Based Tutorial on Youtube](https://www.youtube.com/)
