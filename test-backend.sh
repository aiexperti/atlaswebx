#!/bin/bash

# Test backend API proxy

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BACKEND_URL="https://atlaswebx.com/backend/api-proxy.php"

echo -e "${BLUE}🧪 Testing Backend API Proxy${NC}"
echo ""
echo "URL: $BACKEND_URL"
echo ""

# Test 1: Simple request
echo -e "${BLUE}Test 1: Simple API call${NC}"
echo "Sending: 'Hello!'"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Say hello in one word"}
    ]
  }')

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ Success! (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Failed! (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "Response:"
    echo "$BODY"
fi

echo ""
echo "---"
echo ""

# Test 2: Rate limiting
echo -e "${BLUE}Test 2: Rate limiting (5 quick requests)${NC}"
echo ""

SUCCESS_COUNT=0
for i in {1..5}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BACKEND_URL" \
      -H "Content-Type: application/json" \
      -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hi"}]}')
    
    if [ "$HTTP_CODE" == "200" ]; then
        echo -e "Request $i: ${GREEN}✅ Success${NC}"
        ((SUCCESS_COUNT++))
    elif [ "$HTTP_CODE" == "429" ]; then
        echo -e "Request $i: ${YELLOW}⚠️  Rate limited${NC}"
    else
        echo -e "Request $i: ${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
    fi
    
    sleep 0.5
done

echo ""
echo "Successful requests: $SUCCESS_COUNT/5"

echo ""
echo "---"
echo ""

# Test 3: Invalid request
echo -e "${BLUE}Test 3: Invalid request (should fail)${NC}"
echo ""

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BACKEND_URL" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}')

if [ "$HTTP_CODE" == "400" ]; then
    echo -e "${GREEN}✅ Correctly rejected invalid request (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Unexpected response (HTTP $HTTP_CODE)${NC}"
fi

echo ""
echo "---"
echo ""

# Summary
echo -e "${BLUE}📊 Test Summary${NC}"
echo ""

if [ "$HTTP_CODE" == "200" ] || [ "$SUCCESS_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Backend is working!${NC}"
    echo ""
    echo "Your backend is properly configured and responding."
    echo "You can now use it in your Electron app!"
else
    echo -e "${RED}❌ Backend has issues${NC}"
    echo ""
    echo "Possible problems:"
    echo "  - Backend not deployed correctly"
    echo "  - config.php missing or incorrect"
    echo "  - CORS not configured"
    echo "  - API key invalid"
    echo ""
    echo "Check your server logs:"
    echo "  ssh user@atlaswebx.com"
    echo "  cd /path/to/backend/"
    echo "  tail -f error.log"
fi

echo ""
