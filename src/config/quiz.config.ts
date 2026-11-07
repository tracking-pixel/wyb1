/**
 * Configuración completa del Quiz de Ligera.
 * 100% orientada a configuración: cambiar orden de preguntas o textos
 * se hace aquí sin tocar componentes de UI.
 */

export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'body_silhouette'
  | 'intermediate'
  | 'units_selector'
  | 'height_weight'
  | 'event_motivator'
  | 'text_input';

export interface QuizOption {
  id: string;
  labelKey: string;
  sublabelKey?: string;
  iconName?: string;
  silhouetteType?: 'rectangle' | 'pear' | 'hourglass' | 'apple';
}

export interface QuizStepConfig {
  id: string;
  stepNumber: number;
  type: QuestionType;
  titleKey: string;
  subtitleKey?: string;
  hintKey?: string;
  options?: QuizOption[];
  minSelect?: number;
  maxSelect?: number;
  intermediateContent?: {
    badgeKey?: string;
    headlineKey: string;
    paragraphKey: string;
    metricValue?: string;
    metricLabelKey?: string;
    testimonialPlaceholder?: {
      name: string;
      age: number;
      quoteKey: string;
      avatarUrl?: string;
    };
  };
  validation?: {
    required?: boolean;
    minWeightKg?: number;
    maxWeightKg?: number;
    minHeightCm?: number;
    maxHeightCm?: number;
    minBmi?: number;
  };
}

export const quizSteps: QuizStepConfig[] = [
  // 1. Objetivo Principal
  {
    id: 'primary_goal',
    stepNumber: 1,
    type: 'single_choice',
    titleKey: 'quiz.steps.primary_goal.title',
    subtitleKey: 'quiz.steps.primary_goal.subtitle',
    options: [
      { id: 'weight_loss', labelKey: 'quiz.options.goal.weight_loss', iconName: 'Flame' },
      { id: 'toning', labelKey: 'quiz.options.goal.toning', iconName: 'Sparkles' },
      { id: 'more_energy', labelKey: 'quiz.options.goal.more_energy', iconName: 'Zap' },
      { id: 'relieve_back_pain', labelKey: 'quiz.options.goal.relieve_back_pain', iconName: 'ShieldCheck' },
    ],
  },
  // 2. Rango de Edad
  {
    id: 'age_range',
    stepNumber: 2,
    type: 'single_choice',
    titleKey: 'quiz.steps.age_range.title',
    subtitleKey: 'quiz.steps.age_range.subtitle',
    options: [
      { id: '35_44', labelKey: 'quiz.options.age.35_44' },
      { id: '45_54', labelKey: 'quiz.options.age.45_54' },
      { id: '55_plus', labelKey: 'quiz.options.age.55_plus' },
    ],
  },
  // 3. Silueta Actual
  {
    id: 'current_body_type',
    stepNumber: 3,
    type: 'body_silhouette',
    titleKey: 'quiz.steps.current_body_type.title',
    subtitleKey: 'quiz.steps.current_body_type.subtitle',
    options: [
      { id: 'rectangle', labelKey: 'quiz.options.silhouette.rectangle', silhouetteType: 'rectangle' },
      { id: 'pear', labelKey: 'quiz.options.silhouette.pear', silhouetteType: 'pear' },
      { id: 'hourglass', labelKey: 'quiz.options.silhouette.hourglass', silhouetteType: 'hourglass' },
      { id: 'apple', labelKey: 'quiz.options.silhouette.apple', silhouetteType: 'apple' },
    ],
  },
  // 4. Silueta Deseada
  {
    id: 'target_body_type',
    stepNumber: 4,
    type: 'body_silhouette',
    titleKey: 'quiz.steps.target_body_type.title',
    subtitleKey: 'quiz.steps.target_body_type.subtitle',
    options: [
      { id: 'rectangle_fit', labelKey: 'quiz.options.target_silhouette.toned', silhouetteType: 'rectangle' },
      { id: 'hourglass_fit', labelKey: 'quiz.options.target_silhouette.curvy_toned', silhouetteType: 'hourglass' },
      { id: 'athletic_fit', labelKey: 'quiz.options.target_silhouette.lean', silhouetteType: 'pear' },
      { id: 'balanced_fit', labelKey: 'quiz.options.target_silhouette.balanced', silhouetteType: 'apple' },
    ],
  },
  // 5. Zonas a Trabajar (Múltiple)
  {
    id: 'target_zones',
    stepNumber: 5,
    type: 'multiple_choice',
    titleKey: 'quiz.steps.target_zones.title',
    subtitleKey: 'quiz.steps.target_zones.subtitle',
    minSelect: 1,
    options: [
      { id: 'abdomen', labelKey: 'quiz.options.zones.abdomen', iconName: 'Layers' },
      { id: 'legs', labelKey: 'quiz.options.zones.legs', iconName: 'Activity' },
      { id: 'glutes', labelKey: 'quiz.options.zones.glutes', iconName: 'Heart' },
      { id: 'arms', labelKey: 'quiz.options.zones.arms', iconName: 'Dumbbell' },
      { id: 'back', labelKey: 'quiz.options.zones.back', iconName: 'Smile' },
    ],
  },
  // 6. Nivel de Actividad Actual
  {
    id: 'activity_level',
    stepNumber: 6,
    type: 'single_choice',
    titleKey: 'quiz.steps.activity_level.title',
    subtitleKey: 'quiz.steps.activity_level.subtitle',
    options: [
      { id: 'sedentary', labelKey: 'quiz.options.activity.sedentary', sublabelKey: 'quiz.options.activity.sedentary_desc' },
      { id: 'light_walking', labelKey: 'quiz.options.activity.light_walking', sublabelKey: 'quiz.options.activity.light_walking_desc' },
      { id: 'occasional_active', labelKey: 'quiz.options.activity.occasional_active', sublabelKey: 'quiz.options.activity.occasional_active_desc' },
      { id: 'regular_training', labelKey: 'quiz.options.activity.regular_training', sublabelKey: 'quiz.options.activity.regular_training_desc' },
    ],
  },
  // 7. Preferencia de Entrenamiento
  {
    id: 'workout_preference',
    stepNumber: 7,
    type: 'single_choice',
    titleKey: 'quiz.steps.workout_preference.title',
    subtitleKey: 'quiz.steps.workout_preference.subtitle',
    options: [
      { id: 'walking', labelKey: 'quiz.options.preference.walking', iconName: 'Footprints' },
      { id: 'wall_pilates', labelKey: 'quiz.options.preference.wall_pilates', iconName: 'Square' },
      { id: 'chair_pilates', labelKey: 'quiz.options.preference.chair_pilates', iconName: 'Armchair' },
      { id: 'mix_all', labelKey: 'quiz.options.preference.mix_all', iconName: 'Sparkles' },
    ],
  },
  // 8. Tiempo Disponible al Día
  {
    id: 'daily_time',
    stepNumber: 8,
    type: 'single_choice',
    titleKey: 'quiz.steps.daily_time.title',
    subtitleKey: 'quiz.steps.daily_time.subtitle',
    options: [
      { id: '10_min', labelKey: 'quiz.options.time.10_min', sublabelKey: 'quiz.options.time.quick' },
      { id: '15_min', labelKey: 'quiz.options.time.15_min', sublabelKey: 'quiz.options.time.ideal' },
      { id: '20_min', labelKey: 'quiz.options.time.20_min', sublabelKey: 'quiz.options.time.complete' },
      { id: '30_min', labelKey: 'quiz.options.time.30_min', sublabelKey: 'quiz.options.time.intensive' },
    ],
  },
  // 9. Limitaciones físicas (Adapta el plan)
  {
    id: 'limitations',
    stepNumber: 9,
    type: 'multiple_choice',
    titleKey: 'quiz.steps.limitations.title',
    subtitleKey: 'quiz.steps.limitations.subtitle',
    minSelect: 1,
    options: [
      { id: 'knees', labelKey: 'quiz.options.limitations.knees', sublabelKey: 'quiz.options.limitations.knees_desc' },
      { id: 'back', labelKey: 'quiz.options.limitations.back', sublabelKey: 'quiz.options.limitations.back_desc' },
      { id: 'neck_shoulders', labelKey: 'quiz.options.limitations.neck_shoulders', sublabelKey: 'quiz.options.limitations.neck_desc' },
      { id: 'wrists', labelKey: 'quiz.options.limitations.wrists', sublabelKey: 'quiz.options.limitations.wrists_desc' },
      { id: 'none', labelKey: 'quiz.options.limitations.none', sublabelKey: 'quiz.options.limitations.none_desc' },
    ],
  },
  // INTERMEDIA 1: Adaptación de articulaciones y bajo impacto
  {
    id: 'inter_joint_adaptation',
    stepNumber: 10,
    type: 'intermediate',
    titleKey: 'quiz.steps.inter1.title',
    intermediateContent: {
      headlineKey: 'quiz.intermediate.joint.headline',
      paragraphKey: 'quiz.intermediate.joint.paragraph',
      metricValue: '100% de bajo impacto',
      metricLabelKey: 'quiz.intermediate.joint.metric_label',
      testimonialPlaceholder: {
        name: 'Teresa M.',
        age: 51,
        quoteKey: 'quiz.intermediate.joint.testimonial',
      },
    },
  },
  // 11. Última vez en peso ideal
  {
    id: 'last_ideal_weight',
    stepNumber: 11,
    type: 'single_choice',
    titleKey: 'quiz.steps.last_ideal_weight.title',
    options: [
      { id: 'less_than_1_year', labelKey: 'quiz.options.ideal_weight.less_1_year' },
      { id: '1_to_3_years', labelKey: 'quiz.options.ideal_weight.1_3_years' },
      { id: 'more_than_3_years', labelKey: 'quiz.options.ideal_weight.more_3_years' },
      { id: 'never', labelKey: 'quiz.options.ideal_weight.never' },
    ],
  },
  // 12. Sueño y Descanso
  {
    id: 'sleep_hours',
    stepNumber: 12,
    type: 'single_choice',
    titleKey: 'quiz.steps.sleep_hours.title',
    options: [
      { id: 'under_6', labelKey: 'quiz.options.sleep.under_6' },
      { id: '6_to_7', labelKey: 'quiz.options.sleep.6_7' },
      { id: '7_to_8', labelKey: 'quiz.options.sleep.7_8' },
      { id: 'interrupted', labelKey: 'quiz.options.sleep.interrupted' },
    ],
  },
  // 13. Consumo de Agua
  {
    id: 'water_intake',
    stepNumber: 13,
    type: 'single_choice',
    titleKey: 'quiz.steps.water_intake.title',
    options: [
      { id: 'under_1l', labelKey: 'quiz.options.water.under_1l' },
      { id: '1_to_2l', labelKey: 'quiz.options.water.1_2l' },
      { id: 'over_2l', labelKey: 'quiz.options.water.over_2l' },
    ],
  },
  // 14. Nivel de Energía durante el día
  {
    id: 'energy_level',
    stepNumber: 14,
    type: 'single_choice',
    titleKey: 'quiz.steps.energy_level.title',
    options: [
      { id: 'wake_tired', labelKey: 'quiz.options.energy.wake_tired' },
      { id: 'afternoon_crash', labelKey: 'quiz.options.energy.afternoon_crash' },
      { id: 'fluctuating', labelKey: 'quiz.options.energy.fluctuating' },
      { id: 'steady_energy', labelKey: 'quiz.options.energy.steady' },
    ],
  },
  // 15. Hábitos diarios (Múltiple)
  {
    id: 'habits',
    stepNumber: 15,
    type: 'multiple_choice',
    titleKey: 'quiz.steps.habits.title',
    subtitleKey: 'quiz.steps.habits.subtitle',
    minSelect: 1,
    options: [
      { id: 'snack_between_meals', labelKey: 'quiz.options.habits.snack' },
      { id: 'late_night_sweets', labelKey: 'quiz.options.habits.night_sweets' },
      { id: 'anxiety_eating', labelKey: 'quiz.options.habits.anxiety' },
      { id: 'skip_breakfast', labelKey: 'quiz.options.habits.skip_breakfast' },
      { id: 'none', labelKey: 'quiz.options.habits.none' },
    ],
  },
  // INTERMEDIA 2: La ciencia del pilates de pared para mujeres 35+
  {
    id: 'inter_wall_pilates_science',
    stepNumber: 16,
    type: 'intermediate',
    titleKey: 'quiz.steps.inter2.title',
    intermediateContent: {
      headlineKey: 'quiz.intermediate.science.headline',
      paragraphKey: 'quiz.intermediate.science.paragraph',
      metricValue: '15 minutos diarios',
      metricLabelKey: 'quiz.intermediate.science.metric_label',
      testimonialPlaceholder: {
        name: 'Silvia P.',
        age: 46,
        quoteKey: 'quiz.intermediate.science.testimonial',
      },
    },
  },
  // 17. Evento motivador + fecha opcional
  {
    id: 'motivating_event',
    stepNumber: 17,
    type: 'event_motivator',
    titleKey: 'quiz.steps.motivating_event.title',
    subtitleKey: 'quiz.steps.motivating_event.subtitle',
    options: [
      { id: 'vacation', labelKey: 'quiz.options.events.vacation', iconName: 'Palmtree' },
      { id: 'wedding_party', labelKey: 'quiz.options.events.wedding', iconName: 'Wine' },
      { id: 'birthday', labelKey: 'quiz.options.events.birthday', iconName: 'Cake' },
      { id: 'reunion', labelKey: 'quiz.options.events.reunion', iconName: 'Users' },
      { id: 'no_event', labelKey: 'quiz.options.events.no_event', iconName: 'HeartHandshake' },
    ],
  },
  // 18. Selector de unidades y medidas (Altura, Peso Actual, Peso Objetivo)
  {
    id: 'body_measurements',
    stepNumber: 18,
    type: 'height_weight',
    titleKey: 'quiz.steps.measurements.title',
    subtitleKey: 'quiz.steps.measurements.subtitle',
    validation: {
      minBmi: 18.5,
      minWeightKg: 40,
      maxWeightKg: 200,
      minHeightCm: 120,
      maxHeightCm: 220,
    },
  },
  // INTERMEDIA 3: "Estamos listos para personalizar tu plan"
  {
    id: 'inter_almost_ready',
    stepNumber: 19,
    type: 'intermediate',
    titleKey: 'quiz.steps.inter3.title',
    intermediateContent: {
      headlineKey: 'quiz.intermediate.ready.headline',
      paragraphKey: 'quiz.intermediate.ready.paragraph',
      metricValue: 'Tu ritmo personal',
      metricLabelKey: 'quiz.intermediate.ready.metric_label',
      testimonialPlaceholder: {
        name: 'Rosa L.',
        age: 49,
        quoteKey: 'quiz.intermediate.ready.testimonial',
      },
    },
  },
  // 20. Nombre de la usuaria
  {
    id: 'user_name',
    stepNumber: 20,
    type: 'text_input',
    titleKey: 'quiz.steps.user_name.title',
    subtitleKey: 'quiz.steps.user_name.subtitle',
    hintKey: 'quiz.steps.user_name.hint',
    validation: {
      required: true,
    },
  },
];
