import shutil, subprocess, os
from slugify import slugify

def copy_file(src, dst):
    shutil.copy2(src, dst)

def run(cmd: list[str]):
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr)
    return proc.stdout

def safe_slug(name: str) -> str:
    return slugify(name or 'file')
