# Use official lightweight Node.js 20 image
FROM node:20-alpine

# Set production environment
ENV NODE_ENV=production

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package definition files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the server source files
COPY . .

# Expose port (Google Cloud Run dynamically sets the PORT environment variable)
EXPOSE 8080

# Command to start your Express WebSocket server
CMD [ "node", "index.js" ]
