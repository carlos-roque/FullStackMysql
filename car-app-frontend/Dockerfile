# Use an official Node.js runtime as the base image
FROM node:20-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json 
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app for production
RUN npm run build

# --- New stage for serving the app ---
FROM nginx:stable-alpine

# Copy the built app from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# ***IMPORTANT: Copy the custom nginx configuration***
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (default for nginx)
EXPOSE 80

# The default command for nginx is to start it (no need for CMD)

