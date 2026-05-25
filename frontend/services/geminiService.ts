import { GoogleGenAI, Type } from '@google/genai';
import { GameState, GameEvent, Alignment, Job, Property, Asset } from '../types';
import { FALLBACK_EVENTS } from '../constants';

const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey, vertexai: true });
  } catch (e) {
    console.error('GoogleGenAI başlatılamadı:', e);
  }
}

/**
 * Generates a dynamic daily event based on the current game state.
 */
export async function generateDailyEvent(gameState: GameState): Promise<GameEvent> {
  if (!ai) {
    console.warn('API Anahtarı bulunamadı. Fallback olay yükleniyor.');
    return getRandomFallbackEvent();
  }

  const prompt = `
    Sen "The Boys" evreninde geçen gerçekçi bir yaşam simülasyonu oyununun kıdemli yapay zeka motorusun.
    Oyuncunun mevcut durumuna ve dünya durumuna göre 1 adet benzersiz, heyecan verici ve Türkçe günlük olay (event) üretmelisin.
    Olay oyuncunun ahlakına, şöhretine, işine, Bileşik V durumuna ve dünya ekonomisine uygun olmalıdır.

    Oyuncu Durumu:
    - Yaş: ${gameState.stats.age}
    - Sağlık: ${gameState.stats.health}, Enerji: ${gameState.stats.energy}, Stres: ${gameState.stats.stress}
    - Ahlak (Morality): ${gameState.stats.morality} (0=Kötü, 100=Kahraman)
    - Yozlaşma (Corruption): ${gameState.stats.corruption} (0=Temiz, 100=Tamamen Yozlaşmış)
    - Şöhret: ${gameState.stats.fame}, Hizalanma: ${gameState.stats.alignment}
    - Meslek: ${gameState.currentJob ? gameState.currentJob.title : 'İşsiz'} (${gameState.currentJob ? gameState.currentJob.company : ''})
    - Bileşik V Durumu: ${gameState.compoundV.type} (Güçler: ${gameState.compoundV.powers.join(', ')})
    - Banka Bakiyesi: ${gameState.bank.balance} TL

    Dünya Durumu:
    - Ekonomi: ${gameState.world.economy}, Enflasyon: %${gameState.world.inflation}
    - Suç Oranı: %${gameState.world.crimeRate}, Vought Etkisi: %${gameState.world.voughtInfluence}
    - Bileşik V Sızıntısı: %${gameState.world.compoundVLeak}

    Lütfen olay için 3 adet seçenek (choices) sun. Seçeneklerin etkileri (effects) ve durum değişiklikleri (state_changes) mantıklı olmalıdır.
    Her seçeneğin 'outcome' alanı, oyuncu o seçeneği seçtiğinde gerçekleşecek Türkçe sonuç hikayesini detaylıca anlatmalıdır.
    Tüm metinler, başlıklar ve seçenekler tamamen Türkçe olmalıdır. Karakterlerin konuşmaları The Boys evreninin karanlık, hicivli ve sert tonunu yansıtmalıdır.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING },
            date: { type: Type.STRING },
            title: { type: Type.STRING },
            text: { type: Type.STRING },
            choices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  outcome: { type: Type.STRING, description: 'Seçeneğin seçilmesi durumunda gerçekleşen Türkçe sonuç hikayesi' },
                  effects: {
                    type: Type.OBJECT,
                    properties: {
                      health: { type: Type.INTEGER },
                      energy: { type: Type.INTEGER },
                      stress: { type: Type.INTEGER },
                      happiness: { type: Type.INTEGER },
                      fame: { type: Type.INTEGER },
                      morality: { type: Type.INTEGER },
                      corruption: { type: Type.INTEGER },
                      money: { type: Type.INTEGER }
                    }
                  },
                  state_changes: {
                    type: Type.OBJECT,
                    properties: {
                      job: { type: Type.STRING, nullable: true },
                      bank_balance_change: { type: Type.INTEGER },
                      loan_change: { type: Type.INTEGER },
                      alignment: { type: Type.STRING, nullable: true }
                    }
                  }
                },
                required: ['text', 'effects', 'outcome']
              }
            }
          },
          required: ['id', 'type', 'date', 'title', 'text', 'choices']
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as GameEvent;
  } catch (error) {
    console.error('Gemini Event Generation Hatası:', error);
    return getRandomFallbackEvent();
  }
}

/**
 * Generates dynamic jobs based on the current world state and player stats.
 */
export async function generateDynamicJobs(gameState: GameState): Promise<Job[]> {
  if (!ai) {
    return simulateLocalJobs(gameState);
  }

  const prompt = `
    The Boys evreninde geçen yaşam simülasyonu için 4-6 adet tamamen dinamik ve Türkçe iş ilanı üret.
    İş ilanları dünya ekonomisine (${gameState.world.economy}), suç oranına (%${gameState.world.crimeRate}) ve Vought etkisine (%${gameState.world.voughtInfluence}) göre şekillenmelidir.
    İşlerin kategorileri: Normal, Kurumsal, Vought, Supe, Suç olabilir.
    Maaşlar gerçekçi olmalı ve enflasyona göre dengelenmelidir.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              salary: { type: Type.INTEGER },
              reputationRequired: { type: Type.INTEGER },
              moralityRequired: { type: Type.INTEGER },
              description: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ['id', 'title', 'company', 'salary', 'reputationRequired', 'moralityRequired', 'description', 'category']
          }
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as Job[];
  } catch (error) {
    console.error('Gemini Job Generation Hatası:', error);
    return simulateLocalJobs(gameState);
  }
}

/**
 * Generates dynamic properties based on the current world state.
 */
export async function generateDynamicProperties(gameState: GameState): Promise<Property[]> {
  if (!ai) {
    return simulateLocalProperties(gameState);
  }

  const prompt = `
    The Boys evreninde geçen yaşam simülasyonu için 4-5 adet tamamen dinamik ve Türkçe satılık emlak/arsa ilanı üret.
    Emlaklar dünya ekonomisine (${gameState.world.economy}) ve emlak trendine (${gameState.world.realEstateTrend}) göre şekillenmelidir.
    Mülk türleri: Apartman, Müstakil, Malikane, Sığınak, Arsa, Ticari olabilir.
    Fiyatlar ve pasif gelirler gerçekçi olmalıdır.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              price: { type: Type.INTEGER },
              passiveIncome: { type: Type.INTEGER },
              safetyValue: { type: Type.INTEGER },
              description: { type: Type.STRING },
              location: { type: Type.STRING }
            },
            required: ['id', 'name', 'type', 'price', 'passiveIncome', 'safetyValue', 'description', 'location']
          }
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as Property[];
  } catch (error) {
    console.error('Gemini Property Generation Hatası:', error);
    return simulateLocalProperties(gameState);
  }
}

/**
 * Generates dynamic assets based on the current world state.
 */
export async function generateDynamicAssets(gameState: GameState): Promise<Asset[]> {
  if (!ai) {
    return simulateLocalAssets(gameState);
  }

  const prompt = `
    The Boys evreninde geçen yaşam simülasyonu için 4-6 adet tamamen dinamik ve Türkçe satın alınabilir varlık/eşya üret.
    Eşyalar dünya ekonomisine (${gameState.world.economy}) ve suç oranına (%${gameState.world.crimeRate}) göre şekillenmelidir.
    Türler: Araç, Silah, Lüks, Elektronik olabilir.
    Fiyatlar ve prestij etkileri gerçekçi olmalıdır.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              price: { type: Type.INTEGER },
              prestige: { type: Type.INTEGER },
              description: { type: Type.STRING }
            },
            required: ['id', 'name', 'type', 'price', 'prestige', 'description']
          }
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as Asset[];
  } catch (error) {
    console.error('Gemini Asset Generation Hatası:', error);
    return simulateLocalAssets(gameState);
  }
}

/**
 * Interprets a player's free-text action and converts it into structured game consequences.
 */
export async function interpretFreeTextAction(
  actionText: string,
  gameState: GameState
): Promise<{
  title: string;
  text: string;
  effects: {
    health: number;
    energy: number;
    stress: number;
    happiness: number;
    fame: number;
    morality: number;
    corruption: number;
    money: number;
  };
  state_changes: {
    job?: string | null;
    bank_balance_change?: number;
    loan_change?: number;
    alignment?: Alignment | null;
    compound_v_status?: {
      type: 'Geçici' | 'Kalıcı' | 'Yok';
      powers: string[];
      instability: number;
    } | null;
  };
}> {
  if (!ai) {
    console.warn('API Anahtarı bulunamadı. Lokal serbest yazım simülasyonu yapılıyor.');
    return simulateLocalFreeText(actionText, gameState);
  }

  const prompt = `
    Oyuncu "The Boys" evreninde geçen yaşam simülasyonunda serbestçe şu eylemi gerçekleştirmek istediğini yazdı:
    "${actionText}"

    Oyuncunun Mevcut Durumu:
    - Yaş: ${gameState.stats.age}
    - Sağlık: ${gameState.stats.health}, Enerji: ${gameState.stats.energy}, Stres: ${gameState.stats.stress}
    - Ahlak: ${gameState.stats.morality}/100, Yozlaşma: ${gameState.stats.corruption}/100
    - Şöhret: ${gameState.stats.fame}/100, Hizalanma: ${gameState.stats.alignment}
    - Meslek: ${gameState.currentJob ? gameState.currentJob.title : 'İşsiz'}
    - Bileşik V Durumu: ${gameState.compoundV.type} (Güçler: ${gameState.compoundV.powers.join(', ')})
    - Banka Bakiyesi: ${gameState.bank.balance} TL

    Bu eylemin sonucunu "The Boys" evreninin karanlık, hicivli ve gerçekçi tonuna uygun olarak simüle et.
    Eylemin sonucunu anlatan Türkçe bir hikaye yaz ve bu eylemin oyuncunun istatistiklerine ve oyun durumuna (para, iş, hizalanma, Bileşik V vb.) etkilerini belirle.
    Eğer oyuncu "Vought'a saldırıyorum" gibi tehlikeli bir şey yazdıysa sağlık kaybı ve stres artışı yüksek olmalıdır. "Zengin olmak istiyorum" yazdıysa yozlaşma karşılığında para kazanma fırsatları veya riskli teklifler sunulabilir.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            text: { type: Type.STRING },
            effects: {
              type: Type.OBJECT,
              properties: {
                health: { type: Type.INTEGER },
                energy: { type: Type.INTEGER },
                stress: { type: Type.INTEGER },
                happiness: { type: Type.INTEGER },
                fame: { type: Type.INTEGER },
                morality: { type: Type.INTEGER },
                corruption: { type: Type.INTEGER },
                money: { type: Type.INTEGER }
              },
              required: ['health', 'energy', 'stress', 'happiness', 'fame', 'morality', 'corruption', 'money']
            },
            state_changes: {
              type: Type.OBJECT,
              properties: {
                job: { type: Type.STRING, nullable: true },
                bank_balance_change: { type: Type.INTEGER },
                loan_change: { type: Type.INTEGER },
                alignment: { type: Type.STRING, nullable: true },
                compound_v_status: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    powers: { type: Type.ARRAY, items: { type: Type.STRING } },
                    instability: { type: Type.INTEGER }
                  },
                  nullable: true
                }
              }
            }
          },
          required: ['title', 'text', 'effects', 'state_changes']
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini Free Text Analiz Hatası:', error);
    return simulateLocalFreeText(actionText, gameState);
  }
}

/**
 * Analyzes a player's custom social media post and generates reactions.
 */
export async function analyzeSocialMediaPost(
  postText: string,
  gameState: GameState
): Promise<{
  likes: number;
  shares: number;
  views: number;
  viralityScore: number;
  statChanges: {
    fame: number;
    morality: number;
    corruption: number;
    followers: number;
    engagement: number;
  };
  comments: {
    username: string;
    text: string;
    likes: number;
    isVerified: boolean;
    sentiment: 'positive' | 'negative' | 'neutral';
  }[];
  trendingTopic?: string;
}> {
  if (!ai) {
    console.warn('API Anahtarı bulunamadı. Lokal analiz yapılıyor.');
    return simulateLocalPostAnalysis(postText, gameState);
  }

  const prompt = `
    Oyuncu Instaverse (The Boys evrenindeki Instagram/X hibriti) platformunda şu gönderiyi paylaştı:
    "${postText}"

    Oyuncunun Mevcut Profili:
    - Kullanıcı Adı: @${gameState.instaverse.username}
    - Takipçi Sayısı: ${gameState.instaverse.followers}
    - Şöhret Seviyesi: ${gameState.stats.fame}/100
    - Hizalanma (Alignment): ${gameState.stats.alignment}
    - Ahlak: ${gameState.stats.morality}/100, Yozlaşma: ${gameState.stats.corruption}/100

    Dünya Durumu:
    - Vought Etkisi: %${gameState.world.voughtInfluence}
    - Kamu Korkusu: %${gameState.world.publicFear}

    Bu gönderiyi analiz et. Gönderinin tonunu (kahramanca, isyankar, Vought yanlısı, suç itirafı, komik vb.) belirle.
    Buna göre gerçekçi beğeni, paylaşım, izlenme sayıları, virallik skoru (0-100), oyuncu istatistiklerindeki değişimleri ve 3 adet farklı NPC yorumunu Türkçe olarak oluştur.
    Yorum yapanlar arasında Vought destekçileri, The Boys hayranları, troller veya diğer supe'lar olabilir.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            likes: { type: Type.INTEGER },
            shares: { type: Type.INTEGER },
            views: { type: Type.INTEGER },
            viralityScore: { type: Type.INTEGER },
            statChanges: {
              type: Type.OBJECT,
              properties: {
                fame: { type: Type.INTEGER },
                morality: { type: Type.INTEGER },
                corruption: { type: Type.INTEGER },
                followers: { type: Type.INTEGER },
                engagement: { type: Type.NUMBER }
              },
              required: ['fame', 'morality', 'corruption', 'followers', 'engagement']
            },
            comments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  username: { type: Type.STRING },
                  text: { type: Type.STRING },
                  likes: { type: Type.INTEGER },
                  isVerified: { type: Type.BOOLEAN },
                  sentiment: { type: Type.STRING }
                },
                required: ['username', 'text', 'likes', 'isVerified', 'sentiment']
              }
            },
            trendingTopic: { type: Type.STRING, nullable: true }
          },
          required: ['likes', 'shares', 'views', 'viralityScore', 'statChanges', 'comments']
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini Post Analiz Hatası:', error);
    return simulateLocalPostAnalysis(postText, gameState);
  }
}

// --- Fallback & Local Simulation Helpers ---

function getRandomFallbackEvent(): GameEvent {
  const shuffled = [...FALLBACK_EVENTS].sort(() => 0.5 - Math.random());
  return shuffled[0];
}

function simulateLocalJobs(gameState: GameState): Job[] {
  const baseSalaryMultiplier = gameState.world.economy === 'Yükseliş' ? 1.2 : gameState.world.economy === 'Resesyon' ? 0.8 : 1.0;
  return [
    {
      id: `job_dyn_${Date.now()}_1`,
      title: 'Sokak Kuryesi',
      company: 'HızlıGelsin',
      salary: Math.floor(18000 * baseSalaryMultiplier),
      reputationRequired: 0,
      moralityRequired: 40,
      description: 'Sokaklarda paket taşıyarak dürüst bir yaşam sür.',
      category: 'Normal'
    },
    {
      id: `job_dyn_${Date.now()}_2`,
      title: 'Vought Güvenlik Görevlisi',
      company: 'Vought Security',
      salary: Math.floor(45000 * baseSalaryMultiplier),
      reputationRequired: 20,
      moralityRequired: 30,
      description: 'Vought tesislerini ve supe etkinliklerini koru.',
      category: 'Vought'
    },
    {
      id: `job_dyn_${Date.now()}_3`,
      title: 'Bileşik V Laboratuvar Asistanı',
      company: 'Flatline Pharmaceuticals',
      salary: Math.floor(75000 * baseSalaryMultiplier),
      reputationRequired: 40,
      moralityRequired: 20,
      description: 'Gizli formüller üzerinde çalış. Kimyasallara maruz kalma riski yüksek.',
      category: 'Kurumsal'
    },
    {
      id: `job_dyn_${Date.now()}_4`,
      title: 'Sokak Kanunsuzu (The Boys Muhbiri)',
      company: 'Direniş',
      salary: Math.floor(90000 * baseSalaryMultiplier),
      reputationRequired: 50,
      moralityRequired: 70,
      description: 'Supe pisliklerini ortaya çıkar, Vought karşıtı operasyonlara bilgi sızdır.',
      category: 'Suç'
    }
  ];
}

function simulateLocalProperties(gameState: GameState): Property[] {
  const priceMultiplier = gameState.world.realEstateTrend === 'up' ? 1.2 : gameState.world.realEstateTrend === 'down' ? 0.8 : 1.0;
  return [
    {
      id: `prop_dyn_${Date.now()}_1`,
      name: 'Esenyurt Stüdyo Daire',
      type: 'Apartman',
      price: Math.floor(450000 * priceMultiplier),
      passiveIncome: 30000,
      safetyValue: 10,
      description: 'Gürültülü ama ucuz. Vought devriyeleri buraya nadiren uğrar.',
      location: 'İstanbul, Esenyurt'
    },
    {
      id: `prop_dyn_${Date.now()}_2`,
      name: 'Kadıköy 2+1 Daire',
      type: 'Apartman',
      price: Math.floor(1800000 * priceMultiplier),
      passiveIncome: 108000,
      safetyValue: 40,
      description: 'Merkezi konumda, sosyal medyanın kalbinde modern bir daire.',
      location: 'İstanbul, Kadıköy'
    },
    {
      id: `prop_dyn_${Date.now()}_3`,
      name: 'Göktürk Güvenli Villa',
      type: 'Müstakil',
      price: Math.floor(7500000 * priceMultiplier),
      passiveIncome: 420000,
      safetyValue: 75,
      description: 'Özel güvenlikli, supe saldırılarına karşı güçlendirilmiş lüks villa.',
      location: 'İstanbul, Göktürk'
    }
  ];
}

function simulateLocalAssets(gameState: GameState): Asset[] {
  return [
    {
      id: `asset_dyn_${Date.now()}_1`,
      name: 'Tofaş Şahin (Modifiyeli)',
      type: 'Araç',
      price: 120000,
      prestige: 5,
      description: 'Yerli klasik. Hızlı kaçışlar için pek uygun değil ama nostaljik.'
    },
    {
      id: `asset_dyn_${Date.now()}_2`,
      name: 'Motosiklet (Yamaha R6)',
      type: 'Araç',
      price: 450000,
      prestige: 25,
      description: 'Trafikten kaçmak ve supe takiplerinden sıyrılmak için ideal hız canavarı.'
    },
    {
      id: `asset_dyn_${Date.now()}_3`,
      name: 'Zırhlı SUV (Vought Edition)',
      type: 'Araç',
      price: 3500000,
      prestige: 70,
      description: 'Kurşun geçirmez camlar, güçlendirilmiş şasi. Tam bir kale.'
    }
  ];
}

function simulateLocalFreeText(actionText: string, gameState: GameState) {
  const textLower = actionText.toLowerCase();
  let title = 'Eyleminin Sonucu';
  let text = 'Yazdığın eylem dünyada yankı buldu. Sokaklarda senin hakkında konuşuluyor.';
  let health = 0;
  let energy = -10;
  let stress = 10;
  let happiness = 5;
  let fame = 5;
  let morality = 0;
  let corruption = 0;
  let money = 0;
  let alignment: Alignment | null = null;

  if (textLower.includes('vought') || textLower.includes('saldır') || textLower.includes('ifşa')) {
    title = 'Vought Karşıtı Eylem';
    text = 'Vought tesislerine yakın bir bölgede protesto düzenledin veya sızma girişiminde bulundun. Güvenlik güçleri sert müdahale etti!';
    health = -15;
    stress = 25;
    fame = 15;
    morality = 10;
    corruption = -5;
    alignment = Alignment.ROGUE;
  } else if (textLower.includes('zengin') || textLower.includes('para') || textLower.includes('çal')) {
    title = 'Hızlı Para Arayışı';
    text = 'Karanlık sokaklarda veya borsa manipülasyonlarında şansını denedin. Bir miktar nakit elde ettin ama vicdanın rahat değil.';
    money = 25000;
    morality = -15;
    corruption = 15;
    stress = 15;
  } else if (textLower.includes('kahraman') || textLower.includes('kurtar')) {
    title = 'Kahramanlık Girişimi';
    text = 'Sokakta supe saldırısına uğrayan bir sivile yardım etmeye çalıştın. Cesaretin takdir topladı!';
    health = -5;
    fame = 20;
    morality = 20;
    happiness = 15;
    alignment = Alignment.HERO;
  }

  return {
    title,
    text,
    effects: { health, energy, stress, happiness, fame, morality, corruption, money },
    state_changes: { alignment }
  };
}

function simulateLocalPostAnalysis(postText: string, gameState: GameState) {
  const textLower = postText.toLowerCase();
  let fameChange = 2;
  let moralityChange = 0;
  let corruptionChange = 0;
  let followerChange = Math.floor(Math.random() * 50) + 10;
  let virality = 10;

  const comments = [
    { username: 'supe_fan_34', text: 'Harika paylaşım! Takipteyim.', likes: 12, isVerified: false, sentiment: 'positive' as const },
    { username: 'vought_watcher', text: 'Vought bu gönderiyi izliyor olabilir, dikkat et.', likes: 45, isVerified: true, sentiment: 'neutral' as const },
    { username: 'anti_supe_tr', text: 'Boş yapma, sokaklar supe pislikleriyle dolu!', likes: 8, isVerified: false, sentiment: 'negative' as const }
  ];

  if (textLower.includes('vought') || textLower.includes('yalan') || textLower.includes('sahte')) {
    fameChange = 15;
    moralityChange = 10;
    corruptionChange = -5;
    followerChange = Math.floor(gameState.instaverse.followers * 0.15) + 100;
    virality = 65;
    comments[1] = { username: 'vought_pr_team', text: 'Bu asılsız iddialar hakkında yasal süreç başlatılacaktır.', likes: 340, isVerified: true, sentiment: 'negative' as const };
  } else if (textLower.includes('güç') || textLower.includes('lazer') || textLower.includes('uçmak') || textLower.includes('v')) {
    fameChange = 20;
    moralityChange = -5;
    corruptionChange = 10;
    followerChange = Math.floor(gameState.instaverse.followers * 0.25) + 250;
    virality = 80;
    comments[0] = { username: 'homelander_fanboy', text: 'Yeni bir kahraman mı doğuyor yoksa bir terörist mi?', likes: 180, isVerified: false, sentiment: 'neutral' as const };
  }

  const views = Math.floor(followerChange * (Math.random() * 10 + 5));
  const likes = Math.floor(views * 0.1);
  const shares = Math.floor(likes * 0.05);

  return {
    likes,
    shares,
    views,
    viralityScore: virality,
    statChanges: {
      fame: fameChange,
      morality: moralityChange,
      corruption: corruptionChange,
      followers: followerChange,
      engagement: 5.2
    },
    comments,
    trendingTopic: virality > 50 ? '#VoughtGerçekleri' : undefined
  };
}
