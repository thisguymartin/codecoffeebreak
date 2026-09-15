export const site = {
  name: 'Code Coffee Break',
  url: 'https://codecoffeebreak.com',
  description:
    'A quiet corner of the internet for developers. Short reads, small experiments, and useful tools to enjoy over a coffee.',
  editorialName: 'Code Coffee Break',
  navigation: [
    { label: 'Reads', href: '/articles' },
    { label: 'Topics', href: '/topics' },
    { label: 'Tools', href: '/tools' },
    { label: 'Pull up a chair', href: '/contribute' },
  ],
  topics: [
    'Architecture',
    'Developer Tools',
    'Web Development',
    'Performance',
    'AI Engineering',
  ],
} as const;
