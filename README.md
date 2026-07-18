# MediLens - AI Healthcare Report Intelligence

A production-ready AI-powered healthcare report intelligence platform that analyzes uploaded medical reports, extracts clinical parameters, predicts health risks, generates explainable AI insights, provides an intelligent medical assistant, and maintains report history. Built with Next.js, TypeScript, FastAPI, and SQLite.

---

# Table of Contents

- Overview
- Features
- Tech Stack
- Prerequisites
- Installation
- Running the Application
- Project Structure
- System Architecture
- Application Workflow
- Web Pages
- API Endpoints
- Deployment
- Development
- Testing
- Security
- Troubleshooting
- Support
- License
- Author

---

# Overview

MediLens is an AI-powered healthcare report intelligence platform that helps users understand their medical reports quickly and accurately.

Users can upload laboratory reports in PDF format and instantly receive:

- Clinical Parameter Extraction
- AI Risk Prediction
- Explainable Health Insights
- Medical Report Summaries
- AI Medical Chat Assistant
- Report History
- Personalized Settings

The platform provides a modern dashboard where users can manage reports, monitor health insights, and interact with an AI-powered healthcare assistant.

---

# Features

## Core Features

### ✅ PDF Report Upload

- Upload laboratory reports
- Secure file storage
- Automatic document processing
- PDF parsing using PyMuPDF

---

### ✅ Clinical Parameter Extraction

- Extract biomarkers automatically
- Detect medical values
- Organize report parameters
- Structured healthcare data

---

### ✅ AI Risk Prediction

- Health risk assessment
- Intelligent disease prediction
- Risk score generation
- Confidence-based analysis

---

### ✅ Explainable AI

- AI-generated report summaries
- Human-readable medical explanations
- Personalized recommendations
- Simplified clinical interpretation

---

### ✅ AI Medical Chat Assistant

- Ask questions about reports
- Medical report explanation
- AI-powered healthcare guidance
- Context-aware conversations

---

### ✅ Report History

- Store uploaded reports
- View previous analyses
- Search report history
- Download report summaries

---

### ✅ User Settings

- Theme selection
- AI provider configuration
- Notification preferences
- Persistent backend settings

---

### ✅ Responsive User Interface

- Modern healthcare dashboard
- Mobile-friendly layout
- Interactive visualizations
- Smooth user experience

---

# Tech Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts

---

## Backend

- FastAPI
- Python
- Uvicorn
- Pydantic
- PyMuPDF
- Python Multipart

---

## Database

- SQLite

---

## AI Services

- Rule-Based Risk Prediction
- Explainable AI
- LLM-Ready Architecture
- Configurable AI Providers

---

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: SQLite (Upgradeable to PostgreSQL)

---

# Prerequisites

- Node.js 18+
- Python 3.11+
- Git

---

# Installation

## Step 1: Clone Repository

```bash
git clone https://github.com/<username>/MediLens.git

cd MediLens
```

---

## Step 2: Backend Setup

```bash
cd backend
```

Create virtual environment

### Windows

```bash
python -m venv .venv

.venv\Scripts\activate
```

### macOS/Linux

```bash
python3 -m venv .venv

source .venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

---

## Step 3: Frontend Setup

Open another terminal

```bash
cd MediLens
```

Install packages

```bash
npm install
```

---

# Running the Application

## Start Backend

```bash
cd backend

uvicorn backend.app.main:app --reload
```

Backend URL

```
http://localhost:8000
```

API Documentation

```
http://localhost:8000/docs
```

---

## Start Frontend

```bash
npm run dev
```

Frontend URL

```
http://localhost:3000
```

---

# Project Structure

```
MediLens/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── config/
│   │   ├── database/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── uploads/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .venv/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   ├── types/
│   ├── styles/
│   └── utils/
│
├── public/
├── package.json
├── next.config.ts
├── tsconfig.json
├── README.md
└── tailwind.config.ts
```

---

# System Architecture

```
                    +---------------------------+
                    |     Next.js Frontend      |
                    +------------+--------------+
                                 |
                           REST API Calls
                                 |
                                 ▼
                 +-------------------------------+
                 |      FastAPI Backend          |
                 +---------------+---------------+
                                 |
    ---------------------------------------------------------------
    |             |               |             |                  |
    ▼             ▼               ▼             ▼                  ▼
 Report Upload  Parameter     Risk Prediction  AI Summary    Chat Assistant
                 Extraction      Engine        Generator
    |             |               |             |                  |
    ---------------------------------------------------------------
                                 |
                                 ▼
                           SQLite Database
```

---

# Application Workflow

```
Upload Medical Report (PDF)
            │
            ▼
PDF Processing
            │
            ▼
Clinical Parameter Extraction
            │
            ▼
AI Risk Prediction
            │
            ├── Health Risk Score
            ├── Medical Summary
            ├── Explainable AI
            ├── Recommendations
            └── Chat Assistant
            │
            ▼
Healthcare Dashboard
```

---

# Web Pages

| Page | Description |
|------|-------------|
| Home | Landing Page |
| Dashboard | Health Dashboard |
| Upload | Upload Medical Reports |
| Processing | AI Analysis Progress |
| Reports | Report History |
| Report Details | Individual Report Analysis |
| Download | Printable Report Summary |
| Chat | AI Medical Assistant |
| Settings | User Preferences |

**Total Pages:** **9**

---

# API Endpoints

## Health

```
GET     /health
```

---

## Reports

```
POST    /upload
POST    /extract
POST    /predict
POST    /explain
```

---

## AI Assistant

```
POST    /chat
```

---

## Settings

```
GET     /settings
PUT     /settings
```

---

# Deployment

## Backend (Render)

- Create Render account
- Connect GitHub repository
- Create Web Service

Install dependencies

```bash
pip install -r requirements.txt
```

Start command

```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
```

Configure Environment Variables

```
MEDILENS_DB_PATH
MEDILENS_UPLOAD_DIR
GROQ_API_KEY
MEDILENS_API_TITLE
MEDILENS_API_VERSION
```

---

## Frontend (Vercel)

- Create Vercel account
- Import GitHub repository
- Deploy

Environment Variable

```
NEXT_PUBLIC_API_URL
```

---

# Development

## Code Standards

- Next.js App Router
- TypeScript
- FastAPI
- RESTful API Design
- Modular Architecture
- Responsive Design

---

## Adding New Features

```bash
git checkout -b feature/feature-name
```

Commit

```bash
git commit -m "Added feature"
```

Push

```bash
git push origin feature/feature-name
```

Create Pull Request.

---

# Testing

Backend

```bash
cd backend

pytest
```

Frontend

```bash
npm run lint
```

---

# Security

- Secure File Upload
- Input Validation
- CORS Protection
- Persistent User Settings
- SQL Injection Prevention
- API Validation using Pydantic
- Secure Backend Configuration

---

# Troubleshooting

## Backend

### Import Errors

```bash
pip install -r requirements.txt
```

### Port Already in Use

```bash
uvicorn backend.app.main:app --reload --port 8001
```

---

## Frontend

### Package Errors

```bash
npm install
```

### Development Server Issues

```bash
npm run dev
```

---

# Support

For bug reports, feature requests, or improvements, please create an issue in the GitHub repository.

---

# License

This project is released under the MIT License.

---

# Author

**Tanisha Khairnar**

📧 Email: **khairnar.tanisha@gmail.com**
