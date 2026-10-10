import os
import zipfile

output_filename = "HomePilot-AI-compressed.zip"
exclude_folders = {".venv", "venv", "env", "__pycache__", ".git"}

with zipfile.ZipFile(output_filename, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if d not in exclude_folders]
        for file in files:
            if file == output_filename or file == "make_zip.py":
                continue
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, start=".")
            zipf.write(file_path, arcname)

print(f"Archive successfully created: {output_filename}")