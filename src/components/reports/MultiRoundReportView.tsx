import React, { useState } from 'react';
import { Student, TrafficLightStatus } from '../../types';
import {
  DIAGNOSTIC_ROUNDS,
  STUDENT_TRAFFIC_LIGHTS,
  ATTENTION_STUDENT_PRESETS,
  MULTI_ROUND_TREND_DATA,
} from '../../data/mockSurveyData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ChevronDown,
  Info,
  Check,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'motion/react';

interface MultiRoundReportViewProps {
  students: Student[];
  classNameStr: string;
  selectedRound: number;
  onRoundChange: (round: number) => void;
  onSelectStudent: (student: Student) => void;
  onOpenTeacherDashboardModal: () => void;
}

export const MultiRoundReportView: React.FC<MultiRoundReportViewProps> = ({
  students,
  classNameStr,
  selectedRound,
  onRoundChange,
  onSelectStudent,
  onOpenTeacherDashboardModal,
}) => {
  // Sub-tabs in screenshot 1: '종합 리포트' vs '교우관계진단 / 자가지단'
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'detailed'>('summary');

  // Graph filters state
  const [filterRounds, setFilterRounds] = useState<{ [key: string]: boolean }>({
    '1학기진단': true,
    '2학기진단': true,
    '3학기진단': true,
    '4학기진단': true,
  });

  const [filterMetrics, setFilterMetrics] = useState<{
    positive: boolean;
    negative: boolean;
    arrowConcentration: boolean;
  }>({
    positive: true,
    negative: true,
    arrowConcentration: true,
  });

  const [appliedFilters, setAppliedFilters] = useState({
    rounds: { ...filterRounds },
    metrics: { ...filterMetrics },
  });

  const handleApplyFilter = () => {
    setAppliedFilters({
      rounds: { ...filterRounds },
      metrics: { ...filterMetrics },
    });
  };

  // Filtered trend data based on applied checkboxes
  const displayedTrendData = MULTI_ROUND_TREND_DATA.filter(
    (d) => appliedFilters.rounds[d.roundLabel]
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Section matching Screenshot 1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            우리반 관계 읽기 <span className="text-blue-600 font-bold">AI기반</span> 다회차 분석 리포트
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            학기별 교우관계 변화 추이 및 관심군 지수 변동을 한눈에 확인합니다.
          </p>
        </div>

        {/* Dropdowns for Class & Semester Round */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Class selector */}
          <div className="relative">
            <select
              value={classNameStr}
              disabled
              className="appearance-none bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold py-2 pl-3 pr-8 rounded-lg shadow-2xs cursor-pointer focus:outline-hidden"
            >
              <option value="3학년1반">3학년1반</option>
              <option value="우리반 (3-2)">우리반 (3-2)</option>
              <option value="테스트반">테스트반</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Diagnostic round selector */}
          <div className="relative">
            <select
              value={selectedRound}
              onChange={(e) => onRoundChange(Number(e.target.value))}
              className="appearance-none bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold py-2 pl-3 pr-8 rounded-lg shadow-2xs hover:border-slate-400 cursor-pointer focus:outline-hidden"
            >
              {DIAGNOSTIC_ROUNDS.map((r) => (
                <option key={r.round} value={r.round}>
                  {r.subLabel}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. Sub-tab Buttons matching Screenshot 1 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('summary')}
          className={`px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-2xs ${
            activeSubTab === 'summary'
              ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          종합 리포트
        </button>

        <button
          type="button"
          onClick={() => onOpenTeacherDashboardModal()}
          className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 transition-all shadow-2xs"
        >
          교우관계진단 / 자가지단
        </button>
      </div>

      {/* 3. Section: 우리반 관계 신호등 */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        {/* Title and Legend Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              우리반 관계 신호등
            </h2>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <span className="text-amber-500 font-black">!</span> 직전 검사대비 관심군 지수 증감
            </span>
          </div>

          {/* Legend Items */}
          <div className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold text-slate-600 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center text-white text-[9px] shadow-2xs">
                ●
              </span>
              <span>이전대비관심군지수(+2점이상)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 text-[9px] shadow-2xs">
                ●
              </span>
              <span>이전대비관심군지수(-1~+1점이상)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] shadow-2xs">
                ●
              </span>
              <span>이전대비관심군지수(-2점이상)</span>
            </div>
          </div>
        </div>

        {/* 24 Students Signal Pill Cards Grid (4-columns) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
          {students.map((student, idx) => {
            const num = student.number || (idx + 1);
            const status: TrafficLightStatus = STUDENT_TRAFFIC_LIGHTS[num] || 'stable';

            let dotBg = 'bg-slate-300 text-slate-500';
            if (status === 'improved') dotBg = 'bg-blue-600 text-white';
            if (status === 'alert') dotBg = 'bg-rose-500 text-white';

            return (
              <motion.button
                key={student.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectStudent(student)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 shadow-2xs transition-all text-left group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600">
                    {num}.
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-950">
                    {student.name}
                  </span>
                </div>

                {/* Status Dot */}
                <div
                  className={`w-3.5 h-3.5 rounded-full ${dotBg} flex items-center justify-center text-[8px] font-bold shadow-xs`}
                  title={
                    status === 'improved'
                      ? '개선 (-2점 이상)'
                      : status === 'alert'
                      ? '주의 (+2점 이상)'
                      : '유지'
                  }
                />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 4. Bottom 2-Column Section matching Screenshot 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (7 cols): 우리반 회차별 교우관계 화살표 분포도 */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              우리반 회차별 교우관계 화살표 분포도
            </h2>
          </div>

          {/* Dark Filter Bar matching Screenshot 1 */}
          <div className="bg-slate-900 text-white rounded-xl p-3 sm:p-4 text-xs space-y-2.5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-bold text-slate-300">그래프 필터</span>

              <button
                type="button"
                onClick={handleApplyFilter}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>적용하기</span>
              </button>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-300 font-medium">
              {['1학기진단', '2학기진단', '3학기진단', '4학기진단'].map((roundKey) => (
                <label key={roundKey} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterRounds[roundKey]}
                    onChange={(e) =>
                      setFilterRounds((prev) => ({ ...prev, [roundKey]: e.target.checked }))
                    }
                    className="w-3.5 h-3.5 rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer accent-blue-500"
                  />
                  <span>{roundKey}</span>
                </label>
              ))}

              <div className="h-3 w-px bg-slate-700 hidden sm:block" />

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterMetrics.positive}
                  onChange={(e) =>
                    setFilterMetrics((prev) => ({ ...prev, positive: e.target.checked }))
                  }
                  className="w-3.5 h-3.5 rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
                />
                <span className="text-emerald-400 font-bold">긍정지목</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterMetrics.negative}
                  onChange={(e) =>
                    setFilterMetrics((prev) => ({ ...prev, negative: e.target.checked }))
                  }
                  className="w-3.5 h-3.5 rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer accent-amber-500"
                />
                <span className="text-amber-400 font-bold">부정지목</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterMetrics.arrowConcentration}
                  onChange={(e) =>
                    setFilterMetrics((prev) => ({
                      ...prev,
                      arrowConcentration: e.target.checked,
                    }))
                  }
                  className="w-3.5 h-3.5 rounded border-slate-700 text-blue-400 focus:ring-0 cursor-pointer accent-blue-400"
                />
                <span className="text-sky-300 font-bold">화살표 집중도</span>
              </label>
            </div>
          </div>

          {/* Recharts Line Chart */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayedTrendData} margin={{ top: 10, right: 30, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="roundLabel"
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  domain={[0, 16]}
                  ticks={[0, 5, 10, 15]}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                {appliedFilters.metrics.positive && (
                  <Line
                    type="monotone"
                    dataKey="positive"
                    name="긍정"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {appliedFilters.metrics.negative && (
                  <Line
                    type="monotone"
                    dataKey="negative"
                    name="부정"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    dot={{ fill: '#f97316', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {appliedFilters.metrics.arrowConcentration && (
                  <Line
                    type="monotone"
                    dataKey="arrowConcentration"
                    name="화살표 집중도"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* AI Analysis Diagnosis Box matching Screenshot 1 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>AI 종합 진단 코멘트</span>
            </div>
            <p>
              우리반 긍정지목의 값은 <strong className="text-emerald-700 font-bold">'증가'</strong>하고 있습니다.
            </p>
            <p>
              부정지목의 값은 <strong className="text-amber-700 font-bold">'증가'</strong>하고 있습니다. 우리반 화살표 집중도는{' '}
              <strong className="text-blue-700 font-bold">'증가'</strong>하고 있습니다. 관계성 분포가 직전회차와 대비해{' '}
              <strong className="text-slate-900 font-bold">'동일'</strong>한 인원을 중심으로 형성되고 있으며, 서로에 대한{' '}
              <strong className="text-rose-700 font-bold">'부정지목의 값이 증가'</strong>하므로{' '}
              <strong className="text-blue-700 underline font-bold">4학기진단 진단의 관심군 지수를 확인하는 것을 추천합니다.</strong>
            </p>
          </div>
        </div>

        {/* Right Column (5 cols): 관심학생 matching Screenshot 1 */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              관심학생
            </h2>
            <button
              type="button"
              onClick={onOpenTeacherDashboardModal}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
            >
              더보기+
            </button>
          </div>

          {/* Student Status Cards matching Screenshot 1 */}
          <div className="space-y-2.5">
            {ATTENTION_STUDENT_PRESETS.map((item) => {
              const badgeClass =
                item.statusType === '개선'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : item.statusType === '관심'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200';

              return (
                <div
                  key={item.student.id}
                  onClick={() => onSelectStudent(item.student)}
                  className="p-3 bg-slate-50/80 hover:bg-blue-50/50 border border-slate-200 rounded-xl transition-all cursor-pointer group"
                >
                  {/* Top Row: Name & Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.student.name}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${badgeClass}`}
                      >
                        {item.statusType}
                      </span>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>

                  {/* Metrics Row */}
                  <div className="mt-2 grid grid-cols-4 gap-1 text-[11px] font-medium text-slate-600 pt-1.5 border-t border-slate-200/60">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">긍정마당발</span>
                      <span className="font-bold text-slate-800">
                        {item.positiveOutgoingDelta > 0
                          ? `↑ ${item.positiveOutgoingDelta}`
                          : item.positiveOutgoingDelta < 0
                          ? `↓ ${Math.abs(item.positiveOutgoingDelta)}`
                          : `- 0`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">부정마당발</span>
                      <span className="font-bold text-slate-800">
                        {item.negativeOutgoingDelta > 0
                          ? `↑ ${item.negativeOutgoingDelta}`
                          : item.negativeOutgoingDelta < 0
                          ? `↓ ${Math.abs(item.negativeOutgoingDelta)}`
                          : `- 0`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">관심군</span>
                      <span className="font-bold text-slate-800">
                        {item.attentionRiskDelta > 0
                          ? `↑ ${item.attentionRiskDelta}`
                          : item.attentionRiskDelta < 0
                          ? `↓ ${Math.abs(item.attentionRiskDelta)}`
                          : `- 0`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">홀로형</span>
                      <span className="font-bold text-slate-800">
                        {item.isolatedDelta > 0
                          ? `↑ ${item.isolatedDelta}`
                          : item.isolatedDelta < 0
                          ? `↓ ${Math.abs(item.isolatedDelta)}`
                          : `- 0`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
