export type Gender = '남' | '여';

export type DistanceCategory = 'close' | 'medium' | 'far';

export interface Student {
  id: string;
  name: string;
  gender: Gender;
  number?: number;
}

export interface PlacedStudent {
  studentId: string;
  category: DistanceCategory;
  reason?: string;
  updatedAt: number;
}

export interface SurveySubmission {
  id: string;
  studentId: string; // The student who took the survey
  studentName: string;
  studentGender: Gender;
  className: string;
  timestamp: number;
  placements: Record<string, {
    category: DistanceCategory;
    reason?: string;
  }>;
  wishFriendIds?: string[]; // 친해지고 싶은 친구 목록 (IDs)
  notes?: string;
}

export interface CategoryMeta {
  id: DistanceCategory;
  title: string;
  subtitle: string;
  colorTheme: {
    border: string;
    borderActive: string;
    bg: string;
    bgHover: string;
    headerBg: string;
    textColor: string;
    badgeBg: string;
    accent: string;
  };
  reasonPrompt: string;
  reasonPlaceholder: string;
}

export const CATEGORIES: Record<DistanceCategory, CategoryMeta> = {
  close: {
    id: 'close',
    title: '가까운 거리',
    subtitle: '같이 있으면 즐거운 친구',
    colorTheme: {
      border: 'border-indigo-200/90',
      borderActive: 'border-indigo-500 ring-4 ring-indigo-100',
      bg: 'bg-indigo-50/30',
      bgHover: 'bg-indigo-50/60',
      headerBg: 'bg-indigo-100/40',
      textColor: 'text-indigo-950',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      accent: '#6366f1'
    },
    reasonPrompt: '이 친구와 왜 친하다고 생각하나요?',
    reasonPlaceholder: '이 친구의 좋은 점을 알려주세요.\n(작성하지 않아도 괜찮습니다.)'
  },
  medium: {
    id: 'medium',
    title: '적당한 거리',
    subtitle: '같이 있어도 불편하지 않은 친구',
    colorTheme: {
      border: 'border-slate-200',
      borderActive: 'border-slate-400 ring-4 ring-slate-100',
      bg: 'bg-slate-50/40',
      bgHover: 'bg-slate-50/80',
      headerBg: 'bg-slate-100/50',
      textColor: 'text-slate-800',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
      accent: '#64748b'
    },
    reasonPrompt: '이 친구를 적당한 거리로 생각한 이유는 무엇인가요?',
    reasonPlaceholder: '편안한 이유나 평소 생각을 적어주세요.\n(작성하지 않아도 괜찮습니다.)'
  },
  far: {
    id: 'far',
    title: '먼 거리',
    subtitle: '같이 있으면 불편한 친구',
    colorTheme: {
      border: 'border-amber-200/80',
      borderActive: 'border-amber-500 ring-4 ring-amber-100',
      bg: 'bg-amber-50/20',
      bgHover: 'bg-amber-50/50',
      headerBg: 'bg-amber-100/40',
      textColor: 'text-amber-950',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      accent: '#f59e0b'
    },
    reasonPrompt: '이 친구가 왜 불편하거나 멀게 느껴지나요?',
    reasonPlaceholder: '이유나 있었던 일을 적어주세요.\n(작성하지 않아도 괜찮습니다.)'
  }
};
