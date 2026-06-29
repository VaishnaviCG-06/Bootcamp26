#!/bin/bash
# start.sh - Start both backend and frontend

echo "🚀 Starting ResearchAI Agent..."
echo ""

# Check for API key
if [ -z "$GROQ_API_KEY" ]; then
    echo "⚠️  GROQ_API_KEY not set!"
    echo "Get a free key at: https://console.groq.com"
    echo "Then run: export GROQ_API_KEY=your_key_here"
    echo ""
    echo "Starting anyway (you can set the key later)..."
fi

# Start backend
echo "🔧 Starting backend on http://localhost:8000 ..."
cd backend
python3 -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

sleep 2

# Start frontend
echo "🎨 Starting frontend on http://localhost:5173 ..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers running!"
echo "👉 Open http://localhost:5173 in your browser"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait and cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
