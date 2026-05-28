# P1.0 - Mise à Niveau : Mathématiques & Physique pour la FRC

Bienvenue dans l'équipe STAN ROBOTIX ! Si tu as 13 ou 14 ans (en classe de 5e, 4e ou 3e) et que tu viens de rejoindre l'équipe, rassure-toi : **tu as tout à fait ta place ici**. 

En lisant nos cours avancés, tu as dû croiser des mots étranges comme *trigonométrie*, *vecteurs*, *filtre de Kalman*, ou *calculs de couple*. C'est tout à fait normal si tu ne les as pas encore appris à l'école. Ce cours de mise à niveau est conçu spécialement pour toi, pour t'expliquer ces concepts de manière ultra-simple, visuelle et amusante, en utilisant des analogies concrètes (jeux vidéo, LEGO, vélo).

---

## 📐 1. La Trigonométrie Facile : Les Secrets des Triangles (SOH CAH TOA)

La trigonométrie sert à calculer des distances ou des angles en observant des triangles rectangles (des triangles qui ont un angle droit à $90^\circ$, comme le coin d'une feuille de papier).

```
                  /|
                 / |
  HYPOTÉNUSE    /  |  CÔTÉ OPPOSÉ
    (Le plus   /   |  (En face de l'angle)
     long)    /    |
             / Angle θ
            +------+
         CÔTÉ ADJACENT (À côté de l'angle)
```

### Le Moyen Mémo-Technique : SOH CAH TOA
Pour retrouver facilement les formules mathématiques magiques, retiens ce drôle de mot : **SOH CAH TOA** (prononce-le comme *"Soka-Toa"*).

* **SOH** : $\sin(\theta) = \frac{\text{Opposé}}{\text{Hypoténuse}}$ ($\text{Sinus} = \text{Opposé} / \text{Hypoténuse}$)
* **CAH** : $\cos(\theta) = \frac{\text{Adjacent}}{\text{Hypoténuse}}$ ($\text{Cosinus} = \text{Adjacent} / \text{Hypoténuse}$)
* **TOA** : $\tan(\theta) = \frac{\text{Opposé}}{\text{Adjacent}}$ ($\text{Tangente} = \text{Opposé} / \text{Adjacent}$)

### À quoi ça sert sur le robot ?
* **Exemple 1 : L'angle de tir du Shooter** : Si on connaît la distance horizontale jusqu'au panier (Adjacent) et la hauteur du panier (Opposé), on utilise la **Tangente** pour calculer l'angle exact d'inclinaison ($\theta$) du Shooter pour marquer à tous les coups !
* **Exemple 2 : Le pilotage Swerve** : Lorsque tu pousses le joystick de ta manette vers le haut de $3\text{ cm}$ (axe $Y$) et vers la droite de $4\text{ cm}$ (axe $X$), l'ordinateur du robot utilise une fonction trigonométrique appelée **l'Arctangente (`atan2(Y, X)`)** pour calculer l'angle exact auquel la roue Swerve doit tourner pour se diriger dans cette direction (ici, environ $37^\circ$).

---

## 🏹 2. Les Vecteurs : Les Flèches qui Dirigent le Robot

Dans les jeux vidéo ou en robotique, pour décrire le déplacement d'un objet, donner une simple vitesse (ex : le robot va à $4\text{ m/s}$) ne suffit pas. Il faut aussi dire **dans quelle direction** il se dirige. Pour cela, on utilise un **Vecteur**.

:::tip Qu'est-ce qu'un vecteur ?
Un **Vecteur** est une simple flèche imaginaire caractérisée par :
1. **Une direction** : l'inclinaison de la flèche.
2. **Une force / longueur (Norme)** : la vitesse du déplacement ou la force de la poussée.
:::

```
    Aiguillage de deux forces (Addition Vectorielle) :
    
                  ^ Vecteur A (Ta poussée vers le Nord)
                  |
                  |          /  Vecteur Résultat (Le carton va vers le Nord-Est !)
                  |        /
                  |      /
                  |    /
                  |  /
                  +-------------------------> Vecteur B (Poussée de ton ami vers l'Est)
```

### L'Addition de Vecteurs : L'effet coopératif
Imagine que tu pousses un carton lourd vers le Nord avec une force de $10\text{ Newtons}$ (Vecteur A). En même temps, ton ami pousse le même carton vers l'Est avec une force de $10\text{ Newtons}$ (Vecteur B). 
Le carton ne va aller ni seulement au Nord, ni seulement à l'Est : il va se déplacer en diagonale vers le **Nord-Est** avec une force combinée ! C'est ce qu'on appelle **l'addition vectorielle**.

### L'application sur le Châssis Swerve
C'est exactement ainsi que fonctionne notre châssis de propulsion Swerve :
* Si tu demandes au robot d'avancer tout en tournant sur lui-même, l'ordinateur calcule pour chaque roue le vecteur de déplacement linéaire (la flèche pour aller tout droit) et lui additionne le vecteur de rotation (la flèche pour tourner). 
* La somme de ces flèches donne la direction et la vitesse réelles à appliquer à chacun des 4 moteurs de roues !

---

## 🚪 3. Le Couple (Torque) : Le Principe du Bras de Levier

Tu as déjà utilisé le concept de couple physique sans le savoir en ouvrant une porte !

```
                 Pousser ICI est TRÈS DIFFICILE (Bras de levier court)
                       |
                       v
     [ Axe Pivot ]=====================================[ Poignée ]
                                                            ^
                                                            |
                                             Pousser ICI est TRÈS FACILE !
                                             (Bras de levier long)
```

* Si tu essaies d'ouvrir une porte en poussant tout près de la charnière (le pivot), c'est extrêmement difficile et tu dois forcer comme un géant.
* Si tu pousses au niveau de la poignée (le point le plus éloigné du pivot), la porte s'ouvre sans aucun effort.

C'est le **Principe du Bras de Levier**. Le **Couple ($T$)** est la force de rotation exercée sur un axe. Il se calcule par la multiplication de la force appliquée ($F$) et de la distance par rapport à l'axe ($d$) :

$$
\text{Couple } (T) = \text{Force } (F) \times \text{Distance } (d)
$$

### Pourquoi c'est très important sur le robot ?
Imagine que nous construisions un long bras articulé en aluminium de $1\text{ mètre}$ pour attraper des pièces de jeu au sol :
* Si le bras attrape une pièce lourde au bout de son mètre de longueur, le couple exercé sur le moteur au niveau de l'épaule est gigantesque. 
* Si le bras ne mesurait que $20\text{ cm}$ (soit 5 fois moins long), le moteur fournirait 5 fois moins d'effort !
* **Conséquence pour la CAO** : Pour soulever ce long bras de $1\text{ mètre}$, nous devons installer une boîte de vitesses avec un très grand rapport de réduction (ex: $100:1$) pour aider le moteur, sinon le bras s'effondrera ou le moteur brûlera.

---

## 📐 4. Les Unités Impériales vs Métriques : Parler deux langues

La FRC est une compétition d'origine américaine. De ce fait, tous les fournisseurs officiels de pièces de robots (WCP, Rev Robotics, McMaster-Carr) conçoivent leurs composants en utilisant le **Système Impérial américain (pouces, pieds, livres)**, alors qu'en Europe et au Canada, nous utilisons le **Système Métrique (millimètres, mètres, kilogrammes)**.

Pour ne pas commettre d'erreur d'assemblage en dessinant ton robot sur Onshape, tu dois connaître les équivalences clés :

* **Le Pouce (Inch - noté `in` ou `"` )** :
  
$$
1\text{ in} = 25.4\text{ mm} = 2.54\text{ cm}
$$

  * *Repère visuel* : La largeur de ton pouce fait environ $1\text{ pouce}$.
  * *Standard FRC* : La plupart de nos axes font $1/2\text{"}$ (soit $12.7\text{ mm}$ de diamètre).

* **Le Pied (Foot - noté `ft` ou `'` )** :
  
$$
1\text{ ft} = 12\text{ inches} \approx 30.5\text{ cm}
$$

  * *Repère visuel* : Une grande règle d'école en plastique mesure $1\text{ pied}$.

* **La Livre (Pound - notée `lbs` )** :
  
$$
1\text{ lb} \approx 454\text{ grammes} \approx 0.45\text{ kg}
$$

  * *Standard FRC* : Le règlement officiel limite le poids maximal du robot à **$125\text{ lbs}$** (hors batterie et bumpers), ce qui correspond à un poids limite d'exactement **$56.7\text{ kg}$**.

:::tip Astuce sur Onshape
Tu n'as pas besoin de faire les calculs de conversion dans ta tête ou sur une calculatrice lorsque tu dessines ! 
Sur Onshape, tu peux saisir directement tes cotes avec les unités de ton choix. Si le document est configuré en millimètres, tu peux tout de même taper `0.5 in` dans une esquisse, et Onshape convertira automatiquement la valeur à `12.7 mm` !
:::

---

## 📚 Supports Supplémentaires

* 💻 **Khan Academy Jeunesse :** [Introduction intuitive à la Trigonométrie](https://fr.khanacademy.org/)
* 📖 **WPILib FRC Young Engineers :** [Basics of mechanical physics for robot builders](https://docs.wpilib.org/)
* 🎬 **Crash Course Physics :** [Vectors and Torque explained on Youtube](https://www.youtube.com/)
