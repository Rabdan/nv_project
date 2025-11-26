#!/bin/bash

API_URL="http://localhost:4000/api"
API_KEY="neurovision_secret_key"

echo "--- 1. Testing GET /api/users (Check DB connection and Seed) ---"
curl -s -X GET "$API_URL/users" \
  -H "x-api-key: $API_KEY"
echo ""

echo -e "\n\n--- 2. Testing POST /api/strategies (Create Strategy) ---"
STRATEGY_DATA='{
  "title": "Test Strategy",
  "month": "2025-11",
  "posts": [
    {"id": "post1", "name": "First Post"},
    {"id": "post2", "name": "Second Post"}
  ]
}'
RESPONSE=$(curl -s -X POST "$API_URL/strategies" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$STRATEGY_DATA")

echo $RESPONSE
# Extract ID using grep/sed since jq is not available
STRATEGY_ID=$(echo $RESPONSE | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$STRATEGY_ID" ]; then
    echo -e "\n--- 3. Testing GET /api/strategies/$STRATEGY_ID (Read Strategy) ---"
    curl -s -X GET "$API_URL/strategies/$STRATEGY_ID" \
      -H "x-api-key: $API_KEY"
    echo ""
else
    echo "Failed to create strategy, skipping read test."
fi

echo -e "\n\n--- 4. Testing POST /api/n8n/sync (Sync n8n Data) ---"
curl -s -X POST "$API_URL/n8n/sync" \
  -H "x-api-key: $API_KEY"
echo ""
