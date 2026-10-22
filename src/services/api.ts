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
  DashboardStats, 
  SunlightAssessment,
  WeatherData,
  InventoryItem,
  WishlistItem,
  AIChatMessage
} from '../types/index.ts';

const TOKEN_KEY = 'plantpal_auth_token';

export const getStoredToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeStoredToken = () => localStorage.removeItem(TOKEN_KEY);

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    register: (userData: any) => request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    login: (credentials: any) => request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    firebaseSync: (firebaseData: { email: string; name?: string; avatar?: string; firebaseUid: string; gardenType?: string }) =>
      request<{ user: User; token: string }>('/api/auth/firebase-sync', {
        method: 'POST',
        body: JSON.stringify(firebaseData),
      }),
    forgotPassword: (email: string) => request<{ success: boolean; message: string; demoHelper?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
    getMe: () => request<{ user: User | null }>('/api/auth/me'),
    updateUser: (updates: Partial<User>) => request<{ user: User }>('/api/auth/update', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  },

  // Plants
  plants: {
    list: () => request<{ plants: Plant[] }>('/api/plants'),
    get: (id: string) => request<{
      plant: Plant;
      wateringLogs: WateringLog[];
      fertilizerLogs: FertilizerLog[];
      growthRecords: GrowthRecord[];
      harvestRecords: HarvestRecord[];
      diaryEntries: DiaryEntry[];
      healthReports: PlantHealthReport[];
    }>(`/api/plants/${id}`),
    create: (plantData: Partial<Plant>) => request<{ plant: Plant }>('/api/plants', {
      method: 'POST',
      body: JSON.stringify(plantData),
    }),
    update: (id: string, updates: Partial<Plant>) => request<{ plant: Plant }>(`/api/plants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/api/plants/${id}`, {
      method: 'DELETE',
    }),
    markWatered: (id: string, details?: any) => request<{ plant: Plant; log: WateringLog }>(`/api/plants/${id}/water`, {
      method: 'POST',
      body: JSON.stringify(details || {}),
    }),
    markFertilized: (id: string, details: any) => request<{ plant: Plant; log: FertilizerLog }>(`/api/plants/${id}/fertilize`, {
      method: 'POST',
      body: JSON.stringify(details),
    }),
  },

  // Growth
  growth: {
    list: (plantId: string) => request<{ records: GrowthRecord[] }>(`/api/plants/${plantId}/growth`),
    add: (plantId: string, record: Partial<GrowthRecord>) => request<{ record: GrowthRecord }>(`/api/plants/${plantId}/growth`, {
      method: 'POST',
      body: JSON.stringify(record),
    }),
    delete: (plantId: string, recordId: string) => request<{ success: boolean }>(`/api/plants/${plantId}/growth/${recordId}`, {
      method: 'DELETE',
    }),
  },

  // Harvest
  harvest: {
    list: (plantId?: string) => request<{ records: HarvestRecord[] }>(`/api/harvest${plantId ? `?plantId=${plantId}` : ''}`),
    add: (record: Partial<HarvestRecord>) => request<{ record: HarvestRecord }>('/api/harvest', {
      method: 'POST',
      body: JSON.stringify(record),
    }),
  },

  // Diary
  diary: {
    list: (plantId?: string) => request<{ entries: DiaryEntry[] }>(`/api/diary${plantId ? `?plantId=${plantId}` : ''}`),
    add: (entry: Partial<DiaryEntry>) => request<{ entry: DiaryEntry }>('/api/diary', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),
    update: (id: string, updates: Partial<DiaryEntry>) => request<{ entry: DiaryEntry }>(`/api/diary/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/api/diary/${id}`, {
      method: 'DELETE',
    }),
  },

  // Sunlight
  sunlight: {
    assess: (data: any) => request<{ assessment: SunlightAssessment }>('/api/sunlight/assess', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  // AI Disease
  disease: {
    analyze: (data: any) => request<{ report: PlantHealthReport }>('/api/disease/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    listReports: (plantId?: string) => request<{ reports: PlantHealthReport[] }>(`/api/disease/reports${plantId ? `?plantId=${plantId}` : ''}`),
  },

  // AI Chat
  chat: {
    getHistory: () => request<{ history: AIChatMessage[] }>('/api/chat'),
    sendMessage: (data: { message: string; plantContextId?: string; imageBase64?: string; imageMimeType?: string }) => 
      request<{ reply: AIChatMessage; history: AIChatMessage[] }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    clear: () => request<{ success: boolean }>('/api/chat', { method: 'DELETE' }),
  },

  // Notifications
  notifications: {
    list: () => request<{ notifications: NotificationItem[] }>('/api/notifications'),
    markRead: (id: string) => request<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => request<{ success: boolean }>('/api/notifications/read-all', { method: 'POST' }),
  },

  // Dashboard Stats
  dashboard: {
    getStats: () => request<{
      stats: DashboardStats;
      plants: Plant[];
      recentDiary: DiaryEntry[];
      notifications: NotificationItem[];
    }>('/api/dashboard/stats'),
  },

  // Weather & Local Climate
  weather: {
    get: (params?: { lat?: number; lon?: number; city?: string }) => {
      const query = params ? '?' + new URLSearchParams({
        ...(params.lat ? { lat: params.lat.toString() } : {}),
        ...(params.lon ? { lon: params.lon.toString() } : {}),
        ...(params.city ? { city: params.city } : {}),
      }).toString() : '';
      return request<{ weather: WeatherData }>(`/api/weather${query}`);
    },
  },

  // Encyclopedia
  encyclopedia: {
    search: (query: string) => request<any>('/api/encyclopedia/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
  },

  // Utilities
  seed: {
    reset: () => request<{ success: boolean; message: string }>('/api/seed/reset', { method: 'POST' }),
  },
  health: {
    check: () => request<any>('/api/health'),
  },
  inventory: {
    list: () => request<{ items: InventoryItem[] }>('/api/inventory'),
    add: (item: Partial<InventoryItem>) => request<{ item: InventoryItem }>('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
    update: (id: string, updates: Partial<InventoryItem>) => request<{ item: InventoryItem }>(`/api/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/api/inventory/${id}`, {
      method: 'DELETE',
    }),
  },
  wishlist: {
    list: () => request<{ items: WishlistItem[] }>('/api/wishlist'),
    add: (item: Partial<WishlistItem>) => request<{ item: WishlistItem }>('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/api/wishlist/${id}`, {
      method: 'DELETE',
    }),
  },
};

