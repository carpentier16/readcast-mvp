import os, tempfile
from .utils import run

def concat_and_normalize(wav_files: list[str], out_mp3: str):
    # build concat list file
    concat_txt = tempfile.NamedTemporaryFile(delete=False, mode='w', suffix='.txt')
    for f in wav_files:
        concat_txt.write(f"file '{os.path.abspath(f)}'\n")
    concat_txt.close()
    # concat into wav
    tmp_wav = out_mp3.replace('.mp3', '_concat.wav')
    run(["ffmpeg","-y","-f","concat","-safe","0","-i",concat_txt.name,"-c","copy",tmp_wav])
    # loudness normalize (-23 LUFS approx)
    run(["ffmpeg","-y","-i",tmp_wav,"-af","loudnorm=I=-23:TP=-2:LRA=11","-ar","44100","-b:a","192k",out_mp3])
    os.remove(tmp_wav)
    os.remove(concat_txt.name)

def make_m4b_from_mp3(mp3_path: str, chapters: list[tuple[str,str]], out_m4b: str):
    # simple copy to m4b; proper chapter atoms can be added later with m4b-tool
    run(["ffmpeg","-y","-i",mp3_path,"-c","copy",out_m4b])
