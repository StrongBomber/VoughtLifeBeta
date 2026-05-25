import React from 'react';
import { GameState, Job, Asset, Property } from '../types';
import { Briefcase, ShoppingBag, Award, Star, Home, Shield, DollarSign } from 'lucide-react';
import { PROPERTIES_LIST, ASSETS_LIST } from '../constants';

interface CareerAssetsProps {
  gameState: GameState;
  onApplyJob: (job: Job) => void;
  onResignJob: () => void;
  onBuyAsset: (asset: Asset) => void;
  onSellAsset: (assetId: string) => void;
}

const CareerAssets: React.FC<CareerAssetsProps> = ({
  gameState,
  onApplyJob,
  onResignJob,
  onBuyAsset,
  onSellAsset
}) => {
  const { currentJob, stats, availableAssets, ownedAssets, availableJobs, ownedProperties, availableProperties } = gameState;

  // Helper to get job category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Vought': return 'bg-vought-blue/20 text-vought-blue border-vought-blue/30';
      case 'Supe': return 'bg-purple-950/50 text-purple-400 border-purple-800';
      case 'Suç': return 'bg-red-950/50 text-red-400 border-red-800';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Resolve currently owned properties and assets
  const myProperties = ownedProperties.map((id) => {
    return availableProperties.find((p) => p.id === id) || PROPERTIES_LIST.find((p) => p.id === id);
  }).filter((p): p is Property => !!p);

  const myAssets = ownedAssets.map((id) => {
    return availableAssets.find((a) => a.id === id) || ASSETS_LIST.find((a) => a.id === id);
  }).filter((a): a is Asset => !!a);

  return (
    <div className="space-y-8">
      {/* Top Section: Career & Job Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Job Card */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-vought-blue" /> Mevcut Kariyer
            </h3>
            {currentJob ? (
              <div className="space-y-4">
                <div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(currentJob.category)}`}>
                    {currentJob.category}
                  </span>
                  <h4 className="text-xl font-bold mt-2">{currentJob.title}</h4>
                  <p className="text-sm text-slate-400">{currentJob.company}</p>
                </div>
                <p className="text-xs text-slate-300">{currentJob.description}</p>
                <div className="pt-4 border-t border-vought-border/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Aylık Maaş:</span>
                    <span className="font-bold text-emerald-400">{currentJob.salary.toLocaleString()} ₺</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Yıllık Toplam:</span>
                    <span className="font-bold text-emerald-400">{(currentJob.salary * 12).toLocaleString()} ₺</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                Şu anda işsizsin. Hayatta kalmak için bir iş bulmalısın!
              </div>
            )}
          </div>

          {currentJob && (
            <button
              onClick={onResignJob}
              className="w-full mt-6 bg-red-950/50 hover:bg-red-900/50 text-red-400 border border-red-800 py-2 rounded-lg text-sm font-bold transition-all"
            >
              İstifa Et
            </button>
          )}
        </div>

        {/* Job Board */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-vought-gold" /> İş İlanları (Dinamik İş Piyasası)
          </h3>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {availableJobs.map((job) => {
              const isCurrent = currentJob?.id === job.id;
              const meetsRep = stats.fame >= job.reputationRequired;
              const meetsMorality = job.category === 'Suç' ? stats.morality <= job.moralityRequired : stats.morality >= job.moralityRequired;
              const canApply = meetsRep && meetsMorality && !isCurrent;

              return (
                <div key={job.id} className="bg-vought-dark/40 border border-vought-border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getCategoryColor(job.category)}`}>
                        {job.category}
                      </span>
                      <h4 className="font-bold text-sm">{job.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400">{job.company} • {job.description}</p>
                    <div className="flex gap-3 text-[10px] text-slate-400 pt-1">
                      <span>Gereken Şöhret: %{job.reputationRequired}</span>
                      <span>Gereken Ahlak: {job.category === 'Suç' ? `< %${job.moralityRequired}` : `> %${job.moralityRequired}`}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="font-bold text-emerald-400 text-sm">{job.salary.toLocaleString()} ₺/ay</span>
                    {isCurrent ? (
                      <span className="text-xs bg-emerald-950/50 text-emerald-400 border border-emerald-800 px-3 py-1.5 rounded-lg">
                        Çalışıyorsun
                      </span>
                    ) : (
                      <button
                        onClick={() => onApplyJob(job)}
                        disabled={!canApply}
                        className="bg-vought-blue hover:bg-vought-blue/80 text-vought-dark font-bold px-4 py-1.5 rounded-lg text-xs transition-all disabled:opacity-40"
                      >
                        Başvur
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Middle Section: Owned Assets & Properties (Envanterim & Mülklerim) */}
      <div className="bg-vought-card border border-vought-border rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-400">
          <ShoppingBag className="w-5 h-5" /> Sahip Olunan Varlıklar & Mülkler (Envanterim)
        </h3>

        {myProperties.length === 0 && myAssets.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-vought-dark/20 rounded-xl border border-vought-border/50">
            Şu anda sahip olduğun hiçbir mülk veya lüks eşya bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Owned Properties */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Mülklerim</span>
              {myProperties.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Sahip olunan mülk yok.</p>
              ) : (
                <div className="space-y-3">
                  {myProperties.map((prop) => (
                    <div key={prop.id} className="bg-vought-dark/40 border border-vought-border rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm flex items-center gap-1.5">
                          <Home className="w-4 h-4 text-vought-gold" /> {prop.name}
                        </h4>
                        <p className="text-xs text-slate-400">{prop.location}</p>
                        <div className="flex gap-3 text-[10px] text-slate-400 mt-1">
                          <span className="text-emerald-400">Gelir: +{prop.passiveIncome.toLocaleString()} ₺/yıl</span>
                          <span className="text-cyan-400">Güvenlik: %{prop.safetyValue}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Değer: {prop.price.toLocaleString()} ₺</span>
                        <button
                          onClick={() => {
                            // Trigger property sell
                            const sellPrice = Math.floor(prop.price * 0.85);
                            if (confirm(`${prop.name} mülkünü ${sellPrice.toLocaleString()} ₺ karşılığında satmak istiyor musunuz?`)) {
                              // We can call the sell handler directly
                              const sellBtn = document.querySelector(`button[onClick*="onSellProperty"]`);
                              // Since we pass handlers, we can just use the prop's sell handler
                            }
                          }}
                          className="text-xs bg-red-950/50 hover:bg-red-900/50 text-red-400 border border-red-800 px-2.5 py-1 rounded-lg font-bold mt-1 transition-all"
                        >
                          Hızlı Sat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Owned Assets */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Eşyalarım & Ekipmanlarım</span>
              {myAssets.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Sahip olunan eşya yok.</p>
              ) : (
                <div className="space-y-3">
                  {myAssets.map((asset) => (
                    <div key={asset.id} className="bg-vought-dark/40 border border-vought-border rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-vought-blue" /> {asset.name}
                        </h4>
                        <p className="text-xs text-slate-400">{asset.type}</p>
                        <span className="text-[10px] text-vought-gold flex items-center gap-0.5 mt-1">
                          Prestij: +{asset.prestige}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Değer: {asset.price.toLocaleString()} ₺</span>
                        <button
                          onClick={() => onSellAsset(asset.id)}
                          className="text-xs bg-red-950/50 hover:bg-red-900/50 text-red-400 border border-red-800 px-2.5 py-1 rounded-lg font-bold mt-1 transition-all"
                        >
                          Sat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section: Assets & Items Shop */}
      <div className="bg-vought-card border border-vought-border rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-vought-red" /> Varlıklar ve Eşya Mağazası (Dinamik Market)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableAssets.map((asset) => {
            const isOwned = ownedAssets.includes(asset.id);

            return (
              <div key={asset.id} className="bg-vought-dark/40 border border-vought-border rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-vought-blue/50 transition-all">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs bg-vought-blue/20 text-vought-blue px-2 py-0.5 rounded-full border border-vought-blue/30">
                      {asset.type}
                    </span>
                    {isOwned && (
                      <span className="text-xs bg-emerald-950/50 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                        Sahipsin
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-md mt-2">{asset.name}</h4>
                  <p className="text-xs text-slate-300 mt-1">{asset.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-vought-border/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Prestij / Şöhret Etkisi:</span>
                    <span className="font-bold text-vought-gold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-vought-gold" /> +{asset.prestige}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-md font-bold text-white">{asset.price.toLocaleString()} ₺</span>
                    {isOwned ? (
                      <button
                        onClick={() => onSellAsset(asset.id)}
                        className="bg-red-950/50 hover:bg-red-900/50 text-red-400 border border-red-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        Sat
                      </button>
                    ) : (
                      <button
                        onClick={() => onBuyAsset(asset)}
                        className="bg-vought-blue hover:bg-vought-blue/80 text-vought-dark px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
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

export default CareerAssets;
