import React, { useState, useEffect } from 'react';
import {
  Student,
  DistanceCategory,
  PlacedStudent,
  SurveySubmission,
  MainMenuType,
} from './types';
import { DEFAULT_STUDENTS, STORAGE_KEYS } from './data/defaultRoster';
import { generateDefaultSubmissions } from './data/mockSurveyData';
import { MainNavbar } from './components/MainNavbar';
import { MultiRoundReportView } from './components/reports/MultiRoundReportView';
import { PeerRelationshipReportView } from './components/reports/PeerRelationshipReportView';
import { StudentManagerView } from './components/views/StudentManagerView';
import { CommunityView } from './components/views/CommunityView';
import { MyAvatar } from './components/MyAvatar';
import { DistanceZone } from './components/DistanceZone';
import { RosterPool } from './components/RosterPool';
import { ReasonModal } from './components/ReasonModal';
import { RosterManagerModal } from './components/RosterManagerModal';
import { ResultReportModal } from './components/ResultReportModal';
import { SelectTesterModal } from './components/SelectTesterModal';
import { TeacherDashboardModal } from './components/TeacherDashboardModal';
import { WishFriendsModal } from './components/WishFriendsModal';
import { StudentDetailView } from './components/teacher/StudentDetailView';
import { Send, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // 1. Navigation State
  const [activeNav, setActiveNav] = useState<MainMenuType>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_NAV);
    if (
      saved &&
      ['student_manager', 'diagnostic_test', 'relationship_report', 'multiround_report', 'community'].includes(saved)
    ) {
      return saved as MainMenuType;
    }
    return 'multiround_report'; // Default to User Screenshot 1 view
  });

  const [selectedRound, setSelectedRound] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_ROUND);
    return saved ? Number(saved) : 4; // 4학기진단 as shown in screenshots
  });

  // 2. Roster & Class State
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROSTER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_STUDENTS;
  });

  const [className, setClassName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CLASS_NAME) || '3학년1반';
  });

  const [currentStudentId, setCurrentStudentId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT);
    if (saved && students.some((s) => s.id === saved)) {
      return saved;
    }
    return students[0]?.id || null;
  });

  // 3. Placements State for Survey Testing
  const [placements, setPlacements] = useState<Record<string, PlacedStudent>>({});

  // 4. Submissions History State
  const [submissions, setSubmissions] = useState<SurveySubmission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_RESPONSES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return generateDefaultSubmissions(students);
  });

  // 5. Modal and Drill-down States
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [isTeacherDashboardOpen, setIsTeacherDashboardOpen] = useState(false);
  const [isSelectTesterOpen, setIsSelectTesterOpen] = useState(false);
  const [isRosterManagerOpen, setIsRosterManagerOpen] = useState(false);
  const [isResultReportOpen, setIsResultReportOpen] = useState(false);
  const [isWishFriendsModalOpen, setIsWishFriendsModalOpen] = useState(false);
  const [wishFriendIds, setWishFriendIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [reasonModalState, setReasonModalState] = useState<{
    isOpen: boolean;
    student: Student | null;
    category: DistanceCategory | null;
    initialReason: string;
    isEditMode: boolean;
    previousCategory: DistanceCategory | null;
  }>({
    isOpen: false,
    student: null,
    category: null,
    initialReason: '',
    isEditMode: false,
    previousCategory: null,
  });

  // Persistence side effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_NAV, activeNav);
  }, [activeNav]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_ROUND, String(selectedRound));
  }, [selectedRound]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROSTER, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLASS_NAME, className);
  }, [className]);

  useEffect(() => {
    if (currentStudentId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT, currentStudentId);
    }
  }, [currentStudentId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVED_RESPONSES, JSON.stringify(submissions));
  }, [submissions]);

  // Current student object
  const currentStudent = students.find((s) => s.id === currentStudentId) || null;

  // Unassigned students for survey pool
  const unassignedStudents = students.filter(
    (s) => s.id !== currentStudentId && !placements[s.id]?.category
  );

  const placedCount = Object.keys(placements).length;
  const totalRosterToPlace = students.filter((s) => s.id !== currentStudentId).length;

  // --- Handlers for Survey Drag & Drop ---
  const handleDropStudent = (studentId: string, category: DistanceCategory) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const previousCategory = placements[studentId]?.category || null;
    const existingReason = placements[studentId]?.reason || '';

    setReasonModalState({
      isOpen: true,
      student,
      category,
      initialReason: existingReason,
      isEditMode: previousCategory === category,
      previousCategory,
    });
  };

  const handleDropToPool = (studentId: string) => {
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
  };

  const handleSaveReason = (reason: string) => {
    if (!reasonModalState.student || !reasonModalState.category) return;
    const studentId = reasonModalState.student.id;
    const category = reasonModalState.category;

    setPlacements((prev) => ({
      ...prev,
      [studentId]: {
        studentId,
        category,
        reason,
        updatedAt: Date.now(),
      },
    }));

    setReasonModalState({
      isOpen: false,
      student: null,
      category: null,
      initialReason: '',
      isEditMode: false,
      previousCategory: null,
    });
  };

  const handleSkipReason = () => {
    if (!reasonModalState.student || !reasonModalState.category) return;
    const studentId = reasonModalState.student.id;
    const category = reasonModalState.category;

    setPlacements((prev) => ({
      ...prev,
      [studentId]: {
        studentId,
        category,
        reason: '',
        updatedAt: Date.now(),
      },
    }));

    setReasonModalState({
      isOpen: false,
      student: null,
      category: null,
      initialReason: '',
      isEditMode: false,
      previousCategory: null,
    });
  };

  const handleCloseReasonModal = () => {
    if (!reasonModalState.isEditMode && !reasonModalState.previousCategory) {
      if (reasonModalState.student) {
        const studentId = reasonModalState.student.id;
        setPlacements((prev) => {
          const next = { ...prev };
          delete next[studentId];
          return next;
        });
      }
    }
    setReasonModalState({
      isOpen: false,
      student: null,
      category: null,
      initialReason: '',
      isEditMode: false,
      previousCategory: null,
    });
  };

  const handleEditReason = (student: Student, category: DistanceCategory) => {
    setReasonModalState({
      isOpen: true,
      student,
      category,
      initialReason: placements[student.id]?.reason || '',
      isEditMode: true,
      previousCategory: category,
    });
  };

  const handleQuickMove = (student: Student, targetCategory: DistanceCategory) => {
    handleDropStudent(student.id, targetCategory);
  };

  const handleRemoveStudent = (studentId: string) => {
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
  };

  const handleResetAll = () => {
    if (placedCount === 0 && wishFriendIds.length === 0) return;
    if (window.confirm('현재 분류한 친구 위치와 이유를 초기화하시겠습니까?')) {
      setPlacements({});
      setWishFriendIds([]);
    }
  };

  const handleSubmitSurvey = () => {
    if (placedCount === 0) {
      alert('적어도 한 명 이상의 친구를 거리 상자에 배치해주세요.');
      return;
    }
    setIsWishFriendsModalOpen(true);
  };

  const handleFinalizeSubmission = (selectedWishFriendIds: string[]) => {
    setWishFriendIds(selectedWishFriendIds);
    setIsWishFriendsModalOpen(false);

    const newSubmission: SurveySubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      round: selectedRound,
      studentId: currentStudent?.id || 'anon',
      studentName: currentStudent?.name || '익명',
      studentGender: currentStudent?.gender || '남',
      className: className,
      timestamp: Date.now(),
      placements: Object.fromEntries(
        Object.entries(placements).map(([sId, p]) => {
          const placed = p as PlacedStudent;
          return [sId, { category: placed.category, reason: placed.reason }];
        })
      ),
      wishFriendIds: selectedWishFriendIds,
    };

    setSubmissions((prev) => [newSubmission, ...prev]);
    setIsResultReportOpen(true);
  };

  // Persistent Roster Management Handlers
  const handleUpdateStudents = (newStudents: Student[], newClassName?: string) => {
    setStudents(newStudents);
    if (newClassName && newClassName.trim()) {
      setClassName(newClassName.trim());
    }

    // Ensure selected currentStudentId remains valid
    if (!newStudents.some((s) => s.id === currentStudentId)) {
      setCurrentStudentId(newStudents[0]?.id || null);
      setPlacements({});
      setWishFriendIds([]);
    }

    // Check if new roster has submissions; if completely new roster, generate baseline submissions so views work immediately
    const hasMatchingStudents = submissions.some((sub) =>
      newStudents.some((st) => st.id === sub.studentId)
    );
    if (!hasMatchingStudents || submissions.length === 0) {
      setSubmissions(generateDefaultSubmissions(newStudents));
    }
  };

  const handleResetRosterToDefault = () => {
    setStudents(DEFAULT_STUDENTS);
    setClassName('3학년1반');
    setCurrentStudentId(DEFAULT_STUDENTS[0].id);
    setPlacements({});
    setWishFriendIds([]);
    setSubmissions(generateDefaultSubmissions(DEFAULT_STUDENTS));
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Global Navigation Bar matching Screenshots */}
      <MainNavbar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        classNameStr={className}
        selectedRound={selectedRound}
        onRoundChange={setSelectedRound}
        currentStudent={currentStudent}
        onOpenSelectTester={() => setIsSelectTesterOpen(true)}
        onOpenTeacherDashboardModal={() => setIsTeacherDashboardOpen(true)}
      />

      {/* 2. Main Body Content Switcher */}
      <main className="flex-1 w-full pb-12">
        {/* VIEW 1: 다회차분석리포트 (Screenshot 1) */}
        {activeNav === 'multiround_report' && (
          <MultiRoundReportView
            students={students}
            classNameStr={className}
            selectedRound={selectedRound}
            onRoundChange={setSelectedRound}
            onSelectStudent={(st) => setSelectedStudentForDetail(st)}
            onOpenTeacherDashboardModal={() => setIsTeacherDashboardOpen(true)}
          />
        )}

        {/* VIEW 2: 교우관계분석리포트 (Screenshot 2) */}
        {activeNav === 'relationship_report' && (
          <PeerRelationshipReportView
            students={students}
            submissions={submissions}
            classNameStr={className}
            selectedRound={selectedRound}
            onRoundChange={setSelectedRound}
            onSelectStudent={(st) => setSelectedStudentForDetail(st)}
            onOpenTeacherDashboardModal={() => setIsTeacherDashboardOpen(true)}
          />
        )}

        {/* VIEW 3: 교우관계진단관리 (Student Survey Drag & Drop Canvas) */}
        {activeNav === 'diagnostic_test' && (
          <div className="max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-5 animate-in fade-in duration-300">
            {/* Main Survey Prompt */}
            <div className="text-center py-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                친구들과 나의 마음의 거리는 어떠한가요?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                친하다고 생각되는 정도에 따라 친구들을 알맞은 거리 상자로 끌어다 놓아주세요.
              </p>
            </div>

            {/* Mascot + 3 Zones */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              <div className="lg:col-span-3 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
                <MyAvatar
                  currentStudent={currentStudent}
                  onSelectCurrentStudent={() => setIsSelectTesterOpen(true)}
                  placedCount={placedCount}
                  totalCount={totalRosterToPlace}
                />
              </div>

              <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <DistanceZone
                  category="close"
                  students={students}
                  placements={placements}
                  onDropStudent={handleDropStudent}
                  onRemoveStudent={handleRemoveStudent}
                  onEditReason={handleEditReason}
                  onQuickMove={handleQuickMove}
                  isDragActive={isDragging}
                />
                <DistanceZone
                  category="medium"
                  students={students}
                  placements={placements}
                  onDropStudent={handleDropStudent}
                  onRemoveStudent={handleRemoveStudent}
                  onEditReason={handleEditReason}
                  onQuickMove={handleQuickMove}
                  isDragActive={isDragging}
                />
                <DistanceZone
                  category="far"
                  students={students}
                  placements={placements}
                  onDropStudent={handleDropStudent}
                  onRemoveStudent={handleRemoveStudent}
                  onEditReason={handleEditReason}
                  onQuickMove={handleQuickMove}
                  isDragActive={isDragging}
                />
              </div>
            </div>

            {/* Friend Roster Pool & Action Bar */}
            <div className="space-y-3">
              <RosterPool
                unassignedStudents={unassignedStudents}
                currentStudentId={currentStudentId}
                onDropToPool={handleDropToPool}
                onQuickMove={handleQuickMove}
                onResetAll={placedCount > 0 ? handleResetAll : undefined}
                isDragActive={isDragging}
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-4">
                <div className="text-xs text-slate-500 font-medium">
                  {placedCount === 0 ? (
                    <span>친구를 상자로 드래그하여 검사를 시작하세요.</span>
                  ) : (
                    <span>
                      현재 <strong className="text-blue-600 font-bold">{placedCount}명</strong>의 친구가 배치되었습니다.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsWishFriendsModalOpen(true)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      wishFriendIds.length > 0
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>친해지고 싶은 친구</span>
                    {wishFriendIds.length > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {wishFriendIds.length}
                      </span>
                    )}
                  </button>

                  <motion.button
                    type="button"
                    onClick={handleSubmitSurvey}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-6 py-2 rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-2 ${
                      placedCount > 0
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>제출하기</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: 학생회원관리 */}
        {activeNav === 'student_manager' && (
          <StudentManagerView
            students={students}
            classNameStr={className}
            onSaveStudents={handleUpdateStudents}
            onUpdateClassName={(name) => setClassName(name)}
            onResetToDefault={handleResetRosterToDefault}
            onStartSurveyForStudent={(st) => {
              setCurrentStudentId(st.id);
              setPlacements({});
              setWishFriendIds([]);
              setActiveNav('diagnostic_test');
            }}
          />
        )}

        {/* VIEW 5: 커뮤니티 */}
        {activeNav === 'community' && <CommunityView />}
      </main>

      {/* --- Modals & Overlays --- */}

      {/* 1. Single Student Drill-down Modal (Triggered by clicking any student pill or node) */}
      {selectedStudentForDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setSelectedStudentForDetail(null)}
        >
          <div
            className="bg-slate-50 border border-slate-200 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <StudentDetailView
              student={selectedStudentForDetail}
              students={students}
              submissions={submissions.filter((s) => (s.round || 4) === selectedRound)}
              allRoundsSubmissions={submissions}
              currentRound={selectedRound}
              onRoundChange={setSelectedRound}
              onBack={() => setSelectedStudentForDetail(null)}
              onSelectStudent={setSelectedStudentForDetail}
            />
          </div>
        </div>
      )}

      {/* 2. Reason Input Modal */}
      <ReasonModal
        isOpen={reasonModalState.isOpen}
        student={reasonModalState.student}
        category={reasonModalState.category}
        initialReason={reasonModalState.initialReason}
        isEditMode={reasonModalState.isEditMode}
        onSave={handleSaveReason}
        onSkip={handleSkipReason}
        onClose={handleCloseReasonModal}
      />

      {/* 3. Roster Manager Modal */}
      <RosterManagerModal
        isOpen={isRosterManagerOpen}
        students={students}
        className={className}
        onSaveRoster={(newStudents, newClass) => {
          handleUpdateStudents(newStudents, newClass);
          setIsRosterManagerOpen(false);
        }}
        onClose={() => setIsRosterManagerOpen(false)}
      />

      {/* 4. Wish Friends Selection Modal */}
      <WishFriendsModal
        isOpen={isWishFriendsModalOpen}
        students={students}
        currentStudentId={currentStudentId}
        initialSelectedIds={wishFriendIds}
        onSubmit={handleFinalizeSubmission}
        onSkip={() => handleFinalizeSubmission([])}
        onClose={() => setIsWishFriendsModalOpen(false)}
      />

      {/* 5. Result Report Modal */}
      <ResultReportModal
        isOpen={isResultReportOpen}
        currentStudent={currentStudent}
        className={className}
        students={students}
        placements={placements}
        wishFriendIds={wishFriendIds}
        onClose={() => setIsResultReportOpen(false)}
        onRestart={() => {
          setIsResultReportOpen(false);
          setPlacements({});
          setWishFriendIds([]);
        }}
      />

      {/* 6. Select Tester Modal */}
      <SelectTesterModal
        isOpen={isSelectTesterOpen}
        students={students}
        currentStudentId={currentStudentId}
        onSelectStudent={(s) => {
          setCurrentStudentId(s.id);
          setPlacements({});
          setWishFriendIds([]);
          setIsSelectTesterOpen(false);
        }}
        onClose={() => setIsSelectTesterOpen(false)}
      />

      {/* 7. Teacher Dashboard Modal (심층 분석 / 전체보기 / 유니버스 / 매트릭스 / 누적) */}
      <TeacherDashboardModal
        isOpen={isTeacherDashboardOpen}
        submissions={submissions}
        students={students}
        className={className}
        onClearSubmissions={() => setSubmissions([])}
        onDeleteSubmission={(id) => {
          setSubmissions((prev) => prev.filter((s) => s.id !== id));
        }}
        onClose={() => setIsTeacherDashboardOpen(false)}
      />
    </div>
  );
}
