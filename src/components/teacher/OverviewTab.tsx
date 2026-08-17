import React, { useState } from 'react';
import { Student, StudentScoreStats } from '../../types';
import { Info, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

interface OverviewTabProps {
  statsList: StudentScoreStats[];
  onSelectStudent: (student: Student) => void;
}

type SortKey = 'number' | 'name' | 'closenessScore' | 'positiveCount' | 'negativeCount' | 'attentionCount' | 'preferenceCount' | 'dispreferenceCount';

export const OverviewTab: React.FC<OverviewTabProps> = ({ statsList, onSelectStudent }) => {
  const [sortKey, setSortKey] = useState<SortKey>('number');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'number' || key === 'name');
    }
  };

  const sortedList = [...statsList].sort((a, b) => {
    let diff = 0;
    if (sortKey === 'number') {
      diff = (a.student.number || 0) - (b.student.number || 0);
    } else if (sortKey === 'name') {
      diff = a.student.name.localeCompare(b.student.name, 'ko');
    } else {
      diff = (a[sortKey] as number) - (b[sortKey] as number);
    }
    return sortAsc ? diff : -diff;
  });

  const renderSortIndicator = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-60" />;
    }
    return sortAsc ? (
      <ChevronUp className="w-3.5 h-3.5 text-sky-600" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-sky-600" />
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold select-none">
              <th
                onClick={() => handleSort('number')}
                className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors w-16"
              >
                <div className="inline-flex items-center gap-1">
                  <span>번호</span>
                  {renderSortIndicator('number')}
                </div>
              </th>

              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="inline-flex items-center gap-1">
                  <span>이름</span>
                  {renderSortIndicator('name')}
                </div>
              </th>

              <th
                onClick={() => handleSort('closenessScore')}
                className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="inline-flex items-center gap-1 justify-center">
                  <span>끈끈이 점수</span>
                  <Info className="w-3 h-3 text-slate-400" />
                  {renderSortIndicator('closenessScore')}
                </div>
              </th>

              <th
                onClick={() => handleSort('positiveCount')}
                className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="inline-flex items-center gap-1 justify-center">
                  <span>긍정평가</span>
                  <Info className="w-3 h-3 text-slate-400" />
                  {renderSortIndicator('positiveCount')}
                </div>
              </th>

              <th
                onClick={() => handleSort('negativeCount')}
                className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="inline-flex items-center gap-1 justify-center">
                  <span>부정평가</span>
                  <Info className="w-3 h-3 text-slate-400" />
                  {renderSortIndicator('negativeCount')}
                </div>
              </th>

              <th
                onClick={() => handleSort('attentionCount')}
                className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="inline-flex items-center gap-1 justify-center">
                  <span>관심 받은 수</span>
                  <Info className="w-3 h-3 text-slate-400" />
                  {renderSortIndicator('attentionCount')}
                </div>
              </th>

              <th
                onClick={() => handleSort('preferenceCount')}
                className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="inline-flex items-center gap-1 justify-center">
                  <span>선호도</span>
                  <Info className="w-3 h-3 text-slate-400" />
                  {renderSortIndicator('preferenceCount')}
                </div>
              </th>

              <th
                onClick={() => handleSort('dispreferenceCount')}
                className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="inline-flex items-center gap-1 justify-center">
                  <span>비선호도</span>
                  <Info className="w-3 h-3 text-slate-400" />
                  {renderSortIndicator('dispreferenceCount')}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {sortedList.map((st) => (
              <tr key={st.student.id} className="hover:bg-sky-50/40 transition-colors">
                <td className="py-3 px-4 text-center font-medium text-slate-500">
                  {st.student.number || '-'}
                </td>

                {/* Student Name: Clickable to go to Student Detail View matching screenshot */}
                <td className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => onSelectStudent(st.student)}
                    className="font-bold text-slate-900 hover:text-sky-600 hover:underline transition-colors text-left inline-flex items-center gap-1.5"
                  >
                    <span>{st.student.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({st.student.gender})
                    </span>
                  </button>
                </td>

                <td className="py-3 px-4 text-center font-bold text-slate-800">
                  {st.closenessScore}
                </td>

                <td className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onSelectStudent(st.student)}
                    className="font-bold text-slate-800 underline hover:text-sky-600 cursor-pointer"
                  >
                    {st.positiveCount}
                  </button>
                </td>

                <td className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onSelectStudent(st.student)}
                    className="font-bold text-slate-800 underline hover:text-amber-600 cursor-pointer"
                  >
                    {st.negativeCount}
                  </button>
                </td>

                <td className="py-3 px-4 text-center font-medium text-slate-700">
                  {st.attentionCount}
                </td>

                <td className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onSelectStudent(st.student)}
                    className="font-bold text-slate-800 underline hover:text-sky-600 cursor-pointer"
                  >
                    {st.preferenceCount}
                  </button>
                </td>

                <td className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onSelectStudent(st.student)}
                    className="font-bold text-slate-800 underline hover:text-amber-600 cursor-pointer"
                  >
                    {st.dispreferenceCount}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
