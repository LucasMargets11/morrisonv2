#!/bin/bash

# Clean up previous build
rm -rf package
rm -f lambda.zip

# Create package directory
mkdir package

# Install dependencies
pip install -r requirements.txt --target ./package

# Copy handler
cp handler.py ./package/

# Create zip file
cd package
zip -r ../lambda.zip .
cd ..

echo "Build complete: lambda.zip created"
