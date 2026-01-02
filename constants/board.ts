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

// ============================================================
// 모드별 보드 칸 이름 (각 모드에서 해당 카드 제목/핵심가치명으로 표시)
// ============================================================

// 핵심가치 모드용 보드 칸 이름 (핵심가치명으로 표시)
export const CORE_VALUE_BOARD_NAMES: Record<number, string> = {
  // CoreValue 모드 칸 (기존 핵심가치명)
  1: '인재제일',
  4: '최고지향',
  6: '변화선도',
  10: '정도경영',
  13: '상생추구',
  15: '고객 최우선',
  18: '도전적 실행',
  21: '소통과 협력',
  23: '인재 존중',
  26: '글로벌 지향',
  29: '안전',
  // Communication 모드 칸 (나머지 핵심가치 11개 배정)
  3: '윤리',
  5: '창의',
  9: '도전',
  11: '헌신',
  14: '열정',
  17: '정직',
  20: '전문성',
  22: '책임',
  25: '혁신',
  28: '신뢰',
  30: '사회적 책임',
};

// 소통&갈등관리 모드용 보드 칸 이름 (카드 제목과 일치)
export const COMMUNICATION_BOARD_NAMES: Record<number, string> = {
  // Communication 모드 칸 (해당 카드 제목)
  3: '회의 중 폭탄 발언',
  5: '팀장님의 애매한 지시',
  9: '화상회의 리액션',
  11: '후배의 황당한 보고서',
  14: '대선배의 독설',
  17: '묘한 카톡 이모티콘',
  20: '회의실 냉전',
  22: '야근 떠넘기기',
  25: '두 친구의 곤란한 부탁',
  28: '아이디어 도둑',
  30: '무한 업무 폭탄',
  // CoreValue 모드 칸 (나머지 소통 카드 11개 배정)
  1: '저성과자 면담',
  4: '해외팀과의 미묘한 오해',
  6: '동료의 냄새',
  10: '반대하는 임원',
  13: '새 팀의 아웃사이더',
  15: '밤 11시 카톡',
  18: '폭주하는 고객',
  21: '이해 안 되는 결정',
  23: '팀장님의 문제',
  26: '내 실수로 동료가 야근',
  29: '분열된 팀',
};

// 신입직원 모드용 보드 칸 이름 (카드 제목과 일치)
export const NEW_EMPLOYEE_BOARD_NAMES: Record<number, string> = {
  1: '엘리베이터의 함정',
  3: '호칭 대참사',
  4: '비즈니스 캐주얼의 배신',
  5: '9시 00분의 비밀',
  6: '퇴근 눈치 게임',
  9: '전화벨의 공포',
  10: '명함의 굴욕',
  11: '파일명의 재앙',
  13: '복합기 대란',
  14: '회의록 받아쓰기',
  15: '일정 테트리스',
  17: '첨부파일의 배신',
  18: '참조의 비극',
  20: '네, 알겠습니다의 함정',
  21: '중간보고의 실종',
  22: '실수 은폐 작전',
  23: '메신저 대참사',
  25: '질문의 타이밍',
  26: '보고서 포맷의 세계',
  28: '엘리베이터 브리핑',
  29: '선배의 라떼',
  30: '회식 서바이벌',
};
