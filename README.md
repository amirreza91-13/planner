
# Planner

<p align="center">
  <img src="frontend/src/assets/hero.png" alt="Planner — Personal Planning Application" width="100%" />
</p>

<p align="center">
  <strong>A modern, local-first personal planning application.</strong>
  <br />
  Built with React, TypeScript, Python, and Django.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge" alt="In Development" />
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="React and TypeScript" />
  <img src="https://img.shields.io/badge/Backend-Django-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django Backend" />
</p>

---

## Overview

Planner is a personal planning web application designed to help organize tasks, manage time, and track progress through a modern web interface.

The project combines a React and TypeScript frontend with a Django backend and a SQLite database for local development.

**Current focus:** building a maintainable application structure and improving the development workflow.

## Tech Stack

<p align="center">
  <a href="https://skillicons.dev">
    <img
      src="https://skillicons.dev/icons?i=react,ts,vite,python,django,sqlite,git&perline=7"
      alt="React, TypeScript, Vite, Python, Django, SQLite, and Git"
    />
  </a>
</p>

### Technologies

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| TypeScript | Type-safe frontend development |
| Vite | Frontend development and build tooling |
| Python | Backend programming language |
| Django | Backend web framework |
| Django REST Framework | REST API development |
| SQLite | Local development database |
| Git | Version control |

## Architecture

```text
Planner/
├── config/          # Django project configuration
├── core/            # Main Django application
│   ├── management/  # Custom management commands
│   └── migrations/  # Database migrations
├── frontend/        # React + TypeScript application
├── manage.py        # Django management entry point
├── requirements.txt # Python dependencies
└── README.md
```

## Getting Started

### Prerequisites

Install the following tools before running the project:

- Python
- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/amirreza91-13/planner.git
cd planner
```

### 2. Set up the backend

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate it in Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Set a secure Django secret key and appropriate local development settings before running the backend.

Do not commit private environment files or real credentials to Git.

### 4. Apply database migrations

```bash
python manage.py migrate
```

### 5. Start the Django server

```bash
python manage.py runserver
```

The development server normally runs at:

http://127.0.0.1:8000/

### 6. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local frontend URL in the terminal.

If the frontend cannot communicate with the backend, verify the API endpoint and the development CORS configuration.

## Development

### Backend checks

```bash
python manage.py check
```

### Frontend production build

```bash
cd frontend
npm run build
```

## Security

- Never commit `.env` files, API keys, passwords, or private credentials.
- Never use Django's development-only secret key in production.
- Keep `DEBUG` disabled in production.
- Configure `ALLOWED_HOSTS` for the actual deployment environment.
- Keep local databases, logs, backups, and generated files out of the public repository.
- Review dependencies and configuration before deployment.

## Project Status

Planner is currently under development.

The architecture and features may evolve as development continues. Refer to the repository for the current implementation.

## Roadmap

- [ ] Improve the planning interface
- [ ] Expand task and time-management workflows
- [ ] Improve API integration
- [ ] Add automated tests
- [ ] Improve setup and developer documentation

## Author

**Amirreza Mirhaj**

- GitHub: [@amirreza91-13](https://github.com/amirreza91-13)
- LinkedIn: [Amirreza Mirhaj](https://www.linkedin.com/in/amirreza-mirhaj-490250435/)

---

<p align="center">
  <sub>Built incrementally with a focus on maintainability, usability, and continuous learning.</sub>
</p>