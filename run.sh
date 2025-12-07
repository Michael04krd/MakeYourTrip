#!/bin/bash
cd backend && source venv/bin/activate && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
cd frontend && python3 -m http.server 3000 --bind 127.0.0.1 &

wait
