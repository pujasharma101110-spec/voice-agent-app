# Voice AI Backend

This is a FastAPI-based backend for the Voice AI project.

## Requirements
- Python 3.8+
- `pip` package manager

## Setup Instructions

1. **Create and Activate a Virtual Environment**
   It's recommended to use a virtual environment.
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. **Install Dependencies**
   Install the required Python packages using `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```

3. **Database Migrations**
   If you have database changes, apply them using Alembic:
   ```bash
   alembic upgrade head
   ```

## Running the Application

To start the FastAPI server locally, run the following command from the project root directory:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The application will be accessible at:
- **API Base URL**: `http://localhost:8000/`
- **Swagger UI Documentation**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

## Project Structure

- `app/`: Contains the main FastAPI application code, routes, and models.
- `alembic/`: Database migration scripts.
- `tests/`: Unit tests.
- `audio/` & `uploads/`: Directories for storing audio and uploaded files.
