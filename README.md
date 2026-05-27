# 🤖 STAN ROBOTIX Kanban

Une application de gestion de projet Kanban collaborative, auto-hébergée et optimisée pour un déploiement sur **Raspberry Pi** ou au sein d'un réseau local (Wi-Fi de club, école, maison).

Cette application a été spécialement conçue aux couleurs du club **STAN ROBOTIX** (Rouge Crimson `#cf2737` et Bleu Navy `#1e293b`) pour offrir une expérience fluide, rapide et ultra-premium.

---

## ✨ Fonctionnalités Clés

### 📁 Hiérarchie à 3 Niveaux
Organisez vos tâches de manière structurée :
`Projets` ➔ `Dossiers` (collapsibles) ➔ `Tableaux Kanban` (ex: À faire, En cours, Revue, Terminé).
La barre latérale est entièrement dépliée par défaut à l'ouverture pour offrir une visibilité instantanée.

### 🔒 Administration & Confidentialité des Projets
*   **Console d'Administration** : Accessible uniquement aux administrateurs (`role === 'admin'`). Permet de promouvoir des membres standard, révoquer des privilèges ou supprimer des comptes définitivement.
*   **Visibilité Sélective (Projets Privés)** : Par défaut, tous les membres voient tous les projets. Les administrateurs peuvent passer un projet en **Privé** en un clic et sélectionner précisément les membres standard autorisés à y accéder via un panneau latéral dédié.
*   **Rôle Admin initial** : Le premier compte créé sur l'application hébergée est promu administrateur automatiquement.

### 📂 Glisser-Déposer & Aperçus Avancés
*   **Drag & Drop de Fichiers** : Glissez-déposez vos fichiers n'importe où sur le modal de détails d'une carte pour lancer un téléversement séquentiel en arrière-plan, accompagné d'un filtre visuel flouté en Glassmorphism.
*   **Visionneuse 3D STL Interactive** : Téléversez des fichiers STL (pièces robotiques imprimées en 3D) et visualisez-les directement dans le modal de détails avec un visualiseur WebGL 3D (Three.js) interactif (rotation, zoom orbitaux).
*   **Aperçus Médias** : Lecteurs intégrés pour les images, les vidéos, les fichiers audio et les documents PDF.

### 📑 Gestion Collaborative Complète
*   **Description enrichie** en Markdown.
*   **Listes de tâches** interactives avec barre de progression colorée.
*   **Sélecteur Automatique de Colonne** : Déplacez instantanément une carte d'une colonne à une autre directement depuis son modal de détails.
*   **Attributions multiples** avec superposition d'avatars circulaires de membres.
*   **Fils de commentaires** collaboratifs pour chaque tâche.

### 🎨 Design Premium & Réactif
*   **Mode Sombre (Dark Mode) et Mode Clair (Light Mode)** réactifs avec conservation automatique du thème.
*   **Sidebar Adaptative** : En mode clair, la barre latérale passe en blanc de haute fidélité avec texte sombre pour assurer une lisibilité absolue.
*   **Colonnes collapsibles** pour gagner de la place sur les petits écrans.

---

## 🛠️ Stack Technique

*   **Frontend** : React, Vite, Vanilla CSS (sans Tailwind pour un chargement instantané).
*   **Backend** : Node.js, Express (sert à la fois les API REST `/api` et les fichiers statiques du build React).
*   **Base de Données** : SQLite (sans configuration, fichier local unique `backend/kanban.db` avec contraintes de clés étrangères et suppressions en cascade).
*   **Sécurité** : Chiffrement des mots de passe avec `bcryptjs` (pur Javascript pour éviter les verrous de compilation binaire sur architectures ARM de Raspberry Pi) et jetons JWT.

---

## 🚀 Démarrage Rapide

### Prérequis
Avoir installé [Node.js](https://nodejs.org/) (version 18+ recommandée) sur votre machine ou Raspberry Pi.

### Installation et Lancement Automatique
1.  Clonez ou déposez le projet dans votre répertoire.
2.  Rendez le script de lancement exécutable et lancez-le :
    ```bash
    chmod +x start.sh
    ./start.sh
    ```
    Le script `start.sh` se charge automatiquement d'installer toutes les dépendances manquantes, de compiler le frontend de production React (`frontend/dist`) et de démarrer le serveur unifié.

3.  Le terminal affichera les adresses d'accès :
    ```bash
    ==================================================
    🚀 STAN ROBOTIX Kanban Server is running!
    🏠 Mode: Production
    👉 Access on local computer: http://localhost:3000
    🌐 Access on same Wi-Fi / Local Network:
       🔗 http://192.168.1.52:3000
    ==================================================
    ```
    *Toutes les personnes connectées au même réseau Wi-Fi/local peuvent y accéder en utilisant l'adresse IP affichée !*

---

## 🛡️ Déploiement Permanent sur Raspberry Pi (systemd)

Pour que l'application démarre automatiquement à chaque démarrage du Raspberry Pi en arrière-plan :

1.  Copiez le fichier de service fourni :
    ```bash
    sudo cp kanban.service /etc/systemd/system/kanban.service
    ```
2.  Éditez le fichier pour l'adapter à vos chemins locaux (remplacez l'utilisateur `User` et les dossiers par les vôtres) :
    ```bash
    sudo nano /etc/systemd/system/kanban.service
    ```
3.  Activez et démarrez le service :
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable kanban.service
    sudo systemctl start kanban.service
    ```
4.  Vérifiez le statut :
    ```bash
    sudo systemctl status kanban.service
    ```

---

## 🧪 Tests

Vous pouvez valider l'intégrité de la base de données locale à tout moment en exécutant les tests d'intégration unitaires :
```bash
node backend/test_db.js
```

---

## 👥 Auteurs
Développé avec ❤️ pour le club **STAN ROBOTIX** par **Antigravity**.
