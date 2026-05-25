import React from 'react';
import { GameState } from '../types';
import { Zap, AlertTriangle, ShieldAlert, Sparkles, Heart } from 'lucide-react';

interface CompoundVProps {
  gameState: GameState;
  onInjectCompoundV: (type: 'Geçici' | 'Kalıcı') => void;
}

const CompoundV: React.FC<CompoundVProps> = ({
  gameState,
  onInjectCompoundV
}) => {
  const { compoundV, stats } = gameState;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Injection Center */}
      <div className="bg-vought-card border border-vought-border rounded-xl p-6 lg:col-span-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" /> Bileşik V Laboratuvarı
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Vought International tarafından geliştirilen gizli formül. Sıradan insanları yarı tanrılara dönüştürür. Ancak yan etkileri ölümcül olabilir.
          </p>

          <div className="space-y-6">
            {/* Temp V */}
            <div className="bg-vought-dark/50 border border-vought-border rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-cyan-400">Geçici Bileşik V (Temp V)</span>
                <span className="text-xs text-emerald-400 font-bold">50.000 ₺</span>
              </div>
              <p className="text-xs text-slate-300">
                24 saatliğine rastgele süper güçler kazandırır. Hücresel bozulma riski düşüktür ama bağımlılık yapabilir.
              </p>
              <button
                onClick={() => onInjectCompoundV('Geçici')}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-vought-dark font-bold py-2 rounded-lg text-xs transition-all"
              >
                Temp V Enjekte Et
              </button>
            </div>

            {/* Perm V */}
            <div className="bg-vought-dark/50 border border-vought-border rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-purple-400">Kalıcı Bileşik V</span>
                <span className="text-xs text-emerald-400 font-bold">250.000 ₺</span>
              </div>
              <p className="text-xs text-slate-300">
                Kalıcı mutasyon ve süper güçler sağlar. Yüksek dozda dengesizlik ve ani ölüm riski taşır.
              </p>
              <button
                onClick={() => onInjectCompoundV('Kalıcı')}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-lg text-xs transition-all"
              >
                Kalıcı V Enjekte Et
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-vought-border/50 flex items-center gap-2 text-xs text-amber-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Dikkat: Bileşik V kullanımı ahlakınızı ve Vought ile olan ilişkilerinizi kalıcı olarak etkiler.</span>
        </div>
      </div>

      {/* Right Column: Active Powers & Instability */}
      <div className="lg:col-span-2 space-y-6">
        {/* Status Card */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl"></div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-vought-gold" /> Mevcut Supe Durumu
          </h3>

          {compoundV.isInjected ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Powers List */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Aktif Güçlerin</span>
                  <div className="space-y-2">
                    {compoundV.powers.map((power, idx) => (
                      <div key={idx} className="bg-vought-dark/60 border border-cyan-900/50 px-4 py-2.5 rounded-lg text-sm font-semibold text-cyan-400 flex items-center gap-2">
                        <Zap className="w-4 h-4" /> {power}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instability & Side Effects */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Hücresel Dengesizlik (Instability)</span>
                      <span className="font-bold text-red-400">%{compoundV.instability}</span>
                    </div>
                    <div className="w-full bg-vought-dark h-2 rounded-full overflow-hidden border border-vought-border">
                      <div className="bg-gradient-to-r from-cyan-500 to-red-500 h-full" style={{ width: `${compoundV.instability}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Yan Etkiler</span>
                    {compoundV.sideEffects.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {compoundV.sideEffects.map((effect, idx) => (
                          <span key={idx} className="text-xs bg-red-950/30 border border-red-900/50 px-2.5 py-1 rounded-full text-red-400 flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {effect}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Şu an için belirgin bir yan etki gözlemlenmedi.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm">Henüz damarlarında Bileşik V dolaşmıyor. Sıradan bir sivil olarak hayatına devam ediyorsun.</p>
            </div>
          )}
        </div>

        {/* Lore / Info Card */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6">
          <h3 className="text-md font-bold mb-3">Bileşik V Hakkında Bilmeniz Gerekenler</h3>
          <div className="space-y-3 text-xs text-slate-300">
            <p>
              <strong>1. Geçici V (Temp V):</strong> Vought'un gizli laboratuvarlarında üretilen yeşil renkli formül. 24 saat boyunca süper güçler verir. Ancak sık kullanımda beyin tümörlerine ve organ yetmezliğine yol açabilir.
            </p>
            <p>
              <strong>2. Kalıcı V:</strong> Bebeklikten itibaren enjekte edilen orijinal mavi formül. Yetişkinlerde kullanımı son derece risklidir; %50 ihtimalle ani kalp durması veya mutasyon kriziyle sonuçlanır. Başarılı olursa kalıcı bir "Supe" olursunuz.
            </p>
            <p>
              <strong>3. Sosyal Medya Etkisi:</strong> Güçlerinizi Instaverse üzerinde sergilemek takipçi sayınızı katlayabilir, ancak Vought'un radarına girmenize veya "The Boys" direniş grubunun hedefi olmanıza neden olabilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompoundV;
