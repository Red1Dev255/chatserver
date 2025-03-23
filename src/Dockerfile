# Utilisez l'image officielle de Node.js
FROM node:22

# Créez et définissez le répertoire de travail
WORKDIR /app

# Copiez les fichiers package.json et package-lock.json dans le répertoire de travail
COPY package*.json ./

# Installez les dépendances du projet
RUN npm install

# Copiez le reste des fichiers du projet dans le conteneur
COPY . .

# Exposez le port que l'application va utiliser
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"]