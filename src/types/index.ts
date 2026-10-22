export type PlantCategory = 
  | 'houseplant' 
  | 'succulent' 
  | 'herb' 
  | 'vegetable' 
  | 'fruit' 
  | 'flower' 
  | 'bonsai' 
  | 'foliage';

export type SunlightPreference = 
  | 'low_indirect' 
  | 'medium_indirect' 
  | 'bright_indirect' 
  | 'full_sun' 
  | 'partial_shade';

export type PlantLocation = 
  | 'indoor_living_room' 
  | 'indoor_bedroom' 
  | 'indoor_kitchen' 
  | 'indoor_bathroom' 
  | 'balcony' 
  | 'patio' 
  | 'garden_bed' 
  | 'greenhouse';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'watering' | 'diary' | 'plants' | 'harvest' | 'level' | 'health';
  unlockedAt?: string;
  isUnlocked: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'experienced';
  gardenType?: string;
  xp?: number;
  level?: number;
  title?: string;
  streakDays?: number;
  badges?: Badge[];
  preferences?: {
    measurementUnit?: 'metric' | 'imperial';
    emailReminders?: boolean;
    browserNotifications?: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
  createdAt: string;
}

export interface Plant {
  id: string;
  userId: string;
  name: string;
  species: string;
  nickname?: string;
  category: PlantCategory;
  photoUrl: string;
  location: PlantLocation;
  sunlightRequirement: SunlightPreference;
  currentLightHours?: number;
  currentLightType?: 'direct' | 'indirect' | 'shade';
  potSize?: string;
  soilType?: string;
  wateringFrequencyDays: number;
  lastWateredDate: string;
  nextWaterDate: string;
  waterAmountMl?: number;
  fertilizeFrequencyDays: number;
  lastFertilizedDate: string;
  nextFertilizeDate: string;
  fertilizerType?: string;
  isHarvestable?: boolean;
  plantedDate: string;
  expectedHarvestDate?: string;
  harvestWindowDays?: number;
  healthStatus?: 'healthy' | 'attention_needed' | 'recovering';
  notes?: string;
  tags?: string[];
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WateringLog {
  id: string;
  plantId: string;
  userId: string;
  date: string;
  amountMl?: number;
  method?: 'top' | 'bottom' | 'mist' | 'soak';
  soilMoistureBefore?: 'dry' | 'damp' | 'wet';
  notes?: string;
}

export interface FertilizerLog {
  id: string;
  plantId: string;
  userId: string;
  date: string;
  fertilizerType: string;
  npkRatio?: string;
  amount: number;
  unit: 'ml' | 'g' | 'drops' | 'scoops';
  dilutionRatio?: string;
  notes?: string;
}

export interface GrowthRecord {
  id: string;
  plantId: string;
  userId: string;
  date: string;
  heightCm: number;
  leafCount: number;
  floweringStatus: 'none' | 'budding' | 'blooming' | 'faded';
  photoUrl?: string;
  milestone?: string;
  notes?: string;
}

export interface PlantHealthReport {
  id: string;
  plantId?: string;
  userId: string;
  date: string;
  photoUrl?: string;
  plantSpecies?: string;
  symptoms: string[];
  affectedParts?: string[];
  durationDays?: number;
  wateringHabits?: string;
  sunlightConditions?: string;
  diagnosisTitle: string;
  visualObservations: string[];
  possibleCauses: Array<{
    name: string;
    likelihood: 'Low' | 'Moderate' | 'High';
    explanation: string;
  }>;
  severity: 'mild' | 'moderate' | 'severe';
  safeTreatments: string[];
  preventiveTips: string[];
  isConclusive: boolean;
  inconclusiveReason?: string;
  expertDisclaimer: string;
}

export interface HarvestRecord {
  id: string;
  plantId: string;
  userId: string;
  date: string;
  quantity: number;
  unit: 'kg' | 'grams' | 'pieces' | 'bunches' | 'baskets';
  qualityRating?: 1 | 2 | 3 | 4 | 5;
  photoUrl?: string;
  notes?: string;
}

export type DiaryEventType = 
  | 'watering' 
  | 'fertilizing' 
  | 'pruning' 
  | 'repotting' 
  | 'pest_control' 
  | 'growth' 
  | 'flowering' 
  | 'harvest' 
  | 'general_note';

export interface DiaryEntry {
  id: string;
  plantId?: string;
  userId: string;
  date: string;
  title: string;
  content: string;
  eventType: DiaryEventType;
  tags: string[];
  photoUrls?: string[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  plantId?: string;
  plantName?: string;
  title: string;
  message: string;
  type: 'water' | 'fertilize' | 'harvest' | 'health' | 'tip';
  priority?: 'normal' | 'urgent';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  plantContextId?: string;
  imageUrl?: string;
}

export interface SunlightAssessment {
  plantId?: string;
  plantName?: string;
  plantRequirement: SunlightPreference;
  environment: PlantLocation;
  dailyHours: number;
  lightType: 'direct' | 'indirect' | 'shade';
  windowFacing?: 'north' | 'south' | 'east' | 'west' | 'none';
  status: 'Low' | 'Suitable' | 'Potentially Excessive';
  summary: string;
  recommendations: string[];
  riskAnalysis: string;
}

export interface DashboardStats {
  totalPlants: number;
  plantsNeedingWaterToday: number;
  overdueWateringCount: number;
  upcomingFertilizerCount: number;
  healthAlertsCount: number;
  sunlightWarningCount: number;
  upcomingHarvestsCount: number;
  recentDiaryCount: number;
  todayTasksCount: number;
}

export interface WeatherData {
  city: string;
  latitude: number;
  longitude: number;
  temperature: number; // in Celsius
  apparentTemperature: number;
  humidity: number; // percentage (0-100)
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
  windSpeed: number; // km/h
  precipitationProbability?: number; // %
  tempMax?: number;
  tempMin?: number;
  dewPoint?: number;
  plantCareAdjustments: {
    wateringAdvice: string;
    humidityAdvice: string;
    temperatureStatus: 'optimal' | 'warm' | 'cool' | 'cold' | 'extreme_heat';
    humidityStatus: 'low' | 'moderate' | 'high';
    generalTip: string;
    actionableDirectives?: string[];
  };
  lastUpdated: string;
}

export interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  category: 'soil' | 'fertilizer' | 'pot' | 'tool' | 'other';
  quantity: number;
  unit: 'kg' | 'liters' | 'pieces' | 'bottles' | 'ml';
  minThreshold: number;
  lastUpdated: string;
  notes?: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  species: string;
  category: PlantCategory;
  notes?: string;
  addedAt: string;
}

