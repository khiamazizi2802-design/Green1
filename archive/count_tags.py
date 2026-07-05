import os

path = r'C:\Users\AURUMPC\.gemini\antigravity\scratch\radar-ride\client\src\pages\OrderTrackerPage.jsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

div_open = content.count('<div')
div_close = content.count('</div')
ap_open = content.count('<AnimatePresence')
ap_close = content.count('</AnimatePresence')
motion_open = content.count('<motion.')
motion_close = content.count('</motion.')

print(f"div: {div_open} open, {div_close} close")
print(f"AnimatePresence: {ap_open} open, {ap_close} close")
print(f"motion: {motion_open} open, {motion_close} close")
