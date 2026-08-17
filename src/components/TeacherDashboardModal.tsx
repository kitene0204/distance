import React, { useState, useMemo } from 'react';
import { SurveySubmission, Student, TeacherTabType, DistanceCategory, CATEGORIES } from '../types';
import { generateDefaultSubmissions } from '../data/mockSurveyData';
import { computeClassStats, computeRelationshipPatterns } from '../utils/analysisUtils';
import { DashboardSidebar } from './teacher/DashboardSidebar';
import { OverviewTab } from './teacher/OverviewTab';
import { UniverseTab } from './teacher/UniverseTab';
import { MatrixTab } from './teacher/MatrixTab';
import { CumulativeTab } from './teacher/CumulativeTab';
import { StudentDetailView } from './teacher/StudentDetailView';
import { X, ChevronDown, Download, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TeacherDashboardModalProps {
  isOpen: boolean;
  submissions: SurveySubmission[];
  students: Student[];
  className: string;
  onClearSubmissions: () => void;
  onDeleteSubmission: (id: string) => void;
  onClose: () => void;
}

export const TeacherDashboardModal: React.FC<TeacherDashboardModalProps> = ({
  isOpen,
  submissions: userSubmissions,
  students,
  className,
  onClearSubmissions,
  onDeleteSubmission,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TeacherTabType>('overview');
  const [selectedRound, setSelectedRound] = useState<number>(2);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Combine user submissions with default rich mock data for rounds 1 & 2
  const allSubmissions = useMemo(() => {
    const defaultData = generateDefaultSubmissions(students);
    // If user made new submissions, merge or prioritize them
    if (userSubmissions.length === 0) {
      return defaultData;
    }
    // Tag user submissions with current round if not specified
    const taggedUser = userSubmissions.map((s) => ({
      ...s,
      round: s.round || selectedRound,
    }));

    // Replace default with user submissions for matched students in that round
    const filteredDefaults = defaultData.filter(
      (d) => !taggedUser.some((u) => u.studentId === d.studentId && (u.round || 2) === (d.round || 2))
    );

    return [...taggedUser, ...filteredDefaults];
  }, [students, userSubmissions, selectedRound]);

  // Submissions for current selected round
  const currentRoundSubmissions = useMemo(() => {
    return allSubmissions.filter((s) => (s.round || 2) === selectedRound);
  }, [allSubmissions, selectedRound]);

  // Round 1 and Round 2 stats for cumulative view
  const round1Stats = useMemo(() => {
    const r1Subs = allSubmissions.filter((s) => (s.round || 2) === 1);
    return computeClassStats(students, r1Subs).statsList;
  }, [students, allSubmissions]);

  const round2Stats = useMemo(() => {
    const r2Subs = allSubmissions.filter((s) => (s.round || 2) === 2);
    return computeClassStats(students, r2Subs).statsList;
  }, [students, allSubmissions]);

  // Current round statistics & patterns
  const classStats = useMemo(() => {
    return computeClassStats(students, currentRoundSubmissions);
  }, [students, currentRoundSubmissions]);

  const relationshipPatterns = useMemo(() => {
    return computeRelationshipPatterns(students, currentRoundSubmissions);
  }, [students, currentRoundSubmissions]);

  if (!isOpen) return null;

  // CSV Export
  const handleExportCSV = () => {
    let csvContent = '\uFEFF';
    csvContent += '회차,학급,검사자(평가자),피평가자,피평가자성별,마음거리,이유,친해지고싶은친구여부\n';

    allSubmissions.forEach((sub) => {
      const wishIds = new Set<string>(sub.wishFriendIds || []);
      const rNum = sub.round || 2;

      (Object.entries(sub.placements) as [string, { category: DistanceCategory; reason?: string }][]).forEach(([targetId, place]) => {
        const target = students.find((s) => s.id === targetId);
        const targetName = target?.name || targetId;
        const targetGender = target?.gender || '';
        const catName = CATEGORIES[place.category]?.title || place.category;
        const reason = (place.reason || '').replace(/"/g, '""');
        const isWish = wishIds.has(targetId) ? 'O' : '-';

        csvContent += `"${rNum}회차","${className}","${sub.studentName}","${targetName}","${targetGender}","${catName}","${reason}","${isWish}"\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `마음거리검사_결과보고서_${className}_${selectedRound}회차.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        className="bg-slate-50 border border-slate-200 rounded-2xl w-full max-w-7xl shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar matching User Screenshots */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              마음거리 검사
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Round Dropdown Selector matching screenshot */}
            <div className="relative">
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(Number(e.target.value))}
                className="appearance-none bg-white border border-slate-200 text-slate-800 text-xs font-bold py-2 pl-3.5 pr-8 rounded-lg shadow-2xs hover:border-slate-300 focus:outline-hidden cursor-pointer"
              >
                <option value={2}>2회차</option>
                <option value={1}>1회차</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* CSV Download Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="p-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              title="CSV 파일 내보내기"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar matching Screenshot 1/2/3 */}
        {!selectedStudent && (
          <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-8 overflow-x-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`py-3.5 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-sky-500 text-slate-950 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              전체보기
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('universe')}
              className={`py-3.5 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'universe'
                  ? 'border-sky-500 text-slate-950 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              유니버스 보기
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`py-3.5 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'border-sky-500 text-slate-950 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              매트릭스 보기
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`py-3.5 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-sky-500 text-slate-950 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              누적 데이터 살펴보기
            </button>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <AnimatePresence mode="wait">
            {selectedStudent ? (
              /* Student Detail View when an individual student name is clicked */
              <StudentDetailView
                key={selectedStudent.id}
                student={selectedStudent}
                students={students}
                submissions={currentRoundSubmissions}
                allRoundsSubmissions={allSubmissions}
                currentRound={selectedRound}
                onRoundChange={setSelectedRound}
                onBack={() => setSelectedStudent(null)}
                onSelectStudent={setSelectedStudent}
              />
            ) : (
              /* Classroom Dashboard Tabs with Left Sidebar */
              <div className="flex flex-col lg:flex-row items-start gap-5">
                {/* Left Sidebar: Score Summary, 선호도 TOP 5, 비선호도 TOP 5 */}
                <DashboardSidebar
                  totalClosenessScore={classStats.totalClosenessScore}
                  totalAttentionScore={classStats.totalAttentionScore}
                  topPreferences={classStats.topPreferences}
                  topDispreferences={classStats.topDispreferences}
                  onSelectStudent={setSelectedStudent}
                />

                {/* Main Tab Views */}
                <div className="flex-1 w-full min-w-0">
                  {activeTab === 'overview' && (
                    <OverviewTab
                      statsList={classStats.statsList}
                      onSelectStudent={setSelectedStudent}
                    />
                  )}

                  {activeTab === 'universe' && (
                    <UniverseTab
                      students={students}
                      statsList={classStats.statsList}
                      submissions={currentRoundSubmissions}
                      onSelectStudent={setSelectedStudent}
                    />
                  )}

                  {activeTab === 'matrix' && (
                    <MatrixTab
                      students={students}
                      submissions={currentRoundSubmissions}
                      relationshipPatterns={relationshipPatterns}
                      onExportCsv={handleExportCSV}
                      onSelectStudent={setSelectedStudent}
                    />
                  )}

                  {activeTab === 'history' && (
                    <CumulativeTab
                      students={students}
                      round1Stats={round1Stats}
                      round2Stats={round2Stats}
                      onSelectStudent={setSelectedStudent}
                    />
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
