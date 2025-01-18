# Use an official Node.js runtime as the base image
FROM node:14-alpine

# Set the working directory
WORKDIR ./src

# Copy package.json and package-lock.json
COPY package*.json ./
COPY . .

# Install app dependencies
RUN npm install

# Copy app source code


# Build the app
RUN npm run build

# Expose port 3000 to the outside world
EXPOSE 3002

# Command to run the React app
CMD ["npm", "start"]


######
# Use a smaller image for production
#FROM nginx:alpine

# Copy built app from the build image
#COPY --from=build /app/build /usr/share/nginx/html

# Expose port
#EXPOSE 80

# Start Nginx server
#CMD ["nginx", "-g", "daemon off;"]
