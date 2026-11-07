export interface LevelConfig {
  level: number;
  name: string;
  minXp: number;
  maxXp: number;
  description: string;
  color: string;
}

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    name: 'Semilla',
    minXp: 0,
    maxXp: 100,
    description: 'El inicio de tu nuevo hábito de cuidado y bienestar.',
    color: '#8FAF9A', // Salvia
  },
  {
    level: 2,
    name: 'Brote',
    minXp: 101,
    maxXp: 300,
    description: 'Tus músculos y articulaciones empiezan a despertar.',
    color: '#F4A582', // Durazno
  },
  {
    level: 3,
    name: 'Constante',
    minXp: 301,
    maxXp: 600,
    description: 'El movimiento diario ya forma parte de tu bienestar.',
    color: '#8B1E3F', // Vino
  },
  {
    level: 4,
    name: 'Imparable',
    minXp: 601,
    maxXp: 1000,
    description: 'Fuerza, ligereza y serenidad que se notan en tu día a día.',
    color: '#D4AF37', // Oro
  },
  {
    level: 5,
    name: 'Radiante',
    minXp: 1001,
    maxXp: 2500,
    description: 'Vitalidad plena, postura elegante y energía renovada.',
    color: '#B8860B', // Ámbar noble
  },
];

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  icon: string;
  type: 'workout' | 'water' | 'reading' | 'stretch';
  target: number;
}

export const DAILY_MISSIONS_POOL: DailyMission[] = [
  {
    id: 'mission_workout_today',
    title: 'Completa tu sesión de hoy',
    description: 'Dedica 10 a 15 minutos a tu rutina guiada.',
    xpReward: 50,
    icon: 'Activity',
    type: 'workout',
    target: 1,
  },
  {
    id: 'mission_drink_water',
    title: 'Bebe 6 vasos de agua',
    description: 'Hidrata tus músculos y articulaciones a lo largo del día.',
    xpReward: 20,
    icon: 'Droplets',
    type: 'water',
    target: 6,
  },
  {
    id: 'mission_mindful_stretch',
    title: 'Postura y respiración consciente',
    description: 'Dedica 2 minutos a corregir tu postura al respirar.',
    xpReward: 20,
    icon: 'Sparkles',
    type: 'stretch',
    target: 1,
  },
  {
    id: 'mission_daily_tip',
    title: 'Lee el consejo de bienestar de Sofía',
    description: 'Aprende un nuevo hábito antiinflamatorio para tu rutina.',
    xpReward: 15,
    icon: 'BookOpen',
    type: 'reading',
    target: 1,
  },
];

export interface CaminoPostcard {
  id: string;
  title: string;
  subtitle: string;
  kmRequired: number;
  assetId: string;
  trivia: string;
  culturalNote: string;
}

export interface CaminoStage {
  id: number;
  name: string;
  startKm: number;
  endKm: number;
  postcard: CaminoPostcard;
}

export const CAMINO_STAGES: CaminoStage[] = [
  {
    id: 1,
    name: 'Etapa 1: Roncesvalles',
    startKm: 0,
    endKm: 65,
    postcard: {
      id: 'postcard_camino_1',
      title: 'Roncesvalles — El Sendero Verde',
      subtitle: 'Pirineos Navarros',
      kmRequired: 15,
      assetId: 'postcard_camino_1',
      trivia: '¿Sabías que caminar sobre superficies blandas o tierra reduce hasta un 30% el impacto en tus rodillas?',
      culturalNote: 'Punto de partida mítico donde miles de caminantes han comenzado su viaje de transformación interior desde el siglo IX.',
    },
  },
  {
    id: 2,
    name: 'Etapa 2: Puente la Reina',
    startKm: 65,
    endKm: 140,
    postcard: {
      id: 'postcard_camino_2',
      title: 'Puente la Reina — Cruce de Senderos',
      subtitle: 'Piedra Antigua y Río Arga',
      kmRequired: 70,
      assetId: 'postcard_camino_2',
      trivia: 'El apoyo en la pared en pilates activa los estabilizadores profundos del tobillo igual que subir una colina suave.',
      culturalNote: 'Aquí se unen dos grandes ramales del Camino. Su puente románico de 6 arcos es una obra maestra de armonía y firmeza.',
    },
  },
  {
    id: 3,
    name: 'Etapa 3: Viñedos de La Rioja',
    startKm: 140,
    endKm: 260,
    postcard: {
      id: 'postcard_camino_3',
      title: 'La Rioja — Viñas y Colinas Cálidas',
      subtitle: 'Tonos Vino y Atardeceres',
      kmRequired: 150,
      assetId: 'postcard_camino_3',
      trivia: 'Caminar a paso constante después de las comidas optimiza los niveles de glucosa y relaja la digestión.',
      culturalNote: 'Tierra fértil de atardeceres dorados y racimos color vino que evocan la vitalidad de la naturaleza.',
    },
  },
  {
    id: 4,
    name: 'Etapa 4: Catedral de León',
    startKm: 260,
    endKm: 450,
    postcard: {
      id: 'postcard_camino_4',
      title: 'León — Luz en las Vidrieras',
      subtitle: 'La Pulchra Leonina',
      kmRequired: 300,
      assetId: 'postcard_camino_4',
      trivia: 'Una postura erguida con hombros relajados permite a tus pulmones absorber hasta un 25% más oxígeno.',
      culturalNote: 'Famosa por sus más de 1.800 metros cuadrados de vidrieras que llenan el espacio de luz coloreada.',
    },
  },
  {
    id: 5,
    name: 'Etapa 5: Santiago de Compostela',
    startKm: 450,
    endKm: 780,
    postcard: {
      id: 'postcard_camino_5',
      title: 'Santiago — La Gran Llegada',
      subtitle: 'Plaza del Obradoiro',
      kmRequired: 500,
      assetId: 'postcard_camino_5',
      trivia: '¡Has completado una distancia equivalente a cruzar el norte de España paso a paso desde casa!',
      culturalNote: 'El eco de las campanas en la Plaza del Obradoiro abraza a cada caminante que creyó en su propia constancia.',
    },
  },
];

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  category: 'constancia' | 'tecnica' | 'camino' | 'bienestar' | 'especial';
  xpReward: number;
  assetId: string;
  iconName: string;
  requirement: {
    type: 'workouts' | 'streak' | 'km' | 'water' | 'special';
    target: number;
  };
}

export const BADGES_CATALOG: BadgeDefinition[] = [
  // Constancia
  {
    id: 'badge_first_step',
    title: 'Primer Paso',
    description: 'Completaste tu primera sesión de entrenamiento.',
    category: 'constancia',
    xpReward: 30,
    assetId: 'badge_first_workout',
    iconName: 'Footprints',
    requirement: { type: 'workouts', target: 1 },
  },
  {
    id: 'badge_streak_3',
    title: 'Ritmo Saludable',
    description: '3 días consecutivos cuidando tu cuerpo.',
    category: 'constancia',
    xpReward: 40,
    assetId: 'badge_streak_7',
    iconName: 'Flame',
    requirement: { type: 'streak', target: 3 },
  },
  {
    id: 'badge_streak_7',
    title: 'Semana de Oro',
    description: '7 días seguidos de constancia imparable.',
    category: 'constancia',
    xpReward: 100,
    assetId: 'badge_streak_7',
    iconName: 'Award',
    requirement: { type: 'streak', target: 7 },
  },
  {
    id: 'badge_streak_14',
    title: 'Hábito de Hierro',
    description: '14 días seguidos de movimiento diario.',
    category: 'constancia',
    xpReward: 150,
    assetId: 'badge_streak_7',
    iconName: 'ShieldCheck',
    requirement: { type: 'streak', target: 14 },
  },
  {
    id: 'badge_streak_28',
    title: 'Reto 28 Completo',
    description: '28 días seguidos de amor propio y vitalidad.',
    category: 'constancia',
    xpReward: 300,
    assetId: 'badge_streak_7',
    iconName: 'Crown',
    requirement: { type: 'streak', target: 28 },
  },
  {
    id: 'badge_workouts_5',
    title: 'En Marcha',
    description: '5 sesiones completadas con éxito.',
    category: 'constancia',
    xpReward: 50,
    assetId: 'badge_first_workout',
    iconName: 'Activity',
    requirement: { type: 'workouts', target: 5 },
  },
  {
    id: 'badge_workouts_10',
    title: 'Doble Dígito',
    description: '10 entrenamientos guiados.',
    category: 'constancia',
    xpReward: 80,
    assetId: 'badge_first_workout',
    iconName: 'Sparkles',
    requirement: { type: 'workouts', target: 10 },
  },
  {
    id: 'badge_workouts_25',
    title: 'Mujer Constante',
    description: '25 sesiones en casa con Sofía.',
    category: 'constancia',
    xpReward: 200,
    assetId: 'badge_first_workout',
    iconName: 'Star',
    requirement: { type: 'workouts', target: 25 },
  },

  // Técnica y Tipos de Ejercicio
  {
    id: 'badge_wall_master',
    title: 'Maestra de la Pared',
    description: 'Completaste 3 sesiones de Pilates en la Pared.',
    category: 'tecnica',
    xpReward: 60,
    assetId: 'badge_wall_master',
    iconName: 'Layers',
    requirement: { type: 'workouts', target: 3 },
  },
  {
    id: 'badge_chair_master',
    title: 'Elegancia en Silla',
    description: 'Completaste 3 sesiones de Pilates en Silla.',
    category: 'tecnica',
    xpReward: 60,
    assetId: 'badge_wall_master',
    iconName: 'Compass',
    requirement: { type: 'workouts', target: 3 },
  },
  {
    id: 'badge_stretch_master',
    title: 'Alivio Lumbar',
    description: 'Completaste 5 sesiones de estiramiento y movilidad articular.',
    category: 'tecnica',
    xpReward: 70,
    assetId: 'badge_wall_master',
    iconName: 'HeartPulse',
    requirement: { type: 'workouts', target: 5 },
  },
  {
    id: 'badge_face_yoga_master',
    title: 'Rostro Luminoso',
    description: 'Completaste tu primera sesión de Yoga Facial.',
    category: 'tecnica',
    xpReward: 50,
    assetId: 'badge_wall_master',
    iconName: 'Smile',
    requirement: { type: 'workouts', target: 1 },
  },

  // Camino de Santiago
  {
    id: 'badge_camino_15km',
    title: 'Primeros Pasos del Camino',
    description: 'Alcanzaste 15 km acumulados de caminata.',
    category: 'camino',
    xpReward: 40,
    assetId: 'badge_camino_finisher',
    iconName: 'MapPin',
    requirement: { type: 'km', target: 15 },
  },
  {
    id: 'badge_camino_50km',
    title: 'Valle de Navarra',
    description: 'Alcanzaste 50 km acumulados en tu ruta.',
    category: 'camino',
    xpReward: 80,
    assetId: 'badge_camino_finisher',
    iconName: 'Navigation',
    requirement: { type: 'km', target: 50 },
  },
  {
    id: 'badge_camino_100km',
    title: 'Centenaria',
    description: '100 km de caminata activa registrados en casa.',
    category: 'camino',
    xpReward: 120,
    assetId: 'badge_camino_finisher',
    iconName: 'TrendingUp',
    requirement: { type: 'km', target: 100 },
  },
  {
    id: 'badge_camino_250km',
    title: 'Cruzando Castilla',
    description: '250 km recorridos en tu ruta virtual.',
    category: 'camino',
    xpReward: 200,
    assetId: 'badge_camino_finisher',
    iconName: 'Compass',
    requirement: { type: 'km', target: 250 },
  },
  {
    id: 'badge_camino_finisher',
    title: 'Peregrina de Oro',
    description: 'Alcanzaste la emblemática Plaza del Obradoiro en Santiago.',
    category: 'camino',
    xpReward: 500,
    assetId: 'badge_camino_finisher',
    iconName: 'Trophy',
    requirement: { type: 'km', target: 500 },
  },

  // Bienestar e Hidratación
  {
    id: 'badge_hydration_queen',
    title: 'Gota Radiante',
    description: 'Registraste tu consumo de agua durante 3 días seguidos.',
    category: 'bienestar',
    xpReward: 50,
    assetId: 'badge_hydration_queen',
    iconName: 'Droplets',
    requirement: { type: 'water', target: 3 },
  },
  {
    id: 'badge_morning_flow',
    title: 'Amanecer Ligero',
    description: 'Entrenaste antes de las 9:00 AM para empezar con energía.',
    category: 'bienestar',
    xpReward: 40,
    assetId: 'badge_first_workout',
    iconName: 'Sun',
    requirement: { type: 'special', target: 1 },
  },
  {
    id: 'badge_evening_calm',
    title: 'Serenidad Nocturna',
    description: 'Completaste una sesión de relajación antes de dormir.',
    category: 'bienestar',
    xpReward: 40,
    assetId: 'badge_first_workout',
    iconName: 'Moon',
    requirement: { type: 'special', target: 1 },
  },
  {
    id: 'badge_protector_used',
    title: 'Escudo Amable',
    description: 'Usaste tu protector de racha sin culpas: descansar también es cuidarse.',
    category: 'especial',
    xpReward: 30,
    assetId: 'badge_first_workout',
    iconName: 'Shield',
    requirement: { type: 'special', target: 1 },
  },
  {
    id: 'badge_chest_unlocked',
    title: 'Cofre del Día',
    description: 'Completaste las 3 misiones diarias en un solo día.',
    category: 'especial',
    xpReward: 50,
    assetId: 'badge_streak_7',
    iconName: 'Gift',
    requirement: { type: 'special', target: 1 },
  },
  {
    id: 'badge_level_3',
    title: 'Nivel Constante',
    description: 'Alcanzaste el Nivel 3 y consolidaste tu nuevo estilo de vida.',
    category: 'especial',
    xpReward: 100,
    assetId: 'badge_streak_7',
    iconName: 'Award',
    requirement: { type: 'special', target: 1 },
  },
  {
    id: 'badge_level_5',
    title: 'Nivel Radiante',
    description: 'Alcanzaste el Nivel 5: el más alto nivel de vitalidad de Ligera.',
    category: 'especial',
    xpReward: 300,
    assetId: 'badge_streak_7',
    iconName: 'Zap',
    requirement: { type: 'special', target: 1 },
  },
];
