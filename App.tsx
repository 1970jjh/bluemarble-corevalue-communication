import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameBoard from './components/GameBoard';
import TeamStatus from './components/TeamStatus';
import ControlPanel from './components/ControlPanel';
import CardModal from './components/CardModal';
import ReportView from './components/ReportView';
import Intro from './components/Intro';
import Lobby from './components/Lobby';
import MobileTeamView from './components/MobileTeamView';
import DiceResultOverlay from './components/DiceResultOverlay';
import CompetencyCardPreview from './components/CompetencyCardPreview';
import LapBonusPopup from './components/LapBonusPopup';
import LotteryBonusPopup from './components/LotteryBonusPopup';
import RiskCardPopup from './components/RiskCardPopup';
import AdminDashboard from './components/AdminDashboard';
import GameRulesModal from './components/GameRulesModal';
import { soundEffects } from './lib/soundEffects';
import {
  Team,
  GamePhase,
  SquareType,
  GameCard,
  Choice,
  GameVersion,
  Session,
  SessionStatus,
  TeamColor,
  AIEvaluationResult,
  TurnRecord
} from './types';
import {
  BOARD_SQUARES,
  SAMPLE_CARDS,
  BOARD_SIZE,
  INITIAL_RESOURCES,
  LAP_BONUS,
  DOUBLE_BONUS,
  getCardsByMode,
  CORE_VALUE_CARDS,
  COMMUNICATION_CARDS,
  NEW_EMPLOYEE_CARDS,
  EVENT_CARDS,
  getCompetencyCardsByMode,
  getCompetencyForSquare,
  getChanceCardType,
  CHANCE_CARD_SQUARES
} from './constants';
import { Smartphone, Monitor, QrCode, X, Copy, Check, Settings, BookOpen } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { GoogleGenAI, Type } from "@google/genai";

// Firebase 연동
import * as firestoreService from './lib/firestore';

type AppView = 'intro' | 'lobby' | 'game' | 'participant';
type AdminViewMode = 'dashboard' | 'mobile_monitor';

const App: React.FC = () => {
  // --- Global App State ---
  const [view, setView] = useState<AppView>('intro');

  // --- Session Management State ---
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // --- Participant State ---
  const [participantTeamId, setParticipantTeamId] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [isJoinedTeam, setIsJoinedTeam] = useState(false);
  const [initialAccessCode, setInitialAccessCode] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  // --- Current Game State ---
  const [adminViewMode, setAdminViewMode] = useState<AdminViewMode>('dashboard');
  const [monitoringTeamId, setMonitoringTeamId] = useState<string | null>(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.WaitingToStart);
  const [diceValue, setDiceValue] = useState<[number, number]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [gameLogs, setGameLogs] = useState<string[]>([]);
  const [turnTimeLeft, setTurnTimeLeft] = useState(120);
  const [showReport, setShowReport] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);  // 게임 시작 여부
  const [phaseBeforePause, setPhaseBeforePause] = useState<GamePhase>(GamePhase.Idle);  // 일시정지 전 상태

  // 3D 주사위 및 연출 관련 상태
  const [showDiceOverlay, setShowDiceOverlay] = useState(false);  // 3D 주사위 오버레이 표시
  const [pendingDice, setPendingDice] = useState<[number, number]>([1, 1]);  // 대기 중인 주사위 결과
  const [showCompetencyPreview, setShowCompetencyPreview] = useState(false);  // 역량카드 미리보기
  const [pendingSquare, setPendingSquare] = useState<any>(null);  // 도착 예정 칸
  const [showLapBonus, setShowLapBonus] = useState(false);  // 한 바퀴 완주 보너스 팝업
  const [lapBonusInfo, setLapBonusInfo] = useState<{ teamName: string; lapCount: number } | null>(null);  // 보너스 받을 팀 정보
  const [isDoubleChance, setIsDoubleChance] = useState(false);  // 더블 찬스 (AI 점수 2배)
  const [showLotteryBonus, setShowLotteryBonus] = useState(false);  // 복권 보너스 팝업
  const [lotteryBonusInfo, setLotteryBonusInfo] = useState<{ teamName: string; chanceCardNumber: number } | null>(null);
  const [showRiskCard, setShowRiskCard] = useState(false);  // 리스크 카드 팝업
  const [riskCardInfo, setRiskCardInfo] = useState<{ teamName: string; chanceCardNumber: number } | null>(null);
  const [isRiskCardMode, setIsRiskCardMode] = useState(false);  // 리스크 카드 상황 (모든 점수 마이너스)

  // 커스텀 모드 특수 효과 상태
  const [customScoreMultiplier, setCustomScoreMultiplier] = useState(1);  // 커스텀 모드 점수 배수 (2배 찬스, 3배 찬스)
  const [isSharingMode, setIsSharingMode] = useState(false);  // 나눔카드 모드 (모든 팀에 동일 점수 적용)

  // --- Active Card & Decision State (Shared between Admin & Mobile) ---
  const [activeCard, setActiveCard] = useState<GameCard | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [previewCard, setPreviewCard] = useState<GameCard | null>(null);

  // --- Preview Card State (관리자 미리보기용 - 게임에 반영 안됨) ---
  const [previewSelectedChoice, setPreviewSelectedChoice] = useState<Choice | null>(null);
  const [previewReasoning, setPreviewReasoning] = useState('');
  const [previewAiResult, setPreviewAiResult] = useState<AIEvaluationResult | null>(null);
  const [isPreviewProcessing, setIsPreviewProcessing] = useState(false);

  // --- Invite Modal State ---
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Shared Input State
  const [sharedSelectedChoice, setSharedSelectedChoice] = useState<Choice | null>(null);
  const [sharedReasoning, setSharedReasoning] = useState('');
  const [aiEvaluationResult, setAiEvaluationResult] = useState<AIEvaluationResult | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isTeamSaved, setIsTeamSaved] = useState(false);  // 팀이 입력을 저장했는지
  const [isSaving, setIsSaving] = useState(false);        // 저장 중 여부

  // 관람자 투표 상태
  const [spectatorVotes, setSpectatorVotes] = useState<{ [optionId: string]: string[] }>({});  // 옵션별 투표한 팀 이름 목록
  const [mySpectatorVote, setMySpectatorVote] = useState<Choice | null>(null);  // 내 투표 (참가자 로컬 상태)
  const [spectatorModalDismissed, setSpectatorModalDismissed] = useState(false);  // 관람자가 모달 닫았는지

  // 관리자 대시보드 상태
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // 게임 규칙서 모달 상태
  const [showGameRules, setShowGameRules] = useState(false);

  // Ref to track local operations in progress (to prevent Firebase from overriding local state)
  const localOperationInProgress = useRef(false);
  const localOperationTimestamp = useRef(0);

  // Ref to prevent saving data that was just received from Firebase (무한 루프 방지)
  const isReceivingFromFirebase = useRef(false);
  const lastReceivedTimestamp = useRef(0);
  const saveDebounceTimer = useRef<any>(null);

  // gameLogs를 ref로 관리하여 저장 시 최신 값 사용 (의존성 루프 방지)
  const gameLogsRef = useRef<string[]>([]);
  // gameLogs 변경 시 ref도 업데이트
  useEffect(() => {
    gameLogsRef.current = gameLogs;
  }, [gameLogs]);

  // Helper to get current session object
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const teams = currentSession ? currentSession.teams : [];
  const currentTeam = teams[currentTurnIndex] || teams[0]; // fallback to first team

  // 세션의 커스텀 카드 가져오기 (세션별로 저장됨)
  const sessionCustomCards = currentSession?.customCards || [];

  // 참가자 접속 URL 생성
  const getJoinUrl = (accessCode: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}?join=${accessCode}`;
  };

  // 링크 복사 핸들러
  const handleCopyLink = async (accessCode: string) => {
    const url = getJoinUrl(accessCode);
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // --- AI Client Initialization ---
  const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  // --- LocalStorage: 참가자 세션 복구 ---
  useEffect(() => {
    const savedSession = localStorage.getItem('bluemarble_participant_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.sessionId && parsed.teamId && parsed.name) {
          setCurrentSessionId(parsed.sessionId);
          setParticipantTeamId(parsed.teamId);
          setParticipantName(parsed.name);
          setIsJoinedTeam(true);
          setView('participant');
        }
      } catch (e) {
        console.error('세션 복구 실패:', e);
        localStorage.removeItem('bluemarble_participant_session');
      }
    }
  }, []);

  // --- LocalStorage: 참가자 세션 저장 ---
  useEffect(() => {
    if (isJoinedTeam && currentSessionId && participantTeamId && participantName) {
      localStorage.setItem('bluemarble_participant_session', JSON.stringify({
        sessionId: currentSessionId,
        teamId: participantTeamId,
        name: participantName,
        timestamp: Date.now()
      }));
    }
  }, [isJoinedTeam, currentSessionId, participantTeamId, participantName]);

  // --- URL 파라미터 확인 (접속 코드) ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode) {
      setInitialAccessCode(joinCode);
      // URL로 접속한 경우 저장된 세션 무시
      localStorage.removeItem('bluemarble_participant_session');
    }
  }, []);

  // --- Firebase: 세션 실시간 구독 ---
  useEffect(() => {
    // Firebase가 설정되어 있으면 실시간으로 세션 목록 구독
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;

    if (isFirebaseConfigured) {
      const unsubscribe = firestoreService.subscribeToAllSessions((firebaseSessions) => {
        console.log('[All Sessions] 전체 세션 목록 수신:', firebaseSessions.map(s => ({
          id: s.id,
          name: s.name,
          hasCustomCards: !!s.customCards,
          customCardsCount: s.customCards?.length || 0
        })));
        setSessions(firebaseSessions);
      });
      return () => unsubscribe();
    }
  }, []);

  // --- Firebase: 현재 세션 실시간 구독 (참가자/관리자 동기화) ---
  useEffect(() => {
    if (!currentSessionId) return;

    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (!isFirebaseConfigured) return;

    console.log('[Session Subscribe] 세션 구독 시작:', currentSessionId);

    const unsubscribe = firestoreService.subscribeToSession(currentSessionId, (session) => {
      if (session) {
        console.log('[Session Subscribe] 세션 데이터 수신:', {
          sessionId: session.id,
          hasCustomCards: !!session.customCards,
          customCardsCount: session.customCards?.length || 0,
          firstCardTitle: session.customCards?.[0]?.title || 'N/A'
        });
        setSessions(prev => prev.map(s => s.id === currentSessionId ? session : s));
      }
    });

    return () => unsubscribe();
  }, [currentSessionId]);

  // --- Firebase: 게임 상태 실시간 구독 ---
  useEffect(() => {
    if (!currentSessionId) return;

    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (!isFirebaseConfigured) return;

    console.log('[Firebase] 게임 상태 구독 시작:', currentSessionId);

    const unsubscribe = firestoreService.subscribeToGameState(currentSessionId, (state) => {
      if (state) {
        // 로컬 작업 진행 중이면 Firebase 상태 무시 (로컬 상태가 우선)
        if (localOperationInProgress.current) {
          console.log('[Firebase] 로컬 작업 진행 중 - 업데이트 스킵');

          // Decision 상태에서 다른 팀원의 입력만 업데이트
          if (state.currentCard && state.phase === GamePhase.Decision) {
            isReceivingFromFirebase.current = true;
            setActiveCard(state.currentCard);
            setSharedSelectedChoice(state.selectedChoice);
            setSharedReasoning(state.reasoning || '');
            setShowCardModal(true);
            // 짧은 지연 후 플래그 해제
            setTimeout(() => { isReceivingFromFirebase.current = false; }, 100);
          }
          return;
        }

        // 로컬 작업이 끝난 후 일정 시간 동안도 보호 (Firebase 지연 응답 방지)
        const timeSinceLocalOp = Date.now() - localOperationTimestamp.current;
        if (timeSinceLocalOp < 2000 && state.lastUpdated < localOperationTimestamp.current) {
          console.log('[Firebase] 오래된 Firebase 데이터 무시');
          return;
        }

        // 이미 같은 timestamp의 데이터를 받았으면 스킵 (중복 처리 방지)
        if (state.lastUpdated && state.lastUpdated === lastReceivedTimestamp.current) {
          return;
        }
        lastReceivedTimestamp.current = state.lastUpdated || 0;

        // Firebase 수신 플래그 설정 (무한 루프 방지)
        isReceivingFromFirebase.current = true;

        // 정상적인 Firebase 상태 동기화
        setGamePhase(state.phase as GamePhase);
        setCurrentTurnIndex(state.currentTeamIndex);

        // diceValue는 값이 실제로 다를 때만 업데이트
        const newDiceValue = state.diceValue || [1, 1];
        setDiceValue(prev => {
          if (prev[0] === newDiceValue[0] && prev[1] === newDiceValue[1]) {
            return prev;
          }
          return newDiceValue;
        });

        setActiveCard(state.currentCard);
        setSharedSelectedChoice(state.selectedChoice);
        setSharedReasoning(state.reasoning || '');
        // AI 결과는 관리자 로컬에서만 관리 (Firebase에서 동기화하지 않음)
        // setAiEvaluationResult(state.aiResult);
        setIsAiProcessing(state.isAiProcessing || false);
        setIsTeamSaved(state.isSubmitted || false);  // 팀 저장 완료 여부
        setIsRolling(state.phase === GamePhase.Rolling);

        // 주사위 롤링 상태 동기화 (모바일에서 굴렸을 때 관리자 대시보드에서도 표시)
        // 단, 이미 오버레이가 표시 중이면 pendingDice 업데이트 안함 (버그 방지)
        if (state.phase === GamePhase.Rolling && !localOperationInProgress.current && !showDiceOverlay) {
          // 다른 클라이언트에서 주사위를 굴린 경우 - 주사위 오버레이 표시
          setPendingDice(state.diceValue || [1, 1]);
          setShowDiceOverlay(true);
        }

        // 게임 시작 여부 동기화 (참가자가 주사위 굴릴 수 있도록)
        if (state.isGameStarted !== undefined) {
          setIsGameStarted(state.isGameStarted);
        }

        // 관람자 투표 동기화
        if (state.spectatorVotes) {
          setSpectatorVotes(state.spectatorVotes);
        }

        // gameLogs는 길이가 다를 때만 업데이트 (배열 참조 비교로 인한 무한 루프 방지)
        if (state.gameLogs?.length) {
          setGameLogs(prev => {
            if (prev.length === state.gameLogs.length) {
              return prev; // 같은 길이면 기존 참조 유지
            }
            return state.gameLogs;
          });
        }

        // 카드가 있으면 모달 표시
        if (state.currentCard && state.phase === GamePhase.Decision) {
          setShowCardModal(true);
        }
        if (state.aiResult && state.phase !== GamePhase.Decision) {
          setShowCardModal(false);
        }

        // 짧은 지연 후 플래그 해제 (상태 업데이트가 완료된 후)
        setTimeout(() => { isReceivingFromFirebase.current = false; }, 100);
      }
    });

    return () => unsubscribe();
  }, [currentSessionId]);

  // --- Firebase: 게임 상태 저장 (변경 시) ---
  const saveGameStateToFirebase = useCallback(async () => {
    if (!currentSessionId) return;

    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (!isFirebaseConfigured) return;

    try {
      await firestoreService.updateGameState(currentSessionId, {
        sessionId: currentSessionId,
        phase: gamePhase,
        currentTeamIndex: currentTurnIndex,
        currentTurn: 0,
        diceValue: diceValue,
        currentCard: activeCard,
        selectedChoice: sharedSelectedChoice,
        reasoning: sharedReasoning,
        aiResult: aiEvaluationResult,
        isSubmitted: !!aiEvaluationResult,
        isAiProcessing: isAiProcessing,
        isGameStarted: isGameStarted,  // 게임 시작 여부 저장
        gameLogs: gameLogsRef.current, // ref 사용으로 의존성 루프 방지
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Firebase 게임 상태 저장 실패:', error);
    }
  }, [currentSessionId, gamePhase, currentTurnIndex, diceValue, activeCard, sharedSelectedChoice, sharedReasoning, aiEvaluationResult, isAiProcessing, isGameStarted]);

  // 게임 상태 변경 시 Firebase에 저장 (디바운스 적용)
  useEffect(() => {
    // Firebase에서 방금 받은 데이터면 다시 저장하지 않음 (무한 루프 방지)
    if (isReceivingFromFirebase.current) {
      return;
    }

    // Rolling/Moving 상태는 handleRollDice()와 performMove()에서 직접 저장
    if (gamePhase === GamePhase.Rolling || gamePhase === GamePhase.Moving) {
      return;
    }

    // Decision 상태에서만 자동 저장 (사용자 입력 동기화)
    if (currentSessionId && gamePhase === GamePhase.Decision && activeCard) {
      // 기존 타이머 취소
      if (saveDebounceTimer.current) {
        clearTimeout(saveDebounceTimer.current);
      }
      // 500ms 디바운스 (빠른 타이핑 중 연속 저장 방지)
      saveDebounceTimer.current = setTimeout(() => {
        if (!isReceivingFromFirebase.current) {
          saveGameStateToFirebase();
        }
      }, 500);
    }

    return () => {
      if (saveDebounceTimer.current) {
        clearTimeout(saveDebounceTimer.current);
      }
    };
  }, [sharedSelectedChoice, sharedReasoning, aiEvaluationResult, isAiProcessing, gamePhase, currentSessionId, activeCard, saveGameStateToFirebase]);

  // --- 세션의 customCards 변경 시 activeCard 실시간 업데이트 ---
  useEffect(() => {
    // activeCard가 있고, 세션에 customCards가 있을 때
    if (activeCard && sessionCustomCards.length > 0) {
      // 현재 activeCard의 ID로 최신 카드 찾기
      const updatedCard = sessionCustomCards.find((c: GameCard) => c.id === activeCard.id);
      if (updatedCard) {
        // 카드 내용이 변경되었는지 확인 (깊은 비교)
        const hasChanged =
          updatedCard.title !== activeCard.title ||
          updatedCard.situation !== activeCard.situation ||
          updatedCard.learningPoint !== activeCard.learningPoint ||
          JSON.stringify(updatedCard.choices) !== JSON.stringify(activeCard.choices);

        if (hasChanged) {
          console.log('[Card Sync] 카드 내용이 업데이트됨:', updatedCard.title);
          setActiveCard(updatedCard);

          // Firebase gameState의 currentCard도 업데이트
          if (currentSessionId) {
            const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
            if (isFirebaseConfigured) {
              firestoreService.updateGameState(currentSessionId, {
                currentCard: updatedCard,
                lastUpdated: Date.now()
              }).catch(err => console.error('Firebase 카드 동기화 실패:', err));
            }
          }
        }
      }
    }
  }, [sessionCustomCards, activeCard?.id, currentSessionId]);

  // --- Session Logic ---

  const handleCreateSession = async (name: string, version: GameVersion, teamCount: number) => {
    const newSessionId = `sess_${Date.now()}`;
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Generate initial teams based on count
    const newTeams: Team[] = [];
    const colors = Object.values(TeamColor);

    for (let i = 0; i < teamCount; i++) {
      newTeams.push({
        id: `t_${newSessionId}_${i}`,
        name: `${i + 1}팀`,
        color: colors[i % colors.length],
        position: 0,
        resources: { ...INITIAL_RESOURCES },
        isBurnout: false,
        burnoutCounter: 0,
        lapCount: 0,
        members: [],
        currentMemberIndex: 0,
        history: [] // Init history
      });
    }

    const newSession: Session = {
      id: newSessionId,
      name,
      version,
      teamCount,
      status: 'active',
      accessCode,
      createdAt: Date.now(),
      teams: newTeams
    };

    // Firebase에 저장 (설정되어 있으면)
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.createSession(newSession);
        // Firebase 구독이 자동으로 세션을 추가하므로 여기서는 추가하지 않음
        return;
      } catch (error) {
        console.error('Firebase 세션 생성 실패:', error);
        throw error; // 에러를 상위로 전달
      }
    }

    // Firebase 미설정 시에만 로컬 상태 업데이트
    setSessions(prev => [newSession, ...prev]);
  };

  const handleDeleteSession = async (sessionId: string) => {
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.deleteSession(sessionId);
        // Firebase 구독이 자동으로 세션을 제거하므로 여기서는 제거하지 않음
        return;
      } catch (error) {
        console.error('Firebase 세션 삭제 실패:', error);
      }
    }
    // Firebase 미설정 시에만 로컬 상태 업데이트
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleUpdateSessionStatus = async (sessionId: string, status: SessionStatus) => {
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.updateSessionStatus(sessionId, status);
      } catch (error) {
        console.error('Firebase 세션 상태 업데이트 실패:', error);
      }
    }
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status } : s));
  };

  const handleEnterSession = (session: Session) => {
    setCurrentSessionId(session.id);
    setCurrentTurnIndex(0);
    setGamePhase(GamePhase.WaitingToStart);
    setIsGameStarted(false);
    setMonitoringTeamId(session.teams[0]?.id || null);
    setGameLogs([`Entered Session: ${session.name}`, `Status: ${session.status}`]);
    setView('game');
  };

  // 게임 시작 핸들러
  const handleStartGame = async () => {
    setIsGameStarted(true);
    setGamePhase(GamePhase.Idle);
    addLog('🎮 게임이 시작되었습니다!');
    soundEffects.playGameStart();

    // Firebase에 게임 상태 저장
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured && currentSessionId) {
      try {
        await firestoreService.updateGameState(currentSessionId, {
          sessionId: currentSessionId,
          phase: GamePhase.Idle,
          currentTeamIndex: 0,
          currentTurn: 0,
          diceValue: [1, 1],
          currentCard: null,
          selectedChoice: null,
          reasoning: '',
          aiResult: null,
          isSubmitted: false,
          isAiProcessing: false,
          isGameStarted: true,
          gameLogs: gameLogsRef.current,
          lastUpdated: Date.now()
        });
      } catch (err) {
        console.error('Firebase 게임 시작 상태 저장 실패:', err);
      }
    }
  };

  // 게임 일시정지 핸들러
  const handlePauseGame = async () => {
    setPhaseBeforePause(gamePhase);
    setGamePhase(GamePhase.Paused);
    addLog('⏸️ 게임이 일시정지되었습니다.');
    soundEffects.playPause();

    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured && currentSessionId) {
      try {
        await firestoreService.updateGameState(currentSessionId, {
          sessionId: currentSessionId,
          phase: GamePhase.Paused,
          currentTeamIndex: currentTurnIndex,
          currentTurn: 0,
          diceValue: diceValue,
          currentCard: activeCard,
          selectedChoice: sharedSelectedChoice,
          reasoning: sharedReasoning,
          aiResult: aiEvaluationResult,
          isSubmitted: isTeamSaved,
          isAiProcessing: isAiProcessing,
          gameLogs: gameLogsRef.current,
          lastUpdated: Date.now()
        });
      } catch (err) {
        console.error('Firebase 일시정지 상태 저장 실패:', err);
      }
    }
  };

  // 게임 재개 핸들러
  const handleResumeGame = async () => {
    setGamePhase(phaseBeforePause || GamePhase.Idle);
    addLog('▶️ 게임이 재개되었습니다.');

    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured && currentSessionId) {
      try {
        await firestoreService.updateGameState(currentSessionId, {
          sessionId: currentSessionId,
          phase: phaseBeforePause || GamePhase.Idle,
          currentTeamIndex: currentTurnIndex,
          currentTurn: 0,
          diceValue: diceValue,
          currentCard: activeCard,
          selectedChoice: sharedSelectedChoice,
          reasoning: sharedReasoning,
          aiResult: aiEvaluationResult,
          isSubmitted: isTeamSaved,
          isAiProcessing: isAiProcessing,
          gameLogs: gameLogsRef.current,
          lastUpdated: Date.now()
        });
      } catch (err) {
        console.error('Firebase 재개 상태 저장 실패:', err);
      }
    }
  };

  // 참가자 세션 참여 핸들러
  const handleUserJoin = async (accessCode: string) => {
    setIsJoining(true);
    setJoinError('');

    try {
      // Firebase에서 세션 찾기
      const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;

      let foundSession: Session | null = null;

      if (isFirebaseConfigured) {
        // Firebase에서 접속 코드로 세션 검색
        foundSession = await firestoreService.getSessionByAccessCode(accessCode);
      } else {
        // 로컬 세션에서 검색
        foundSession = sessions.find(s => s.accessCode === accessCode) || null;
      }

      if (!foundSession) {
        setJoinError('세션을 찾을 수 없습니다. 접속 코드를 확인해주세요.');
        setIsJoining(false);
        return;
      }

      if (foundSession.status !== 'active') {
        setJoinError('이 세션은 현재 활성화되지 않았습니다.');
        setIsJoining(false);
        return;
      }

      // 세션 입장
      setCurrentSessionId(foundSession.id);

      // 로컬 세션 목록에 추가 (없으면)
      setSessions(prev => {
        if (prev.find(s => s.id === foundSession!.id)) return prev;
        return [...prev, foundSession!];
      });

      // URL에서 join 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);

      // 참가자 뷰로 이동
      setView('participant');

    } catch (error) {
      console.error('세션 참여 실패:', error);
      setJoinError('세션 참여 중 오류가 발생했습니다.');
    } finally {
      setIsJoining(false);
    }
  };

  // 참가자 팀 선택 핸들러
  const handleSelectTeam = (teamId: string) => {
    setParticipantTeamId(teamId);
  };

  // 참가자 팀 참여 핸들러 (이름 입력 후)
  const handleJoinTeam = async (teamId: string, playerName: string) => {
    if (!playerName.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    // currentSession이 없으면 Firebase에서 직접 조회
    let sessionToUpdate = currentSession;

    if (!sessionToUpdate && currentSessionId) {
      const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (isFirebaseConfigured) {
        try {
          sessionToUpdate = await firestoreService.getSession(currentSessionId);
        } catch (error) {
          console.error('세션 조회 실패:', error);
        }
      }
    }

    if (!sessionToUpdate) {
      alert('세션을 찾을 수 없습니다. 다시 시도해주세요.');
      return;
    }

    const newPlayer = {
      id: `player_${Date.now()}`,
      name: playerName.trim()
    };

    // 팀에 멤버 추가
    const updatedTeams = sessionToUpdate.teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          members: [...team.members, newPlayer]
        };
      }
      return team;
    });

    // Firebase에 저장
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.updateTeams(currentSessionId!, updatedTeams);
        console.log('[Firebase] 팀원 추가 완료:', playerName);
      } catch (error) {
        console.error('Firebase 팀원 추가 실패:', error);
        alert('팀 참여에 실패했습니다. 다시 시도해주세요.');
        return;
      }
    }

    // 로컬 상태 업데이트
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, teams: updatedTeams };
      }
      return s;
    }));

    setParticipantName(playerName.trim());
    setIsJoinedTeam(true);
  };

  const updateTeamsInSession = async (updatedTeams: Team[]) => {
    if (!currentSessionId) return;

    // Firebase에 저장 (설정되어 있으면)
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.updateTeams(currentSessionId, updatedTeams);
      } catch (error) {
        console.error('Firebase 팀 업데이트 실패:', error);
      }
    }

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, teams: updatedTeams };
      }
      return s;
    }));
  };

  // 세션에 커스텀 카드 및 배경 이미지 저장 (세션별 맞춤형 카드)
  const updateCustomCardsInSession = async (cards: GameCard[], customBoardImage?: string) => {
    if (!currentSessionId) return;

    // Firebase는 undefined 값을 지원하지 않으므로 제거
    const cleanCard = (card: any): any => {
      const cleaned: any = {};
      Object.keys(card).forEach(key => {
        const value = card[key];
        if (value !== undefined) {
          if (Array.isArray(value)) {
            cleaned[key] = value.map(item =>
              typeof item === 'object' && item !== null ? cleanCard(item) : item
            );
          } else if (typeof value === 'object' && value !== null) {
            cleaned[key] = cleanCard(value);
          } else {
            cleaned[key] = value;
          }
        }
      });
      return cleaned;
    };

    const cleanedCards = cards.map(card => cleanCard(card));

    const updateData: { customCards: GameCard[]; customBoardImage?: string } = { customCards: cleanedCards };
    if (customBoardImage !== undefined && customBoardImage !== '') {
      updateData.customBoardImage = customBoardImage;
    }

    console.log('[Card Save] 카드 저장 시작:', { sessionId: currentSessionId, cardCount: cleanedCards.length });

    // Firebase에 저장 (설정되어 있으면)
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.updateSession(currentSessionId, updateData);
        console.log('[Card Save] Firebase 저장 성공:', { cardCount: cleanedCards.length, firstCardTitle: cleanedCards[0]?.title });

        // 저장 후 즉시 확인 - 제대로 저장되었는지 검증
        const savedSession = await firestoreService.getSession(currentSessionId);
        if (savedSession?.customCards?.length !== cleanedCards.length) {
          console.error('[Card Save] 저장 확인 실패: 카드 수 불일치', {
            expected: cleanedCards.length,
            actual: savedSession?.customCards?.length
          });
          alert('카드 저장이 완료되지 않았습니다. 다시 시도해주세요.');
          return;
        }
        console.log('[Card Save] 저장 확인 완료:', { savedCardsCount: savedSession.customCards.length });
      } catch (error) {
        console.error('[Card Save] Firebase 커스텀 카드 업데이트 실패:', error);
        alert('카드 저장에 실패했습니다. 다시 시도해주세요.');
        return;
      }
    }

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, ...updateData };
      }
      return s;
    }));

    console.log('[Card Save] 로컬 상태 업데이트 완료');
  };

  // Timer - gamePhase만 의존하여 불필요한 재생성 방지
  useEffect(() => {
    let interval: any;
    if (gamePhase === GamePhase.Decision) {
      interval = setInterval(() => {
        setTurnTimeLeft((prev) => {
          if (prev <= 0) return 0;
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gamePhase]);

  const addLog = useCallback(async (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ko-KR');
    const logEntry = `[${timestamp}] ${message}`;
    setGameLogs(prev => [...prev, logEntry]);

    // Firebase에도 로그 저장
    if (currentSessionId) {
      const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (isFirebaseConfigured) {
        try {
          await firestoreService.addGameLog(currentSessionId, logEntry);
        } catch (error) {
          console.error('Firebase 로그 저장 실패:', error);
        }
      }
    }
  }, [currentSessionId]);

  const nextTurn = useCallback(() => {
    if (!currentSession) return;

    // Reset Shared State
    setShowCardModal(false);
    setActiveCard(null);
    setSharedSelectedChoice(null);
    setSharedReasoning('');
    setAiEvaluationResult(null);
    setIsAiProcessing(false);
    setIsTeamSaved(false);
    setIsSaving(false);
    setSpectatorVotes({});  // 관람자 투표 초기화
    setMySpectatorVote(null);  // 내 투표 초기화

    setGamePhase(GamePhase.Idle);
    setTurnTimeLeft(120);
    
    // Rotate team members
    const updatedTeams = currentSession.teams.map((team, idx) => {
      if (idx === currentTurnIndex && team.members.length > 0) {
        const nextMemberIndex = (team.currentMemberIndex + 1) % team.members.length;
        return { ...team, currentMemberIndex: nextMemberIndex };
      }
      return team;
    });
    
    updateTeamsInSession(updatedTeams);
    setCurrentTurnIndex((prev) => (prev + 1) % currentSession.teams.length);
  }, [currentSession, currentTurnIndex, currentSessionId]);

  // 게임 리셋 함수
  const handleResetGame = useCallback(async () => {
    if (!currentSession || !currentSessionId) return;

    const confirmed = window.confirm('게임을 초기화하시겠습니까? 모든 팀의 점수와 히스토리가 리셋됩니다.');
    if (!confirmed) return;

    // 모든 팀 초기화
    const resetTeams = currentSession.teams.map(team => ({
      ...team,
      position: 0,
      resources: { ...INITIAL_RESOURCES },
      isBurnout: false,
      burnoutCounter: 0,
      lapCount: 0,
      currentMemberIndex: 0,
      history: []
    }));

    // 로컬 상태 초기화
    setShowCardModal(false);
    setActiveCard(null);
    setSharedSelectedChoice(null);
    setSharedReasoning('');
    setAiEvaluationResult(null);
    setIsAiProcessing(false);
    setIsTeamSaved(false);
    setIsSaving(false);
    setSpectatorVotes({});  // 관람자 투표 초기화
    setMySpectatorVote(null);  // 내 투표 초기화
    setGamePhase(GamePhase.Idle);
    setCurrentTurnIndex(0);
    setDiceValue([1, 1]);
    setTurnTimeLeft(120);
    setGameLogs(['[시스템] 게임이 리셋되었습니다.']);
    gameLogsRef.current = ['[시스템] 게임이 리셋되었습니다.'];

    // Firebase 업데이트
    await updateTeamsInSession(resetTeams);

    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.updateGameState(currentSessionId, {
          sessionId: currentSessionId,
          phase: GamePhase.Idle,
          currentTeamIndex: 0,
          currentTurn: 0,
          diceValue: [1, 1],
          currentCard: null,
          selectedChoice: null,
          reasoning: '',
          aiResult: null,
          isSubmitted: false,
          isAiProcessing: false,
          gameLogs: ['[시스템] 게임이 리셋되었습니다.'],
          lastUpdated: Date.now()
        });
      } catch (err) {
        console.error('Firebase 리셋 실패:', err);
      }
    }

    alert('게임이 초기화되었습니다!');
  }, [currentSession, currentSessionId]);

  const updateTeamHistory = (teamId: string, record: TurnRecord) => {
    if (!currentSession) return;
    const updatedTeams = currentSession.teams.map(team => {
      if (team.id !== teamId) return team;
      return { ...team, history: [...team.history, record] };
    });
    updateTeamsInSession(updatedTeams);
  };

  const updateTeamResources = async (teamId: string, changes: any) => {
    if (!currentSession) return;
    const updatedTeams = currentSession.teams.map(team => {
      if (team.id !== teamId) return team;

      const newResources = { ...team.resources };

      // Update resources without capping (allow negative and >100)
      if (changes.capital !== undefined) newResources.capital += changes.capital;
      if (changes.energy !== undefined) newResources.energy += changes.energy;
      if (changes.reputation !== undefined) newResources.reputation += changes.reputation;
      if (changes.trust !== undefined) newResources.trust += changes.trust;
      if (changes.competency !== undefined) newResources.competency += changes.competency;
      if (changes.insight !== undefined) newResources.insight += changes.insight;

      return { ...team, resources: newResources };
    });
    await updateTeamsInSession(updatedTeams);
  };

  // --- Core Game Actions ---

  // GameVersion을 카드 타입으로 변환하는 헬퍼 함수
  const getCardTypeFromVersion = (version: GameVersion | string | undefined): 'CoreValue' | 'Communication' | 'NewEmployee' => {
    switch (version) {
      case GameVersion.CoreValue:
      case '핵심가치':
        return 'CoreValue';
      case GameVersion.Communication:
      case '소통&갈등관리':
        return 'Communication';
      case GameVersion.NewEmployee:
      case '신입직원 직장생활':
        return 'NewEmployee';
      default:
        return 'CoreValue'; // 기본값
    }
  };

  // 모드별 역량 카드 배열 가져오기 헬퍼 함수
  const getModeCards = (mode: 'CoreValue' | 'Communication' | 'NewEmployee') => {
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

  // 역량 ID를 한글 이름으로 변환하는 헬퍼 함수
  const getCompetencyName = (competencyId: string | undefined): string => {
    if (!competencyId) return '일반';
    const square = BOARD_SQUARES.find(s => s.competency === competencyId);
    if (square) {
      // 이름에서 한글 부분만 추출 (예: '자기 인식 (Self-Awareness)' → '자기 인식')
      const match = square.name.match(/^([^(]+)/);
      return match ? match[1].trim() : square.name;
    }
    return competencyId;
  };

  const handleLandOnSquare = (team: Team, squareIndex: number) => {
    const square = BOARD_SQUARES.find(s => s.index === squareIndex);
    if (!square) return;

    // 자기 팀이 이미 해당 위치에서 카드를 풀었는지 확인 (City 칸만 해당)
    // 현재 세션에서 팀 정보 가져오기
    const currentTeamFromSession = currentSession?.teams.find(t => t.id === team.id);
    const alreadySolvedPositions = currentTeamFromSession?.history
      ?.filter(h => h.position !== undefined)
      .map(h => h.position) || [];

    if (square.type === SquareType.City && alreadySolvedPositions.includes(squareIndex)) {
      // 이미 푼 역량카드 → 추가 주사위 굴리기
      addLog(`🔄 ${team.name}: 이미 풀었던 역량카드입니다. 추가 주사위를 굴립니다!`);

      // 추가 주사위 굴리기 (1~6 랜덤)
      const extraDie1 = Math.ceil(Math.random() * 6);
      const extraDie2 = Math.ceil(Math.random() * 6);
      const extraSteps = extraDie1 + extraDie2;

      addLog(`🎲 추가 주사위: ${extraDie1} + ${extraDie2} = ${extraSteps}칸 이동`);

      // 새 위치 계산
      let newPos = squareIndex + extraSteps;
      let passedStart = false;
      if (newPos >= BOARD_SIZE) {
        newPos = newPos % BOARD_SIZE;
        passedStart = true;
      }

      // 팀 위치 업데이트
      if (currentSession) {
        const updatedTeams = currentSession.teams.map(t => {
          if (t.id === team.id) {
            let newResources = { ...t.resources };
            let newLapCount = t.lapCount;
            if (passedStart) {
              newResources.capital += 20;
              newResources.energy += LAP_BONUS.energy;
              newResources.trust += LAP_BONUS.trust;
              newResources.competency += LAP_BONUS.competency;
              newResources.insight += LAP_BONUS.insight;
              newLapCount += 1;
              addLog(`🎉 ${t.name} 한 바퀴 완주! 보너스 획득`);
            }
            return { ...t, position: newPos, resources: newResources, lapCount: newLapCount };
          }
          return t;
        });
        updateTeamsInSession(updatedTeams);
      }

      // 새 위치에서 다시 handleLandOnSquare 호출 (재귀)
      setTimeout(() => {
        handleLandOnSquare({ ...team, position: newPos }, newPos);
      }, 1000);
      return;
    }

    // 세션 모드에 맞는 카드 배열 선택
    const sessionCardType = getCardTypeFromVersion(currentSession?.version);
    const modeCards = getModeCards(sessionCardType);

    // 세션의 커스텀 카드가 있으면 사용, 없으면 기본 카드 사용
    const sessionCards = currentSession?.customCards || [];
    const allCards = sessionCards.length > 0 ? sessionCards : [...modeCards, ...EVENT_CARDS];

    // Helper to pick random card by type
    const pickRandomCard = (type: string, fallbackCard?: GameCard) => {
      const candidates = allCards.filter(c => c.type === type);
      return candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : fallbackCard || allCards[0];
    };

    let selectedCard: GameCard | null = null;

    // 커스텀 모드: 모든 칸(특수 칸 포함)에서 boardIndex로 업로드된 카드 사용
    const isCustomMode = currentSession?.version === GameVersion.Custom;

    // 출발 칸은 모든 모드에서 동일하게 처리 (보너스만 주고 넘어감)
    if (square.type === SquareType.Start) {
      updateTeamResources(team.id, { capital: 50 });
      nextTurn();
      return;
    }

    if (isCustomMode && sessionCards.length > 0) {
      // 커스텀 모드: boardIndex로 카드 찾기 (모든 칸에서)
      const customCard = sessionCards.find((c: any) => c.boardIndex === square.index);
      selectedCard = customCard || sessionCards[0];
      console.log(`[Card Selection] Custom Mode - Square: ${square.index}, Type: ${square.type}, Found: ${customCard?.title || 'fallback'}`);

      // 커스텀 모드 특수 칸 효과 적용
      // 2배 찬스: 인덱스 2, 12, 31
      if ([2, 12, 31].includes(square.index)) {
        setCustomScoreMultiplier(2);
        addLog(`🎲 [${team.name}] 2배 찬스! AI 평가 점수가 2배로 적용됩니다.`);
      }
      // 나눔카드: 인덱스 7, 19
      else if ([7, 19].includes(square.index)) {
        setIsSharingMode(true);
        addLog(`🤝 [${team.name}] 나눔카드! 이 팀이 얻는 점수가 모든 팀에게 동일하게 적용됩니다.`);
      }
      // 3배 찬스: 인덱스 16, 24
      else if ([16, 24].includes(square.index)) {
        setCustomScoreMultiplier(3);
        addLog(`🚀 [${team.name}] 3배 찬스! AI 평가 점수가 3배로 적용됩니다.`);
      }
      // 번아웃존: 인덱스 8 - 5개 영역 각 -10점 즉시 적용
      else if (square.index === 8) {
        const burnoutPenalty = { capital: -10, energy: -10, trust: -10, competency: -10, insight: -10 };
        updateTeamResources(team.id, burnoutPenalty);
        addLog(`🔥 [${team.name}] 번아웃존! 5개 영역에서 각각 -10 POINT 감점됩니다.`);
      }
      // 성장펀드: 인덱스 27 - 5개 영역 각 +10점 즉시 적용
      else if (square.index === 27) {
        const growthBonus = { capital: 10, energy: 10, trust: 10, competency: 10, insight: 10 };
        updateTeamResources(team.id, growthBonus);
        addLog(`📈 [${team.name}] 성장펀드! 5개 영역에서 각각 +10 POINT 보너스를 받습니다.`);
      }
    }
    else if (square.type === SquareType.City) {
      // 일반 모드: 역량(competency)에 맞는 카드 선택
      const targetCompetency = getCompetencyForSquare(square.index, sessionCardType);
      const exactCard = allCards.find(c => c.competency === targetCompetency);
      selectedCard = exactCard || modeCards[0];
      console.log(`[Card Selection] Square: ${square.index}, Mode: ${sessionCardType}, Target: ${targetCompetency}, Found: ${exactCard?.title || 'fallback'}`);
    }
    else if (square.type === SquareType.GoldenKey) {
      // 찬스카드 타입 확인 (1/3/5 → lottery, 2/4 → risk)
      const chanceCardType = getChanceCardType(square.index);
      const chanceCardOrder = CHANCE_CARD_SQUARES.indexOf(square.index) + 1; // 1-based

      if (chanceCardType === 'lottery') {
        // 복권 보너스 팝업 표시
        setLotteryBonusInfo({ teamName: team.name, chanceCardNumber: chanceCardOrder });
        setShowLotteryBonus(true);
        addLog(`🎫 [${team.name}] ${chanceCardOrder}번째 찬스카드 - 복권 보너스 획득!`);
      } else if (chanceCardType === 'risk') {
        // 리스크 카드 모드 설정 (AI 평가 시 모든 점수 마이너스)
        setRiskCardInfo({ teamName: team.name, chanceCardNumber: chanceCardOrder });
        setShowRiskCard(true);
        setIsRiskCardMode(true);
        addLog(`⚠️ [${team.name}] ${chanceCardOrder}번째 찬스카드 - 리스크 카드!`);
      }

      // 우연한 기회 - Event 카드 중 랜덤
      // 세션에 customCards가 있으면 사용 (모든 모드에서 세션별 카드 수정 반영)
      const eventCardPool = sessionCards.length > 0
        ? sessionCards.filter((c: any) => c.type === 'Event')
        : EVENT_CARDS.filter(c => c.type === 'Event');
      selectedCard = eventCardPool.length > 0
        ? eventCardPool[Math.floor(Math.random() * eventCardPool.length)]
        : EVENT_CARDS[0];
    }
    else if (square.type === SquareType.Fund) {
      // 성장 기회 - Growth 카드
      const growthCardPool = sessionCards.length > 0
        ? sessionCards.filter((c: any) => c.type === 'Growth')
        : EVENT_CARDS.filter(c => c.type === 'Growth');
      selectedCard = growthCardPool[0] || EVENT_CARDS.find(c => c.type === 'Growth') || EVENT_CARDS[0];
    }
    else if (square.type === SquareType.Space) {
      // 도전 과제 - Challenge 카드
      const challengeCardPool = sessionCards.length > 0
        ? sessionCards.filter((c: any) => c.type === 'Challenge')
        : EVENT_CARDS.filter(c => c.type === 'Challenge');
      selectedCard = challengeCardPool[0] || EVENT_CARDS.find(c => c.type === 'Challenge') || EVENT_CARDS[0];
    }
    else if (square.type === SquareType.WorldTour) {
      // 특별 이벤트 - Event 카드 중 랜덤
      const worldTourCardPool = sessionCards.length > 0
        ? sessionCards.filter((c: any) => c.type === 'Event')
        : EVENT_CARDS.filter(c => c.type === 'Event');
      selectedCard = worldTourCardPool.length > 0
        ? worldTourCardPool[Math.floor(Math.random() * worldTourCardPool.length)]
        : EVENT_CARDS[0];
    }
    else if (square.type === SquareType.Island) {
      // 번아웃 - Burnout 카드
      const burnoutCardPool = sessionCards.length > 0
        ? sessionCards.filter((c: any) => c.type === 'Burnout')
        : EVENT_CARDS.filter(c => c.type === 'Burnout');
      selectedCard = burnoutCardPool[0] || EVENT_CARDS.find(c => c.type === 'Burnout') || EVENT_CARDS[0];
    }
    else {
      nextTurn();
      return;
    }

    if (selectedCard) {
      setActiveCard(selectedCard);
      setSharedSelectedChoice(null);
      setSharedReasoning('');
      setAiEvaluationResult(null);
      setSpectatorVotes({});  // 관람자 투표 초기화
      setMySpectatorVote(null);  // 내 투표 초기화
      setSpectatorModalDismissed(false);  // 관람자 모달 닫기 상태 초기화
      setGamePhase(GamePhase.Decision);
      setShowCardModal(true);

      // 즉시 Firebase에 게임 상태 저장 (팀원들이 카드를 볼 수 있도록)
      const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (isFirebaseConfigured && currentSessionId) {
        firestoreService.updateGameState(currentSessionId, {
          sessionId: currentSessionId,
          phase: GamePhase.Decision,
          currentTeamIndex: currentTurnIndex,
          currentTurn: 0,
          diceValue: diceValue,
          currentCard: selectedCard,
          selectedChoice: null,
          reasoning: '',
          aiResult: null,
          isSubmitted: false,
          isAiProcessing: false,
          spectatorVotes: {},  // 관람자 투표 초기화
          gameLogs: gameLogsRef.current,
          lastUpdated: Date.now()
        }).catch(err => console.error('Firebase 상태 저장 실패:', err));
      }
    }
  };

  const handleRollDice = () => {
    if (isRolling || gamePhase === GamePhase.Rolling) return;

    // 로컬 작업 시작 - Firebase가 이 상태를 덮어쓰지 않도록 보호
    localOperationInProgress.current = true;
    localOperationTimestamp.current = Date.now();

    // 주사위 결과 미리 계산
    const die1 = Math.ceil(Math.random() * 6);
    const die2 = Math.ceil(Math.random() * 6);
    setPendingDice([die1, die2]);

    setIsRolling(true);
    setGamePhase(GamePhase.Rolling);
    setShowDiceOverlay(true);  // 3D 주사위 오버레이 표시

    // Firebase에 Rolling 상태 저장 시도 (실패해도 로컬 게임은 계속 진행)
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured && currentSessionId) {
      firestoreService.updateGameState(currentSessionId, {
        sessionId: currentSessionId,
        phase: GamePhase.Rolling,
        currentTeamIndex: currentTurnIndex,
        currentTurn: 0,
        diceValue: [die1, die2],
        currentCard: null,
        selectedChoice: null,
        reasoning: '',
        aiResult: null,
        isSubmitted: false,
        isAiProcessing: false,
        gameLogs: gameLogsRef.current,
        lastUpdated: Date.now()
      }).catch(err => console.warn('[Firebase] Rolling 상태 저장 실패 (게임은 계속 진행):', err.message));
    }
  };

  // 3D 주사위 롤 완료 핸들러
  const handleDiceRollComplete = () => {
    setIsRolling(false);
    setDiceValue(pendingDice);

    // 더블 체크 및 음향 효과
    const isDouble = pendingDice[0] === pendingDice[1];
    setIsDoubleChance(isDouble);  // 더블 찬스 설정 (AI 점수 2배 적용)

    if (isDouble) {
      soundEffects.playDoubleBonus();
      addLog(`🎲 더블 찬스! (${pendingDice[0]}+${pendingDice[1]}) AI 평가 점수 2배 적용!`);
    } else {
      soundEffects.playDiceResult();
    }
  };

  // 주사위 결과 표시 완료 핸들러 (3초 후)
  const handleDiceResultComplete = () => {
    setShowDiceOverlay(false);
    performMove(pendingDice[0], pendingDice[1]);
  };

  const finalizeRoll = () => {
    const die1 = Math.ceil(Math.random() * 6);
    const die2 = Math.ceil(Math.random() * 6);
    performMove(die1, die2);
  };

  const handleManualRoll = (total: number) => {
    const die1 = Math.floor(total / 2);
    const die2 = total - die1;
    performMove(die1, die2);
  };

  const performMove = (die1: number, die2: number) => {
    setDiceValue([die1, die2]);
    setIsRolling(false);
    setGamePhase(GamePhase.Moving);

    // 로컬 작업 완료 - Firebase 동기화 다시 허용
    localOperationInProgress.current = false;
    localOperationTimestamp.current = Date.now();

    if (!currentTeam) return;

    // 더블 체크 (주사위 2개가 같은 숫자)
    const isDouble = die1 === die2;
    if (isDouble && currentSession) {
      // 더블 보너스 즉시 적용
      const updatedTeams = currentSession.teams.map(t => {
        if (t.id === currentTeam.id) {
          const newResources = { ...t.resources };
          newResources.energy += DOUBLE_BONUS.energy;        // +5
          newResources.trust += DOUBLE_BONUS.trust;          // +5
          newResources.competency += DOUBLE_BONUS.competency; // +5
          newResources.insight += DOUBLE_BONUS.insight;      // +5
          return { ...t, resources: newResources };
        }
        return t;
      });
      updateTeamsInSession(updatedTeams);
      addLog(`🎲 더블! ${currentTeam.name} 보너스 획득: 에너지+${DOUBLE_BONUS.energy}, 신뢰+${DOUBLE_BONUS.trust}, 스킬+${DOUBLE_BONUS.competency}, 인사이트+${DOUBLE_BONUS.insight}`);
    }

    // Firebase에 주사위 결과와 Moving 상태 저장 (실패해도 로컬 게임은 계속 진행)
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured && currentSessionId) {
      firestoreService.updateGameState(currentSessionId, {
        sessionId: currentSessionId,
        phase: GamePhase.Moving,
        currentTeamIndex: currentTurnIndex,
        currentTurn: 0,
        diceValue: [die1, die2],
        currentCard: null,
        selectedChoice: null,
        reasoning: '',
        aiResult: null,
        isSubmitted: false,
        isAiProcessing: false,
        gameLogs: gameLogsRef.current,
        lastUpdated: Date.now()
      }).catch(err => console.warn('[Firebase] Moving 상태 저장 실패 (게임은 계속 진행):', err.message));
    }

    // 주사위 로그는 리포트에 불필요하므로 제거
    moveTeamLogic(currentTeam, die1 + die2);
  };

  const moveTeamLogic = (teamToMove: Team, steps: number) => {
    setGamePhase(GamePhase.Moving);
    const startPos = teamToMove.position;
    let finalPos = startPos + steps;
    let passedStart = false;

    if (finalPos >= BOARD_SIZE) {
      finalPos = finalPos % BOARD_SIZE;
      passedStart = true;
    }

    // 스타트 지점을 통과하는 스텝 번호 계산 (0-indexed)
    const stepsToStart = passedStart ? (BOARD_SIZE - startPos) : -1;

    // 한 칸씩 이동 애니메이션 (재귀적으로 처리하여 중간에 일시정지 가능)
    let currentStep = 0;

    const moveOneStep = () => {
      currentStep++;
      const previousPos = (startPos + currentStep - 1) % BOARD_SIZE;
      const intermediatePos = (startPos + currentStep) % BOARD_SIZE;

      // 이동 음향 효과
      soundEffects.playMove();

      // 팀 위치 업데이트 (중간 위치)
      if (currentSession) {
        const updatedTeams = currentSession.teams.map(t => {
          if (t.id === teamToMove.id) {
            return { ...t, position: intermediatePos };
          }
          return t;
        });
        updateTeamsInSession(updatedTeams);
      }

      // 스타트 지점 통과 체크 (이전 위치가 31이고 현재 위치가 0인 경우)
      const justPassedStart = previousPos === BOARD_SIZE - 1 && intermediatePos === 0;

      if (justPassedStart && currentStep < steps) {
        // 스타트 지점을 통과했고 아직 이동할 칸이 남아있음 → 보너스 팝업 표시
        const newLapCount = teamToMove.lapCount + 1;

        // 보너스 즉시 적용
        if (currentSession) {
          const updatedTeams = currentSession.teams.map(t => {
            if (t.id === teamToMove.id) {
              let newResources = { ...t.resources };
              newResources.capital += 20; // 기본 급여
              newResources.energy += LAP_BONUS.energy;        // +40
              newResources.trust += LAP_BONUS.trust;          // +10
              newResources.competency += LAP_BONUS.competency; // +10
              newResources.insight += LAP_BONUS.insight;      // +10

              addLog(`🎉 ${t.name} 한 바퀴 완주! 보너스 획득: 자원(시간)+20, 에너지+${LAP_BONUS.energy}, 신뢰+${LAP_BONUS.trust}, 스킬+${LAP_BONUS.competency}, 인사이트+${LAP_BONUS.insight}`);

              return { ...t, resources: newResources, lapCount: newLapCount };
            }
            return t;
          });
          updateTeamsInSession(updatedTeams);
        }

        // 팝업 표시
        setLapBonusInfo({ teamName: teamToMove.name, lapCount: newLapCount });
        setShowLapBonus(true);

        // 팝업이 닫힌 후 나머지 이동 계속 (handleLapBonusComplete에서 처리)
        // 남은 스텝 수를 저장
        const remainingSteps = steps - currentStep;
        pendingMoveRef.current = { teamToMove: { ...teamToMove, position: intermediatePos, lapCount: newLapCount }, remainingSteps, finalPos };
        return;
      }

      // 모든 칸 이동 완료
      if (currentStep >= steps) {
        // 마지막 칸이 정확히 스타트 지점인 경우 (finalPos === 0이고 passedStart)
        if (passedStart && finalPos === 0) {
          const newLapCount = teamToMove.lapCount + 1;

          if (currentSession) {
            const updatedTeams = currentSession.teams.map(t => {
              if (t.id === teamToMove.id) {
                let newResources = { ...t.resources };
                newResources.capital += 20;
                newResources.energy += LAP_BONUS.energy;
                newResources.trust += LAP_BONUS.trust;
                newResources.competency += LAP_BONUS.competency;
                newResources.insight += LAP_BONUS.insight;

                addLog(`🎉 ${t.name} 한 바퀴 완주! 보너스 획득: 자원(시간)+20, 에너지+${LAP_BONUS.energy}, 신뢰+${LAP_BONUS.trust}, 스킬+${LAP_BONUS.competency}, 인사이트+${LAP_BONUS.insight}`);

                return { ...t, position: finalPos, resources: newResources, lapCount: newLapCount };
              }
              return t;
            });
            updateTeamsInSession(updatedTeams);
          }

          // 팝업 표시 후 handleLandOnSquare 호출
          setLapBonusInfo({ teamName: teamToMove.name, lapCount: newLapCount });
          setShowLapBonus(true);
          pendingMoveRef.current = { teamToMove: { ...teamToMove, position: finalPos, lapCount: newLapCount }, remainingSteps: 0, finalPos };
          return;
        }

        // 이동 완료 처리
        finishMove(teamToMove, finalPos);
        return;
      }

      // 다음 스텝 예약
      setTimeout(moveOneStep, 400);
    };

    // 첫 스텝 시작
    setTimeout(moveOneStep, 400);
  };

  // 이동 완료 후 처리
  const finishMove = (teamToMove: Team, finalPos: number) => {
    // 도착 칸 정보 저장 (카드 미리보기용)
    const landingSquare = BOARD_SQUARES.find(s => s.index === finalPos);

    // 미리보기를 표시할 특수 칸 타입들 (출발 칸 제외)
    const previewSquareTypes = [
      SquareType.City,       // 역량카드
      SquareType.GoldenKey,  // 찬스 카드
      SquareType.Island,     // 번아웃 존
      SquareType.WorldTour,  // 글로벌 기회
      SquareType.Space,      // 도전 과제
      SquareType.Fund,       // 성장 펀드
    ];

    if (landingSquare && previewSquareTypes.includes(landingSquare.type)) {
      // 카드 미리보기 표시
      setPendingSquare(landingSquare);
      setShowCompetencyPreview(true);

      // 3초 후 자동으로 진행 (모바일에서 주사위 굴린 경우 대비)
      setTimeout(() => {
        // 아직 미리보기가 표시 중이면 자동으로 진행
        setShowCompetencyPreview(prev => {
          if (prev) {
            const updatedTeam = { ...teamToMove, position: finalPos };
            handleLandOnSquare(updatedTeam, finalPos);
            return false;
          }
          return prev;
        });
      }, 3000);
    } else {
      // 출발 칸 등은 바로 handleLandOnSquare 호출
      setTimeout(() => {
        const updatedTeam = { ...teamToMove, position: finalPos };
        handleLandOnSquare(updatedTeam, finalPos);
      }, 500);
    }
  };

  // 보류 중인 이동 정보 (한 바퀴 보너스 팝업 후 계속 이동하기 위함)
  const pendingMoveRef = useRef<{ teamToMove: Team; remainingSteps: number; finalPos: number } | null>(null);

  // 한 바퀴 보너스 팝업 완료 핸들러
  const handleLapBonusComplete = () => {
    setShowLapBonus(false);
    setLapBonusInfo(null);

    // 보류 중인 이동이 있으면 계속
    if (pendingMoveRef.current) {
      const { teamToMove, remainingSteps, finalPos } = pendingMoveRef.current;
      pendingMoveRef.current = null;

      if (remainingSteps > 0) {
        // 남은 스텝 이동 계속
        continueMove(teamToMove, remainingSteps, finalPos);
      } else {
        // 이동 완료 (스타트 지점에 정확히 도착한 경우)
        finishMove(teamToMove, finalPos);
      }
    }
  };

  // 남은 스텝 계속 이동
  const continueMove = (teamToMove: Team, remainingSteps: number, finalPos: number) => {
    let currentStep = 0;
    const startPos = teamToMove.position;

    const moveOneStep = () => {
      currentStep++;
      const intermediatePos = (startPos + currentStep) % BOARD_SIZE;

      soundEffects.playMove();

      if (currentSession) {
        const updatedTeams = currentSession.teams.map(t => {
          if (t.id === teamToMove.id) {
            return { ...t, position: intermediatePos };
          }
          return t;
        });
        updateTeamsInSession(updatedTeams);
      }

      if (currentStep >= remainingSteps) {
        finishMove({ ...teamToMove, position: finalPos }, finalPos);
        return;
      }

      setTimeout(moveOneStep, 400);
    };

    setTimeout(moveOneStep, 400);
  };

  // 역량카드 미리보기 완료 핸들러
  const handleCompetencyPreviewComplete = () => {
    setShowCompetencyPreview(false);
    if (currentTeam && pendingSquare) {
      const finalPos = pendingSquare.index;
      handleLandOnSquare({ ...currentTeam, position: finalPos }, finalPos);
    }
  };

  // --- 팀 입력 저장 (AI 호출 없이) ---

  const handleTeamSaveOnly = async () => {
    if (!currentTeam || !activeCard) return;
    if (isSaving || isTeamSaved) return;

    const isOpenEnded = !activeCard.choices || activeCard.choices.length === 0;
    if (isOpenEnded && !sharedReasoning) return;
    if (!isOpenEnded && (!sharedSelectedChoice || !sharedReasoning)) return;

    setIsSaving(true);

    // Firebase에 팀 입력 저장 (AI 결과 없이)
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured && currentSessionId) {
      try {
        await firestoreService.updateGameState(currentSessionId, {
          sessionId: currentSessionId,
          phase: gamePhase,
          currentTeamIndex: currentTurnIndex,
          currentTurn: 0,
          diceValue: diceValue,
          currentCard: activeCard,
          selectedChoice: sharedSelectedChoice,
          reasoning: sharedReasoning,
          aiResult: null,
          isSubmitted: true,      // 팀이 저장 완료
          isAiProcessing: false,  // AI는 아직 실행 안됨
          gameLogs: gameLogsRef.current,
          lastUpdated: Date.now()
        });
      } catch (err) {
        console.error('Firebase 팀 입력 저장 실패:', err);
        setIsSaving(false);
        return;
      }
    }

    setIsTeamSaved(true);
    setIsSaving(false);
  };

  // --- 관람자 투표 핸들러 ---
  const handleSpectatorVote = async (choice: Choice, voterTeamName: string) => {
    if (!currentSessionId || !voterTeamName) return;

    const previousVoteId = mySpectatorVote?.id || null;

    // 같은 옵션을 다시 클릭하면 무시
    if (previousVoteId === choice.id) return;

    // 로컬 상태 업데이트
    setMySpectatorVote(choice);

    // Firebase에 투표 업데이트 (팀 이름 포함)
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.updateSpectatorVote(currentSessionId, choice.id, previousVoteId, voterTeamName);
      } catch (err) {
        console.error('관람자 투표 저장 실패:', err);
      }
    }
  };

  // --- 관리자용 AI 평가 실행 ---

  const handleAdminAISubmit = async () => {
    if (!currentTeam || !activeCard) return;
    if (isAiProcessing) return;
    if (!isTeamSaved) return;  // 팀이 먼저 저장해야 함

    const isOpenEnded = !activeCard.choices || activeCard.choices.length === 0;

    setIsAiProcessing(true);

    // 역량명 가져오기
    const competencyName = getCompetencyName(activeCard.competency);

    // 리포트용 구조화된 로그 기록 (역량/상황/선택/이유 포함)
    addLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    addLog(`📋 [${currentTeam.name}] ${activeCard.title}`);
    addLog(`🎯 [역량] ${competencyName}`);
    addLog(`📖 [상황] ${activeCard.situation}`);
    if (!isOpenEnded && sharedSelectedChoice) {
      addLog(`✅ [선택] ${sharedSelectedChoice.text}`);
    }
    addLog(`💭 [이유] ${sharedReasoning}`);

    if (!process.env.API_KEY) {
       alert("API Key가 설정되지 않았습니다. Vercel 환경변수에 VITE_GEMINI_API_KEY를 설정해주세요.");
       setIsAiProcessing(false);
       return;
    }

    try {
      const prompt = `
        Role: Strict, insightful, and empathetic Career and Life Coach. You are a fair but critical evaluator who analyzes choices from the PROTAGONIST'S PERSPECTIVE in the given situation - not from a manager's or leader's viewpoint. Evaluate how this decision affects the protagonist personally: their growth, well-being, relationships, and career development.

        Context:
        - Card Type: "${activeCard.type}"
        - Scenario: "${activeCard.situation}"
        - Learning Point: "${activeCard.learningPoint}"
        ${isOpenEnded
          ? `- Protagonist's Open-Ended Answer: "${sharedReasoning}"`
          : `- Protagonist's Choice: "${sharedSelectedChoice?.text}" \n- Protagonist's Reasoning: "${sharedReasoning}"`
        }

        IMPORTANT: Analyze from the PROTAGONIST'S perspective - the person facing the situation described. Consider their personal growth, work-life balance, emotional well-being, and career development.

        CRITICAL SCORING PRINCIPLES:
        **FIRST: CHECK FOR LOW-EFFORT/INSINCERE RESPONSES**
        - If the reasoning is less than 10 characters, random letters (like "asdf", "sdaf", "ㅁㄴㅇㄹ"),
          or clearly meaningless (numbers only, repeated characters, gibberish),
          IMMEDIATELY give ALL NEGATIVE scores: -5 to -10 in EVERY category.
        - Short, lazy answers like "몰라", "그냥", "ㅇㅇ", "ok", single words without explanation
          should receive -3 to -6 in every category.
        - The feedback should clearly state: "성의 없는 응답입니다. 구체적인 이유를 작성해주세요."

        1. ALWAYS identify BOTH advantages AND disadvantages/trade-offs of the choice.
        2. Score Range: Each category should be between -10 to +10.
           - +8~+10: Exceptional strategic thinking with minimal downsides
           - +4~+7: Good decision but with notable trade-offs
           - 0~+3: Average or neutral impact
           - -3~-1: Poor decision with some merit
           - -10~-4: Seriously flawed approach OR low-effort response
        3. Total score for sincere, well-reasoned answers should be POSITIVE (+8 to +20 total).
        4. Do NOT give all positive scores. Every choice has opportunity costs or potential risks - reflect them.
        5. Be specific about what could go wrong or what was sacrificed by this choice.
        6. RESPONSE QUALITY MATTERS: A good choice with poor reasoning deserves LOWER scores than a mediocre choice with excellent reasoning.

        Evaluation Rules by Card Type:
        1. IF Card Type is 'Event' (Chance/Golden Key):
           - Outcomes lean POSITIVE but still identify risks. Good reasoning gets +4~+7 per category.

        2. IF Card Type is 'Burnout':
           - Outcomes lean NEGATIVE. Good damage control reduces penalties. Poor handling: -6~-10 per category.

        3. IF Card Type is 'Challenge' (Open-Ended Innovation):
           - Evaluate creativity, feasibility, and strategic alignment.
           - High Quality: +6~+8 Competency, +4~+6 Insight. BUT identify implementation risks.
           - Low Quality: 0 or -2 in relevant categories.

        4. IF Card Type is 'CoreValue' (Dilemma):
           - Dilemmas inherently involve trade-offs. The choice MUST show both value gained AND value sacrificed.
           - If choosing efficiency over relationships: +Competency but -Trust.
           - If choosing safety over innovation: +Trust but -Insight.

        5. General (Self, Team, Leader, Follower types):
           - Identify at least ONE negative impact or risk from the choice.
           - If the choice might damage relationships, reflect in Trust.

        **MANDATORY RESOURCE & ENERGY CONSUMPTION RULE:**
        IMPORTANT: Almost ALL activities in real workplace require TIME and EFFORT.
        - Resource (capital) represents TIME investment. Most decisions require time to implement.
          → Give -1 to -5 Resource for activities that take significant time (meetings, projects, training)
          → Only give +Resource if the decision explicitly SAVES time or gains resources
        - Energy represents PHYSICAL/EMOTIONAL effort. Most decisions require energy to execute.
          → Give -1 to -5 Energy for activities requiring effort, emotional labor, or concentration
          → Only give +Energy if the decision explicitly reduces workload or provides rest
        - Be REALISTIC: A decision to "work harder", "have more meetings", "take on more responsibility"
          should ALWAYS have negative Resource and/or Energy scores, even if the outcome is positive.
        - Trade-off principle: Good decisions often sacrifice Resource/Energy for Trust, Competency, or Insight gains.

        Feedback Format (in Korean) - USE CLEAR SECTION MARKERS:
        **[장점]** What was good about the decision from the protagonist's perspective (1-2 sentences)
        **[리스크]** What could go wrong or what trade-offs exist for the protagonist (1-2 sentences)
        **[총평]** Overall assessment and learning point (1 sentence)
        **[모범답안]** Provide a model answer - what would be the ideal choice and reasoning in this situation? Be specific and actionable. (2-3 sentences)

        Output JSON:
        - feedback: Detailed paragraph with **[장점]**, **[리스크]**, **[총평]**, **[모범답안]** section markers (Korean).
        - scores: { capital, energy, trust, competency, insight } (integers between -10 and +10)
      `;

      const response = await genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              feedback: { type: Type.STRING },
              scores: {
                type: Type.OBJECT,
                properties: {
                  capital: { type: Type.INTEGER },
                  energy: { type: Type.INTEGER },
                  trust: { type: Type.INTEGER },
                  competency: { type: Type.INTEGER },
                  insight: { type: Type.INTEGER },
                }
              }
            }
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      const result: AIEvaluationResult = {
        feedback: parsed.feedback,
        scoreChanges: parsed.scores
      };

      setAiEvaluationResult(result);
      setIsAiProcessing(false);

      // AI 결과는 관리자만 로컬에서 확인 (Firebase에 저장하지 않음)
      // ACCEPT & CONTINUE 시 점수가 적용되고 로그에 기록됨

      // 리포트용 AI 평가 결과 로그
      const scores = result.scoreChanges;
      addLog(`🤖 [AI 분석] ${result.feedback}`);
      addLog(`📊 [점수변화] 자원(시간):${scores.capital || 0} | 에너지:${scores.energy || 0} | 신뢰:${scores.trust || 0} | 역량:${scores.competency || 0} | 통찰:${scores.insight || 0}`);
      addLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    } catch (e) {
      console.error(e);
      alert("AI 오류가 발생했습니다. 다시 시도해주세요.");
      setIsAiProcessing(false);
    }
  };

  const handleApplyResult = async () => {
    if (!currentSession || !aiEvaluationResult || !currentTeam || !activeCard) {
      // 조건 미충족 시에도 다음 턴으로 넘어감
      nextTurn();
      return;
    }

    // 1. 팀 리소스, 히스토리, 멤버 인덱스를 한 번에 업데이트 (Race Condition 방지)
    const turnRecord: TurnRecord = {
      turnNumber: currentSession.teams[currentTurnIndex].history.length + 1,
      cardId: activeCard.id,
      cardTitle: activeCard.title,
      situation: activeCard.situation,
      choiceId: sharedSelectedChoice?.id || 'OPEN',
      choiceText: sharedSelectedChoice?.text || 'Free Text Input',
      reasoning: sharedReasoning,
      aiFeedback: aiEvaluationResult.feedback,
      scoreChanges: aiEvaluationResult.scoreChanges,
      timestamp: Date.now(),
      position: currentTeam.position  // 현재 위치 저장 (이미 푼 카드 체크용)
    };

    const baseScoreChanges = aiEvaluationResult.scoreChanges;

    // 리스크 카드: 모든 점수를 음수로 변환 (절대값 유지)
    const applyRiskCard = (score?: number) => {
      if (score === undefined) return undefined;
      // 양수이면 음수로 변환, 음수이면 그대로 유지
      return score > 0 ? -score : score;
    };

    // 더블 찬스 + 커스텀 배수 적용 (양수든 음수든)
    // 더블 찬스(주사위 더블)는 기존 로직 유지, 커스텀 배수(2배/3배 찬스)는 별도 적용
    const doubleMultiplier = isDoubleChance ? 2 : 1;
    const customMultiplier = customScoreMultiplier > 1 ? customScoreMultiplier : 1;
    const totalMultiplier = doubleMultiplier * customMultiplier;

    let scoreChanges = {
      capital: baseScoreChanges.capital !== undefined ? baseScoreChanges.capital * totalMultiplier : undefined,
      energy: baseScoreChanges.energy !== undefined ? baseScoreChanges.energy * totalMultiplier : undefined,
      reputation: baseScoreChanges.reputation !== undefined ? baseScoreChanges.reputation * totalMultiplier : undefined,
      trust: baseScoreChanges.trust !== undefined ? baseScoreChanges.trust * totalMultiplier : undefined,
      competency: baseScoreChanges.competency !== undefined ? baseScoreChanges.competency * totalMultiplier : undefined,
      insight: baseScoreChanges.insight !== undefined ? baseScoreChanges.insight * totalMultiplier : undefined,
    };

    // 리스크 카드: 모든 점수를 음수로 강제 변환
    if (isRiskCardMode) {
      scoreChanges = {
        capital: applyRiskCard(scoreChanges.capital),
        energy: applyRiskCard(scoreChanges.energy),
        reputation: applyRiskCard(scoreChanges.reputation),
        trust: applyRiskCard(scoreChanges.trust),
        competency: applyRiskCard(scoreChanges.competency),
        insight: applyRiskCard(scoreChanges.insight),
      };
      addLog(`💀 리스크 카드 적용! 모든 점수가 마이너스로 변환됨`);
    }

    if (isDoubleChance) {
      addLog(`🎲 더블 찬스 적용! 모든 점수 x2 (기존 점수의 2배)`);
    }
    if (customScoreMultiplier > 1) {
      addLog(`🎯 ${customScoreMultiplier}배 찬스 적용! 모든 점수 x${customScoreMultiplier}`);
    }

    // 나눔카드 효과: 모든 팀에 동일한 점수 적용
    if (isSharingMode) {
      addLog(`🤝 나눔카드 적용! ${currentTeam.name}의 점수가 모든 팀에게 동일하게 적용됩니다.`);
    }

    const updatedTeams = currentSession.teams.map((team, idx) => {
      // 현재 팀: 점수와 히스토리 업데이트 + 멤버 인덱스 회전
      if (team.id === currentTeam.id) {
        const newResources = { ...team.resources };
        if (scoreChanges.capital !== undefined) newResources.capital += scoreChanges.capital;
        if (scoreChanges.energy !== undefined) newResources.energy += scoreChanges.energy;
        if (scoreChanges.reputation !== undefined) newResources.reputation += scoreChanges.reputation;
        if (scoreChanges.trust !== undefined) newResources.trust += scoreChanges.trust;
        if (scoreChanges.competency !== undefined) newResources.competency += scoreChanges.competency;
        if (scoreChanges.insight !== undefined) newResources.insight += scoreChanges.insight;

        // 멤버 인덱스 회전 (팀원이 있는 경우)
        const nextMemberIndex = team.members.length > 0
          ? (team.currentMemberIndex + 1) % team.members.length
          : 0;

        return {
          ...team,
          resources: newResources,
          history: [...team.history, turnRecord],
          currentMemberIndex: nextMemberIndex
        };
      }
      // 나눔카드 모드: 다른 팀에도 동일한 점수 적용
      else if (isSharingMode) {
        const newResources = { ...team.resources };
        if (scoreChanges.capital !== undefined) newResources.capital += scoreChanges.capital;
        if (scoreChanges.energy !== undefined) newResources.energy += scoreChanges.energy;
        if (scoreChanges.reputation !== undefined) newResources.reputation += scoreChanges.reputation;
        if (scoreChanges.trust !== undefined) newResources.trust += scoreChanges.trust;
        if (scoreChanges.competency !== undefined) newResources.competency += scoreChanges.competency;
        if (scoreChanges.insight !== undefined) newResources.insight += scoreChanges.insight;
        return { ...team, resources: newResources };
      }
      return team;
    });

    // Firebase에 팀 업데이트 저장 (await로 완료 대기)
    await updateTeamsInSession(updatedTeams);

    addLog(`[턴완료] ${currentTeam.name} 턴 종료 - 점수 적용됨`);
    addLog(`---`); // 턴 구분선

    // 2. 로컬 상태 초기화 (nextTurn 대신 직접 처리 - 팀 덮어쓰기 방지)
    setShowCardModal(false);
    setActiveCard(null);
    setSharedSelectedChoice(null);
    setSharedReasoning('');
    setAiEvaluationResult(null);
    setIsAiProcessing(false);
    setIsTeamSaved(false);
    setIsSaving(false);
    setSpectatorVotes({});  // 관람자 투표 초기화
    setMySpectatorVote(null);  // 내 투표 초기화
    setIsDoubleChance(false);  // 더블 찬스 초기화
    setIsRiskCardMode(false);  // 리스크 카드 모드 초기화
    setCustomScoreMultiplier(1);  // 커스텀 모드 점수 배수 초기화
    setIsSharingMode(false);  // 나눔카드 모드 초기화
    setGamePhase(GamePhase.Idle);
    setTurnTimeLeft(120);

    const nextTeamIndex = (currentTurnIndex + 1) % currentSession.teams.length;

    // 3. Firebase에 Idle 상태 저장
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured && currentSessionId) {
      try {
        await firestoreService.updateGameState(currentSessionId, {
          sessionId: currentSessionId,
          phase: GamePhase.Idle,
          currentTeamIndex: nextTeamIndex,
          currentTurn: 0,
          diceValue: [1, 1],
          currentCard: null,
          selectedChoice: null,
          reasoning: '',
          aiResult: null,
          isSubmitted: false,
          isAiProcessing: false,
          spectatorVotes: {},  // 관람자 투표 초기화
          gameLogs: gameLogsRef.current,
          lastUpdated: Date.now()
        });
      } catch (err) {
        console.error('Firebase 턴 종료 상태 저장 실패:', err);
      }
    }

    // 4. 다음 팀으로 전환 (nextTurn 호출 없이 직접 업데이트)
    setCurrentTurnIndex(nextTeamIndex);
  };

  const handleBoardSquareClick = (index: number) => {
    const square = BOARD_SQUARES.find(s => s.index === index);
    if (!square) return;

    // 세션 모드에 맞는 카드 배열 선택
    const sessionCardType = getCardTypeFromVersion(currentSession?.version);
    const modeCards = getModeCards(sessionCardType);

    // 세션의 커스텀 카드가 있으면 사용, 없으면 기본 카드 사용
    const sessionCards = currentSession?.customCards || [];
    const allCards = sessionCards.length > 0 ? sessionCards : [...modeCards, ...EVENT_CARDS];

    let cardToPreview: GameCard | undefined;

    // Helper to find card by type
    const findCardByType = (type: string) => {
      const candidates = allCards.filter(c => c.type === type);
      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
      // EVENT_CARDS에서도 찾기
      const eventCandidates = EVENT_CARDS.filter(c => c.type === type);
      return eventCandidates.length > 0 ? eventCandidates[Math.floor(Math.random() * eventCandidates.length)] : undefined;
    };

    switch (square.type) {
      case SquareType.City:
        // 커스텀 모드: boardIndex로 카드 찾기
        if (currentSession?.version === GameVersion.Custom && sessionCards.length > 0) {
          cardToPreview = sessionCards.find((c: any) => c.boardIndex === index);
        } else {
          // 일반 모드: 역량(competency)에 맞는 카드 선택
          const targetPreviewCompetency = getCompetencyForSquare(index, sessionCardType);
          cardToPreview = allCards.find(c => c.competency === targetPreviewCompetency);
          if (!cardToPreview) {
            cardToPreview = modeCards.find(c => c.competency === targetPreviewCompetency);
          }
        }
        break;
      case SquareType.GoldenKey:
        // 우연한 기회 - Event 카드
        cardToPreview = findCardByType('Event');
        break;
      case SquareType.Fund:
        // 성장 펀드 - Growth 카드
        cardToPreview = findCardByType('Growth');
        if (!cardToPreview) {
          cardToPreview = findCardByType('Event');  // fallback
        }
        break;
      case SquareType.Space:
        // 도전 과제 - Challenge 카드
        cardToPreview = findCardByType('Challenge');
        break;
      case SquareType.WorldTour:
        // 특별 이벤트 - Special 또는 Event 카드
        cardToPreview = findCardByType('Special');
        if (!cardToPreview) {
          cardToPreview = findCardByType('Event');
        }
        break;
      case SquareType.Island:
        // 번아웃 - Burnout 카드
        cardToPreview = findCardByType('Burnout');
        break;
      case SquareType.Start:
        // 출발 칸 - 특별한 카드 없음, 안내 메시지
        break;
    }

    if (cardToPreview) {
      // 미리보기 상태 초기화
      setPreviewSelectedChoice(null);
      setPreviewReasoning('');
      setPreviewAiResult(null);
      setIsPreviewProcessing(false);
      setPreviewCard(cardToPreview);
    }
  };

  // --- 미리보기 카드 AI 평가 (게임에 반영 안됨) ---
  const handlePreviewSubmit = async () => {
    if (!previewCard) return;
    if (isPreviewProcessing) return;

    const isOpenEnded = !previewCard.choices || previewCard.choices.length === 0;
    if (isOpenEnded && !previewReasoning) return;
    if (!isOpenEnded && (!previewSelectedChoice || !previewReasoning)) return;

    setIsPreviewProcessing(true);

    if (!process.env.API_KEY) {
      alert("API Key가 설정되지 않았습니다.");
      setIsPreviewProcessing(false);
      return;
    }

    try {
      const prompt = `
        Role: Strict, insightful, and empathetic Career and Life Coach. You are a fair but critical evaluator who analyzes choices from the PROTAGONIST'S PERSPECTIVE in the given situation - not from a manager's or leader's viewpoint. Evaluate how this decision affects the protagonist personally: their growth, well-being, relationships, and career development.

        Context:
        - Card Type: "${previewCard.type}"
        - Scenario: "${previewCard.situation}"
        - Learning Point: "${previewCard.learningPoint}"
        ${isOpenEnded
          ? `- Protagonist's Open-Ended Answer: "${previewReasoning}"`
          : `- Protagonist's Choice: "${previewSelectedChoice?.text}" \n- Protagonist's Reasoning: "${previewReasoning}"`
        }

        IMPORTANT: Analyze from the PROTAGONIST'S perspective - the person facing the situation described. Consider their personal growth, work-life balance, emotional well-being, and career development.

        CRITICAL SCORING PRINCIPLES:
        **FIRST: CHECK FOR LOW-EFFORT/INSINCERE RESPONSES**
        - If the reasoning is less than 10 characters, random letters (like "asdf", "sdaf", "ㅁㄴㅇㄹ"),
          or clearly meaningless (numbers only, repeated characters, gibberish),
          IMMEDIATELY give ALL NEGATIVE scores: -5 to -10 in EVERY category.
        - Short, lazy answers like "몰라", "그냥", "ㅇㅇ", "ok", single words without explanation
          should receive -3 to -6 in every category.
        - The feedback should clearly state: "성의 없는 응답입니다. 구체적인 이유를 작성해주세요."

        1. ALWAYS identify BOTH advantages AND disadvantages/trade-offs of the choice.
        2. Score Range: Each category should be between -10 to +10.
           - +8~+10: Exceptional strategic thinking with minimal downsides
           - +4~+7: Good decision but with notable trade-offs
           - 0~+3: Average or neutral impact
           - -3~-1: Poor decision with some merit
           - -10~-4: Seriously flawed approach OR low-effort response
        3. Total score for sincere, well-reasoned answers should be POSITIVE (+8 to +20 total).
        4. Do NOT give all positive scores. Every choice has opportunity costs or potential risks - reflect them.
        5. Be specific about what could go wrong or what was sacrificed by this choice.
        6. RESPONSE QUALITY MATTERS: A good choice with poor reasoning deserves LOWER scores than a mediocre choice with excellent reasoning.

        Evaluation Rules by Card Type:
        1. IF Card Type is 'Event' (Chance/Golden Key):
           - Outcomes lean POSITIVE but still identify risks. Good reasoning gets +4~+7 per category.

        2. IF Card Type is 'Burnout':
           - Outcomes lean NEGATIVE. Good damage control reduces penalties. Poor handling: -6~-10 per category.

        3. IF Card Type is 'Challenge' (Open-Ended Innovation):
           - Evaluate creativity, feasibility, and strategic alignment.
           - High Quality: +6~+8 Competency, +4~+6 Insight. BUT identify implementation risks.
           - Low Quality: 0 or -2 in relevant categories.

        4. IF Card Type is 'CoreValue' (Dilemma):
           - Dilemmas inherently involve trade-offs. The choice MUST show both value gained AND value sacrificed.
           - If choosing efficiency over relationships: +Competency but -Trust.
           - If choosing safety over innovation: +Trust but -Insight.

        5. General (Self, Team, Leader, Follower types):
           - Identify at least ONE negative impact or risk from the choice.
           - If the choice might damage relationships, reflect in Trust.

        **MANDATORY RESOURCE & ENERGY CONSUMPTION RULE:**
        IMPORTANT: Almost ALL activities in real workplace require TIME and EFFORT.
        - Resource (capital) represents TIME investment. Most decisions require time to implement.
          → Give -1 to -5 Resource for activities that take significant time (meetings, projects, training)
          → Only give +Resource if the decision explicitly SAVES time or gains resources
        - Energy represents PHYSICAL/EMOTIONAL effort. Most decisions require energy to execute.
          → Give -1 to -5 Energy for activities requiring effort, emotional labor, or concentration
          → Only give +Energy if the decision explicitly reduces workload or provides rest
        - Be REALISTIC: A decision to "work harder", "have more meetings", "take on more responsibility"
          should ALWAYS have negative Resource and/or Energy scores, even if the outcome is positive.
        - Trade-off principle: Good decisions often sacrifice Resource/Energy for Trust, Competency, or Insight gains.

        Feedback Format (in Korean) - USE CLEAR SECTION MARKERS:
        **[장점]** What was good about the decision from the protagonist's perspective (1-2 sentences)
        **[리스크]** What could go wrong or what trade-offs exist for the protagonist (1-2 sentences)
        **[총평]** Overall assessment and learning point (1 sentence)
        **[모범답안]** Provide a model answer - what would be the ideal choice and reasoning in this situation? Be specific and actionable. (2-3 sentences)

        Output JSON:
        - feedback: Detailed paragraph with **[장점]**, **[리스크]**, **[총평]**, **[모범답안]** section markers (Korean).
        - scores: { capital, energy, trust, competency, insight } (integers between -10 and +10)
      `;

      const response = await genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              feedback: { type: Type.STRING },
              scores: {
                type: Type.OBJECT,
                properties: {
                  capital: { type: Type.INTEGER },
                  energy: { type: Type.INTEGER },
                  trust: { type: Type.INTEGER },
                  competency: { type: Type.INTEGER },
                  insight: { type: Type.INTEGER },
                }
              }
            }
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      const result: AIEvaluationResult = {
        feedback: parsed.feedback,
        scoreChanges: parsed.scores
      };

      setPreviewAiResult(result);
    } catch (e) {
      console.error(e);
      alert("AI 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsPreviewProcessing(false);
    }
  };

  // 미리보기 모달 닫기 핸들러
  const handleClosePreview = () => {
    setPreviewCard(null);
    setPreviewSelectedChoice(null);
    setPreviewReasoning('');
    setPreviewAiResult(null);
    setIsPreviewProcessing(false);
  };

  // --- Views ---

  if (view === 'intro') {
    return (
      <Intro
        onAdminLogin={() => setView('lobby')}
        onUserJoin={handleUserJoin}
        initialAccessCode={initialAccessCode}
        isLoading={isJoining}
        joinError={joinError}
      />
    );
  }

  if (view === 'lobby') {
    return (
      <Lobby
        sessions={sessions}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        onUpdateStatus={handleUpdateSessionStatus}
        onEnterSession={handleEnterSession}
      />
    );
  }

  // --- 참가자 뷰 ---
  if (view === 'participant') {
    const participantSession = currentSession;
    const participantTeam = participantSession?.teams.find(t => t.id === participantTeamId);

    // 세션 로딩 중 (localStorage에서 복구됐지만 Firebase에서 아직 로드 안됨)
    if (isJoinedTeam && participantTeamId && !participantSession) {
      return (
        <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0_0_#000] p-8 text-center">
            <h1 className="text-2xl font-black mb-4">게임 로딩 중...</h1>
            <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">잠시만 기다려주세요</p>
            <button
              onClick={() => {
                localStorage.removeItem('bluemarble_participant_session');
                setView('intro');
                setCurrentSessionId(null);
                setParticipantTeamId(null);
                setIsJoinedTeam(false);
              }}
              className="mt-4 text-sm text-gray-400 underline"
            >
              처음부터 다시 시작
            </button>
          </div>
        </div>
      );
    }

    // 팀 선택 화면
    if (!participantTeamId) {
      return (
        <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0_0_#000] p-8">
            <h1 className="text-2xl font-black text-center mb-2">
              {participantSession?.name || '게임'}
            </h1>
            <p className="text-center text-gray-500 font-bold mb-6">
              참여할 팀을 선택하세요
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {participantSession?.teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleSelectTeam(team.id)}
                  className="p-4 border-4 border-black font-black text-lg hover:bg-yellow-400 transition-colors flex flex-col items-center gap-2"
                >
                  <div className={`w-8 h-8 rounded-full bg-${team.color.toLowerCase()}-500 border-2 border-black`}></div>
                  <span>{team.name}</span>
                  {team.members.length > 0 && (
                    <span className="text-xs font-normal text-gray-500">
                      ({team.members.map(m => m.name).join(', ')})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                localStorage.removeItem('bluemarble_participant_session');
                setView('intro');
                setCurrentSessionId(null);
                setParticipantTeamId(null);
                setIsJoinedTeam(false);
              }}
              className="w-full py-3 bg-gray-200 border-4 border-black font-bold"
            >
              나가기
            </button>
          </div>
        </div>
      );
    }

    // 이름 입력 화면 (팀 선택 후, 참여 전)
    if (participantTeamId && !isJoinedTeam) {
      const selectedTeam = participantSession?.teams.find(t => t.id === participantTeamId);

      return (
        <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0_0_#000] p-8">
            <h1 className="text-2xl font-black text-center mb-2">
              {selectedTeam?.name} 참여
            </h1>
            <p className="text-center text-gray-500 font-bold mb-6">
              이름을 입력해주세요
            </p>

            {/* 현재 팀원 표시 */}
            {selectedTeam && selectedTeam.members.length > 0 && (
              <div className="mb-4 p-3 bg-gray-100 border-2 border-black">
                <p className="text-xs font-bold text-gray-500 mb-1">현재 참여 중인 팀원:</p>
                <p className="font-bold">{selectedTeam.members.map(m => m.name).join(', ')}</p>
              </div>
            )}

            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="이름 입력"
              className="w-full p-4 border-4 border-black text-lg font-bold mb-4 focus:outline-none focus:border-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && nameInput.trim()) {
                  handleJoinTeam(participantTeamId, nameInput);
                }
              }}
            />

            <button
              onClick={() => handleJoinTeam(participantTeamId, nameInput)}
              disabled={!nameInput.trim()}
              className="w-full py-4 bg-blue-500 text-white border-4 border-black font-black text-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed mb-3"
            >
              참여하기
            </button>

            <button
              onClick={() => { setParticipantTeamId(null); setNameInput(''); }}
              className="w-full py-3 bg-gray-200 border-4 border-black font-bold"
            >
              다른 팀 선택
            </button>
          </div>
        </div>
      );
    }

    // 팀이 없으면 (세션에서 팀이 삭제된 경우) 처리
    if (!participantTeam) {
      return (
        <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0_0_#000] p-8 text-center">
            <h1 className="text-2xl font-black mb-4">팀을 찾을 수 없습니다</h1>
            <p className="text-gray-500 mb-4">세션이 변경되었을 수 있습니다.</p>
            <button
              onClick={() => {
                localStorage.removeItem('bluemarble_participant_session');
                setParticipantTeamId(null);
                setIsJoinedTeam(false);
              }}
              className="w-full py-3 bg-blue-500 text-white border-4 border-black font-bold"
            >
              다시 팀 선택하기
            </button>
          </div>
        </div>
      );
    }

    // 팀 게임 화면
    const isMyTurn = participantSession?.teams[currentTurnIndex]?.id === participantTeamId;
    const activeTeamForViewer = participantSession?.teams[currentTurnIndex];

    // 참가자 로그아웃 핸들러
    const handleParticipantLogout = () => {
      localStorage.removeItem('bluemarble_participant_session');
      setCurrentSessionId(null);
      setParticipantTeamId(null);
      setParticipantName('');
      setIsJoinedTeam(false);
      setNameInput('');
      setView('intro');
    };

    return (
      <div className="min-h-screen bg-gray-900">
        <MobileTeamView
          team={participantTeam}
          activeTeamName={participantSession?.teams[currentTurnIndex]?.name || ''}
          isMyTurn={isMyTurn}
          gamePhase={gamePhase}
          onRollDice={handleRollDice}
          onLogout={handleParticipantLogout}
          activeCard={activeCard}
          activeInput={{
            choice: sharedSelectedChoice,
            reasoning: sharedReasoning
          }}
          onInputChange={(choice, reason) => {
            setSharedSelectedChoice(choice);
            setSharedReasoning(reason);
          }}
          onSubmit={handleTeamSaveOnly}
          isTeamSaved={isTeamSaved}
          isSaving={isSaving}
          isGameStarted={isGameStarted}
          spectatorVote={mySpectatorVote}
          onSpectatorVote={(choice) => handleSpectatorVote(choice, participantTeam.name)}
          spectatorVotes={spectatorVotes}
          teamNumber={(participantSession?.teams.findIndex(t => t.id === participantTeamId) ?? 0) + 1}
          onShowRules={() => setShowGameRules(true)}
        />

        {/* 게임 규칙서 모달 (참가자 화면용) */}
        <GameRulesModal
          visible={showGameRules}
          onClose={() => setShowGameRules(false)}
          gameMode={participantSession?.version || GameVersion.CoreValue}
        />

        {/* 다른 팀 턴 뷰어 모드: 현재 진행 중인 카드가 있고 내 턴이 아니면 읽기 전용 모달 표시 */}
        {!isMyTurn && activeCard && gamePhase === GamePhase.Decision && !spectatorModalDismissed && (
          <CardModal
            card={activeCard}
            visible={true}
            timeLeft={turnTimeLeft}
            selectedChoice={sharedSelectedChoice}
            reasoning={sharedReasoning}
            onSelectionChange={() => {}} // 읽기 전용
            onReasoningChange={() => {}} // 읽기 전용
            onSubmit={async () => {}} // 읽기 전용
            result={aiEvaluationResult}
            isProcessing={isAiProcessing}
            onClose={() => setSpectatorModalDismissed(true)}
            readOnly={true}
            teamName={activeTeamForViewer?.name}
            spectatorVotes={spectatorVotes}
            spectatorVote={mySpectatorVote}
            onSpectatorVote={(choice) => handleSpectatorVote(choice, participantTeam.name)}
            isDoubleChance={isDoubleChance}
            isRiskCardMode={isRiskCardMode}
          />
        )}

        {/* 3D 주사위 오버레이 (모바일 참가자 화면용) */}
        <DiceResultOverlay
          visible={showDiceOverlay}
          dice1={pendingDice[0]}
          dice2={pendingDice[1]}
          isRolling={isRolling}
          onRollComplete={handleDiceRollComplete}
          onShowResultComplete={handleDiceResultComplete}
          isDouble={pendingDice[0] === pendingDice[1]}
        />
      </div>
    );
  }

  // --- Game View ---
  const monitoredTeam = teams.find(t => t.id === monitoringTeamId);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 p-2 md:p-6 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 bg-white border-4 border-black p-2 shadow-sm">
         <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2 md:mb-0">
           <button 
             onClick={() => { if(window.confirm("Exit?")) { setView('lobby'); setCurrentSessionId(null); } }}
             className="text-sm font-bold underline text-gray-500 hover:text-black"
           >
             ← Dashboard
           </button>
           <h1 className="text-xl font-black italic">{currentSession?.name}</h1>
           <span className="bg-yellow-400 px-2 py-0.5 text-xs font-bold border border-black">{currentSession?.version} Mode</span>
         </div>
         
         <div className="flex gap-2">
            <button
              onClick={() => setAdminViewMode('dashboard')}
              className={`px-4 py-2 border-2 border-black font-bold flex items-center gap-2 ${adminViewMode === 'dashboard' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
            >
              <Monitor size={18} /> Board
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 border-2 border-black font-bold flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500"
              title="참가자 초대 QR/링크"
            >
              <QrCode size={18} /> 초대
            </button>
            <button
              onClick={() => setShowAdminDashboard(true)}
              className="px-4 py-2 border-2 border-black font-bold flex items-center gap-2 bg-purple-500 text-white hover:bg-purple-600"
              title="카드 관리"
            >
              <Settings size={18} /> 카드관리
            </button>
            <button
              onClick={() => setShowGameRules(true)}
              className="px-4 py-2 border-2 border-black font-bold flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
              title="게임 규칙서"
            >
              <BookOpen size={18} /> 규칙서
            </button>
            <div className="flex border-2 border-black bg-gray-100 overflow-x-auto max-w-[200px] md:max-w-none">
               {teams.map((t) => (
                 <button
                   key={t.id}
                   onClick={() => { setAdminViewMode('mobile_monitor'); setMonitoringTeamId(t.id); }}
                   className={`px-3 py-1 text-sm font-bold border-r border-black last:border-r-0 hover:bg-white whitespace-nowrap ${adminViewMode === 'mobile_monitor' && monitoringTeamId === t.id ? `bg-${t.color.toLowerCase()}-200` : ''}`}
                 >
                   {t.name}
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* Content */}
      {adminViewMode === 'dashboard' ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0">
          <div className="lg:col-span-2 order-2 lg:order-1 h-full min-h-0 overflow-y-auto">
             {currentTeam && (
               <ControlPanel
                  currentTeam={currentTeam}
                  phase={gamePhase}
                  diceValue={diceValue}
                  rolling={isRolling}
                  onRoll={handleRollDice}
                  onManualRoll={handleManualRoll}
                  onSkip={() => { addLog(`${currentTeam.name} skipped turn.`); nextTurn(); }}
                  onOpenReport={() => setShowReport(true)}
                  onReset={handleResetGame}
                  logs={gameLogs}
                  isGameStarted={isGameStarted}
                  onStartGame={handleStartGame}
                  onPauseGame={handlePauseGame}
                  onResumeGame={handleResumeGame}
                />
             )}
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col items-center justify-center">
            <GameBoard
              teams={teams}
              onSquareClick={handleBoardSquareClick}
              gameMode={currentSession?.version || 'Leadership Simulation'}
              customBoardImage={currentSession?.customBoardImage}
              customCards={sessionCustomCards}
            />
          </div>
          <div className="lg:col-span-3 order-3 h-full min-h-0 overflow-y-auto">
            <div className="grid gap-2">
              {(() => {
                // 팀별 총점 계산 및 순위 정렬
                const teamsWithScores = teams.map(t => ({
                  team: t,
                  totalScore: t.resources.capital + t.resources.energy + t.resources.trust + t.resources.competency + t.resources.insight
                }));
                const sortedByScore = [...teamsWithScores].sort((a, b) => b.totalScore - a.totalScore);
                const firstPlaceScore = sortedByScore[0]?.totalScore || 0;

                return teams.map((team, idx) => {
                  const teamScore = team.resources.capital + team.resources.energy + team.resources.trust + team.resources.competency + team.resources.insight;
                  const rank = sortedByScore.findIndex(t => t.team.id === team.id) + 1;
                  const gapFrom1st = firstPlaceScore - teamScore;

                  return (
                    <TeamStatus
                      key={team.id}
                      team={team}
                      active={idx === currentTurnIndex}
                      rank={rank}
                      gapFrom1st={gapFrom1st}
                      totalTeams={teams.length}
                    />
                  );
                });
              })()}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-800 p-8">
           <div className="text-white mb-4 font-bold flex items-center gap-2">
             <Smartphone /> Viewing {monitoredTeam?.name}'s Mobile Screen
           </div>
           {monitoredTeam && (
             <div className="w-full max-w-md h-full overflow-y-auto rounded-3xl border-8 border-gray-900 bg-black shadow-2xl">
               <MobileTeamView
                 team={monitoredTeam}
                 activeTeamName={currentTeam?.name || ''}
                 isMyTurn={currentTeam?.id === monitoredTeam.id}
                 gamePhase={gamePhase}
                 onRollDice={handleRollDice}
                 activeCard={activeCard}
                 activeInput={{
                   choice: sharedSelectedChoice,
                   reasoning: sharedReasoning
                 }}
                 onInputChange={(choice, reason) => {
                   setSharedSelectedChoice(choice);
                   setSharedReasoning(reason);
                 }}
                 onSubmit={handleTeamSaveOnly}
                 isTeamSaved={isTeamSaved}
                 isSaving={isSaving}
                 isGameStarted={isGameStarted}
                 spectatorVotes={spectatorVotes}
                 teamNumber={(teams.findIndex(t => t.id === monitoredTeam.id) ?? 0) + 1}
                 onShowRules={() => setShowGameRules(true)}
               />
             </div>
           )}
        </div>
      )}

      {/* Admin Modal (Controlled by Shared State) */}
      {activeCard && showCardModal && (
        <CardModal
          card={activeCard}
          visible={true}
          timeLeft={turnTimeLeft}
          // Shared State Props
          selectedChoice={sharedSelectedChoice}
          reasoning={sharedReasoning}
          onSelectionChange={setSharedSelectedChoice}
          onReasoningChange={setSharedReasoning}
          onSubmit={handleTeamSaveOnly}
          result={aiEvaluationResult}
          isProcessing={isAiProcessing}
          onClose={handleApplyResult}
          teamName={currentTeam?.name}
          // 관리자 뷰 전용 props
          isAdminView={true}
          isTeamSaved={isTeamSaved}
          onAISubmit={handleAdminAISubmit}
          spectatorVotes={spectatorVotes}
          isDoubleChance={isDoubleChance}
          isRiskCardMode={isRiskCardMode}
        />
      )}

      {previewCard && !activeCard && (
        <CardModal
           card={previewCard}
           visible={true}
           timeLeft={0}
           selectedChoice={previewSelectedChoice}
           reasoning={previewReasoning}
           onSelectionChange={setPreviewSelectedChoice}
           onReasoningChange={setPreviewReasoning}
           onSubmit={handlePreviewSubmit}
           result={previewAiResult}
           isProcessing={isPreviewProcessing}
           onClose={handleClosePreview}
           isPreviewMode={true}
        />
      )}

      {showReport && (
        <ReportView teams={teams} onClose={() => setShowReport(false)} />
      )}

      {/* Invite Modal - 참가자 초대 QR/링크 */}
      {showInviteModal && currentSession && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full border-4 border-black shadow-[10px_10px_0_0_#fff] p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 hover:bg-gray-100 p-1 rounded-full border-2 border-transparent hover:border-black transition-all"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-black uppercase text-center mb-2">참가자 초대</h2>
            <p className="text-center text-gray-500 font-bold mb-6">{currentSession.name}</p>

            <div className="bg-gray-100 border-4 border-black p-8 mb-6 flex flex-col items-center justify-center">
               {/* QR 코드 */}
               <div className="bg-white p-4 border-2 border-black mb-4">
                 <QRCodeSVG
                   value={getJoinUrl(currentSession.accessCode)}
                   size={200}
                   level="H"
                   includeMargin={true}
                 />
               </div>

               <p className="font-bold text-sm text-gray-500 mb-2 uppercase">Access Code</p>
               <div className="text-5xl font-black tracking-widest font-mono bg-white border-2 border-black px-6 py-2 shadow-hard-sm">
                 {currentSession.accessCode}
               </div>
            </div>

            <div className="space-y-3">
              <button
                 className={`w-full py-3 border-4 border-black font-black uppercase shadow-hard hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 ${linkCopied ? 'bg-green-400' : 'bg-yellow-400'}`}
                 onClick={() => handleCopyLink(currentSession.accessCode)}
              >
                {linkCopied ? (
                  <><Check size={20} /> 복사 완료!</>
                ) : (
                  <><Copy size={20} /> 초대 링크 복사</>
                )}
              </button>
              <p className="text-xs text-center font-bold text-gray-500">
                참가자들에게 위 QR코드 또는 접속 코드를 공유하세요.
              </p>
              <p className="text-xs text-center font-mono text-gray-400 break-all">
                {getJoinUrl(currentSession.accessCode)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3D 주사위 오버레이 */}
      <DiceResultOverlay
        visible={showDiceOverlay}
        dice1={pendingDice[0]}
        dice2={pendingDice[1]}
        isRolling={isRolling}
        onRollComplete={handleDiceRollComplete}
        onShowResultComplete={handleDiceResultComplete}
        isDouble={pendingDice[0] === pendingDice[1]}
      />

      {/* 역량카드 미리보기 팝업 */}
      <CompetencyCardPreview
        visible={showCompetencyPreview}
        card={activeCard || (pendingSquare ? (() => {
          // 커스텀 모드: boardIndex로 카드 찾기
          if (currentSession?.version === GameVersion.Custom && sessionCustomCards.length > 0) {
            return sessionCustomCards.find((c: GameCard) => c.boardIndex === pendingSquare.index) || sessionCustomCards[0];
          }
          // 일반 모드: competency로 카드 찾기
          const sessionCardType = getCardTypeFromVersion(currentSession?.version);
          const targetCompetency = getCompetencyForSquare(pendingSquare.index, sessionCardType);
          // 세션 커스텀 카드 우선, 없으면 기본 카드
          const cardsToSearch = sessionCustomCards.length > 0 ? sessionCustomCards : getModeCards(sessionCardType);
          return cardsToSearch.find((c: GameCard) => c.competency === targetCompetency) || null;
        })() : null)}
        square={pendingSquare}
        onComplete={handleCompetencyPreviewComplete}
        duration={5000}
      />

      {/* 한 바퀴 완주 보너스 팝업 */}
      <LapBonusPopup
        visible={showLapBonus}
        teamName={lapBonusInfo?.teamName || ''}
        lapCount={lapBonusInfo?.lapCount || 1}
        bonuses={{
          capital: 20,
          energy: LAP_BONUS.energy,
          trust: LAP_BONUS.trust,
          competency: LAP_BONUS.competency,
          insight: LAP_BONUS.insight,
        }}
        onComplete={handleLapBonusComplete}
        duration={5000}
      />

      {/* 복권 보너스 팝업 (1/3/5번째 찬스카드) */}
      <LotteryBonusPopup
        visible={showLotteryBonus}
        teamName={lotteryBonusInfo?.teamName || ''}
        chanceCardNumber={lotteryBonusInfo?.chanceCardNumber || 1}
        onComplete={() => {
          setShowLotteryBonus(false);
          setLotteryBonusInfo(null);
        }}
        duration={5000}
      />

      {/* 리스크 카드 팝업 (2/4번째 찬스카드) */}
      <RiskCardPopup
        visible={showRiskCard}
        teamName={riskCardInfo?.teamName || ''}
        chanceCardNumber={riskCardInfo?.chanceCardNumber || 2}
        teams={teams}
        currentTeamId={currentTeam?.id || ''}
        onSelectTeam={(targetTeamId) => {
          const targetTeam = teams.find(t => t.id === targetTeamId);
          if (targetTeam) {
            addLog(`🎫 [${riskCardInfo?.teamName}] 복권을 [${targetTeam.name}]에게 양도!`);
          }
          setShowRiskCard(false);
          setRiskCardInfo(null);
        }}
        onSkip={() => {
          addLog(`⏭️ [${riskCardInfo?.teamName}] 복권 양도 건너뜀`);
          setShowRiskCard(false);
          setRiskCardInfo(null);
        }}
        duration={15000}
      />

      {/* 관리자 대시보드 */}
      <AdminDashboard
        isOpen={showAdminDashboard}
        onClose={() => setShowAdminDashboard(false)}
        gameMode={currentSession?.version || GameVersion.CoreValue}
        customCards={sessionCustomCards}
        customBoardImage={currentSession?.customBoardImage}
        sessionId={currentSessionId || undefined}
        onSaveCards={(cards, customBoardImage) => {
          updateCustomCardsInSession(cards, customBoardImage);
        }}
      />

      {/* 게임 규칙서 모달 (관리자 화면용) */}
      <GameRulesModal
        visible={showGameRules}
        onClose={() => setShowGameRules(false)}
        gameMode={currentSession?.version || GameVersion.CoreValue}
      />
    </div>
  );
};

export default App;