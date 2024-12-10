FROM node:22.11.0

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the application files into the container
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy app code into the container
COPY . .
