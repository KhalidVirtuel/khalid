FROM node:20-alpine

WORKDIR /app

# Install dependencies for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY src ./src

# Copy scripts
COPY scripts ./scripts

# Build TypeScript
RUN npm run build

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 8787

# Start server
CMD ["npm", "start"]
