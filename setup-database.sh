#!/bin/bash

# Database Setup Script for Meyden Platform
# Run this script after setting up your free database

echo "🗄️  Database Setup for Meyden Platform"
echo "======================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "Please set it first:"
    echo "export DATABASE_URL='mysql://username:password@host/database'"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL is set: $DATABASE_URL"
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🔧 Running database migrations..."
npx prisma migrate deploy

# Seed database (optional)
echo "🔧 Seeding database with initial data..."
npx prisma db seed

# Verify connection
echo "🔧 Testing database connection..."
npx prisma db pull

echo ""
echo "✅ Database setup completed successfully!"
echo ""
echo "📊 You can now check your database with:"
echo "npx prisma studio"
echo ""
echo "🌐 Your backend is ready for deployment!"