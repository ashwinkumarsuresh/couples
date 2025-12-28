#!/usr/bin/env python3
"""
Proxy server for the Couples Truth or Dare Game
Handles CORS issues by proxying API requests to Google Gemini, Anthropic Claude, and OpenAI
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.request
import urllib.error
import os
from pathlib import Path

import google.generativeai as genai

from google.cloud import secretmanager

# Try to load python-dotenv
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Note: python-dotenv not installed. Environment variables from .env won't be loaded.")
    print("Install with: pip3 install python-dotenv")

PORT = 3003  # Using port 3003 to avoid conflicts
PROJECT_ID = os.environ.get('GOOGLE_CLOUD_PROJECT', 'ashwinstock')

class ProxyHandler(BaseHTTPRequestHandler):
    def _get_gemini_api_key(self):
        """Fetch Gemini API key from Secret Manager or environment variable."""
        env_key = os.environ.get('GOOGLE_API_KEY')
        if env_key:
            return env_key
        
        try:
            client = secretmanager.SecretManagerServiceClient()
            name = f"projects/{PROJECT_ID}/secrets/GOOGLE_AI_STUDIO_API_KEY/versions/latest"
            response = client.access_secret_version(request={"name": name})
            return response.payload.data.decode("UTF-8").strip()
        except Exception as e:
            self.log_message(f"Error fetching secret GOOGLE_AI_STUDIO_API_KEY: {str(e)}")
            return None

    def do_GET(self):
        """Serve static files"""
        # Strip query parameters from path (e.g., ?v=2 for cache busting)
        path = self.path.split('?')[0]
        
        if path == '/':
            path = '/index.html'

        try:
            file_path = Path(__file__).parent / path.lstrip('/')

            if file_path.is_file():
                # Determine content type
                content_types = {
                    '.html': 'text/html',
                    '.css': 'text/css',
                    '.js': 'application/javascript',
                    '.json': 'application/json',
                }
                ext = file_path.suffix
                content_type = content_types.get(ext, 'text/plain')

                # Send response
                self.send_response(200)
                self.send_header('Content-type', content_type)
                self.end_headers()

                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_error(404, 'File not found')
        except Exception as e:
            self.send_error(500, str(e))

    def do_POST(self):
        """Proxy API requests to Gemini"""
        if self.path == '/api/generate':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))

            # Extract request data
            prompt = request_data.get('prompt')
            is_text = request_data.get('isTextResponse', False)

            if not prompt:
                self.send_error(400, 'Missing prompt')
                return

            api_key = self._get_gemini_api_key()
            if not api_key:
                self.send_error(500, 'Gemini API key not configured on server')
                return

            try:
                # Get model name from environment or use default
                model_name = os.getenv('GOOGLE_MODEL', 'gemini-3-flash-preview')
                content = self._call_google_api(api_key, prompt, model_name)

                # Send success response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                result = {
                    'success': True,
                    'content': content,
                    'isTextResponse': is_text
                }
                self.wfile.write(json.dumps(result).encode('utf-8'))

            except Exception as e:
                error_msg = str(e)
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                result = {
                    'success': False,
                    'error': error_msg
                }
                self.wfile.write(json.dumps(result).encode('utf-8'))
        else:
            self.send_error(404)

    def _call_google_api(self, api_key, prompt, model_name='gemini-3-flash-preview'):
        """Call Google Gemini API using SDK"""
        api_key = api_key.strip()
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.9,
                max_output_tokens=8192,
            )
        )
        
        if not response.text:
            raise Exception("Empty response from model")
            
        return response.text

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        """Custom log format"""
        print(f"[{self.log_date_time_string()}] {format % args}")

if __name__ == '__main__':
    server = HTTPServer(('localhost', PORT), ProxyHandler)
    print('\n💕 COUPLES GAME SERVER 💕\n')
    print(f'Server running at http://localhost:{PORT}/')
    print(f'\nOpen your browser and go to: http://localhost:{PORT}/')
    print('\nSupported AI providers:')
    print('  - Google Gemini (Direct SDK)')
    print('\nConfigure models via environment variables or .env file:')
    print("  GOOGLE_MODEL:    Gemini model to use (default: gemini-3-flash-preview)")
    print('\nPress Ctrl+C to stop the server\n')

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n\nServer stopped.')
        server.server_close()
