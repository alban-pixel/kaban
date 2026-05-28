# M1.2 - Engrenages, Réductions et Moteurs

Comprendre comment concevoir un rapport de réduction mécanique adapté est l'un des piliers de la conception d'un robot FRC. Les moteurs brushless tournent extrêmement vite (plus de 5000 RPM) mais n'ont pas assez de couple pour déplacer directement le poids d'un robot de 56 kg. Nous devons utiliser des **boîtes de vitesses (gearboxes)** pour réduire la vitesse et démultiplier le couple.

:::info
**Règle d'or de la mécanique :**
$$\text{Puissance (W)} = \text{Couple (N.m)} \times \text{Vitesse angulaire (rad/s)}$$
À puissance moteur constante, si on divise la vitesse par un facteur $N$, on multiplie le couple par ce même facteur $N$ (aux pertes de friction près).
:::

---

## ⚡ Les Moteurs Brushless de Référence en FRC

Depuis l'avènement de la technologie brushless, la FRC utilise principalement trois moteurs :

| Spécification (Valeurs crêtes) | REV NEO | REV NEO 550 | WCP Kraken X60 |
| :--- | :--- | :--- | :--- |
| **Vitesse à vide (Free Speed)** | 5676 RPM | 11000 RPM | 6000 RPM |
| **Couple max théorique** | 3.36 N.m | 0.97 N.m | 9.37 N.m |
| **Constante Kt réelle (à 40A)** | $0.075\text{ N.m/A}$ | $0.024\text{ N.m/A}$ | $0.095\text{ N.m/A}$ |
| **Poids** | 425 g | 110 g | 540 g |
| **Usage recommandé** | Traction, Intakes robustes, Bras pivotants | Intakes légères, Indexeurs de projectiles | Châssis Swerve, Shooters haute vitesse, Grimpeurs |

---

## 📈 La Limite Critique des 40 Ampères en FRC

Dans les fiches techniques des fabricants (WCP, REV), vous verrez souvent des valeurs de couple théoriques massives (comme $9.37\text{ N.m}$ de couple de blocage pour le Kraken X60). 

> [!WARNING]
> **Ces valeurs théoriques maximales ne sont jamais atteignables en match réel !**
> Les disjoncteurs physiques de la carte de puissance (PDP/PDH) coupent au-delà de 40A (disjoncteurs thermiques Snap Action). De plus, pour préserver la batterie de 12V et éviter que sa tension ne s'effondre sous les 8V (ce qui provoquerait un redémarrage de la roboRIO), les programmeurs configurent systématiquement des **limites logicielles d'intensité (Current Limits)** fixées par défaut à **40 A**.

### Couple réel sous bride de 40A
À **40 A**, la réponse magnétique du moteur est quasi linéaire et dictée par sa constante de couple réelle $K_t$ :
* **NEO Brushless** : Couple de calage max réel bridé à $\approx 3.00\text{ N.m}$ (soit $0.075\text{ N.m/A} \times 40\text{ A}$).
* **Kraken X60** : Couple de calage max réel bridé à $\approx 3.80\text{ N.m}$ (soit $0.095\text{ N.m/A} \times 40\text{ A}$).

---

## ⚙️ Calculer le Rapport d'Engrenages (Gear Ratio)

Le rapport d'engrenage global est la démultiplication totale entre le moteur et l'axe final :

$$\text{Ratio} (R) = \frac{\text{Nombre de dents de l'engrenage MENÉ (Driven)}}{\text{Nombre de dents de l'engrenage MENANT (Driving)}}$$

Si vous empilez plusieurs étapes d'engrenages :
$$R_{\text{total}} = R_1 \times R_2 \times R_3$$

### Exemple de Calcul complet (Module Swerve)
Un module Swerve utilise un moteur Kraken X60 limité à 40A de courant avec un rapport de réduction de **$6.12:1$** (c'est-à-dire que le moteur doit tourner 6.12 fois pour que la roue fasse un tour complet).
1. **Vitesse finale de la roue à vide** : 
   $$\text{Vitesse final} = \frac{6000\text{ RPM}}{6.12} \approx 980\text{ RPM}$$
2. **Couple final de la roue au blocage (bridé à 40A)** :
   $$\text{Couple final} = 3.80\text{ N.m} \times 6.12 \times \eta \approx 20.9\text{ N.m}$$
   *(Où $\eta = 0.90$ représente le rendement d'efficacité mécanique estimé à 90%)*

---

## 📊 Matrice d'Évaluation de Compatibilité Mécanique

Pour simplifier vos calculs, vous pouvez utiliser les recommandations d'ingénierie FRC suivantes pour l'accouplement des réducteurs :

* **Rapport 5:1 à 8:1 (Vitesse très élevée)** : Recommandé pour les **Shooters (Lancer)** ou les **Châssis rapides** (Kraken/NEO). Totalement sous-dimensionné pour soulever un bras ou grimper.
* **Rapport 10:1 à 25:1 (Vitesse moyenne, couple modéré)** : Parfait pour les **Intakes (Ramasseurs)** ou les convoyeurs.
* **Rapport 60:1 à 100:1 (Vitesse lente, couple massif)** : Nécessaire pour les **Bras pivotants articulés** ou les **Élévateurs à cordes** pour grimper (Climbers) afin d'éviter le décrochage électrique et l'échauffement des moteurs.

---

## 📚 Supports Supplémentaires

* 💻 **Outil Interactif de Calcul de rapports (Kaban) :** Allez dans l'onglet **Ressources** en bas à gauche de cette application !
* 🖥️ **Slides de Présentation :** [Slides M1.2 - Propulsion & Moteurs FRC](https://docs.google.com/presentation/d/e/2PACX-1vTdfp9zJ1EUZ9ZIVI4uMivg0x7GLsNbDQgdk2IbwGThiw0M_uOVyH3kKjSVdJiKPYryoEmLRMVlAKAz/pub?start=false&loop=false&delayms=3000)
* 📖 **ReCalc - Outil de calcul de transmission FRC de référence :** [ReCalc Web tool](https://recalc.apetech.co/)
