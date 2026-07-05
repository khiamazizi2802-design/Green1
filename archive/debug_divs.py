import os

path = r'C:\Users\AURUMPC\.gemini\antigravity\scratch\radar-ride\client\src\pages\OrderTrackerPage.jsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

stack = []
for i, line in enumerate(lines):
    # This is a very basic check, won't handle everything but helps
    if '<div' in line and '/>' not in line:
        stack.append(i + 1)
    if '</div>' in line:
        if stack:
            stack.pop()
        else:
            print(f"Extra closing div at line {i + 1}")

print(f"Unclosed divs starting at lines: {stack}")
