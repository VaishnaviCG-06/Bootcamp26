#!/bin/bash
# setup.sh - One-time setup script for ResearchAI Agent

echo "🔬 ResearchAI Agent Setup"
echo "========================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Install from https://python.org"
    exit 1
fi
echo "✅ Python found: $(python3 --version)"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org"
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Install Node.js with npm."
    exit 1
fi
echo "✅ npm found: $(npm --version)"

echo ""
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Get your FREE Groq API key from: https://console.groq.com"
echo "2. Set it: export GROQ_API_KEY=your_key_here"
echo "3. Run: ./start.sh"
