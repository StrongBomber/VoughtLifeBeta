import React, { useState } from 'react';
import { GameState, Alignment, EconomyStatus } from '../types';
import { 
  Heart, Zap, Smile, AlertTriangle, Shield, Award, 
  TrendingUp, Briefcase, Calendar, Activity, Play, Pause, Sparkles, Send, CheckCircle
} from 'lucide-react';

interface DashboardProps {
  gameState: GameState;
  onTogglePause: () => void;
  onChangeSpeed: (speed: number) => void;
  onSkipWeek: () => void;
  onSkipMonth: () => void;
  onFreeTextSubmit: (text: string) => Promise<void>;
  onRest: () => void;
  onWork: () => void;
  isAnalyzingFreeText: boolean;
}

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const Dashboard: React.FC<DashboardProps> = ({
  gameState,
  onTogglePause,
  onChangeSpeed,
  onSkipWeek,
  onSkipMonth,
  onFreeTextSubmit,
  onRest,
  onWork,
  isAnalyzingFreeText
}) => {
  const { stats, world, bank, currentJob, compoundV, history, isPaused, timeSpeed, daysPassed } = gameState;
  const [freeText, setFreeText] = useState('');

  // Calculate current date from daysPassed (360 days per year, 30 days per month)
  const currentYear = 2026 + Math.floor(daysPassed / 360);
  const currentMonthIndex = Math.floor((daysPassed % 360) / 30);
  const currentDay = (daysPassed % 30) + 1;
  const currentMonthName = TURKISH_MONTHS[currentMonthIndex] || 'Ocak';

  const handleFreeTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeText.trim() || isAnalyzingFreeText) return;
    await onFreeTextSubmit(freeText);
    setFreeText('');
  };

  const getAlignmentColor = (alignment: Alignment) => {
    switch (alignment) {
      case Alignment.HERO: return 'text-emerald-400 bg-emerald-950/50 border-emerald-800';
      case Alignment.VILLAIN: return 'text-red-400 bg-red-950/50 border-red-800';
      case Alignment.ROGUE: return 'text-amber-400 bg-amber-950/50 border-amber-800';
      default: return 'text-slate-400 bg-slate-950/50 border-slate-800';
    }
  };

  const getEconomyColor = (status: EconomyStatus) => {
    switch (status) {
      case EconomyStatus.BOOM: return 'text-emerald-400';
      case EconomyStatus.RECESSION: return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Character Profile & Stats */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Real-Time Time Controls */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-vought-blue/10 to-transparent rounded-full blur-2xl"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs text-vought-blue font-bold uppercase tracking-wider">Zaman Akışı</span>
              <h2 className="text-2xl font-black text-white flex items-center gap-2 mt-1">
                <Calendar className="w-6 h-6 text-vought-blue" />
                {currentDay} {currentMonthName} {currentYear}
              </h2>
              <p className="text-xs text-slate-400 mt-1">Toplam Geçen Gün: {daysPassed} gün</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onTogglePause}
                className={`p-2.5 rounded-lg border transition-all flex items-center gap-1.5 text-sm font-bold ${
                  isPaused 
                    ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500' 
                    : 'bg-amber-600 border-amber-500 text-white hover:bg-amber-500'
                }`}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? 'Zamanı Başlat' : 'Zamanı Durdur'}
              </button>

              <div className="flex bg-vought-dark border border-vought-border rounded-lg overflow-hidden">
                {[1, 2, 5, 10].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => onChangeSpeed(speed)}
                    disabled={isPaused}
                    className={`px-3 py-2 text-xs font-bold border-r border-vought-border last:border-0 transition-all ${
                      timeSpeed === speed && !isPaused
                        ? 'bg-vought-blue text-vought-dark'
                        : 'text-slate-400 hover:text-white disabled:opacity-30'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              <button
                onClick={onSkipWeek}
                className="px-3 py-2 bg-vought-card border border-vought-border hover:border-vought-blue text-xs font-bold rounded-lg transition-all"
              >
                Haftayı Atla
              </button>
              <button
                onClick={onSkipMonth}
                className="px-3 py-2 bg-vought-card border border-vought-border hover:border-vought-blue text-xs font-bold rounded-lg transition-all"
              >
                Ayı Atla
              </button>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-vought-red/10 to-transparent rounded-full blur-2xl"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-vought-red to-vought-blue flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-vought-red/20">
                {gameState.instaverse.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  @{gameState.instaverse.username}
                  {gameState.instaverse.verified && (
                    <span className="text-xs bg-vought-blue/20 text-vought-blue px-2 py-0.5 rounded-full border border-vought-blue/30">Onaylı</span>
                  )}
                </h2>
                <p className="text-sm text-slate-400 mt-1">{gameState.instaverse.bio}</p>
                <div className="flex gap-4 mt-2 text-xs text-slate-300">
                  <span><strong>{gameState.instaverse.followers.toLocaleString()}</strong> Takipçi</span>
                  <span><strong>{gameState.instaverse.following.toLocaleString()}</strong> Takip</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1.5 rounded-lg border text-sm font-semibold ${getAlignmentColor(stats.alignment)}`}>
                {stats.alignment}
              </span>
              {compoundV.isInjected && (
                <span className="px-3 py-1.5 rounded-lg border border-cyan-800 bg-cyan-950/50 text-cyan-400 text-sm font-semibold flex items-center gap-1">
                  <Zap className="w-4 h-4" /> Bileşik V ({compoundV.type})
                </span>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-vought-border">
            <div className="bg-vought-dark/50 p-3 rounded-lg border border-vought-border/50">
              <span className="text-xs text-slate-400 block">Yaş</span>
              <span className="text-lg font-bold text-white">{stats.age}</span>
            </div>
            <div className="bg-vought-dark/50 p-3 rounded-lg border border-vought-border/50">
              <span className="text-xs text-slate-400 block">Net Varlık</span>
              <span className="text-lg font-bold text-emerald-400">{(bank.balance + bank.loanAmount).toLocaleString()} ₺</span>
            </div>
            <div className="bg-vought-dark/50 p-3 rounded-lg border border-vought-border/50">
              <span className="text-xs text-slate-400 block">Mevcut İş</span>
              <span className="text-sm font-bold text-white truncate block">{currentJob ? currentJob.title : 'İşsiz'}</span>
            </div>
            <div className="bg-vought-dark/50 p-3 rounded-lg border border-vought-border/50">
              <span className="text-xs text-slate-400 block">Aktif Güçler</span>
              <span className="text-sm font-bold text-cyan-400 truncate block">
                {compoundV.powers.length > 0 ? compoundV.powers.join(', ') : 'Yok'}
              </span>
            </div>
          </div>
        </div>

        {/* Serbest Yazma Bölümü (Free Text Input System) */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-vought-gold/10 to-transparent rounded-full blur-xl"></div>
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-vought-gold" /> Serbest Yazma Bölümü (Yapay Zeka Eylem Motoru)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Buraya yapmak istediğin her şeyi serbestçe yazabilirsin. Yapay zeka eylemini analiz edecek, sonuçlarını simüle edecek ve oyun durumunu kalıcı olarak güncelleyecektir.
          </p>
          <form onSubmit={handleFreeTextSubmit} className="space-y-3">
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="Örn: 'Vought kulesine sızıp gizli belgeleri çalmaya çalışıyorum' veya 'Sokakta insanlara yardım ederek kahramanlık yapıyorum'..."
              rows={3}
              className="w-full bg-vought-dark border border-vought-border rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-vought-gold resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!freeText.trim() || isAnalyzingFreeText}
                className="bg-vought-gold hover:bg-vought-gold/80 text-vought-dark font-bold px-5 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isAnalyzingFreeText ? (
                  <>Eylem Simüle Ediliyor...</>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Eylemi Gerçekleştir
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Core Attributes (Progress Bars) */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-vought-red" /> Yaşam Değerleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Health */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-300"><Heart className="w-4 h-4 text-red-500" /> Sağlık</span>
                <span className="font-semibold">{stats.health}%</span>
              </div>
              <div className="w-full bg-vought-dark h-2.5 rounded-full overflow-hidden border border-vought-border">
                <div className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-500" style={{ width: `${stats.health}%` }}></div>
              </div>
            </div>

            {/* Energy */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-300"><Zap className="w-4 h-4 text-amber-400" /> Enerji</span>
                <span className="font-semibold">{stats.energy}%</span>
              </div>
              <div className="w-full bg-vought-dark h-2.5 rounded-full overflow-hidden border border-vought-border">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-500" style={{ width: `${stats.energy}%` }}></div>
              </div>
            </div>

            {/* Stress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-300"><AlertTriangle className="w-4 h-4 text-orange-400" /> Stres</span>
                <span className="font-semibold">{stats.stress}%</span>
              </div>
              <div className="w-full bg-vought-dark h-2.5 rounded-full overflow-hidden border border-vought-border">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all duration-500" style={{ width: `${stats.stress}%` }}></div>
              </div>
            </div>

            {/* Happiness */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-300"><Smile className="w-4 h-4 text-emerald-400" /> Mutluluk</span>
                <span className="font-semibold">{stats.happiness}%</span>
              </div>
              <div className="w-full bg-vought-dark h-2.5 rounded-full overflow-hidden border border-vought-border">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500" style={{ width: `${stats.happiness}%` }}></div>
              </div>
            </div>

            {/* Morality */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-300"><Shield className="w-4 h-4 text-blue-400" /> Ahlak (Kahramanlık)</span>
                <span className="font-semibold">{stats.morality}%</span>
              </div>
              <div className="w-full bg-vought-dark h-2.5 rounded-full overflow-hidden border border-vought-border">
                <div className="bg-gradient-to-r from-red-500 via-slate-500 to-emerald-500 h-full transition-all duration-500" style={{ width: `${stats.morality}%` }}></div>
              </div>
            </div>

            {/* Corruption */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-300"><Award className="w-4 h-4 text-purple-400" /> Vought Yozlaşması</span>
                <span className="font-semibold">{stats.corruption}%</span>
              </div>
              <div className="w-full bg-vought-dark h-2.5 rounded-full overflow-hidden border border-vought-border">
                <div className="bg-gradient-to-r from-slate-600 to-purple-600 h-full transition-all duration-500" style={{ width: `${stats.corruption}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">Hızlı Eylemler</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={onWork}
              disabled={stats.energy < 15 || !currentJob}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-vought-border bg-vought-dark/40 hover:bg-vought-dark hover:border-vought-blue transition-all group disabled:opacity-50 disabled:hover:border-vought-border"
            >
              <Briefcase className="w-6 h-6 text-vought-blue mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-sm">Çalış / Görev Yap</span>
              <span className="text-xs text-slate-400 mt-1">-15 Enerji, +Maaş</span>
            </button>

            <button
              onClick={onRest}
              disabled={stats.energy >= 100}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-vought-border bg-vought-dark/40 hover:bg-vought-dark hover:border-emerald-500 transition-all group disabled:opacity-50 disabled:hover:border-vought-border"
            >
              <Smile className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-sm">Dinlen / Tatil Yap</span>
              <span className="text-xs text-slate-400 mt-1">+40 Enerji, -10 Stres</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: World Simulation State & History */}
      <div className="space-y-6">
        {/* World Simulation Card */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-vought-blue/10 to-transparent rounded-full blur-xl"></div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-vought-blue" /> Dünya Simülasyonu
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-vought-border/50">
              <span className="text-sm text-slate-300">Ekonomi Durumu</span>
              <span className={`font-bold ${getEconomyColor(world.economy)}`}>{world.economy}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-vought-border/50">
              <span className="text-sm text-slate-300">Yıllık Enflasyon</span>
              <span className="font-bold text-red-400">%{world.inflation}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-vought-border/50">
              <span className="text-sm text-slate-300">İşsizlik Oranı</span>
              <span className="font-bold text-slate-200">%{world.unemployment}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-vought-border/50">
              <span className="text-sm text-slate-300">Suç Oranı</span>
              <span className="font-bold text-orange-400">%{world.crimeRate}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-vought-border/50">
              <span className="text-sm text-slate-300">Vought Nüfuzu</span>
              <span className="font-bold text-vought-blue">%{world.voughtInfluence}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-vought-border/50">
              <span className="text-sm text-slate-300">Bileşik V Sızıntısı</span>
              <span className="font-bold text-cyan-400">%{world.compoundVLeak}</span>
            </div>
          </div>

          {/* Social Trends */}
          <div className="mt-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Gündemdeki Başlıklar</span>
            <div className="flex flex-wrap gap-1.5">
              {world.socialTrends.map((trend, idx) => (
                <span key={idx} className="text-xs bg-vought-dark border border-vought-border px-2.5 py-1 rounded-full text-slate-300">
                  {trend}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* System Sync & Debug Panel */}
        <div className="bg-vought-card border border-emerald-900/50 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-lg"></div>
          <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Sistem Senkronizasyon Kontrolü
          </h3>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Banka Bakiyesi Senkronize:</span>
              <span className="text-emerald-400 font-bold">EVET</span>
            </div>
            <div className="flex justify-between">
              <span>Kariyer & Maaş Senkronize:</span>
              <span className="text-emerald-400 font-bold">EVET</span>
            </div>
            <div className="flex justify-between">
              <span>Bileşik V & Güçler Senkronize:</span>
              <span className="text-emerald-400 font-bold">EVET</span>
            </div>
            <div className="flex justify-between">
              <span>Envanter & Varlıklar Senkronize:</span>
              <span className="text-emerald-400 font-bold">EVET</span>
            </div>
          </div>
        </div>

        {/* History Log */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6 flex flex-col h-[240px]">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-vought-gold" /> Hayat Günlüğü
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {history.map((log, idx) => (
              <div key={idx} className="text-sm border-l-2 border-vought-border pl-3 py-1 text-slate-300 hover:border-vought-red transition-colors">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
