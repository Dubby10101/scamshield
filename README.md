# ScamShield - AI-Powered Scam Website Detection

## Project Overview
ScamShield is a web platform that enables users to input website URLs and receive a scam likelihood score, educating them about potential online threats. The platform analyzes URLs, assigns a trustworthiness rating, and incentivizes user engagement through a credit-based reward system.

## Features
- URL submission and analysis
- Scam likelihood scoring (0-100)
- User account system with credit rewards
- Public scam watchlist
- Educational information about detected scam patterns

## Project Structure
- `frontend/`: React-based user interface
- `backend/`: Python Flask API server
- `ai_model/`: Reinforcement learning model for scam detection
- `database/`: Database schemas and connection utilities

## Technology Stack
- Frontend: React.js, HTML, CSS
- Backend: Python, Flask
- AI: Reinforcement Learning (Q-learning), BeautifulSoup for web scraping
- Database: SQLite (development), PostgreSQL (production)

## Reward System
- 5 credits for each URL submission
- 50 credits bonus when a submitted URL is confirmed as a scam
- Future plans for credit redemption options

## Deployment Options

### Local Deployment
For Windows users:
```
deploy-local.bat
```

For Linux/Mac users:
```
chmod +x deploy-local.sh
./deploy-local.sh
```

### Cloud Deployment
We've configured the project for easy deployment to free cloud services:

1. Backend: [Render.com](https://render.com/)
2. Frontend: [Netlify](https://netlify.com/)

See the [DEPLOYMENT.md](DEPLOYMENT.md) file for detailed instructions.

## Development Roadmap
1. Set up basic project structure ✅
2. Implement frontend UI ✅
3. Develop backend API ✅
4. Create AI model for URL analysis ✅
5. Integrate user account and credit system ✅
6. Deploy and test the platform
7. Gather user feedback and iterate