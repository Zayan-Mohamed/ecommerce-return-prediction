#!/bin/bash
echo "🚀 Railway Deployment Startup Script"
echo "=================================="

# Check Python version
echo "🐍 Python version:"
python --version

# Check current directory
echo "📁 Current directory:"
pwd
ls -la

# Check if required files exist
echo "📋 Checking required files:"
for file in "main.py" "requirements.txt" ".env"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Check if directories exist
echo "📁 Checking directories:"
for dir in "api" "agents" "models"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir/ directory exists"
    else
        echo "❌ $dir/ directory missing"
    fi
done

# Test Python imports
echo "🔍 Testing critical imports:"
python -c "
import sys
try:
    import fastapi
    print('✅ FastAPI')
    import uvicorn
    print('✅ Uvicorn')
    import pandas
    print('✅ Pandas')
    import numpy
    print('✅ Numpy')
    from main import app
    print('✅ Main app import')
    from main import health_check
    result = health_check()
    print('✅ Health check:', result['status'])
except Exception as e:
    print('❌ Import error:', str(e))
    sys.exit(1)
"

# Check environment variables
echo "🌍 Environment variables:"
echo "PORT: ${PORT:-'not set'}"
echo "PYTHONPATH: ${PYTHONPATH:-'not set'}"

# Set PORT with proper validation
if [ -z "$PORT" ]; then
    echo "⚠️  PORT not set, using default 8000"
    PORT=8000
elif ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo "⚠️  PORT '$PORT' is not a valid number, using default 8000"
    PORT=8000
fi

echo "=================================="
echo "🎯 Starting application on port $PORT"

# Start the application with validated port
exec uvicorn main:app --host 0.0.0.0 --port "$PORT" --log-level info
