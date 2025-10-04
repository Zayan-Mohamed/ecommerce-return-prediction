# Hybrid Deployment Strategy for Vercel

## Overview

Due to Vercel's 250MB limit for serverless functions, we've implemented a **hybrid deployment strategy** that attempts to provide your full ML functionality while gracefully falling back to a lightweight version if size constraints are hit.

## How It Works

### 1. **Primary Attempt: Full Application**

- The deployment first tries to load your complete ML application from `/services/main.py`
- This includes all your agents:
  - ModelInferenceAgent with trained models
  - FeatureEngineeringAgent
  - OrderProcessingAgent
  - BusinessIntelligenceAgent
  - All API endpoints and functionality

### 2. **Fallback: Lightweight Application**

- If the full application exceeds size limits, it automatically falls back
- Uses heuristic-based predictions instead of ML models
- Maintains the same API interface for compatibility
- Provides reasonable predictions based on business rules

## API Compatibility

Both modes provide the same API endpoints:

```bash
# Core endpoints available in both modes
GET  /                    # API information
GET  /health              # Health check
POST /predict/single      # Single prediction
GET  /predict/health      # Prediction service health
GET  /predict/model-info  # Model information
```

## Prediction Logic

### Full Mode (if size permits)

- Uses your trained scikit-learn models
- Complete feature engineering pipeline
- All ML agents working together
- Stored model artifacts (.pkl files)

### Lightweight Mode (fallback)

- Heuristic-based predictions using business rules:
  - **Price risk**: Higher prices → higher return probability
  - **Category risk**: Electronics, Fashion → higher risk
  - **Age risk**: Younger customers → higher risk
  - **Quantity risk**: Multiple items → higher risk
  - **Payment risk**: Credit cards, BNPL → slight risk increase

## Response Format

Both modes return the same response structure:

```json
{
  "success": true,
  "prediction": {
    "will_return": false,
    "return_probability": 0.35,
    "confidence": 0.75,
    "risk_level": "MEDIUM"
  },
  "model_info": {
    "model_name": "Return Prediction Model",
    "version": "1.0.0",
    "type": "ml" or "rule_based"
  },
  "metadata": {
    "processing_time_ms": 150,
    "mode": "full" or "lightweight"
  }
}
```

## Deployment Status Detection

You can check which mode is running:

```bash
curl https://your-app.vercel.app/
```

Response will indicate:

- `"mode": "full"` - Full ML application loaded
- `"mode": "lightweight"` - Fallback heuristic mode

## Local Development vs Production

### Local Development (`/services/main.py`)

- Full functionality always available
- All ML models and agents loaded
- Complete feature engineering
- Database integration
- Analytics and business intelligence

### Production Deployment

- **Best case**: Full functionality (if under 250MB)
- **Fallback**: Lightweight but functional predictions
- Same API interface maintained
- Graceful degradation of features

## Frontend Compatibility

Your React frontend will work with both modes because:

- Same API endpoints
- Same response structure
- Same authentication flow
- Transparent fallback (users may not notice the difference)

## Optimization for Full Deployment

To increase chances of full deployment working:

1. **Model Size Optimization**:

   - Use model compression techniques
   - Remove unused model artifacts
   - Use lighter ML libraries if possible

2. **Dependency Optimization**:

   - Only include essential packages
   - Use minimal versions of libraries
   - Consider model-specific deployments

3. **Alternative Approaches**:
   - External model hosting (separate API)
   - Edge deployment for models
   - Hybrid architecture (lightweight + external ML)

## Monitoring and Alerts

You can monitor which mode is running:

- Check the `/health` endpoint response
- Look for `"mode"` field in API responses
- Set up alerts if fallback mode is triggered

This strategy ensures your application **always works** while attempting to provide the **best possible functionality** within Vercel's constraints.
