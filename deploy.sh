#!/bin/bash

# Deploy Couples Truth or Dare Game to Google Cloud Run

# Set your project ID
PROJECT_ID="ashwinstock"
SERVICE_NAME="couples-truth-dare"
REGION="us-central1"

# Set project
gcloud config set project $PROJECT_ID

# Build the container image using Cloud Build
echo "Building container image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "COUPLES_PASSWORD=${COUPLES_PASSWORD:-changeme123}" \
  --set-env-vars "GOOGLE_API_KEY=${GOOGLE_API_KEY}" \
  --set-env-vars "ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}" \
  --set-env-vars "OPENAI_API_KEY=${OPENAI_API_KEY}" \
  --set-env-vars "GOOGLE_MODEL=${GOOGLE_MODEL:-gemini-2.0-flash}" \
  --set-env-vars "ANTHROPIC_MODEL=${ANTHROPIC_MODEL:-claude-sonnet-4-20250514}" \
  --set-env-vars "OPENAI_MODEL=${OPENAI_MODEL:-gpt-4o-mini}" \
  --set-env-vars "SESSION_SECRET=$(openssl rand -hex 32)"

echo "Deployment complete!"
echo "Your app is available at the URL shown above"
