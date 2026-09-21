#!/usr/bin/env python3
"""Write simple forest-green PWA icons (stdlib only)."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path


FOREST = (0x1C, 0x4D, 0x3A, 255)
CREAM = (0xF4, 0xEF, 0xE6, 255)


def png(size: int, pixels: list[tuple[int, int, int, int]]) -> bytes:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            raw.extend(pixels[y * size + x])
    return b"".join(
        [
            b"\x89PNG\r\n\x1a\n",
            chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)),
            chunk(b"IDAT", zlib.compress(bytes(raw), 9)),
            chunk(b"IEND", b""),
        ]
    )


def draw(size: int) -> bytes:
    pixels: list[tuple[int, int, int, int]] = []
    radius = int(size * 0.22)
    cx = cy = size / 2
    for y in range(size):
        for x in range(size):
            dx = min(x, size - 1 - x)
            dy = min(y, size - 1 - y)
            if dx < radius and dy < radius and (dx - radius) ** 2 + (dy - radius) ** 2 > radius**2:
                pixels.append((0, 0, 0, 0))
                continue
            color = FOREST
            # bowl
            ny = (y - cy) / size
            nx = (x - cx) / size
            if abs(nx) < 0.32 and 0.12 < ny < 0.32:
                color = CREAM
            if abs(nx) < 0.28 and abs(ny + 0.02) < 0.04:
                color = CREAM
            if abs(nx) < 0.03 and -0.28 < ny < -0.02:
                color = CREAM
            pixels.append(color)
    return png(size, pixels)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    icons = root / "public" / "icons"
    icons.mkdir(parents=True, exist_ok=True)
    (icons / "icon-192.png").write_bytes(draw(192))
    (icons / "icon-512.png").write_bytes(draw(512))
    (root / "public" / "apple-touch-icon.png").write_bytes(draw(180))
    print("wrote icons")


if __name__ == "__main__":
    main()
