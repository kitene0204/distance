import React, { useState } from 'react';
import { SurveySubmission, Student, DistanceCategory, CATEGORIES } from '../types';
import { LayoutDashboard, Download, Trash2, Users, FileSpreadsheet, Eye, Smile, Meh, Frown, X, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

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
  submissions,
  students,
  className,
  onClearSubmissions,
  onDeleteSubmission,
  onClose
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<SurveySubmission | null>(null);

  if (!isOpen) return null;

  // Export submissions to CSV
  const handleExportCSV = () => {
    if (submissions.length === 0) {
      alert('저장된 검사 결과가 없습니다.');
      return;
    }

    let csvContent = '\uFEFF'; // UTF-8 BOM for Korean Excel
    csvContent += '제출일시,학급,검사자,대상친구,성별,마음거리,이유,친해지고싶은친구여부\n';

    submissions.forEach((sub) => {
      const dateStr = new Date(sub.timestamp).toLocaleString('ko-KR');
      const wishIds = new Set<string>(sub.wishFriendIds || []);

      (Object.entries(sub.placements) as [string, { category: DistanceCategory; reason?: string }][]).forEach(([targetId, place]) => {
        const targetStudent = students.find((s) => s.id === targetId);
        const targetName = targetStudent?.name || targetId;
        const targetGender = targetStudent?.gender || '';
        const catName = CATEGORIES[place.category]?.title || place.category;
        const reason = (place.reason || '').replace(/"/g, '""');
        const isWish = wishIds.has(targetId) ? 'O' : '-';

        csvContent += `"${dateStr}","${sub.className}","${sub.studentName}","${targetName}","${targetGender}","${catName}","${reason}","${isWish}"\n`;
      });

      // Also include any wish friends that were not in placements
      wishIds.forEach((wId: string) => {
        if (!sub.placements[wId]) {
          const targetStudent = students.find((s) => s.id === wId);
          const targetName = targetStudent?.name || wId;
          const targetGender = targetStudent?.gender || '';
          csvContent += `"${dateStr}","${sub.className}","${sub.studentName}","${targetName}","${targetGender}","미분류","","O"\n`;
        }
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${className}_마음거리검사_결과모음_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Matrix analysis: Calculate received choices for each student
  const statsMap: Record<string, { close: number; medium: number; far: number; wish: number }> = {};
  students.forEach((s) => {
    statsMap[s.id] = { close: 0, medium: 0, far: 0, wish: 0 };
  });

  submissions.forEach((sub) => {
    (Object.entries(sub.placements) as [string, { category: DistanceCategory; reason?: string }][]).forEach(([targetId, place]) => {
      if (statsMap[targetId] && statsMap[targetId][place.category] !== undefined) {
        statsMap[targetId][place.category]++;
      }
    });

    if (sub.wishFriendIds) {
      sub.wishFriendIds.forEach((wId) => {
        if (statsMap[wId]) {
          statsMap[wId].wish++;
        }
      });
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">교사용 검사 결과 모음 및 분석</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                  {className}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                학생들이 제출한 마음거리 검사 응답 및 친해지고 싶은 친구 결과를 종합적으로 확인합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={submissions.length === 0}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              CSV 다운로드
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50">
          {/* Submissions List */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                제출된 학생 응답 목록 ({submissions.length}건)
              </h3>
              {submissions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('저장된 모든 학생 검사 결과를 삭제하시겠습니까?')) {
                      onClearSubmissions();
                    }
                  }}
                  className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 hover:underline font-medium"
                >
                  <Trash2 className="w-3 h-3" />
                  전체 기록 삭제
                </button>
              )}
            </div>

            {submissions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                아직 제출된 학생 검사 결과가 없습니다. 학생 화면에서 [제출하기]를 완료하면 여기에 집계됩니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {submissions.map((sub) => {
                  const subPlacements = Object.values(sub.placements) as { category: DistanceCategory; reason?: string }[];
                  const closeCount = subPlacements.filter((p) => p.category === 'close').length;
                  const medCount = subPlacements.filter((p) => p.category === 'medium').length;
                  const farCount = subPlacements.filter((p) => p.category === 'far').length;
                  const wishCount = (sub.wishFriendIds || []).length;

                  return (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                                sub.studentGender === '남'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {sub.studentGender}
                            </span>
                            <span className="font-bold text-slate-800 text-sm">{sub.studentName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(sub.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                          <span className="text-indigo-700">가까움 {closeCount}</span> ·
                          <span className="text-slate-700">적당 {medCount}</span> ·
                          <span className="text-amber-700">멂 {farCount}</span>
                        </div>

                        {wishCount > 0 && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-indigo-600 font-medium bg-indigo-50/70 px-2 py-0.5 rounded border border-indigo-100">
                            <Sparkles className="w-3 h-3" />
                            <span>친해지고 싶은 친구 {wishCount}명 선택</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setSelectedSubmission(sub)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          자세히 보기
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSubmission(sub.id)}
                          className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Aggregated Class Relationship Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-slate-600" />
              학급 교우관계 및 친해지고 싶은 친구 지목 현황
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">번호/이름</th>
                    <th className="py-2.5 px-3">성별</th>
                    <th className="py-2.5 px-3 text-indigo-700">가까운 거리 지목</th>
                    <th className="py-2.5 px-3 text-slate-700">적당한 거리 지목</th>
                    <th className="py-2.5 px-3 text-amber-700">먼 거리 지목</th>
                    <th className="py-2.5 px-3 text-indigo-700 bg-indigo-50/50">친해지고 싶음 지목</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student, idx) => {
                    const st = statsMap[student.id] || { close: 0, medium: 0, far: 0, wish: 0 };
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {student.number || idx + 1}. {student.name}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                              student.gender === '남'
                                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                                : 'bg-rose-50 text-rose-600 border border-rose-200'
                            }`}
                          >
                            {student.gender}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-indigo-600">
                          {st.close > 0 ? `${st.close}회` : '-'}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-600">
                          {st.medium > 0 ? `${st.medium}회` : '-'}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-amber-600">
                          {st.far > 0 ? (
                            <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 font-semibold">
                              {st.far}회
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-indigo-700 bg-indigo-50/30">
                          {st.wish > 0 ? (
                            <span className="text-indigo-800 bg-indigo-100/70 px-2 py-0.5 rounded-md border border-indigo-200 font-bold inline-flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-600" />
                              {st.wish}회
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Individual Detailed View Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 border border-slate-200 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-base text-slate-900">
                    {selectedSubmission.studentName} 학생의 응답 세부 내용
                  </h4>
                  <p className="text-xs text-slate-400">
                    {new Date(selectedSubmission.timestamp).toLocaleString('ko-KR')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {(['close', 'medium', 'far'] as DistanceCategory[]).map((catKey) => {
                  const cat = CATEGORIES[catKey];
                  const entries = (Object.entries(selectedSubmission.placements) as [string, { category: DistanceCategory; reason?: string }][]).filter(
                    ([_, p]) => p.category === catKey
                  );

                  return (
                    <div key={catKey} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                        <span>{cat.title} ({entries.length}명)</span>
                        <span className="text-slate-400 font-normal">{cat.subtitle}</span>
                      </div>

                      {entries.length === 0 ? (
                        <p className="text-slate-400 italic">없음</p>
                      ) : (
                        <div className="space-y-1.5">
                          {entries.map(([targetId, place]) => {
                            const target = students.find((s) => s.id === targetId);
                            return (
                              <div key={targetId} className="bg-white p-2.5 rounded-lg border border-slate-200">
                                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <span>{target?.name || targetId}</span>
                                  {target && (
                                    <span className="text-[10px] text-slate-400 font-normal">
                                      ({target.gender})
                                    </span>
                                  )}
                                </div>
                                {place.reason && (
                                  <p className="mt-1 text-slate-600 text-xs bg-slate-50 p-2 rounded-md border border-slate-100">
                                    💬 {place.reason}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Wish Friends Card in Detail View */}
                {selectedSubmission.wishFriendIds && (
                  <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40">
                    <div className="font-bold text-indigo-950 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>친해지고 싶은 친구 ({selectedSubmission.wishFriendIds.length}명)</span>
                    </div>
                    {selectedSubmission.wishFriendIds.length === 0 ? (
                      <p className="text-slate-400 italic">선택 없음</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSubmission.wishFriendIds.map((wId) => {
                          const target = students.find((s) => s.id === wId);
                          return (
                            <span
                              key={wId}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-indigo-200 text-slate-800 font-semibold text-xs shadow-2xs"
                            >
                              <span>{target?.name || wId}</span>
                              {target && (
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({target.gender})
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </motion.div>
    </div>
  );
};
