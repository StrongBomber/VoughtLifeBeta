import React, { useState } from 'react';
import { GameState, Stock, Property } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Landmark, TrendingUp, Home, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface FinanceProps {
  gameState: GameState;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  onTakeLoan: (amount: number) => void;
  onRepayLoan: (amount: number) => void;
  onBuyStock: (stockId: string, quantity: number) => void;
  onSellStock: (stockId: string, quantity: number) => void;
  onBuyProperty: (propertyId: string) => void;
  onSellProperty: (propertyId: string) => void;
}

const Finance: React.FC<FinanceProps> = ({
  gameState,
  onDeposit,
  onWithdraw,
  onTakeLoan,
  onRepayLoan,
  onBuyStock,
  onSellStock,
  onBuyProperty,
  onSellProperty
}) => {
  const { bank, stocks, portfolio, availableProperties, ownedProperties } = gameState;

  // Local states for inputs
  const [bankAmount, setBankAmount] = useState('');
  const [loanAmountInput, setLoanAmountInput] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(stocks[0] || null);
  const [stockQuantity, setStockQuantity] = useState('1');

  // Handle Bank Actions
  const handleDeposit = () => {
    const amt = parseFloat(bankAmount);
    if (amt > 0) {
      onDeposit(amt);
      setBankAmount('');
    }
  };

  const handleWithdraw = () => {
    const amt = parseFloat(bankAmount);
    if (amt > 0) {
      onWithdraw(amt);
      setBankAmount('');
    }
  };

  const handleTakeLoan = () => {
    const amt = parseFloat(loanAmountInput);
    if (amt > 0) {
      onTakeLoan(amt);
      setLoanAmountInput('');
    }
  };

  const handleRepayLoan = () => {
    const amt = parseFloat(loanAmountInput);
    if (amt > 0) {
      onRepayLoan(amt);
      setLoanAmountInput('');
    }
  };

  // Handle Stock Actions
  const handleBuyStock = () => {
    const qty = parseInt(stockQuantity);
    if (selectedStock && qty > 0) {
      onBuyStock(selectedStock.id, qty);
    }
  };

  const handleSellStock = () => {
    const qty = parseInt(stockQuantity);
    if (selectedStock && qty > 0) {
      onSellStock(selectedStock.id, qty);
    }
  };

  const handleSellAllStock = () => {
    if (selectedStock) {
      const owned = portfolio[selectedStock.id] || 0;
      if (owned > 0) {
        onSellStock(selectedStock.id, owned);
      }
    }
  };

  // Prepare chart data for selected stock
  const chartData = selectedStock
    ? selectedStock.history.map((price, index) => ({
        name: `Yıl ${index + 1}`,
        Fiyat: price
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Top Row: Bank Account Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bank Balance Card */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-xl"></div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-400" /> Vought Bankası
          </h3>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-slate-400 block">Hesap Bakiyesi</span>
              <span className="text-2xl font-bold text-emerald-400">{bank.balance.toLocaleString()} ₺</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-300">
              <div>
                <span className="text-slate-400 block">Mevduat Faizi</span>
                <span className="font-bold text-emerald-400">%{bank.interestRate} (Yıllık)</span>
              </div>
              <div>
                <span className="text-slate-400 block">Kredi Faizi</span>
                <span className="font-bold text-red-400">%{bank.loanInterestRate} (Yıllık)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Actions */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6">
          <h3 className="text-md font-bold mb-3">Para Yatır / Çek</h3>
          <div className="space-y-3">
            <input
              type="number"
              value={bankAmount}
              onChange={(e) => setBankAmount(e.target.value)}
              placeholder="Miktar (TL)"
              className="w-full bg-vought-dark border border-vought-border rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-vought-blue"
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDeposit}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-sm transition-all"
              >
                Yatır
              </button>
              <button
                onClick={handleWithdraw}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg text-sm transition-all"
              >
                Çek
              </button>
            </div>
          </div>
        </div>

        {/* Loan Actions */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-bold">Kredi İşlemleri</h3>
            {bank.loanAmount > 0 && (
              <span className="text-xs bg-red-950/50 text-red-400 border border-red-800 px-2 py-0.5 rounded-full">
                Borç: {bank.loanAmount.toLocaleString()} ₺
              </span>
            )}
          </div>
          <div className="space-y-3">
            <input
              type="number"
              value={loanAmountInput}
              onChange={(e) => setLoanAmountInput(e.target.value)}
              placeholder="Kredi Miktarı (TL)"
              className="w-full bg-vought-dark border border-vought-border rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-vought-blue"
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleTakeLoan}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg text-sm transition-all"
              >
                Kredi Çek
              </button>
              <button
                onClick={handleRepayLoan}
                disabled={bank.loanAmount <= 0}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg text-sm transition-all disabled:opacity-50"
              >
                Borç Öde
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Stock Market */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock List */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6 lg:col-span-1">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-vought-blue" /> Borsa İstanbul (Vought Endeksi)
          </h3>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
            {stocks.map((stock) => {
              const owned = portfolio[stock.id] || 0;
              const priceDiff = stock.price - (stock.history[stock.history.length - 2] || stock.price);
              const isUp = priceDiff >= 0;

              return (
                <div
                  key={stock.id}
                  onClick={() => setSelectedStock(stock)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedStock?.id === stock.id
                      ? 'bg-vought-dark border-vought-blue'
                      : 'bg-vought-dark/40 border-vought-border hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-sm block">{stock.name}</span>
                      <span className="text-xs text-slate-400">{stock.ticker} {owned > 0 && `• Elde: ${owned}`}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm block">{stock.price.toLocaleString()} ₺</span>
                      <span className={`text-xs flex items-center gap-0.5 justify-end ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(priceDiff).toFixed(1)} ₺
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stock Chart & Trading */}
        {selectedStock && (
          <div className="bg-vought-card border border-vought-border rounded-xl p-6 lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{selectedStock.name} ({selectedStock.ticker})</h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedStock.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">{selectedStock.price.toLocaleString()} ₺</span>
                  <span className="text-xs text-slate-400 block">Hisse Başına</span>
                </div>
              </div>

              {/* Chart */}
              <div className="h-[180px] w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" stroke="#475569" fontSize={11} />
                    <YAxis stroke="#475569" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#161d30', borderColor: '#24324f' }} />
                    <Line type="monotone" dataKey="Fiyat" stroke="#00d2ff" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trading Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-center border-t border-vought-border/50 pt-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-slate-400">Adet:</span>
                <input
                  type="number"
                  min="1"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-20 bg-vought-dark border border-vought-border rounded-lg p-2 text-sm text-white text-center focus:outline-none focus:border-vought-blue"
                />
              </div>
              <div className="grid grid-cols-3 gap-3 w-full sm:w-auto sm:flex-1">
                <button
                  onClick={handleBuyStock}
                  className="bg-vought-blue hover:bg-vought-blue/80 text-vought-dark font-bold py-2.5 rounded-lg text-sm transition-all"
                >
                  Satın Al
                </button>
                <button
                  onClick={handleSellStock}
                  disabled={!(portfolio[selectedStock.id] > 0)}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 rounded-lg text-sm transition-all disabled:opacity-50"
                >
                  Sat
                </button>
                <button
                  onClick={handleSellAllStock}
                  disabled={!(portfolio[selectedStock.id] > 0)}
                  className="bg-red-900 hover:bg-red-800 text-white font-bold py-2.5 rounded-lg text-sm transition-all disabled:opacity-50"
                >
                  Tümünü Sat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row: Real Estate Market */}
      <div className="bg-vought-card border border-vought-border rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-vought-gold" /> Emlak ve Arsa Pazarı (Dinamik Emlak Piyasası)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableProperties.map((prop) => {
            const isOwned = ownedProperties.includes(prop.id);

            return (
              <div key={prop.id} className="bg-vought-dark/40 border border-vought-border rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-vought-gold/50 transition-all">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs bg-vought-gold/20 text-vought-gold px-2 py-0.5 rounded-full border border-vought-gold/30">
                      {prop.type}
                    </span>
                    {isOwned && (
                      <span className="text-xs bg-emerald-950/50 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                        Sahipsin
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-md mt-2">{prop.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{prop.location}</p>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">{prop.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-vought-border/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Pasif Gelir:</span>
                    <span className="font-bold text-emerald-400">+{prop.passiveIncome.toLocaleString()} ₺ / Yıl</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Güvenlik Değeri:</span>
                    <span className="font-bold text-cyan-400">%{prop.safetyValue}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-md font-bold text-white">{prop.price.toLocaleString()} ₺</span>
                    {isOwned ? (
                      <button
                        onClick={() => onSellProperty(prop.id)}
                        className="bg-red-950/50 hover:bg-red-900/50 text-red-400 border border-red-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        Sat
                      </button>
                    ) : (
                      <button
                        onClick={() => onBuyProperty(prop.id)}
                        className="bg-vought-gold hover:bg-vought-gold/80 text-vought-dark px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        Satın Al
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Finance;
