## FinEase Server

FinEase Server is the backend service for the FinEase-Personal Finance Management App.
It provides secure APIs for authentication validation, CRUD operations for transactions, financial summaries, and category-based analytics.

### 🔗 Live Server URL

https://finance-server-seven.vercel.app/

### 🔗 Client Repository

https://github.com/Ujjal-web/finance-client.git

### 🚀 Features

Built with Express.js and Node.js

Connected to MongoDB Atlas

Implements Firebase Admin SDK for token verification

### Fully supports:

Add Transaction

View Transactions

Delete Transaction

Update Transaction

View Transaction Details

Category-based Total Calculation

User-based Summary

Backend Sorting using { createdAt: -1 }

Clean & modular API routes

Secured API endpoints for protected operations

Hosted on Vercel

### 📌 API Endpoints Overview

| Method  | Endpoint | Description |
|---|---|---|
| POST| /transactions | Add a new transaction |
| GET | transactions?email=user@example.com | Get transactions of logged-in user |
| GET | transactions/:id | Get full details of a transaction |
| PUT |	/transactions/:id |	Update a transaction |
| DELETE |	/transactions/:id |	Delete a transaction |

### Summary API
| Method  | Endpoint | Description |
|---|---|---|
| POST| /transactions | Add a new transaction |
| GET | /summary?transactions?email=user@example.com | Get transactions of logged-in user |

Method	Endpoint	Description
GET	/summary?email=user@example.com	Get total income, expense, balance


### 🛡️ Authentication

+ Uses Firebase Admin SDK to verify user identity.

+ Only authenticated users may:

  + Create transactions

  + Update transactions

  + Delete transactions

  + Get protected data

### 🗄️ Technologies Used

+ Node.js

+ Express.js

+ Firebase Admin SDK

+ MongoDB Atlas

+ Vercel Deployment

+ Dotenv for environment variables
