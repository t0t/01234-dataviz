from http.server import HTTPServer, SimpleHTTPRequestHandler
from livereload import Server
import os
import json

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def do_PUT(self):
        if self.path == '/save':
            content_length = int(self.headers['Content-Length'])
            data = self.rfile.read(content_length)
            
            try:
                # Guardar en data.json
                with open('data.json', 'wb') as f:
                    f.write(data)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(b'{"status": "success"}')
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super().end_headers()

def main():
    # Crear servidor livereload
    server = Server()
    
    # Observar archivos
    server.watch('*.html')
    server.watch('js/*.js')
    server.watch('styles/*.css')
    server.watch('data.json')
    
    # Servir archivos estáticos
    server.serve(port=8000, host='localhost', root='.')

if __name__ == '__main__':
    main()
