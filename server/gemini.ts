import { GoogleGenAI, Type } from '@google/genai';
import { PlantHealthReport, SunlightAssessment, SunlightPreference, PlantLocation, Plant } from '../src/types/index.ts';

const apiKey = process.env.GEMINI_API_KEY;

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * AI-assisted plant health analysis.
 * Analyzes plant photo and user-reported symptoms.
 */
export async function analyzePlantHealth(params: {
  userId: string;
  plantId?: string;
  plantSpecies?: string;
  symptoms: string[];
  affectedParts?: string[];
  durationDays?: number;
  wateringHabits?: string;
  sunlightConditions?: string;
  recentFertilizer?: string;
  imageBase64?: string;
  imageMimeType?: string;
}): Promise<PlantHealthReport> {
  const {
    userId,
    plantId,
    plantSpecies = 'Unknown Plant Species',
    symptoms = [],
    affectedParts = [],
    durationDays = 0,
    wateringHabits = 'Not specified',
    sunlightConditions = 'Not specified',
    recentFertilizer = 'None reported',
    imageBase64,
    imageMimeType = 'image/jpeg',
  } = params;

  // If Gemini client is active, call gemini-3.8-flash
  if (aiClient) {
    try {
      const parts: any[] = [];

      if (imageBase64) {
        // Strip data url prefix if present
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: imageMimeType,
            data: cleanBase64,
          },
        });
      }

      const promptText = `
You are a conservative, highly knowledgeable botanical plant health analyst.
Analyze the following plant data and image (if provided):
- Plant Species: ${plantSpecies}
- User Observed Symptoms: ${symptoms.join(', ') || 'General decline'}
- Affected Parts: ${affectedParts.join(', ') || 'Leaves/stem'}
- Duration of symptoms: ${durationDays} days
- Watering Habits: ${wateringHabits}
- Sunlight Conditions: ${sunlightConditions}
- Recent Fertilizer: ${recentFertilizer}

IMPORTANT SCIENTIFIC GUIDELINES:
1. Never fabricate certainty or claim a plant photo provides a 100% verified diagnosis.
2. Distinguish direct visual observations from inferred potential causes.
3. If the image is blurry, out of focus, or inconclusive, set isConclusive to false and explain why.
4. Recommend safe, non-toxic, cultural/organic actions first. Do not recommend restricted agricultural chemicals without severe safety disclaimers.
5. Provide practical preventive tips.
`;

      parts.push({ text: promptText });

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction: 'You are an expert plant pathologist and horticulturalist. Provide structured, reliable, realistic plant diagnostic guidance.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diagnosisTitle: { type: Type.STRING, description: 'Summary name of the condition or primary hypothesis' },
              visualObservations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Observable physical cues visible in photo or described by user',
              },
              possibleCauses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    likelihood: { type: Type.STRING, enum: ['Low', 'Moderate', 'High'] },
                    explanation: { type: Type.STRING },
                  },
                  required: ['name', 'likelihood', 'explanation'],
                },
              },
              severity: { type: Type.STRING, enum: ['mild', 'moderate', 'severe'] },
              safeTreatments: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Safe, practical non-toxic cultural steps to remediate',
              },
              preventiveTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Long-term preventive garden hygiene tips',
              },
              isConclusive: { type: Type.BOOLEAN },
              inconclusiveReason: { type: Type.STRING },
              expertDisclaimer: { type: Type.STRING },
            },
            required: [
              'diagnosisTitle',
              'visualObservations',
              'possibleCauses',
              'severity',
              'safeTreatments',
              'preventiveTips',
              'isConclusive',
              'expertDisclaimer',
            ],
          },
        },
      });

      const rawJson = response.text?.trim() || '{}';
      const parsed = JSON.parse(rawJson);

      return {
        id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        plantId,
        userId,
        date: new Date().toISOString(),
        photoUrl: imageBase64 ? (imageBase64.startsWith('data:') ? imageBase64 : `data:${imageMimeType};base64,${imageBase64}`) : undefined,
        plantSpecies,
        symptoms,
        affectedParts,
        durationDays,
        wateringHabits,
        sunlightConditions,
        diagnosisTitle: parsed.diagnosisTitle || 'Plant Symptom Assessment',
        visualObservations: parsed.visualObservations || ['Visual assessment completed from reported symptoms.'],
        possibleCauses: (parsed.possibleCauses || []).map((c: any) => ({
          name: c.name || 'Environmental Stress',
          likelihood: (['Low', 'Moderate', 'High'].includes(c.likelihood) ? c.likelihood : 'Moderate') as 'Low' | 'Moderate' | 'High',
          explanation: c.explanation || '',
        })),
        severity: (['mild', 'moderate', 'severe'].includes(parsed.severity) ? parsed.severity : 'moderate') as 'mild' | 'moderate' | 'severe',
        safeTreatments: parsed.safeTreatments || ['Isolate plant if pests are suspected and adjust moisture.'],
        preventiveTips: parsed.preventiveTips || ['Maintain adequate air circulation and clean drainage.'],
        isConclusive: Boolean(parsed.isConclusive),
        inconclusiveReason: parsed.inconclusiveReason || (parsed.isConclusive ? undefined : 'Multiple overlapping stressors possible without laboratory soil or tissue culture tests.'),
        expertDisclaimer: parsed.expertDisclaimer || 'AI-assisted analysis is for guidance only. For valuable crops or spreading infestations, seek confirmation from a local master gardener or university agricultural extension.',
      };
    } catch (err) {
      console.warn('Gemini health analysis error, using horticultural fallback:', err);
    }
  }

  // Horticultural Rule-Based Fallback Engine
  return generateRuleBasedHealthReport({
    userId,
    plantId,
    plantSpecies,
    symptoms,
    affectedParts,
    durationDays,
    wateringHabits,
    sunlightConditions,
    imageBase64,
    imageMimeType,
  });
}

function generateRuleBasedHealthReport(params: {
  userId: string;
  plantId?: string;
  plantSpecies: string;
  symptoms: string[];
  affectedParts: string[];
  durationDays: number;
  wateringHabits: string;
  sunlightConditions: string;
  imageBase64?: string;
  imageMimeType?: string;
}): PlantHealthReport {
  const symLower = params.symptoms.map((s) => s.toLowerCase()).join(' ');
  const partsLower = params.affectedParts.map((p) => p.toLowerCase()).join(' ');

  let title = 'General Moisture & Environmental Stress';
  let severity: 'mild' | 'moderate' | 'severe' = 'mild';
  let causes: Array<{ name: string; likelihood: 'Low' | 'Moderate' | 'High'; explanation: string }> = [];
  let treatments: string[] = [];
  let preventives: string[] = [];
  let observations: string[] = [];

  if (symLower.includes('yellow') || symLower.includes('droop') || symLower.includes('mushy')) {
    title = 'Suspected Overwatering or Drainage Saturation';
    severity = 'moderate';
    observations = [
      'Chlorosis (yellowing) observed primarily on mature or lower leaves.',
      'Symptom progression correlates with moisture retention in potting medium.',
      'Absence of distinct fungal leaf spot margins.'
    ];
    causes = [
      {
        name: 'Root Hypoxia / Over-saturation',
        likelihood: 'High',
        explanation: 'Excess water in the root zone deprives delicate root hairs of oxygen, preventing nutrient absorption and causing lower leaves to turn pale yellow.'
      },
      {
        name: 'Nitrogen Leaching',
        likelihood: 'Moderate',
        explanation: 'Frequent watering can wash mobile nitrogen out of container soils before roots can uptake it.'
      }
    ];
    treatments = [
      'Allow the top 5 cm (2 inches) of soil to dry out completely before watering again.',
      'Verify that the pot has unobstructed drainage holes and empty decorative saucers after 15 minutes.',
      'Gently aerate compacted soil using a sterile wooden chopstick.'
    ];
    preventives = [
      'Follow the "finger-test" or use a moisture meter rather than watering on a rigid calendar.',
      'Ensure soil mix contains at least 20-30% aerating materials (perlite, pumice, or bark).'
    ];
  } else if (symLower.includes('brown') || symLower.includes('crispy') || symLower.includes('tip') || symLower.includes('dry')) {
    title = 'Low Humidity or Under-hydration Stress';
    severity = 'mild';
    observations = [
      'Crispy dry leaf margins or necrotic tips with pale edges.',
      'Foliage texture is brittle rather than soft or damp.',
      'No signs of bacterial soft rot or oozing lesions.'
    ];
    causes = [
      {
        name: 'Atmospheric Dryness & Water Deficit',
        likelihood: 'High',
        explanation: 'Dry indoor air (especially from heating or AC) combined with extended dry soil intervals leads to tip burn.'
      },
      {
        name: 'Mineral / Tap Water Salt Build-up',
        likelihood: 'Moderate',
        explanation: 'Fluoride, chlorine, or hard water minerals accumulate at the furthest leaf edges.'
      }
    ];
    treatments = [
      'Give the plant a thorough soak until water flows freely out the bottom.',
      'Trim purely dead brown leaf tips with clean shears, leaving a thin margin of brown to avoid cutting living tissue.',
      'Group plants together or use a pebble tray to increase localized micro-humidity.'
    ];
    preventives = [
      'Use filtered or rainwater if your tap water is heavily chlorinated or hard.',
      'Keep plants away from heating registers and air conditioning drafts.'
    ];
  } else if (symLower.includes('spot') || symLower.includes('white') || symLower.includes('mold') || symLower.includes('mildew')) {
    title = 'Potential Fungal Foliar Infection (Powdery Mildew / Leaf Spot)';
    severity = 'moderate';
    observations = [
      'Irregular circular spots or powdery whitish residue on leaf surfaces.',
      'Higher occurrence in humid environments with low air circulation.'
    ];
    causes = [
      {
        name: 'Fungal Spore Proliferation',
        likelihood: 'High',
        explanation: 'Spores germinate readily on wet leaves when relative humidity is high and ventilation is still.'
      }
    ];
    treatments = [
      'Gently wipe affected leaves with a diluted solution of potassium bicarbonate or neem oil mixture in low light.',
      'Avoid splashing water on foliage when watering; apply water directly to the soil line.',
      'Prune severely infected leaves and dispose of them in trash (not compost).'
    ];
    preventives = [
      'Improve air circulation with a gentle oscillating fan nearby.',
      'Water in the morning so excess moisture evaporates before nightfall.'
    ];
  } else if (symLower.includes('pest') || symLower.includes('web') || symLower.includes('bug') || symLower.includes('mite') || symLower.includes('aphid')) {
    title = 'Suspected Foliar Pest Infestation';
    severity = 'moderate';
    observations = [
      'Tiny stippling, leaf distortion, or fine silky webbing under leaf axils.',
      'Sticky honeydew secretions or tiny slow-moving specks.'
    ];
    causes = [
      {
        name: 'Sap-Sucking Insects (Spider Mites or Aphids)',
        likelihood: 'High',
        explanation: 'Common indoor and balcony pests that pierce plant cell walls to extract fluids.'
      }
    ];
    treatments = [
      'Immediately isolate this plant from others to prevent cross-contamination.',
      'Shower the plant with a firm stream of lukewarm water to dislodge pests.',
      'Apply organic insecticidal soap or pure cold-pressed neem oil emulsion every 5-7 days for 3 cycles.'
    ];
    preventives = [
      'Inspect undersides of leaves weekly during routine watering.',
      'Wipe dusty leaves periodically as mites thrive on dry, dusty surfaces.'
    ];
  } else {
    title = 'Environmental Acclimation & Nutrient Review';
    severity = 'mild';
    observations = [
      'Mild changes in growth vigor or leaf appearance.',
      'No acute pathogens or destructive pests immediately apparent.'
    ];
    causes = [
      {
        name: 'Seasonal Light Adjustment',
        likelihood: 'Moderate',
        explanation: 'Plants naturally shift growth rates as day lengths and light intensity change.'
      }
    ];
    treatments = [
      'Observe the plant for 7-10 days after stabilizing temperature and watering.',
      'Verify that lighting matches the species recommendations.'
    ];
    preventives = [
      'Keep a consistent routine and avoid moving plants between differing light spots frequently.'
    ];
  }

  return {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    plantId: params.plantId,
    userId: params.userId,
    date: new Date().toISOString(),
    photoUrl: params.imageBase64 ? (params.imageBase64.startsWith('data:') ? params.imageBase64 : `data:${params.imageMimeType || 'image/jpeg'};base64,${params.imageBase64}`) : undefined,
    plantSpecies: params.plantSpecies,
    symptoms: params.symptoms,
    affectedParts: params.affectedParts,
    durationDays: params.durationDays,
    wateringHabits: params.wateringHabits,
    sunlightConditions: params.sunlightConditions,
    diagnosisTitle: title,
    visualObservations: observations,
    possibleCauses: causes,
    severity,
    safeTreatments: treatments,
    preventiveTips: preventives,
    isConclusive: false,
    inconclusiveReason: 'Preliminary assessment based on reported visual cues and environmental history. Laboratory inspection required for positive microscopic fungal or bacterial confirmation.',
    expertDisclaimer: 'This analysis provides general horticultural guidance and cannot replace an in-person inspection by a certified arborist, master gardener, or botanical specialist.',
  };
}

/**
 * Conversational AI Gardening Assistant with garden context.
 */
export async function chatWithGardener(params: {
  userId: string;
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  userPlants?: Plant[];
  imageBase64?: string;
  imageMimeType?: string;
}): Promise<string> {
  const { message, history = [], userPlants = [], imageBase64, imageMimeType = 'image/jpeg' } = params;

  if (aiClient) {
    try {
      const plantSummary = userPlants.length > 0
        ? userPlants.map((p) => `- ${p.name} (${p.species}), category: ${p.category}, location: ${p.location}, light: ${p.sunlightRequirement}, water every ${p.wateringFrequencyDays} days (last: ${p.lastWateredDate.split('T')[0]}, next: ${p.nextWaterDate.split('T')[0]}), health: ${p.healthStatus || 'healthy'}`).join('\n')
        : 'User has no plants registered yet.';

      const systemInstruction = `
You are PlantPal AI, a friendly, encouraging, and highly knowledgeable master gardener and plant care specialist.
You help home gardeners, balcony growers, and indoor plant lovers thrive.

CURRENT USER'S GARDEN INVENTORY:
${plantSummary}

GUIDELINES:
1. Always be conversational, practical, and clear.
2. If the user mentions their specific plants by name (e.g. Monty, Ruby, Felix) or species, reference their specific care parameters from their garden inventory.
3. Distinguish between verified biological principles and general estimation. Explain that watering schedules must adapt to temperature and soil dryness.
4. Give actionable, non-toxic suggestions.
5. Keep responses concise (around 2-4 friendly paragraphs or bullet points).
`;

      const contents: any[] = [];

      // Add recent history (up to last 6 turns)
      const recentHistory = history.slice(-6);
      for (const turn of recentHistory) {
        contents.push({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.content }],
        });
      }

      // Current turn
      const currentParts: any[] = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        currentParts.push({
          inlineData: {
            mimeType: imageMimeType,
            data: cleanBase64,
          },
        });
      }
      currentParts.push({ text: message });
      contents.push({ role: 'user', parts: currentParts });

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('Gemini chat failed, using fallback:', err);
    }
  }

  // Botanical Fallback Engine
  return generateBotanicalFallbackChat(message, userPlants);
}

function generateBotanicalFallbackChat(query: string, userPlants: Plant[]): string {
  const q = query.toLowerCase();

  if (q.includes('water') && (q.includes('often') || q.includes('when') || q.includes('schedule'))) {
    return `For most indoor and container plants, a fixed calendar schedule is just a starting estimate! 

The most reliable rule is the **Finger Test**: insert your finger 2 to 5 cm (1 to 2 inches) into the potting soil.
- If it feels cool and damp: wait another 2–3 days.
- If it feels dry and crumbly: water thoroughly until water begins escaping through the bottom drainage holes, then discard standing water from the saucer after 15 minutes.

${userPlants.length > 0 ? `In your garden, you have ${userPlants.length} plants registered. For instance, **${userPlants[0].name}** is set to water every ${userPlants[0].wateringFrequencyDays} days.` : ''}`;
  }

  if (q.includes('yellow') && (q.includes('leaf') || q.includes('leaves'))) {
    return `Yellowing leaves (chlorosis) is the most common plant symptom, usually pointing to one of three environmental factors:

1. **Overwatering & Root Saturation (Most Common)**: Roots sitting in waterlogged soil cannot breathe, leading to yellow lower leaves and limp stems.
2. **Underwatering**: If leaves turn yellow and crispy or paper-dry, the plant is drawing moisture from older leaves to survive.
3. **Nutrient Deficiency (Nitrogen)**: If new growth is pale and older leaves steadily lose green pigment, an application of balanced diluted fertilizer may be needed.

Check your plant's soil moisture right to the bottom of the pot before adding more water!`;
  }

  if (q.includes('sun') || q.includes('light')) {
    return `Sunlight is the primary fuel for plant growth. Here is how to gauge light in your home:
- **Direct Sunlight**: Sunlight beams directly touch the leaves (great for tomatoes, peppers, succulents, basil).
- **Bright Indirect Light**: A bright room where you can easily read without artificial light, but rays don't scorch leaves (ideal for Monsteras, Ficus, Pothos).
- **Low / Medium Light**: Corners further than 3 meters (10 ft) from windows (best for Snake plants and ZZ plants).

You can use PlantPal's **Sunlight Checker** tool to evaluate whether your current spot matches your plant's biological needs!`;
  }

  if (q.includes('fertiliz') || q.includes('feed') || q.includes('npk')) {
    return `When feeding plants, **less is always more**! Over-fertilizing burns delicate roots and leaves salt crusts on soil surfaces.

Key guidelines:
- Fertilize during active spring and summer growth.
- Always dilute liquid fertilizer to half the strength recommended on the bottle for indoor houseplants.
- Never apply fertilizer to bone-dry soil; always moisten the soil lightly first to prevent root shock.`;
  }

  if (q.includes('pest') || q.includes('bug') || q.includes('mite') || q.includes('aphid')) {
    return `Dealing with unwanted garden guests? Here is a gentle, effective 3-step protocol:
1. **Quarantine**: Separate the infested plant to prevent spread.
2. **Mechanical Rinse**: Take the plant to a shower or hose and gently wash off as many pests as possible with lukewarm water.
3. **Organic Soap or Neem**: Spray leaves (top and undersides) thoroughly with insecticidal soap or a mild neem oil mixture once a week for 3 weeks to break the pest lifecycle.`;
  }

  return `That's a great gardening question! Healthy plants come from matching four core elements: balanced moisture, adequate light, proper drainage, and timely nutrition.

${userPlants.length > 0 ? `You currently have ${userPlants.length} plants in your collection: ${userPlants.map((p) => p.name).join(', ')}. ` : ''}
Feel free to ask specifically about watering frequencies, sunlight orientation, leaf disease symptoms, or fertilizer recommendations!`;
}

/**
 * Evaluates sunlight suitability based on reported conditions.
 */
export function assessSunlightSuitability(params: {
  plantRequirement: SunlightPreference;
  environment: PlantLocation;
  dailyHours: number;
  lightType: 'direct' | 'indirect' | 'shade';
  windowFacing?: 'north' | 'south' | 'east' | 'west' | 'none';
  plantName?: string;
}): SunlightAssessment {
  const { plantRequirement, environment, dailyHours, lightType, windowFacing, plantName = 'Plant' } = params;

  let status: 'Low' | 'Suitable' | 'Potentially Excessive' = 'Suitable';
  const recommendations: string[] = [];
  let summary = '';
  let riskAnalysis = '';

  // Rule matrix
  if (plantRequirement === 'full_sun') {
    if (lightType === 'shade' || dailyHours < 4) {
      status = 'Low';
      summary = `${plantName} requires full sun (at least 6 hours of direct light daily), but is currently receiving insufficient light.`;
      riskAnalysis = 'Risk of leggy weak stems (etiolation), poor flowering, reduced fruit production, and sluggish water absorption leading to root rot.';
      recommendations.push('Move the plant to an open south- or west-facing balcony, patio, or unobstructed windowsill.');
      recommendations.push('Consider a full-spectrum LED grow light set to 12-14 hours per day if growing indoors.');
    } else if (dailyHours >= 6 && lightType === 'direct') {
      status = 'Suitable';
      summary = `Excellent! ${plantName} is receiving the abundant direct sunlight it needs to thrive.`;
      riskAnalysis = 'Minimal light risk. Monitor soil moisture in hot afternoon sun as pots dry out much faster.';
      recommendations.push('Maintain regular watering to balance high transpiration rates in direct sun.');
    } else {
      status = 'Low';
      summary = `${plantName} is receiving moderate light, but will perform significantly better with more direct sun.`;
      recommendations.push('Gradually acclimate to 1-2 hours more direct sun per day to avoid leaf scorch.');
    }
  } else if (plantRequirement === 'bright_indirect') {
    if (lightType === 'direct' && dailyHours > 3) {
      status = 'Potentially Excessive';
      summary = `${plantName} thrives in bright diffused light, but direct afternoon sun may scorch its delicate foliage.`;
      riskAnalysis = 'Risk of bleached leaf patches, brown crispy burn marks, and rapid dehydration.';
      recommendations.push('Hang a sheer translucent curtain between the window and the plant to diffuse harsh rays.');
      recommendations.push('Move the plant 1 to 2 meters back from south- or west-facing windows.');
    } else if (dailyHours < 3 || lightType === 'shade') {
      status = 'Low';
      summary = `Light levels are on the lower side for ${plantName}. Growth may slow down.`;
      riskAnalysis = 'Smaller leaves, loss of variegation or fenestration, and slower soil drying.';
      recommendations.push('Move closer to an east- or north-facing window where light is gentle and bright.');
    } else {
      status = 'Suitable';
      summary = `Ideal lighting conditions for ${plantName}! Bright, non-scorching illumination supports vibrant foliage.`;
      riskAnalysis = 'Optimal photosynthetic balance with low risk of sunburn.';
      recommendations.push('Rotate the plant 90 degrees every week so all sides receive balanced light.');
    }
  } else if (plantRequirement === 'low_indirect') {
    if (lightType === 'direct' && dailyHours > 1) {
      status = 'Potentially Excessive';
      summary = `${plantName} is an understory or shade-tolerant plant. Direct sun will bleach or damage its foliage.`;
      riskAnalysis = 'High risk of photo-oxidation (leaf bleaching), sunburn, and thermal stress.';
      recommendations.push('Relocate to an interior room corner, hallway, or north-facing room.');
      recommendations.push('Keep completely out of direct sunlight paths.');
    } else {
      status = 'Suitable';
      summary = `Spot on. ${plantName} is well-adapted to moderate or low indirect light.`;
      riskAnalysis = 'Low light means the soil will stay wet much longer. Adjust watering frequency accordingly.';
      recommendations.push('Allow soil to dry thoroughly between waterings since evaporation is slow.');
    }
  } else {
    // Medium indirect / partial shade
    if (dailyHours >= 3 && lightType !== 'direct') {
      status = 'Suitable';
      summary = `Light levels are well-balanced for ${plantName}.`;
      riskAnalysis = 'Healthy balance for steady, moderate growth.';
      recommendations.push('Wipe foliage periodically to maximize light absorption on dusty leaves.');
    } else if (lightType === 'direct' && dailyHours > 4) {
      status = 'Potentially Excessive';
      summary = `Afternoon direct rays may be slightly intense for ${plantName}.`;
      recommendations.push('Provide morning sun or dappled shade during peak midday hours.');
    } else {
      status = 'Low';
      summary = `Light is slightly low for optimal vitality.`;
      recommendations.push('Bring closer to an active light source or provide reflective white wall surfaces.');
    }
  }

  return {
    plantName,
    plantRequirement,
    environment,
    dailyHours,
    lightType,
    windowFacing,
    status,
    summary,
    recommendations,
    riskAnalysis,
  };
}

export async function searchPlantEncyclopedia(query: string): Promise<any> {
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: `Provide care requirements, light needs, and toxicity information for: ${query}` }] }],
        config: {
          tools: [{ googleSearchRetrieval: {} }],
        },
      });
      return { answer: response.text };
    } catch (err) {
      console.error('Gemini search failed:', err);
    }
  }
  return { answer: 'Encyclopedia search is currently unavailable.' };
}
