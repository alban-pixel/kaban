# S1.1 - Maintenance et Diagnostic en Compétition

En compétition FRC, la pression est extrême. L'équipe ne dispose parfois que de 10 à 15 minutes entre deux matches pour réparer un mécanisme cassé, diagnostiquer un problème d'électronique ou recalibrer des capteurs. La mise en place d'un protocole rigoureux de **Triage et Diagnostic** est indispensable.

---

## 📋 La Checklist Pré-Match (Pre-Match Checklist)

Avant que le robot ne quitte les stands (Pit Area) pour rejoindre la file d'attente du terrain (Queue Area), le Technicien de Stand (Pit Crew) doit cocher cette checklist :

1. **Batterie sécurisée** : La batterie de 12V doit être solidement sanglée. Une batterie qui se détache et se balade dans le robot peut arracher des fils majeurs ou écraser la roboRIO.
2. **Pression d'air** : Si le robot utilise des actionneurs pneumatiques, vérifiez que le compresseur monte bien à 120 PSI et qu'aucune fuite d'air audible n'est présente.
3. **Serrage mécanique** : Vérifiez le serrage des vis critiques (moteurs Swerve, arbres de transmission). Les vis soumises à fortes vibrations doivent impérativement être enduites de **frein filet (Loctite bleu)** ou serrées avec des écrous Nyloc (écrous autofreinés).
4. **Vérification du réseau CAN** : S'assurer que toutes les LEDs de statut des Spark Max / Talon FX clignotent en vert ou orange régulier (ce qui indique une liaison de communication saine).

---

## 🌡️ Diagnostics Thermiques & Électriques rapides

### 1. Le Test de Température (Thermal Inspection)
Dès que le robot revient d'un match intense :
* Touchez prudemment chaque moteur à la main (ou utilisez un thermomètre infrarouge portatif). 
* **Seuil critique** : Un moteur brushless à plus de **$60^\circ\text{C}$** est en surchauffe sévère. Cela traduit généralement un point dur mécanique (friction anormale), un mauvais rapport de démultiplication (moteur surchargé) ou un code PID mal calibré qui oscille en permanence.

### 2. Résolution des Pannes CAN Bus (CAN Bus Triage)
Si l'application du robot indique que des moteurs sont "manquants" ou si la roboRIO perd complètement la liaison CAN :

:::important
**Méthode de recherche de panne par dichotomie (CAN Debugging) :**
1. Repérez si une seule LED de contrôleur clignote en **Rouge rapide** (indiquant qu'il reçoit du courant mais ne détecte plus le signal de communication).
2. Vérifiez le connecteur de communication immédiatement en amont de ce contrôleur. 95% des pannes CAN proviennent d'une cosse mal sertie ou d'un connecteur déconnecté lors d'un choc violent.
3. Utilisez la résistance de terminaison de la PDH : mesurez la résistance entre les bornes CAN High et CAN Low à l'aide d'un multimètre au repos. Elle doit être d'exactement **60 Ohms** (deux résistances de 120 Ohms câblées en parallèle à chaque extrémité du bus). Si vous lisez 120 Ohms, la ligne est coupée en deux !
:::

---

## 🛠️ Le Triage Express sous Pression

Si un incident mécanique grave survient (ex. un bras tordu ou un moteur d'Intake brûlé) et qu'il ne reste que 5 minutes avant le match suivant :

* **Règle 1 : La simplicité d'abord** : S'il est impossible de réparer le mécanisme complexe à temps, désactivez-le mécaniquement (ex. retirez la pièce mobile cassée et fixez le reste du bras solidement avec des colliers de serrage robustes).
* **Règle 2 : Le Châssis est roi** : Un robot FRC qui ne fait rien d'autre que de rouler et de défendre peut faire gagner une alliance. Un robot FRC dont les moteurs de tir fonctionnent mais qui est immobilisé au milieu du terrain est inutile. Concentrez 100% de vos efforts restants sur la fiabilisation du châssis.

---

## 📚 Supports Supplémentaires

* 🖥️ **Slides de Présentation :** [Slides B3.1 - Maintenance & Triage](https://docs.google.com/presentation/d/1m0f9urPvA5mDsYUIbJfKmZDw2Bal5va4vqTf4cG_kvM/edit#slide=id.p)
* 🎥 **Tutoriel de maintenance en vidéo :** [Maintenance and Triage Video on YouTube](https://www.youtube.com/watch?v=TsYSL9athTk)
