
// ============================================================
// 핵심가치 & 소통/갈등관리 브루마블 교육게임 타입 정의
// ============================================================

// 핵심가치 모드 22개 역량
export type CoreValueCompetencyType =
  | 'integrity'              // 정직/진실성
  | 'respect'                // 존중
  | 'responsibility'         // 책임감
  | 'trust-building'         // 신뢰 구축
  | 'customer-first'         // 고객 중심
  | 'innovation-spirit'      // 혁신 정신
  | 'excellence'             // 탁월성 추구
  | 'teamwork'               // 팀워크
  | 'ownership'              // 주인의식
  | 'transparency'           // 투명성
  | 'fairness'               // 공정성
  | 'passion'                // 열정
  | 'humility'               // 겸손
  | 'courage'                // 용기
  | 'sustainability'         // 지속가능성
  | 'professionalism'        // 전문성
  | 'adaptability'           // 적응력
  | 'empathy'                // 공감
  | 'accountability'         // 책무성
  | 'collaboration'          // 협업
  | 'safety-first'           // 안전 우선
  | 'continuous-improvement'; // 지속적 개선

// 소통&갈등관리 모드 22개 역량
export type CommunicationCompetencyType =
  | 'active-listening'       // 적극적 경청
  | 'clear-expression'       // 명확한 표현
  | 'nonverbal-comm'         // 비언어적 소통
  | 'feedback-giving'        // 피드백 제공
  | 'feedback-receiving'     // 피드백 수용
  | 'conflict-recognition'   // 갈등 인식
  | 'conflict-resolution'    // 갈등 해결
  | 'negotiation'            // 협상
  | 'mediation'              // 중재
  | 'emotional-intelligence' // 감정 지능
  | 'assertiveness'          // 자기 주장
  | 'diplomacy'              // 외교적 소통
  | 'cross-cultural-comm'    // 다문화 소통
  | 'difficult-conversation' // 어려운 대화
  | 'persuasion'             // 설득
  | 'rapport-building'       // 관계 형성
  | 'boundary-setting'       // 경계 설정
  | 'de-escalation'          // 긴장 완화
  | 'perspective-taking'     // 관점 수용
  | 'constructive-criticism' // 건설적 비판
  | 'apology-forgiveness'    // 사과와 용서
  | 'team-harmony';          // 팀 화합

// 통합 역량 타입
export type CompetencyType = CoreValueCompetencyType | CommunicationCompetencyType;

export enum TeamColor {
  Red = 'Red',
  Blue = 'Blue',
  Green = 'Green',
  Yellow = 'Yellow',
  Purple = 'Purple',
  Orange = 'Orange',
  Pink = 'Pink',
  Teal = 'Teal',
  Cyan = 'Cyan',
  Lime = 'Lime',
  Indigo = 'Indigo',
  Amber = 'Amber',
  Emerald = 'Emerald',
  Slate = 'Slate',
  Rose = 'Rose'
}

// 2가지 게임 모드
export enum GameVersion {
  CoreValue = '핵심가치',
  Communication = '소통&갈등관리'
}

export enum SquareType {
  Start = 'Start',
  City = 'City', // Represents a competency area
  GoldenKey = 'GoldenKey', // 우연한 기회
  Island = 'Island', // Burnout zone (번아웃)
  Space = 'Space', // Challenge (도전 과제)
  WorldTour = 'WorldTour', // 특별 이벤트
  Fund = 'Fund', // 성장 기회
}

export interface ResourceState {
  capital: number;      // 자본 (예산/자원)
  energy: number;       // 에너지 (활력)
  reputation: number;   // 평판
  trust: number;        // 신뢰
  competency: number;   // 역량
  insight: number;      // 통찰력
}

export interface Player {
  id: string;
  name: string;
}

export interface TurnRecord {
  turnNumber: number;
  cardId: string;
  cardTitle: string;
  situation: string;
  choiceId: string;
  choiceText: string;
  reasoning: string;
  aiFeedback: string;
  scoreChanges: Partial<ResourceState>;
  timestamp: number;
  position?: number;  // 해당 턴에서 도착한 보드 위치
}

export interface Team {
  id: string;
  name: string;
  color: TeamColor;
  position: number; // 0 to 31
  resources: ResourceState;
  isBurnout: boolean;
  burnoutCounter: number;
  lapCount: number;
  members: Player[];
  currentMemberIndex: number; // Who rolls next
  history: TurnRecord[]; // Log of all decisions and AI evaluations
}

export interface BoardSquare {
  index: number;
  type: SquareType;
  name: string;
  price?: number;
  module?: 'CoreValue' | 'Communication';  // 모드별 구분
  competency?: CompetencyType; // 칸에 해당하는 역량
  description?: string;
}

export interface Choice {
  id: string;
  text: string;
}

// 카드 타입 정의
export type CardType =
  | 'CoreValue'      // 핵심가치 모드 카드
  | 'Communication'  // 소통&갈등관리 모드 카드
  | 'Event'          // 우연한 기회 이벤트
  | 'Challenge'      // 도전 과제
  | 'Burnout'        // 번아웃
  | 'Growth';        // 성장 기회

export interface GameCard {
  id: string;
  type: CardType;
  competency?: CompetencyType; // 22개 역량 중 하나 (Event/Challenge/Burnout 등은 없음)
  title: string;
  situation: string;
  choices?: Choice[]; // Optional: If undefined/empty, it's an open-ended input
  learningPoint: string;
}

export interface AIEvaluationResult {
  feedback: string;
  scoreChanges: Partial<ResourceState>;
}

export enum GamePhase {
  Setup = 'Setup',
  Lobby = 'Lobby',
  WaitingToStart = 'WaitingToStart',  // 게임 시작 대기 (관리자가 START 누르기 전)
  Idle = 'Idle',
  Rolling = 'Rolling',
  Moving = 'Moving',
  ShowingDiceResult = 'ShowingDiceResult',  // 주사위 결과 표시 중
  ShowingCompetencyCard = 'ShowingCompetencyCard',  // 역량카드 미리보기 표시 중
  Event = 'Event',
  Decision = 'Decision',
  Result = 'Result',
  Paused = 'Paused',  // 게임 일시정지
  End = 'End',
}

export type SessionStatus = 'active' | 'paused' | 'ended';

export interface Session {
  id: string;
  name: string;
  version: GameVersion;
  teamCount: number;
  status: SessionStatus;
  accessCode: string;
  createdAt: number;
  teams: Team[]; // Snapshot of teams in this session
  customCards?: GameCard[];  // 관리자가 수정한 커스텀 카드 (optional)
}

// ============================================================
// 관리자 대시보드 관련 타입
// ============================================================

export interface CardEditHistory {
  cardId: string;
  editedAt: number;
  editedBy: string;
  previousVersion: GameCard;
}

export interface AdminSettings {
  id: string;
  sessionId: string;
  customCards: GameCard[];  // 수정된 카드 목록
  editHistory: CardEditHistory[];  // 수정 이력
  initialResources?: Partial<ResourceState>;  // 커스텀 초기 리소스
  lapBonus?: Partial<ResourceState>;  // 커스텀 한 바퀴 보너스
  doubleBonus?: Partial<ResourceState>;  // 커스텀 더블 보너스
  createdAt: number;
  updatedAt: number;
}

// 역량 정보 (관리자 대시보드용)
export interface CompetencyInfo {
  id: CompetencyType;
  nameKo: string;
  nameEn: string;
  description: string;
  mode: 'CoreValue' | 'Communication';
}
