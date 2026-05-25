import React from 'react';
import { GameEvent, Choice, EventOutcomeState } from '../types';
import { AlertCircle, Sparkles, DollarSign, Heart, Zap, Shield, CheckCircle, Award } from 'lucide-react';

interface EventModalProps {
  event: GameEvent;
  onSelectChoice: (choice: Choice) => void;
  outcome: EventOutcomeState | null;
  onCloseOutcome: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onSelectChoice, outcome, onCloseOutcome }) => {
  // Helper to render stat changes in choices
  const renderEffects = (effects: any) => {
    const elements = [];
    if (effects.money) {
      elements.push(
        <span key="money" className={`flex items-center gap-0.5 ${effects.money > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          <DollarSign className="w-3.5 h-3.5" /> {effects.money > 0 ? `+${effects.money.toLocaleString()}` : effects.money.toLocaleString()} ₺
        </span>
      );
    }
    if (effects.health) {
      elements.push(
        <span key="health" className={`flex items-center gap-0.5 ${effects.health > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          <Heart className="w-3.5 h-3.5" /> {effects.health > 0 ? `+${effects.health}` : effects.health}%
        </span>
      );
    }
    if (effects.energy) {
      elements.push(
        <span key="energy" className={`flex items-center gap-0.5 ${effects.energy > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          <Zap className="w-3.5 h-3.5" /> {effects.energy > 0 ? `+${effects.energy}` : effects.energy}%
        </span>
      );
    }
    if (effects.morality) {
      elements.push(
        <span key="morality" className={`flex items-center gap-0.5 ${effects.morality > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          <Shield className="w-3.5 h-3.5" /> {effects.morality > 0 ? `+${effects.morality}` : effects.morality} Ahlak
        </span>
      );
    }
    return elements;
  };

  return (
    <div className="fixed inset-0 bg-vought-dark/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-vought-card border border-vought-border rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl shadow-vought-red/10 animate-in fade-in zoom-in duration-200">
        
        {/* Outcome Screen */}
        {outcome ? (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-vought-border pb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Karar Sonucu</span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">{event.title}</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-vought-dark/60 p-4 rounded-xl border border-vought-border/50">
                <span className="text-xs text-slate-400 block mb-1">Seçtiğiniz Karar:</span>
                <p className="text-sm font-semibold text-slate-200 italic">"{outcome.choiceText}"</p>
              </div>

              <div className="bg-vought-dark/40 p-4 rounded-xl border border-vought-border/50 space-y-3">
                <span className="text-xs text-slate-400 block">Gelişen Olaylar:</span>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {outcome.outcomeText || 'Kararınız başarıyla uygulandı ve dünya simülasyonu güncellendi.'}
                </p>
              </div>

              {/* Applied Stat Changes */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Uygulanan Etkiler</span>
                <div className="flex flex-wrap gap-3 bg-vought-dark/20 p-3 rounded-lg border border-vought-border/30">
                  {renderEffects(outcome.effects).length > 0 ? (
                    renderEffects(outcome.effects)
                  ) : (
                    <span className="text-xs text-slate-400">Belirgin bir anlık etki olmadı.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-vought-border flex justify-end">
              <button
                onClick={onCloseOutcome}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2"
              >
                Devam Et <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Choice Selection Screen */
          <>
            <div className="bg-gradient-to-r from-vought-red/20 to-vought-blue/20 p-6 border-b border-vought-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-vought-red" />
                <div>
                  <span className="text-xs text-vought-blue font-bold uppercase tracking-wider">{event.date} • {event.type.toUpperCase()} OLAYI</span>
                  <h2 className="text-xl font-extrabold text-white mt-0.5">{event.title}</h2>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap bg-vought-dark/40 p-4 rounded-xl border border-vought-border/50">
                {event.text}
              </p>

              {/* Choices */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Kararınız</span>
                {event.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectChoice(choice)}
                    className="w-full text-left bg-vought-dark/60 hover:bg-vought-dark border border-vought-border hover:border-vought-blue p-4 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {choice.text}
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {renderEffects(choice.effects)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventModal;
