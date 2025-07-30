import type { LessonData } from '../types';

export const LESSONS: Record<string, LessonData> = {
  'articles_a_an': {
    title: "The Basics: Articles 'a' and 'an'",
    explanation: "Use 'an' before words that start with a vowel sound (a, e, i, o, u). Use 'a' for all other sounds. This helps words flow smoothly!",
    examples: [
      { text: "an orange", icon_name: "orange" },
      { text: "a cat", icon_name: "cat" },
      { text: "an idea", icon_name: "idea" },
    ]
  }
};
