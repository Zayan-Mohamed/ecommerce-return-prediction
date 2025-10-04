#!/usr/bin/env python3
"""
Simple startup test for Railway deployment
This script tests if the basic imports work before starting the full app
"""

import sys
import traceback

def test_basic_imports():
    """Test if core dependencies can be imported"""
    try:
        print("Testing basic imports...")
        
        # Test FastAPI
        import fastapi
        print("✅ FastAPI imported successfully")
        
        # Test Uvicorn
        import uvicorn
        print("✅ Uvicorn imported successfully")
        
        # Test data libraries
        import pandas
        print("✅ Pandas imported successfully")
        
        import numpy
        print("✅ Numpy imported successfully")
        
        # Test sklearn
        import sklearn
        print("✅ Scikit-learn imported successfully")
        
        # Test Supabase
        import supabase
        print("✅ Supabase imported successfully")
        
        # Test pydantic
        import pydantic
        print("✅ Pydantic imported successfully")
        
        print("\n✅ All basic imports successful!")
        return True
        
    except Exception as e:
        print(f"❌ Import failed: {str(e)}")
        traceback.print_exc()
        return False

def test_app_creation():
    """Test if the FastAPI app can be created"""
    try:
        print("\nTesting FastAPI app creation...")
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        
        app = FastAPI(title="Test App")
        
        # Test CORS middleware
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        @app.get("/")
        def root():
            return {"status": "ok"}
            
        @app.get("/health")
        def health():
            return {"status": "healthy"}
        
        print("✅ FastAPI app created successfully!")
        return True
        
    except Exception as e:
        print(f"❌ App creation failed: {str(e)}")
        traceback.print_exc()
        return False

def test_directory_structure():
    """Test if required files and directories exist"""
    import os
    
    print("\nTesting directory structure...")
    
    # Check for main files
    required_files = [
        "main.py",
        "requirements.txt",
        ".env"
    ]
    
    required_dirs = [
        "api",
        "agents",
        "models"
    ]
    
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ {file} exists")
        else:
            print(f"⚠️  {file} missing")
    
    for dir in required_dirs:
        if os.path.isdir(dir):
            print(f"✅ {dir}/ directory exists")
        else:
            print(f"⚠️  {dir}/ directory missing")

if __name__ == "__main__":
    print("🚀 Railway Deployment Startup Test")
    print("=" * 50)
    
    success = True
    
    # Test directory structure
    test_directory_structure()
    
    # Test basic imports
    if not test_basic_imports():
        success = False
    
    # Test app creation
    if not test_app_creation():
        success = False
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 All tests passed! App should start successfully.")
        sys.exit(0)
    else:
        print("💥 Some tests failed. Check the errors above.")
        sys.exit(1)
