# M1.1 - Modélisation 3D (CAD) avec Onshape

Dans la robotique FRC moderne, la **CAO (Conception Assistée par Ordinateur)** est la première étape indispensable avant d'usiner la moindre pièce. Concevoir en 3D permet de vérifier les interférences, de simuler la distribution du poids, et de s'assurer que les rapports d'engrenages et courroies s'ajustent au dixième de millimètre.

:::tip
**Onshape** est l'outil de CAO de référence pour les équipes FRC. Il fonctionne entièrement dans le cloud, ce qui permet à plusieurs étudiants de travailler sur le même assemblage de robot en temps réel, un peu comme Google Docs.
:::

---

## 🚀 Commencer avec Onshape

Pour débuter avec Onshape, chaque membre de l'équipe doit créer un compte étudiant gratuit :
* **Lien direct** : [Onshape Fundamentals for CAD](https://learn.onshape.com/collections/onshape-fundamentals-cad)

### Les Concepts Clés de Onshape
1. **Document** : Contient tous les onglets de conception (Part Studios, Assemblies, Drawings, PDF joints).
2. **Part Studio** : L'environnement 3D où l'on dessine les pièces individuelles en utilisant des esquisses 2D (Sketches) extrudées.
3. **Assembly (Assemblage)** : L'espace où l'on assemble les pièces individuelles créées ou importées à l'aide de liaisons mécaniques (Mates).

---

## 📐 Bonnes Pratiques de Dessin en 2D (Sketching)

Toute pièce 3D commence par une esquisse 2D. Voici les règles pour un modèle robuste et modifiable :

* **Toujours contraindre complètement (Fully Constrained)** : Une esquisse contrainte passe du **bleu** au **noir**. Si une ligne est bleue, elle peut bouger accidentellement si quelqu'un étire le modèle.
* **Définir l'origine** : Ancrez toujours votre esquisse principale à l'origine $(0,0,0)$ de Onshape.
* **Utiliser des équations ou variables** : Pour des dimensions répétées (comme le diamètre des trous de rivets de 5/32" ou les profilés en aluminium de 1" ou 2"), définissez des variables (ex. `#rivet_diam = 0.16in`).

---

## 🔩 Utilisation de la Bibliothèque FRC : MKCad

Ne redessinez jamais un moteur, un roulement ou un engrenage ! La communauté FRC maintient une bibliothèque Onshape officielle extrêmement riche appelée **MKCad**.

:::info
**MKCad** est une extension (App) intégrable directement dans Onshape. Elle vous permet d'insérer en un clic des modèles 3D exacts de :
* Moteurs (Kraken X60, NEO, NEO 550).
* Réducteurs complets (MAXSwerve, Toughbox, VersaPlanetary).
* Composants de transmission (engrenages, poulies, pignons, courroies, chaînes).
* Roulements (1/2" hex, 3/8" round, etc.) et visserie complète.
:::

### Comment utiliser MKCad ?
1. Cliquez sur le bouton "Ajouter des applications" dans Onshape.
2. Recherchez **MKCad** et autorisez l'accès.
3. Ouvrez un onglet **Assembly**, ouvrez le volet de droite MKCad, sélectionnez le moteur ou le pignon voulu, et il s'insère instantanément à l'échelle parfaite avec ses caractéristiques physiques réelles (matière, masse).

---

## 🔗 Techniques d'Assemblage Avancées

Pour assembler des mécanismes FRC complexes comme un module de roue Swerve ou un élévateur :

* **Fastened Mate** : Liaison rigide totale (aucun mouvement). À utiliser pour fixer des profilés ensemble ou bloquer des vis.
* **Revolute Mate** : Liaison pivot (rotation sur un axe). Idéal pour modéliser des arbres de transmission en rotation, des engrenages ou des volants d'inertie de shooters.
* **Slider Mate** : Liaison glissière (translation linéaire). Parfait pour tester le déploiement d'un ascenseur ou d'une extension.
* **Group** : Regroupez les pièces fixes importées ensemble pour éviter que Onshape ne surcharge ses calculs avec des centaines de liaisons inutiles.

:::warning
**Attention au poids du modèle 3D !**
Un robot trop lourd (limite stricte à 56,7 kg ou 125 lbs) ne passera pas l'inspection. Utilisez la fonctionnalité de mesure de masse de Onshape (icône de balance en bas à droite) en attribuant le bon matériau (généralement Aluminium 6061-T6 ou plastique d'impression 3D PETG/PLA) à chaque pièce dessinée pour surveiller en temps réel le devis de masse.
:::

---

## 📚 Supports Supplémentaires

* 💻 **Onshape Learning Pathways :** [Onshape Education Course](https://learn.onshape.com/collections/onshape-fundamentals-cad)
* 📖 **Spectrum 3847 Design Library :** [Spectrum Design Hub](http://design.spectrum3847.org/)
* 🎥 **Onshape Tutorial for FRC Teams :** [FRC CAD Tutorial on YouTube](https://www.youtube.com/watch?v=K0oyG6LqFpY)
