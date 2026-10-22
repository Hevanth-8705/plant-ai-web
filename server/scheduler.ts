import { store } from './store.ts';

export function runReminderCheck(): void {
  try {
    const allUsers = (store as any).data?.users || [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    for (const user of allUsers) {
      const plants = store.getPlantsByUser(user.id);
      const existingNotifs = store.getNotifications(user.id);

      for (const plant of plants) {
        const nextWaterDateStr = plant.nextWaterDate.split('T')[0];
        const isWaterDue = nextWaterDateStr <= todayStr;
        const isWaterOverdue = nextWaterDateStr < todayStr;

        if (isWaterDue) {
          const notifKey = `water_${plant.id}_${nextWaterDateStr}`;
          const alreadyNotified = existingNotifs.some(
            (n) => n.plantId === plant.id && n.type === 'water' && n.title.includes(isWaterOverdue ? 'Overdue' : 'Watering') && (n.createdAt.startsWith(todayStr) || !n.read)
          );

          if (!alreadyNotified) {
            store.addNotification({
              userId: user.id,
              plantId: plant.id,
              plantName: plant.name,
              title: isWaterOverdue ? `Watering Overdue: ${plant.name}` : `Watering Due Today: ${plant.name}`,
              message: `${plant.name} (${plant.species}) needs ${plant.waterAmountMl || 400} ml of water. Check soil moisture first!`,
              type: 'water',
              priority: isWaterOverdue ? 'urgent' : 'normal',
              read: false,
              actionUrl: '/watering',
            });
          }
        }

        // Fertilizer reminder
        const nextFertilizeDate = new Date(plant.nextFertilizeDate);
        const daysToFertilize = Math.ceil((nextFertilizeDate.getTime() - now.getTime()) / 86400000);
        if (daysToFertilize <= 1 && daysToFertilize >= -2) {
          const alreadyNotified = existingNotifs.some(
            (n) => n.plantId === plant.id && n.type === 'fertilize' && (n.createdAt.startsWith(todayStr) || !n.read)
          );

          if (!alreadyNotified) {
            store.addNotification({
              userId: user.id,
              plantId: plant.id,
              plantName: plant.name,
              title: `Fertilizer Due: ${plant.name}`,
              message: `Time to feed ${plant.name} with ${plant.fertilizerType || 'balanced plant food'}. Always dilute properly!`,
              type: 'fertilize',
              priority: 'normal',
              read: false,
              actionUrl: '/fertilizer',
            });
          }
        }

        // Harvest reminder
        if (plant.isHarvestable && plant.expectedHarvestDate) {
          const harvestDate = new Date(plant.expectedHarvestDate);
          const daysToHarvest = Math.ceil((harvestDate.getTime() - now.getTime()) / 86400000);
          if (daysToHarvest >= 0 && daysToHarvest <= 3) {
            const alreadyNotified = existingNotifs.some(
              (n) => n.plantId === plant.id && n.type === 'harvest' && (n.createdAt.startsWith(todayStr) || !n.read)
            );

            if (!alreadyNotified) {
              store.addNotification({
                userId: user.id,
                plantId: plant.id,
                plantName: plant.name,
                title: `Ready for Harvest: ${plant.name}`,
                message: `${plant.name} is reaching peak maturity! Inspect fruits or foliage for harvest readiness.`,
                type: 'harvest',
                priority: 'normal',
                read: false,
                actionUrl: '/harvest',
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error running reminder check:', err);
  }
}

export function startReminderScheduler(): NodeJS.Timeout {
  // Run on startup
  runReminderCheck();
  // Check every hour
  return setInterval(runReminderCheck, 60 * 60 * 1000);
}
