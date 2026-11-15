# ExpenseWise – Full-Stack Personal Expense & Budget Tracker

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-10B981.svg)](https://react.dev/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38BDF8.svg)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-47A248.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

**ExpenseWise** is a production-quality personal finance management web application designed with a fintech SaaS aesthetic. Built using the **MERN Stack** (MongoDB, Express.js, React.js with Vite, Node.js), ExpenseWise enables users to effortlessly track daily expenses, manage income streams, set category budgets with real-time warning indicators, and visualize long-term financial trends through interactive charts.

---

## 🌟 Key Features

### 1. 📊 Interactive Dashboard
- **Real-Time Financial Cards**: Total Balance (all-time), Total Income, Total Expenses, and Monthly Savings with month-over-month trend indicators.
- **6-Month Overview**: Interactive Recharts bar and area chart displaying income vs expenses trends.
- **Expense Breakdown**: Donut chart displaying category-wise expenses with percentages and custom tooltips.
- **Recent Transactions**: Quick view of latest 5 activities with direct quick-action buttons.
- **Dynamic Recalculation**: All values automatically update when transactions are created, edited, or deleted.

### 2. 💳 Comprehensive Transaction Management
- Add, view, edit, and delete transactions with confirmation dialogs.
- Categorization into tailored Income categories (*Salary, Freelance, Business, Investment, Other*) and Expense categories (*Food, Shopping, Travel, Bills, Entertainment, Healthcare, Education, Rent, Transportation, Other*).
- **Search & Filter**: Search transactions by title, filter by type (income/expense), category, date ranges, and sort by date or amount.
- **Pagination**: Server-side pagination controls for scalable data handling.
- **CSV Data Export**: Download transaction history to formatted CSV spreadsheets.

### 3. 🎯 Smart Monthly Budgets
- Set category-specific monthly spending limits with customizable month and year selectors.
- **Dynamic Spending Tracker**: Computes real-time spending for each category directly from actual expense records.
- **Visual Alert System**:
  - 🟢 **On Track** (< 80% used): Emerald progress bar.
  - 🟡 **Warning Alert** (80% - 100% used): Amber progress bar with alert badge.
  - 🔴 **Exceeded Alert** (> 100% used): Red progress bar highlighting over-budget amounts.
- Top-level monthly budget summary banner showing Total Budget, Total Spent, Remaining Room, and Overall % utilized.

### 4. 📈 Reports & Deep Analytics
- 12-month financial trajectory charts comparing income, expenses, and net savings.
- Category distribution charts for both expenses and income.
- Yearly financial performance ledgers.
- Detailed monthly summary tables with individual savings ratios.
- One-click CSV report export.

### 5. 👤 Profile & Preferences
- Update personal profile details (Name, Email).
- Secure password change module with bcrypt verification.
- **Multi-Currency Support**: Default INR (₹), with instant switching to USD ($), EUR (€), GBP (£), JPY (¥), CAD (CA$), or AUD (AU$).
- **Dark Mode Support**: Seamless toggle between Light and Dark fintech themes, persisted in localStorage and database profile.

### 6. 🔒 Enterprise-Grade Security
- Password hashing using `bcryptjs` (salt rounds: 10).
- JWT (JSON Web Token) authentication with Bearer token validation middleware.
- Input validation on all API endpoints using `express-validator`.
- Strict user data isolation: all database queries verify `userId` extracted directly from verified authentication tokens.
- Centralized error-handling middleware.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript (ES6+), Tailwind CSS, React Router DOM v6, Axios, Recharts, Lucide React |
| **Backend** | Node.js, Express.js (MVC Pattern), Mongoose ODM, JWT (`jsonwebtoken`), `bcryptjs`, `express-validator`, CORS, dotenv |
| **Database** | MongoDB (v7+ or MongoDB Atlas) |

---

## 📁 Project Architecture

```
ExpenseWise/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, logout, me
│   │   ├── userController.js     # Profile updates, change password
│   │   ├── transactionController.js # Transaction CRUD, search, filter, paginate
│   │   ├── budgetController.js   # Budget CRUD & dynamic spending calculation
│   │   ├── dashboardController.js# Dynamic summary, charts & trends aggregation
│   │   └── reportController.js   # 12-month & yearly reports, category analytics
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification middleware
│   │   ├── errorMiddleware.js    # 404 handler & centralized error handler
│   │   └── validateMiddleware.js # express-validator validation runner
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt pre-save hashing
│   │   ├── Transaction.js        # Transaction schema with indexes & enums
│   │   └── Budget.js             # Budget schema with compound unique index
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── reportRoutes.js
│   ├── utils/
│   │   ├── generateToken.js      # JWT signing helper
│   │   └── seedData.js           # Database seeder with realistic test data
│   ├── testEndpoints.js          # Automated end-to-end backend API test suite
│   ├── server.js                 # Express application entry point
│   ├── .env                      # Backend environment variables
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg           # Brand vector icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Sticky top navigation with theme/currency toggle
│   │   │   ├── Sidebar.jsx       # Fixed desktop & responsive mobile drawer navigation
│   │   │   ├── SummaryCard.jsx   # KPI metric card with percentage changes
│   │   │   ├── MonthlyChart.jsx  # Recharts composed/bar chart for monthly trends
│   │   │   ├── CategoryChart.jsx # Recharts donut/pie chart for category spending
│   │   │   ├── TransactionForm.jsx # Add & Edit transaction modal form
│   │   │   ├── TransactionTable.jsx# Filterable, sortable transaction data table
│   │   │   ├── BudgetCard.jsx    # Visual category card with 80%/100% alert states
│   │   │   ├── BudgetModal.jsx   # Create/Edit monthly budget modal
│   │   │   ├── DeleteConfirmModal.jsx # Confirmation dialog before deletion
│   │   │   ├── ProtectedRoute.jsx# Auth guard component
│   │   │   └── LoadingSpinner.jsx# Animated loading indicator
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Authentication & theme state provider
│   │   │   └── ToastContext.jsx  # Toast notifications provider
│   │   ├── pages/
│   │   │   ├── Landing.jsx       # Public landing page with hero, features & preview
│   │   │   ├── Login.jsx         # Sign in page with 1-click Demo account button
│   │   │   ├── Register.jsx      # New account registration page
│   │   │   ├── Dashboard.jsx     # Main financial dashboard
│   │   │   ├── Transactions.jsx  # Transaction history with search, filters & export
│   │   │   ├── Budgets.jsx       # Monthly budget planner
│   │   │   ├── Reports.jsx       # Financial analytics and 12-month performance
│   │   │   └── Profile.jsx       # Profile settings & currency preferences
│   │   ├── services/
│   │   │   └── api.js            # Axios client with JWT interceptor & API endpoints
│   │   ├── utils/
│   │   │   ├── formatters.js     # Currency & date formatters, category constants
│   │   │   └── exportCsv.js      # CSV export utility
│   │   ├── App.jsx               # Main React router tree
│   │   ├── index.css             # Tailwind base & custom scrollbar styles
│   │   └── main.jsx              # React root DOM bootstrap
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── README.md
└── package.json                  # Root runner script
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** running locally on port `27017` or a MongoDB Atlas connection URI.

---

### Step 1: Clone or Navigate to the Project

```bash
cd ExpenseWise
```

### Step 2: Set Up the Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file (already created, or create from `.env.example`):
   ```env
   PORT=5001
   NODE_ENV=development
   MONGO_URI=mongodb://127.0.0.1:27017/expensewise
   JWT_SECRET=expensewise_super_secret_jwt_key_2026_finance
   JWT_EXPIRES_IN=30d
   CLIENT_URL=http://localhost:5173
   ```
4. **Seed Sample Data**:
   Populates a demo account with 40+ realistic transactions spanning the past 6 months and active budgets with all alert states:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   # Server runs on http://localhost:5001
   ```

### Step 3: Set Up the Frontend

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   # Vite development server runs on http://localhost:5173
   ```
4. Open your browser and navigate to **`http://localhost:5173`**.

---

## 🔑 Demo Account Credentials

ExpenseWise comes pre-configured with a ready-to-use demo account:

- **Email**: `demo@expensewise.com`
- **Password**: `password123`
- **Instant Access**: You can also simply click the **"One-Click Demo Login"** button on the Login page or Landing page!

---

## 🧪 Automated Testing

ExpenseWise includes automated test suites covering all REST endpoints, MongoDB aggregations, and data isolation:

```bash
# Run comprehensive QA & audit suite from root
npm test

# Or run from backend
cd backend
npm test

# Run API lifecycle tests
npm run test:api
```

This verifies:
1. Health check (`/api/health`)
2. Authentication (`/api/auth/login`, `/api/auth/me`)
3. Dashboard summaries (`/api/dashboard/summary`, `/api/dashboard/monthly-overview`, `/api/dashboard/category-breakdown`, `/api/dashboard/recent-transactions`)
4. Transaction lifecycle (Create, Read, Update, Delete with validation)
5. Budgets calculation (Actual spending, remaining calculation, 80% & 100% threshold flags)
6. Reports (12-month ledger, yearly reports, category analytics)

---

## 📡 REST API Documentation

All protected endpoints require the HTTP header:
`Authorization: Bearer <your_jwt_token>`

### Authentication
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user (name, email, password) | Public |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | Public |
| `POST` | `/api/auth/logout` | Clear user session | Public |
| `GET` | `/api/auth/me` | Fetch currently authenticated user | Protected |

### User Profile
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Get user profile details | Protected |
| `PUT` | `/api/users/profile` | Update name, email, currency, theme | Protected |
| `PUT` | `/api/users/change-password` | Update password with current password check | Protected |

### Transactions
| Method | Endpoint | Query / Body Params | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/transactions` | `title`, `amount`, `type`, `category`, `date`, `description` | Protected |
| `GET` | `/api/transactions` | `search`, `type`, `category`, `startDate`, `endDate`, `sortBy`, `sortOrder`, `page`, `limit` | Protected |
| `GET` | `/api/transactions/:id` | Fetch single transaction | Protected |
| `PUT` | `/api/transactions/:id` | Update transaction fields | Protected |
| `DELETE`| `/api/transactions/:id` | Delete transaction | Protected |

### Budgets
| Method | Endpoint | Query / Body Params | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/budgets` | `category`, `amount`, `month`, `year` | Protected |
| `GET` | `/api/budgets` | `month`, `year` (returns spent, remaining, % used) | Protected |
| `PUT` | `/api/budgets/:id` | `amount`, `category` | Protected |
| `DELETE`| `/api/budgets/:id` | Delete category budget | Protected |

### Dashboard
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/summary` | Balance, Income, Expense, Savings & trends | Protected |
| `GET` | `/api/dashboard/monthly-overview` | Last 6 months income vs expenses for charts | Protected |
| `GET` | `/api/dashboard/category-breakdown` | Category expense breakdown for donut chart | Protected |
| `GET` | `/api/dashboard/recent-transactions` | Latest 5 transactions | Protected |

### Reports
| Method | Endpoint | Query Params | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/monthly` | `year` (returns full 12-month ledger) | Protected |
| `GET` | `/api/reports/yearly` | Multi-year summary of income, expenses & savings | Protected |
| `GET` | `/api/reports/category-wise` | `year`, `month`, `type` ('expense' / 'income') | Protected |

---

## 🌐 Production Deployment Guide

### 1. Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and whitelist network access (`0.0.0.0/0` for cloud deployment).
3. Copy your connection string: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/expensewise?retryWrites=true&w=majority`.

### 2. Backend (Render / Railway)
1. Push this repository to GitHub.
2. In [Render](https://render.com), create a new **Web Service** pointing to the repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Set Environment Variables:
   - `PORT`: `5001`
   - `NODE_ENV`: `production`
   - `MONGO_URI`: *Your MongoDB Atlas connection URI*
   - `JWT_SECRET`: *A secure random string*
   - `CLIENT_URL`: *Your Vercel frontend URL (e.g. `https://expensewise.vercel.app`)*

### 3. Frontend (Vercel)
1. In [Vercel](https://vercel.com), create a new project and import the repository.
2. Configure settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Set Environment Variable:
   - `VITE_API_URL`: *Your Render backend URL + `/api` (e.g. `https://expensewise-api.onrender.com/api`)*
4. Deploy!

---

## 📄 License

This project is licensed under the ISC License. Developed as a production-quality full-stack college project.
