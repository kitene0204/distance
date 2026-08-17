import React from 'react';
import { Student, StudentScoreStats } from '../../types';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Award, ShieldAlert, Sparkles } from 'lucide-react';

interface CumulativeTabProps {
  students: Student[];
  round1Stats: StudentScoreStats[];
  round2Stats: StudentScoreStats[];
  onSelectStudent: (student: Student) => void;
}

export const CumulativeTab: React.FC<CumulativeTabProps> = ({
  students,
  round1Stats,
  round2Stats,
  onSelectStudent,
}) => {
  // Compute differences between Round 1 and Round 2
  const comparisons = students.map((student) => {
    const s1 = round1Stats.find((s) => s.student.id === student.id) || {
      closenessScore: 0,
      positiveCount: 0,
      negativeCount: 0,
      preferenceCount: 0,
      dispreferenceCount: 0,
    };
    const s2 = round2Stats.find((s) => s.student.id === student.id) || {
      closenessScore: 0,
      positiveCount: 0,
      negativeCount: 0,
      preferenceCount: 0,
      dispreferenceCount: 0,
    };

    const diffCloseness = s2.closenessScore - s1.closenessScore;
    const diffPositive = s2.positiveCount - s1.positiveCount;
    const diffNegative = s2.negativeCount - s1.negativeCount;
    const diffPref = s2.preferenceCount - s1.preferenceCount;

    return {
      student,
      r1: s1,
      r2: s2,
      diffCloseness,
      diffPositive,
      diffNegative,
      diffPref,
    };
  });

  // Top positive improvers
  const topImprovers = [...comparisons]
    .sort((a, b) => b.diffPositive - a.diffPositive)
    .slice(0, 5);

  // Attention needed (increased negatives or decreased positives)
  const needsAttention = [...comparisons]
    .sort((a, b) => b.diffNegative - a.diffNegative)
    .filter((c) => c.diffNegative > 0 || c.r2.dispreferenceCount >= 2)
    .slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Top Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
            <TrendingUp className="w-4 h-4 text-sky-500" />
            <span>학급 끈끈이 총점 변화</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900">369점</span>
            <span className="text-xs font-bold text-emerald-600 inline-flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +28점 (1회차 대비)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">학기 초 대비 전반적인 상호 교류와 친밀도가 상승했습니다.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>친해지고 싶은 관계 지목</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-indigo-600">14건</span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              신규 호감 형성
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">서로 다가가고 싶어 하는 잠재적 교우관계가 활성화되었습니다.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>고립 및 갈등 위험 학생</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900">2명</span>
            <span className="text-xs font-medium text-amber-600 inline-flex items-center">
              황혜리, 전학생
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">상호 지목이 적은 학생에 대해 모둠 활동 배려가 권장됩니다.</p>
        </div>
      </div>

      {/* Comparison Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Positive Improvers */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-500" />
            <span>관계 친밀도 상승 학생 TOP 5</span>
          </h3>

          <div className="space-y-2.5">
            {topImprovers.map(({ student, r1, r2, diffPositive }, idx) => (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50/50 transition-colors cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">{idx + 1}</span>
                  <span className="font-bold text-slate-900">{student.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">
                    긍정 {r1.positiveCount}회 → <strong className="text-slate-800">{r2.positiveCount}회</strong>
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded">
                    +{diffPositive}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Attention */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>교사 관심 및 관찰 권장 학생</span>
          </h3>

          <div className="space-y-2.5">
            {needsAttention.map(({ student, r1, r2, diffNegative }) => (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-amber-50/50 transition-colors cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{student.name}</span>
                  <span className="text-[10px] text-slate-400">({student.gender})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">
                    부정평가 {r2.dispreferenceCount}회
                  </span>
                  <span className="text-amber-700 font-bold bg-amber-100/70 px-2 py-0.5 rounded">
                    {diffNegative > 0 ? `+${diffNegative} 증가` : '유지'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
