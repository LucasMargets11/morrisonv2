# GrupoBairen Real Estate

A modern real estate platform built with React and Django.

## Features

- Property listings with detailed information
- User authentication and authorization
- Property management for agents
- Booking system
- Multi-language support (English, Spanish, Portuguese)
- Responsive design

## Tech Stack

### Frontend
- React
- TypeScript
- TailwindCSS
- React Query
- React Router
- Lucide Icons

### Backend
- Django
- Django REST Framework
- PostgreSQL
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- PostgreSQL

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/grupobairen.git
cd grupobairen
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
python -m pip install -r requirements.txt
```

4. Create a `.env` file in the root directory:
```env
# Django
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=grupobairen
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# Frontend
VITE_API_URL=http://localhost:8000/api
```

5. Run database migrations:
```bash
cd backend
python manage.py migrate
```

6. Start the development servers:

In one terminal:
```bash
npm run dev
```

In another terminal:
```bash
cd backend
python manage.py runserver
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.