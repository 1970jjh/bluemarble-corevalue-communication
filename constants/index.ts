import { BoardSquare, GameCard, CompetencyType, ResourceState, SquareType } from '../types';

// ============================================================
// 모든 constants 모듈 re-export
// ============================================================
export { BOARD_SIZE, BOARD_SQUARES, CORE_VALUE_BOARD_NAMES, COMMUNICATION_BOARD_NAMES, NEW_EMPLOYEE_BOARD_NAMES } from './board';
export { COMPETENCY_INFO } from './competencyInfo';
export { CORE_VALUE_CARDS } from './coreValueCards';
export { COMMUNICATION_CARDS } from './communicationCards';
export { NEW_EMPLOYEE_CARDS } from './newEmployeeCards';
export { EVENT_CARDS } from './eventCards';

// 개별 import (내부 사용)
import { BOARD_SQUARES, NEW_EMPLOYEE_BOARD_NAMES, CORE_VALUE_BOARD_NAMES } from './board';
import { CORE_VALUE_CARDS } from './coreValueCards';
import { COMMUNICATION_CARDS } from './communicationCards';
import { NEW_EMPLOYEE_CARDS } from './newEmployeeCards';
import { EVENT_CARDS } from './eventCards';

// ============================================================
// 초기 리소스 및 보너스 설정
// ============================================================
export const INITIAL_RESOURCES: ResourceState = {
  capital: 50,    // 자본 (시작: 50)
  energy: 50,     // 에너지 (시작: 50)
  reputation: 30, // 평판 (시작: 30, 목표: 100)
  trust: 30,      // 신뢰 (시작: 30, 목표: 100)
  competency: 30, // 역량 (시작: 30, 목표: 100)
  insight: 30,    // 통찰력 (시작: 30, 목표: 100)
};

// 한 바퀴 완주 보너스
export const LAP_BONUS: Partial<ResourceState> = {
  energy: 40,
  trust: 10,
  competency: 10,
  insight: 10,
};

// 더블 보너스 (주사위 2개 같은 숫자)
export const DOUBLE_BONUS: Partial<ResourceState> = {
  energy: 5,
  trust: 5,
  competency: 5,
  insight: 5,
};

// ============================================================
// 전체 카드 통합
// ============================================================
export const SAMPLE_CARDS: GameCard[] = [
  ...CORE_VALUE_CARDS,
  ...COMMUNICATION_CARDS,
  ...NEW_EMPLOYEE_CARDS,
  ...EVENT_CARDS,
];

// ============================================================
// 헬퍼 함수들
// ============================================================

// 모드별 카드 필터링
export const getCardsByMode = (mode: 'CoreValue' | 'Communication' | 'NewEmployee'): GameCard[] => {
  let modeCards: GameCard[];
  switch (mode) {
    case 'CoreValue':
      modeCards = CORE_VALUE_CARDS;
      break;
    case 'Communication':
      modeCards = COMMUNICATION_CARDS;
      break;
    case 'NewEmployee':
      modeCards = NEW_EMPLOYEE_CARDS;
      break;
    default:
      modeCards = CORE_VALUE_CARDS;
  }
  return [...modeCards, ...EVENT_CARDS];
};

// 역량별 카드 찾기
export const getCardByCompetency = (
  competency: CompetencyType,
  mode: 'CoreValue' | 'Communication' | 'NewEmployee'
): GameCard | undefined => {
  let cards: GameCard[];
  switch (mode) {
    case 'CoreValue':
      cards = CORE_VALUE_CARDS;
      break;
    case 'Communication':
      cards = COMMUNICATION_CARDS;
      break;
    case 'NewEmployee':
      cards = NEW_EMPLOYEE_CARDS;
      break;
    default:
      cards = CORE_VALUE_CARDS;
  }
  return cards.find(card => card.competency === competency);
};

// 보드 칸에서 역량 카드 가져오기
export const getCardForSquare = (
  square: BoardSquare,
  gameMode: 'CoreValue' | 'Communication' | 'NewEmployee'
): GameCard | undefined => {
  if (!square.competency) return undefined;
  return getCardByCompetency(square.competency, gameMode);
};

// 보드 칸 이름 가져오기 (모드별)
export const getSquareName = (
  squareIndex: number,
  gameMode: 'CoreValue' | 'Communication' | 'NewEmployee'
): string => {
  const square = BOARD_SQUARES.find(s => s.index === squareIndex);
  if (!square) return '';

  // 신입직원 모드일 때 별도 이름 사용
  if (gameMode === 'NewEmployee' && NEW_EMPLOYEE_BOARD_NAMES[squareIndex]) {
    return NEW_EMPLOYEE_BOARD_NAMES[squareIndex];
  }

  return square.name;
};

// 모드별 역량 카드만 가져오기 (이벤트 카드 제외)
export const getCompetencyCardsByMode = (mode: 'CoreValue' | 'Communication' | 'NewEmployee'): GameCard[] => {
  switch (mode) {
    case 'CoreValue':
      return CORE_VALUE_CARDS;
    case 'Communication':
      return COMMUNICATION_CARDS;
    case 'NewEmployee':
      return NEW_EMPLOYEE_CARDS;
    default:
      return CORE_VALUE_CARDS;
  }
};

// 한글 보드 이름에서 competency ID로 매핑 (핵심가치 모드용)
export const KOREAN_TO_COMPETENCY_MAP: Record<string, string> = {
  // 핵심가치 11개 (원래 CoreValue 모드 칸)
  '인재제일': 'people-first',
  '최고지향': 'pursuit-excellence',
  '변화선도': 'leading-change',
  '정도경영': 'integrity-mgmt',
  '상생추구': 'win-win',
  '고객 최우선': 'customer-first',
  '도전적 실행': 'challenge-execute',
  '소통과 협력': 'communication-collab',
  '인재 존중': 'respect-talent',
  '글로벌 지향': 'global-orientation',
  '안전': 'safety',
  // 나머지 핵심가치 11개 (Communication 칸에 배정된 것들)
  '윤리': 'ethics',
  '창의': 'creativity',
  '도전': 'challenge',
  '헌신': 'dedication',
  '열정': 'passion',
  '정직': 'honesty',
  '전문성': 'professionalism',
  '책임': 'responsibility',
  '혁신': 'innovation',
  '신뢰': 'trust',
  '사회적 책임': 'social-responsibility',
};

// 보드 칸의 모드별 competency 가져오기
export const getCompetencyForSquare = (
  squareIndex: number,
  gameMode: 'CoreValue' | 'Communication' | 'NewEmployee'
): string | undefined => {
  const square = BOARD_SQUARES.find(s => s.index === squareIndex);
  if (!square || square.type !== SquareType.City) return undefined;

  // 1. 해당 모드와 칸의 모듈이 일치하면 원래 competency 사용
  if (square.module === gameMode) {
    return square.competency;
  }

  // 2. CoreValue 모드에서 다른 모듈의 칸에 도착한 경우
  if (gameMode === 'CoreValue') {
    const koreanName = CORE_VALUE_BOARD_NAMES[squareIndex];
    if (koreanName) {
      return KOREAN_TO_COMPETENCY_MAP[koreanName] || square.competency;
    }
  }

  // 3. Communication/NewEmployee 모드는 원래 로직 유지
  return square.competency;
};

// 찬스카드 인덱스 순서 (출발선 기준)
export const CHANCE_CARD_SQUARES = [2, 7, 12, 19, 31];

// 찬스카드 타입 판별 (1/3/5번째는 복권 보너스, 2/4번째는 리스크 카드)
export const getChanceCardType = (squareIndex: number): 'lottery' | 'risk' | null => {
  const order = CHANCE_CARD_SQUARES.indexOf(squareIndex);
  if (order === -1) return null;

  // 1번째, 3번째, 5번째 (index 0, 2, 4) → 복권 보너스
  // 2번째, 4번째 (index 1, 3) → 리스크 카드
  return (order % 2 === 0) ? 'lottery' : 'risk';
};

// 팀별 캐릭터 이미지 (8개)
export const CHARACTER_IMAGES = [
  'https://i.ibb.co/RGcCcwBf/1.png',  // 1조
  'https://i.ibb.co/MkKQpP8W/2.png',  // 2조
  'https://i.ibb.co/KpF32MRT/3.png',  // 3조
  'https://i.ibb.co/5XvVbLmQ/4.png',  // 4조
  'https://i.ibb.co/Y43M160r/5.png',  // 5조
  'https://i.ibb.co/hRZ7RJZ4/6.png',  // 6조
  'https://i.ibb.co/BH7hrmDZ/7.png',  // 7조
  'https://i.ibb.co/kgqKfW7Q/8.png',  // 8조
];

// 팀 번호로 캐릭터 이미지 가져오기
export const getCharacterImage = (teamNumber: number): string => {
  const index = (teamNumber - 1) % CHARACTER_IMAGES.length;
  return CHARACTER_IMAGES[index];
};
