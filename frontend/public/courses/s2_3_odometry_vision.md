# S2.3 - Odométrie, Vision par AprilTags & Filtre de Kalman

Pour qu'un robot FRC navigue sur le terrain de manière totalement autonome pendant la phase initiale de $15\text{ secondes}$ ou pour qu'il s'aligne automatiquement face au panier de tir pendant la phase téléopérée, il doit connaître sa position tridimensionnelle précise (Pose : coordonnée $x$, $y$ et angle de cap $\theta$) sur le terrain en temps réel.

Pour résoudre ce défi de localisation spatiale, nous combinons les mouvements des roues (**l'Odométrie**) et des capteurs de vision artificielle (**les AprilTags**) en utilisant des algorithmes mathématiques de fusion de données appelés **Filtres de Kalman**.

---

## 🛞 1. L'Odométrie : Avantages & Dérive Physique (Drift)

L'odométrie consiste à calculer la position relative du robot en mesurant la distance parcourue par chaque roue (à l'aide des encodeurs rotatifs de propulsion Swerve) combinée avec l'angle de cap absolu du robot fourni par une centrale inertielle 9 axes (**Pigeon 2.0 IMU**).

```
   [ ENCODEURS DE ROUES ] ---\
                             +---> [ CALCULS TRIGONOMÉTRIQUES ] ---> POSITION DU ROBOT
   [ IMU GYROSCOPE Cap  ] ---/     (Haute Fréquence - 250 Hz)       (Dérive avec le temps)
```

### Avantages de l'Odométrie
* **Haute Fréquence** : Les calculs de trigonométrie s'exécutent directement sur le roboRIO à une fréquence de **$200\text{ Hz}$ à $250\text{ Hz}$**, offrant une mise à jour fluide de la trajectoire milliseconde par milliseconde.
* **Insensibilité externe** : L'odométrie ne dépend d'aucun facteur extérieur au robot. Elle fonctionne même dans le noir complet ou si le robot est caché des caméras.

### La Dérive Temporelle (Drift)
Bien que très réactive à court terme, l'odométrie souffre d'un défaut physique majeur : la **dérive cumulative**. À chaque glissement de roue sur la moquette, à chaque choc contre un autre robot, ou en raison de l'usure progressive du diamètre des bandes de roulement des pneus, de micro-erreurs de calcul se glissent dans l'intégration de trajectoire. 
* Au bout de seulement **$30\text{ secondes}$** de match, l'erreur accumulée peut décaler la position réelle du robot de plus de **$30\text{ centimètres}$**, rendant impossible tout tir précis ou saisie automatique de pièce de jeu.

---

## 📷 2. Vision par AprilTags : La Correction Absolue

Pour corriger périodiquement la dérive de l'odométrie, nous utilisons la vision artificielle par repères fiduciaires appelés **AprilTags**. Les AprilTags sont des codes-barres bidimensionnels carrés (similaires à des QR Codes simplifiés) placés à des coordonnées tridimensionnelles rigoureusement connues sur le terrain de jeu.

```
       +------------------------------------+
       |            APRILTAG                |
       |  - Coordonnées terrain connues (x,y)|
       |                                    |
       |         +----------------+         |
       |         |  █  ████  █    |         |
       |         |  █  █  █  █    |         |
       |         |  ████  ████    |         |
       |         +----------------+         |
       |                                    |
       +------------------------------------+
                         |
                         v (Faisceau lumineux capté par la caméra)
       +------------------------------------+
       |       LIMELIGHT / COPROCESSEUR     |
       |                                    |
       |  - Détecte les coins du carré      |
       |  - Résout le problème PnP 3D       |
       |  - Calcule la Pose absolue robot   |
       +------------------------------------+
```

### Comment un Coprocesseur de Vision Calcule-t-il la Pose ?
L'équipe utilise des caméras intelligentes comme la **Limelight 3G** ou des coprocesseurs **Raspberry Pi 4** exécutant la bibliothèque open source **PhotonVision**.
1. **Détection des coins** : La caméra capte une image, identifie la bordure carrée de l'AprilTag et extrait la position en pixels de ses 4 coins.
2. **Résolution du problème PNP (Perspective-n-Point)** : En comparant les dimensions réelles connues de l'AprilTag (ex : un carré de $16.51\text{ cm}$ de côté) et les coordonnées déformées en pixels lues par la lentille optique de la caméra, l'algorithme PNP calcule la matrice de transformation tridimensionnelle décrivant la position et l'orientation relative de la caméra par rapport au tag.
3. **Traduction en coordonnées terrain** : Puisque la position absolue de chaque tag est enregistrée dans la mémoire du robot (carte officielle du terrain JSON fournie par FIRST), le coprocesseur effectue une multiplication matricielle pour en déduire les coordonnées absolues ($x$, $y$, $z$) de la caméra sur le terrain de jeu.

---

## 🧮 3. Fusion de Capteurs & Logique du Filtre de Kalman

Pour obtenir le meilleur des deux mondes (la fluidité à haute fréquence de l'odométrie et la précision absolue sans dérive de la vision), nous utilisons la classe WPILib `SwerveDrivePoseEstimator`. Cet estimateur de pose repose sur une forme simplifiée de **Filtre de Kalman**.

### Le Principe Mathématique de Correction
Le Filtre de Kalman maintient en permanence un vecteur d'état $\mathbf{x}$ (la position estimée du robot). Le filtre fonctionne en deux étapes périodiques :

```
          [ ODOMÉTRIE (250 Hz) ]
                     |
                     v
             +---------------+
             | Étape 1 :     | <--- Modèle cinématique prédictif rapide
             | PRÉDICTION    |
             +---------------+
                     |
                     v
             +---------------+
             | Étape 2 :     | <--- Correction pondérée par la covariance
             | MISE À JOUR   |      lorsqu'un AprilTag est détecté
             +---------------+
                     ^
                     |
         [ VISION APRILTAGS (30 Hz) ]
```

#### Étape 1 : La Prédiction (Prediction)
À chaque cycle d'odométrie ($250\text{ Hz}$), le filtre met à jour l'estimation de la position en se basant sur le modèle physique de déplacement des roues.

$$
\mathbf{x}_{k}^{-} = f(\mathbf{x}_{k-1}, \mathbf{u}_k)
$$

*La position du robot progresse de manière ultra-fluide mais l'incertitude sur la mesure grandit lentement.*

#### Étape 2 : La Mise à Jour / Correction (Update)
Lorsqu'un message de vision arrive depuis la caméra Limelight ($30\text{ Hz}$), le filtre calcule l'erreur entre la position prédite par l'odométrie et la position lue sur l'AprilTag, puis applique un coefficient correcteur appelé **Gain de Kalman** ($\mathbf{K}$) :

$$
\mathbf{x}_{k} = \mathbf{x}_{k}^{-} + \mathbf{K} \cdot (\mathbf{z}_k - \mathbf{H} \cdot \mathbf{x}_{k}^{-})
$$

Où :
* $\mathbf{z}_k$ est la mesure de position brute fournie par l'AprilTag.
* $\mathbf{H}$ est la matrice d'observation reliant l'espace d'état à l'espace de mesure.
* $\mathbf{K}$ est le Gain de Kalman qui ajuste la confiance relative accordée à chaque capteur.

### Ajustement Dynamique de la Confiance (Dynamic Covariance)
Le secret d'un bon Filtre de Kalman réside dans l'ajustement en temps réel de la matrice de covariance de bruit de mesure ($\mathbf{R}$), ce qui modifie la valeur du Gain de Kalman $\mathbf{K}$ :

:::important Pondération dynamique en FRC
* **Robot immobile et proche du tag** : Le bruit de vision est extrêmement faible. Nous diminuons la déviation standard de vision ($\sigma_{\text{vision}} \approx 0.1\text{ m}$). Le filtre fait un bond immédiat pour aligner sa position estimée sur la mesure de la caméra, éliminant instantanément toute dérive d'odométrie.
* **Robot fonçant à pleine vitesse à l'autre bout du terrain ($>5\text{ m}$ du tag)** : Les vibrations mécaniques et l'éloignement provoquent de fortes distorsions de l'image (bruit important). Nous augmentons dynamiquement la déviation standard de vision ($\sigma_{\text{vision}} \approx 2.0\text{ m}$). Le filtre ignore alors presque totalement la mesure de la vision et se fie à $98\%$ à l'odométrie robuste des encodeurs, évitant ainsi que le robot ne subisse des sauts brusques et instables de trajectoire sur la carte.
:::

---

## 💻 4. Exemple d'implémentation Java WPILib

Voici l'architecture standardisée d'implémentation de la fusion odométrie + vision dans le sous-système de propulsion Swerve (`DriveSubsystem.java`) :

```java
public class DriveSubsystem extends SubsystemBase {
  // Déclarer l'estimateur de pose officiel de WPILib
  private final SwerveDrivePoseEstimator m_poseEstimator;
  
  public DriveSubsystem() {
    // Initialiser l'estimateur avec les cinématiques Swerve, le cap gyro et les positions initiales
    m_poseEstimator = new SwerveDrivePoseEstimator(
        m_kinematics,
        getGyroRotation2d(),
        getModulePositions(),
        new Pose2d(0, 0, new Rotation2d()) // Position initiale théorique
    );
  }

  @Override
  public void periodic() {
    // Étape 1 : Mettre à jour en continu à l'aide de l'odométrie rapide (250 Hz)
    m_poseEstimator.update(getGyroRotation2d(), getModulePositions());
    
    // Étape 2 : Si la caméra détecte un AprilTag, fusionner la mesure de vision
    var visionResult = LimelightHelpers.getLatestResults("limelight").targetingResults;
    
    if (visionResult.valid && visionResult.targets_Fiducials.length > 0) {
      Pose2d robotPoseFromVision = LimelightHelpers.getBotPose2d_wpiBlue("limelight");
      double timestampSeconds = LimelightHelpers.getLatency_Pipeline("limelight") / 1000.0;
      
      // Ajuster dynamiquement la confiance selon la distance moyenne au tag
      double distanceToTag = visionResult.targets_Fiducials[0].targetPose_CameraSpace[2]; // Z axis in camera frame
      
      if (distanceToTag < 4.0) { // Si à moins de 4 mètres, fusionner la mesure
        // Configurer la matrice de confiance (Standard Deviations: x, y, theta)
        m_poseEstimator.setVisionMeasurementStdDevs(VecBuilder.fill(0.3, 0.3, Units.degreesToRadians(10)));
        m_poseEstimator.addVisionMeasurement(robotPoseFromVision, timestampSeconds);
      }
    }
  }
}
```

---

## 📚 Supports Supplémentaires

* 💻 **WPILib Pose Estimation Guide :** [WPILib Docs - State Estimation](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/state-space/state-space-pose-estimators.html)
* 📖 **Limelight Documentation :** [Integrating Limelight Pose Estimation with WPILib](https://docs.limelightvision.io/en/latest/coordinate_systems.html)
* 🧪 **AprilTag Research Paper :** [AprilTag: A robust and flexible visual fiducial system](https://april.eecs.umich.edu/media/pdfs/olson2011tags.pdf)
