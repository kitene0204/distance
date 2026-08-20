import React, { useState } from 'react';
import { MessageSquare, BookOpen, Lightbulb, HeartHandshake, ShieldAlert, Sparkles, MessageCircleQuestion } from 'lucide-react';

export const CommunityView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tips' | 'cases' | 'qna'>('tips');

  const tips = [
    {
      id: 1,
      tag: '관계 개선 활동',
      title: '관심군 지수(+2 이상) 학생을 위한 또래 도우미 짝 활동 설계법',
      desc: '신호등에서 붉은색 지표를 나타낸 학생의 경우, 상호 긍정 지목을 주고받은 친구 또는 완충재 역할을 하는 수용성이 높은 친구와 모둠을 배치하는 것이 효과적입니다.',
      author: '교우관계지도 연구회',
      date: '2022-01-15',
    },
    {
      id: 2,
      tag: '자가진단 활용',
      title: '6대 자가진단 척도(개방성, 만족감, 신뢰감 등)를 활용한 1:1 상담 기법',
      desc: '의사소통 척도가 낮고 친근감 척도가 높은 학생은 대화의 표현 방식(공감 대화법) 훈련을 통해 급격한 관계 회복이 가능합니다.',
      author: '상담교사 김민서',
      date: '2022-01-12',
    },
    {
      id: 3,
      tag: '학기 초 관계 형성',
      title: '화살표 집중도가 특정 소수에 쏠릴 때 학급 내 파벌 완화 전략',
      desc: '마당발 형태의 학생들을 각 모둠의 리더로 분산 배치하고, 무작위 협동 미션(보물찾기, 릴레이 그림 그리기)을 통해 소통 통로를 다변화합니다.',
      author: '행복교실 실천단',
      date: '2022-01-08',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          교우관계 상담 커뮤니티 & 자료실
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          학급 교우관계 분석 리포트를 바탕으로 실천할 수 있는 생활지도 및 상담 가이드입니다.
        </p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-base">생활지도 솔루션</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            관계 신호등 변화 지표에 따른 맞춤형 학급 자리 배치 및 모둠 구성 매뉴얼
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-base">친해지기 프로젝트</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            친해지고 싶은 친구 지목 데이터를 바탕으로 자연스럽게 교류를 촉진하는 학급 놀이
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-base">위험군 조기 중재</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            부정 지목이 급증하거나 고립형으로 분류된 학생의 심리 정서적 안정 지원 가이드
          </p>
        </div>
      </div>

      {/* Articles Feed */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span>추천 지도 사례 및 칼럼</span>
        </h2>

        <div className="space-y-3">
          {tips.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/70 transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {item.tag}
                </span>
                <span className="text-xs text-slate-400">{item.date}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              <div className="text-[11px] text-slate-400 font-medium pt-1">
                작성: {item.author}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
