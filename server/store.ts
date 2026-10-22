import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { 
  User, 
  Plant, 
  WateringLog, 
  FertilizerLog, 
  GrowthRecord, 
  PlantHealthReport, 
  HarvestRecord, 
  DiaryEntry, 
  NotificationItem, 
  AIChatMessage, 
  DashboardStats,
  Badge,
  InventoryItem,
  WishlistItem
} from '../src/types/index.ts';
import { 
  INITIAL_DEMO_USER, 
  INITIAL_PLANTS, 
  INITIAL_GROWTH_RECORDS, 
  INITIAL_DIARY_ENTRIES, 
  INITIAL_HARVEST_RECORDS, 
  INITIAL_HEALTH_REPORTS 
} from '../src/data/mockPlants.ts';

interface DatabaseSchema {
  users: Array<User & { passwordHash: string }>;
  plants: Plant[];
  wateringLogs: WateringLog[];
  fertilizerLogs: FertilizerLog[];
  growthRecords: GrowthRecord[];
  healthReports: PlantHealthReport[];
  harvestRecords: HarvestRecord[];
  diaryEntries: DiaryEntry[];
  notifications: NotificationItem[];
  chatMessages: Record<string, AIChatMessage[]>; // userId -> messages
  inventoryItems: InventoryItem[];
  wishlistItems: WishlistItem[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'plantpal_store.json');

class DataStore {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadInitialData();
  }

  private loadInitialData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read existing store file, initializing fresh store:', err);
    }

    return this.createDefaultSeedData();
  }

  private createDefaultSeedData(): DatabaseSchema {
    const demoHashedPassword = bcrypt.hashSync('plantpal123', 10);
    const demoUser: User & { passwordHash: string } = {
      ...INITIAL_DEMO_USER,
      passwordHash: demoHashedPassword,
    };

    const initialNotifications: NotificationItem[] = [
      {
        id: 'notif_01',
        userId: INITIAL_DEMO_USER.id,
        plantId: 'plant_basil_03',
        plantName: 'Geno (Basil)',
        title: 'Watering Due Today',
        message: 'Geno is ready for 300 ml of water. Check soil moisture first!',
        type: 'water',
        priority: 'urgent',
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/watering',
      },
      {
        id: 'notif_02',
        userId: INITIAL_DEMO_USER.id,
        plantId: 'plant_fig_05',
        plantName: 'Felix (Fiddle Leaf)',
        title: 'Fertilizer Scheduled',
        message: 'Monthly feeding due today with diluted Ficus food.',
        type: 'fertilize',
        priority: 'normal',
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/fertilizer',
      },
      {
        id: 'notif_03',
        userId: INITIAL_DEMO_USER.id,
        plantId: 'plant_tomato_02',
        plantName: 'Ruby (Roma Tomato)',
        title: 'Harvest Window Approaching',
        message: 'Plum tomatoes are ripening quickly. Check firmness this weekend!',
        type: 'harvest',
        priority: 'normal',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        actionUrl: '/harvest',
      }
    ];

    const initialChats: AIChatMessage[] = [
      {
        id: 'chat_welcome',
        role: 'assistant',
        content: `Hello! I'm PlantPal AI, your gardening companion. I can help with care schedules, diagnose sick leaves, advise on fertilizer dosages, or plan your next harvest. How is your garden doing today?`,
        timestamp: new Date().toISOString(),
      }
    ];

    const seed: DatabaseSchema = {
      users: [demoUser],
      plants: JSON.parse(JSON.stringify(INITIAL_PLANTS)),
      wateringLogs: [
        {
          id: 'wl_01',
          plantId: 'plant_monstera_01',
          userId: INITIAL_DEMO_USER.id,
          date: '2026-10-18T10:00:00.000Z',
          amountMl: 500,
          method: 'top',
          soilMoistureBefore: 'dry',
          notes: 'Watered thoroughly until drainage appeared.',
        },
        {
          id: 'wl_02',
          plantId: 'plant_tomato_02',
          userId: INITIAL_DEMO_USER.id,
          date: '2026-10-20T08:30:00.000Z',
          amountMl: 1200,
          method: 'bottom',
          soilMoistureBefore: 'dry',
          notes: 'Bottom soaked grow bag.',
        }
      ],
      fertilizerLogs: [
        {
          id: 'fl_01',
          plantId: 'plant_monstera_01',
          userId: INITIAL_DEMO_USER.id,
          date: '2026-09-28T09:00:00.000Z',
          fertilizerType: 'Balanced Liquid Houseplant Fertilizer',
          npkRatio: '10-10-10',
          amount: 5,
          unit: 'ml',
          dilutionRatio: '1 tsp per gallon',
          notes: 'Applied during morning watering.',
        },
        {
          id: 'fl_02',
          plantId: 'plant_tomato_02',
          userId: INITIAL_DEMO_USER.id,
          date: '2026-10-09T08:00:00.000Z',
          fertilizerType: 'Organic Tomato Fertilizer',
          npkRatio: '4-6-8',
          amount: 15,
          unit: 'g',
          notes: 'Top-dressed soil.',
        }
      ],
      growthRecords: JSON.parse(JSON.stringify(INITIAL_GROWTH_RECORDS)),
      healthReports: JSON.parse(JSON.stringify(INITIAL_HEALTH_REPORTS)),
      harvestRecords: JSON.parse(JSON.stringify(INITIAL_HARVEST_RECORDS)),
      diaryEntries: JSON.parse(JSON.stringify(INITIAL_DIARY_ENTRIES)),
      notifications: initialNotifications,
      chatMessages: {
        [INITIAL_DEMO_USER.id]: initialChats,
      },
      inventoryItems: [],
      wishlistItems: [],
    };

    this.persistSync(seed);
    return seed;
  }

  private persist() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persistSync(this.data);
    }, 150);
  }

  private persistSync(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist store:', err);
    }
  }

  // --- Users ---
  public findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string) {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  public createUser(userData: {
    name: string;
    email: string;
    passwordHash: string;
    gardenType?: string;
    experienceLevel?: 'beginner' | 'intermediate' | 'experienced';
  }): User {
    const newUser: User & { passwordHash: string } = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: userData.name,
      email: userData.email,
      passwordHash: userData.passwordHash,
      experienceLevel: userData.experienceLevel || 'intermediate',
      gardenType: userData.gardenType || 'Indoor & Balcony Garden',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userData.name)}`,
      preferences: {
        measurementUnit: 'metric',
        emailReminders: true,
        browserNotifications: true,
      },
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);

    // Seed new user with a couple of starter plants so they can immediately test
    const starterPlant1: Plant = {
      id: `plant_${Date.now()}_1`,
      userId: newUser.id,
      name: 'Peace Lily',
      species: 'Spathiphyllum',
      nickname: 'Lily',
      category: 'houseplant',
      photoUrl: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&w=900&q=80',
      location: 'indoor_living_room',
      sunlightRequirement: 'medium_indirect',
      currentLightHours: 5,
      currentLightType: 'indirect',
      potSize: '20 cm ceramic pot',
      soilType: 'Rich moisture-retentive potting mix',
      wateringFrequencyDays: 5,
      lastWateredDate: new Date().toISOString(),
      nextWaterDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      waterAmountMl: 400,
      fertilizeFrequencyDays: 30,
      lastFertilizedDate: new Date().toISOString(),
      nextFertilizeDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      fertilizerType: 'Liquid houseplant food',
      isHarvestable: false,
      plantedDate: new Date().toISOString(),
      healthStatus: 'healthy',
      notes: 'Thrives in medium indirect light. Droops dramatically when it is thirsty!',
      tags: ['peace-lily', 'air-purifier', 'indoor'],
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.plants.push(starterPlant1);
    this.persist();

    const { passwordHash, ...safe } = newUser;
    return safe;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const userIndex = this.data.users.findIndex((u) => u.id === id);
    if (userIndex === -1) return null;

    const current = this.data.users[userIndex];
    this.data.users[userIndex] = {
      ...current,
      ...updates,
      id: current.id, // protect id
      passwordHash: current.passwordHash,
    };
    this.persist();

    const { passwordHash, ...safe } = this.data.users[userIndex];
    return safe;
  }

  // --- Plants ---
  public getPlantsByUser(userId: string): Plant[] {
    return this.data.plants.filter((p) => p.userId === userId && !p.archived);
  }

  public getPlantById(id: string, userId?: string): Plant | null {
    const plant = this.data.plants.find((p) => p.id === id);
    if (!plant) return null;
    if (userId && plant.userId !== userId) return null;
    return plant;
  }

  public createPlant(userId: string, plantData: Omit<Plant, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Plant {
    const newPlant: Plant = {
      ...plantData,
      id: `plant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.plants.push(newPlant);
    this.persist();
    return newPlant;
  }

  public updatePlant(id: string, userId: string, updates: Partial<Plant>): Plant | null {
    const index = this.data.plants.findIndex((p) => p.id === id && p.userId === userId);
    if (index === -1) return null;

    const current = this.data.plants[index];
    this.data.plants[index] = {
      ...current,
      ...updates,
      id: current.id,
      userId: current.userId,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.plants[index];
  }

  public deletePlant(id: string, userId: string): boolean {
    const index = this.data.plants.findIndex((p) => p.id === id && p.userId === userId);
    if (index === -1) return false;
    this.data.plants.splice(index, 1);
    this.persist();
    return true;
  }

  public markWatered(id: string, userId: string, details?: { amountMl?: number; method?: any; soilMoistureBefore?: any; notes?: string }): { plant: Plant; log: WateringLog } | null {
    const plant = this.getPlantById(id, userId);
    if (!plant) return null;

    const now = new Date();
    const nextDate = new Date(now.getTime() + plant.wateringFrequencyDays * 86400000);

    const log: WateringLog = {
      id: `wl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      plantId: plant.id,
      userId,
      date: now.toISOString(),
      amountMl: details?.amountMl || plant.waterAmountMl || 400,
      method: details?.method || 'top',
      soilMoistureBefore: details?.soilMoistureBefore || 'dry',
      notes: details?.notes || 'Marked as watered via quick action',
    };

    plant.lastWateredDate = now.toISOString();
    plant.nextWaterDate = nextDate.toISOString();
    plant.updatedAt = now.toISOString();

    this.data.wateringLogs.push(log);
    this.persist();

    return { plant, log };
  }

  public markFertilized(id: string, userId: string, details: { fertilizerType?: string; npkRatio?: string; amount?: number; unit?: any; notes?: string }): { plant: Plant; log: FertilizerLog } | null {
    const plant = this.getPlantById(id, userId);
    if (!plant) return null;

    const now = new Date();
    const nextDate = new Date(now.getTime() + plant.fertilizeFrequencyDays * 86400000);

    const log: FertilizerLog = {
      id: `fl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      plantId: plant.id,
      userId,
      date: now.toISOString(),
      fertilizerType: details.fertilizerType || plant.fertilizerType || 'Balanced Fertilizer',
      npkRatio: details.npkRatio,
      amount: details.amount || 5,
      unit: details.unit || 'ml',
      notes: details.notes || 'Recorded feeding schedule',
    };

    plant.lastFertilizedDate = now.toISOString();
    plant.nextFertilizeDate = nextDate.toISOString();
    plant.updatedAt = now.toISOString();

    this.data.fertilizerLogs.push(log);
    this.persist();

    return { plant, log };
  }

  // --- Logs & Records ---
  public getWateringLogs(plantId: string, userId: string): WateringLog[] {
    return this.data.wateringLogs
      .filter((l) => l.plantId === plantId && l.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getFertilizerLogs(plantId: string, userId: string): FertilizerLog[] {
    return this.data.fertilizerLogs
      .filter((l) => l.plantId === plantId && l.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getGrowthRecords(plantId: string, userId: string): GrowthRecord[] {
    return this.data.growthRecords
      .filter((g) => g.plantId === plantId && g.userId === userId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  public addGrowthRecord(userId: string, recordData: Omit<GrowthRecord, 'id' | 'userId'>): GrowthRecord {
    const newRecord: GrowthRecord = {
      ...recordData,
      id: `gr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
    };
    this.data.growthRecords.push(newRecord);
    this.persist();
    return newRecord;
  }

  public deleteGrowthRecord(id: string, userId: string): boolean {
    const idx = this.data.growthRecords.findIndex((g) => g.id === id && g.userId === userId);
    if (idx === -1) return false;
    this.data.growthRecords.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Harvest ---
  public getHarvestRecords(userId: string, plantId?: string): HarvestRecord[] {
    return this.data.harvestRecords
      .filter((h) => h.userId === userId && (!plantId || h.plantId === plantId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addHarvestRecord(userId: string, record: Omit<HarvestRecord, 'id' | 'userId'>): HarvestRecord {
    const newRecord: HarvestRecord = {
      ...record,
      id: `hr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
    };
    this.data.harvestRecords.push(newRecord);
    this.persist();
    return newRecord;
  }

  // --- Diary ---
  public getDiaryEntries(userId: string, plantId?: string): DiaryEntry[] {
    return this.data.diaryEntries
      .filter((d) => d.userId === userId && (!plantId || d.plantId === plantId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addDiaryEntry(userId: string, entry: Omit<DiaryEntry, 'id' | 'userId'>): DiaryEntry {
    const newEntry: DiaryEntry = {
      ...entry,
      id: `diary_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
    };
    this.data.diaryEntries.push(newEntry);
    this.persist();
    return newEntry;
  }

  public updateDiaryEntry(id: string, userId: string, updates: Partial<DiaryEntry>): DiaryEntry | null {
    const idx = this.data.diaryEntries.findIndex((d) => d.id === id && d.userId === userId);
    if (idx === -1) return null;
    this.data.diaryEntries[idx] = {
      ...this.data.diaryEntries[idx],
      ...updates,
      id,
      userId,
    };
    this.persist();
    return this.data.diaryEntries[idx];
  }

  public deleteDiaryEntry(id: string, userId: string): boolean {
    const idx = this.data.diaryEntries.findIndex((d) => d.id === id && d.userId === userId);
    if (idx === -1) return false;
    this.data.diaryEntries.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Health Reports ---
  public getHealthReports(userId: string, plantId?: string): PlantHealthReport[] {
    return this.data.healthReports
      .filter((r) => r.userId === userId && (!plantId || r.plantId === plantId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addHealthReport(report: PlantHealthReport): PlantHealthReport {
    this.data.healthReports.push(report);
    this.persist();
    return report;
  }

  // --- Notifications ---
  public getNotifications(userId: string): NotificationItem[] {
    return this.data.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addNotification(notification: Omit<NotificationItem, 'id' | 'createdAt'>): NotificationItem {
    const newNotif: NotificationItem = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.push(newNotif);
    this.persist();
    return newNotif;
  }

  public markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id && n.userId === userId);
    if (!notif) return false;
    notif.read = true;
    this.persist();
    return true;
  }

  public markAllNotificationsAsRead(userId: string): boolean {
    let updated = false;
    for (const notif of this.data.notifications) {
      if (notif.userId === userId && !notif.read) {
        notif.read = true;
        updated = true;
      }
    }
    if (updated) this.persist();
    return true;
  }

  // --- Chat Messages ---
  public getChatHistory(userId: string): AIChatMessage[] {
    return this.data.chatMessages[userId] || [];
  }

  public addChatMessage(userId: string, message: AIChatMessage): AIChatMessage[] {
    if (!this.data.chatMessages[userId]) {
      this.data.chatMessages[userId] = [];
    }
    this.data.chatMessages[userId].push(message);
    // Keep last 50 messages per user
    if (this.data.chatMessages[userId].length > 50) {
      this.data.chatMessages[userId] = this.data.chatMessages[userId].slice(-50);
    }
    this.persist();
    return this.data.chatMessages[userId];
  }

  public clearChatHistory(userId: string): void {
    this.data.chatMessages[userId] = [];
    this.persist();
  }

  // --- Inventory ---
  public getInventoryByUser(userId: string): InventoryItem[] {
    return this.data.inventoryItems.filter((i) => i.userId === userId);
  }

  public addInventoryItem(userId: string, itemData: Omit<InventoryItem, 'id' | 'userId' | 'lastUpdated'>): InventoryItem {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      lastUpdated: new Date().toISOString(),
    };
    this.data.inventoryItems.push(newItem);
    this.persist();
    return newItem;
  }

  public updateInventoryItem(id: string, userId: string, updates: Partial<InventoryItem>): InventoryItem | null {
    const idx = this.data.inventoryItems.findIndex((i) => i.id === id && i.userId === userId);
    if (idx === -1) return null;
    this.data.inventoryItems[idx] = {
      ...this.data.inventoryItems[idx],
      ...updates,
      id,
      userId,
      lastUpdated: new Date().toISOString(),
    };
    this.persist();
    return this.data.inventoryItems[idx];
  }

  public deleteInventoryItem(id: string, userId: string): boolean {
    const idx = this.data.inventoryItems.findIndex((i) => i.id === id && i.userId === userId);
    if (idx === -1) return false;
    this.data.inventoryItems.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Wishlist ---
  public getWishlistByUser(userId: string): WishlistItem[] {
    return this.data.wishlistItems.filter((w) => w.userId === userId);
  }

  public addToWishlist(userId: string, itemData: Omit<WishlistItem, 'id' | 'userId' | 'addedAt'>): WishlistItem {
    const newItem: WishlistItem = {
      ...itemData,
      id: `wish_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      addedAt: new Date().toISOString(),
    };
    this.data.wishlistItems.push(newItem);
    this.persist();
    return newItem;
  }

  public removeFromWishlist(id: string, userId: string): boolean {
    const idx = this.data.wishlistItems.findIndex((w) => w.id === id && w.userId === userId);
    if (idx === -1) return false;
    this.data.wishlistItems.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Dashboard Aggregation ---
  public getDashboardStats(userId: string): DashboardStats {
    const plants = this.getPlantsByUser(userId);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let plantsNeedingWaterToday = 0;
    let overdueWateringCount = 0;
    let upcomingFertilizerCount = 0;
    let healthAlertsCount = 0;
    let sunlightWarningCount = 0;
    let upcomingHarvestsCount = 0;

    for (const plant of plants) {
      const nextWaterStr = plant.nextWaterDate.split('T')[0];
      if (nextWaterStr <= todayStr) {
        plantsNeedingWaterToday++;
        if (nextWaterStr < todayStr) {
          overdueWateringCount++;
        }
      }

      const nextFertilizeStr = plant.nextFertilizeDate.split('T')[0];
      const diffFertilizeDays = Math.ceil((new Date(plant.nextFertilizeDate).getTime() - now.getTime()) / 86400000);
      if (diffFertilizeDays <= 3) {
        upcomingFertilizerCount++;
      }

      if (plant.healthStatus === 'attention_needed') {
        healthAlertsCount++;
      }

      // Check sunlight warning
      if (plant.currentLightHours !== undefined) {
        if (plant.sunlightRequirement === 'full_sun' && plant.currentLightHours < 5) {
          sunlightWarningCount++;
        } else if (plant.sunlightRequirement === 'low_indirect' && plant.currentLightType === 'direct') {
          sunlightWarningCount++;
        }
      }

      if (plant.isHarvestable && plant.expectedHarvestDate) {
        const daysToHarvest = Math.ceil((new Date(plant.expectedHarvestDate).getTime() - now.getTime()) / 86400000);
        if (daysToHarvest >= -5 && daysToHarvest <= 14) {
          upcomingHarvestsCount++;
        }
      }
    }

    const recentDiary = this.getDiaryEntries(userId).filter((d) => {
      const days = (now.getTime() - new Date(d.date).getTime()) / 86400000;
      return days <= 14;
    });

    const todayTasks = plantsNeedingWaterToday + upcomingFertilizerCount;

    return {
      totalPlants: plants.length,
      plantsNeedingWaterToday,
      overdueWateringCount,
      upcomingFertilizerCount,
      healthAlertsCount,
      sunlightWarningCount,
      upcomingHarvestsCount,
      recentDiaryCount: recentDiary.length,
      todayTasksCount: todayTasks,
    };
  }

  // --- Gamification & XP System ---
  public awardXpAndCheckBadges(userId: string, xpGain: number): { user: User; xpGained: number; leveledUp: boolean; newBadges: Badge[] } {
    const user = this.findUserById(userId);
    if (!user) throw new Error('User not found');

    const currentXp = user.xp || 0;
    const currentLevel = user.level || 1;
    const newXp = currentXp + xpGain;
    const newLevel = Math.floor(newXp / 150) + 1;
    const leveledUp = newLevel > currentLevel;

    const titles = [
      'Seedling Sprout',
      'Budding Botanist',
      'Green Thumb Apprentice',
      'Master Gardener',
      'Plant Whisperer',
      'Grand Horticulturist'
    ];
    const newTitle = titles[Math.min(newLevel - 1, titles.length - 1)];

    if (!user.badges) {
      user.badges = [
        { id: 'badge_first_seed', title: 'First Seed', description: 'Added your very first plant.', icon: '🌱', category: 'plants', isUnlocked: false },
        { id: 'badge_hydration_hero', title: 'Hydration Hero', description: 'Completed 5 watering tasks.', icon: '💧', category: 'watering', isUnlocked: false },
        { id: 'badge_diary_scribe', title: 'Botanical Scribe', description: 'Logged 3 diary entries.', icon: '📖', category: 'diary', isUnlocked: false },
        { id: 'badge_plant_doctor', title: 'Plant Doctor', description: 'Diagnosed a plant health issue.', icon: '🩺', category: 'health', isUnlocked: false },
        { id: 'badge_harvest_master', title: 'Bumper Harvest', description: 'Logged your first harvest.', icon: '🍎', category: 'harvest', isUnlocked: false },
        { id: 'badge_master_horticulturist', title: 'Master Horticulturist', description: 'Reach Level 5 and earn 1,000 XP.', icon: '👑', category: 'level', isUnlocked: false },
      ];
    }

    const newlyUnlocked: Badge[] = [];
    const plantsCount = this.getPlantsByUser(userId).length;
    const wateringLogsCount = this.data.wateringLogs.filter(l => l.userId === userId).length;
    const diaryEntriesCount = this.data.diaryEntries.filter(e => e.userId === userId).length;
    const harvestCount = this.getHarvestRecords(userId).length;
    const healthReportsCount = this.data.healthReports.filter(r => r.userId === userId).length;

    user.badges.forEach(badge => {
      if (!badge.isUnlocked) {
        let unlock = false;
        if (badge.id === 'badge_first_seed' && plantsCount >= 1) unlock = true;
        if (badge.id === 'badge_hydration_hero' && wateringLogsCount >= 5) unlock = true;
        if (badge.id === 'badge_diary_scribe' && diaryEntriesCount >= 3) unlock = true;
        if (badge.id === 'badge_plant_doctor' && healthReportsCount >= 1) unlock = true;
        if (badge.id === 'badge_harvest_master' && harvestCount >= 1) unlock = true;
        if (badge.id === 'badge_master_horticulturist' && newLevel >= 5) unlock = true;

        if (unlock) {
          badge.isUnlocked = true;
          badge.unlockedAt = new Date().toISOString();
          newlyUnlocked.push(badge);
        }
      }
    });

    user.xp = newXp;
    user.level = newLevel;
    user.title = newTitle;

    this.persist();
    return { user, xpGained: xpGain, leveledUp, newBadges: newlyUnlocked };
  }

  // --- Reset to Demo Garden ---
  public resetSeedData(): void {
    this.data = this.createDefaultSeedData();
  }
}

export const store = new DataStore();
