#!/usr/bin/env python3
"""
Flask server with authentication for Friends Game - Couples Truth or Dare
"""

from flask import Flask, render_template, request, session, redirect, url_for, jsonify
import json
import urllib.request
import urllib.error
import os
import google.generativeai as genai
from google.cloud import secretmanager
from functools import wraps

app = Flask(__name__,
            static_folder='static',
            static_url_path='/static')
app.secret_key = os.environ.get('SESSION_SECRET', 'dev-secret-change-in-production')

# Project ID for Google Cloud
PROJECT_ID = os.environ.get('GOOGLE_CLOUD_PROJECT', 'ashwinstock')

def get_gemini_api_key():
    """Fetch Gemini API key from Secret Manager or environment variable."""
    # First priority: Environment variable (useful for local dev or simple deployment)
    env_key = os.environ.get('GOOGLE_API_KEY')
    if env_key:
        return env_key
    
    # Second priority: Google Secret Manager
    try:
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{PROJECT_ID}/secrets/GOOGLE_AI_STUDIO_API_KEY/versions/latest"
        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8").strip()
    except Exception as e:
        print(f"Error fetching secret GOOGLE_AI_STUDIO_API_KEY: {str(e)}")
        return None

# Get password from environment variable
APP_PASSWORD = os.environ.get('COUPLES_PASSWORD', 'changeme123')
APP_USERNAME = 'admin'

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        username = request.form.get('username', '')
        password = request.form.get('password', '')

        if username == APP_USERNAME and password == APP_PASSWORD:
            session['logged_in'] = True
            return redirect(url_for('index'))
        else:
            error = 'Invalid credentials. Please try again.'

    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('login'))

@app.route('/')
@login_required
def index():
    return render_template('game.html')

@app.route('/api/generate', methods=['POST', 'OPTIONS'])
def api_generate():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    try:
        request_data = request.get_json()
        prompt = request_data.get('prompt')

        if not prompt:
            return jsonify({'success': False, 'error': 'Missing prompt'}), 400

        api_key = get_gemini_api_key()
        if not api_key:
            return jsonify({'success': False, 'error': 'Gemini API key not configured on server'}), 500

        model_name = os.environ.get('GOOGLE_MODEL', 'gemini-3-flash-preview')
        content = call_google_api(api_key, prompt, model_name)

        return jsonify({'success': True, 'content': content})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def call_google_api(api_key, prompt, model_name='gemini-3-flash-preview'):
    api_key = api_key.strip()
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)
    
    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.7,
            max_output_tokens=8192
        )
    )
    
    if not response.text:
        raise Exception("Model returned empty response")
        
    return response.text

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
