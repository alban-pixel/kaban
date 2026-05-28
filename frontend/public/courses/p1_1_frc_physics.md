# P1.1 - Physique de Mouvement et Dynamique FRC

La mécanique d'un robot FRC ne se résume pas à assembler des profilés et des engrenages. Pour concevoir un robot champion, il faut appliquer les lois de la physique fondamentale. Comprendre les forces de contact, l'inertie et la balistique permet de concevoir des mécanismes fiables et d'éviter la casse matérielle.

---

## 🏎️ 1. Les Lois du Contact : Le Frottement (Friction)

Le frottement entre les roues du robot et le tapis de jeu (tapis synthétique standard FRC) détermine la capacité d'accélération et la force de poussée lors des duels en match.

### L'Équation Fondamentale du Frottement
La force de frottement maximale $F_f$ qu'un pneu peut exercer avant de glisser est régie par la loi de Coulomb :

$$F_f = \mu \times F_n$$

* **$F_n$ (Force Normale)** : Le poids supporté par la roue (en Newtons). Pour un robot à plat de masse $m$ équitablement répartie sur 4 roues, $F_n = \frac{m \times g}{4}$ (où $g \approx 9.81\text{ m/s}^2$).
* **$\mu$ (Coefficient de frottement)** : Facteur d'adhérence entre le matériau de la roue et le sol.

### Coefficient Statique ($\mu_s$) vs Dynamique ($\mu_d$)
C'est la notion la plus critique de la transmission :
* **$\mu_s$ (Frottement Statique)** : S'applique lorsque la roue roule sans glisser. Pour des roues FRC de type *colle* (ex. roues noires bi-matière ou roues de Swerve en nitrile), $\mu_s$ peut atteindre **$1.3$ à $1.5$**.
* **$\mu_d$ (Frottement Dynamique)** : S'applique dès que la roue patine (les pneus glissent sur le tapis). Le coefficient chute alors drastiquement à **$0.7$ ou $0.8$**.

:::important
**Pourquoi éviter de patiner ?**
Si vos moteurs fournissent un couple trop important par rapport au frottement statique disponible, les roues se mettent à patiner. Vous passez instantanément d'un frottement statique élevé ($\mu_s \approx 1.4$) à un frottement dynamique faible ($\mu_d \approx 0.8$). **Le robot perd près de 40% de sa force de traction !** 

C'est pourquoi les programmeurs FRC implémentent des algorithmes de **contrôle de traction (anti-slip)** limitant le couple moteur dès qu'une différence de vitesse est détectée entre l'encodeur de roue et l'accéléromètre du robot (IMU).
:::

---

## 🌀 2. Dynamique de Rotation & Inertie (Shooters & Flywheels)

Un lanceur de projectiles FRC (Shooter) stocke de l'énergie sous forme de rotation. Pour comprendre son comportement, il faut utiliser la physique de rotation.

### Le Moment d'Inertie ($J$)
Le moment d'inertie caractérise la résistance d'un corps à être mis en rotation. Pour un disque homogène (comme un volant d'inertie de tir) de masse $m$ et de rayon $r$ :

$$J = \frac{1}{2} m r^2$$

### Conservation du Moment Cinétique
Le moment cinétique $L$ d'un système en rotation est égal à :

$$L = J \times \omega$$

*(Où $\omega$ est la vitesse angulaire en rad/s).*

Dès qu'une balle ou une note en mousse s'insère dans le Shooter, elle subit une accélération violente. Par action-réaction, elle absorbe de l'énergie et ralentit le volant d'inertie :

$$J_{\text{shooter}} \times \omega_{\text{avant}} = (J_{\text{shooter}} + J_{\text{balle}}) \times \omega_{\text{après}}$$

:::tip
**Comment conserver la précision lors de tirs en rafale ?**
Pour éviter que la vitesse de rotation (RPM) ne s'effondre de plus de 15% après le premier tir, ce qui rendrait le tir suivant trop court, les ingénieurs FRC ajoutent des disques d'inertie lourds (en acier ou laiton) sur l'axe du moteur. En augmentant artificiellement le moment d'inertie $J_{\text{shooter}}$, le ralentissement $\Delta \omega$ devient négligeable, et le moteur reprend sa vitesse nominale en une fraction de seconde !
:::

---

## 🎯 3. Physique des Projectiles & Effet Magnus

La trajectoire d'une pièce de jeu lancée en l'air est dictée par la gravité et la résistance de l'air.

### Les Équations Horaires de la Balistique
Sans air, la trajectoire d'un projectile lancé avec une vitesse initiale $v_0$ et un angle $\theta$ est une parabole parfaite :

$$x(t) = v_0 \cos(\theta) \cdot t$$
$$y(t) = -\frac{1}{2} g t^2 + v_0 \sin(\theta) \cdot t + y_0$$

### L'Effet Magnus (L'importance du Backspin)
En FRC, les projectiles (comme les disques ou balles en mousse) sont légers et très sensibles à l'aérodynamique. En faisant tourner le projectile sur lui-même lors du tir (effet de **Backspin**, c'est-à-dire une rotation arrière), on génère une force de portance vers le haut grâce à **l'effet Magnus**.

```
    Sens du tir ------->
       .-'""'-.
     .'  _/\_  '.    (Portance vers le HAUT ⬆️)
    /   / /\ \   \
   |   | /  \ |   |  <--- Rotation arrière (Backspin 🔄)
    \   \ \/ /   /
     '.  "/\"  .'
       '-....-'
```

L'effet Magnus stabilise la trajectoire dans l'air et permet un vol beaucoup plus plat et prédictible, ce qui augmente considérablement le taux de réussite de vos tirs de loin en match !

---

## 📚 Supports Supplémentaires

* 🖥️ **Slides de Présentation :** [Slides FRC Physics Essentials](https://docs.google.com/presentation/d/1IMirGYkg5m0WvAMZfOa9wDqTR74IMB_VLnsSxgjjoD8/edit)
* 📖 **NASA RAP Engineering Guide :** [NASA Robotics Design Guide](https://robotics.nasa.gov/nasa-rap-robotics-design-guide/)
