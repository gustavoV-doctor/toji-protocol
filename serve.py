import http.server
import os
import functools

os.chdir(os.path.dirname(os.path.abspath(__file__)))
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=".")
server = http.server.HTTPServer(("", 8000), handler)
print("Serving on http://localhost:8000")
server.serve_forever()
