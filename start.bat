@echo off
echo Starting Radar Ride Server...
start cmd /k "cd server && npm.cmd start"

echo Starting Radar Ride Client...
start cmd /k "cd client && npm.cmd run dev"

echo Done! The app is starting. You can minimize these black windows but DO NOT close them while developing.
