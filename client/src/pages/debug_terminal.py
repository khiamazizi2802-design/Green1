import os

path = r'C:\Users\AURUMPC\.gemini\antigravity\scratch\radar-ride\client\src\pages\ManagerDashboard.jsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Terminal" in line and "<h1" in line:
        print(f"Line {i+1}: {repr(line)}")
