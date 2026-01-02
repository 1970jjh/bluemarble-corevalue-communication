import { BoardSquare, GameCard, SquareType, Team, TeamColor, CompetencyType, CompetencyInfo } from './types';

export const BOARD_SIZE = 32;

// ============================================================
// 보드 구성 - 32칸 (핵심가치 11칸 + 소통&갈등관리 11칸 + 특수칸 10칸)
// ============================================================
export const BOARD_SQUARES: BoardSquare[] = [
  // Bottom Row (Right to Left) - 0~8
  { index: 0, type: SquareType.Start, name: '출발 (Start)' },
  { index: 1, type: SquareType.City, name: '정직/진실성 (Integrity)', module: 'CoreValue', competency: 'integrity' },
  { index: 2, type: SquareType.GoldenKey, name: '우연한 기회 (Chance)' },
  { index: 3, type: SquareType.City, name: '적극적 경청 (Active Listening)', module: 'Communication', competency: 'active-listening' },
  { index: 4, type: SquareType.City, name: '존중 (Respect)', module: 'CoreValue', competency: 'respect' },
  { index: 5, type: SquareType.City, name: '명확한 표현 (Clear Expression)', module: 'Communication', competency: 'clear-expression' },
  { index: 6, type: SquareType.City, name: '책임감 (Responsibility)', module: 'CoreValue', competency: 'responsibility' },
  { index: 7, type: SquareType.GoldenKey, name: '우연한 기회 (Chance)' },
  { index: 8, type: SquareType.Island, name: '번아웃 (Burnout)' },

  // Left Column (Bottom to Top) - 9~15
  { index: 9, type: SquareType.City, name: '비언어적 소통 (Nonverbal)', module: 'Communication', competency: 'nonverbal-comm' },
  { index: 10, type: SquareType.City, name: '신뢰 구축 (Trust Building)', module: 'CoreValue', competency: 'trust-building' },
  { index: 11, type: SquareType.City, name: '피드백 제공 (Feedback Giving)', module: 'Communication', competency: 'feedback-giving' },
  { index: 12, type: SquareType.GoldenKey, name: '우연한 기회 (Chance)' },
  { index: 13, type: SquareType.City, name: '고객 중심 (Customer First)', module: 'CoreValue', competency: 'customer-first' },
  { index: 14, type: SquareType.City, name: '피드백 수용 (Feedback Receiving)', module: 'Communication', competency: 'feedback-receiving' },
  { index: 15, type: SquareType.City, name: '혁신 정신 (Innovation)', module: 'CoreValue', competency: 'innovation-spirit' },

  // Top Row (Left to Right) - 16~23
  { index: 16, type: SquareType.WorldTour, name: '성장의 기회 (Growth)' },
  { index: 17, type: SquareType.City, name: '갈등 인식 (Conflict Recognition)', module: 'Communication', competency: 'conflict-recognition' },
  { index: 18, type: SquareType.City, name: '탁월성 (Excellence)', module: 'CoreValue', competency: 'excellence' },
  { index: 19, type: SquareType.GoldenKey, name: '우연한 기회 (Chance)' },
  { index: 20, type: SquareType.City, name: '갈등 해결 (Conflict Resolution)', module: 'Communication', competency: 'conflict-resolution' },
  { index: 21, type: SquareType.City, name: '팀워크 (Teamwork)', module: 'CoreValue', competency: 'teamwork' },
  { index: 22, type: SquareType.City, name: '협상 (Negotiation)', module: 'Communication', competency: 'negotiation' },
  { index: 23, type: SquareType.City, name: '주인의식 (Ownership)', module: 'CoreValue', competency: 'ownership' },

  // Right Column (Top to Bottom) - 24~31
  { index: 24, type: SquareType.Space, name: '도전 과제 (Challenge)' },
  { index: 25, type: SquareType.City, name: '중재 (Mediation)', module: 'Communication', competency: 'mediation' },
  { index: 26, type: SquareType.City, name: '투명성 (Transparency)', module: 'CoreValue', competency: 'transparency' },
  { index: 27, type: SquareType.Fund, name: '성장 펀드 (Growth Fund)' },
  { index: 28, type: SquareType.City, name: '감정 지능 (Emotional Intelligence)', module: 'Communication', competency: 'emotional-intelligence' },
  { index: 29, type: SquareType.City, name: '공정성 (Fairness)', module: 'CoreValue', competency: 'fairness' },
  { index: 30, type: SquareType.City, name: '자기 주장 (Assertiveness)', module: 'Communication', competency: 'assertiveness' },
  { index: 31, type: SquareType.GoldenKey, name: '우연한 기회 (Chance)' },
];

export const INITIAL_RESOURCES = {
  capital: 50,    // 자본 (시작: 50)
  energy: 50,     // 에너지 (시작: 50)
  reputation: 30, // 평판 (시작: 30, 목표: 100)
  trust: 30,      // 신뢰 (시작: 30, 목표: 100)
  competency: 30, // 역량 (시작: 30, 목표: 100)
  insight: 30,    // 통찰력 (시작: 30, 목표: 100)
};

// 한 바퀴 완주 보너스
export const LAP_BONUS = {
  energy: 40,
  trust: 10,
  competency: 10,
  insight: 10,
};

// 더블 보너스 (주사위 2개 같은 숫자)
export const DOUBLE_BONUS = {
  energy: 5,
  trust: 5,
  competency: 5,
  insight: 5,
};

export const INITIAL_TEAMS: Team[] = []; // Initialized dynamically in App.tsx

// ============================================================
// 역량 정보 목록 (관리자 대시보드용)
// ============================================================
export const COMPETENCY_INFO: CompetencyInfo[] = [
  // 핵심가치 모드 22개
  { id: 'integrity', nameKo: '정직/진실성', nameEn: 'Integrity', description: '윤리적 행동과 투명한 소통', mode: 'CoreValue' },
  { id: 'respect', nameKo: '존중', nameEn: 'Respect', description: '타인의 의견과 다양성 존중', mode: 'CoreValue' },
  { id: 'responsibility', nameKo: '책임감', nameEn: 'Responsibility', description: '맡은 일에 대한 책임 완수', mode: 'CoreValue' },
  { id: 'trust-building', nameKo: '신뢰 구축', nameEn: 'Trust Building', description: '일관된 행동으로 신뢰 형성', mode: 'CoreValue' },
  { id: 'customer-first', nameKo: '고객 중심', nameEn: 'Customer First', description: '고객 가치 우선 사고', mode: 'CoreValue' },
  { id: 'innovation-spirit', nameKo: '혁신 정신', nameEn: 'Innovation Spirit', description: '새로운 시도와 개선 추구', mode: 'CoreValue' },
  { id: 'excellence', nameKo: '탁월성 추구', nameEn: 'Excellence', description: '최고 품질을 향한 노력', mode: 'CoreValue' },
  { id: 'teamwork', nameKo: '팀워크', nameEn: 'Teamwork', description: '협력과 시너지 창출', mode: 'CoreValue' },
  { id: 'ownership', nameKo: '주인의식', nameEn: 'Ownership', description: '회사를 내 것처럼 생각하기', mode: 'CoreValue' },
  { id: 'transparency', nameKo: '투명성', nameEn: 'Transparency', description: '정보 공개와 솔직한 공유', mode: 'CoreValue' },
  { id: 'fairness', nameKo: '공정성', nameEn: 'Fairness', description: '공평한 기회와 대우', mode: 'CoreValue' },
  { id: 'passion', nameKo: '열정', nameEn: 'Passion', description: '일에 대한 진정한 열의', mode: 'CoreValue' },
  { id: 'humility', nameKo: '겸손', nameEn: 'Humility', description: '배우려는 자세 유지', mode: 'CoreValue' },
  { id: 'courage', nameKo: '용기', nameEn: 'Courage', description: '어려운 결정을 내리는 담대함', mode: 'CoreValue' },
  { id: 'sustainability', nameKo: '지속가능성', nameEn: 'Sustainability', description: '장기적 관점과 환경 고려', mode: 'CoreValue' },
  { id: 'professionalism', nameKo: '전문성', nameEn: 'Professionalism', description: '전문가다운 태도와 역량', mode: 'CoreValue' },
  { id: 'adaptability', nameKo: '적응력', nameEn: 'Adaptability', description: '변화에 유연하게 대응', mode: 'CoreValue' },
  { id: 'empathy', nameKo: '공감', nameEn: 'Empathy', description: '타인의 입장에서 이해', mode: 'CoreValue' },
  { id: 'accountability', nameKo: '책무성', nameEn: 'Accountability', description: '결과에 대한 책임 인정', mode: 'CoreValue' },
  { id: 'collaboration', nameKo: '협업', nameEn: 'Collaboration', description: '부서간 경계를 넘는 협력', mode: 'CoreValue' },
  { id: 'safety-first', nameKo: '안전 우선', nameEn: 'Safety First', description: '안전을 최우선으로 고려', mode: 'CoreValue' },
  { id: 'continuous-improvement', nameKo: '지속적 개선', nameEn: 'Continuous Improvement', description: '끊임없는 발전 추구', mode: 'CoreValue' },

  // 소통&갈등관리 모드 22개
  { id: 'active-listening', nameKo: '적극적 경청', nameEn: 'Active Listening', description: '상대방 말에 집중하고 이해', mode: 'Communication' },
  { id: 'clear-expression', nameKo: '명확한 표현', nameEn: 'Clear Expression', description: '생각을 분명하게 전달', mode: 'Communication' },
  { id: 'nonverbal-comm', nameKo: '비언어적 소통', nameEn: 'Nonverbal Communication', description: '표정, 몸짓을 통한 소통', mode: 'Communication' },
  { id: 'feedback-giving', nameKo: '피드백 제공', nameEn: 'Feedback Giving', description: '건설적 피드백 전달', mode: 'Communication' },
  { id: 'feedback-receiving', nameKo: '피드백 수용', nameEn: 'Feedback Receiving', description: '피드백을 열린 마음으로 수용', mode: 'Communication' },
  { id: 'conflict-recognition', nameKo: '갈등 인식', nameEn: 'Conflict Recognition', description: '갈등 상황 조기 파악', mode: 'Communication' },
  { id: 'conflict-resolution', nameKo: '갈등 해결', nameEn: 'Conflict Resolution', description: '갈등의 건설적 해결', mode: 'Communication' },
  { id: 'negotiation', nameKo: '협상', nameEn: 'Negotiation', description: '윈-윈 합의점 도출', mode: 'Communication' },
  { id: 'mediation', nameKo: '중재', nameEn: 'Mediation', description: '제3자 입장에서 조정', mode: 'Communication' },
  { id: 'emotional-intelligence', nameKo: '감정 지능', nameEn: 'Emotional Intelligence', description: '감정 인식과 조절', mode: 'Communication' },
  { id: 'assertiveness', nameKo: '자기 주장', nameEn: 'Assertiveness', description: '적절히 자신의 의견 표현', mode: 'Communication' },
  { id: 'diplomacy', nameKo: '외교적 소통', nameEn: 'Diplomacy', description: '민감한 상황에서의 소통', mode: 'Communication' },
  { id: 'cross-cultural-comm', nameKo: '다문화 소통', nameEn: 'Cross-Cultural Communication', description: '문화적 차이 이해하며 소통', mode: 'Communication' },
  { id: 'difficult-conversation', nameKo: '어려운 대화', nameEn: 'Difficult Conversations', description: '민감한 주제 다루기', mode: 'Communication' },
  { id: 'persuasion', nameKo: '설득', nameEn: 'Persuasion', description: '논리와 감성으로 설득', mode: 'Communication' },
  { id: 'rapport-building', nameKo: '관계 형성', nameEn: 'Rapport Building', description: '친밀감과 신뢰 구축', mode: 'Communication' },
  { id: 'boundary-setting', nameKo: '경계 설정', nameEn: 'Boundary Setting', description: '건강한 관계 경계 유지', mode: 'Communication' },
  { id: 'de-escalation', nameKo: '긴장 완화', nameEn: 'De-escalation', description: '고조된 감정 진정시키기', mode: 'Communication' },
  { id: 'perspective-taking', nameKo: '관점 수용', nameEn: 'Perspective Taking', description: '다양한 시각에서 바라보기', mode: 'Communication' },
  { id: 'constructive-criticism', nameKo: '건설적 비판', nameEn: 'Constructive Criticism', description: '발전적 비판 제시', mode: 'Communication' },
  { id: 'apology-forgiveness', nameKo: '사과와 용서', nameEn: 'Apology & Forgiveness', description: '진정한 사과와 용서', mode: 'Communication' },
  { id: 'team-harmony', nameKo: '팀 화합', nameEn: 'Team Harmony', description: '팀 분위기 조성', mode: 'Communication' },
];

// ============================================================
// 핵심가치 모드 카드 (22개)
// ============================================================
export const CORE_VALUE_CARDS: GameCard[] = [
  // CV-INT-001: 정직/진실성 (Integrity)
  {
    id: 'CV-INT-001',
    type: 'CoreValue',
    competency: 'integrity',
    title: '보고서의 진실',
    situation: '프로젝트 성과 보고서를 작성하는 중입니다. 실제 수치는 목표의 85%를 달성했지만, 팀장님은 "90% 이상으로 보이게 작성해라"고 합니다. 경영진 보고 자리라 좋은 인상을 주고 싶은 마음도 이해됩니다.',
    learningPoint: '단기적 이익보다 장기적 신뢰가 중요하며, 정직한 보고가 조직의 건강한 의사결정을 돕는다',
    choices: [
      { id: 'A', text: '팀장님 지시대로 90%로 수정한다. 상사 지시를 따르는 것도 조직생활의 일부다.' },
      { id: 'B', text: '85% 실제 수치로 보고하되, 미달 원인과 개선 계획을 함께 제시한다.' },
      { id: 'C', text: '팀장님께 정직한 보고의 중요성을 말씀드리고, 함께 해결책을 논의한다.' },
    ],
  },

  // CV-RSP-001: 존중 (Respect)
  {
    id: 'CV-RSP-001',
    type: 'CoreValue',
    competency: 'respect',
    title: '다른 의견 앞에서',
    situation: '팀 회의에서 신입사원이 기존 방식과 전혀 다른 아이디어를 제안했습니다. 경험상 실현 가능성이 낮아 보이고, 다른 선배들도 "그건 안 돼"라는 표정입니다. 하지만 신입사원은 열정적으로 설명하고 있습니다.',
    learningPoint: '경험과 직급에 관계없이 모든 의견을 존중하고 경청하는 문화가 혁신을 만든다',
    choices: [
      { id: 'A', text: '"좋은 시도지만 현실적으로 어려워"라고 솔직하게 말해준다. 시간 낭비를 줄여야 한다.' },
      { id: 'B', text: '끝까지 경청한 후 "어떤 점에서 그렇게 생각했는지 더 들어볼까요?"라고 질문한다.' },
      { id: 'C', text: '일단 회의에서는 넘어가고, 나중에 개인적으로 조언해준다.' },
    ],
  },

  // CV-RES-001: 책임감 (Responsibility)
  {
    id: 'CV-RES-001',
    type: 'CoreValue',
    competency: 'responsibility',
    title: '마감 전날의 선택',
    situation: '내일이 중요한 프로젝트 마감일입니다. 오늘 퇴근 후 가족 모임이 있는데, 아직 완성도가 70% 정도입니다. "대충 마무리해도 되지 않을까?" 하는 생각과 "끝까지 책임져야지"라는 생각이 충돌합니다.',
    learningPoint: '맡은 일에 대한 책임감은 개인의 신뢰도와 팀 전체의 성과에 직결된다',
    choices: [
      { id: 'A', text: '70% 수준으로 제출하고 가족 모임에 참석한다. 워라밸도 중요하다.' },
      { id: 'B', text: '가족 모임을 조정하고 야근해서 100% 완성한다. 약속한 품질을 지켜야 한다.' },
      { id: 'C', text: '팀장님께 솔직히 상황을 공유하고, 마감 연장 또는 협업 가능성을 논의한다.' },
    ],
  },

  // CV-TRU-001: 신뢰 구축 (Trust Building)
  {
    id: 'CV-TRU-001',
    type: 'CoreValue',
    competency: 'trust-building',
    title: '약속의 무게',
    situation: '동료에게 "내일까지 자료 보내줄게"라고 약속했는데, 급한 업무가 생겨 지키기 어려울 것 같습니다. 동료는 그 자료로 다음 작업을 준비하고 있습니다.',
    learningPoint: '작은 약속을 지키는 것이 큰 신뢰를 쌓는 기초가 된다',
    choices: [
      { id: 'A', text: '일단 내일까지 기다려보고, 안 되면 그때 양해를 구한다.' },
      { id: 'B', text: '지금 바로 동료에게 상황을 설명하고 새로운 일정을 협의한다.' },
      { id: 'C', text: '다른 업무를 미루더라도 약속을 지킨다. 신뢰가 최우선이다.' },
    ],
  },

  // CV-CUS-001: 고객 중심 (Customer First)
  {
    id: 'CV-CUS-001',
    type: 'CoreValue',
    competency: 'customer-first',
    title: '고객의 불만',
    situation: '고객이 제품 결함으로 강하게 항의하고 있습니다. 조사 결과 고객의 사용 방법에도 문제가 있었지만, 제품 설명서가 불친절했던 것도 사실입니다. 책임 소재가 애매합니다.',
    learningPoint: '고객 관점에서 생각하고, 문제 해결에 집중하는 것이 진정한 고객 중심이다',
    choices: [
      { id: 'A', text: '사용 방법 문제를 설명하고, 올바른 사용법을 안내한다.' },
      { id: 'B', text: '먼저 불편을 드린 점 사과하고, 설명서 개선과 함께 보상을 제안한다.' },
      { id: 'C', text: '규정대로 처리하되, 고객 의견을 품질 개선에 반영하겠다고 약속한다.' },
    ],
  },

  // CV-INN-001: 혁신 정신 (Innovation Spirit)
  {
    id: 'CV-INN-001',
    type: 'CoreValue',
    competency: 'innovation-spirit',
    title: '익숙함 vs 새로움',
    situation: '10년간 사용해온 업무 프로세스가 있습니다. 새로운 방식을 도입하면 효율이 30% 높아질 것 같지만, 전환 과정에서 혼란과 저항이 예상됩니다. 현재 방식도 "문제없이" 돌아가고 있습니다.',
    learningPoint: '현재에 안주하지 않고 더 나은 방법을 찾는 것이 혁신의 시작이다',
    choices: [
      { id: 'A', text: '잘 돌아가는 것을 굳이 바꿀 필요 없다. 안정성이 중요하다.' },
      { id: 'B', text: '소규모 파일럿으로 새 방식을 테스트하고, 결과를 바탕으로 확대 여부를 결정한다.' },
      { id: 'C', text: '전사적으로 새 방식을 도입하고, 변화 관리에 집중한다. 혁신은 과감해야 한다.' },
    ],
  },

  // CV-EXC-001: 탁월성 추구 (Excellence)
  {
    id: 'CV-EXC-001',
    type: 'CoreValue',
    competency: 'excellence',
    title: '90점 vs 100점',
    situation: '보고서를 완성했습니다. 90점 수준이면 무난히 통과하겠지만, 조금 더 시간을 투자하면 100점짜리를 만들 수 있을 것 같습니다. 하지만 다음 업무도 기다리고 있습니다.',
    learningPoint: '탁월함은 매번 조금씩 더 나아지려는 노력의 축적이다',
    choices: [
      { id: 'A', text: '90점이면 충분하다. 효율적으로 일하고 다음 업무로 넘어간다.' },
      { id: 'B', text: '핵심 부분만 보완해서 95점 수준으로 제출한다. 균형이 중요하다.' },
      { id: 'C', text: '100점을 위해 추가 시간을 투자한다. 내 이름이 걸린 결과물이다.' },
    ],
  },

  // CV-TEA-001: 팀워크 (Teamwork)
  {
    id: 'CV-TEA-001',
    type: 'CoreValue',
    competency: 'teamwork',
    title: '혼자 vs 함께',
    situation: '당신이 맡은 업무를 혼자 처리하면 빠르게 끝낼 수 있습니다. 하지만 팀원들과 나누어 하면 시간은 더 걸리겠지만, 팀 역량이 함께 성장할 수 있습니다.',
    learningPoint: '단기 효율보다 장기적 팀 역량 강화가 조직의 지속 성장을 만든다',
    choices: [
      { id: 'A', text: '효율을 위해 혼자 빠르게 처리한다. 시간이 곧 비용이다.' },
      { id: 'B', text: '팀원들과 역할을 나누고, 진행하면서 코칭도 병행한다.' },
      { id: 'C', text: '이번에는 혼자 하고, 다음에 여유 있을 때 팀원들을 교육한다.' },
    ],
  },

  // CV-OWN-001: 주인의식 (Ownership)
  {
    id: 'CV-OWN-001',
    type: 'CoreValue',
    competency: 'ownership',
    title: '내 일 vs 남의 일',
    situation: '복도에서 쓰레기가 떨어져 있는 것을 발견했습니다. 청소 담당자의 업무이지만, 지금 지나가는 사람은 당신뿐입니다. 곧 중요한 고객이 방문할 예정입니다.',
    learningPoint: '회사의 모든 일을 내 일처럼 생각하는 것이 진정한 주인의식이다',
    choices: [
      { id: 'A', text: '청소 담당자에게 연락해서 처리를 요청한다. 역할 분담이 중요하다.' },
      { id: 'B', text: '직접 주워서 쓰레기통에 버린다. 회사 이미지는 모두의 책임이다.' },
      { id: 'C', text: '고객 방문 전이니 일단 치우고, 나중에 청소 담당자에게 알린다.' },
    ],
  },

  // CV-TRA-001: 투명성 (Transparency)
  {
    id: 'CV-TRA-001',
    type: 'CoreValue',
    competency: 'transparency',
    title: '불편한 진실',
    situation: '프로젝트에 심각한 리스크가 발견되었습니다. 경영진에게 보고하면 프로젝트가 중단될 수 있고, 팀에게도 부담이 됩니다. 하지만 숨기면 나중에 더 큰 문제가 될 수 있습니다.',
    learningPoint: '불편하더라도 진실을 공유하는 것이 장기적으로 조직을 건강하게 만든다',
    choices: [
      { id: 'A', text: '일단 팀 내에서 해결을 시도하고, 안 되면 그때 보고한다.' },
      { id: 'B', text: '즉시 경영진에게 리스크와 대응 방안을 함께 보고한다.' },
      { id: 'C', text: '리스크 수준을 낮춰서 보고한다. 불필요한 혼란을 줄여야 한다.' },
    ],
  },

  // CV-FAI-001: 공정성 (Fairness)
  {
    id: 'CV-FAI-001',
    type: 'CoreValue',
    competency: 'fairness',
    title: '평가의 기준',
    situation: '팀원 평가 시즌입니다. A는 성과는 보통이지만 당신과 친한 사이이고, B는 성과가 뛰어나지만 가끔 의견 충돌이 있었습니다. 둘 중 한 명만 승진 추천할 수 있습니다.',
    learningPoint: '개인적 관계가 아닌 객관적 기준으로 평가하는 것이 조직의 공정성을 지킨다',
    choices: [
      { id: 'A', text: 'A를 추천한다. 관계도 업무의 일부이고, 협업이 잘 되는 사람이 중요하다.' },
      { id: 'B', text: 'B를 추천한다. 성과가 명확한 기준이 되어야 한다.' },
      { id: 'C', text: '두 사람의 강점을 정리해서 상위 결정권자에게 판단을 맡긴다.' },
    ],
  },

  // CV-PAS-001: 열정 (Passion)
  {
    id: 'CV-PAS-001',
    type: 'CoreValue',
    competency: 'passion',
    title: '열정의 온도',
    situation: '입사 3년차, 업무가 반복적으로 느껴지고 초심의 열정이 식어가는 것을 느낍니다. 월급은 꼬박꼬박 나오고, 굳이 더 열심히 할 이유를 못 찾겠습니다.',
    learningPoint: '열정은 저절로 생기는 것이 아니라 스스로 의미를 찾고 만들어가는 것이다',
    choices: [
      { id: 'A', text: '원래 직장이 이런 거다. 적당히 하면서 개인 시간을 확보한다.' },
      { id: 'B', text: '새로운 도전 과제를 찾거나, 업무에서 의미를 재발견하려 노력한다.' },
      { id: 'C', text: '열정을 되찾을 수 있는 다른 직장이나 업무를 알아본다.' },
    ],
  },

  // CV-HUM-001: 겸손 (Humility)
  {
    id: 'CV-HUM-001',
    type: 'CoreValue',
    competency: 'humility',
    title: '성공 후의 태도',
    situation: '당신이 주도한 프로젝트가 대성공을 거두었습니다. 임원진 앞에서 발표할 기회가 생겼는데, 사실 팀원들의 기여도 컸습니다. 이 자리에서 어떻게 이야기할까요?',
    learningPoint: '성공을 나눌 줄 아는 겸손함이 더 큰 성공을 만드는 팀을 만든다',
    choices: [
      { id: 'A', text: '내가 리드한 것은 사실이니, 리더십을 어필하는 기회로 삼는다.' },
      { id: 'B', text: '팀원들의 기여를 구체적으로 언급하며 함께 이룬 성과임을 강조한다.' },
      { id: 'C', text: '적당히 팀 노력을 언급하되, 핵심 역할은 내가 했음을 분명히 한다.' },
    ],
  },

  // CV-COU-001: 용기 (Courage)
  {
    id: 'CV-COU-001',
    type: 'CoreValue',
    competency: 'courage',
    title: '반대 의견',
    situation: '팀 회의에서 팀장님이 제안한 방향에 모두가 동의하고 있습니다. 하지만 당신은 심각한 문제점을 발견했습니다. 분위기상 반대 의견을 내기가 어렵습니다.',
    learningPoint: '불편하더라도 옳은 말을 하는 용기가 조직을 더 나은 방향으로 이끈다',
    choices: [
      { id: 'A', text: '분위기를 읽고 일단 동의한다. 나중에 개인적으로 말씀드린다.' },
      { id: 'B', text: '회의에서 우려 사항을 조심스럽게 제기한다. 다른 관점이 필요할 수 있다.' },
      { id: 'C', text: '회의 후 메일로 의견을 정리해서 팀장님께만 전달한다.' },
    ],
  },

  // CV-SUS-001: 지속가능성 (Sustainability)
  {
    id: 'CV-SUS-001',
    type: 'CoreValue',
    competency: 'sustainability',
    title: '단기 이익 vs 장기 가치',
    situation: '비용을 줄이면 올해 실적은 좋아지지만, 환경에 해로운 방식입니다. 친환경 방식은 비용이 더 들지만 장기적으로 브랜드 이미지와 규제 대응에 유리합니다.',
    learningPoint: '지속가능한 방식이 결국 조직의 장기 경쟁력을 만든다',
    choices: [
      { id: 'A', text: '올해 실적이 급하니 일단 비용 절감을 선택한다. 생존이 먼저다.' },
      { id: 'B', text: '친환경 방식을 선택하고, 장기 가치를 경영진에게 설득한다.' },
      { id: 'C', text: '절충안을 찾아 점진적으로 친환경 방식으로 전환한다.' },
    ],
  },

  // CV-PRO-001: 전문성 (Professionalism)
  {
    id: 'CV-PRO-001',
    type: 'CoreValue',
    competency: 'professionalism',
    title: '모르는 것 앞에서',
    situation: '클라이언트가 당신의 전문 분야에서 질문을 했는데, 정확히 모르는 내용입니다. 대충 아는 것처럼 답하면 넘어갈 수 있지만, 틀린 정보일 수도 있습니다.',
    learningPoint: '모르는 것을 인정하고 정확한 답을 찾아주는 것이 진정한 전문가의 태도다',
    choices: [
      { id: 'A', text: '아는 범위에서 답변하고 넘어간다. 전문가가 모르면 신뢰가 떨어진다.' },
      { id: 'B', text: '"정확히 확인 후 답변드리겠습니다"라고 하고, 빠르게 조사해서 회신한다.' },
      { id: 'C', text: '관련 전문가를 연결해준다. 정확한 정보 전달이 최우선이다.' },
    ],
  },

  // CV-ADA-001: 적응력 (Adaptability)
  {
    id: 'CV-ADA-001',
    type: 'CoreValue',
    competency: 'adaptability',
    title: '갑작스러운 변화',
    situation: '진행 중인 프로젝트의 방향이 경영진 결정으로 180도 바뀌었습니다. 지금까지 한 작업의 상당 부분이 무용지물이 되었고, 팀원들의 사기도 떨어졌습니다.',
    learningPoint: '변화에 저항하기보다 빠르게 적응하는 것이 경쟁력이다',
    choices: [
      { id: 'A', text: '왜 이런 결정이 났는지 따지고, 기존 방향 유지를 건의한다.' },
      { id: 'B', text: '변화를 수용하고, 팀원들과 함께 새 방향에 맞춰 빠르게 재정비한다.' },
      { id: 'C', text: '일단 따르되, 기존 작업물 중 활용 가능한 것을 최대한 살린다.' },
    ],
  },

  // CV-EMP-001: 공감 (Empathy)
  {
    id: 'CV-EMP-001',
    type: 'CoreValue',
    competency: 'empathy',
    title: '동료의 어려움',
    situation: '같은 팀 동료가 요즘 업무 실수가 잦고 지쳐 보입니다. 알고 보니 가정에 어려운 일이 생겼다고 합니다. 하지만 팀 전체 업무량은 변함없고, 마감은 다가옵니다.',
    learningPoint: '동료의 입장을 이해하고 도움을 주는 것이 건강한 조직문화를 만든다',
    choices: [
      { id: 'A', text: '개인 사정과 업무는 분리해야 한다. 각자 맡은 일은 해야 한다.' },
      { id: 'B', text: '당분간 내가 일부 업무를 대신 맡고, 팀장님께도 상황을 공유한다.' },
      { id: 'C', text: '개인적으로 격려해주되, 업무 조정은 팀장님의 판단에 맡긴다.' },
    ],
  },

  // CV-ACC-001: 책무성 (Accountability)
  {
    id: 'CV-ACC-001',
    type: 'CoreValue',
    competency: 'accountability',
    title: '실패의 책임',
    situation: '팀 프로젝트가 실패했습니다. 여러 원인이 있지만, 당신이 담당한 부분에서도 문제가 있었습니다. 경영진 앞에서 실패 원인을 보고해야 합니다.',
    learningPoint: '자신의 책임을 인정하는 것이 신뢰를 쌓고 같은 실수를 반복하지 않게 한다',
    choices: [
      { id: 'A', text: '여러 복합적 원인을 설명하며, 특정인의 책임은 명시하지 않는다.' },
      { id: 'B', text: '내 담당 부분의 문제를 먼저 인정하고, 개선 방안을 제시한다.' },
      { id: 'C', text: '외부 요인과 다른 부서의 협조 부족을 주 원인으로 보고한다.' },
    ],
  },

  // CV-COL-001: 협업 (Collaboration)
  {
    id: 'CV-COL-001',
    type: 'CoreValue',
    competency: 'collaboration',
    title: '부서 간 벽',
    situation: '프로젝트 성공을 위해 타 부서의 협조가 필요합니다. 하지만 그 부서는 자기 일도 바쁘고, 협조 요청에 소극적입니다. "그건 니네 부서 일이잖아"라는 반응입니다.',
    learningPoint: '부서의 벽을 넘어 협업하는 것이 조직 전체의 성과를 높인다',
    choices: [
      { id: 'A', text: '상위 리더에게 요청해서 공식적인 협조 지시를 받아낸다.' },
      { id: 'B', text: '그 부서의 입장과 이해관계를 파악해서 윈-윈 포인트를 찾아 제안한다.' },
      { id: 'C', text: '최대한 우리 부서 내에서 해결하고, 꼭 필요한 것만 요청한다.' },
    ],
  },

  // CV-SAF-001: 안전 우선 (Safety First)
  {
    id: 'CV-SAF-001',
    type: 'CoreValue',
    competency: 'safety-first',
    title: '마감 vs 안전',
    situation: '공사 현장에서 안전 점검을 하다가 사소한 위험 요소를 발견했습니다. 당장 문제가 될 가능성은 낮지만, 방치하면 사고로 이어질 수 있습니다. 하지만 점검을 중단하면 공사 일정이 지연됩니다.',
    learningPoint: '어떤 상황에서도 안전은 타협의 대상이 아니다',
    choices: [
      { id: 'A', text: '사소한 문제니 기록만 해두고 공사를 계속한다. 일정이 중요하다.' },
      { id: 'B', text: '즉시 공사를 중단하고 안전 조치를 완료한 후 재개한다.' },
      { id: 'C', text: '안전 담당자에게 보고하고, 그 판단에 따른다.' },
    ],
  },

  // CV-CON-001: 지속적 개선 (Continuous Improvement)
  {
    id: 'CV-CON-001',
    type: 'CoreValue',
    competency: 'continuous-improvement',
    title: '개선의 여지',
    situation: '업무 프로세스에서 비효율적인 부분을 발견했습니다. 개선하면 좋겠지만, 현재 방식도 "문제없이" 돌아가고 있고, 변경하려면 여러 사람의 동의가 필요합니다.',
    learningPoint: '작은 개선의 축적이 큰 혁신을 만든다',
    choices: [
      { id: 'A', text: '잘 돌아가는 것을 굳이 건드리지 않는다. 괜히 일만 늘어난다.' },
      { id: 'B', text: '개선 아이디어를 정리해서 팀에 제안하고, 함께 검토한다.' },
      { id: 'C', text: '내 업무 범위에서만 조용히 개선해서 적용한다.' },
    ],
  },
];

// ============================================================
// 소통&갈등관리 모드 카드 (22개)
// ============================================================
export const COMMUNICATION_CARDS: GameCard[] = [
  // CM-AL-001: 적극적 경청 (Active Listening)
  {
    id: 'CM-AL-001',
    type: 'Communication',
    competency: 'active-listening',
    title: '말 속의 진심',
    situation: '팀원이 "괜찮아요, 제가 할게요"라고 말했지만, 표정이 어둡고 목소리에 힘이 없습니다. 업무가 과중해 보이지만, 본인은 괜찮다고 합니다.',
    learningPoint: '말뿐 아니라 비언어적 신호까지 읽는 것이 진정한 경청이다',
    choices: [
      { id: 'A', text: '본인이 괜찮다고 하니 맡긴다. 자기 판단을 존중해야 한다.' },
      { id: 'B', text: '"정말 괜찮아? 혹시 부담되면 솔직히 말해줘"라고 다시 확인한다.' },
      { id: 'C', text: '업무량을 체크하고, 필요하면 조정을 제안한다.' },
    ],
  },

  // CM-CE-001: 명확한 표현 (Clear Expression)
  {
    id: 'CM-CE-001',
    type: 'Communication',
    competency: 'clear-expression',
    title: '오해의 시작',
    situation: '이메일로 업무 지시를 했는데, 팀원이 전혀 다른 방향으로 작업을 진행했습니다. "제가 말한 건 그게 아닌데..."라는 생각이 들지만, 다시 보니 메일 내용이 모호했습니다.',
    learningPoint: '명확한 표현은 소통 비용을 줄이고 업무 효율을 높인다',
    choices: [
      { id: 'A', text: '팀원에게 다시 설명하고, 수정을 요청한다.' },
      { id: 'B', text: '내 표현이 불명확했음을 인정하고, 앞으로 더 구체적으로 작성하겠다고 한다.' },
      { id: 'C', text: '중요한 지시는 메일 후 구두로도 확인하는 프로세스를 만든다.' },
    ],
  },

  // CM-NV-001: 비언어적 소통 (Nonverbal Communication)
  {
    id: 'CM-NV-001',
    type: 'Communication',
    competency: 'nonverbal-comm',
    title: '말보다 강한 것',
    situation: '화상 회의 중 중요한 제안을 하고 있는데, 팀장님이 계속 다른 곳을 보고, 표정이 무관심해 보입니다. 말로는 "계속해봐"라고 하지만 집중하지 않는 것 같습니다.',
    learningPoint: '비언어적 신호는 때로 말보다 더 많은 것을 전달한다',
    choices: [
      { id: 'A', text: '발표를 계속한다. 내용으로 승부해야 한다.' },
      { id: 'B', text: '"혹시 지금 다른 급한 일이 있으신가요? 나중에 다시 말씀드릴까요?"라고 확인한다.' },
      { id: 'C', text: '핵심만 빠르게 요약하고 마무리한다.' },
    ],
  },

  // CM-FG-001: 피드백 제공 (Feedback Giving)
  {
    id: 'CM-FG-001',
    type: 'Communication',
    competency: 'feedback-giving',
    title: '성장을 위한 말',
    situation: '후배의 보고서에 여러 문제점이 있습니다. 직접적으로 지적하면 기분 나빠할 것 같고, 넘어가면 발전이 없을 것 같습니다.',
    learningPoint: '건설적인 피드백은 상대방의 성장을 돕는 선물이다',
    choices: [
      { id: 'A', text: '문제점을 명확히 지적한다. 명확한 피드백이 성장에 도움이 된다.' },
      { id: 'B', text: '잘한 점을 먼저 말하고, 개선점은 질문 형식으로 유도한다.' },
      { id: 'C', text: '시간이 지나면 자연스럽게 알게 될 테니 넘어간다.' },
    ],
  },

  // CM-FR-001: 피드백 수용 (Feedback Receiving)
  {
    id: 'CM-FR-001',
    type: 'Communication',
    competency: 'feedback-receiving',
    title: '불편한 지적',
    situation: '상사가 당신의 발표 스타일에 대해 "딱딱하고 지루하다"고 직접적으로 피드백했습니다. 나름 준비를 많이 했는데, 기분이 상하고 억울합니다.',
    learningPoint: '불편한 피드백에서 성장의 기회를 찾는 것이 프로페셔널이다',
    choices: [
      { id: 'A', text: '"준비를 많이 했는데요"라고 내 입장을 설명한다.' },
      { id: 'B', text: '"구체적으로 어떤 부분이 그랬는지 알려주시면 개선하겠습니다"라고 질문한다.' },
      { id: 'C', text: '일단 "알겠습니다"하고, 나중에 혼자 곱씹어본다.' },
    ],
  },

  // CM-CR-001: 갈등 인식 (Conflict Recognition)
  {
    id: 'CM-CR-001',
    type: 'Communication',
    competency: 'conflict-recognition',
    title: '수면 아래의 긴장',
    situation: '최근 두 팀원 사이가 어색합니다. 대화도 줄었고, 회의에서 서로의 의견에 미묘하게 반박합니다. 직접적인 다툼은 없지만 뭔가 불편한 기류가 감지됩니다.',
    learningPoint: '갈등의 징후를 조기에 인식하는 것이 확대 방지의 첫걸음이다',
    choices: [
      { id: 'A', text: '직접적인 문제가 없으니 지켜본다. 어른들이 알아서 해결할 것이다.' },
      { id: 'B', text: '개별적으로 만나 "요즘 어때?"라고 자연스럽게 상황을 파악한다.' },
      { id: 'C', text: '팀 회식이나 활동을 제안해서 분위기를 풀어본다.' },
    ],
  },

  // CM-CRS-001: 갈등 해결 (Conflict Resolution)
  {
    id: 'CM-CRS-001',
    type: 'Communication',
    competency: 'conflict-resolution',
    title: '부딪힌 의견',
    situation: '두 팀원이 프로젝트 방향을 두고 심하게 대립하고 있습니다. 각자 자기 방식이 옳다고 주장하며 한 발짝도 양보하지 않습니다. 팀 분위기가 냉랭해졌습니다.',
    learningPoint: '갈등 해결의 핵심은 입장이 아닌 이해관계와 공동 목표에 집중하는 것이다',
    choices: [
      { id: 'A', text: '상위 결정권자에게 판단을 요청한다. 시간이 없다.' },
      { id: 'B', text: '두 사람을 모아놓고 "우리 공동의 목표가 뭐였지?"부터 다시 시작한다.' },
      { id: 'C', text: '각각의 방식을 일부씩 채택하는 절충안을 제안한다.' },
    ],
  },

  // CM-NEG-001: 협상 (Negotiation)
  {
    id: 'CM-NEG-001',
    type: 'Communication',
    competency: 'negotiation',
    title: '양보의 기술',
    situation: '협력업체와 계약 조건을 협상 중입니다. 우리는 가격 인하를, 상대는 계약 기간 연장을 원합니다. 서로 자기 조건만 고집하면 협상이 결렬될 수 있습니다.',
    learningPoint: '성공적인 협상은 제로섬이 아닌 윈-윈 포인트를 찾는 것이다',
    choices: [
      { id: 'A', text: '우리 조건을 강하게 밀어붙인다. 협상은 힘싸움이다.' },
      { id: 'B', text: '상대방의 우선순위를 파악하고, 서로 윈-윈할 수 있는 패키지를 제안한다.' },
      { id: 'C', text: '일단 이번에는 양보하고, 다음 기회에 우리 조건을 관철시킨다.' },
    ],
  },

  // CM-MED-001: 중재 (Mediation)
  {
    id: 'CM-MED-001',
    type: 'Communication',
    competency: 'mediation',
    title: '사이에 선 사람',
    situation: '친한 두 동료가 업무 문제로 갈등이 생겼고, 둘 다 당신에게 하소연하며 편을 들어달라고 합니다. 중립을 지키면 둘 다 서운해할 것 같습니다.',
    learningPoint: '효과적인 중재는 어느 한쪽 편이 아닌 문제 해결에 집중하는 것이다',
    choices: [
      { id: 'A', text: '내 판단에 더 옳은 쪽의 편을 든다. 진정한 친구는 솔직해야 한다.' },
      { id: 'B', text: '양쪽 얘기를 다 듣고, 직접 대화할 수 있는 자리를 마련한다.' },
      { id: 'C', text: '둘 사이 문제에서 빠진다. 개입하면 더 복잡해질 수 있다.' },
    ],
  },

  // CM-EI-001: 감정 지능 (Emotional Intelligence)
  {
    id: 'CM-EI-001',
    type: 'Communication',
    competency: 'emotional-intelligence',
    title: '화가 날 때',
    situation: '회의에서 동료가 당신의 아이디어를 자기 것처럼 발표했습니다. 순간 화가 치밀어 오르고 당장 지적하고 싶습니다. 하지만 회의에는 경영진도 있습니다.',
    learningPoint: '감정을 인식하고 적절히 조절하는 것이 프로페셔널한 대응의 기본이다',
    choices: [
      { id: 'A', text: '"그건 제 아이디어인데요"라고 즉시 지적한다. 사실을 바로잡아야 한다.' },
      { id: 'B', text: '일단 감정을 가라앉히고, 회의 후 개인적으로 그 동료와 이야기한다.' },
      { id: 'C', text: '넘어가고, 다음에 비슷한 일이 없도록 아이디어를 미리 문서화한다.' },
    ],
  },

  // CM-AST-001: 자기 주장 (Assertiveness)
  {
    id: 'CM-AST-001',
    type: 'Communication',
    competency: 'assertiveness',
    title: '거절의 어려움',
    situation: '이미 업무가 과중한 상태에서 상사가 추가 업무를 요청합니다. 거절하면 열정이 없어 보일까 걱정되지만, 수락하면 모든 업무의 품질이 떨어질 것 같습니다.',
    learningPoint: '적절한 자기 주장은 자신과 조직 모두를 위한 것이다',
    choices: [
      { id: 'A', text: '일단 수락한다. 어떻게든 해내면 된다.' },
      { id: 'B', text: '현재 업무 상황을 공유하고, 우선순위 조정을 요청한다.' },
      { id: 'C', text: '"해보겠습니다"라고 하되, 마감은 여유있게 협의한다.' },
    ],
  },

  // CM-DIP-001: 외교적 소통 (Diplomacy)
  {
    id: 'CM-DIP-001',
    type: 'Communication',
    competency: 'diplomacy',
    title: '민감한 메시지',
    situation: '실적이 저조한 팀원에게 경고 메시지를 전해야 합니다. 너무 직접적으로 말하면 상처받을 수 있고, 너무 돌려 말하면 심각성이 전달되지 않을 수 있습니다.',
    learningPoint: '민감한 메시지일수록 전달 방식이 중요하다',
    choices: [
      { id: 'A', text: '사실 그대로 직접적으로 전달한다. 명확해야 행동이 바뀐다.' },
      { id: 'B', text: '현재 상황의 객관적 데이터와 기대치를 공유하고, 함께 개선 방안을 논의한다.' },
      { id: 'C', text: '일단 기회를 더 주고, 개선이 없으면 그때 이야기한다.' },
    ],
  },

  // CM-CC-001: 다문화 소통 (Cross-Cultural Communication)
  {
    id: 'CM-CC-001',
    type: 'Communication',
    competency: 'cross-cultural-comm',
    title: '문화의 차이',
    situation: '해외 지사 동료와 화상 회의 중입니다. 상대방의 의사소통 방식이 우리와 달라서 의도가 명확히 파악되지 않습니다. 문화적 차이인지 실제 의견 불일치인지 헷갈립니다.',
    learningPoint: '문화적 차이를 인식하고 명확한 확인 과정을 거치는 것이 글로벌 소통의 핵심이다',
    choices: [
      { id: 'A', text: '내 방식대로 이해하고 진행한다. 결과로 확인하면 된다.' },
      { id: 'B', text: '"제가 정확히 이해했는지 확인하고 싶은데요"라며 이해한 내용을 요약해서 확인한다.' },
      { id: 'C', text: '회의 후 메일로 논의 내용을 정리해서 보내고 확인을 요청한다.' },
    ],
  },

  // CM-DC-001: 어려운 대화 (Difficult Conversations)
  {
    id: 'CM-DC-001',
    type: 'Communication',
    competency: 'difficult-conversation',
    title: '해고 통보',
    situation: '구조조정으로 팀원 한 명에게 해고를 통보해야 합니다. 그 팀원은 최근 집을 샀고, 가족도 있습니다. 어떻게 이 어려운 대화를 시작해야 할지 막막합니다.',
    learningPoint: '어려운 대화에서도 상대방의 존엄성을 지키는 것이 중요하다',
    choices: [
      { id: 'A', text: '감정 개입 없이 사실만 전달한다. 명확하고 빠르게 끝내는 게 서로에게 좋다.' },
      { id: 'B', text: '충분한 시간을 들여 결정 배경을 설명하고, 향후 지원 방안을 함께 논의한다.' },
      { id: 'C', text: 'HR 담당자와 함께 통보한다. 혼자 하기엔 부담이 크다.' },
    ],
  },

  // CM-PER-001: 설득 (Persuasion)
  {
    id: 'CM-PER-001',
    type: 'Communication',
    competency: 'persuasion',
    title: '반대하는 이해관계자',
    situation: '새 프로젝트에 핵심 이해관계자가 반대하고 있습니다. 논리적 근거를 제시해도 "그냥 마음에 안 들어"라는 반응입니다. 이 사람의 동의 없이는 진행이 어렵습니다.',
    learningPoint: '설득은 논리만이 아닌 상대방의 감정과 이해관계를 다루는 것이다',
    choices: [
      { id: 'A', text: '더 많은 데이터와 논리를 준비해서 다시 설득을 시도한다.' },
      { id: 'B', text: '반대의 진짜 이유를 파악하기 위해 개인적으로 만나 솔직한 대화를 나눈다.' },
      { id: 'C', text: '상위 결정권자의 지지를 얻어서 진행한다.' },
    ],
  },

  // CM-RB-001: 관계 형성 (Rapport Building)
  {
    id: 'CM-RB-001',
    type: 'Communication',
    competency: 'rapport-building',
    title: '새로운 팀',
    situation: '새 팀에 합류했습니다. 기존 팀원들은 서로 친하고 농담도 자유롭게 하는데, 당신만 겉도는 느낌입니다. 빨리 팀에 섞이고 싶지만 어색합니다.',
    learningPoint: '관계 형성은 시간이 걸리며, 진정성 있는 관심이 기본이다',
    choices: [
      { id: 'A', text: '시간이 지나면 자연스럽게 친해지겠지. 업무에 집중한다.' },
      { id: 'B', text: '점심이나 커피를 제안하며 적극적으로 다가간다. 개인적인 관심을 표현한다.' },
      { id: 'C', text: '팀 활동이나 회식에 적극 참여하면서 자연스럽게 섞인다.' },
    ],
  },

  // CM-BS-001: 경계 설정 (Boundary Setting)
  {
    id: 'CM-BS-001',
    type: 'Communication',
    competency: 'boundary-setting',
    title: '업무 외 연락',
    situation: '상사가 밤늦게, 주말에도 수시로 업무 연락을 합니다. "급한 것만"이라고 하지만 거의 매번입니다. 개인 시간이 없어지고 스트레스가 쌓입니다.',
    learningPoint: '건강한 경계 설정은 장기적으로 업무 효율과 관계 모두에 도움이 된다',
    choices: [
      { id: 'A', text: '상사니까 그냥 응한다. 조직생활에서 어쩔 수 없는 부분이다.' },
      { id: 'B', text: '적절한 때 "업무 시간 외 연락은 정말 급한 경우로 제한해주시면 감사하겠습니다"라고 정중히 요청한다.' },
      { id: 'C', text: '퇴근 후에는 연락을 확인하지 않고, 다음 날 아침에 대응한다.' },
    ],
  },

  // CM-DE-001: 긴장 완화 (De-escalation)
  {
    id: 'CM-DE-001',
    type: 'Communication',
    competency: 'de-escalation',
    title: '격앙된 고객',
    situation: '고객이 제품 문제로 매우 화가 나서 소리를 지르며 항의하고 있습니다. 주변 사람들이 보고 있고, 고객의 흥분이 점점 더 고조되고 있습니다.',
    learningPoint: '격앙된 상황에서는 문제 해결보다 감정 진정이 먼저다',
    choices: [
      { id: 'A', text: '차분하게 규정과 절차를 설명한다. 감정적으로 대응하면 안 된다.' },
      { id: 'B', text: '먼저 "많이 불편하셨겠습니다"라며 감정을 인정하고, 조용한 장소로 안내한다.' },
      { id: 'C', text: '상위자나 담당자에게 인계한다. 내가 해결할 수준을 넘어섰다.' },
    ],
  },

  // CM-PT-001: 관점 수용 (Perspective Taking)
  {
    id: 'CM-PT-001',
    type: 'Communication',
    competency: 'perspective-taking',
    title: '이해할 수 없는 결정',
    situation: '경영진이 이해하기 어려운 결정을 내렸습니다. 현장 상황을 모르는 것 같고, 팀원들의 불만이 높습니다. 당신도 동의하기 어렵습니다.',
    learningPoint: '다른 관점에서 상황을 이해하려는 노력이 건설적인 대화의 시작이다',
    choices: [
      { id: 'A', text: '팀원들과 함께 불만을 표출하고, 상위 보고를 통해 재고를 요청한다.' },
      { id: 'B', text: '경영진의 결정 배경과 고려 사항이 무엇이었는지 먼저 이해하려 노력한다.' },
      { id: 'C', text: '일단 결정을 따르고, 실행 과정에서 문제점을 데이터로 정리해 보고한다.' },
    ],
  },

  // CM-CCR-001: 건설적 비판 (Constructive Criticism)
  {
    id: 'CM-CCR-001',
    type: 'Communication',
    competency: 'constructive-criticism',
    title: '상사에게 쓴소리',
    situation: '팀장님의 회의 진행 방식에 문제가 있어 팀원들이 불만입니다. 회의가 비효율적이고 결론이 없이 끝나는 경우가 많습니다. 팀장님께 이 피드백을 전해야 할 것 같습니다.',
    learningPoint: '상위자에게도 건설적인 피드백을 제공하는 것이 조직 발전에 기여하는 것이다',
    choices: [
      { id: 'A', text: '상사에게 직접 말하기 어려우니, 익명 설문 등 간접적인 방법을 찾는다.' },
      { id: 'B', text: '구체적인 예시와 개선 제안과 함께 1:1로 정중하게 피드백을 드린다.' },
      { id: 'C', text: '팀장님 스타일이니 받아들이고, 팀원들과 회의 후 follow-up 미팅을 따로 한다.' },
    ],
  },

  // CM-AF-001: 사과와 용서 (Apology & Forgiveness)
  {
    id: 'CM-AF-001',
    type: 'Communication',
    competency: 'apology-forgiveness',
    title: '내 실수로 인한 피해',
    situation: '당신의 실수로 동료가 야근을 해야 했습니다. 그 동료는 표면적으로는 괜찮다고 했지만, 이후 태도가 차갑게 변했습니다. 미안한 마음은 있지만 어떻게 해야 할지 모르겠습니다.',
    learningPoint: '진정한 사과는 변명 없이 책임을 인정하고 재발 방지를 약속하는 것이다',
    choices: [
      { id: 'A', text: '이미 사과했으니 시간이 해결해줄 것이다. 계속 사과하면 더 불편해진다.' },
      { id: 'B', text: '다시 한번 진심으로 사과하고, 구체적으로 어떻게 보상할 수 있을지 물어본다.' },
      { id: 'C', text: '말보다 행동으로 보여준다. 앞으로 그 동료의 업무를 적극적으로 도와준다.' },
    ],
  },

  // CM-TH-001: 팀 화합 (Team Harmony)
  {
    id: 'CM-TH-001',
    type: 'Communication',
    competency: 'team-harmony',
    title: '분열된 팀',
    situation: '팀이 두 파벌로 나뉘어 있습니다. 예전 팀장 시절 사람들과 새 팀장 체제 사람들 사이에 보이지 않는 벽이 있습니다. 협업이 잘 안 되고 정보 공유도 원활하지 않습니다.',
    learningPoint: '팀 화합은 저절로 이루어지지 않으며, 의도적인 노력이 필요하다',
    choices: [
      { id: 'A', text: '내 업무만 잘하면 된다. 파벌 문제는 리더가 해결할 일이다.' },
      { id: 'B', text: '양쪽 사람들과 두루 교류하며 가교 역할을 한다. 공통 관심사를 찾는다.' },
      { id: 'C', text: '팀 리더에게 상황을 공유하고, 팀빌딩 활동 등을 제안한다.' },
    ],
  },
];

// ============================================================
// 이벤트 카드 (우연한 기회 5개 + 번아웃 1개 + 도전과제 1개 + 성장기회 1개)
// ============================================================
export const EVENT_CARDS: GameCard[] = [
  // 우연한 기회 카드 5개
  {
    id: 'EVT-CHANCE-001',
    type: 'Event',
    title: '예상치 못한 기회',
    situation: '경영진 앞에서 갑자기 발표할 기회가 생겼습니다. 준비할 시간은 10분뿐입니다. 평소 생각해둔 아이디어가 있긴 한데...',
    learningPoint: '기회는 준비된 자에게 온다',
    choices: [
      { id: 'A', text: '준비가 안 됐다며 정중히 거절한다. 리스크가 너무 크다.' },
      { id: 'B', text: '도전한다! 있는 그대로의 생각을 자신 있게 발표한다.' },
      { id: 'C', text: '다른 동료에게 기회를 양보한다. 더 준비된 사람이 해야 한다.' },
    ],
  },
  {
    id: 'EVT-CHANCE-002',
    type: 'Event',
    title: '뜻밖의 만남',
    situation: '엘리베이터에서 우연히 CEO와 단둘이 있게 되었습니다. 30초 정도의 시간이 있습니다.',
    learningPoint: '일상의 순간도 기회가 될 수 있다',
    choices: [
      { id: 'A', text: '인사만 하고 조용히 있는다. 괜히 말 걸었다가 실수할까 봐.' },
      { id: 'B', text: '간단한 인사와 함께 최근 업무에서의 작은 성과를 자연스럽게 공유한다.' },
      { id: 'C', text: '회사 발전을 위한 아이디어를 빠르게 피칭한다.' },
    ],
  },
  {
    id: 'EVT-CHANCE-003',
    type: 'Event',
    title: '갑작스러운 휴가',
    situation: '상사가 갑자기 일주일간 부재하게 되었습니다. 중요한 결정들이 밀려 있는 상황입니다.',
    learningPoint: '예상치 못한 상황에서 리더십이 드러난다',
    choices: [
      { id: 'A', text: '상사가 돌아올 때까지 결정을 미룬다. 월권은 위험하다.' },
      { id: 'B', text: '긴급한 것은 결정하고 기록해두며, 상사에게 수시로 업데이트한다.' },
      { id: 'C', text: '모든 결정을 내리고 결과로 증명한다. 기회를 잡아야 한다.' },
    ],
  },
  {
    id: 'EVT-CHANCE-004',
    type: 'Event',
    title: '경쟁사의 러브콜',
    situation: '경쟁사에서 더 좋은 조건으로 스카우트 제안이 왔습니다. 현재 회사에 불만은 없지만 조건이 매력적입니다.',
    learningPoint: '커리어 결정은 단기 이익보다 장기 성장을 고려해야 한다',
    choices: [
      { id: 'A', text: '조건이 좋으니 이직을 진지하게 검토한다.' },
      { id: 'B', text: '현 회사에서의 성장 가능성과 비교해서 신중히 판단한다.' },
      { id: 'C', text: '현 회사에 충성한다. 쉽게 움직이면 신뢰를 잃는다.' },
    ],
  },
  {
    id: 'EVT-CHANCE-005',
    type: 'Event',
    title: '실수에서 발견한 것',
    situation: '업무 중 실수로 새로운 발견을 했습니다. 원래 목적과는 다르지만, 잠재력이 있어 보입니다.',
    learningPoint: '실수도 새로운 기회의 씨앗이 될 수 있다',
    choices: [
      { id: 'A', text: '원래 업무에 집중한다. 딴 길로 새면 안 된다.' },
      { id: 'B', text: '발견한 내용을 정리해서 팀에 공유하고 가능성을 논의한다.' },
      { id: 'C', text: '개인적으로 더 탐구해보고, 확실해지면 공유한다.' },
    ],
  },

  // 번아웃 카드
  {
    id: 'EVT-BURNOUT-001',
    type: 'Burnout',
    title: '번아웃',
    situation: '최근 과도한 업무와 스트레스로 완전히 지쳤습니다. 아침에 일어나기가 힘들고, 모든 것이 무의미하게 느껴집니다. 잠시 쉬어야 할 것 같습니다.',
    learningPoint: '번아웃은 실패가 아니라 재충전이 필요하다는 신호다',
    choices: [
      { id: 'A', text: '힘들어도 참고 버틴다. 쉬면 뒤처진다.' },
      { id: 'B', text: '상사에게 솔직히 상황을 알리고, 잠시 업무 조정을 요청한다.' },
      { id: 'C', text: '휴가를 사용해 완전히 쉰다. 건강이 최우선이다.' },
    ],
  },

  // 도전 과제 카드
  {
    id: 'EVT-CHALLENGE-001',
    type: 'Challenge',
    title: '혁신 챌린지',
    situation: '회사에서 "업무 혁신 아이디어 공모전"을 개최했습니다. 우승하면 포상과 함께 아이디어를 직접 실행할 기회가 주어집니다. 시간과 노력이 필요하지만 흥미로운 기회입니다.',
    learningPoint: '도전은 성장의 가장 확실한 방법이다',
    choices: [
      { id: 'A', text: '본업에 집중한다. 공모전은 여유 있을 때 해도 된다.' },
      { id: 'B', text: '동료들과 팀을 구성해서 참가한다. 함께하면 부담이 줄어든다.' },
      { id: 'C', text: '혼자서 도전한다. 내 아이디어를 순수하게 발전시켜보고 싶다.' },
    ],
  },

  // 성장 기회 카드
  {
    id: 'EVT-GROWTH-001',
    type: 'Growth',
    title: '성장의 갈림길',
    situation: '두 가지 교육 기회가 있습니다. 하나는 현재 업무 전문성을 높이는 과정, 다른 하나는 전혀 새로운 분야를 배우는 과정입니다. 둘 다 회사 지원을 받을 수 있지만 하나만 선택해야 합니다.',
    learningPoint: '성장 경로에 정답은 없다. 자신만의 방향을 선택하는 것이 중요하다',
    choices: [
      { id: 'A', text: '현재 업무 전문성 과정을 선택한다. 확실한 강점을 만들어야 한다.' },
      { id: 'B', text: '새로운 분야 과정을 선택한다. 융합 역량이 미래 경쟁력이다.' },
      { id: 'C', text: '선택하지 않고, 독학으로 두 분야 모두 조금씩 공부한다.' },
    ],
  },

  // 특별 이벤트 카드 (월드투어용)
  {
    id: 'EVT-SPECIAL-001',
    type: 'Special',
    title: '글로벌 기회',
    situation: '해외 지사에서 6개월 파견 근무 기회가 왔습니다. 글로벌 경험을 쌓을 수 있지만, 현재 진행 중인 중요한 프로젝트를 다른 사람에게 넘겨야 합니다. 가족과의 시간도 줄어들 것입니다.',
    learningPoint: '새로운 경험과 기회는 편안한 영역 밖에서 찾아온다',
    choices: [
      { id: 'A', text: '기회를 잡는다. 글로벌 경험은 커리어에 큰 자산이 될 것이다.' },
      { id: 'B', text: '현재 프로젝트에 집중한다. 시작한 일을 끝까지 책임지는 것이 중요하다.' },
      { id: 'C', text: '프로젝트 마무리 후 다음 기회를 노린다. 타이밍을 조율해본다.' },
    ],
  },
];

// ============================================================
// 전체 카드 통합
// ============================================================
export const SAMPLE_CARDS: GameCard[] = [
  ...CORE_VALUE_CARDS,
  ...COMMUNICATION_CARDS,
  ...EVENT_CARDS,
];

// 모드별 카드 필터링 헬퍼 함수
export const getCardsByMode = (mode: 'CoreValue' | 'Communication'): GameCard[] => {
  const modeCards = mode === 'CoreValue' ? CORE_VALUE_CARDS : COMMUNICATION_CARDS;
  return [...modeCards, ...EVENT_CARDS];
};

// 역량별 카드 찾기 헬퍼 함수
export const getCardByCompetency = (competency: CompetencyType, mode: 'CoreValue' | 'Communication'): GameCard | undefined => {
  const cards = mode === 'CoreValue' ? CORE_VALUE_CARDS : COMMUNICATION_CARDS;
  return cards.find(card => card.competency === competency);
};

// 보드 칸에서 역량 카드 가져오기 헬퍼 함수
export const getCardForSquare = (square: BoardSquare, gameMode: 'CoreValue' | 'Communication'): GameCard | undefined => {
  if (!square.competency) return undefined;
  return getCardByCompetency(square.competency, gameMode);
};
