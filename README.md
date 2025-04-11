# CAC - Comparateur Assurance Client

## Overview
CAC (Comparateur Assurance Client) is a comprehensive insurance product comparison platform. The system allows users to compare insurance offerings from multiple providers including UTWIN, April, Metlife, and Cardif. The platform integrates with HubSpot for CRM functionality and Comparadise for lead management.

## Project Structure

### Backend (FastAPI)
- REST API for client-side interactions
- Authentication system with JWT tokens
- HubSpot integration for CRM functionality
- UTWIN SOAP API integration for insurance product comparison
- PostgreSQL database for data persistence

### Frontend (Angular)
- Modern responsive UI built with Angular
- Authentication system with login/register
- Dashboard for quick access to important features
- Lead management
- Project and comparison management

## Features

### Authentication
- Email/password authentication
- HubSpot OAuth integration
- JWT token-based sessions

### Lead Management
- Create, view, update, and delete leads
- Sync leads with HubSpot CRM
- Track lead status and history

### Project Management
- Create projects for leads
- Manage loan and insurance details
- Track project status

### Insurance Comparison
- Compare insurance products from multiple providers
- View detailed comparison results
- Customize comparison parameters

## Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## API Documentation
The API documentation is available at `/docs` or `/redoc` when the backend server is running.

## Technologies Used

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- Pydantic for data validation
- JWT for authentication
- Alembic for database migrations
- ZEEP for SOAP API integration

### Frontend
- Angular
- TypeScript
- RxJS for reactive programming
- Angular Router for navigation

### Database
- PostgreSQL

## Integrations
- HubSpot API for CRM
- UTWIN SOAP API for insurance comparison
- Future: April, Metlife, and Cardif integrations