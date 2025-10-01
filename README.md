# Enterprise Todo Application

An end-to-end enterprise todo management platform featuring a Django REST API backend and a React single-page application frontend. The system supports JWT authentication, role-based access control for administrators and standard users, and comprehensive task management workflows.

## Project Structure

```
.
├── enterprise_todo/        # Django project configuration
├── tasks/                  # Core application logic (models, APIs, migrations)
├── frontend/               # React application source
├── manage.py               # Django management entry point
├── requirements.txt        # Backend dependencies
└── README.md               # This guide
```

## Backend Setup (Django + SQLite)

1. **Create and activate a virtual environment** (optional but recommended):
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Linux/macOS
   .venv\\Scripts\\activate   # Windows
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run migrations** (creates the SQLite database, custom user model, seed users, and tasks table):
   ```bash
   python manage.py migrate
   ```

4. **Start the development server**:
   ```bash
   python manage.py runserver
   ```

5. **Access the API** at `http://localhost:8000/api/`.

### Default Accounts

| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | admin    | admin123  |
| User  | john     | john123   |

Administrators can view and manage every task, while regular users can only access their own.

### Django Admin Panel

The Django admin is available at `http://localhost:8000/admin/`. Use the admin credentials above (or any superuser you create) to manage users and tasks through the web UI.

## Frontend Setup (React)

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the React development server**:
   ```bash
   npm start
   ```

3. **Open the app** at `http://localhost:3000`. The frontend communicates with the Django API at `http://localhost:8000/api/` and stores JWT tokens in `localStorage` for authenticated requests.

### Key Frontend Features

- Login and registration screens with validation feedback.
- Dashboard protected behind authentication.
- Administrators see all tasks and their owners; standard users only see their own tasks.
- Full CRUD task management with inline editing and responsive UI.

## Environment Variables

The React app defaults to `http://localhost:8000/api/` for API calls. To override this, create a `.env` file inside `frontend/` with:

```
REACT_APP_API_URL=http://your-api-host/api/
```

Restart the React development server after modifying environment variables.

## Testing the Workflow

1. Launch both backend and frontend servers.
2. Visit `http://localhost:3000` and log in using the provided sample accounts.
3. Create, update, and delete tasks from the dashboard UI.
4. Confirm role-based access by comparing the admin and user experiences.

Enjoy building on top of this enterprise-ready todo foundation!
