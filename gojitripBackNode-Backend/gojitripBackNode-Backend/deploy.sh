#!/bin/bash
set -e

echo "🚀 Starting Deployment..."

# Pull latest code
echo "📦 Pulling latest changes from Git..."
git pull origin main

# Install production dependencies
echo "📥 Installing dependencies..."
npm ci

# Generate Prisma Client
echo "⚙️ Generating Prisma Client..."
npx prisma generate

# Run Prisma Database Migrations
echo "🗄️ Running Prisma Database Migrations..."
npx prisma migrate deploy

# Build NestJS Project
echo "🔨 Building NestJS application..."
npm run build

# Restart PM2 Process
echo "🔄 Restarting PM2 process..."
pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production

echo "✅ Deployment completed successfully!"
