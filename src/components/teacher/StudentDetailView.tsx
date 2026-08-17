import React, { useState } from 'react';
import { Student, SurveySubmission, StudentViewPerspective, TrendMetricType } from '../../types';
import { Sparkles, ArrowLeft, ChevronLeft, ChevronRight, Heart, AlertCircle, Info, ZoomIn, ZoomOut } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StudentDetailViewProps {
  student: Student;
  students: Student[];
  submissions: SurveySubmission[];
  allRoundsSubmissions: SurveySubmission[];
  currentRound: number;
  onRoundChange: (round: number) => void;
  onBack: () => void;
  onSelectStudent: (student: Student) => void;
}

export const StudentDetailView: React.FC<StudentDetailViewProps> = ({
  student,
  students,
  submissions,
  allRoundsSubmissions,
  currentRound,
  onRoundChange,
  onBack,
  onSelectStudent,
}) => {
  const [perspective, setPerspective] = useState<StudentViewPerspective>('combined');
  const [trendMetric, setTrendMetric] = useState<TrendMetricType>('positive');
  const [zoomLevel, setZoomLevel] = useState(100);

  // 1. Current student's own submission
  const mySubmission = submissions.find((s) => s.studentId === student.id);
  const myPlacements = mySubmission?.placements || {};
  const myWishFriends = mySubmission?.wishFriendIds || [];

  // 2. Submissions where other students placed this student
  const receivedEvaluations: Record<string, { category: 'close' | 'medium' | 'far'; reason?: string; evaluator: Student }> = {};
  submissions.forEach((sub) => {
    if (sub.studentId === student.id) return;
    const place = sub.placements[student.id];
    const evaluator = students.find((s) => s.id === sub.studentId);
    if (place && evaluator) {
      receivedEvaluations[evaluator.id] = {
        category: place.category,
        reason: place.reason,
        evaluator,
      };
    }
  });

  // Calculate categorized friend nodes based on perspective
  const closeList: { student: Student; reason?: string }[] = [];
  const mediumList: { student: Student; reason?: string }[] = [];
  const farList: { student: Student; reason?: string }[] = [];
  const unplacedList: Student[] = [];

  students.forEach((s) => {
    if (s.id === student.id) return;

    if (perspective === 'self') {
      // What I evaluated
      const place = myPlacements[s.id];
      if (!place) {
        unplacedList.push(s);
      } else if (place.category === 'close') {
        closeList.push({ student: s, reason: place.reason });
      } else if (place.category === 'medium') {
        mediumList.push({ student: s, reason: place.reason });
      } else if (place.category === 'far') {
        farList.push({ student: s, reason: place.reason });
      }
    } else if (perspective === 'others') {
      // How others evaluated me
      const rec = receivedEvaluations[s.id];
      if (!rec) {
        unplacedList.push(s);
      } else if (rec.category === 'close') {
        closeList.push({ student: s, reason: rec.reason });
      } else if (rec.category === 'medium') {
        mediumList.push({ student: s, reason: rec.reason });
      } else if (rec.category === 'far') {
        farList.push({ student: s, reason: rec.reason });
      }
    } else {
      // Combined perspective: Weighted integration
      const myPlace = myPlacements[s.id];
      const otherRec = receivedEvaluations[s.id];

      let score = 2; // default medium
      let hasData = false;

      if (myPlace && otherRec) {
        hasData = true;
        const v1 = myPlace.category === 'close' ? 1 : myPlace.category === 'far' ? 3 : 2;
        const v2 = otherRec.category === 'close' ? 1 : otherRec.category === 'far' ? 3 : 2;
        score = (v1 + v2) / 2;
      } else if (myPlace) {
        hasData = true;
        score = myPlace.category === 'close' ? 1 : myPlace.category === 'far' ? 3 : 2;
      } else if (otherRec) {
        hasData = true;
        score = otherRec.category === 'close' ? 1 : otherRec.category === 'far' ? 3 : 2;
      }

      if (!hasData) {
        unplacedList.push(s);
      } else if (score <= 1.5) {
        closeList.push({ student: s, reason: myPlace?.reason || otherRec?.reason });
      } else if (score >= 2.5) {
        farList.push({ student: s, reason: myPlace?.reason || otherRec?.reason });
      } else {
        mediumList.push({ student: s, reason: myPlace?.reason || otherRec?.reason });
      }
    }
  });

  // Calculate historical trend data for 1회차 vs 2회차
  const trendData = [1, 2].map((r) => {
    const roundSubs = allRoundsSubmissions.filter((sub) => (sub.round || 2) === r);
    const mySubInRound = roundSubs.find((s) => s.studentId === student.id);
    
    // Counts received
    let positive = 0;
    let negative = 0;
    let preference = 0;
    let dispreference = 0;

    roundSubs.forEach((sub) => {
      if (sub.studentId === student.id) return;
      const p = sub.placements[student.id];
      if (p?.category === 'close') {
        positive += 1;
        preference += 1;
      } else if (p?.category === 'far') {
        negative += 1;
        dispreference += 1;
      }
      if (sub.wishFriendIds?.includes(student.id)) {
        preference += 1;
      }
    });

    return {
      name: `${r}회차`,
      round: r,
      positive,
      negative,
      preference,
      dispreference,
    };
  });

  // Positive evaluation items for list
  const positiveEvaluatedFriends = (Object.entries(myPlacements) as [string, { category: 'close' | 'medium' | 'far'; reason?: string }][])
    .filter(([_, p]) => p.category === 'close')
    .map(([tId, p]) => {
      const target = students.find((s) => s.id === tId);
      return {
        student: target as Student,
        reason: p.reason || '함께하면 즐겁고 친해서',
      };
    })
    .filter((item) => item.student !== undefined);

  // Helper for orbit node positioning
  const renderOrbitNodes = (
    items: { student: Student; reason?: string }[],
    radiusPercent: number
  ) => {
    const count = items.length;
    if (count === 0) return null;

    return items.map((item, idx) => {
      const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
      const x = 50 + radiusPercent * Math.cos(angle);
      const y = 50 + radiusPercent * Math.sin(angle);

      return (
        <div
          key={item.student.id}
          onClick={() => onSelectStudent(item.student)}
          style={{ left: `${x}%`, top: `${y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10 transition-transform hover:scale-125"
          title={`${item.student.number || ''}번 ${item.student.name}${item.reason ? `: "${item.reason}"` : ''}`}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sky-200/90 border border-sky-300 text-sky-950 flex items-center justify-center text-[10px] sm:text-[11px] font-semibold shadow-xs transition-colors group-hover:bg-sky-400 group-hover:text-white">
            {item.student.name}
          </div>

          {item.reason && (
            <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-900 text-white text-[10px] rounded shadow-lg whitespace-nowrap z-20 pointer-events-none">
              💭 {item.reason}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Bar Header matching Image 5/6/7 */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>목록으로</span>
          </button>

          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              {student.name}의 마음거리검사
            </h2>

            {/* Round Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-semibold text-slate-700">
              <button
                type="button"
                onClick={() => onRoundChange(Math.max(1, currentRound - 1))}
                className="p-1 hover:text-slate-900 disabled:opacity-40"
                disabled={currentRound <= 1}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2">{currentRound}회차</span>
              <button
                type="button"
                onClick={() => onRoundChange(Math.min(2, currentRound + 1))}
                className="p-1 hover:text-slate-900 disabled:opacity-40"
                disabled={currentRound >= 2}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Perspective Pill Tabs matching Image 5/6/7 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPerspective('combined')}
          className={`
            px-4 py-1.5 rounded-full text-xs font-semibold transition-all
            ${
              perspective === 'combined'
                ? 'bg-sky-100 text-sky-800 border border-sky-300 shadow-2xs font-bold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }
          `}
        >
          통합평가로 보기
        </button>

        <button
          type="button"
          onClick={() => setPerspective('self')}
          className={`
            px-4 py-1.5 rounded-full text-xs font-semibold transition-all
            ${
              perspective === 'self'
                ? 'bg-sky-100 text-sky-800 border border-sky-300 shadow-2xs font-bold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }
          `}
        >
          본인평가로 보기
        </button>

        <button
          type="button"
          onClick={() => setPerspective('others')}
          className={`
            px-4 py-1.5 rounded-full text-xs font-semibold transition-all
            ${
              perspective === 'others'
                ? 'bg-sky-100 text-sky-800 border border-sky-300 shadow-2xs font-bold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }
          `}
        >
          상대평가로 보기
        </button>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Planetary Orbit Visualizer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs relative flex flex-col min-h-[480px]">
            {/* Top Orbit Controls */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="border border-slate-200 px-2 py-0.5 rounded bg-slate-50">거리기준</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Zoom Scale Box matching screenshot */}
              <div className="flex items-center gap-1 text-xs border border-slate-200 rounded-md px-1.5 py-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
                  className="px-1 text-slate-600 hover:text-slate-900 font-bold"
                >
                  -
                </button>
                <span className="px-1.5 font-semibold text-slate-700">{zoomLevel}</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
                  className="px-1 text-slate-600 hover:text-slate-900 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Orbit Stage */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden min-h-[380px]">
              <div
                style={{ transform: `scale(${zoomLevel / 100})` }}
                className="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] transition-transform duration-200"
              >
                {/* 3 Concentric Dotted Orbit Rings matching Image 5/6/7 */}
                {/* Ring 3: Far Distance */}
                <div className="absolute inset-0 rounded-full border border-dashed border-sky-300 pointer-events-none" />

                {/* Ring 2: Medium Distance */}
                <div className="absolute inset-[15%] rounded-full border border-dashed border-sky-300 pointer-events-none" />

                {/* Ring 1: Close Distance */}
                <div className="absolute inset-[30%] rounded-full border border-dashed border-sky-300 pointer-events-none" />

                {/* Center Planet (The student with ring atmosphere) matching Image 5/6/7 */}
                <div className="absolute inset-[38%] rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md flex items-center justify-center text-white font-bold text-sm sm:text-base z-10 border-2 border-emerald-300">
                  {/* Planet Saturn-like Ring */}
                  <div className="absolute w-[140%] h-[35%] rounded-full border-2 border-emerald-200/80 -rotate-15 pointer-events-none" />
                  <span className="relative z-10 drop-shadow-sm">{student.name}</span>
                </div>

                {/* Render Satellites on Orbit Rings */}
                {renderOrbitNodes(closeList, 20)}
                {renderOrbitNodes(mediumList, 35)}
                {renderOrbitNodes(farList, 50)}
              </div>

              {/* Floating Outside Satellites (Right side pills) matching Image 5 */}
              {unplacedList.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
                  {unplacedList.slice(0, 5).map((unp) => (
                    <div
                      key={unp.id}
                      onClick={() => onSelectStudent(unp)}
                      className="px-2 py-1 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-semibold hover:bg-slate-300 cursor-pointer text-center shadow-2xs"
                    >
                      {unp.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Card: 친해지고 싶은 친구 Card matching Image 5/6/7 */}
            <div className="mt-auto pt-3 border-t border-slate-100">
              <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{student.name} 학생이 친해지고 싶은 친구</span>
                </h4>

                {myWishFriends.length === 0 ? (
                  <p className="text-xs text-slate-400">이번 회차에서 선택한 친구가 없습니다.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {myWishFriends.map((wId) => {
                      const target = students.find((s) => s.id === wId);
                      return (
                        <span
                          key={wId}
                          onClick={() => target && onSelectStudent(target)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold cursor-pointer hover:bg-indigo-100 transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>{target?.name || wId}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Trend Chart & Evaluated Friends List (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Top Card: Historical Trend Tabs & Chart matching Image 5/6/7 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            {/* Trend Metric Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3 text-xs">
              <button
                type="button"
                onClick={() => setTrendMetric('positive')}
                className={`pb-1 px-1 font-semibold transition-colors ${
                  trendMetric === 'positive'
                    ? 'text-sky-600 border-b-2 border-sky-600 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                긍정평가 추이
              </button>

              <button
                type="button"
                onClick={() => setTrendMetric('negative')}
                className={`pb-1 px-1 font-semibold transition-colors ${
                  trendMetric === 'negative'
                    ? 'text-sky-600 border-b-2 border-sky-600 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                부정평가 추이
              </button>

              <button
                type="button"
                onClick={() => setTrendMetric('preference')}
                className={`pb-1 px-1 font-semibold transition-colors ${
                  trendMetric === 'preference'
                    ? 'text-sky-600 border-b-2 border-sky-600 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                선호도 추이
              </button>

              <button
                type="button"
                onClick={() => setTrendMetric('dispreference')}
                className={`pb-1 px-1 font-semibold transition-colors ${
                  trendMetric === 'dispreference'
                    ? 'text-sky-600 border-b-2 border-sky-600 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                비선호도 추이
              </button>
            </div>

            {/* Recharts Line Chart */}
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                  />
                  <Line
                    type="monotone"
                    dataKey={trendMetric}
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    dot={{ fill: '#38bdf8', r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Card: 긍정적으로 평가한 친구 목록 matching Image 5/6/7 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex-1 flex flex-col">
            <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5">
              <span>{student.name} 학생이 긍정적으로 평가한 친구 목록</span>
            </h3>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-[260px] pr-1">
              {positiveEvaluatedFriends.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">긍정적으로 평가한 친구가 없습니다.</p>
              ) : (
                positiveEvaluatedFriends.map(({ student: f, reason }) => (
                  <div
                    key={f.id}
                    onClick={() => onSelectStudent(f)}
                    className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer flex items-start gap-2.5"
                  >
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          {f.number ? `${f.number}번 ` : ''}{f.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 break-words">
                        {reason}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
