#!/bin/bash
set -e

echo "Checking build output structure..."
test -d dist || (echo "ERROR: dist directory not found" && exit 1)
test -f dist/index.html || (echo "ERROR: dist/index.html not found" && exit 1)

echo ""
echo "Validating asset file accessibility..."
# Extract repository name from git remote
REPO_NAME=$(git remote get-url origin | sed -E 's/.*github.com[\/:]([^\/]+)\/([^\/]+)\.git/\2/' | tr '[:upper:]' '[:lower:]')
echo "Repository name: $REPO_NAME"
echo "Expected base path: /${REPO_NAME}/"

# Extract all asset paths from HTML (JS, CSS, images, fonts, etc.)
ASSET_PATHS=$(grep -oE '(href|src)=["'\'']/[^"'\'']*\.(js|css|svg|ico|png|jpg|jpeg|gif|woff|woff2|ttf|eot)' dist/index.html | sed -E 's/(href|src)=["'\'']//' | sed -E 's/["'\'']$//' || true)

if [ -z "$ASSET_PATHS" ]; then
  echo "WARNING: No asset references found in HTML"
else
  echo ""
  echo "Found asset references in HTML:"
  echo "$ASSET_PATHS" | head -10
  echo ""
  
  MISSING_FILES=0
  TOTAL_ASSETS=0
  
  # Check each asset path
  while IFS= read -r ASSET_PATH; do
    if [ -z "$ASSET_PATH" ]; then
      continue
    fi
    
    TOTAL_ASSETS=$((TOTAL_ASSETS + 1))
    
    # Remove the base path prefix to get the relative path from dist root
    # e.g., /pdfslicendice/assets/index.js -> /assets/index.js
    RELATIVE_PATH=$(echo "$ASSET_PATH" | sed "s|^/${REPO_NAME}/|/|")
    
    # Check if file exists at dist + relative path
    FILE_PATH="dist${RELATIVE_PATH}"
    
    if [ ! -f "$FILE_PATH" ]; then
      echo "❌ MISSING: $ASSET_PATH -> $FILE_PATH (not found)"
      MISSING_FILES=$((MISSING_FILES + 1))
    else
      echo "✅ FOUND: $ASSET_PATH -> $FILE_PATH"
    fi
  done <<< "$ASSET_PATHS"
  
  echo ""
  if [ "$MISSING_FILES" -gt 0 ]; then
    echo "❌ ERROR: $MISSING_FILES out of $TOTAL_ASSETS asset files are missing!"
    echo "This would cause 404 errors on GitHub Pages."
    echo ""
    echo "Common causes:"
    echo "  - Base path mismatch (check REPO_NAME in vite.config.ts)"
    echo "  - Case sensitivity issues (repository name must match exactly)"
    exit 1
  else
    echo "✅ All $TOTAL_ASSETS asset files are accessible at their referenced paths"
  fi
fi

# Also verify assets directory exists and has files
if [ ! -d "dist/assets" ]; then
  echo "❌ ERROR: dist/assets directory not found"
  exit 1
fi

ASSET_COUNT=$(find dist/assets -type f | wc -l)
if [ "$ASSET_COUNT" -eq 0 ]; then
  echo "❌ ERROR: No asset files found in dist/assets"
  exit 1
fi

echo ""
echo "✅ Build validation passed"
echo "   - HTML file exists"
echo "   - All referenced asset files are accessible"
echo "   - Assets directory exists with $ASSET_COUNT files"
