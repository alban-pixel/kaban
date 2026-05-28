# S2.2 - Asservissements en Boucle Fermée : PID & Feedforward Physique

En robotique de compétition FRC, exiger d'un moteur qu'il tourne ne suffit pas. Nous devons contrôler ses mouvements avec une précision chirurgicale : stabiliser un volant de tir (Shooter) à exactement $4500\text{ RPM}$ sous les impacts répétés des pièces de jeu, positionner un ascenseur à $\pm 2\text{ mm}$ de sa cible ou maintenir un bras pivotant de $15\text{ kg}$ immobile à un angle précis sans qu'il ne s'affaisse sous son propre poids.

Pour y parvenir, nous concevons des **asservissements en boucle fermée** combinant le régulateur mathématique universel **PID** et la modélisation physique prédictive **Feedforward**.

---

## 🧮 1. Le Régulateur PID : Mathématiques & Ajustement Manuel

Un régulateur **PID (Proportionnel, Intégral, Dérivatif)** est un algorithme qui calcule en permanence l'**Erreur** ($e(t)$) définie par la différence entre la consigne cible (Setpoint, $r(t)$) et la mesure réelle du capteur (Feedback, $y(t)$) :

$$
e(t) = r(t) - y(t)
$$

Le signal de commande correcteur envoyé aux moteurs ($u(t)$) est la somme pondérée de trois termes distincts :

$$
u(t) = K_p \cdot e(t) + K_i \cdot \int_{0}^{t} e(\tau) \, d\tau + K_d \cdot \frac{de(t)}{dt}
$$

```
   CONSIGNE (Setpoint) --+
                         |
                         v   (Erreur)     +-------------------+
                       ( + ) -----------> |   Régulateur PID  | ---\
                        -                 +-------------------+     \
                         ^                                           v
                         |                 +-------------------+   ( + ) ---> [ MOTEUR ]
     MESURE (Feedback) --+---------------> |    FEEDFORWARD    | ---/
                         |                 |  (Modèle Physique)|
                         v                 +-------------------+
                  [ CAPTEUR (Encodeur) ]
```

### Anatomie des Trois Actions du PID

#### 1. L'Action Proportionnelle ($K_p$) : La Force Brute
* *Principe* : Le moteur pousse d'autant plus fort que le robot est loin de sa cible.
* *Mathématique* : $u_p(t) = K_p \cdot e(t)$.
* *Limites* : Utilisée seule, l'action proportionnelle ne parvient jamais à atteindre la consigne exacte car à mesure que l'erreur s'approche de zéro, le couple envoyé au moteur s'approche également de zéro. Le robot s'arrête juste avant la cible. C'est l'**erreur statique**.

#### 2. L'Action Intégrale ($K_i$) : La Persévérance
* *Principe* : Elle accumule (intègre) l'erreur restante au fil du temps. Si le robot reste coincé à quelques millimètres de sa cible, l'intégrale grandit jusqu'à forcer le moteur à pousser suffisamment fort pour vaincre les frottements mécaniques.
* *Mathématique* : $u_i(t) = K_i \cdot \sum (e_t \cdot \Delta t)$.
* *Danger (Integral Windup)* : Si le mécanisme est bloqué mécaniquement par un obstacle, l'accumulateur intégral s'emballe et grimpe vers l'infini. Dès que l'obstacle disparaît, le robot s'élance avec une violence destructrice. Nous devons impérativement brider l'accumulateur ou désactiver le terme $K_i$ lorsque l'erreur est trop grande.

#### 3. L'Action Dérivative ($K_d$) : L'Amortisseur Prédictif
* *Principe* : Elle mesure la vitesse de variation de l'erreur. Si l'erreur diminue de manière extrêmement rapide, cela signifie que le mécanisme fonce vers sa cible et risque de la dépasser (*overshoot*). L'action dérivative applique alors une force de freinage opposée pour amortir l'arrivée.
* *Mathématique* : $u_d(t) = K_d \cdot \frac{e_t - e_{t-1}}{\Delta t}$.

### Guide d'Ajustement Manuel (Tuning) en Stand
Pour régler vos coefficients de gain dans l'ordre de priorité industrielle :
1. Mettez $K_i$ et $K_d$ à **zéro**.
2. Augmentez progressivement $K_p$ jusqu'à ce que le mécanisme atteigne sa cible rapidement, mais en commençant à osciller de manière continue autour de celle-ci.
3. Divisez alors $K_p$ par deux pour retrouver un système stable.
4. Augmentez progressivement $K_d$ pour éliminer le dépassement et amortir l'arrêt.
5. N'ajoutez un soupçon de $K_i$ qu'en dernier recours si et seulement s'il reste une erreur statique impossible à éliminer.

---

## 🏎️ 2. Le Feedforward Physique (Modélisation Dynamique)

Si le PID est un régulateur réactif exceptionnel (il ne réagit **qu'après** l'apparition d'une erreur), il est très inefficace pour anticiper les contraintes physiques connues d'un robot, comme la gravité ou les frottements statiques de départ.

Pour cela, nous combinons le PID avec un **Feedforward**. Le Feedforward est un modèle mathématique prédictif qui calcule instantanément la tension électrique brute théorique nécessaire pour exécuter le mouvement demandé, sans même lire le capteur.

### L'Équation Générale du Feedforward de WPILib
Pour un bras pivotant soumis à la gravité (modélisé par la classe `ArmFeedforward`), l'équation de calcul de tension $V_{\text{ff}}$ est définie par :

$$
V_{\text{ff}} = K_s \cdot \operatorname{sgn}(v) + K_g \cdot \cos(\theta) + K_v \cdot v + K_a \cdot a
$$

Où :
* **$K_s$ (Static Friction Gain)** : Tension minimale nécessaire pour vaincre la friction statique initiale du mécanisme (la tension pour "décoller" le moteur). Toujours appliquée dans le sens de la vitesse de consigne $\operatorname{sgn}(v)$.
* **$K_g$ (Gravity Gain)** : Tension nécessaire pour contrer la gravité sur un bras de levier horizontal. Le terme est pondéré par le cosinus de l'angle du bras ($\cos(\theta)$) : le couple gravitationnel est maximal lorsque le bras est horizontal ($0^\circ$, $\cos(0) = 1$) et nul lorsque le bras est vertical ($90^\circ$, $\cos(90) = 0$).
* **$K_v$ (Velocity Gain)** : Constante reliant la tension électrique à la vitesse de rotation souhaitée du moteur. C'est l'inverse de la constante de vitesse électrique du moteur ($K_v \approx 1 / K_w$).
* **$K_a$ (Acceleration Gain)** : Tension nécessaire pour fournir l'inertie d'accélération demandée (loi de Newton $F = m \cdot a$).
* **$\theta$, $v$, $a$** : Respectivement l'angle instantané du mécanisme ($\text{rad}$), sa vitesse de consigne ($\text{rad/s}$) et son accélération cible ($\text{rad/s}^2$).

:::tip Le duo parfait : 90% Feedforward + 10% PID
Dans une architecture de contrôle moderne :
1. Le **Feedforward** fait le gros du travail : il calcule $90\%$ de la tension nécessaire en fonction des lois de la physique.
2. Le **PID** ne gère que les $10\%$ restants : il corrige les imprévus (usure de la batterie, frottements variables, résistance de l'air, collisions avec un adversaire).
Puisque le PID a très peu d'efforts à fournir, les gains $K_p$ peuvent être réglés à des valeurs beaucoup plus faibles, ce qui élimine tout risque d'oscillation violente ou d'instabilité du robot.
:::

---

## 🧪 3. Identification Automatique des Systèmes via WPILib SysId

Plutôt que d'essayer de deviner les valeurs des coefficients de gains physiques ($K_s$, $K_v$, $K_a$, $K_g$) par approximations successives à l'atelier, la WPILib propose un outil d'analyse automatisé appelé **SysId (System Identification)**.

```
       +------------------------------------+
       |          ROBOT REEL                |
       |                                    |
       |  [ Lance des tests automatisés ]   |
       |  - Quasistatic (Rampe de tension)  |
       |  - Dynamic (Impulsions brusques)   |
       +------------------------------------+
                         |
                         v (Enregistrement des logs de télémétrie)
       +------------------------------------+
       |          WPILib SysId APP          |
       |                                    |
       |  - Analyse la réponse fréquentielle|
       |  - Génère les gains optimaux Ks,Kv |
       |  - Calcule le PID de manière math. |
       +------------------------------------+
```

### Le Principe de fonctionnement de SysId
1. **Génération du code de test** : L'outil SysId génère une routine de contrôle spécifique à déployer temporairement sur votre roboRIO.
2. **Exécution des tests physiques** :
   * **Test Quasistatique (Quasistatic Test)** : Le robot applique une rampe de tension extrêmement lente et linéaire (ex : $+0.1\text{ V/s}$) aux moteurs. L'outil enregistre à quel voltage exact le mécanisme commence à bouger (ce qui détermine précisément la friction statique $K_s$), puis comment la vitesse augmente proportionnellement à la tension (déterminant $K_v$).
   * **Test Dynamique (Dynamic Test)** : Le robot envoie brusquement une impulsion de tension complète (ex : $+6\text{ V}$) pour mesurer l'accélération maximale du mécanisme sous charge (déterminant l'inertie de masse $K_a$).
3. **Analyse et modélisation mathématique** : SysId récupère les données enregistrées à haute fréquence, calcule une régression linéaire des moindres carrés et exporte directement les gains physiques réels de votre robot, ainsi que les coefficients PID idéaux selon les critères de régulation de votre choix (ex : critères LQR ou Luenberger).

---

## 📚 Supports Supplémentaires

* 💻 **WPILib Control Theory Guide :** [WPILib Docs - Closed-Loop Control](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/index.html)
* 📖 **WPILib SysId Application Manual :** [System Identification Utility](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/system-identification/index.html)
* 🧪 **Cheesy Poofs Technical Presentation :** [Introduction to Feedforward & Trajectory Following](https://www.team254.com/)
