# T2.1 - Processus de Triage Flash en Stand (Checklist de Secours)

Les compétitions de robotique FRC sont des environnements à haute tension. Entre deux matches de qualification, les équipes ne disposent souvent que de **$15$ à $30\text{ minutes}$** pour ramener le robot au stand (Pit), diagnostiquer les casses du match précédent, réparer les avaries mécaniques ou électriques, changer la batterie, et se présenter à la file d'attente (Queue) du match suivant.

Pour gérer cette pression sans céder à la panique, l'équipe STAN ROBOTIX applique un protocole d'organisation industrielle inspiré des stands de Formule 1 : le **Triage Flash**.

---

## 🏎️ 1. Organisation du Stand : Rôles du Pit Crew

Pendant la compétition, le stand n'est pas un lieu de rassemblement social. C'est une zone de travail hautement optimisée où chaque membre du **Pit Crew** (composé de 4 à 5 étudiants d'élite) possède un rôle strictement défini :

```
                        +----------------------------+
                        |          PIT BOSS          |  <--- Chef d'orchestre
                        +----------------------------+
                                      |
         +----------------------------+----------------------------+
         |                            |                            |
         v                            v                            v
  [ MECANICIEN DE STAND ]     [ ELECTRICIEN DE STAND ]      [ PROGRAMMEUR DE STAND ]
  - Structure, engrenages,    - Batterie, bus CAN,          - Logs, calibrage gyro,
    axes, serrage visserie      vérification câblage         télémétrie, code correctif
```

1. **Le Chef de Stand (Pit Boss)** : Le chef d'orchestre. Il gère le temps restant (compte à rebours permanent sur un tableau blanc), coordonne les réparations, et prend les décisions critiques de sécurité. Il est le seul interlocuteur des inspecteurs techniques ou des éclaireurs (scouts) des autres équipes.
2. **Le Spécialiste Mécanique (Pit Mech)** : Responsable de la lubrification, du serrage de la structure, de la tension des chaînes/courroies et du remplacement immédiat des plaques ou axes tordus.
3. **Le Spécialiste Électronique (Pit Spark)** : Responsable du remplacement et de la sécurisation de la batterie, de la vérification de l'état de la radio Wi-Fi, de l'inspection visuelle du bus CAN et du resserrage des bornes de puissance.
4. **Le Spécialiste Logiciel (Pit Coder)** : Responsable du téléchargement des journaux de logs post-match, du calibrage des capteurs (ex: recalibrer les zéros des Swerve) et du déploiement des correctifs de dernière minute.

:::important Règle d'or de sécurité : Le "Lock-Out / Tag-Out"
Dès que le robot entre dans le stand, le disjoncteur principal de 120V doit être **éteint** et la batterie déconnectée. Aucune clé ne doit toucher le châssis tant que la batterie est branchée. 
Si le programmeur doit faire tourner un moteur pour tester un asservissement, il doit crier à haute voix : **"ROBOT SOUS TENSION - ÉCARTEZ-VOUS !"**. Tous les membres du stand doivent alors lever les mains en l'air et s'écarter physiquement de la zone de travail du robot.
:::

---

## 📋 2. La Checklist Flash Pré-Match : Les 5 Minutes Critiques

Avant de quitter le stand pour chaque match, le Pit Crew doit dérouler une checklist systématique. Omettre un seul de ces points est la cause la plus fréquente d'un robot inactif sur le terrain :

* **[ ] Énergie** : Remplacement par une batterie étiquetée **Verte (Compétition)**, testée à moins de $0.015\ \Omega$ de résistance interne au Battery Beak. Serrage ferme des bornes de batterie au couple de $5\text{ Nm}$ et isolation des cosses.
* **[ ] Pneumatique (Si applicable)** : Vérification de l'absence de fuites d'air en éteignant les moteurs et en observant le manomètre (perte maximale tolérée de $5\text{ PSI}$ en 10 minutes).
* **[ ] Structure & Serrage** : Passage rapide d'une clé hexagonale sur les vis de montage Swerve, fixations moteurs et boulons de pivot principal.
* **[ ] Liaison Bus CAN** : Inspection visuelle de la DEL d'état de communication sur chaque contrôleur de moteur (toutes les DEL doivent clignoter de manière synchronisée en vert ou orange, sans aucune DEL rouge clignotante isolée).
* **[ ] Tether Test (Essai Filaire)** : Branchement du roboRIO en filaire (USB ou Ethernet) à l'ordinateur de programmation pour confirmer que le code s'exécute, qu'aucune exception Java n'est levée et que les AprilTags des caméras sont bien détectés en direct.

---

## 🩺 3. Matrice de Triage Flash (Gestion des Pannes de Dernière Minute)

Que faire si un mécanisme majeur (comme le bras d'Intake ou le Shooter) se brise à seulement **$5\text{ minutes}$** de l'appel pour le match suivant ? Tenter de réparer à la hâte risque de vous faire manquer le match (provoquant un forfait immédiat pour votre alliance).

Pour cela, le Pit Boss applique la **Matrice de Triage Flash** :

```
          +------------------------------------------------------+
          |           PANNE MAJEURE A 5 MIN DU MATCH             |
          +------------------------------------------------------+
                                     |
                 Est-ce réparable en moins de 3 minutes ?
                 /                                    \
               OUI                                    NON
               /                                        \
      [ Réparation Express ]                   Le robot peut-il rouler (Drivetrain OK) ?
                                               /                                    \
                                             OUI                                    NON
                                             /                                        \
                                  [ DESACTIVATION COMMANDE ]               [ DEMANDE DE CARTON ]
                                  - Isoler physiquement le bras            (Demander un délai
                                  - Désactiver le bras dans le code         de 5 min à l'alliance)
                                  - Jouer en défense exclusive
```

### 1. La Désactivation Propre (Software Isolation)
Si le Shooter est brisé et ne peut être réparé à temps :
* Le mécanicien attache fermement le Shooter dans sa position la plus basse à l'aide de colliers de serrage (Zip-ties) robustes ou de sangles de stand pour éviter qu'il ne balance pendant les collisions.
* L'électricien débranche le fusible ou le disjoncteur d'alimentation du moteur du Shooter (sur le Power Distribution Hub) pour empêcher tout appel de courant inutile.
* Le programmeur commente la ligne d'initialisation du sous-système dans `RobotContainer.java` ou bascule une variable globale `#isShooterBroken = true` qui court-circuite la commande de tir dans le code.

:::important Présence sur le terrain et rôle de défenseur (Defense Bot)
Même si votre robot ne peut plus marquer de points, **il doit impérativement se présenter sur le terrain** s'il est capable de rouler. Un robot FRC lourd, équipé d'une propulsion Swerve robuste, qui se contente de bloquer les trajectoires des adversaires d'élite (jeu défensif) apporte souvent plus de valeur à son alliance qu'un robot absent. Ne restez jamais au stand par fierté parce qu'un de vos mécanismes est hors-service !
:::

### 2. Le Carton de Temps (Alliance Timeout Coupon)
Pendant la phase finale d'élimination (Playoffs), chaque alliance dispose d'un unique **Timeout Coupon (Carton de Temps)** qu'elle peut remettre à l'arbitre en chef. Ce coupon accorde un délai supplémentaire de **$8\text{ minutes}$** à l'ensemble de l'alliance pour effectuer des réparations d'urgence.
* La décision d'utiliser ce carton doit être négociée de concert entre le Pit Boss et les capitaines de l'alliance.

---

## 📚 Supports Supplémentaires

* 💻 **FIRST Robotics Competition Tournament Rules :** [FRC Manual - Timeout and Stand Guidelines](https://www.firstinspires.org/resource-library/frc/competition-manual-qa-system)
* 📖 **Spectrum 3847 Pit & Organization Guide :** [Spectrum Pit Design & Tools](https://www.spectrum3847.org/)
* 🎬 **Pit Crew Efficiency Video - FRC Behind the Bumper :** [FRC Top Teams Pit Tour on Youtube](https://www.youtube.com/)
