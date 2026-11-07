import {
  BADGES_CATALOG,
  BadgeDefinition,
  CAMINO_STAGES,
  DAILY_MISSIONS_POOL,
  DailyMission,
  LEVELS,
  LevelConfig,
} from '../config/gamification';

export interface GamificationState {
  xp: number;
  currentDay: number;
  completedDays: number[];
  streak: number;
  lastActiveDate: string;
  streakShieldAvailable: boolean;
  streakShieldUsedThisWeek: boolean;
  waterGlasses: number;
  waterTarget: number;
  caminoKm: number;
  unlockedBadgeIds: string[];
  unlockedPostcardIds: string[];
  completedMissionIds: string[];
  chestClaimedToday: boolean;
  weeklyHistory: boolean[]; // 7 days of the current week [Mon..Sun]
}

const STORAGE_KEY = 'ligera_gamification_v2';

const DEFAULT_STATE: GamificationState = {
  xp: 220,
  currentDay: 4,
  completedDays: [1, 2, 3],
  streak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  streakShieldAvailable: true,
  streakShieldUsedThisWeek: false,
  waterGlasses: 4,
  waterTarget: 6,
  caminoKm: 32.4,
  unlockedBadgeIds: ['badge_first_step', 'badge_streak_3'],
  unlockedPostcardIds: ['postcard_camino_1'],
  completedMissionIds: ['mission_drink_water'],
  chestClaimedToday: false,
  weeklyHistory: [true, true, true, false, false, false, false],
};

type Listener = (state: GamificationState) => void;

class GamificationService {
  private state: GamificationState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): GamificationState {
    if (typeof window === 'undefined') return DEFAULT_STATE;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_STATE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Error loading gamification state:', e);
    }
    return DEFAULT_STATE;
  }

  private saveState() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Error saving gamification state:', e);
    }
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.state));
  }

  public getState(): GamificationState {
    return { ...this.state };
  }

  public resetToDay1() {
    this.state = {
      xp: 0,
      currentDay: 1,
      completedDays: [],
      streak: 0,
      lastActiveDate: '',
      streakShieldAvailable: true,
      streakShieldUsedThisWeek: false,
      waterGlasses: 0,
      waterTarget: 6,
      caminoKm: 0,
      unlockedBadgeIds: [],
      unlockedPostcardIds: [],
      completedMissionIds: [],
      chestClaimedToday: false,
      weeklyHistory: [false, false, false, false, false, false, false],
    };
    this.saveState();
  }

  public resetToDay4Demo() {
    this.state = { ...DEFAULT_STATE };
    this.saveState();
  }

  public getCurrentLevel(): {
    current: LevelConfig;
    next: LevelConfig | null;
    progressPercent: number;
  } {
    const xp = this.state.xp;
    let current = LEVELS[0];
    let next: LevelConfig | null = LEVELS[1] || null;

    for (let i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].minXp && xp <= LEVELS[i].maxXp) {
        current = LEVELS[i];
        next = LEVELS[i + 1] || null;
        break;
      }
      if (i === LEVELS.length - 1 && xp > LEVELS[i].maxXp) {
        current = LEVELS[i];
        next = null;
      }
    }

    let progressPercent = 100;
    if (next) {
      const range = current.maxXp - current.minXp;
      const gained = xp - current.minXp;
      progressPercent = Math.min(100, Math.max(0, Math.round((gained / range) * 100)));
    }

    return { current, next, progressPercent };
  }

  public addXp(amount: number): { newXp: number; leveledUp: boolean; newLevel: LevelConfig } {
    const prevLevel = this.getCurrentLevel().current;
    this.state.xp += amount;
    const currentLevel = this.getCurrentLevel().current;
    const leveledUp = currentLevel.level > prevLevel.level;

    if (leveledUp) {
      if (currentLevel.level >= 3) {
        this.unlockBadge('badge_level_3');
      }
      if (currentLevel.level >= 5) {
        this.unlockBadge('badge_level_5');
      }
    }

    this.saveState();
    return { newXp: this.state.xp, leveledUp, newLevel: currentLevel };
  }

  public logWater(glasses: number = 1): void {
    this.state.waterGlasses = Math.min(12, this.state.waterGlasses + glasses);
    if (this.state.waterGlasses >= this.state.waterTarget) {
      this.completeMission('mission_drink_water');
      this.unlockBadge('badge_hydration_queen');
    }
    this.saveState();
  }

  public completeMission(missionId: string): boolean {
    if (!this.state.completedMissionIds.includes(missionId)) {
      this.state.completedMissionIds.push(missionId);
      const mission = DAILY_MISSIONS_POOL.find((m) => m.id === missionId);
      if (mission) {
        this.addXp(mission.xpReward);
      }
      this.saveState();
      return true;
    }
    return false;
  }

  public canClaimChest(): boolean {
    // Requires all 3 active daily missions
    const activeMissionIds = ['mission_workout_today', 'mission_drink_water', 'mission_mindful_stretch'];
    const allDone = activeMissionIds.every((id) => this.state.completedMissionIds.includes(id));
    return allDone && !this.state.chestClaimedToday;
  }

  public claimChest(): { xpBonus: number; claimed: boolean } {
    if (!this.canClaimChest()) {
      return { xpBonus: 0, claimed: false };
    }
    const bonus = 50;
    this.state.chestClaimedToday = true;
    this.addXp(bonus);
    this.unlockBadge('badge_chest_unlocked');
    this.saveState();
    return { xpBonus: bonus, claimed: true };
  }

  public useStreakShield(): boolean {
    if (this.state.streakShieldAvailable && !this.state.streakShieldUsedThisWeek) {
      this.state.streakShieldUsedThisWeek = true;
      this.state.streakShieldAvailable = false;
      this.unlockBadge('badge_protector_used');
      this.saveState();
      return true;
    }
    return false;
  }

  public recordWorkoutComplete(
    durationMinutes: number,
    workoutCategory?: string
  ): {
    xpEarned: number;
    kmAdded: number;
    newPostcardUnlocked?: string;
    newBadgesUnlocked: string[];
  } {
    const baseWorkoutXp = 60;
    const addedKm = parseFloat((durationMinutes * 0.45).toFixed(1)); // ~4.5 to 6.7 km per 10-15 min session

    this.state.caminoKm = parseFloat((this.state.caminoKm + addedKm).toFixed(1));

    // Update streak and days
    if (!this.state.completedDays.includes(this.state.currentDay)) {
      this.state.completedDays.push(this.state.currentDay);
      this.state.streak += 1;
    }

    // Advance day for next time
    if (this.state.currentDay < 28) {
      this.state.currentDay += 1;
    }

    // Weekly history update (today completed)
    const dayOfWeek = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    this.state.weeklyHistory[dayOfWeek] = true;

    // Check streak protector earning: 3 workouts completed in a week
    const workoutsThisWeek = this.state.weeklyHistory.filter(Boolean).length;
    if (workoutsThisWeek >= 3 && !this.state.streakShieldUsedThisWeek) {
      this.state.streakShieldAvailable = true;
    }

    // Mark daily workout mission
    this.completeMission('mission_workout_today');

    // Add XP
    this.addXp(baseWorkoutXp);

    // Evaluate badges
    const newBadges: string[] = [];
    const checkBadge = (id: string, condition: boolean) => {
      if (condition && this.unlockBadge(id)) {
        newBadges.push(id);
      }
    };

    const totalWorkouts = this.state.completedDays.length;
    checkBadge('badge_first_step', totalWorkouts >= 1);
    checkBadge('badge_streak_3', this.state.streak >= 3);
    checkBadge('badge_streak_7', this.state.streak >= 7);
    checkBadge('badge_streak_14', this.state.streak >= 14);
    checkBadge('badge_streak_28', this.state.streak >= 28);
    checkBadge('badge_workouts_5', totalWorkouts >= 5);
    checkBadge('badge_workouts_10', totalWorkouts >= 10);
    checkBadge('badge_workouts_25', totalWorkouts >= 25);

    // Category badges
    if (workoutCategory === 'pilates_pared') {
      checkBadge('badge_wall_master', true);
    } else if (workoutCategory === 'pilates_silla') {
      checkBadge('badge_chair_master', true);
    } else if (workoutCategory === 'estiramiento') {
      checkBadge('badge_stretch_master', true);
    } else if (workoutCategory === 'yoga_facial') {
      checkBadge('badge_face_yoga_master', true);
    }

    // Check Camino km milestones & postcards
    let unlockedPostcard: string | undefined;
    for (const stage of CAMINO_STAGES) {
      if (this.state.caminoKm >= stage.postcard.kmRequired) {
        if (!this.state.unlockedPostcardIds.includes(stage.postcard.id)) {
          this.state.unlockedPostcardIds.push(stage.postcard.id);
          unlockedPostcard = stage.postcard.id;
        }
      }
    }

    // Camino badges
    checkBadge('badge_camino_15km', this.state.caminoKm >= 15);
    checkBadge('badge_camino_50km', this.state.caminoKm >= 50);
    checkBadge('badge_camino_100km', this.state.caminoKm >= 100);
    checkBadge('badge_camino_250km', this.state.caminoKm >= 250);
    checkBadge('badge_camino_finisher', this.state.caminoKm >= 500);

    // Time of day badges
    const currentHour = new Date().getHours();
    if (currentHour < 9) {
      checkBadge('badge_morning_flow', true);
    } else if (currentHour >= 21) {
      checkBadge('badge_evening_calm', true);
    }

    this.saveState();

    return {
      xpEarned: baseWorkoutXp,
      kmAdded: addedKm,
      newPostcardUnlocked: unlockedPostcard,
      newBadgesUnlocked: newBadges,
    };
  }

  public unlockBadge(badgeId: string): boolean {
    if (!this.state.unlockedBadgeIds.includes(badgeId)) {
      this.state.unlockedBadgeIds.push(badgeId);
      const badge = BADGES_CATALOG.find((b) => b.id === badgeId);
      if (badge) {
        this.addXp(badge.xpReward);
      }
      this.saveState();
      return true;
    }
    return false;
  }

  public getBadgesWithStatus(): Array<BadgeDefinition & { unlocked: boolean }> {
    return BADGES_CATALOG.map((badge) => ({
      ...badge,
      unlocked: this.state.unlockedBadgeIds.includes(badge.id),
    }));
  }

  public getDailyMissions(): Array<DailyMission & { completed: boolean }> {
    const activeMissions = DAILY_MISSIONS_POOL.slice(0, 3);
    return activeMissions.map((m) => ({
      ...m,
      completed: this.state.completedMissionIds.includes(m.id),
    }));
  }
}

export const gamificationService = new GamificationService();
