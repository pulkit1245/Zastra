#!/bin/bash

echo "=========================================="
echo "  FULL JAVA BACKEND LOG (errors & warns)"
echo "=========================================="
docker logs zastra-java-backend 2>&1 | grep -E "ERROR|WARN|Exception|syncAll|scraping failed|Failed" | tail -50

echo ""
echo "=========================================="
echo "  CACHE STATE CHECK (checking cache hit/miss)"
echo "=========================================="
docker logs zastra-java-backend 2>&1 | grep -E "Stats Aggregated|cache|Cache|syncAll completed|heatmap|Heatmap" | tail -30

echo ""
echo "=========================================="
echo "  PYTHON SCRAPER - ALL REQUESTS (last 60)"
echo "=========================================="
docker logs zastra-python-api 2>&1 | tail -60
