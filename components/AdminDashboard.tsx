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
  COMPETENCY_INFO
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
  AlertCircle
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  gameMode: GameVersion;
  customCards: GameCard[];
  onSaveCards: (cards: GameCard[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  gameMode,
  customCards,
  onSaveCards
}) => {
  // 현재 모드에 맞는 기본 카드 가져오기
  const getDefaultCards = () => {
    if (gameMode === GameVersion.CoreValue) {
      return [...CORE_VALUE_CARDS, ...EVENT_CARDS];
    } else {
      return [...COMMUNICATION_CARDS, ...EVENT_CARDS];
    }
  };

  // 상태 관리
  const [cards, setCards] = useState<GameCard[]>([]);
  const [editingCard, setEditingCard] = useState<GameCard | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'competency' | 'event'>('all');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasChanges, setHasChanges] = useState(false);

  // 초기화: 커스텀 카드가 있으면 사용, 없으면 기본 카드 사용
  useEffect(() => {
    if (customCards && customCards.length > 0) {
      setCards(customCards);
    } else {
      setCards(getDefaultCards());
    }
  }, [gameMode, customCards]);

  // 필터링된 카드 목록
  const filteredCards = cards.filter(card => {
    const matchesSearch =
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.situation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.competency && card.competency.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'competency' && card.competency) ||
      (filterType === 'event' && !card.competency);

    return matchesSearch && matchesFilter;
  });

  // 카드 편집 시작
  const handleEditCard = (card: GameCard) => {
    setEditingCard({ ...card });
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
      await onSaveCards(cards);
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
              const competencyInfo = card.competency ? getCompetencyInfo(card.competency) : null;
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
                      <div className={`w-3 h-3 rounded-full ${
                        card.type === 'CoreValue' ? 'bg-blue-500' :
                        card.type === 'Communication' ? 'bg-green-500' :
                        card.type === 'Event' ? 'bg-yellow-500' :
                        card.type === 'Burnout' ? 'bg-red-500' :
                        card.type === 'Challenge' ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`} />
                      <div>
                        <div className="font-semibold text-gray-800">{card.title}</div>
                        <div className="text-sm text-gray-500">
                          {competencyInfo ? (
                            <span>{competencyInfo.nameKo} ({competencyInfo.nameEn})</span>
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
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">카드 편집</h3>
                <button
                  onClick={() => setEditingCard(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
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
                          <span className="font-bold text-indigo-600 mt-2">{choice.id}.</span>
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
