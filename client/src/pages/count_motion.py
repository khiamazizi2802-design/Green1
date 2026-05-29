import os
import re

path = r'C:\Users\AURUMPC\.gemini\antigravity\scratch\radar-ride\client\src\pages\OrderTrackerPage.jsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all motion tags
opens = re.findall(r'<(motion\.\w+)', content)
closes = re.findall(r'</(motion\.\w+)', content)
self_closes = re.findall(r'<(motion\.\w+)[^>]*/>', content)

print(f"Motion Opens: {len(opens)}")
print(f"Motion Closes: {len(closes)}")
print(f"Motion Self-Closes: {len(self_closes)}")

for op in set(opens):
    o_count = opens.count(op)
    c_count = closes.count(op)
    sc_count = self_closes.count(op)
    print(f"{op}: {o_count} open, {c_count} close, {sc_count} self-close")
