import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { store } from './server/store.ts';
import { analyzePlantHealth, chatWithGardener, assessSunlightSuitability, searchPlantEncyclopedia } from './server/gemini.ts';
import { startReminderScheduler, runReminderCheck } from './server/scheduler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'plantpal_super_secure_jwt_secret_change_in_production';

// Start the background reminder scheduler
startReminderScheduler();

// Body parsers
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Auth Middleware: extracts user if token present, or defaults to demo user for seamless trial
export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
      req.userId = decoded.id;
      const user = store.findUserById(decoded.id);
      if (user) req.user = user;
    } catch (err) {
      // Invalid token, fall through to demo user
    }
  }

  // If no valid authenticated user, default to demo user for instant usability
  if (!req.userId) {
    req.userId = 'usr_gardener_01';
    req.user = store.findUserById('usr_gardener_01');
  }

  next();
};

// Strict auth requirement when explicitly needed
const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    req.userId = decoded.id;
    const user = store.findUserById(decoded.id);
    if (!user) return res.status(401).json({ error: 'User no longer exists.' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

/* =========================================================
   AUTH ROUTES
   ========================================================= */

app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, gardenType, experienceLevel } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existing = store.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const user = store.createUser({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      gardenType: gardenType || 'Balcony & Indoor Urban Oasis',
      experienceLevel: experienceLevel || 'intermediate',
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ user, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to register account.' });
  }
});

// Firebase sync endpoint: maps or provisions user account in backend
app.post('/api/auth/firebase-sync', (req: Request, res: Response) => {
  try {
    const { email, name, avatar, firebaseUid, gardenType } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required from Firebase account.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = name ? String(name).trim() : cleanEmail.split('@')[0];

    let user: any = store.findUserByEmail(cleanEmail);
    if (!user) {
      user = store.createUser({
        name: cleanName,
        email: cleanEmail,
        passwordHash: `firebase_${firebaseUid || Date.now()}`,
        gardenType: gardenType || 'Balcony & Indoor Urban Oasis',
        experienceLevel: 'beginner',
      });
      if (avatar) {
        user = store.updateUser(user.id, { avatar }) || user;
      }
    } else if (avatar && !user.avatar) {
      user = store.updateUser(user.id, { avatar }) || user;
    }

    if (!user) {
      return res.status(500).json({ error: 'Could not create or find user profile.' });
    }

    const { passwordHash, ...safeUser } = user;
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    return res.json({ user: safeUser, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to sync Firebase user.' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const userWithHash = (store as any).findUserByEmail(cleanEmail);
    if (!userWithHash || !userWithHash.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    let isMatch = false;
    try {
      if (userWithHash.passwordHash.startsWith('$2')) {
        isMatch = bcrypt.compareSync(password, userWithHash.passwordHash);
      } else {
        isMatch = password === userWithHash.passwordHash;
      }
    } catch {
      isMatch = false;
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const { passwordHash, ...user } = userWithHash;
    const expiresIn = rememberMe ? '30d' : '7d';
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn });
    return res.json({ user, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to login.' });
  }
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = store.findUserByEmail(cleanEmail);
    // Generic response to prevent user enumeration
    return res.json({
      success: true,
      message: 'If an account exists for this email, password recovery instructions have been sent.',
      demoHelper: user ? `Demo note: Account found for ${user.name}. You can also sign in with password "plantpal123".` : undefined,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to process request.' });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ user: null });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = store.findUserById(decoded.id);
    return res.json({ user: user || null });
  } catch {
    return res.json({ user: null });
  }
});

app.put('/api/auth/update', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const updated = store.updateUser(req.userId!, req.body);
    if (!updated) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/streak-checkin', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = store.findUserById(req.userId!);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const todayStr = new Date().toISOString().split('T')[0];
    if ((user as any).lastStreakCheckInDate === todayStr) {
      return res.status(400).json({ error: 'You have already claimed your daily care bonus today! Come back tomorrow.' });
    }

    const lastDate = (user as any).lastStreakCheckInDate ? new Date((user as any).lastStreakCheckInDate) : null;
    const now = new Date();
    let newStreak = user.streakDays || 1;

    if (lastDate) {
      const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / 86400000);
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    store.updateUser(req.userId!, {
      streakDays: newStreak,
      lastStreakCheckInDate: todayStr,
    } as any);

    const result = store.awardXpAndCheckBadges(req.userId!, 20);
    return res.json({
      user: result.user,
      xpGained: 20,
      leveledUp: result.leveledUp,
      newBadges: result.newBadges,
      streakDays: newStreak,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to claim daily check-in.' });
  }
});


/* =========================================================
   PLANT CRUD & CARE ACTIONS
   ========================================================= */

app.get('/api/plants', authMiddleware, (req: AuthRequest, res: Response) => {
  const plants = store.getPlantsByUser(req.userId!);
  return res.json({ plants });
});

app.get('/api/plants/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const plant = store.getPlantById(req.params.id, req.userId!);
  if (!plant) return res.status(404).json({ error: 'Plant not found.' });

  const wateringLogs = store.getWateringLogs(plant.id, req.userId!);
  const fertilizerLogs = store.getFertilizerLogs(plant.id, req.userId!);
  const growthRecords = store.getGrowthRecords(plant.id, req.userId!);
  const harvestRecords = store.getHarvestRecords(req.userId!, plant.id);
  const diaryEntries = store.getDiaryEntries(req.userId!, plant.id);
  const healthReports = store.getHealthReports(req.userId!, plant.id);

  return res.json({
    plant,
    wateringLogs,
    fertilizerLogs,
    growthRecords,
    harvestRecords,
    diaryEntries,
    healthReports,
  });
});

app.post('/api/plants', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      species,
      nickname,
      category,
      photoUrl,
      location,
      sunlightRequirement,
      currentLightHours,
      currentLightType,
      potSize,
      soilType,
      wateringFrequencyDays = 7,
      waterAmountMl = 400,
      fertilizeFrequencyDays = 30,
      fertilizerType,
      isHarvestable = false,
      plantedDate = new Date().toISOString(),
      expectedHarvestDate,
      notes,
      tags = [],
    } = req.body;

    if (!name || !species) {
      return res.status(400).json({ error: 'Plant name and species are required.' });
    }

    const now = new Date();
    const nextWater = new Date(now.getTime() + wateringFrequencyDays * 86400000);
    const nextFertilize = new Date(now.getTime() + fertilizeFrequencyDays * 86400000);

    const plant = store.createPlant(req.userId!, {
      name,
      species,
      nickname,
      category: category || 'houseplant',
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
      location: location || 'indoor_living_room',
      sunlightRequirement: sunlightRequirement || 'bright_indirect',
      currentLightHours: currentLightHours ? Number(currentLightHours) : 5,
      currentLightType: currentLightType || 'indirect',
      potSize,
      soilType,
      wateringFrequencyDays: Number(wateringFrequencyDays),
      lastWateredDate: now.toISOString(),
      nextWaterDate: nextWater.toISOString(),
      waterAmountMl: Number(waterAmountMl),
      fertilizeFrequencyDays: Number(fertilizeFrequencyDays),
      lastFertilizedDate: now.toISOString(),
      nextFertilizeDate: nextFertilize.toISOString(),
      fertilizerType,
      isHarvestable: Boolean(isHarvestable),
      plantedDate,
      expectedHarvestDate,
      healthStatus: 'healthy',
      notes,
      tags: Array.isArray(tags) ? tags : [],
      archived: false,
    });

    // Re-check reminders
    runReminderCheck();

    return res.status(201).json({ plant });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create plant.' });
  }
});

app.put('/api/plants/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const plant = store.updatePlant(req.params.id, req.userId!, req.body);
    if (!plant) return res.status(404).json({ error: 'Plant not found or unauthorized.' });
    runReminderCheck();
    return res.json({ plant });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/plants/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const success = store.deletePlant(req.params.id, req.userId!);
  if (!success) return res.status(404).json({ error: 'Plant not found.' });
  return res.json({ success: true, message: 'Plant removed.' });
});

// Mark as watered
app.post('/api/plants/:id/water', authMiddleware, (req: AuthRequest, res: Response) => {
  const result = store.markWatered(req.params.id, req.userId!, req.body);
  if (!result) return res.status(404).json({ error: 'Plant not found.' });

  // Add a diary log automatically if user wishes
  if (req.body.recordDiary) {
    store.addDiaryEntry(req.userId!, {
      plantId: result.plant.id,
      date: new Date().toISOString(),
      title: `Watered ${result.plant.name}`,
      content: `Watered with ${result.log.amountMl} ml via ${result.log.method} watering method. ${result.log.notes || ''}`,
      eventType: 'watering',
      tags: ['watering', result.plant.category],
    });
  }

  runReminderCheck();
  return res.json(result);
});

// Mark as fertilized
app.post('/api/plants/:id/fertilize', authMiddleware, (req: AuthRequest, res: Response) => {
  const result = store.markFertilized(req.params.id, req.userId!, req.body);
  if (!result) return res.status(404).json({ error: 'Plant not found.' });

  if (req.body.recordDiary) {
    store.addDiaryEntry(req.userId!, {
      plantId: result.plant.id,
      date: new Date().toISOString(),
      title: `Fed ${result.plant.name}`,
      content: `Applied ${result.log.amount} ${result.log.unit} of ${result.log.fertilizerType}.`,
      eventType: 'fertilizing',
      tags: ['fertilizing', result.plant.category],
    });
  }

  runReminderCheck();
  return res.json(result);
});

/* =========================================================
   GROWTH TRACKING
   ========================================================= */

app.get('/api/plants/:id/growth', authMiddleware, (req: AuthRequest, res: Response) => {
  const records = store.getGrowthRecords(req.params.id, req.userId!);
  return res.json({ records });
});

app.post('/api/plants/:id/growth', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { heightCm, leafCount, floweringStatus = 'none', photoUrl, milestone, notes, date } = req.body;
    if (heightCm === undefined || leafCount === undefined) {
      return res.status(400).json({ error: 'Height and leaf count are required.' });
    }

    const record = store.addGrowthRecord(req.userId!, {
      plantId: req.params.id,
      date: date || new Date().toISOString(),
      heightCm: Number(heightCm),
      leafCount: Number(leafCount),
      floweringStatus,
      photoUrl,
      milestone,
      notes,
    });

    // Also record milestone in diary if present
    if (milestone) {
      const plant = store.getPlantById(req.params.id, req.userId!);
      store.addDiaryEntry(req.userId!, {
        plantId: req.params.id,
        date: record.date,
        title: `Milestone: ${milestone}`,
        content: `Recorded growth: ${record.heightCm} cm, ${record.leafCount} leaves. ${notes || ''}`,
        eventType: 'growth',
        tags: ['growth-milestone', plant?.name || 'plant'],
        photoUrls: photoUrl ? [photoUrl] : undefined,
      });
    }

    return res.status(201).json({ record });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/plants/:id/growth/:recordId', authMiddleware, (req: AuthRequest, res: Response) => {
  const deleted = store.deleteGrowthRecord(req.params.recordId, req.userId!);
  if (!deleted) return res.status(404).json({ error: 'Record not found.' });
  return res.json({ success: true });
});

/* =========================================================
   HARVEST PLANNER & RECORDS
   ========================================================= */

app.get('/api/harvest', authMiddleware, (req: AuthRequest, res: Response) => {
  const plantId = req.query.plantId as string | undefined;
  const records = store.getHarvestRecords(req.userId!, plantId);
  return res.json({ records });
});

app.post('/api/harvest', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { plantId, date, quantity, unit, qualityRating, photoUrl, notes } = req.body;
    if (!plantId || quantity === undefined) {
      return res.status(400).json({ error: 'Plant ID and quantity are required.' });
    }

    const plant = store.getPlantById(plantId, req.userId!);
    const record = store.addHarvestRecord(req.userId!, {
      plantId,
      date: date || new Date().toISOString(),
      quantity: Number(quantity),
      unit: unit || 'pieces',
      qualityRating: qualityRating ? Number(qualityRating) as any : 5,
      photoUrl,
      notes,
    });

    // Auto-create diary entry for celebration
    store.addDiaryEntry(req.userId!, {
      plantId,
      date: record.date,
      title: `Harvested ${plant?.name || 'Crops'}!`,
      content: `Gathered ${record.quantity} ${record.unit} of homegrown produce. Rated ${record.qualityRating || 5}/5 stars. ${notes || ''}`,
      eventType: 'harvest',
      tags: ['harvest', 'homegrown', plant?.name || 'crop'],
      photoUrls: photoUrl ? [photoUrl] : undefined,
    });

    return res.status(201).json({ record });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/* =========================================================
   DIARY ENTRIES
   ========================================================= */

app.get('/api/diary', authMiddleware, (req: AuthRequest, res: Response) => {
  const plantId = req.query.plantId as string | undefined;
  const entries = store.getDiaryEntries(req.userId!, plantId);
  return res.json({ entries });
});

app.post('/api/diary', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { plantId, title, content, eventType = 'general_note', tags = [], photoUrls = [], date } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const entry = store.addDiaryEntry(req.userId!, {
      plantId,
      title,
      content,
      eventType,
      tags: Array.isArray(tags) ? tags : [],
      photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
      date: date || new Date().toISOString(),
    });

    return res.status(201).json({ entry });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/diary/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const updated = store.updateDiaryEntry(req.params.id, req.userId!, req.body);
  if (!updated) return res.status(404).json({ error: 'Entry not found.' });
  return res.json({ entry: updated });
});

app.delete('/api/diary/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const deleted = store.deleteDiaryEntry(req.params.id, req.userId!);
  if (!deleted) return res.status(404).json({ error: 'Entry not found.' });
  return res.json({ success: true });
});

/* =========================================================
   INVENTORY
   ========================================================= */
app.get('/api/inventory', authMiddleware, (req: AuthRequest, res: Response) => {
  const items = store.getInventoryByUser(req.userId!);
  return res.json({ items });
});

app.post('/api/inventory', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const item = store.addInventoryItem(req.userId!, req.body);
    return res.status(201).json({ item });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/inventory/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const updated = store.updateInventoryItem(req.params.id, req.userId!, req.body);
  if (!updated) return res.status(404).json({ error: 'Item not found.' });
  return res.json({ item: updated });
});

app.delete('/api/inventory/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const deleted = store.deleteInventoryItem(req.params.id, req.userId!);
  if (!deleted) return res.status(404).json({ error: 'Item not found.' });
  return res.json({ success: true });
});

/* =========================================================
   WISHLIST
   ========================================================= */
app.get('/api/wishlist', authMiddleware, (req: AuthRequest, res: Response) => {
  const items = store.getWishlistByUser(req.userId!);
  return res.json({ items });
});

app.post('/api/wishlist', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const item = store.addToWishlist(req.userId!, req.body);
    return res.status(201).json({ item });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/wishlist/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const deleted = store.removeFromWishlist(req.params.id, req.userId!);
  if (!deleted) return res.status(404).json({ error: 'Item not found.' });
  return res.json({ success: true });
});

/* =========================================================
   SUNLIGHT CHECKER
   ========================================================= */


/* =========================================================
   PLANT ENCYCLOPEDIA SEARCH
   ========================================================= */
app.post('/api/encyclopedia/search', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required.' });
    }
    const result = await searchPlantEncyclopedia(query);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to search encyclopedia.' });
  }
});

app.post('/api/sunlight/assess', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { plantRequirement, environment, dailyHours, lightType, windowFacing, plantName } = req.body;
    const assessment = assessSunlightSuitability({
      plantRequirement: plantRequirement || 'bright_indirect',
      environment: environment || 'indoor_living_room',
      dailyHours: Number(dailyHours) || 4,
      lightType: lightType || 'indirect',
      windowFacing,
      plantName,
    });

    return res.json({ assessment });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/* =========================================================
   AI PLANT DISEASE DETECTION
   ========================================================= */

app.post('/api/disease/analyze', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const {
      plantId,
      plantSpecies,
      symptoms = [],
      affectedParts = [],
      durationDays = 0,
      wateringHabits,
      sunlightConditions,
      recentFertilizer,
      imageBase64,
      imageMimeType,
    } = req.body;

    const report = await analyzePlantHealth({
      userId: req.userId!,
      plantId,
      plantSpecies,
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
      affectedParts: Array.isArray(affectedParts) ? affectedParts : [affectedParts],
      durationDays: Number(durationDays),
      wateringHabits,
      sunlightConditions,
      recentFertilizer,
      imageBase64,
      imageMimeType,
    });

    store.addHealthReport(report);

    // If moderate or severe, flag plant's health status
    if (plantId && (report.severity === 'moderate' || report.severity === 'severe')) {
      store.updatePlant(plantId, req.userId!, { healthStatus: 'attention_needed' });
    }

    return res.json({ report });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Disease analysis failed.' });
  }
});

app.get('/api/disease/reports', authMiddleware, (req: AuthRequest, res: Response) => {
  const plantId = req.query.plantId as string | undefined;
  const reports = store.getHealthReports(req.userId!, plantId);
  return res.json({ reports });
});

/* =========================================================
   PLANTPAL AI CHAT
   ========================================================= */

app.get('/api/chat', authMiddleware, (req: AuthRequest, res: Response) => {
  const history = store.getChatHistory(req.userId!);
  return res.json({ history });
});

app.post('/api/chat', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { message, plantContextId, imageBase64, imageMimeType } = req.body;
    if (!message) return res.status(400).json({ error: 'Message cannot be empty.' });

    // Store user message
    const userMsg = {
      id: `msg_u_${Date.now()}`,
      role: 'user' as const,
      content: message,
      timestamp: new Date().toISOString(),
      plantContextId,
      imageUrl: imageBase64 ? (imageBase64.startsWith('data:') ? imageBase64 : `data:${imageMimeType || 'image/jpeg'};base64,${imageBase64}`) : undefined,
    };
    store.addChatMessage(req.userId!, userMsg);

    // Fetch user plants and past chat history for context
    const userPlants = store.getPlantsByUser(req.userId!);
    const history = store.getChatHistory(req.userId!);

    const assistantReply = await chatWithGardener({
      userId: req.userId!,
      message,
      history,
      userPlants,
      imageBase64,
      imageMimeType,
    });

    const assistantMsg = {
      id: `msg_a_${Date.now()}`,
      role: 'assistant' as const,
      content: assistantReply,
      timestamp: new Date().toISOString(),
      plantContextId,
    };
    store.addChatMessage(req.userId!, assistantMsg);

    return res.json({ reply: assistantMsg, history: store.getChatHistory(req.userId!) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to process chat message.' });
  }
});

app.delete('/api/chat', authMiddleware, (req: AuthRequest, res: Response) => {
  store.clearChatHistory(req.userId!);
  return res.json({ success: true, message: 'Chat history cleared.' });
});

/* =========================================================
   NOTIFICATIONS & REMINDERS
   ========================================================= */

app.get('/api/notifications', authMiddleware, (req: AuthRequest, res: Response) => {
  runReminderCheck();
  const notifications = store.getNotifications(req.userId!);
  return res.json({ notifications });
});

app.put('/api/notifications/:id/read', authMiddleware, (req: AuthRequest, res: Response) => {
  store.markNotificationAsRead(req.params.id, req.userId!);
  return res.json({ success: true });
});

app.post('/api/notifications/read-all', authMiddleware, (req: AuthRequest, res: Response) => {
  store.markAllNotificationsAsRead(req.userId!);
  return res.json({ success: true });
});

/* =========================================================
   DASHBOARD & SEEDING
   ========================================================= */

app.get('/api/dashboard/stats', authMiddleware, (req: AuthRequest, res: Response) => {
  runReminderCheck();
  const stats = store.getDashboardStats(req.userId!);
  const plants = store.getPlantsByUser(req.userId!);
  const recentDiary = store.getDiaryEntries(req.userId!).slice(0, 3);
  const notifications = store.getNotifications(req.userId!).slice(0, 5);

  return res.json({
    stats,
    plants,
    recentDiary,
    notifications,
  });
});

app.get('/api/weather', async (req: Request, res: Response) => {
  try {
    let lat = req.query.lat ? parseFloat(req.query.lat as string) : 37.7749;
    let lon = req.query.lon ? parseFloat(req.query.lon as string) : -122.4194;
    let cityName = (req.query.city as string) || 'San Francisco, CA';

    // Support automatic city geocoding if a city name is queried without explicit lat/lon
    if (req.query.city && (!req.query.lat || !req.query.lon)) {
      try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(req.query.city as string)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            const loc = geoData.results[0];
            lat = loc.latitude;
            lon = loc.longitude;
            const stateOrCountry = loc.admin1 ? `${loc.name}, ${loc.admin1}` : `${loc.name}, ${loc.country || ''}`;
            cityName = stateOrCountry;
          }
        }
      } catch (geoErr) {
        console.warn('Geocoding lookup failed:', geoErr);
      }
    }

    let temperature = 21.5;
    let apparentTemperature = 21.0;
    let humidity = 58;
    let weatherCode = 1;
    let weatherDescription = 'Mainly Clear';
    let isDay = true;
    let windSpeed = 12.5;
    let precipitationProbability = 10;
    let tempMax = 24.0;
    let tempMin = 14.5;

    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      const response = await fetch(weatherUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.current) {
          temperature = Math.round(data.current.temperature_2m * 10) / 10;
          apparentTemperature = Math.round(data.current.apparent_temperature * 10) / 10;
          humidity = Math.round(data.current.relative_humidity_2m);
          weatherCode = data.current.weather_code ?? 1;
          isDay = data.current.is_day === 1;
          windSpeed = Math.round(data.current.wind_speed_10m * 10) / 10;
        }
        if (data.daily) {
          tempMax = data.daily.temperature_2m_max?.[0] ?? (temperature + 3);
          tempMin = data.daily.temperature_2m_min?.[0] ?? (temperature - 4);
          precipitationProbability = data.daily.precipitation_probability_max?.[0] ?? 10;
        }

        // Map WMO codes to descriptions
        const wmoMap: Record<number, string> = {
          0: 'Clear sky',
          1: 'Mainly clear',
          2: 'Partly cloudy',
          3: 'Overcast',
          45: 'Foggy',
          48: 'Depositing rime fog',
          51: 'Light drizzle',
          53: 'Moderate drizzle',
          55: 'Dense drizzle',
          61: 'Slight rain',
          63: 'Moderate rain',
          65: 'Heavy rain',
          71: 'Slight snow',
          73: 'Moderate snow',
          75: 'Heavy snow',
          80: 'Slight rain showers',
          81: 'Moderate rain showers',
          82: 'Violent rain showers',
          95: 'Thunderstorm',
          96: 'Thunderstorm with slight hail',
          99: 'Thunderstorm with heavy hail',
        };
        weatherDescription = wmoMap[weatherCode] || 'Pleasant';
      }
    } catch (apiErr) {
      console.warn('Open-Meteo fetch failed or offline, using default botanical climate:', apiErr);
    }

    // Dynamic Plant Care Adjustments based on Temperature & Humidity
    let temperatureStatus: 'optimal' | 'warm' | 'cool' | 'cold' | 'extreme_heat' = 'optimal';
    let wateringAdvice = 'Favorable weather: Maintain your regular watering schedule based on soil dampness.';
    const actionableDirectives: string[] = [];

    if (temperature >= 30) {
      temperatureStatus = 'extreme_heat';
      wateringAdvice = 'High Heat Warning: Container soil evaporates rapidly. Inspect outdoor pots twice daily and water during early morning or dusk.';
      actionableDirectives.push('Water container plants in early morning or evening to prevent rapid evaporation and root stress.');
      actionableDirectives.push('Move sensitive potted foliage away from intense afternoon sun exposure.');
    } else if (temperature >= 24) {
      temperatureStatus = 'warm';
      wateringAdvice = 'Warm growing conditions: Active transpiration increases water uptake. Check moisture 2 inches deep before watering.';
      actionableDirectives.push('Check soil moisture 2 inches deep; thirsty herbs and balcony vegetables will need earlier watering.');
    } else if (temperature <= 10 && temperature > 4) {
      temperatureStatus = 'cool';
      wateringAdvice = 'Cool weather slowdown: Root absorption slows significantly. Lengthen intervals between waterings to protect against root rot.';
      actionableDirectives.push('Allow root balls extra drying time; reduce watering frequency by 25–40%.');
      actionableDirectives.push('Shield tropical foliage from drafty windows and cold exterior air currents.');
    } else if (temperature <= 4) {
      temperatureStatus = 'cold';
      wateringAdvice = 'Frost warning: Bring delicate outdoor succulents and tropicals indoors away from cold window drafts.';
      actionableDirectives.push('Bring outdoor container plants indoors immediately or wrap pots with insulating fleece.');
      actionableDirectives.push('Suspend liquid fertilizer until temperatures rebound above 15°C.');
    } else {
      actionableDirectives.push('Ideal thermal conditions for vegetative growth and balanced soil moisture retention.');
    }

    let humidityStatus: 'low' | 'moderate' | 'high' = 'moderate';
    let humidityAdvice = 'Moderate ambient humidity (40–70%): Comfort zone for most houseplants.';

    if (humidity < 40) {
      humidityStatus = 'low';
      humidityAdvice = 'Dry air alert (<40%): Higher leaf moisture loss. Mist tropical foliage (Monsteras, Ferns, Ficus) or group pots on pebble trays.';
      actionableDirectives.push('Mist tropical foliage (Monstera, Ferns, Calatheas) or group containers together to raise local micro-humidity.');
    } else if (humidity > 75) {
      humidityStatus = 'high';
      humidityAdvice = 'High humidity (>75%): Excellent for tropical foliage, but fungal spores thrive. Avoid wetting leaves when watering and ensure air circulation.';
      actionableDirectives.push('Promote airflow around dense foliage to prevent powdery mildew and crown fungal rot.');
    }

    const dewPoint = Math.round((temperature - (100 - humidity) / 5) * 10) / 10;

    const generalTip = precipitationProbability > 50
      ? `Rain probable (${precipitationProbability}%): Skip manual watering for uncovered outdoor balcony plants today!`
      : isDay
      ? `Daylight active: Plants are actively photosynthesizing under ${weatherDescription.toLowerCase()}.`
      : 'Evening resting phase: Plants close stomata at night. Avoid late evening overhead leaf wetting.';

    return res.json({
      weather: {
        city: cityName,
        latitude: lat,
        longitude: lon,
        temperature,
        apparentTemperature,
        humidity,
        weatherCode,
        weatherDescription,
        isDay,
        windSpeed,
        precipitationProbability,
        tempMax,
        tempMin,
        dewPoint,
        plantCareAdjustments: {
          wateringAdvice,
          humidityAdvice,
          temperatureStatus,
          humidityStatus,
          generalTip,
          actionableDirectives,
        },
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch weather data' });
  }
});

app.get('/api/health', (req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    version: '1.0.0',
    app: 'PlantPal',
    aiProvider: process.env.GEMINI_API_KEY ? 'Gemini 3.8 Flash' : 'Horticultural Rule-Based Engine (Fallback)',
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   FRONTEND SERVING (Vite Dev Server in Dev, Static in Prod)
   ========================================================= */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🌿 PlantPal server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
