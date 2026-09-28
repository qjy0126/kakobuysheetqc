#!/usr/bin/env python3
"""Threaded static server with gzip for JS/CSS/HTML so the share tunnel stays usable."""
from __future__ import annotations

import gzip
import io
import os
import sys
from functools import lru_cache
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

GZIP_TYPES = {
    "text/html",
    "text/css",
    "text/javascript",
    "application/javascript",
    "application/json",
    "image/svg+xml",
}


class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def end_headers(self):
        path_only = self.path.split("?", 1)[0]
        if path_only.startswith("/img/"):
            self.send_header("Cache-Control", "public, max-age=86400")
        elif path_only.endswith((".js", ".css", ".html")):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()
        if not os.path.isfile(path):
            return super().send_head()

        ctype = self.guess_type(path)
        wants_gzip = "gzip" in (self.headers.get("Accept-Encoding") or "") and ctype in GZIP_TYPES
        try:
            data = _read_file(path)
        except OSError:
            self.send_error(404, "File not found")
            return None

        encoding = None
        if wants_gzip:
            data = _gzip_file(path)
            encoding = "gzip"

        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        if encoding:
            self.send_header("Content-Encoding", encoding)
            self.send_header("Vary", "Accept-Encoding")
        self.send_header("Last-Modified", self.date_time_string(os.path.getmtime(path)))
        self.end_headers()
        return io.BytesIO(data)


@lru_cache(maxsize=32)
def _read_file(path: str) -> bytes:
    mtime = os.path.getmtime(path)
    return _read_file_versioned(path, mtime)


@lru_cache(maxsize=32)
def _read_file_versioned(path: str, _mtime: float) -> bytes:
    with open(path, "rb") as f:
        return f.read()


def _gzip_file(path: str) -> bytes:
    return _gzip_file_versioned(path, os.path.getmtime(path))


@lru_cache(maxsize=16)
def _gzip_file_versioned(path: str, _mtime: float) -> bytes:
    return gzip.compress(_read_file(path), compresslevel=5)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    httpd = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"Serving {ROOT} on http://127.0.0.1:{port}", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
