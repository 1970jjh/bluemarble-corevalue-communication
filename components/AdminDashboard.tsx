import React, { useState, useEffect } from 'react';
import {
  GameCard,
  CompetencyInfo,
  GameVersion,
  Choice
} from '../types';
import {
  CORE_VALUE_CARDS,
  COMMUNICATION_CARDS,
  EVENT_CARDS,
  COMPETENCY_INFO,
  BOARD_SQUARES
} from '../constants';
import {
  Settings,
  Edit3,
  Save,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
  AlertCircle,
  Sparkles,
  Wand2
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  gameMode: GameVersion;
  customCards: GameCard[];
  onSaveCards: (cards: GameCard[]) => void;
}

// 확장된 카드 타입 (역량명 포함)
interface ExtendedGameCard extends GameCard {
  competencyNameKo?: string;
  competencyNameEn?: string;
  boardIndex?: number;  // 보드 위치
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  gameMode,
  customCards,
  onSaveCards
}) => {
  // 현재 모드에 맞는 기본 카드 가져오기 (보드 순서대로 정렬)
  const getDefaultCards = (): ExtendedGameCard[] => {
    const modeCards = gameMode === GameVersion.CoreValue
      ? CORE_VALUE_CARDS
      : COMMUNICATION_CARDS;

    // 보드 순서에 따라 역량 카드 정렬
    const sortedCompetencyCards: ExtendedGameCard[] = [];
    const usedCardIds = new Set<string>();

    // 보드 칸 순서대로 카드 추가
    BOARD_SQUARES.forEach(square => {
      if (square.competency) {
        const card = modeCards.find(c => c.competency === square.competency);
        if (card && !usedCardIds.has(card.id)) {
          const competencyInfo = COMPETENCY_INFO.find(c => c.id === card.competency);
          sortedCompetencyCards.push({
            ...card,
            competencyNameKo: competencyInfo?.nameKo || '',
            competencyNameEn: competencyInfo?.nameEn || '',
            boardIndex: square.index  // 보드 위치 추가
          });
          usedCardIds.add(card.id);
        }
      }
    });

    // 보드에 없는 나머지 역량 카드 추가
    modeCards.forEach(card => {
      if (!usedCardIds.has(card.id)) {
        const competencyInfo = card.competency ? COMPETENCY_INFO.find(c => c.id === card.competency) : null;
        sortedCompetencyCards.push({
          ...card,
          competencyNameKo: competencyInfo?.nameKo || '',
          competencyNameEn: competencyInfo?.nameEn || ''
        });
      }
    });

    // 이벤트 카드 추가 (역량 정보 없음)
    const eventCards: ExtendedGameCard[] = EVENT_CARDS.map(card => ({
      ...card,
      competencyNameKo: '',
      competencyNameEn: ''
    }));

    return [...sortedCompetencyCards, ...eventCards];
  };

  // 상태 관리
  const [cards, setCards] = useState<ExtendedGameCard[]>([]);
  const [editingCard, setEditingCard] = useState<ExtendedGameCard | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'competency' | 'event'>('all');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasChanges, setHasChanges] = useState(false);

  // AI 생성 관련 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiInputName, setAiInputName] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);

  // 초기화: 커스텀 카드가 있으면 사용, 없으면 기본 카드 사용
  useEffect(() => {
    if (customCards && customCards.length > 0) {
      // 커스텀 카드에 역량명 정보 추가
      const extendedCustomCards = customCards.map(card => {
        const competencyInfo = card.competency ? COMPETENCY_INFO.find(c => c.id === card.competency) : null;
        return {
          ...card,
          competencyNameKo: (card as ExtendedGameCard).competencyNameKo || competencyInfo?.nameKo || '',
          competencyNameEn: (card as ExtendedGameCard).competencyNameEn || competencyInfo?.nameEn || ''
        };
      });
      setCards(extendedCustomCards);
    } else {
      setCards(getDefaultCards());
    }
  }, [gameMode, customCards]);

  // 필터링된 카드 목록
  const filteredCards = cards.filter(card => {
    const matchesSearch =
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.situation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.competency && card.competency.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (card.competencyNameKo && card.competencyNameKo.includes(searchTerm));

    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'competency' && card.competency) ||
      (filterType === 'event' && !card.competency);

    return matchesSearch && matchesFilter;
  });

  // 카드 편집 시작
  const handleEditCard = (card: ExtendedGameCard) => {
    setEditingCard({ ...card });
    setShowAiInput(false);
    setAiInputName(card.competencyNameKo || '');
  };

  // 카드 편집 저장
  const handleSaveCard = () => {
    if (!editingCard) return;

    const updatedCards = cards.map(card =>
      card.id === editingCard.id ? editingCard : card
    );
    setCards(updatedCards);
    setEditingCard(null);
    setHasChanges(true);
  };

  // 전체 저장
  const handleSaveAll = async () => {
    setSaveStatus('saving');
    try {
      await onSaveCards(cards as GameCard[]);
      setSaveStatus('saved');
      setHasChanges(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // 기본값으로 초기화
  const handleReset = () => {
    if (confirm('모든 변경사항이 초기화됩니다. 계속하시겠습니까?')) {
      setCards(getDefaultCards());
      setHasChanges(true);
    }
  };

  // AI로 카드 내용 생성
  const handleAIGenerate = async () => {
    if (!editingCard || !aiInputName.trim()) {
      alert('역량카드명을 입력해주세요.');
      return;
    }

    setIsGenerating(true);

    try {
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.API_KEY || '';

      if (!apiKey) {
        // API 키가 없으면 샘플 데이터로 대체
        const sampleContent = generateSampleContent(aiInputName);
        setEditingCard({
          ...editingCard,
          competencyNameKo: aiInputName,
          competencyNameEn: sampleContent.nameEn,
          title: sampleContent.title,
          situation: sampleContent.situation,
          choices: sampleContent.choices,
          learningPoint: sampleContent.learningPoint
        });
        setIsGenerating(false);
        return;
      }

      const prompt = `당신은 기업 교육 콘텐츠 전문가입니다.
다음 역량에 대한 교육용 시나리오 카드를 만들어주세요.

역량명: ${aiInputName}
게임 모드: ${gameMode === GameVersion.CoreValue ? '핵심가치' : '소통&갈등관리'}

다음 JSON 형식으로 응답해주세요:
{
  "nameEn": "영문 역량명",
  "title": "시나리오 제목 (5-10자)",
  "situation": "직장에서 일어날 수 있는 구체적인 상황 설명 (150-200자). 딜레마나 선택이 필요한 상황으로 작성",
  "choices": [
    { "id": "A", "text": "선택지 A 설명 (30-50자)" },
    { "id": "B", "text": "선택지 B 설명 (30-50자)" },
    { "id": "C", "text": "선택지 C 설명 (30-50자)" }
  ],
  "learningPoint": "이 시나리오에서 배울 수 있는 핵심 교훈 (30-50자)"
}

JSON만 응답하세요.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1024,
          }
        })
      });

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // JSON 파싱
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setEditingCard({
          ...editingCard,
          competencyNameKo: aiInputName,
          competencyNameEn: parsed.nameEn || '',
          title: parsed.title || '',
          situation: parsed.situation || '',
          choices: parsed.choices || editingCard.choices,
          learningPoint: parsed.learningPoint || ''
        });
      }
    } catch (error) {
      console.error('AI 생성 오류:', error);
      // 오류 시 샘플 데이터 사용
      const sampleContent = generateSampleContent(aiInputName);
      setEditingCard({
        ...editingCard,
        competencyNameKo: aiInputName,
        competencyNameEn: sampleContent.nameEn,
        title: sampleContent.title,
        situation: sampleContent.situation,
        choices: sampleContent.choices,
        learningPoint: sampleContent.learningPoint
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 샘플 콘텐츠 생성 (API 없을 때 fallback)
  const generateSampleContent = (competencyName: string) => {
    return {
      nameEn: competencyName,
      title: `${competencyName}의 순간`,
      situation: `팀 프로젝트를 진행하는 중, ${competencyName}과 관련된 중요한 상황이 발생했습니다. 동료와의 의견 차이가 생겼고, 어떻게 대응할지 선택해야 합니다. 시간은 촉박하고, 결정에 따라 프로젝트 결과가 달라질 수 있습니다.`,
      choices: [
        { id: 'A', text: '기존 방식대로 진행한다. 안정성이 중요하다.' },
        { id: 'B', text: '동료와 충분히 대화하고, 함께 최선의 방법을 찾는다.' },
        { id: 'C', text: '상위 결정권자에게 판단을 맡긴다.' }
      ],
      learningPoint: `${competencyName}은 팀워크와 성과 모두에 영향을 미치는 핵심 역량이다`
    };
  };

  // 역량 정보 가져오기
  const getCompetencyInfo = (competencyId: string): CompetencyInfo | undefined => {
    return COMPETENCY_INFO.find(c => c.id === competencyId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">관리자 대시보드</h2>
                <p className="text-indigo-200 text-sm">
                  {gameMode === GameVersion.CoreValue ? '핵심가치' : '소통&갈등관리'} 모드 카드 관리
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 툴바 */}
        <div className="p-4 border-b bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
          {/* 검색 */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="카드 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* 필터 */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">전체 카드</option>
              <option value="competency">역량 카드</option>
              <option value="event">이벤트 카드</option>
            </select>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              초기화
            </button>
            <button
              onClick={handleSaveAll}
              disabled={!hasChanges || saveStatus === 'saving'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                hasChanges
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saveStatus === 'saving' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  저장 중...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Check className="w-4 h-4" />
                  저장됨!
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  오류
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  전체 저장
                </>
              )}
            </button>
          </div>
        </div>

        {/* 카드 목록 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-sm text-gray-500 mb-4">
            총 {filteredCards.length}개 카드 (역량 카드 22개 + 이벤트 카드 8개)
          </div>

          <div className="space-y-3">
            {filteredCards.map((card) => {
              const isExpanded = expandedCardId === card.id;

              return (
                <div
                  key={card.id}
                  className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* 카드 헤더 */}
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedCardId(isExpanded ? null : card.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* 보드 위치 표시 */}
                      {card.boardIndex !== undefined ? (
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 border-2 border-indigo-300 flex items-center justify-center font-bold text-indigo-700 text-sm">
                          {card.boardIndex}
                        </div>
                      ) : (
                        <div className={`w-3 h-3 rounded-full ${
                          card.type === 'CoreValue' ? 'bg-blue-500' :
                          card.type === 'Communication' ? 'bg-green-500' :
                          card.type === 'Event' ? 'bg-yellow-500' :
                          card.type === 'Burnout' ? 'bg-red-500' :
                          card.type === 'Challenge' ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`} />
                      )}
                      <div>
                        <div className="font-semibold text-gray-800">
                          {card.title}
                          {card.boardIndex !== undefined && (
                            <span className="ml-2 text-xs font-normal text-gray-400">(보드 {card.boardIndex}번 칸)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {card.competencyNameKo ? (
                            <span>{card.competencyNameKo} ({card.competencyNameEn})</span>
                          ) : card.competency ? (
                            <span>{getCompetencyInfo(card.competency)?.nameKo} ({getCompetencyInfo(card.competency)?.nameEn})</span>
                          ) : (
                            <span className="italic">{card.type} 카드</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCard(card);
                        }}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* 확장된 내용 */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t pt-4 bg-gray-50">
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-1">상황</div>
                          <div className="text-gray-700 bg-white p-3 rounded-lg border">
                            {card.situation}
                          </div>
                        </div>

                        {card.choices && card.choices.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">선택지</div>
                            <div className="space-y-2">
                              {card.choices.map((choice, idx) => (
                                <div
                                  key={choice.id}
                                  className="flex items-start gap-2 bg-white p-3 rounded-lg border"
                                >
                                  <span className="font-bold text-indigo-600">{choice.id}.</span>
                                  <span className="text-gray-700">{choice.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-1">학습 포인트</div>
                          <div className="text-gray-700 bg-white p-3 rounded-lg border italic">
                            {card.learningPoint}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 편집 모달 */}
        {editingCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
                <h3 className="text-xl font-bold text-gray-800">카드 편집</h3>
                <button
                  onClick={() => setEditingCard(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* AI 생성 섹션 */}
                {editingCard.competency && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-800">AI 자동 생성</span>
                    </div>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={aiInputName}
                        onChange={(e) => setAiInputName(e.target.value)}
                        placeholder="역량카드명 입력 (예: 적극적 경청)"
                        className="flex-1 px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                      />
                      <button
                        onClick={handleAIGenerate}
                        disabled={isGenerating || !aiInputName.trim()}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all font-medium ${
                          isGenerating || !aiInputName.trim()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            생성 중...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            AI 생성
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-purple-600 mt-2">
                      역량카드명을 입력하면 AI가 제목, 상황, 선택지, 학습포인트를 자동 생성합니다.
                    </p>
                  </div>
                )}

                {/* 역량카드명 (역량 카드인 경우에만) */}
                {editingCard.competency && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        역량카드명 (한글) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingCard.competencyNameKo || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, competencyNameKo: e.target.value })}
                        placeholder="예: 적극적 경청"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        역량카드명 (영문)
                      </label>
                      <input
                        type="text"
                        value={editingCard.competencyNameEn || ''}
                        onChange={(e) => setEditingCard({ ...editingCard, competencyNameEn: e.target.value })}
                        placeholder="예: Active Listening"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* 제목 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                  <input
                    type="text"
                    value={editingCard.title}
                    onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* 상황 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">상황 설명</label>
                  <textarea
                    value={editingCard.situation}
                    onChange={(e) => setEditingCard({ ...editingCard, situation: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* 선택지 */}
                {editingCard.choices && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">선택지</label>
                    <div className="space-y-3">
                      {editingCard.choices.map((choice, idx) => (
                        <div key={choice.id} className="flex items-start gap-2">
                          <span className="font-bold text-indigo-600 mt-2 w-6">{choice.id}.</span>
                          <textarea
                            value={choice.text}
                            onChange={(e) => {
                              const newChoices = [...editingCard.choices!];
                              newChoices[idx] = { ...choice, text: e.target.value };
                              setEditingCard({ ...editingCard, choices: newChoices });
                            }}
                            rows={2}
                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 학습 포인트 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">학습 포인트</label>
                  <textarea
                    value={editingCard.learningPoint}
                    onChange={(e) => setEditingCard({ ...editingCard, learningPoint: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
                <button
                  onClick={() => setEditingCard(null)}
                  className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveCard}
                  className="px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
