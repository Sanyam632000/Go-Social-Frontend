# Use an official Node.js runtime as the base image
FROM node:14 as build

# Set the working directory
WORKDIR ./src

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source code
COPY . .

# Build the app
RUN npm run build

# Use a smaller image for production
FROM nginx:alpine

# Copy built app from the build image
COPY --from=build /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
