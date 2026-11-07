import { exercisesData } from '@/src/content/exercises.data';
import { ART_STYLE } from './artStyle';

export type AssetType =
  | 'character'
  | 'exercise_frame'
  | 'workout_cover'
  | 'module_cover'
  | 'home_header'
  | 'quiz_illustration'
  | 'badge'
  | 'postcard'
  | 'recipe';

export interface AssetManifestItem {
  id: string;
  name: string;
  type: AssetType;
  prompt: string;
  aspectRatio: '1:1' | '16:9' | '4:3' | '3:4';
  status: 'pending' | 'generated' | 'approved';
  category?: string;
  previewUrl?: string; // Data URL or storage path
  updatedAt?: string;
}

// Base assets catalog
const baseAssets: AssetManifestItem[] = [
  // 1. Sofía Model Sheet
  {
    id: 'sofia_model_sheet',
    name: 'Sofía — Model Sheet Oficial (Referencia)',
    type: 'character',
    aspectRatio: '1:1',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} Model sheet oficial de Sofía, instructora de bienestar: mujer latina de 40 años, tez cálida, cabello castaño recogido en un moño elegante, top deportivo y leggings vino (#8B1E3F), tenis blancos, 3 vistas estilizadas (frente, perfil lateral, tres cuartos), cuerpo atlético real y saludable, fondo blanco perla neutro.`,
  },

  // 2. Headers de Home por período
  {
    id: 'home_header_morning',
    name: 'Header Home — Mañana Radiante',
    type: 'home_header',
    aspectRatio: '16:9',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} Amanecer cálido y luminoso con rayos dorados de sol entrando por una ventana amplia, sala luminosa con plantas verdes, esterilla color arena en el piso, atmósfera de calma, renovación y energía positiva matutina.`,
  },
  {
    id: 'home_header_afternoon',
    name: 'Header Home — Tarde Serena',
    type: 'home_header',
    aspectRatio: '16:9',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} Luz cálida de la tarde dorada, espacio relajante de sala con cortinas de lino color crema, taza de infusión sobre mesa de madera, atmósfera acogedora y serena.`,
  },
  {
    id: 'home_header_evening',
    name: 'Header Home — Noche y Descanso',
    type: 'home_header',
    aspectRatio: '16:9',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} Atardecer o noche suave con iluminación tenue de lámpara cálida, tonos vino profundo, azul medianoche suave y durazno, atmósfera de paz profunda y relajación muscular.`,
  },

  // 3. Capas de Módulos
  {
    id: 'module_cover_meal_plan',
    name: 'Capa Módulo — Plan de Comidas',
    type: 'module_cover',
    aspectRatio: '4:3',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} ${ART_STYLE.foodStyle} Selección de platos latinos saludables con aguacate fresco, quinoa, salmón a la plancha, hierbas aromáticas y limones en mesa de madera clara.`,
  },
  {
    id: 'module_cover_challenge_28',
    name: 'Capa Módulo — Reto 28 Días Core y Postura',
    type: 'module_cover',
    aspectRatio: '4:3',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} ${ART_STYLE.sofiaCharacterPrompt} en postura triunfante y estilizada de pilates en la pared, luz suave dorada, transmitiendo constancia, fuerza y elegancia.`,
  },
  {
    id: 'module_cover_face_yoga',
    name: 'Capa Módulo — Yoga Facial 21 Días',
    type: 'module_cover',
    aspectRatio: '4:3',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} Primer plano artístico del rostro radiante de Sofía con ojos cerrados sonriendo en paz, masajeando suavemente sus sienes, piel luminosa y descansada, luz etérea.`,
  },
  {
    id: 'module_cover_ai_coach',
    name: 'Capa Módulo — Coach IA Personal',
    type: 'module_cover',
    aspectRatio: '4:3',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} ${ART_STYLE.sofiaCharacterPrompt} sentada cómodamente sosteniendo un teléfono móvil con pantalla cálida, mirada empática hacia la cámara como conversando con una amiga querida.`,
  },

  // 4. Capas de Rutinas Principales
  {
    id: 'workout_cover_day1',
    name: 'Capa Rutina — Día 1: Despertar Articular',
    type: 'workout_cover',
    aspectRatio: '16:9',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} ${ART_STYLE.sofiaCharacterPrompt} en postura de caminata ligera en una sala minimalista con grandes ventanales y luz natural matinal.`,
  },
  {
    id: 'workout_cover_wall_pilates',
    name: 'Capa Rutina — Pilates en Pared',
    type: 'workout_cover',
    aspectRatio: '16:9',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} ${ART_STYLE.sofiaCharacterPrompt} realizando un ejercicio fluido apoyada en una pared color crema con postura perfecta y bajo impacto.`,
  },
  {
    id: 'workout_cover_chair_pilates',
    name: 'Capa Rutina — Pilates en Silla',
    type: 'workout_cover',
    aspectRatio: '16:9',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} ${ART_STYLE.sofiaCharacterPrompt} sentada erguida en una silla de madera estilizada con brazos abiertos y rostro lleno de vitalidad.`,
  },
  {
    id: 'workout_cover_stretching',
    name: 'Capa Rutina — Estiramiento y Alivio Lumbar',
    type: 'workout_cover',
    aspectRatio: '16:9',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} ${ART_STYLE.sofiaCharacterPrompt} en estiramiento de columna suave, atmósfera relajante y cálida.`,
  },

  // 5. Cartões Postais do Camino
  {
    id: 'postcard_camino_1',
    name: 'Postal Camino — Roncesvalles (Inicio Verde)',
    type: 'postcard',
    aspectRatio: '4:3',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} ${ART_STYLE.landscapeStyle} Sendero empedrado en medio de un bosque de hayas brumoso en los Pirineos, farol de piedra y flecha amarilla tradicional del Camino.`,
  },
  {
    id: 'postcard_camino_2',
    name: 'Postal Camino — Puente la Reina (Piedra Antigua)',
    type: 'postcard',
    aspectRatio: '4:3',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} ${ART_STYLE.landscapeStyle} Puente medieval de piedra con seis arcos sobre un río tranquilo, reflejos dorados y colinas suaves.`,
  },
  {
    id: 'postcard_camino_3',
    name: 'Postal Camino — Viñedos de La Rioja',
    type: 'postcard',
    aspectRatio: '4:3',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} ${ART_STYLE.landscapeStyle} Campos ondulados de viñedos en tonos vino y oro al atardecer, camino de tierra serpenteante.`,
  },
  {
    id: 'postcard_camino_4',
    name: 'Postal Camino — Catedral de León',
    type: 'postcard',
    aspectRatio: '4:3',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} ${ART_STYLE.landscapeStyle} Vista estilizada de una catedral gótica iluminada con luz cálida desde una plaza acogedora.`,
  },
  {
    id: 'postcard_camino_5',
    name: 'Postal Camino — Plaza del Obradoiro (Santiago)',
    type: 'postcard',
    aspectRatio: '4:3',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} ${ART_STYLE.landscapeStyle} Llegada triunfal a la plaza empedrada de Santiago de Compostela con rayos dorados de sol rompiendo nubes suaves, concha de peregrino en primer plano.`,
  },

  // 6. Badges (Medallas Esmaltadas 3D)
  {
    id: 'badge_first_workout',
    name: 'Medalla — Primer Paso',
    type: 'badge',
    aspectRatio: '1:1',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} Medalla esmaltada 3D de colección con borde dorado cepillado, centro esmaltado en color vino (#8B1E3F) con silueta de un pie alado o zapato de caminata dorado, brillo sutil, fondo neutro.`,
  },
  {
    id: 'badge_streak_7',
    name: 'Medalla — Racha de 7 Días',
    type: 'badge',
    aspectRatio: '1:1',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} Medalla esmaltada 3D dorada con una llama estilizada en esmalte durazno y ámbar brillante sobre fondo vino, relieves limpios, calidad numismática de lujo.`,
  },
  {
    id: 'badge_wall_master',
    name: 'Medalla — Maestra de la Pared',
    type: 'badge',
    aspectRatio: '1:1',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} Medalla esmaltada 3D hexagonal con marco dorado, silueta de postura de pilates estilizada en esmalte blanco y vino, corona de laureles sutil.`,
  },
  {
    id: 'badge_hydration_queen',
    name: 'Medalla — Hidratación Radiante',
    type: 'badge',
    aspectRatio: '1:1',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} Medalla esmaltada 3D con forma de gota de agua estilizada en cristal turquesa y borde dorado fino, destello delicado.`,
  },
  {
    id: 'badge_camino_finisher',
    name: 'Medalla — Peregrina del Camino',
    type: 'badge',
    aspectRatio: '1:1',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} Medalla concha de Santiago en relieve dorado esmaltado con centro vino y bordes pulidos de colección.`,
  },

  // 7. Recetas
  {
    id: 'recipe_avocado_toast',
    name: 'Receta — Tostada de Aguacate con Huevo',
    type: 'recipe',
    aspectRatio: '4:3',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} ${ART_STYLE.foodStyle} Tostada de pan de masa madre con aguacate machacado, huevo pochado en el punto perfecto y semillas de chía, sobre plato de cerámica color arena.`,
  },
  {
    id: 'recipe_chicken_quinoa_bowl',
    name: 'Receta — Bowl Latino de Pollo y Quinoa',
    type: 'recipe',
    aspectRatio: '4:3',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} ${ART_STYLE.foodStyle} Bowl artesanal con tiras de pollo dorado, quinoa tibia, frijoles negros y pico de gallo fresco con limón.`,
  },
  {
    id: 'recipe_baked_fish',
    name: 'Receta — Pescado al Horno con Verduras',
    type: 'recipe',
    aspectRatio: '4:3',
    status: 'pending',
    prompt: `${ART_STYLE.prefix} ${ART_STYLE.foodStyle} Filete de pescado blanco empapelado con calabacitas en rodajas, zanahoria y hierbas frescas, servido caliente.`,
  },
];

// Dynamically add keyframe assets for all 32 exercises (start, mid, end)
const exerciseKeyframeAssets: AssetManifestItem[] = exercisesData.flatMap((ex) => [
  {
    id: ex.frames.start,
    name: `${ex.name} — Frame Inicial`,
    type: 'exercise_frame' as AssetType,
    aspectRatio: '4:3',
    status: 'pending' as const,
    category: ex.category,
    prompt: ex.framePrompts.start,
  },
  {
    id: ex.frames.mid,
    name: `${ex.name} — Frame Medio (Pico)`,
    type: 'exercise_frame' as AssetType,
    aspectRatio: '4:3',
    status: 'pending' as const,
    category: ex.category,
    prompt: ex.framePrompts.mid,
  },
  {
    id: ex.frames.end,
    name: `${ex.name} — Frame Final`,
    type: 'exercise_frame' as AssetType,
    aspectRatio: '4:3',
    status: 'pending' as const,
    category: ex.category,
    prompt: ex.framePrompts.end,
  },
]);

export const ASSET_MANIFEST: AssetManifestItem[] = [
  ...baseAssets,
  ...exerciseKeyframeAssets,
];
