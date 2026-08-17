import { Student } from '../types';

export const DEFAULT_STUDENTS: Student[] = [
  { id: 'std-1', number: 1, name: '박채현', gender: '남' },
  { id: 'std-2', number: 2, name: '황혜리', gender: '여' },
  { id: 'std-3', number: 3, name: '강윤찬', gender: '남' },
  { id: 'std-4', number: 4, name: '강주연', gender: '여' },
  { id: 'std-5', number: 5, name: '김민지', gender: '여' },
  { id: 'std-6', number: 6, name: '김진후', gender: '남' },
  { id: 'std-7', number: 7, name: '김현지', gender: '여' },
  { id: 'std-8', number: 8, name: '성서아', gender: '여' },
  { id: 'std-9', number: 9, name: '송다정', gender: '여' },
  { id: 'std-10', number: 10, name: '엄호준', gender: '남' },
  { id: 'std-11', number: 11, name: '윤시우', gender: '여' },
  { id: 'std-12', number: 12, name: '이솔빛나', gender: '여' },
  { id: 'std-13', number: 13, name: '이정', gender: '남' },
  { id: 'std-14', number: 14, name: '전성후', gender: '남' },
  { id: 'std-15', number: 15, name: '정혜원', gender: '여' },
  { id: 'std-16', number: 16, name: '최예은', gender: '여' },
  { id: 'std-17', number: 17, name: '한태은', gender: '여' },
  { id: 'std-18', number: 18, name: '허은서', gender: '여' },
];

export const STORAGE_KEYS = {
  ROSTER: 'mind_distance_roster_v1',
  CLASS_NAME: 'mind_distance_class_name_v1',
  CURRENT_STUDENT: 'mind_distance_current_student_v1',
  SAVED_RESPONSES: 'mind_distance_responses_v1',
  TEMP_DRAFT_PREFIX: 'mind_distance_draft_'
};
