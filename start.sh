#!/bin/bash

# STAN ROBOTIX Kanban Server Launcher
# Optimisé pour Raspberry Pi et réseaux locaux

echo "=================================================="
echo "🤖 STAN ROBOTIX - Kanban Launch System"
echo "=================================================="

# Check if node is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer avant de lancer le serveur."
    exit 1
fi

# Determine project directories
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Install backend dependencies if missing
if [ ! -d "$PROJECT_DIR/backend/node_modules" ]; then
    echo "📦 Installation des dépendances du backend..."
    cd "$PROJECT_DIR/backend" && npm install
fi

# Install frontend dependencies if missing
if [ ! -d "$PROJECT_DIR/frontend/node_modules" ]; then
    echo "📦 Installation des dépendances du frontend..."
    cd "$PROJECT_DIR/frontend" && npm install
fi

# Install root dependencies if missing
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo "📦 Installation des dépendances racine..."
    cd "$PROJECT_DIR" && npm install
fi

# Build frontend if build is missing or requested
if [ ! -d "$PROJECT_DIR/frontend/dist" ] || [ "$1" == "--rebuild" ]; then
    echo "🏗️  Compilation de l'application React..."
    cd "$PROJECT_DIR/frontend" && npm run build
fi

# Start the unified backend production server
echo "🚀 Démarrage du serveur Kanban..."
cd "$PROJECT_DIR" && npm start
