#!/bin/sh

echo "Waiting for MongoDB to be ready..."
sleep 5

echo "Running database seed..."
node seed.js

echo "Starting server..."
exec node server.js
