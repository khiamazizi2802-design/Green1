import subprocess
import os

css_path = r"C:\Users\AURUMPC\Desktop\Khiam green app 4\client\src\index.css"
backup_path = css_path + ".bak"

# Make a backup
with open(css_path, "r", encoding="utf-8") as f:
    original_lines = f.readlines()

with open(backup_path, "w", encoding="utf-8") as f:
    f.writelines(original_lines)

def run_build():
    res = subprocess.run("npm run build", shell=True, cwd=r"C:\Users\AURUMPC\Desktop\Khiam green app 4\client", stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return res.returncode == 0

# Binary search on lines
low = 0
high = len(original_lines)

print(f"Total lines: {high}")

try:
    while low < high:
        mid = (low + high) // 2
        print(f"Testing commenting out from line {mid} to end...")
        
        # Write file with lines from mid to end commented out
        test_lines = []
        for idx, line in enumerate(original_lines):
            if idx >= mid:
                # Comment out this line
                test_lines.append("/* " + line.replace("*/", "* /").replace("/*", "/ *").strip() + " */\n")
            else:
                test_lines.append(line)
        
        with open(css_path, "w", encoding="utf-8") as f:
            f.writelines(test_lines)
            
        if run_build():
            # Build succeeded! That means the error is in the commented out part (from mid to end)
            print(f"Build SUCCEEDED with lines {mid}+ commented out.")
            # So the error is somewhere in lines >= mid.
            low = mid + 1
        else:
            # Build failed! That means the error is in the active part (before mid)
            print(f"Build FAILED with lines {mid}+ commented out.")
            # So the error is somewhere in lines < mid.
            high = mid

    print(f"Candidate line causing error: Line {low}")
    if low > 0 and low <= len(original_lines):
        print(f"Line content: {original_lines[low-1].strip()}")

finally:
    # Restore backup
    if os.path.exists(backup_path):
        with open(backup_path, "r", encoding="utf-8") as f:
            restore_content = f.read()
        with open(css_path, "w", encoding="utf-8") as f:
            f.write(restore_content)
        os.remove(backup_path)
