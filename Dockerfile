# Use official Node.js base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose a port for Heroku/Render
EXPOSE 3000

# Start the bot
CMD [ "npm", "start" ]
