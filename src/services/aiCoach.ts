export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

export interface AICoachContext {
  userName?: string;
  primaryGoal?: string;
  limitations?: string[];
  currentDay?: number;
  streak?: number;
}

export interface AICoachService {
  sendMessage(message: string, context?: AICoachContext, history?: ChatMessage[]): Promise<string>;
}

export { aiCoachService } from './mock/aiCoachMock';
