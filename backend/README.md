# FastAPI Backend for File Uploads

## Setup & Running

1. **Activate the virtual environment:**

   ```sh
   source ../venv/bin/activate
   ```

2. **Run the FastAPI server:**

   ```sh
   uvicorn main:app --reload
   ```

- The server will be available at http://127.0.0.1:8000
- Uploaded files will be saved in the `uploads/` directory.

## Endpoint

- `POST /upload/` — Upload a file (multipart/form-data) 