import React, { useState } from 'react';
import { Student, SurveySubmission, RelationshipPair } from '../../types';
import { Info, Download, ChevronDown, ChevronUp, Users, Heart, AlertTriangle, UserCheck } from 'lucide-react';

interface MatrixTabProps {
  students: Student[];
  submissions: SurveySubmission[];
  relationshipPatterns: {
    mutualClose: RelationshipPair[];
    mutualWish: RelationshipPair[];
    asymmetric: RelationshipPair[];
    conflict: RelationshipPair[];
    subMap: Record<string, Record<string, { category?: 'close' | 'medium' | 'far'; wish?: boolean; reason?: string }>>;
  };
  onExportCsv: () => void;
  onSelectStudent: (student: Student) => void;
}

export const MatrixTab: React.FC<MatrixTabProps> = ({
  students,
  submissions,
  relationshipPatterns,
  onExportCsv,
  onSelectStudent,
}) => {
  const [openAccordions, setOpenAccordions] = useState<{
    mutualClose: boolean;
    mutualWish: boolean;
    asymmetric: boolean;
    conflict: boolean;
  }>({
    mutualClose: true,
    mutualWish: false,
    asymmetric: false,
    conflict: true,
  });

  const toggleAccordion = (key: 'mutualClose' | 'mutualWish' | 'asymmetric' | 'conflict') => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const { subMap, mutualClose, mutualWish, asymmetric, conflict } = relationshipPatterns;

  // Format cell display
  const getCellDisplay = (rowStudentId: string, colStudentId: string) => {
    if (rowStudentId === colStudentId) {
      return { text: '-', style: 'bg-slate-100 text-slate-400 text-center font-bold' };
    }

    const data = subMap[rowStudentId]?.[colStudentId];
    if (!data || (!data.category && !data.wish)) {
      return { text: '', style: 'bg-white text-slate-300 text-center' };
    }

    const catNum = data.category === 'close' ? '1' : data.category === 'far' ? '3' : data.category === 'medium' ? '2' : '';
    let text = catNum;
    if (data.wish) {
      text = text ? `${text}, 4` : '4';
    }

    if (data.category === 'far') {
      return { text, style: 'bg-orange-100/70 text-orange-700 text-center font-bold' };
    }
    if (data.category === 'close') {
      return { text, style: 'bg-sky-50 text-sky-800 text-center font-semibold' };
    }
    if (data.wish) {
      return { text, style: 'bg-indigo-50 text-indigo-800 text-center font-semibold' };
    }

    return { text: text || '2', style: 'bg-white text-slate-600 text-center' };
  };

  return (
    <div className="space-y-4">
      {/* Top Legend Bar matching Image 3 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            <strong>1</strong>은 가까운 거리, <strong>2</strong>는 중간 거리, <strong>3</strong>은 불편한 거리, <strong>4</strong>는 친해지고 싶은 친구를 나타냅니다.
          </span>
        </div>

        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          title="CSV 파일로 다운로드"
        >
          <Download className="w-3.5 h-3.5" />
          <span>CSV 내보내기</span>
        </button>
      </div>

      {/* Grid Layout: Left Matrix (8 cols), Right Patterns Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 19x19 Grid Matrix Table matching Image 3 */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs p-3 overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[620px]">
            <table className="border-collapse text-[11px] w-full">
              <thead>
                <tr className="sticky top-0 bg-slate-50 z-20 shadow-2xs">
                  {/* Top-left corner header */}
                  <th className="p-2 border border-slate-200 font-bold text-slate-700 bg-slate-100 min-w-[70px] text-center">
                    <div className="text-[10px] text-slate-400">피평가자</div>
                    <div>평가자</div>
                  </th>
                  {students.map((colStudent) => (
                    <th
                      key={colStudent.id}
                      onClick={() => onSelectStudent(colStudent)}
                      className="p-1.5 border border-slate-200 text-center font-bold text-slate-800 hover:bg-sky-100 cursor-pointer min-w-[42px] max-w-[48px]"
                      title={`${colStudent.number || ''}번 ${colStudent.name}`}
                    >
                      <div className="text-[10px] text-slate-400 font-normal">
                        {colStudent.number}번
                      </div>
                      <div className="truncate">{colStudent.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {students.map((rowStudent) => (
                  <tr key={rowStudent.id} className="hover:bg-slate-50/60">
                    {/* Row Header: Evaluator */}
                    <th
                      onClick={() => onSelectStudent(rowStudent)}
                      className="p-1.5 border border-slate-200 text-left font-bold text-slate-800 bg-slate-50/80 hover:bg-sky-100 cursor-pointer whitespace-nowrap sticky left-0 z-10"
                    >
                      <span>{rowStudent.number}번 {rowStudent.name}</span>
                    </th>

                    {/* Matrix Cells */}
                    {students.map((colStudent) => {
                      const cell = getCellDisplay(rowStudent.id, colStudent.id);
                      return (
                        <td
                          key={colStudent.id}
                          className={`p-1.5 border border-slate-200 text-center ${cell.style}`}
                        >
                          {cell.text}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Relationship Types Accordions matching Image 3 (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {/* 1. 양방향 친밀형 🙂 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('mutualClose')}
              className="w-full p-3.5 flex items-center justify-between bg-slate-50/60 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🙂</span>
                <span className="font-bold text-xs sm:text-sm text-slate-800">
                  양방향 친밀형
                </span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-sky-600 font-semibold bg-sky-50 px-1.5 py-0.2 rounded">
                  {mutualClose.length}쌍
                </span>
              </div>
              {openAccordions.mutualClose ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openAccordions.mutualClose && (
              <div className="p-3 divide-y divide-slate-100 max-h-[220px] overflow-y-auto space-y-1">
                {mutualClose.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 text-center">해당하는 관계가 없습니다.</p>
                ) : (
                  mutualClose.map((pair, i) => (
                    <div key={i} className="pt-2 pb-1.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectStudent(pair.sourceStudent)}
                          className="font-bold text-slate-800 hover:text-sky-600"
                        >
                          {pair.sourceStudent.name}
                        </button>
                        <span className="text-slate-400">↔</span>
                        <button
                          onClick={() => onSelectStudent(pair.targetStudent)}
                          className="font-bold text-slate-800 hover:text-sky-600"
                        >
                          {pair.targetStudent.name}
                        </button>
                      </div>
                      <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded font-medium">
                        서로 1지목
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 2. 상호 호감형 😍 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('mutualWish')}
              className="w-full p-3.5 flex items-center justify-between bg-slate-50/60 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">😍</span>
                <span className="font-bold text-xs sm:text-sm text-slate-800">
                  상호 호감형
                </span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded">
                  {mutualWish.length}쌍
                </span>
              </div>
              {openAccordions.mutualWish ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openAccordions.mutualWish && (
              <div className="p-3 divide-y divide-slate-100 max-h-[220px] overflow-y-auto space-y-1">
                {mutualWish.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 text-center">해당하는 관계가 없습니다.</p>
                ) : (
                  mutualWish.map((pair, i) => (
                    <div key={i} className="pt-2 pb-1.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectStudent(pair.sourceStudent)}
                          className="font-bold text-slate-800 hover:text-sky-600"
                        >
                          {pair.sourceStudent.name}
                        </button>
                        <span className="text-slate-400">↔</span>
                        <button
                          onClick={() => onSelectStudent(pair.targetStudent)}
                          className="font-bold text-slate-800 hover:text-sky-600"
                        >
                          {pair.targetStudent.name}
                        </button>
                      </div>
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                        친해지고 싶음
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 3. 비대칭 관계형 🥲 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('asymmetric')}
              className="w-full p-3.5 flex items-center justify-between bg-slate-50/60 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🥲</span>
                <span className="font-bold text-xs sm:text-sm text-slate-800">
                  비대칭 관계형
                </span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">
                  {asymmetric.length}쌍
                </span>
              </div>
              {openAccordions.asymmetric ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openAccordions.asymmetric && (
              <div className="p-3 divide-y divide-slate-100 max-h-[220px] overflow-y-auto space-y-1">
                {asymmetric.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 text-center">해당하는 관계가 없습니다.</p>
                ) : (
                  asymmetric.slice(0, 10).map((pair, i) => (
                    <div key={i} className="pt-2 pb-1.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectStudent(pair.sourceStudent)}
                          className="font-bold text-slate-800 hover:text-sky-600"
                        >
                          {pair.sourceStudent.name}
                        </button>
                        <span className="text-slate-400">↔</span>
                        <button
                          onClick={() => onSelectStudent(pair.targetStudent)}
                          className="font-bold text-slate-800 hover:text-sky-600"
                        >
                          {pair.targetStudent.name}
                        </button>
                      </div>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                        거리 차이 발생
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 4. 갈등 위험형 😡 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('conflict')}
              className="w-full p-3.5 flex items-center justify-between bg-slate-50/60 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">😡</span>
                <span className="font-bold text-xs sm:text-sm text-slate-800">
                  갈등 위험형
                </span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.2 rounded">
                  {conflict.length}쌍
                </span>
              </div>
              {openAccordions.conflict ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openAccordions.conflict && (
              <div className="p-3 divide-y divide-slate-100 max-h-[220px] overflow-y-auto space-y-1">
                {conflict.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 text-center">해당하는 관계가 없습니다.</p>
                ) : (
                  conflict.map((pair, i) => (
                    <div key={i} className="pt-2 pb-1.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectStudent(pair.sourceStudent)}
                          className="font-bold text-slate-800 hover:text-rose-600"
                        >
                          {pair.sourceStudent.name}
                        </button>
                        <span className="text-rose-400">↔</span>
                        <button
                          onClick={() => onSelectStudent(pair.targetStudent)}
                          className="font-bold text-slate-800 hover:text-rose-600"
                        >
                          {pair.targetStudent.name}
                        </button>
                      </div>
                      <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold">
                        서로 3지목
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
