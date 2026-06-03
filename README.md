# Options Income & Covered Call Optimizer (Frontend)

A specialized, interactive dashboard designed to evaluate the profitability and mechanics of income-focused options strategies. This front-end application calculates key performance indicators (KPIs) in real-time and provides a visual playground for modeling position adjustments ("rolling") on high-volatility assets.

## Core Features
* **Real-Time KPI Engine:** Instantly calculates Option Yield (%), Annualized Return (APR %), and Break-Even Prices dynamically as underlying variables change.
* **Interactive P&L Visualization:** Utilizes Recharts to render a responsive payoff graph, mapping exact profit and loss outcomes against underlying asset price movements at expiration.
* **Position Rolling Simulator:** Allows users to model defensive or aggressive contract adjustments (buy-to-close vs. new sold premium) to compute net roll credits/debits and adjusted cost basis.
* **Live Market Data Ready:** Architected to seamlessly ingest formatted JSON from external market data APIs for real-time options chain analysis.

## Tech Stack
* **Framework:** React + Vite
* **Styling:** Tailwind CSS
* **Charting:** Recharts
* **Icons:** Lucide-React

## Local Development Setup

To run this dashboard locally, ensure you have [Node.js](https://nodejs.org/) installed, then follow these steps:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YourUsername/options-dashboard.git](https://github.com/YourUsername/options-dashboard.git)
   cd options-dashboard
2. Install dependencies:
   Bash
   npm install

3. Start the Vite development server:
   Bash
   npm run dev

4. View the application:
   Open http://localhost:5173/ in your browser.
