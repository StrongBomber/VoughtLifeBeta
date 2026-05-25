import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Alignment, EconomyStatus, Job, Asset, Property, Choice, Post, Comment, StateChanges, ChoiceEffect } from './types';
import { INITIAL_STATE, JOBS_LIST, PROPERTIES_LIST, ASSETS_LIST } from './constants';
import { generateDailyEvent, analyzeSocialMediaPost, interpretFreeTextAction, generateDynamicJobs, generateDynamicProperties, generateDynamicAssets } from './services/geminiService';
import Dashboard from './components/Dashboard';
import Instaverse from './components/Instaverse';
import Finance from './components/Finance';
import CareerAssets from './components/CareerAssets';
import CompoundV from './components/CompoundV';
import EventModal from './components/EventModal';
import { Landmark, Briefcase, Zap, Bell } from 'lucide-react';

const DIALOGUE_POOL = [
  "Homelander: 'Ben ne istersem onu yaparım. Ben her şeyin üstündeyim.'",
  "Billy Butcher: 'Bütün supe'lar gebermeyi hak ediyor. Özellikle de o pelerinli sarışın pislik.'",
  "Hughie: 'Sadece normal, sakin bir hayat istiyordum. Neden her şey bu kadar karmaşık?'",
  "Starlight: 'Vought tamamen bir yalan üzerine kurulu. Gerçek kahramanlar sokaktaki insanlardır.'",
  "A-Train: 'Dünyanın en hızlı insanı benim! Kimse beni geçemez, anladın mı?'",
  "Frenchie: 'Mon ami, bu Bileşik V formülü tam bir sanat eseri ama bir o kadar da zehirli.'",
  "Ashley: 'Lütfen kameraya gülümseyin! Vought hisseleri düşerse hepimiz biteriz!'"
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'instaverse' | 'finance' | 'career' | 'compoundv'>('dashboard');
  const [isAnalyzingPost, setIsAnalyzingPost] = useState(false);
  const [isAnalyzingFreeText, setIsAnalyzingFreeText] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  const addNotification = (message: string) => {
    setNotifications((prev) => [message, ...prev.slice(0, 4)]);
  };

  // --- Core State Mutation Engine (Strict Sync) ---
  const applyStateChanges = useCallback((effects: ChoiceEffect, stateChanges?: StateChanges | null) => {
    setGameState((prev) => {
      const newStats = { ...prev.stats };
      const newBank = { ...prev.bank };
      const newCompoundV = { ...prev.compoundV };
      let newJob = prev.currentJob;
      let newOwnedProperties = [...prev.ownedProperties];
      let newOwnedAssets = [...prev.ownedAssets];
      let newAlignment = prev.stats.alignment;

      // 1. Apply Choice Effects
      if (effects.health !== undefined) newStats.health = Math.min(100, Math.max(0, newStats.health + effects.health));
      if (effects.energy !== undefined) newStats.energy = Math.min(100, Math.max(0, newStats.energy + effects.energy));
      if (effects.stress !== undefined) newStats.stress = Math.min(100, Math.max(0, newStats.stress + effects.stress));
      if (effects.happiness !== undefined) newStats.happiness = Math.min(100, Math.max(0, newStats.happiness + effects.happiness));
      if (effects.fame !== undefined) newStats.fame = Math.min(100, Math.max(0, newStats.fame + effects.fame));
      if (effects.morality !== undefined) newStats.morality = Math.min(100, Math.max(0, newStats.morality + effects.morality));
      if (effects.corruption !== undefined) newStats.corruption = Math.min(100, Math.max(0, newStats.corruption + effects.corruption));
      if (effects.money !== undefined) newBank.balance += effects.money;

      // 2. Apply State Changes
      if (stateChanges) {
        if (stateChanges.bank_balance_change !== undefined) {
          newBank.balance += stateChanges.bank_balance_change;
        }
        if (stateChanges.loan_change !== undefined) {
          newBank.loanAmount += stateChanges.loan_change;
        }
        if (stateChanges.job !== undefined) {
          if (stateChanges.job === null) {
            newJob = null;
          } else {
            const foundJob = prev.availableJobs.find((j) => j.id === stateChanges.job) || JOBS_LIST.find((j) => j.id === stateChanges.job);
            if (foundJob) newJob = foundJob;
          }
        }
        if (stateChanges.compound_v_status !== undefined) {
          if (stateChanges.compound_v_status === null) {
            newCompoundV.isInjected = false;
            newCompoundV.type = 'Yok';
            newCompoundV.powers = [];
            newCompoundV.instability = 0;
          } else if (stateChanges.compound_v_status) {
            newCompoundV.isInjected = true;
            newCompoundV.type = stateChanges.compound_v_status.type;
            newCompoundV.powers = stateChanges.compound_v_status.powers;
            newCompoundV.instability = stateChanges.compound_v_status.instability;
          }
        }
        if (stateChanges.alignment !== undefined && stateChanges.alignment !== null) {
          newAlignment = stateChanges.alignment;
        }

        // Sync dynamic property/asset additions/removals from event choices
        if (stateChanges.property_buy) {
          stateChanges.property_buy.forEach((propId) => {
            if (!newOwnedProperties.includes(propId)) {
              newOwnedProperties.push(propId);
            }
          });
        }
        if (stateChanges.property_sell) {
          newOwnedProperties = newOwnedProperties.filter((id) => !stateChanges.property_sell?.includes(id));
        }
        if (stateChanges.assets_add) {
          stateChanges.assets_add.forEach((assetId) => {
            if (!newOwnedAssets.includes(assetId)) {
              newOwnedAssets.push(assetId);
            }
          });
        }
        if (stateChanges.assets_remove) {
          newOwnedAssets = newOwnedAssets.filter((id) => !stateChanges.assets_remove?.includes(id));
        }
      }

      // Dynamic Alignment Recalculation if not explicitly set
      if (!stateChanges?.alignment) {
        if (newStats.morality > 75) newAlignment = Alignment.HERO;
        else if (newStats.morality < 30) newAlignment = Alignment.VILLAIN;
        else if (newStats.morality >= 30 && newStats.morality <= 50 && newStats.corruption > 50) newAlignment = Alignment.ROGUE;
        else newAlignment = Alignment.NEUTRAL;
      }

      return {
        ...prev,
        stats: { ...newStats, alignment: newAlignment },
        bank: newBank,
        compoundV: newCompoundV,
        currentJob: newJob,
        ownedProperties: newOwnedProperties,
        ownedAssets: newOwnedAssets
      };
    });
  }, []);

  // --- Dynamic Market Refresh (Jobs, Properties, Assets) ---
  const refreshDynamicMarkets = useCallback(async (currentState: GameState) => {
    addNotification('Piyasa güncelleniyor, yeni işler ve mülkler geliyor...');
    try {
      const [newJobs, newProperties, newAssets] = await Promise.all([
        generateDynamicJobs(currentState),
        generateDynamicProperties(currentState),
        generateDynamicAssets(currentState)
      ]);

      setGameState((prev) => ({
        ...prev,
        availableJobs: newJobs,
        availableProperties: newProperties,
        availableAssets: newAssets,
        history: ['Piyasa güncellendi: Yeni iş ilanları, emlaklar ve eşyalar satışa sunuldu.', ...prev.history]
      }));
      addNotification('Piyasa başarıyla güncellendi!');
    } catch (e) {
      console.error('Piyasa güncelleme hatası:', e);
    }
  }, []);

  // --- Real-Time Continuous Simulation Loop ---
  useEffect(() => {
    if (gameState.isPaused || gameState.activeEvent) return;

    const intervalTime = 3000 / gameState.timeSpeed; // 1 day every 3 seconds at 1x

    const timer = setInterval(() => {
      setGameState((prev) => {
        const nextDaysPassed = prev.daysPassed + 1;
        const currentYear = 2026 + Math.floor(nextDaysPassed / 360);

        // Daily Financial Calculations
        const dailySalary = prev.currentJob ? Math.floor(prev.currentJob.salary / 30) : 0;
        const dailyPassiveIncome = prev.ownedProperties.reduce((acc, id) => {
          const prop = PROPERTIES_LIST.find((p) => p.id === id) || prev.availableProperties.find((p) => p.id === id);
          return acc + (prop ? Math.floor(prop.passiveIncome / 360) : 0);
        }, 0);
        const dailyExpenses = 100 + Math.floor(prev.stats.age * 2); // Daily cost of living
        const dailyBankInterest = Math.floor(prev.bank.balance * (prev.bank.interestRate / 100) / 360);
        const dailyLoanInterest = Math.floor(prev.bank.loanAmount * (prev.bank.loanInterestRate / 100) / 360);

        const netDailyChange = dailySalary + dailyPassiveIncome + dailyBankInterest - dailyExpenses - dailyLoanInterest;

        // Daily Stat Changes
        const energyChange = prev.currentJob ? -2 : 1; // Lose energy if working
        const stressChange = prev.currentJob ? 1 : -1;

        // Add random dialogue/whisper to history log every 2 days to make the world feel alive
        let updatedHistory = [...prev.history];
        if (nextDaysPassed % 2 === 0) {
          const randomDialogue = DIALOGUE_POOL[Math.floor(Math.random() * DIALOGUE_POOL.length)];
          updatedHistory.unshift(`[Fısıltı] ${randomDialogue}`);
        }

        return {
          ...prev,
          daysPassed: nextDaysPassed,
          year: currentYear,
          history: updatedHistory,
          bank: {
            ...prev.bank,
            balance: Math.max(0, prev.bank.balance + netDailyChange)
          },
          stats: {
            ...prev.stats,
            energy: Math.min(100, Math.max(0, prev.stats.energy + energyChange)),
            stress: Math.min(100, Math.max(0, prev.stats.stress + stressChange))
          }
        };
      });

      // Trigger dynamic daily event with high frequency (35% daily chance)
      const checkAndTriggerEvent = async () => {
        if (Math.random() < 0.35) {
          // Pause time automatically for event
          setGameState((prev) => ({ ...prev, isPaused: true }));
          addNotification('Yeni bir olay gerçekleşti! Zaman durduruldu.');
          try {
            const event = await generateDailyEvent(gameState);
            setGameState((prev) => ({ ...prev, activeEvent: event }));
          } catch (e) {
            console.error('Günlük olay üretilemedi:', e);
          }
        }
      };
      checkAndTriggerEvent();

      // Periodically refresh dynamic markets (every 10 days)
      if (gameState.daysPassed % 10 === 0) {
        refreshDynamicMarkets(gameState);
      }

    }, intervalTime);

    return () => clearInterval(timer);
  }, [gameState.isPaused, gameState.timeSpeed, gameState.activeEvent, gameState.daysPassed, applyStateChanges, refreshDynamicMarkets]);

  // --- Time Control Handlers ---
  const handleTogglePause = () => {
    setGameState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
      timeSpeed: prev.isPaused ? 1 : 0
    }));
    addNotification(gameState.isPaused ? 'Zaman akışı başlatıldı.' : 'Zaman durduruldu.');
  };

  const handleChangeSpeed = (speed: number) => {
    setGameState((prev) => ({
      ...prev,
      timeSpeed: speed,
      isPaused: false
    }));
    addNotification(`Zaman hızı ${speed}x olarak ayarlandı.`);
  };

  const handleSkipWeek = async () => {
    addNotification('1 hafta (7 gün) atlanıyor...');
    setGameState((prev) => ({
      ...prev,
      daysPassed: prev.daysPassed + 7,
      isPaused: true
    }));
    // Trigger an event immediately after skip
    try {
      const event = await generateDailyEvent(gameState);
      setGameState((prev) => ({ ...prev, activeEvent: event }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSkipMonth = async () => {
    addNotification('1 ay (30 gün) atlanıyor...');
    setGameState((prev) => ({
      ...prev,
      daysPassed: prev.daysPassed + 30,
      isPaused: true
    }));
    try {
      const event = await generateDailyEvent(gameState);
      setGameState((prev) => ({ ...prev, activeEvent: event }));
    } catch (e) {
      console.error(e);
    }
  };

  // --- Quick Actions ---
  const handleRest = () => {
    setGameState((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        energy: Math.min(100, prev.stats.energy + 40),
        stress: Math.max(0, prev.stats.stress - 10)
      },
      history: ['Biraz dinlendin ve enerji topladın.', ...prev.history]
    }));
    addNotification('Dinlendiniz. Enerji +40, Stres -10');
  };

  const handleWork = () => {
    if (!gameState.currentJob) return;
    const salary = gameState.currentJob.salary;
    const title = gameState.currentJob.title;
    setGameState((prev) => ({
      ...prev,
      bank: {
        ...prev.bank,
        balance: prev.bank.balance + salary
      },
      stats: {
        ...prev.stats,
        energy: Math.max(0, prev.stats.energy - 15),
        stress: Math.min(100, prev.stats.stress + 5)
      },
      history: [`${title} olarak çalıştın ve ${salary.toLocaleString()} ₺ kazandın.`, ...prev.history]
    }));
    addNotification(`Çalıştınız. +${salary.toLocaleString()} ₺, Enerji -15`);
  };

  // --- Free Text Action Submission ---
  const handleFreeTextSubmit = async (text: string) => {
    setIsAnalyzingFreeText(true);
    setGameState((prev) => ({ ...prev, isPaused: true })); // Pause during action
    addNotification('Eyleminiz yapay zeka motoru tarafından simüle ediliyor...');

    try {
      const result = await interpretFreeTextAction(text, gameState);
      
      // Apply state changes permanently
      applyStateChanges(result.effects, result.state_changes);

      // Show result as an event modal
      const actionEvent: GameEvent = {
        id: `action_${Date.now()}`,
        type: 'single',
        date: 'Bugün',
        title: result.title,
        text: result.text,
        choices: [
          {
            text: 'Sonuçları Kabul Et',
            effects: result.effects,
            state_changes: result.state_changes
          }
        ]
      };

      setGameState((prev) => ({
        ...prev,
        activeEvent: actionEvent,
        history: [`Serbest Eylem: "${text.substring(0, 30)}..." gerçekleştirildi.`, ...prev.history]
      }));

    } catch (e) {
      console.error('Serbest yazım eylemi başarısız:', e);
    } finally {
      setIsAnalyzingFreeText(false);
    }
  };

  // --- Event Choice Selection ---
  const handleSelectChoice = (choice: Choice) => {
    // Apply state changes permanently
    applyStateChanges(choice.effects, choice.state_changes);

    // Set active event outcome screen instead of closing immediately
    setGameState((prev) => ({
      ...prev,
      activeEventOutcome: {
        choiceText: choice.text,
        outcomeText: choice.outcome || 'Kararınız başarıyla uygulandı ve dünya simülasyonu güncellendi.',
        effects: choice.effects
      },
      history: [`Karar Verildi: "${choice.text}"`, ...prev.history]
    }));
  };

  const handleCloseOutcome = () => {
    setGameState((prev) => ({
      ...prev,
      activeEvent: null,
      activeEventOutcome: null,
      isPaused: false // Resume time
    }));
    addNotification('Zaman akışı devam ediyor.');
  };

  // --- Social Media Post Creation ---
  const handlePostCreated = async (postText: string) => {
    setIsAnalyzingPost(true);
    addNotification('Gönderiniz Instaverse algoritması tarafından analiz ediliyor...');

    try {
      const analysis = await analyzeSocialMediaPost(postText, gameState);

      setGameState((prev) => {
        const newPost: Post = {
          id: `post_${Date.now()}`,
          username: prev.instaverse.username,
          content: postText,
          likes: analysis.likes,
          shares: analysis.shares,
          views: analysis.views,
          viralityScore: analysis.viralityScore,
          timestamp: 'Şimdi',
          isPlayer: true,
          comments: analysis.comments.map((c, idx) => ({
            id: `comment_${idx}_${Date.now()}`,
            ...c
          }))
        };

        const newStats = {
          ...prev.stats,
          fame: Math.min(100, Math.max(0, prev.stats.fame + analysis.statChanges.fame)),
          morality: Math.min(100, Math.max(0, prev.stats.morality + analysis.statChanges.morality)),
          corruption: Math.min(100, Math.max(0, prev.stats.corruption + analysis.statChanges.corruption))
        };

        const newInstaverse = {
          ...prev.instaverse,
          followers: Math.max(0, prev.instaverse.followers + analysis.statChanges.followers),
          engagementRate: parseFloat((prev.instaverse.engagementRate + analysis.statChanges.engagement).toFixed(1))
        };

        return {
          ...prev,
          stats: newStats,
          instaverse: newInstaverse,
          posts: [newPost, ...prev.posts],
          history: [`Instaverse'te paylaştın: "${postText.substring(0, 30)}..."`, ...prev.history]
        };
      });

      addNotification(`Gönderiniz viral oldu! +${analysis.statChanges.followers} yeni takipçi.`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingPost(false);
    }
  };

  // --- Financial Actions ---
  const handleDeposit = (amount: number) => {
    if (gameState.bank.balance < amount) {
      addNotification('Yetersiz bakiye!');
      return;
    }
    setGameState((prev) => ({
      ...prev,
      bank: {
        ...prev.bank,
        balance: prev.bank.balance - amount
      },
      history: [`Bankaya ${amount.toLocaleString()} ₺ yatırıldı.`, ...prev.history]
    }));
    addNotification(`${amount.toLocaleString()} ₺ bankaya yatırıldı.`);
  };

  const handleWithdraw = (amount: number) => {
    setGameState((prev) => {
      const withdrawAmt = Math.min(amount, prev.bank.balance);
      return {
        ...prev,
        bank: {
          ...prev.bank,
          balance: prev.bank.balance - withdrawAmt
        },
        history: [`Bankadan ${withdrawAmt.toLocaleString()} ₺ çekildi.`, ...prev.history]
      };
    });
    addNotification('Para çekme işlemi başarılı.');
  };

  const handleTakeLoan = (amount: number) => {
    setGameState((prev) => ({
      ...prev,
      bank: {
        ...prev.bank,
        balance: prev.bank.balance + amount,
        loanAmount: prev.bank.loanAmount + amount
      },
      history: [`Bankadan ${amount.toLocaleString()} ₺ kredi çekildi.`, ...prev.history]
    }));
    addNotification(`${amount.toLocaleString()} ₺ kredi onaylandı.`);
  };

  const handleRepayLoan = (amount: number) => {
    setGameState((prev) => {
      const payAmt = Math.min(amount, prev.bank.loanAmount, prev.bank.balance);
      return {
        ...prev,
        bank: {
          ...prev.bank,
          balance: prev.bank.balance - payAmt,
          loanAmount: prev.bank.loanAmount - payAmt
        },
        history: [`Kredi borcunun ${payAmt.toLocaleString()} ₺ kadarı ödendi.`, ...prev.history]
      };
    });
    addNotification('Kredi borcu ödemesi yapıldı.');
  };

  // --- Stock Market Actions ---
  const handleBuyStock = (stockId: string, quantity: number) => {
    const stock = gameState.stocks.find((s) => s.id === stockId);
    if (!stock) return;
    const totalCost = stock.price * quantity;

    if (gameState.bank.balance < totalCost) {
      addNotification('Yetersiz bakiye!');
      return;
    }

    setGameState((prev) => {
      const currentOwned = prev.portfolio[stockId] || 0;
      return {
        ...prev,
        bank: {
          ...prev.bank,
          balance: prev.bank.balance - totalCost
        },
        portfolio: {
          ...prev.portfolio,
          [stockId]: currentOwned + quantity
        },
        history: [`${quantity} adet ${stock.ticker} hissesi satın alındı.`, ...prev.history]
      };
    });
    addNotification(`${quantity} adet ${stock.ticker} satın alındı.`);
  };

  const handleSellStock = (stockId: string, quantity: number) => {
    const stock = gameState.stocks.find((s) => s.id === stockId);
    const owned = gameState.portfolio[stockId] || 0;
    if (!stock || owned < quantity) {
      addNotification('Yetersiz hisse senedi!');
      return;
    }

    const totalGain = stock.price * quantity;

    setGameState((prev) => {
      const currentOwned = prev.portfolio[stockId] || 0;
      return {
        ...prev,
        bank: {
          ...prev.bank,
          balance: prev.bank.balance + totalGain
        },
        portfolio: {
          ...prev.portfolio,
          [stockId]: currentOwned - quantity
        },
        history: [`${quantity} adet ${stock.ticker} hissesi satıldı.`, ...prev.history]
      };
    });
    addNotification(`${quantity} adet ${stock.ticker} satıldı.`);
  };

  // --- Real Estate Actions ---
  const handleBuyProperty = (propertyId: string) => {
    const prop = gameState.availableProperties.find((p) => p.id === propertyId) || PROPERTIES_LIST.find((p) => p.id === propertyId);
    if (!prop || gameState.ownedProperties.includes(propertyId)) return;

    if (gameState.bank.balance < prop.price) {
      addNotification('Yetersiz bakiye!');
      return;
    }

    setGameState((prev) => ({
      ...prev,
      bank: {
        ...prev.bank,
        balance: prev.bank.balance - prop.price
      },
      ownedProperties: [...prev.ownedProperties, propertyId],
      history: [`${prop.name} satın alındı.`, ...prev.history]
    }));
    addNotification(`${prop.name} satın alındı.`);
  };

  const handleSellProperty = (propertyId: string) => {
    const prop = gameState.availableProperties.find((p) => p.id === propertyId) || PROPERTIES_LIST.find((p) => p.id === propertyId);
    if (!prop || !gameState.ownedProperties.includes(propertyId)) return;

    const sellPrice = Math.floor(prop.price * 0.85);

    setGameState((prev) => ({
      ...prev,
      bank: {
        ...prev.bank,
        balance: prev.bank.balance + sellPrice
      },
      ownedProperties: prev.ownedProperties.filter((id) => id !== propertyId),
      history: [`${prop.name} ${sellPrice.toLocaleString()} ₺ bedelle satıldı.`, ...prev.history]
    }));
    addNotification(`${prop.name} satıldı.`);
  };

  // --- Career Actions ---
  const handleApplyJob = (job: Job) => {
    setGameState((prev) => ({
      ...prev,
      currentJob: job,
      history: [`${job.company} bünyesinde ${job.title} olarak işe başladın.`, ...prev.history]
    }));
    addNotification(`${job.title} işine kabul edildiniz.`);
  };

  const handleResignJob = () => {
    if (!gameState.currentJob) return;
    setGameState((prev) => ({
      ...prev,
      currentJob: null,
      history: [`${prev.currentJob?.title} görevinden istifa ettin.`, ...prev.history]
    }));
    addNotification('İşinizden istifa ettiniz.');
  };

  // --- Asset Actions ---
  const handleBuyAsset = (asset: Asset) => {
    if (gameState.ownedAssets.includes(asset.id)) return;
    if (gameState.bank.balance < asset.price) {
      addNotification('Yetersiz bakiye!');
      return;
    }

    setGameState((prev) => ({
      ...prev,
      bank: {
        ...prev.bank,
        balance: prev.bank.balance - asset.price
      },
      ownedAssets: [...prev.ownedAssets, asset.id],
      stats: {
        ...prev.stats,
        fame: Math.min(100, prev.stats.fame + asset.prestige)
      },
      history: [`${asset.name} satın alındı. Şöhret arttı!`, ...prev.history]
    }));
    addNotification(`${asset.name} satın alındı.`);
  };

  const handleSellAsset = (assetId: string) => {
    const asset = gameState.availableAssets.find((a) => a.id === assetId) || ASSETS_LIST.find((a) => a.id === assetId);
    if (!asset || !gameState.ownedAssets.includes(assetId)) return;

    const sellPrice = Math.floor(asset.price * 0.7);

    setGameState((prev) => ({
      ...prev,
      bank: {
        ...prev.bank,
        balance: prev.bank.balance + sellPrice
      },
      ownedAssets: prev.ownedAssets.filter((id) => id !== assetId),
      stats: {
        ...prev.stats,
        fame: Math.max(0, prev.stats.fame - asset.prestige)
      },
      history: [`${asset.name} satıldı.`, ...prev.history]
    }));
    addNotification(`${asset.name} satıldı.`);
  };

  // --- Compound V Injection ---
  const handleInjectCompoundV = (type: 'Geçici' | 'Kalıcı') => {
    const cost = type === 'Geçici' ? 50000 : 250000;
    if (gameState.bank.balance < cost) {
      addNotification('Yetersiz bakiye!');
      return;
    }

    const powersPool = ['Lazer Gözler', 'Süper Güç', 'Uçuş', 'Telekinezi', 'Görünmezlik', 'Hızlı İyileşme'];
    const selectedPowers = type === 'Geçici' 
      ? [powersPool[Math.floor(Math.random() * powersPool.length)]]
      : [powersPool[Math.floor(Math.random() * powersPool.length)], powersPool[Math.floor(Math.random() * powersPool.length)]];

    setGameState((prev) => ({
      ...prev,
      bank: {
        ...prev.bank,
        balance: prev.bank.balance - cost
      },
      compoundV: {
        isInjected: true,
        type,
        powers: selectedPowers,
        instability: type === 'Geçici' ? 20 : 60,
        sideEffects: type === 'Geçici' ? ['Hafif Baş Ağrısı'] : ['Hücresel Bozulma', 'Öfke Nöbetleri']
      },
      stats: {
        ...prev.stats,
        health: type === 'Kalıcı' ? Math.max(20, prev.stats.health - 30) : prev.stats.health,
        fame: prev.stats.fame + 20
      },
      history: [`Bileşik V (${type}) enjekte edildi! Yeni güçler: ${selectedPowers.join(', ')}`, ...prev.history]
    }));

    addNotification(`Bileşik V enjekte edildi! Güçleriniz: ${selectedPowers.join(', ')}`);
  };

  return (
    <div className="min-h-screen bg-vought-dark text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-vought-card border-b border-vought-border px-6 py-4 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-vought-red text-white font-black px-3 py-1.5 rounded-lg tracking-wider text-lg shadow-lg shadow-vought-red/20">
              VOUGHT LIFE
            </div>
            <span className="text-xs text-slate-400 border-l border-vought-border pl-3 hidden md:inline">
              Gerçek Zamanlı Yaşam Simülatörü
            </span>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-emerald-400">{gameState.bank.balance.toLocaleString()} ₺</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-vought-blue" />
              <span className="text-slate-300">{gameState.currentJob ? gameState.currentJob.title : 'İşsiz'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300">{gameState.compoundV.isInjected ? `Supe (${gameState.compoundV.type})` : 'Sivil'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Notifications Banner */}
        {notifications.length > 0 && (
          <div className="bg-vought-card border border-vought-border rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top duration-300">
            <Bell className="w-5 h-5 text-vought-gold flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs font-bold text-vought-gold uppercase tracking-wider">Son Bildirimler</span>
              <p className="text-sm text-slate-200 mt-1">{notifications[0]}</p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-vought-border pb-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'dashboard' ? 'bg-vought-red text-white' : 'bg-vought-card text-slate-400 hover:text-white'
            }`}
          >
            Ana Sayfa
          </button>
          <button
            onClick={() => setActiveTab('instaverse')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'instaverse' ? 'bg-vought-red text-white' : 'bg-vought-card text-slate-400 hover:text-white'
            }`}
          >
            Instaverse
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'finance' ? 'bg-vought-red text-white' : 'bg-vought-card text-slate-400 hover:text-white'
            }`}
          >
            Finans & Ekonomi
          </button>
          <button
            onClick={() => setActiveTab('career')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'career' ? 'bg-vought-red text-white' : 'bg-vought-card text-slate-400 hover:text-white'
            }`}
          >
            Kariyer & Varlıklar
          </button>
          <button
            onClick={() => setActiveTab('compoundv')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'compoundv' ? 'bg-vought-red text-white' : 'bg-vought-card text-slate-400 hover:text-white'
            }`}
          >
            Bileşik V & Güçler
          </button>
        </div>

        {/* Active Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'dashboard' && (
            <Dashboard
              gameState={gameState}
              onTogglePause={handleTogglePause}
              onChangeSpeed={handleChangeSpeed}
              onSkipWeek={handleSkipWeek}
              onSkipMonth={handleSkipMonth}
              onFreeTextSubmit={handleFreeTextSubmit}
              onRest={handleRest}
              onWork={handleWork}
              isAnalyzingFreeText={isAnalyzingFreeText}
            />
          )}

          {activeTab === 'instaverse' && (
            <Instaverse
              gameState={gameState}
              onPostCreated={handlePostCreated}
              isAnalyzing={isAnalyzingPost}
            />
          )}

          {activeTab === 'finance' && (
            <Finance
              gameState={gameState}
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
              onTakeLoan={handleTakeLoan}
              onRepayLoan={handleRepayLoan}
              onBuyStock={handleBuyStock}
              onSellStock={handleSellStock}
              onBuyProperty={handleBuyProperty}
              onSellProperty={handleSellProperty}
            />
          )}

          {activeTab === 'career' && (
            <CareerAssets
              gameState={gameState}
              onApplyJob={handleApplyJob}
              onResignJob={handleResignJob}
              onBuyAsset={handleBuyAsset}
              onSellAsset={handleSellAsset}
            />
          )}

          {activeTab === 'compoundv' && (
            <CompoundV
              gameState={gameState}
              onInjectCompoundV={handleInjectCompoundV}
            />
          )}
        </div>
      </main>

      {/* Event Modal Overlay */}
      {gameState.activeEvent && (
        <EventModal
          event={gameState.activeEvent}
          onSelectChoice={handleSelectChoice}
          outcome={gameState.activeEventOutcome}
          onCloseOutcome={handleCloseOutcome}
        />
      )}

      {/* Footer */}
      <footer className="bg-vought-card border-t border-vought-border py-6 mt-12 text-center text-xs text-slate-500">
        <p>© {gameState.year} Vought International. Tüm hakları saklıdır. "Birlikte Daha Güçlü."</p>
      </footer>
    </div>
  );
};

export default App;
