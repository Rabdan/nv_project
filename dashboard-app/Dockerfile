FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application files
COPY . .

# Accept build arguments
ARG N8N_BASE_URL=http://localhost:5678
ARG APP_URL=http://localhost:4000
ARG NODE_ENV=production
ARG NUXT_PUBLIC_MODE=development

# Set as environment variables for build
ENV N8N_BASE_URL=$N8N_BASE_URL
ENV APP_URL=$APP_URL
ENV NODE_ENV=$NODE_ENV
ENV NUXT_PUBLIC_MODE=$NUXT_PUBLIC_MODE

# Build the application
RUN npm run build

# Runtime environment variables
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# Start the application
CMD ["node", ".output/server/index.mjs"]
