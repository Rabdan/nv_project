FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean cache
RUN npm ci --only=production --ignore-scripts || npm install --legacy-peer-deps

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

# Start the application
CMD ["node", ".output/server/index.mjs"]
