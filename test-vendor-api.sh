#!/bin/bash

# Vendor API Testing Script
# This script tests all vendor endpoints

BASE_URL="http://localhost:3002/api/v1"

echo "=========================================="
echo "Testing Meyden Vendor API"
echo "=========================================="
echo ""

# Test 1: List all vendors
echo "1️⃣  Testing: GET /vendors (list all active vendors)"
echo "------------------------------------------"
curl -s "${BASE_URL}/vendors" | jq '{
  totalVendors: .vendors | length,
  vendors: .vendors | map({companyName, city, country, rating: .averageRating})
}'
echo ""

# Test 2: Search vendors by city
echo "2️⃣  Testing: GET /vendors?city=Dubai"
echo "------------------------------------------"
curl -s "${BASE_URL}/vendors?city=Dubai" | jq '.vendors[] | {companyName, city, rating: .averageRating}'
echo ""

# Test 3: Get popular vendors
echo "3️⃣  Testing: GET /vendors/popular/list"
echo "------------------------------------------"
curl -s "${BASE_URL}/vendors/popular/list?limit=3" | jq '.vendors[] | {companyName, rating: .averageRating, reviews: .totalReviews}'
echo ""

# Test 4: Create a new vendor
echo "4️⃣  Testing: POST /vendors (create new vendor)"
echo "------------------------------------------"
VENDOR_DATA='{
  "companyName": "Innovation Labs",
  "businessName": "Innovation Labs Inc",
  "description": "Cutting-edge AI and machine learning solutions for enterprise clients",
  "email": "contact@innovationlabs.com",
  "phone": "+1-650-555-9876",
  "city": "Palo Alto",
  "state": "California",
  "country": "USA",
  "businessType": "AI/ML Services",
  "yearEstablished": 2021,
  "website": "https://innovationlabs.com"
}'

CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/vendors" \
  -H "Content-Type: application/json" \
  -d "$VENDOR_DATA")

VENDOR_ID=$(echo "$CREATE_RESPONSE" | jq -r '.vendor.id')

echo "$CREATE_RESPONSE" | jq '{
  message,
  vendor: {
    id: .vendor.id,
    companyName: .vendor.companyName,
    status: .vendor.status,
    city: .vendor.city
  }
}'
echo ""

# Test 5: Get vendor by ID
if [ -n "$VENDOR_ID" ] && [ "$VENDOR_ID" != "null" ]; then
  echo "5️⃣  Testing: GET /vendors/:id (get vendor details)"
  echo "------------------------------------------"
  curl -s "${BASE_URL}/vendors/${VENDOR_ID}" | jq '{
    companyName: .vendor.companyName,
    description: .vendor.description,
    status: .vendor.status,
    location: (.vendor.city + ", " + .vendor.country)
  }'
  echo ""
else
  echo "5️⃣  Skipping vendor details test (no vendor ID)"
fi

# Test 6: Check database state
echo "6️⃣  Database Check: All vendors in database"
echo "------------------------------------------"
sqlite3 /Users/rahul.singh/Downloads/Meyden/backend/prisma/dev.db \
  "SELECT companyName || ' - ' || city || ', ' || country || ' (' || status || ')'
   FROM vendors
   ORDER BY createdAt DESC
   LIMIT 5;"
echo ""

echo "=========================================="
echo "✅ Vendor API Testing Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "- Backend server: http://localhost:3002"
echo "- API endpoints: ${BASE_URL}/vendors"
echo "- Database: backend/prisma/dev.db"
echo "- Documentation: VENDOR_SETUP_GUIDE.md"
echo ""
