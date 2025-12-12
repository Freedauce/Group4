# Frontend Dockerfile for React + Vite (Railway compatible)
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL=https://group4-production.up.railway.app/api
ARG VITE_GOOGLE_CLIENT_ID=454188785322-ak2a8ri39rb4bv7p8om6u1s8od4qssc5.apps.googleusercontent.com

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build the application
RUN npm run build

# Production stage - use serve instead of nginx for Railway
FROM node:20-alpine AS production

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files
COPY --from=build /app/dist ./dist

# Railway uses PORT environment variable
ENV PORT=3000

# Use shell form for PORT substitution
CMD serve -s dist -l ${PORT:-3000}
