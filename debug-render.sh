#!/bin/bash
# Render Debug Script
echo "=== RENDER DEPLOYMENT DEBUG ==="
echo "Current working directory: $(pwd)"
echo "Contents of current directory:"
ls -la
echo ""
echo "Looking for package.json:"
find . -name "package.json" -type f
echo ""
echo "Contents of package.json (if found):"
if [ -f "package.json" ]; then
    cat package.json
else
    echo "package.json NOT FOUND in current directory"
fi
echo ""
echo "Environment variables:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "=== END DEBUG ==="
