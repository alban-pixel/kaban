# H1.3 - Impression 3D pour la FRC

L'impression 3D n'est plus seulement réservée au prototypage rapide. Aujourd'hui, des pièces imprimées en 3D sont montées directement sur les robots de compétition FRC et subissent des chocs d'une violence inouïe. La réussite repose sur deux facteurs clés : **la sélection du bon matériau** et **l'optimisation des paramètres d'impression (slicing)**.

---

## 🧪 Le Choix des Matériaux : Quel Filament Choisir ?

Tous les plastiques ne se valent pas en termes de résistance mécanique, de rigidité et de résistance à l'impact :

| Matériau | Rigidité | Résistance Impact | Facilité d'impression | Usage type FRC |
| :--- | :--- | :--- | :--- | :--- |
| **PLA** | Très élevée | Faible (Casse net) | Très facile | Prototypes rapides, supports de capteurs, boîtiers |
| **PETG** | Moyenne | Excellente | Facile | Supports d'intake exposés, poulies synchrones légères |
| **ABS / ASA** | Élevée | Élevée | Moyenne (Nécessite enceinte) | Pièces structurelles rigides légères |
| **Nylon (PA6/PA12)** | Faible (Flexible) | Exceptionnelle | Difficile (Hydrophile) | Pièces subissant de fortes torsions ou collisions |
| **Onyx (Nylon + Carbone)** | Exceptionnelle | Exceptionnelle | Réservé aux imprimantes pro | Engrenages sur mesure, supports moteurs structurels |

---

## ⚙️ Paramètres de Découpe (Slicing) pour la Résistance

Imprimer une pièce solide ne signifie pas l'imprimer à 100% de remplissage (infill). C'est le **nombre de parois (perimeters/walls)** qui confère la rigidité structurelle à un objet imprimé.

:::tip
**Recommandation de tranchage FRC pour pièces soumises à contraintes :**
1. **Nombre de parois (Wall Loops / Perimeters)** : **4 à 6 parois minimum** (au lieu de 2 par défaut). C'est le paramètre le plus important !
2. **Couches supérieures/inférieures (Top/Bottom Layers)** : **5 à 6 couches**.
3. **Remplissage (Infill)** : **35% à 50%** avec un motif tridimensionnel comme **Gyroid** ou **Grid** (évitez le motif rectiligne 2D qui n'offre aucune résistance sur l'axe Z).
:::

---

## 📐 Règles de Conception CAO pour l'Impression 3D

Lorsque vous concevez une pièce sur Onshape destinée à être imprimée :

* **Éviter les angles vifs** : Ajoutez systématiquement des **congés (fillets)** généreux dans les coins intérieurs pour répartir les contraintes mécaniques et éviter que la pièce ne se délamine au premier choc.
* **Respecter le sens des couches (Anisotropie)** : Une pièce imprimée en 3D est toujours plus fragile le long de l'axe Z (adhérence entre couches). Orientez votre modèle dans Onshape et dans votre slicer de manière à ce que les forces de cisaillement ou d'arrachement s'exercent perpendiculairement à l'axe Z (dans le plan X-Y).
* **Diamètre des trous** : La matière plastique chaude a tendance à se rétracter légèrement en refroidissant. Dessinez toujours vos trous de vis de CAO avec un jeu supplémentaire d'environ **$0.2\text{ }mm$** à **$0.4\text{ }mm$** (ex. pour une vis M4 de 4.0 mm, dessinez un trou de 4.3 mm sur Onshape).

---

## 📚 Supports Supplémentaires

* 🖥️ **Slides de Présentation :** [Slides B2.5 - FRC 3D Printed Parts](https://docs.google.com/presentation/d/1w-zGo9hEuVamzVrmhK3MJni0aftu0k9ZUnMRb93MIrI/edit#slide=id.p)
* 📖 **Guide de fabrication Spectrum :** [Spectrum Inexpensive Build Tips](https://www.spectrum3847.org/resources/inexpensive-build-tips)
