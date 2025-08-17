#!/bin/bash

echo "========================================"
echo " COMPREHENSIVE FIX FOR ALL ISSUES"
echo "========================================"
echo

echo "[1/10] Cleaning node_modules and lock files..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

echo "[2/10] Clearing npm cache..."
npm cache clean --force

echo "[3/10] Clearing Expo cache..."
npx expo install --fix

echo "[4/10] Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps

echo "[5/10] Checking for duplicate @react-navigation packages..."
npm ls @react-navigation/native
npm ls @react-navigation/bottom-tabs
npm ls @react-navigation/stack

echo "[6/10] Force installing correct versions..."
npm install @react-navigation/native@^7.1.17 --legacy-peer-deps --force
npm install @react-navigation/bottom-tabs@^7.3.10 --legacy-peer-deps --force
npm install @react-navigation/stack@^7.3.20 --legacy-peer-deps --force
npm install @react-navigation/elements@^2.6.3 --legacy-peer-deps --force

echo "[7/10] Installing correct React versions..."
npm install react@18.2.0 react-dom@18.2.0 react-native@0.73.11 --legacy-peer-deps --force

echo "[8/10] Final dependency check..."
npm ls --depth=0

echo "[9/10] Clearing Metro cache..."
npx expo start --clear

echo "[10/10] Ready to start!"
echo
echo "========================================"
echo " FIX COMPLETE!"
echo "========================================"
echo
echo "If you see any errors above, try running:"
echo "  npm install --legacy-peer-deps --force"
echo
echo "To start the app, run:"
echo "  npm start"
echo

