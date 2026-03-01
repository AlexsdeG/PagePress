#!/bin/bash

# PagePress Complete Reset Script
# This script performs a complete factory reset of PagePress
# - Deletes all database data
# - Deletes all uploaded media
# - Deletes all cache/build files
# - Resets everything to fresh state

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║   PagePress Complete Reset Script      ║${NC}"
echo -e "${YELLOW}║   ⚠️  THIS WILL WIPE ALL DATA          ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
echo ""

# Confirmation prompt
echo -e "${RED}⚠️  WARNING: This will permanently delete:${NC}"
echo "  • All database data (users, pages, media, settings)"
echo "  • All uploaded media files"
echo "  • All build artifacts and cache"
echo ""
read -p "Are you absolutely sure? Type 'YES' to confirm: " CONFIRM
if [ "$CONFIRM" != "YES" ]; then
  echo -e "${YELLOW}Reset cancelled.${NC}"
  exit 0
fi

echo ""
echo -e "${YELLOW}Starting complete reset...${NC}"

# Step 1: Kill any running processes
echo -e "${YELLOW}[1/6] Stopping running processes...${NC}"
pkill -f "node.*apps/api" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1
echo -e "${GREEN}✓ Processes stopped${NC}"

# Step 2: Delete database
echo -e "${YELLOW}[2/6] Deleting database...${NC}"
rm -f data/pagepress.db data/pagepress.db-shm data/pagepress.db-wal
mkdir -p data
echo -e "${GREEN}✓ Database deleted${NC}"

# Step 3: Delete uploads
echo -e "${YELLOW}[3/6] Deleting media uploads...${NC}"
rm -rf data/uploads/*
mkdir -p data/uploads
echo -e "${GREEN}✓ Media uploads cleared${NC}"

# Step 4: Delete node_modules and reinstall (clean slate)
echo -e "${YELLOW}[4/6] Cleaning dependencies...${NC}"
rm -rf node_modules apps/api/node_modules apps/admin/node_modules packages/db/node_modules packages/types/node_modules
rm -f pnpm-lock.yaml
echo -e "${GREEN}✓ Dependencies cleaned${NC}"

# Step 5: Delete build artifacts
echo -e "${YELLOW}[5/6] Deleting build artifacts...${NC}"
rm -rf apps/api/dist apps/admin/dist
rm -rf apps/api/.tsbuildinfo apps/admin/.tsbuildinfo
rm -rf .turbo
echo -e "${GREEN}✓ Build artifacts deleted${NC}"

# Step 6: Reinstall dependencies
echo -e "${YELLOW}[6/6] Reinstalling dependencies...${NC}"
if command -v pnpm &> /dev/null; then
  pnpm install
else
  echo -e "${YELLOW}pnpm not found, skipping dependency installation${NC}"
  echo -e "${YELLOW}Run 'pnpm install' manually when ready${NC}"
fi
echo -e "${GREEN}✓ Dependencies reinstalled${NC}"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ Complete Reset Finished            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Run: ${GREEN}pnpm dev${NC}"
echo "  2. Visit: ${GREEN}http://localhost:5173/pp-admin/${NC}"
echo "  3. Create a new super admin account"
echo ""
