"""Original synthesized score for the Masar Jadid vision video (no samples, no copyrighted material).

Reads the scene timeline (remotion/src/timeline.json): 100 BPM, 1 beat = 18 frames @30fps, 1 bar = 4 beats.
D minor, hopeful cycle Dm – Bb – F – C (i–VI–III–VII); each scene's `mood` sets the arrangement
(intro / build / main / soft / lift / outro). Every scene cut gets a whoosh into it + a soft impact on it.

Usage: python make_music.py <timeline.json> <out.wav> [scenes|short]
"""
import json
import sys
import wave

import numpy as np

TL = json.load(open(sys.argv[1], encoding="utf-8"))
OUT = sys.argv[2]
CUT = sys.argv[3] if len(sys.argv) > 3 else "scenes"
SR = 48000
BEAT = 60 / TL["bpm"]
BAR = BEAT * 4
scenes = TL[CUT]
bars_total = sum(s["bars"] for s in scenes)
n = int(SR * (bars_total * BAR + 3.0))
L = np.zeros(n)
R = np.zeros(n)
rng = np.random.default_rng(7)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(sig, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= n or i + len(sig) <= 0:
        return
    s = sig
    if i < 0:
        s, i = s[-i:], 0
    j = min(n, i + len(s))
    gl, gr = gain * np.sqrt(0.5 * (1 - pan)), gain * np.sqrt(0.5 * (1 + pan))
    L[i:j] += s[: j - i] * gl
    R[i:j] += s[: j - i] * gr


def lp(x, hi=None, lo=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if hi:
        m /= np.sqrt(1 + (f / hi) ** 4)
    if lo:
        m /= np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X * m, len(x))


def env(length, a, r, sustain=1.0):
    N = int(length * SR)
    e = np.full(N, sustain)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, sustain, na) if na else e[:na]
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def saw(f0, length, cutoff=2400, detune=0.0):
    t = np.arange(int(length * SR)) / SR
    out = np.zeros_like(t)
    k = 1
    while k * f0 < min(cutoff * 2.5, 16000):
        g = (1 / k) / np.sqrt(1 + (k * f0 / cutoff) ** 4)
        out += g * np.sin(2 * np.pi * k * f0 * (1 + detune) * t + k * 0.7)
        k += 1
    return out


def pad(notes, length, bright=1800, gain=0.07):
    a, b = np.zeros(int(length * SR)), np.zeros(int(length * SR))
    for m in notes:
        a += saw(hz(m), length, bright, -0.003)
        b += saw(hz(m), length, bright, 0.003)
    e = env(length, min(0.9, length * 0.35), min(1.2, length * 0.45))
    return a * e * gain, b * e * gain


def keys(m, length=1.6, vel=1.0):
    """Soft electric-piano/bell: few sine partials with exponential decay."""
    t = np.arange(int(length * SR)) / SR
    f0 = hz(m)
    s = np.sin(2 * np.pi * f0 * t) + 0.35 * np.sin(2 * np.pi * 2 * f0 * t) * np.exp(-t * 6) + 0.12 * np.sin(2 * np.pi * 3.01 * f0 * t) * np.exp(-t * 9)
    s *= np.exp(-t * 2.8) * np.minimum(1, t / 0.004)
    s[-2000:] *= np.linspace(1, 0, 2000)
    return s * vel


def bell(m, length=3.0):
    t = np.arange(int(length * SR)) / SR
    f0 = hz(m)
    s = sum(g * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t * d) for r, g, d in [(1, 1, 1.2), (2.76, 0.4, 2.5), (5.4, 0.2, 4), (8.93, 0.08, 6)])
    return s * np.minimum(1, t / 0.002)


def kick(vel=1.0):
    t = np.arange(int(0.45 * SR)) / SR
    f = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7) * vel + 0.15 * rng.uniform(-1, 1, len(t)) * np.exp(-t * 120)


def clap(vel=1.0):
    N = int(0.3 * SR)
    t = np.arange(N) / SR
    nz = lp(rng.uniform(-1, 1, N), hi=5000, lo=900)
    e = np.exp(-t * 18)
    for d in (0.0, 0.011, 0.022):
        e += 0.6 * np.exp(-np.maximum(t - d, 0) * 140) * (t >= d)
    return nz * e * 0.5 * vel


def hat(vel=1.0, open_=False):
    N = int((0.25 if open_ else 0.06) * SR)
    t = np.arange(N) / SR
    return lp(rng.uniform(-1, 1, N), lo=7000) * np.exp(-t * (14 if open_ else 70)) * vel


def sub(m, length):
    t = np.arange(int(length * SR)) / SR
    return np.sin(2 * np.pi * hz(m) * t) * np.minimum(1, t / 0.01) * np.exp(-t * 1.2)


def whoosh(length=0.9):
    N = int(length * SR)
    t = np.linspace(0, 1, N)
    nz = rng.uniform(-1, 1, N)
    out = np.zeros(N)
    # sweep a band of filtered noise upward in short blocks
    blk = 2048
    for i in range(0, N, blk):
        c = 300 + 5000 * (i / N) ** 2
        out[i:i + blk] = lp(nz[i:i + blk], hi=c * 1.6, lo=c * 0.5)
    return out * t ** 2.2 * 0.9


def impact():
    t = np.arange(int(1.8 * SR)) / SR
    f = 38 + 60 * np.exp(-t * 10)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4)
    air = lp(rng.uniform(-1, 1, len(t)), hi=3000) * np.exp(-t * 5) * 0.35
    return boom + air


def riser(length):
    N = int(length * SR)
    t = np.linspace(0, 1, N)
    tt = np.arange(N) / SR
    tone = np.sin(2 * np.pi * np.cumsum(200 + 600 * t ** 2) / SR) * 0.25
    return (lp(rng.uniform(-1, 1, N), hi=6000, lo=500) * 0.5 + tone) * t ** 3


# D minor, hopeful cycle. Chords as MIDI notes (pad voicing) + bass root.
CHORDS = [
    ([62, 65, 69, 74], 38),  # Dm
    ([62, 65, 70, 74], 34),  # Bb
    ([60, 65, 69, 72], 41),  # F
    ([60, 64, 67, 72], 36),  # C
]
ARP = [0, 2, 1, 3, 2, 1, 3, 2]  # index into chord tones, 8ths

t0 = 0.0
bar_idx = 0
cuts = []
for si, s in enumerate(scenes):
    mood = s["mood"]
    if si > 0:
        cuts.append((t0, s["transition"]))
    for b in range(s["bars"]):
        bt = t0 + b * BAR
        notes, root = CHORDS[bar_idx % 4]
        last_bar = b == s["bars"] - 1
        # pad
        bright = {"intro": 900, "soft": 1100, "build": 1500, "main": 1900, "lift": 2600, "outro": 1600}[mood]
        pg = {"intro": 0.05, "soft": 0.06, "build": 0.06, "main": 0.055, "lift": 0.065, "outro": 0.07}[mood]
        a, c = pad(notes, BAR + 0.6, bright, pg)
        place(a, bt - 0.05, 1, -0.7)
        place(c, bt - 0.05, 1, 0.7)
        # arpeggio keys
        if mood in ("build", "main", "lift", "soft", "outro"):
            density = 8 if mood in ("main", "lift") else 4
            for k in range(density):
                step = 8 // density
                tone = notes[ARP[(k * step) % 8]] + (12 if mood == "lift" and k % 2 else 0)
                vel = (0.16 if k % 2 == 0 else 0.11) * (0.8 if mood == "soft" else 1)
                place(keys(tone + 12, 1.4), bt + k * step * BEAT / 2, vel, 0.45 if k % 2 else -0.45)
        # bass
        if mood in ("main", "lift", "build", "outro"):
            for q in range(4 if mood in ("main", "lift") else 2):
                place(sub(root, BEAT * (1 if mood in ("main", "lift") else 2) * 0.95), bt + q * BEAT * (1 if mood in ("main", "lift") else 2), 0.32)
        if mood == "soft":
            place(sub(root, BAR), bt, 0.18)
        # drums
        if mood in ("main", "lift"):
            for q in range(4):
                if mood == "lift" or q in (0, 2):
                    place(kick(), bt + q * BEAT, 0.55)
                if q in (1, 3):
                    place(clap(), bt + q * BEAT, 0.28 if mood == "main" else 0.38)
            for e in range(8):
                place(hat(1, open_=(e % 2 == 1 and mood == "lift")), bt + e * BEAT / 2, 0.07 if e % 2 else 0.05, 0.3)
        elif mood == "build":
            place(kick(0.8), bt, 0.45)
            for e in range(8):
                place(hat(), bt + e * BEAT / 2, 0.03 + 0.04 * (b / s["bars"]), 0.3)
        # drum fill / riser into the next scene
        if last_bar and si < len(scenes) - 1 and mood in ("main", "lift", "build"):
            for e in range(4):
                place(clap(0.6), bt + 3 * BEAT + e * BEAT / 4, 0.12 + e * 0.04)
        bar_idx += 1
    t0 += s["bars"] * BAR

# intro: bell motif when the logo writes (frame ~48 → 1.6 s) + riser before the first cut
STING = TL.get("stingAt", 1.6)  # logo moment (seconds)
place(riser(1.4), STING - 1.4, 0.18)
place(impact(), STING, 0.45)
for k, m in enumerate([74, 77, 81, 86]):
    place(bell(m), STING + k * BEAT / 2, 0.09, (-0.4, 0.4)[k % 2])
place(bell(86, 4), STING + 3.4, 0.06, 0.2)

# transitions: whoosh into each cut + impact on it
for tc, kind in cuts:
    w = whoosh(0.85)
    place(w, tc - 0.85, 0.22, -0.3)
    place(w[::-1] * 0.4, tc, 0.12, 0.3)
    place(impact(), tc, 0.30 if kind != "split" else 0.38)

# outro: final chord bloom + bell
end_t = t0
outro_start = end_t - scenes[-1]["bars"] * BAR
for k, m in enumerate([62, 69, 74, 77, 81]):
    place(bell(m, 5), outro_start + 4 * BEAT + k * 0.06, 0.07, (-0.5, 0.5)[k % 2])
a, c = pad([50, 57, 62, 65, 69], 6.0, 1400, 0.06)
place(a, end_t - 4.2, 1, -0.6)
place(c, end_t - 4.2, 1, 0.6)

# simple stereo reverb: convolve with decaying noise IRs
def reverb(x, seed, length=2.4, mix=0.22):
    g = np.random.default_rng(seed)
    N = int(length * SR)
    ir = g.uniform(-1, 1, N) * np.exp(-np.arange(N) / SR * 3.0)
    ir = lp(ir, hi=5000)
    ir /= np.sqrt((ir ** 2).sum())
    size = 1 << int(np.ceil(np.log2(len(x) + N)))
    y = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return x + mix * y

L = reverb(L, 1)
R = reverb(R, 2)

# fade the very end with the picture, master
total = int(bars_total * BAR * SR)
fade = int(0.9 * SR)
L[total - fade:total] *= np.linspace(1, 0, fade) ** 1.5
R[total - fade:total] *= np.linspace(1, 0, fade) ** 1.5
L, R = L[:total], R[:total]
pk = max(np.abs(L).max(), np.abs(R).max())
L, R = np.tanh(1.2 * L / pk) / np.tanh(1.2), np.tanh(1.2 * R / pk) / np.tanh(1.2)
st = (np.stack([L, R], 1) * 0.89 * 32767).astype(np.int16)
with wave.open(OUT, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(st.tobytes())
print("wrote", OUT, f"{total / SR:.2f}s", "cuts:", [round(c, 2) for c, _ in cuts])
