
# GrowWise — Behavioral Habit & Learning Intelligence

GrowWise is a full-stack habit tracking and behavioral analysis application powered by Machine Learning.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Recharts |
| Backend | Python, FastAPI, Uvicorn |
| Machine Learning | Scikit-learn, NumPy, Statsmodels |
| Authentication | Supabase Auth |
| Cloud Database | Supabase PostgreSQL |
| Local Development Storage | JSON |

## Machine Learning Features

- K-Means++ — Weekly behavioral pattern clustering
- Logistic Regression — Habit completion probability prediction
- Naive Bayes — Day-of-week pattern discovery
- CUSUM — Change-point detection
- Holt's Exponential Smoothing — Seven-day forecasting
- Pearson Correlation — Habit synergy analysis

## Project Structure

```text
GrowWise/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── ml/
│   │   ├── models/
│   │   ├── db.py
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── supabase_schema.sql
├── start_app.bat
├── start_app.ps1
└── README.md
```

## Local Setup

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend API documentation: http://localhost:8000/docs

### Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL Editor.
3. Execute `supabase_schema.sql`.
4. Configure the frontend environment variables in `frontend/.env`.

Required variables:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Never expose a Supabase service-role key in frontend code.

## Deployment

Planned deployment:

- Frontend: Vercel
- Backend: Render
- Authentication and database: Supabase

## License

Add your chosen license before distributing this project.
