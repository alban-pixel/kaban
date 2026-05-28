# G1.1 - Science des Matériaux et Ingénierie FRC

Choisir le bon matériau pour chaque mécanisme est une compétence clé en ingénierie. Un robot FRC subit de violentes collisions mécaniques à plus de 20 km/h. Utiliser un matériau inadapté (comme de l'acier trop lourd ou de l'acrylique fragile) peut condamner votre robot ou le rendre trop lent.

---

## 🔩 1. Les Métaux Structurels : L'Aluminium

L'aluminium est le roi de la FRC. Il offre un excellent compromis entre légèreté (densité $\approx 2.7\text{ g/cm}^3$, soit 3 fois moins que l'acier) et robustesse. Cependant, deux alliages dominent nos conceptions :

### L'Aluminium 6061-T6 (L'alliage polyvalent)
C'est le standard utilisé pour 90% des composants de robots (profilés en tube carré de 1"x1" ou 2"x1", goussets de fixation).
* **Propriétés** : Très facile à usiner, facile à percer et à découper, excellente soudabilité, coût abordable.
* **Résistance à la traction** : $\approx 310\text{ MPa}$.

### L'Aluminium 7075-T6 (L'alliage aéronautique)
À réserver exclusivement aux pièces subissant des contraintes mécaniques extrêmes et répétées.
* **Propriétés** : Résistance mécanique équivalente à certains aciers, mais extrêmement dur et difficile à plier ou usiner. Il est plus sujet à la corrosion et ne peut pas être soudé facilement.
* **Résistance à la traction** : $\approx 570\text{ MPa}$ (soit presque **le double** du 6061-T6 !).
* **Usage type** : Arbres de transmission hexagonaux de roues Swerve, engrenages de réduction primaires à fort impact, axes de pivot de bras lourd.

---

## 🛡️ 2. Les Plastiques d'Impact : Le Polycarbonate (Lexan)

Le **polycarbonate** (souvent appelé sous son nom commercial *Lexan*) est un polymère transparent aux propriétés mécaniques exceptionnelles sous contrainte de choc.

> [!WARNING]
> **Proscription totale de l'Acrylique (Plexiglas) !**
> L'acrylique éclate en morceaux extrêmement coupants (comme du verre) sous l'impact d'une collision de robot. **Son usage est strictement interdit en compétition FRC pour des raisons de sécurité absolue.** Utilisez exclusivement du Polycarbonate.

### Propriétés Exceptionnelles du Polycarbonate
Le polycarbonate possède une **ténacité à l'impact** incroyable. Sous un choc violent, il fléchit et se déforme élastiquement (il absorbe l'énergie) puis reprend sa forme initiale sans casser.

### Pourquoi faire des Intakes en Polycarbonate de $1/4\text{"}$ ?
L'Intake (le ramasseur) est situé en dehors du périmètre de protection des pare-chocs. Il est le premier exposé aux collisions frontales avec les robots adverses.
* Si l'Intake est construit en tubes d'aluminium rigides, un choc frontal violent pliera l'aluminium de façon permanente (déformation plastique), rendant l'Intake inutilisable pour le reste de la compétition.
* Si l'Intake est construit en plaques épaisses de Polycarbonate de $1/4\text{ pouce}$ ($6\text{ mm}$), les plaques vont fléchir jusqu'à $90^\circ$ lors de l'impact, puis revenir instantanément à leur forme parfaite dès que la contrainte s'arrête. **Le mécanisme est virtuellement indestructible !**

---

## 🛷 3. Les Plastiques de Glissement : L'Acétal (Delrin)

Pour les pièces en contact glissant (comme les patins d'un élévateur ou des bagues de friction), nous utilisons le **Polyoxyméthylène (POM)**, connu sous son nom commercial **Delrin** ou **Acétal**.

### Pourquoi utiliser le Delrin ?
* **Autolubrification** : Le Delrin possède un coefficient de frottement extrêmement faible sur lui-même ou sur l'aluminium ($\mu \approx 0.2$). Il glisse de façon fluide sans nécessiter de graisse ou d'huile de lubrification qui attirerait la poussière et les débris du terrain de jeu.
* **Stabilité dimensionnelle** : Contrairement au Nylon, le Delrin n'absorbe pas l'humidité de l'air. Il ne gonfle pas et conserve ses dimensions géométriques exactes au centième de millimètre.
* **Usinage** : Il s'usine aussi facilement que du bois dur et donne un fini de surface très lisse.

---

## 📚 Supports Supplémentaires

* 🖥️ **Slides de Présentation :** [Slides FRC Materials & Prototyping](https://docs.google.com/presentation/d/e/2PACX-1vRaIkRvKioVmcl1P6vpddYPYC43QjaxsRZu6qavmp3lNpBcQ0noBf91Pv4N8DwSDgcxdfG2IoPqTNs7/pub?start=false&loop=false&delayms=3000)
* 📖 **Spectrum 3847 Design Guide :** [Spectrum Material Inexpensive Tips](https://www.spectrum3847.org/resources/inexpensive-build-tips)
