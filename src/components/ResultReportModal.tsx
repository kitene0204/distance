import React, { useEffect, useState } from 'react';
import { Student, PlacedStudent, CATEGORIES, DistanceCategory } from '../types';
import confetti from 'canvas-confetti';
import { CheckCircle2, Printer, Copy, RotateCcw, X, Heart, Smile, Meh, Frown, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ResultReportModalProps {
  isOpen: boolean;
  currentStudent: Student | null;
  className: string;
  students: Student[];
  placements: Record<string, PlacedStudent>;
  wishFriendIds?: string[];
  onClose: () => void;
  onRestart: () => void;
}

export const ResultReportModal: React.FC<ResultReportModalProps> = ({
  isOpen,
  currentStudent,
  className,
  students,
  placements,
  wishFriendIds = [],
  onClose,
  onRestart
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fire celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getStudentsForCategory = (cat: DistanceCategory) => {
    return students.filter((s) => placements[s.id]?.category === cat);
  };

  const closeStudents = getStudentsForCategory('close');
  const mediumStudents = getStudentsForCategory('medium');
  const farStudents = getStudentsForCategory('far');

  const wishStudents = students.filter((s) => wishFriendIds.includes(s.id));

  const unassignedStudents = students.filter(
    (s) => s.id !== currentStudent?.id && !placements[s.id]?.category
  );

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    let text = `[${className}] 마음거리 검사 결과\n`;
    text += `검사자: ${currentStudent ? `${currentStudent.name} (${currentStudent.gender})` : '익명'}\n`;
    text += `일시: ${new Date().toLocaleString('ko-KR')}\n\n`;

    text += `■ 가까운 거리 (${closeStudents.length}명)\n`;
    if (closeStudents.length === 0) text += `- 없음\n`;
    closeStudents.forEach((s) => {
      const reason = placements[s.id]?.reason;
      text += `- ${s.name} (${s.gender})${reason ? ` : "${reason}"` : ''}\n`;
    });

    text += `\n■ 적당한 거리 (${mediumStudents.length}명)\n`;
    if (mediumStudents.length === 0) text += `- 없음\n`;
    mediumStudents.forEach((s) => {
      const reason = placements[s.id]?.reason;
      text += `- ${s.name} (${s.gender})${reason ? ` : "${reason}"` : ''}\n`;
    });

    text += `\n■ 먼거리 (${farStudents.length}명)\n`;
    if (farStudents.length === 0) text += `- 없음\n`;
    farStudents.forEach((s) => {
      const reason = placements[s.id]?.reason;
      text += `- ${s.name} (${s.gender})${reason ? ` : "${reason}"` : ''}\n`;
    });

    if (wishStudents.length > 0) {
      text += `\n■ 친해지고 싶은 친구 (${wishStudents.length}명): ${wishStudents.map((s) => `${s.name}(${s.gender})`).join(', ')}\n`;
    }

    if (unassignedStudents.length > 0) {
      text += `\n■ 미분류 (${unassignedStudents.length}명): ${unassignedStudents.map((s) => s.name).join(', ')}\n`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs print:hidden"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-10 max-h-[90vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:rounded-none"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white text-indigo-700 border border-indigo-200 shadow-2xs">
                  {className}
                </span>
                <h2 className="text-base font-bold text-slate-800">
                  마음거리 검사 결과표
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                검사 학생: <strong className="text-slate-700">{currentStudent?.name || '익명'}</strong> ({currentStudent?.gender || '미지정'}) · {new Date().toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors print:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Summary Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/30">
          {/* Summary Pills Count */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-indigo-100 rounded-lg p-3 text-center shadow-2xs">
              <div className="flex items-center justify-center gap-1 text-indigo-700 text-xs font-semibold mb-1">
                <Smile className="w-3.5 h-3.5 text-indigo-500" />
                가까운 거리
              </div>
              <div className="text-xl font-bold text-slate-800">
                {closeStudents.length}
                <span className="text-xs font-normal text-slate-400 ml-0.5">명</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-2xs">
              <div className="flex items-center justify-center gap-1 text-slate-700 text-xs font-semibold mb-1">
                <Meh className="w-3.5 h-3.5 text-slate-500" />
                적당한 거리
              </div>
              <div className="text-xl font-bold text-slate-800">
                {mediumStudents.length}
                <span className="text-xs font-normal text-slate-400 ml-0.5">명</span>
              </div>
            </div>

            <div className="bg-white border border-rose-100 rounded-lg p-3 text-center shadow-2xs">
              <div className="flex items-center justify-center gap-1 text-rose-700 text-xs font-semibold mb-1">
                <Frown className="w-3.5 h-3.5 text-rose-500" />
                먼거리
              </div>
              <div className="text-xl font-bold text-slate-800">
                {farStudents.length}
                <span className="text-xs font-normal text-slate-400 ml-0.5">명</span>
              </div>
            </div>
          </div>

          {/* Section 1: 가까운 거리 */}
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
              <h3 className="font-semibold text-indigo-900 text-xs sm:text-sm flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-indigo-500" />
                가까운 거리 친구들 ({closeStudents.length}명)
              </h3>
              <span className="text-[11px] text-slate-400">같이 있으면 즐거운 친구</span>
            </div>

            {closeStudents.length === 0 ? (
              <p className="text-xs text-slate-400 py-1.5">배치된 친구가 없습니다.</p>
            ) : (
              <div className="space-y-1.5">
                {closeStudents.map((s) => {
                  const reason = placements[s.id]?.reason;
                  const isBoy = s.gender === '남';
                  return (
                    <div
                      key={s.id}
                      className="bg-indigo-50/30 rounded-lg p-2 border border-indigo-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                            isBoy
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {s.gender}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">{s.name}</span>
                      </div>
                      {reason ? (
                        <div className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 max-w-md">
                          💭 {reason}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">(작성된 이유 없음)</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: 적당한 거리 */}
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <Meh className="w-4 h-4 text-slate-500" />
                적당한 거리 친구들 ({mediumStudents.length}명)
              </h3>
              <span className="text-[11px] text-slate-400">같이 있어도 불편하지 않은 친구</span>
            </div>

            {mediumStudents.length === 0 ? (
              <p className="text-xs text-slate-400 py-1.5">배치된 친구가 없습니다.</p>
            ) : (
              <div className="space-y-1.5">
                {mediumStudents.map((s) => {
                  const reason = placements[s.id]?.reason;
                  const isBoy = s.gender === '남';
                  return (
                    <div
                      key={s.id}
                      className="bg-slate-50 rounded-lg p-2 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                            isBoy
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {s.gender}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">{s.name}</span>
                      </div>
                      {reason ? (
                        <div className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 max-w-md">
                          💭 {reason}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">(작성된 이유 없음)</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: 먼거리 */}
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
              <h3 className="font-semibold text-rose-900 text-xs sm:text-sm flex items-center gap-1.5">
                <Frown className="w-4 h-4 text-rose-500" />
                먼거리 친구들 ({farStudents.length}명)
              </h3>
              <span className="text-[11px] text-slate-400">같이 있으면 불편한 친구</span>
            </div>

            {farStudents.length === 0 ? (
              <p className="text-xs text-slate-400 py-1.5">배치된 친구가 없습니다.</p>
            ) : (
              <div className="space-y-1.5">
                {farStudents.map((s) => {
                  const reason = placements[s.id]?.reason;
                  const isBoy = s.gender === '남';
                  return (
                    <div
                      key={s.id}
                      className="bg-rose-50/30 rounded-lg p-2 border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                            isBoy
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {s.gender}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">{s.name}</span>
                      </div>
                      {reason ? (
                        <div className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 max-w-md">
                          💭 {reason}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">(작성된 이유 없음)</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: 친해지고 싶은 친구 */}
          <div className="bg-white rounded-lg p-4 border border-indigo-100 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
              <h3 className="font-semibold text-indigo-900 text-xs sm:text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                친해지고 싶은 친구들 ({wishStudents.length}명)
              </h3>
              <span className="text-[11px] text-slate-400">마음이 가지만 아직 친해지지 못한 친구</span>
            </div>

            {wishStudents.length === 0 ? (
              <p className="text-xs text-slate-400 py-1.5">(선택한 친구가 없습니다)</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {wishStudents.map((s) => {
                  const isBoy = s.gender === '남';
                  return (
                    <div
                      key={s.id}
                      className="inline-flex items-center gap-1.5 bg-indigo-50/70 border border-indigo-200/80 px-2.5 py-1 rounded-lg text-xs"
                    >
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                          isBoy
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {s.gender}
                      </span>
                      <span className="font-semibold text-slate-800">{s.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Unassigned note */}
          {unassignedStudents.length > 0 && (
            <div className="text-xs text-slate-400 px-1">
              * 미분류 친구 ({unassignedStudents.length}명): {unassignedStudents.map((s) => s.name).join(', ')}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? '복사 완료!' : '결과 텍스트 복사'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              인쇄 / PDF
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRestart}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              새 검사 시작
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
            >
              완료 및 닫기
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
