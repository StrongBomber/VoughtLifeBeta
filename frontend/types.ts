export enum Alignment {
  HERO = 'Kahraman',
  VILLAIN = 'Kötü Adam',
  NEUTRAL = 'Tarafsız',
  ROGUE = 'Kanunsuz'
}

export enum EconomyStatus {
  RECESSION = 'Resesyon',
  STABLE = 'Dengeli',
  BOOM = 'Yükseliş'
}

export interface CharacterStats {
  age: number;
  health: number; // 0 - 100
  energy: number; // 0 - 100
  stress: number; // 0 - 100
  happiness: number; // 0 - 100
  morality: number; // 0 - 100
  corruption: number; // 0 - 100
  fame: number; // 0 - 100
  alignment: Alignment;
}

export interface WorldState {
  economy: EconomyStatus;
  inflation: number; // %
  unemployment: number; // %
  crimeRate: number; // %
  publicFear: number; // %
  voughtInfluence: number; // %
  compoundVLeak: number; // %
  stockMarketIndex: number;
  realEstateTrend: 'up' | 'down' | 'stable';
  socialTrends: string[];
}

export interface BankAccount {
  balance: number;
  loanAmount: number;
  interestRate: number;
  loanInterestRate: number;
}

export interface Stock {
  id: string;
  name: string;
  ticker: string;
  price: number;
  history: number[];
  description: string;
}

export interface StockPortfolio {
  [stockId: string]: number;
}

export interface Property {
  id: string;
  name: string;
  type: 'Apartman' | 'Müstakil' | 'Malikane' | 'Sığınak' | 'Arsa' | 'Ticari';
  price: number;
  passiveIncome: number; // Annual
  safetyValue: number;
  description: string;
  location: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'Araç' | 'Silah' | 'Lüks' | 'Elektronik';
  price: number;
  prestige: number;
  description: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  salary: number; // Monthly
  reputationRequired: number;
  moralityRequired: number;
  description: string;
  category: 'Normal' | 'Kurumsal' | 'Vought' | 'Supe' | 'Suç';
}

export interface CompoundVStatus {
  isInjected: boolean;
  type: 'Geçici' | 'Kalıcı' | 'Yok';
  powers: string[];
  instability: number; // 0 - 100
  sideEffects: string[];
}

export interface InstaverseProfile {
  username: string;
  bio: string;
  followers: number;
  following: number;
  verified: boolean;
  engagementRate: number; // %
}

export interface Comment {
  id: string;
  username: string;
  text: string;
  likes: number;
  isVerified: boolean;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface Post {
  id: string;
  username: string;
  content: string;
  likes: number;
  comments: Comment[];
  shares: number;
  views: number;
  viralityScore: number;
  timestamp: string;
  isPlayer: boolean;
}

export interface ChoiceEffect {
  health?: number;
  energy?: number;
  stress?: number;
  happiness?: number;
  fame?: number;
  morality?: number;
  corruption?: number;
  money?: number;
}

export interface StateChanges {
  job?: string | null;
  assets_add?: string[];
  assets_remove?: string[];
  property_buy?: string[];
  property_sell?: string[];
  bank_balance_change?: number;
  loan_change?: number;
  compound_v_status?: {
    type: 'Geçici' | 'Kalıcı' | 'Yok';
    powers: string[];
    instability: number;
  } | null;
  alignment?: Alignment | null;
}

export interface Choice {
  text: string;
  effects: ChoiceEffect;
  state_changes?: StateChanges;
  next_step?: boolean;
  outcome?: string; // Dynamic outcome text generated or simulated
}

export interface GameEvent {
  id: string;
  type: 'single' | 'multi' | 'micro' | 'economic' | 'world';
  date: string;
  title: string;
  text: string;
  choices: Choice[];
  final_outcome?: string;
}

export interface EventOutcomeState {
  choiceText: string;
  outcomeText: string;
  effects: ChoiceEffect;
}

export interface GameState {
  stats: CharacterStats;
  world: WorldState;
  bank: BankAccount;
  stocks: Stock[];
  portfolio: StockPortfolio;
  properties: Property[];
  availableProperties: Property[];
  ownedProperties: string[];
  assets: Asset[];
  availableAssets: Asset[];
  ownedAssets: string[];
  availableJobs: Job[];
  currentJob: Job | null;
  compoundV: CompoundVStatus;
  instaverse: InstaverseProfile;
  posts: Post[];
  trendingTopics: string[];
  history: string[];
  activeEvent: GameEvent | null;
  activeEventOutcome: EventOutcomeState | null; // Track active event outcome screen
  year: number;
  daysPassed: number;
  timeSpeed: number;
  isPaused: boolean;
}
