# backend/services/post_audio.py
import os
import subprocess
from typing import List

def run(cmd: list[str]) -> None:
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if p.returncode != 0:
        raise RuntimeError(p.stdout)

def concat_and_normalize(inputs: List[str], out_mp3: str) -> None:
    """
    Concatène des morceaux MP3 puis normalise.
    On utilise concat demuxer + loudnorm EBU R128.
    """
    if not inputs:
        raise ValueError("No input pieces to concatenate")

    # 1) Fichier de liste pour concat demuxer
    lst_path = out_mp3 + ".list.txt"
    with open(lst_path, "w") as f:
        for p in inputs:
            f.write(f"file '{os.path.abspath(p)}'\n")

    # 2) Concat + normalisation (sortie MP3)
    # Deux passes loudnorm donneraient un meilleur résultat, ici on fait simple.
    tmp_path = out_mp3 + ".tmp.mp3"
    run([
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", lst_path,
        "-filter:a", "loudnorm=I=-18:TP=-1.5:LRA=11",
        "-c:a", "libmp3lame", "-b:a", "192k",
        tmp_path
    ])

    os.replace(tmp_path, out_mp3)
    try:
        os.remove(lst_path)
    except OSError:
        pass


def make_m4b_from_mp3(mp3_path: str, chapters: list[str], out_m4b: str) -> None:
    """
    Convertit un MP3 final en M4B (AAC). Le conteneur m4b (MP4) n'accepte pas MP3,
    il faut transcoder en AAC.
    """
    if not os.path.exists(mp3_path):
        raise FileNotFoundError(mp3_path)

    # NB: -f ipod est adapté aux .m4b, sinon -f mp4 fonctionne aussi.
    run([
        "ffmpeg", "-y",
        "-i", mp3_path,
        "-vn",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "faststart",
        "-f", "ipod",
        out_m4b
    ])
