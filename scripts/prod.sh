#!/bin/bash

echo "🔧 Restoring production environment with paywall enabled..."

# Check if backup files exist
if [ ! -f services/revenueCatService.ts.backup ]; then
    echo "❌ No backup found for RevenueCat service!"
    echo "    Production files may not have been properly backed up."
    exit 1
fi

if [ ! -f app/index.tsx.backup ]; then
    echo "❌ No backup found for index.tsx!"
    echo "    Production files may not have been properly backed up."
    exit 1
fi

# Restore production RevenueCat service
echo "📦 Restoring production RevenueCat service..."
cp services/revenueCatService.ts.backup services/revenueCatService.ts

# Restore production index.tsx
echo "📦 Restoring production index.tsx..."
cp app/index.tsx.backup app/index.tsx

# Clean up backup files
echo "🧹 Cleaning up backup files..."
rm -f services/revenueCatService.ts.backup
rm -f app/index.tsx.backup

echo "✅ Production environment restored!"
echo "🔒 Paywall is now ENABLED for production"
echo "📝 Run 'bash scripts/dev.sh' to disable paywall for development"