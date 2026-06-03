import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function App() {
  // Core Position State
  const [stockPrice, setStockPrice] = useState(130.00);
  const [strikePrice, setStrikePrice] = useState(135.00);
  const [premium, setPremium] = useState(4.50);
  const [dte, setDte] = useState(30);

  // Rolling Simulator State
  const [buyToClose, setBuyToClose] = useState(1.50);
  const [newPremium, setNewPremium] = useState(3.00);
  const [newStrike, setNewStrike] = useState(140.00);
  const [newDte, setNewDte] = useState(45);

  // Add this new state for the search bar
  const [ticker, setTicker] = useState("NVDA");
  const [loading, setLoading] = useState(false);

  // Add this function to call your Python API
  const fetchMarketData = async (symbol) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/options-data/${symbol}`);
      const data = await response.json();
      
      if (!data.error) {
        setStockPrice(data.stockPrice);
        setStrikePrice(data.strikePrice);
        setPremium(data.premium);
        setDte(data.dte);
      }
    } catch (error) {
      console.error("Failed to fetch market data:", error);
    }
    setLoading(false);
  };

  // Core Math
  const optionYield = (premium / stockPrice) * 100;
  const annualizedReturn = optionYield * (365 / dte);
  const breakEven = stockPrice - premium;
  const maxReturnAssigned = ((strikePrice - stockPrice + premium) / stockPrice) * 100;

  // Rolling Math
  const netRollCredit = newPremium - buyToClose;
  const adjustedPremium = premium + netRollCredit;
  const adjustedAnnualized = (adjustedPremium / stockPrice) * (365 / (dte + newDte)) * 100;

  // Generate Data for Payoff Chart
  const chartData = [];
  const minPrice = stockPrice * 0.8; // 20% drop
  const maxPrice = stockPrice * 1.2; // 20% gain
  const step = (maxPrice - minPrice) / 30; // 30 data points

  for (let p = minPrice; p <= maxPrice; p += step) {
    let profit = 0;
    // If stock is below strike, we keep premium but lose on underlying stock drop
    if (p <= strikePrice) {
      profit = (p - stockPrice) + premium;
    } else {
      // If stock is above strike, our profit is capped at the strike price difference + premium
      profit = (strikePrice - stockPrice) + premium;
    }
    chartData.push({ 
      price: Math.round(p * 100) / 100, 
      profit: Math.round(profit * 100) / 100 
    });
  }

  // Custom Tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const pnl = payload[0].value;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
          <p className="text-slate-600 mb-1">Stock Price: <span className="font-bold">${label}</span></p>
          <p className={`font-bold ${pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            P&L: {pnl >= 0 ? '+' : '-'}${Math.abs(pnl)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Covered Call & Rolling Optimizer</h1>
        <div className="mb-6 flex gap-4">
          <input 
            type="text" 
            value={ticker} 
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Enter Ticker (e.g. AAPL)"
            className="rounded-md border border-slate-300 p-2 bg-white font-bold"
          />
          <button 
            onClick={() => fetchMarketData(ticker)}
            className="bg-slate-800 text-white px-6 py-2 rounded-md hover:bg-slate-700 transition-colors"
          >
            {loading ? 'Loading...' : 'Load Live Data'}
          </button>
        </div>
        
        {/* --- INPUT PANEL --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Stock Price ($)</label>
            <input type="number" value={stockPrice} onChange={(e) => setStockPrice(Number(e.target.value))} className="w-full rounded-md border border-slate-300 p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Strike Price ($)</label>
            <input type="number" value={strikePrice} onChange={(e) => setStrikePrice(Number(e.target.value))} className="w-full rounded-md border border-slate-300 p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Premium Collected ($)</label>
            <input type="number" value={premium} onChange={(e) => setPremium(Number(e.target.value))} className="w-full rounded-md border border-slate-300 p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Days to Expiration (DTE)</label>
            <input type="number" value={dte} onChange={(e) => setDte(Number(e.target.value))} className="w-full rounded-md border border-slate-300 p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        </div>

        {/* --- KPI CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-600 text-white p-6 rounded-xl shadow-sm">
            <h3 className="text-blue-100 text-sm font-medium">Annualized Return (APR)</h3>
            <p className="text-3xl font-bold mt-2">{annualizedReturn.toFixed(2)}%</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">Option Yield</h3>
            <p className="text-2xl font-bold text-slate-800 mt-2">{optionYield.toFixed(2)}%</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">Break-Even Price</h3>
            <p className="text-2xl font-bold text-slate-800 mt-2">${breakEven.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">Max Return (Assigned)</h3>
            <p className="text-2xl font-bold text-emerald-600 mt-2">{maxReturnAssigned.toFixed(2)}%</p>
          </div>
        </div>

        {/* --- VISUAL PAYOFF CHART --- */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6">P&L at Expiration</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="price" tick={{ fill: '#64748b' }} tickMargin={10} />
                <YAxis tick={{ fill: '#64748b' }} tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#94a3b8" />
                <ReferenceLine x={strikePrice} stroke="#3b82f6" strokeDasharray="3 3" label={{ position: 'top', value: 'Strike', fill: '#3b82f6', fontSize: 12 }} />
                <ReferenceLine x={breakEven} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'bottom', value: 'Break-Even', fill: '#10b981', fontSize: 12 }} />
                <Line type="monotone" dataKey="profit" stroke="#4f46e5" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- ROLLING SIMULATOR --- */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Position Rolling Simulator</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Buy to Close Cost ($)</label>
                <input type="number" value={buyToClose} onChange={(e) => setBuyToClose(Number(e.target.value))} className="w-full rounded-md border border-slate-300 p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">New Sold Premium ($)</label>
                <input type="number" value={newPremium} onChange={(e) => setNewPremium(Number(e.target.value))} className="w-full rounded-md border border-slate-300 p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">New Strike ($)</label>
                <input type="number" value={newStrike} onChange={(e) => setNewStrike(Number(e.target.value))} className="w-full rounded-md border border-slate-300 p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">New DTE (Added Days)</label>
                <input type="number" value={newDte} onChange={(e) => setNewDte(Number(e.target.value))} className="w-full rounded-md border border-slate-300 p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col justify-center">
              <h3 className="text-sm font-medium text-slate-500">Net Roll Credit/Debit</h3>
              <p className={`text-4xl font-bold mt-2 ${netRollCredit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {netRollCredit >= 0 ? '+' : '-'}${Math.abs(netRollCredit).toFixed(2)}
              </p>
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-medium text-slate-500">New Adjusted APR</h3>
                <p className="text-2xl font-bold text-slate-800 mt-1">{adjustedAnnualized.toFixed(2)}%</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}