import { BoardSquare, SquareType } from '../types';

export const BOARD_SIZE = 32;

// ============================================================
// 보드 구성 - 32칸
// 각 모드별로 11칸씩 역량 칸 배정 (나머지 11개 역량은 반대 모드 칸에서 표시)
// ============================================================
export const BOARD_SQUARES: BoardSquare[] = [
  // Bottom Row (Right to Left) - 0~8
  { index: 0, type: SquareType.Start, name: '출발 (Start)' },
  { index: 1, type: SquareType.City, name: '인재제일', module: 'CoreValue', competency: 'people-first' },
  { index: 2, type: SquareType.GoldenKey, name: '찬스 카드' },
  { index: 3, type: SquareType.City, name: '경청의 기술', module: 'Communication', competency: 'active-listening' },
  { index: 4, type: SquareType.City, name: '최고지향', module: 'CoreValue', competency: 'pursuit-excellence' },
  { index: 5, type: SquareType.City, name: '전달의 기술', module: 'Communication', competency: 'clear-expression' },
  { index: 6, type: SquareType.City, name: '변화선도', module: 'CoreValue', competency: 'leading-change' },
  { index: 7, type: SquareType.GoldenKey, name: '찬스 카드' },
  { index: 8, type: SquareType.Island, name: '번아웃 존' },

  // Left Column (Bottom to Top) - 9~15
  { index: 9, type: SquareType.City, name: '몸으로 말해요', module: 'Communication', competency: 'nonverbal-comm' },
  { index: 10, type: SquareType.City, name: '정도경영', module: 'CoreValue', competency: 'integrity-mgmt' },
  { index: 11, type: SquareType.City, name: '피드백 달인', module: 'Communication', competency: 'feedback-giving' },
  { index: 12, type: SquareType.GoldenKey, name: '찬스 카드' },
  { index: 13, type: SquareType.City, name: '상생추구', module: 'CoreValue', competency: 'win-win' },
  { index: 14, type: SquareType.City, name: '피드백 수용', module: 'Communication', competency: 'feedback-receiving' },
  { index: 15, type: SquareType.City, name: '고객 최우선', module: 'CoreValue', competency: 'customer-first' },

  // Top Row (Left to Right) - 16~23
  { index: 16, type: SquareType.WorldTour, name: '글로벌 기회' },
  { index: 17, type: SquareType.City, name: '갈등 레이더', module: 'Communication', competency: 'conflict-recognition' },
  { index: 18, type: SquareType.City, name: '도전적 실행', module: 'CoreValue', competency: 'challenge-execute' },
  { index: 19, type: SquareType.GoldenKey, name: '찬스 카드' },
  { index: 20, type: SquareType.City, name: '갈등 해결사', module: 'Communication', competency: 'conflict-resolution' },
  { index: 21, type: SquareType.City, name: '소통과 협력', module: 'CoreValue', competency: 'communication-collab' },
  { index: 22, type: SquareType.City, name: '협상의 달인', module: 'Communication', competency: 'negotiation' },
  { index: 23, type: SquareType.City, name: '인재 존중', module: 'CoreValue', competency: 'respect-talent' },

  // Right Column (Top to Bottom) - 24~31
  { index: 24, type: SquareType.Space, name: '도전 과제' },
  { index: 25, type: SquareType.City, name: '중재의 기술', module: 'Communication', competency: 'mediation' },
  { index: 26, type: SquareType.City, name: '글로벌 지향', module: 'CoreValue', competency: 'global-orientation' },
  { index: 27, type: SquareType.Fund, name: '성장 펀드' },
  { index: 28, type: SquareType.City, name: '감정 컨트롤', module: 'Communication', competency: 'emotional-intelligence' },
  { index: 29, type: SquareType.City, name: '안전 제일', module: 'CoreValue', competency: 'safety' },
  { index: 30, type: SquareType.City, name: '당당한 표현', module: 'Communication', competency: 'assertiveness' },
  { index: 31, type: SquareType.GoldenKey, name: '찬스 카드' },
];

// 신입직원 모드용 보드 칸 이름 (같은 인덱스에 다른 이름)
export const NEW_EMPLOYEE_BOARD_NAMES: Record<number, string> = {
  1: '엘리베이터 예절',
  3: '호칭 사용법',
  4: '복장 센스',
  5: '시간 관리',
  6: '퇴근 예절',
  9: '전화 응대',
  10: '명함 교환',
  11: '파일 관리',
  13: '사무기기 활용',
  14: '회의록 작성',
  15: '일정 관리',
  17: '메일 첨부',
  18: '수신/참조',
  20: '업무 확인',
  21: '중간 보고',
  22: '실수 대처',
  23: '메신저 예절',
  25: '질문 타이밍',
  26: '문서 작성',
  28: '구두 보고',
  29: '선배 응대',
  30: '회식 예절',
};
