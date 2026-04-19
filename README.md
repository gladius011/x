# VMA Calculator – Cooper & Demi-Cooper Tests

A full-stack web application to calculate and manage VMA (Vitesse Maximale Aérobie) from Cooper and Demi-Cooper tests.

## 🏗 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18 + Vite + TailwindCSS     |
| Backend   | Node.js + Express                 |
| Database  | PostgreSQL                        |
| Charts    | Recharts                          |
| PDF       | jsPDF                             |
| Testing   | Vitest                            |

## 📁 Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/      # Validation, error handling
│   │   ├── models/         # DB queries
│   │   ├── routes/         # Express routes
│   │   ├── utils/          # VMA calculation, level classification
│   │   └── index.js        # App entry point
│   ├── migrations/         # DB schema
│   ├── seed/               # Example test data
│   └── tests/              # Unit tests
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API calls
│   │   ├── utils/          # Frontend VMA utilities
│   │   └── App.jsx
│   └── ...
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **npm** >= 9

### 1. Clone & Install

```bash
cd project
npm install
npm run install:all
```

### 2. Set Up the Database

Create a PostgreSQL database:

```sql
CREATE DATABASE vma_calculator;
```

Copy the backend env file and edit it:

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your PostgreSQL credentials
```

### 3. Run Migrations

```bash
cd backend && npm run migrate
```

### 4. Seed Example Data (Optional)

```bash
npm run seed
```

### 5. Start Development Servers

From the project root:

```bash
npm run dev
```

This starts:
- **Backend** at `http://localhost:3001`
- **Frontend** at `http://localhost:5173`

## 📡 API Endpoints

| Method | Endpoint             | Description                    |
|--------|----------------------|--------------------------------|
| POST   | `/api/tests`         | Save a new test result         |
| GET    | `/api/tests`         | Get all test results           |
| GET    | `/api/tests?level=3` | Filter by VMA level            |
| GET    | `/api/tests?type=cooper` | Filter by test type        |
| GET    | `/api/tests?search=John` | Search by name              |
| GET    | `/api/tests/:id`     | Get single test by ID          |
| DELETE | `/api/tests/:id`     | Delete a test result           |
| GET    | `/api/stats`         | Get statistics & averages      |
| GET    | `/api/tests/export/csv` | Export results to CSV       |

## 🧮 VMA Calculation

```
Total Test Time:
  Cooper      = 720 seconds (12 minutes)
  Demi-Cooper = 360 seconds (6 minutes)

Effective Time (s) = Total Test Time − Stop Time − Walking Time
Effective Time (h) = Effective Time (s) / 3600

VMA (km/h) = (Distance in meters / 1000) / Effective Time (h)
```

### Validation Rules

- Stop time + Walking time **cannot exceed** total test time
- Effective time must be **> 0**
- Distance must be **> 0**
- VMA is rounded to **2 decimal places**

## 📊 Level Classification

| Level | VMA Range     | Label        |
|-------|---------------|--------------|
| 1     | < 10 km/h     | Beginner     |
| 2     | 10–12 km/h    | Intermediate |
| 3     | 12–14 km/h    | Good         |
| 4     | 14–16 km/h    | Very Good    |
| 5     | > 16 km/h     | Excellent    |

## 🌙 Dark Mode

Toggle dark mode via the sun/moon icon in the header. Preference is saved in localStorage.

## License

MIT
