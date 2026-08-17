import React, { useState, useEffect } from 'react';
import {
  Student,
  DistanceCategory,
  PlacedStudent,
  SurveySubmission,
  CATEGORIES
} from './types';
import { DEFAULT_STUDENTS, STORAGE_KEYS } from './data/defaultRoster';
import { HeaderNav } from './components/HeaderNav';
import { MyAvatar } from './components/MyAvatar';
import { DistanceZone } from './components/DistanceZone';
import { RosterPool } from './components/RosterPool';
import { ReasonModal } from './components/ReasonModal';
import { RosterManagerModal } from './components/RosterManagerModal';
import { ResultReportModal } from './components/ResultReportModal';
import { SelectTesterModal } from './components/SelectTesterModal';
import { TeacherDashboardModal } from './components/TeacherDashboardModal';
import { WishFriendsModal } from './components/WishFriendsModal';
import { Send, CheckCircle, RotateCcw, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // 1. Roster & Class State
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROSTER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_STUDENTS;
  });

  const [className, setClassName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CLASS_NAME) || '우리반 (3-2)';
  });

  const [currentStudentId, setCurrentStudentId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT);
    if (saved && students.some((s) => s.id === saved)) {
      return saved;
    }
    return students[0]?.id || null;
  });

  // 2. Placements State: studentId -> { studentId, category, reason, updatedAt }
  const [placements, setPlacements] = useState<Record<string, PlacedStudent>>({});

  // 3. Submissions History State
  const [submissions, setSubmissions] = useState<SurveySubmission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_RESPONSES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // 4. Modal States
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
    previousCategory: null
  });

  const [isRosterManagerOpen, setIsRosterManagerOpen] = useState(false);
  const [isResultReportOpen, setIsResultReportOpen] = useState(false);
  const [isSelectTesterOpen, setIsSelectTesterOpen] = useState(false);
  const [isTeacherDashboardOpen, setIsTeacherDashboardOpen] = useState(false);
  const [isWishFriendsModalOpen, setIsWishFriendsModalOpen] = useState(false);
  const [wishFriendIds, setWishFriendIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Persistence side effects
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

  // Unassigned students for bottom pool
  const unassignedStudents = students.filter(
    (s) => s.id !== currentStudentId && !placements[s.id]?.category
  );

  const placedCount = Object.keys(placements).length;
  const totalRosterToPlace = students.filter((s) => s.id !== currentStudentId).length;

  // --- Handlers ---

  // When student is dropped on a category zone
  const handleDropStudent = (studentId: string, category: DistanceCategory) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const previousCategory = placements[studentId]?.category || null;
    const existingReason = placements[studentId]?.reason || '';

    // Open reason dialog as requested in prompt & Image 2
    setReasonModalState({
      isOpen: true,
      student,
      category,
      initialReason: existingReason,
      isEditMode: previousCategory === category,
      previousCategory
    });
  };

  // Drop back into bottom friend roster pool
  const handleDropToPool = (studentId: string) => {
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
  };

  // Save reason & confirm placement
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
        updatedAt: Date.now()
      }
    }));

    setReasonModalState({
      isOpen: false,
      student: null,
      category: null,
      initialReason: '',
      isEditMode: false,
      previousCategory: null
    });
  };

  // Skip reason & confirm placement without text
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
        updatedAt: Date.now()
      }
    }));

    setReasonModalState({
      isOpen: false,
      student: null,
      category: null,
      initialReason: '',
      isEditMode: false,
      previousCategory: null
    });
  };

  // Close reason modal without saving new placement (revert to previous location)
  const handleCloseReasonModal = () => {
    // If it was newly placed from roster, do not place it
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
      previousCategory: null
    });
  };

  // Click on reason icon to edit
  const handleEditReason = (student: Student, category: DistanceCategory) => {
    setReasonModalState({
      isOpen: true,
      student,
      category,
      initialReason: placements[student.id]?.reason || '',
      isEditMode: true,
      previousCategory: category
    });
  };

  // Quick move via menu (touch/accessibility)
  const handleQuickMove = (student: Student, targetCategory: DistanceCategory) => {
    handleDropStudent(student.id, targetCategory);
  };

  // Remove single student from category back to pool
  const handleRemoveStudent = (studentId: string) => {
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
  };

  // Reset current survey
  const handleResetAll = () => {
    if (placedCount === 0 && wishFriendIds.length === 0) return;
    if (window.confirm('현재 분류한 모든 친구 위치, 이유 및 친해지고 싶은 친구 선택을 초기화하시겠습니까?')) {
      setPlacements({});
      setWishFriendIds([]);
    }
  };

  // Click Submit button: Opens the "친해지고 싶은 친구" modal step
  const handleSubmitSurvey = () => {
    if (placedCount === 0) {
      alert('적어도 한 명 이상의 친구를 거리 상자에 배치해주세요.');
      return;
    }
    setIsWishFriendsModalOpen(true);
  };

  // Finalize and save submission (with selected wish friends)
  const handleFinalizeSubmission = (selectedWishFriendIds: string[]) => {
    setWishFriendIds(selectedWishFriendIds);
    setIsWishFriendsModalOpen(false);

    // Prepare submission object
    const newSubmission: SurveySubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      studentId: currentStudent?.id || 'anon',
      studentName: currentStudent?.name || '익명',
      studentGender: currentStudent?.gender || '남',
      className: className,
      timestamp: Date.now(),
      placements: Object.fromEntries(
        Object.entries(placements).map(([sId, p]) => {
          const placed = p as PlacedStudent;
          return [
            sId,
            { category: placed.category, reason: placed.reason }
          ];
        })
      ),
      wishFriendIds: selectedWishFriendIds
    };

    // Save to submissions list
    setSubmissions((prev) => [newSubmission, ...prev]);

    // Open result report modal
    setIsResultReportOpen(true);
  };

  // Save new roster from manager
  const handleSaveRoster = (newStudents: Student[], newClassName: string) => {
    setStudents(newStudents);
    setClassName(newClassName);
    // clean up placements for students that no longer exist
    const studentIds = new Set(newStudents.map((s) => s.id));
    setPlacements((prev) => {
      const next: Record<string, PlacedStudent> = {};
      Object.entries(prev).forEach(([id, p]) => {
        if (studentIds.has(id)) next[id] = p as PlacedStudent;
      });
      return next;
    });

    if (currentStudentId && !studentIds.has(currentStudentId)) {
      setCurrentStudentId(newStudents[0]?.id || null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-sky-100 selection:text-sky-900">
      {/* Header Navigation */}
      <HeaderNav
        className={className}
        currentStudent={currentStudent}
        placedCount={placedCount}
        totalCount={totalRosterToPlace}
        onOpenRosterManager={() => setIsRosterManagerOpen(true)}
        onOpenTeacherDashboard={() => setIsTeacherDashboardOpen(true)}
        onOpenSelectTester={() => setIsSelectTesterOpen(true)}
        onResetTest={handleResetAll}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-5">
        {/* Main Title matching Screenshot 1 */}
        <div className="text-center py-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            친구들과 나의 마음의 거리는 어떠한가요?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            친하다고 생각되는 정도에 따라 친구들을 알맞은 거리 상자로 끌어다 놓아주세요.
          </p>
        </div>

        {/* Middle Stage: Mascot (Me) + 3 Category Distance Zones */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left: Avatar Column ("나") */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <MyAvatar
              currentStudent={currentStudent}
              onSelectCurrentStudent={() => setIsSelectTesterOpen(true)}
              placedCount={placedCount}
              totalCount={totalRosterToPlace}
            />
          </div>

          {/* Right: 3 Distance Zones */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Zone 1: 가까운 거리 */}
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

            {/* Zone 2: 적당한 거리 */}
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

            {/* Zone 3: 먼거리 */}
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

        {/* Bottom Section: Friend Roster Pool */}
        <div className="space-y-3">
          <RosterPool
            unassignedStudents={unassignedStudents}
            currentStudentId={currentStudentId}
            onDropToPool={handleDropToPool}
            onQuickMove={handleQuickMove}
            onResetAll={placedCount > 0 ? handleResetAll : undefined}
            isDragActive={isDragging}
          />

          {/* Bottom Submit Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-4">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
              {placedCount === 0 ? (
                <span>친구를 상자로 드래그하여 검사를 시작하세요.</span>
              ) : (
                <span>
                  현재 <strong className="text-indigo-600 font-bold">{placedCount}명</strong>의 친구가 배치되었습니다.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {/* Optional direct trigger button for wish friends */}
              <button
                type="button"
                onClick={() => setIsWishFriendsModalOpen(true)}
                className={`
                  px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5
                  ${
                    wishFriendIds.length > 0
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }
                `}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>친해지고 싶은 친구</span>
                {wishFriendIds.length > 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {wishFriendIds.length}
                  </span>
                )}
              </button>

              {/* Submit Button matching user screenshot 1 */}
              <motion.button
                type="button"
                onClick={handleSubmitSurvey}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  px-6 py-2 rounded-lg font-semibold text-xs shadow-2xs transition-all flex items-center gap-2
                  ${
                    placedCount > 0
                      ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                <Send className="w-3.5 h-3.5" />
                <span>제출하기</span>
              </motion.button>
            </div>
          </div>
        </div>
      </main>

      {/* --- Modals --- */}

      {/* 1. Reason Input Modal */}
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

      {/* 2. Roster Manager Modal */}
      <RosterManagerModal
        isOpen={isRosterManagerOpen}
        students={students}
        className={className}
        onSaveRoster={handleSaveRoster}
        onClose={() => setIsRosterManagerOpen(false)}
      />

      {/* 3. Wish Friends Selection Modal (친해지고 싶은 친구 선택) */}
      <WishFriendsModal
        isOpen={isWishFriendsModalOpen}
        students={students}
        currentStudentId={currentStudentId}
        initialSelectedIds={wishFriendIds}
        onSubmit={handleFinalizeSubmission}
        onSkip={() => handleFinalizeSubmission([])}
        onClose={() => setIsWishFriendsModalOpen(false)}
      />

      {/* 4. Result Report Modal */}
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

      {/* 5. Select Tester Modal */}
      <SelectTesterModal
        isOpen={isSelectTesterOpen}
        students={students}
        currentStudentId={currentStudentId}
        onSelectStudent={(s) => {
          setCurrentStudentId(s.id);
          // If current student was already in placements, remove them from placements
          if (placements[s.id]) {
            setPlacements((prev) => {
              const next = { ...prev };
              delete next[s.id];
              return next;
            });
          }
          if (wishFriendIds.includes(s.id)) {
            setWishFriendIds((prev) => prev.filter((id) => id !== s.id));
          }
        }}
        onClose={() => setIsSelectTesterOpen(false)}
      />

      {/* 6. Teacher Dashboard Modal */}
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
