import { GameState, Alignment, EconomyStatus, Stock, Property, Asset, Job, GameEvent } from './types';

export const INITIAL_STOCKS: Stock[] = [
  {
    id: 'vought',
    name: 'Vought International',
    ticker: 'VGT',
    price: 150,
    history: [140, 145, 138, 142, 150],
    description: 'Dünyanın en büyük süper kahraman ve medya konglomeratı.'
  },
  {
    id: 'tekknight',
    name: 'Tek Knight Industries',
    ticker: 'TEK',
    price: 85,
    history: [80, 82, 85, 83, 85],
    description: 'Yüksek teknoloji zırhlar, savunma sanayii ve gözetleme sistemleri.'
  },
  {
    id: 'vought_energy',
    name: 'Vought Energy',
    ticker: 'VGE',
    price: 65,
    history: [60, 62, 61, 64, 65],
    description: 'Bileşik V üretim tesislerine ve şehirlere enerji sağlayan dev altyapı şirketi.'
  },
  {
    id: 'godolkin',
    name: 'Godolkin Media',
    ticker: 'GOD',
    price: 45,
    history: [48, 46, 44, 45, 45],
    description: 'Genç kahramanların eğitimi, eğlence sektörü ve sosyal medya yönetimi.'
  },
  {
    id: 'flatline',
    name: 'Flatline Pharmaceuticals',
    ticker: 'FLT',
    price: 110,
    history: [100, 105, 108, 112, 110],
    description: 'Vought yan kuruluşu, tıbbi araştırmalar ve Bileşik V stabilizörleri üreticisi.'
  }
];

export const PROPERTIES_LIST: Property[] = [
  {
    id: 'prop_1',
    name: 'Esenyurt Stüdyo Daire',
    type: 'Apartman',
    price: 450000,
    passiveIncome: 30000, // Annual passive income
    safetyValue: 10,
    description: 'Gürültülü ama ucuz. Vought devriyeleri buraya nadiren uğrar.',
    location: 'İstanbul, Esenyurt'
  },
  {
    id: 'prop_2',
    name: 'Kadıköy 2+1 Daire',
    type: 'Apartman',
    price: 1800000,
    passiveIncome: 108000,
    safetyValue: 40,
    description: 'Merkezi konumda, sosyal medyanın kalbinde modern bir daire.',
    location: 'İstanbul, Kadıköy'
  },
  {
    id: 'prop_3',
    name: 'Göktürk Güvenli Villa',
    type: 'Müstakil',
    price: 7500000,
    passiveIncome: 420000,
    safetyValue: 75,
    description: 'Özel güvenlikli, supe saldırılarına karşı güçlendirilmiş lüks villa.',
    location: 'İstanbul, Göktürk'
  },
  {
    id: 'prop_4',
    name: 'Şile Yeraltı Sığınağı',
    type: 'Sığınak',
    price: 12000000,
    passiveIncome: 0,
    safetyValue: 99,
    description: 'Nükleer ve supe saldırılarına dayanıklı, Vought uydularından gizlenmiş sığınak.',
    location: 'İstanbul, Şile'
  },
  {
    id: 'prop_5',
    name: 'Maslak Ticari Plaza Katı',
    type: 'Ticari',
    price: 25000000,
    passiveIncome: 1800000,
    safetyValue: 50,
    description: 'Büyük şirketlere kiralanabilir, yüksek pasif gelir sağlayan plaza katı.',
    location: 'İstanbul, Maslak'
  }
];

export const ASSETS_LIST: Asset[] = [
  {
    id: 'asset_1',
    name: 'Tofaş Şahin (Modifiyeli)',
    type: 'Araç',
    price: 120000,
    prestige: 5,
    description: 'Yerli klasik. Hızlı kaçışlar için pek uygun değil ama nostaljik.'
  },
  {
    id: 'asset_2',
    name: 'Motosiklet (Yamaha R6)',
    type: 'Araç',
    price: 450000,
    prestige: 25,
    description: 'Trafikten kaçmak ve supe takiplerinden sıyrılmak için ideal hız canavarı.'
  },
  {
    id: 'asset_3',
    name: 'Zırhlı SUV (Vought Edition)',
    type: 'Araç',
    price: 3500000,
    prestige: 70,
    description: 'Kurşun geçirmez camlar, güçlendirilmiş şasi. Tam bir kale.'
  },
  {
    id: 'asset_4',
    name: 'Glock 19 & Çelik Yelek',
    type: 'Silah',
    price: 85000,
    prestige: 15,
    description: 'Kendini korumak isteyen siviller veya sokak kanunsuzları için temel paket.'
  },
  {
    id: 'asset_5',
    name: 'Rolex Daytona Altın Saat',
    type: 'Lüks',
    price: 1200000,
    prestige: 90,
    description: 'Sosyal medyada ve Vought partilerinde statünü kanıtlayacak ultra lüks saat.'
  }
];

export const JOBS_LIST: Job[] = [
  {
    id: 'job_1',
    title: 'Serbest Kurye',
    company: 'Sokaklar',
    salary: 18000,
    reputationRequired: 0,
    moralityRequired: 50,
    description: 'Paket taşıyarak hayatta kalmaya çalış. Düşük risk, düşük gelir.',
    category: 'Normal'
  },
  {
    id: 'job_2',
    title: 'Vought Sosyal Medya Uzmanı',
    company: 'Vought International',
    salary: 45000,
    reputationRequired: 20,
    moralityRequired: 40,
    description: 'Supe skandallarını örtbas et, sahte kahramanlık hikayeleri yaz.',
    category: 'Vought'
  },
  {
    id: 'job_3',
    title: 'Bileşik V Laboratuvar Asistanı',
    company: 'Flatline Pharmaceuticals',
    salary: 75000,
    reputationRequired: 40,
    moralityRequired: 30,
    description: 'Gizli formüller üzerinde çalış. Kimyasallara maruz kalma riski yüksek.',
    category: 'Kurumsal'
  },
  {
    id: 'job_4',
    title: 'Vought Güvenlik Görevlisi',
    company: 'Vought Security',
    salary: 60000,
    reputationRequired: 30,
    moralityRequired: 50,
    description: 'Vought tesislerini ve supe etkinliklerini koru. Tehlikeli bir iş.',
    category: 'Vought'
  },
  {
    id: 'job_5',
    title: 'Sokak Kanunsuzu (The Boys Muhbiri)',
    company: 'Direniş',
    salary: 90000,
    reputationRequired: 50,
    moralityRequired: 80,
    description: 'Supe pisliklerini ortaya çıkar, Vought karşıtı operasyonlara bilgi sızdır.',
    category: 'Suç'
  },
  {
    id: 'job_6',
    title: 'Vought 7 Üyesi (Supe)',
    company: 'Vought International',
    salary: 500000,
    reputationRequired: 85,
    moralityRequired: 20,
    description: 'Dünyanın en ünlü kahramanlar grubuna katıl. Şöhret, para ve sınırsız yozlaşma.',
    category: 'Supe'
  }
];

export const FALLBACK_EVENTS: GameEvent[] = [
  {
    id: 'fallback_1',
    type: 'micro',
    date: 'Bugün',
    title: 'Sokakta Şüpheli Çanta',
    text: 'Kadıköy sokaklarında yürürken, üzerinde Vought logosu olan yarı açık mavi bir çanta buldun. İçinde parıldayan mavi bir sıvı tüpü ve bir miktar nakit para var.',
    choices: [
      {
        text: 'Mavi tüpü (Bileşik V) kendine enjekte et ve parayı al!',
        effects: { health: -10, stress: 20, happiness: 15, morality: -15, corruption: 20, fame: 5 },
        state_changes: {
          bank_balance_change: 15000,
          compound_v_status: {
            type: 'Geçici',
            powers: ['Süper Hız', 'Gözlerden Lazer Atma'],
            instability: 30
          }
        },
        outcome: 'Bileşik V tüpünü tereddüt etmeden koluna sapladın! Damarlarında yanan bir ateş hissettin. Gözlerin parıldamaya başladı. Artık sıradan bir sivil değilsin!'
      },
      {
        text: 'Sadece parayı al, tüpü çöpe at.',
        effects: { happiness: 10, morality: -5, corruption: 5 },
        state_changes: { bank_balance_change: 15000 },
        outcome: 'Parayı cebine indirdin ve tehlikeli mavi tüpü en yakın çöp kutusuna fırlattın. En azından bugün cebin sıcak!'
      },
      {
        text: 'Çantayı polise ve Vought yetkililerine teslim et.',
        effects: { morality: 20, corruption: 10, fame: 10, stress: -5 },
        state_changes: { bank_balance_change: 2000 },
        outcome: 'Örnek bir vatandaş gibi çantayı Vought yetkililerine teslim ettin. Sana ufak bir ödül verdiler ve Instaverse profilinde dürüstlüğün övüldü.'
      }
    ]
  },
  {
    id: 'fallback_2',
    type: 'economic',
    date: 'Bugün',
    title: 'Vought Borsada Çakılıyor!',
    text: 'Homelander\'ın gizli bir ses kaydı internete sızdı. Kayıtta sivilleri açıkça tehdit ediyor. Vought hisseleri serbest düşüşte, halk panik halinde.',
    choices: [
      {
        text: 'Düşüşü fırsat bilip tüm paranla Vought hissesi al.',
        effects: { stress: 25, corruption: 15 },
        state_changes: { bank_balance_change: -5000 },
        outcome: 'Herkes panik halindeyken sen risk aldın ve ucuzlayan Vought hisselerini topladın. Bu hamle seni ya vezir edecek ya rezil!'
      },
      {
        text: 'Sosyal medyada Homelander karşıtı kampanya başlat.',
        effects: { fame: 25, morality: 15, stress: 10 },
        state_changes: { alignment: Alignment.ROGUE },
        outcome: 'Instaverse üzerinden Homelander karşıtı sert paylaşımlar yaptın. Gönderin binlerce beğeni aldı ve direnişçilerin dikkatini çektin.'
      },
      {
        text: 'Olaylara karışma, bankadaki paranı koru.',
        effects: { stress: -10, happiness: 5 },
        outcome: 'Televizyonu kapatıp kahveni yudumladın. Supe dünyasının pisliği seni ilgilendirmiyor, huzurun her şeyden önemli.'
      }
    ]
  }
];

export const INITIAL_STATE: GameState = {
  stats: {
    age: 18,
    health: 100,
    energy: 100,
    stress: 20,
    happiness: 70,
    morality: 50,
    corruption: 10,
    fame: 0,
    alignment: Alignment.NEUTRAL
  },
  world: {
    economy: EconomyStatus.STABLE,
    inflation: 45,
    unemployment: 12,
    crimeRate: 35,
    publicFear: 25,
    voughtInfluence: 60,
    compoundVLeak: 5,
    stockMarketIndex: 12500,
    realEstateTrend: 'stable',
    socialTrends: ['#VoughtHerYerde', '#BileşikVGerçeği', '#HomelanderKurtarıcı']
  },
  bank: {
    balance: 25000,
    loanAmount: 0,
    interestRate: 35,
    loanInterestRate: 42
  },
  stocks: INITIAL_STOCKS,
  portfolio: {},
  properties: PROPERTIES_LIST,
  availableProperties: PROPERTIES_LIST, // Initial available properties
  ownedProperties: [],
  assets: ASSETS_LIST,
  availableAssets: ASSETS_LIST, // Initial available assets
  ownedAssets: [],
  availableJobs: JOBS_LIST, // Initial available jobs
  currentJob: null,
  compoundV: {
    isInjected: false,
    type: 'Yok',
    powers: [],
    instability: 0,
    sideEffects: []
  },
  instaverse: {
    username: 'sivil_vatandas',
    bio: 'The Boys dünyasında hayatta kalmaya çalışan sıradan biri.',
    followers: 120,
    following: 180,
    verified: false,
    engagementRate: 4.5
  },
  posts: [
    {
      id: 'p_init_1',
      username: 'vought_official',
      content: 'Kahramanlarımız her an yanınızda! Yeni güvenlik paketlerimizle aileniz güvende. #VoughtHerYerde',
      likes: 125000,
      comments: [
        { id: 'c1', username: 'supe_fan_99', text: 'Harikasınız! Homelander seni seviyoruz!', likes: 450, isVerified: false, sentiment: 'positive' },
        { id: 'c2', username: 'kasap_billy', text: 'Hepsi yalan, gözünüzü açın.', likes: 1200, isVerified: true, sentiment: 'negative' }
      ],
      shares: 12000,
      views: 500000,
      viralityScore: 85,
      timestamp: '2 saat önce',
      isPlayer: false
    }
  ],
  trendingTopics: ['#VoughtHerYerde', '#BileşikVGerçeği', '#HomelanderKurtarıcı', '#TheSeven', '#İstanbulSupeSaldırısı'],
  history: ['Hayata 18 yaşında sıradan bir sivil olarak başladın.'],
  activeEvent: null,
  activeEventOutcome: null, // Initial outcome state is null
  year: 2026,
  daysPassed: 0,
  timeSpeed: 0, // Starts paused
  isPaused: true
};
