"""
Simple frontend server for Orbit PWA.
Serves the built frontend from ./dist on port 4173
and proxies /api and /uploads requests to the backend on port 8000.
"""
import http.server
import socketserver
import urllib.request
import os
import sys
import mimetypes

PORT = 4173
BACKEND = "http://127.0.0.1:8000"
DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")


class OrbitHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

    def do_GET(self):
        if self.path.startswith("/api/") or self.path.startswith("/uploads/"):
            self._proxy("GET")
        else:
            # For SPA routing: serve index.html for paths that don't match files
            file_path = os.path.join(DIST_DIR, self.path.lstrip("/"))
            if not os.path.exists(file_path) or os.path.isdir(file_path):
                # Check if it's a real file (with extension)
                _, ext = os.path.splitext(self.path)
                if not ext or not os.path.exists(file_path):
                    self.path = "/index.html"
            super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/") or self.path.startswith("/uploads/"):
            self._proxy("POST")
        else:
            self.send_error(404)

    def do_PUT(self):
        if self.path.startswith("/api/") or self.path.startswith("/uploads/"):
            self._proxy("PUT")
        else:
            self.send_error(404)

    def do_DELETE(self):
        if self.path.startswith("/api/") or self.path.startswith("/uploads/"):
            self._proxy("DELETE")
        else:
            self.send_error(404)

    def do_PATCH(self):
        if self.path.startswith("/api/") or self.path.startswith("/uploads/"):
            self._proxy("PATCH")
        else:
            self.send_error(404)

    def do_OPTIONS(self):
        if self.path.startswith("/api/") or self.path.startswith("/uploads/"):
            self._proxy("OPTIONS")
        else:
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "*")
            self.end_headers()

    def _proxy(self, method):
        url = BACKEND + self.path
        body = None
        if method in ("POST", "PUT", "PATCH"):
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > 0:
                body = self.rfile.read(content_length)

        headers = {}
        for key in self.headers:
            if key.lower() not in ("host", "connection"):
                headers[key] = self.headers[key]

        try:
            req = urllib.request.Request(url, data=body, headers=headers, method=method)
            with urllib.request.urlopen(req, timeout=30) as resp:
                self.send_response(resp.status)
                for key, val in resp.getheaders():
                    if key.lower() not in ("transfer-encoding", "connection"):
                        self.send_header(key, val)
                self.end_headers()
                self.wfile.write(resp.read())
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            for key, val in e.headers.items():
                if key.lower() not in ("transfer-encoding", "connection"):
                    self.send_header(key, val)
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_error(502, f"Backend error: {e}")

    def log_message(self, format, *args):
        pass  # Suppress request logging


if __name__ == "__main__":
    # Ensure dist directory exists
    if not os.path.exists(DIST_DIR):
        print(f"Error: {DIST_DIR} does not exist. Run 'npm run build' first.")
        sys.exit(1)

    with socketserver.TCPServer(("0.0.0.0", PORT), OrbitHandler) as httpd:
        print(f"🚀 Orbit frontend serving on http://localhost:{PORT}")
        print(f"   Proxying /api/* → {BACKEND}")
        print(f"   Serving files from {DIST_DIR}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down...")
