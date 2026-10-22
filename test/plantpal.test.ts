import test from 'node:test';
import assert from 'node:assert/strict';
import { store } from '../server/store.ts';
import { assessSunlightSuitability } from '../server/gemini.ts';

test('DataStore: User Creation and Retrieval', () => {
  const user = store.createUser({
    name: 'Test Gardener',
    email: 'test.gardener@example.com',
    passwordHash: 'dummyhash',
  });

  assert.ok(user.id);
  assert.equal(user.email, 'test.gardener@example.com');

  const found = store.findUserById(user.id);
  assert.ok(found);
  assert.equal(found.name, 'Test Gardener');
});

test('DataStore: Plant CRUD and Care Schedule Calculation', () => {
  const user = store.createUser({
    name: 'Green Thumb',
    email: 'thumb@example.com',
    passwordHash: 'dummyhash',
  });

  const plant = store.createPlant(user.id, {
    name: 'Pothos',
    species: 'Epipremnum aureum',
    category: 'houseplant',
    photoUrl: 'https://example.com/pothos.jpg',
    location: 'indoor_living_room',
    sunlightRequirement: 'medium_indirect',
    wateringFrequencyDays: 7,
    lastWateredDate: new Date().toISOString(),
    nextWaterDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    fertilizeFrequencyDays: 30,
    lastFertilizedDate: new Date().toISOString(),
    nextFertilizeDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    plantedDate: new Date().toISOString(),
  });

  assert.ok(plant.id);
  assert.equal(plant.name, 'Pothos');

  // Test watering action
  const waterResult = store.markWatered(plant.id, user.id, { amountMl: 350 });
  assert.ok(waterResult);
  assert.equal(waterResult.log.amountMl, 350);

  // Next water date should be approximately 7 days from now
  const nextDate = new Date(waterResult.plant.nextWaterDate);
  const diffDays = Math.round((nextDate.getTime() - Date.now()) / 86400000);
  assert.equal(diffDays, 7);
});

test('Sunlight Assessment: Direct Sun vs Low Indirect Tolerance', () => {
  const assessmentLow = assessSunlightSuitability({
    plantRequirement: 'full_sun',
    environment: 'indoor_bedroom',
    dailyHours: 2,
    lightType: 'shade',
    plantName: 'Roma Tomato',
  });

  assert.equal(assessmentLow.status, 'Low');
  assert.ok(assessmentLow.recommendations.length > 0);

  const assessmentExcess = assessSunlightSuitability({
    plantRequirement: 'low_indirect',
    environment: 'balcony',
    dailyHours: 6,
    lightType: 'direct',
    plantName: 'Snake Plant',
  });

  assert.equal(assessmentExcess.status, 'Potentially Excessive');
});

test('Growth Records & Diary CRUD', () => {
  const user = store.createUser({
    name: 'Tester',
    email: 'tester@example.com',
    passwordHash: 'dummyhash',
  });

  const record = store.addGrowthRecord(user.id, {
    plantId: 'plant_test_01',
    date: new Date().toISOString(),
    heightCm: 25,
    leafCount: 12,
    floweringStatus: 'none',
    milestone: 'New branch shoot',
  });

  assert.equal(record.heightCm, 25);
  assert.equal(record.leafCount, 12);

  const diary = store.addDiaryEntry(user.id, {
    title: 'Pruned dead leaf tips',
    content: 'Used sterilized shears.',
    eventType: 'pruning',
    tags: ['pruning'],
    date: new Date().toISOString(),
  });

  assert.equal(diary.title, 'Pruned dead leaf tips');
  const entries = store.getDiaryEntries(user.id);
  assert.ok(entries.some((e) => e.id === diary.id));
});

test('Auth Schemas: Validation and Mismatch Rejection', async () => {
  const { loginSchema, registerSchema } = await import('../src/schemas/authSchemas.ts');

  // Valid login
  const validLogin = loginSchema.safeParse({
    email: 'gardener@plantpal.io',
    password: 'password123',
    rememberMe: true,
  });
  assert.ok(validLogin.success);

  // Invalid email
  const invalidEmail = loginSchema.safeParse({
    email: 'not-an-email',
    password: 'password123',
  });
  assert.equal(invalidEmail.success, false);

  // Password confirmation mismatch
  const mismatchedRegister = registerSchema.safeParse({
    name: 'Maya Green',
    email: 'maya@plantpal.io',
    password: 'Password123',
    confirmPassword: 'DifferentPassword123',
    acceptTerms: true,
  });
  assert.equal(mismatchedRegister.success, false);

  // Valid registration
  const validRegister = registerSchema.safeParse({
    name: 'Maya Green',
    email: 'maya@plantpal.io',
    password: 'Password123',
    confirmPassword: 'Password123',
    acceptTerms: true,
  });
  assert.ok(validRegister.success);
});

