export const site = {
  name: 'Code Coffee Break',
  url: 'https://codecoffeebreak.com',
  description:
    'Developer meetups in Phoenix, Arizona. Explore AI agents, work on side projects, and meet other developers over coffee. First gathering coming soon.',
  editorialName: 'Code Coffee Break',
  meetupSubmissionsEnabled: false,
  navigation: [
    { label: 'Meetups', href: '/meetups' },
    { label: 'Blog', href: '/articles' },
    { label: 'Tools', href: '/tools' },
    { label: 'About', href: '/about' },
  ],
  topics: [
    'AI Engineering',
    'Architecture',
    'Developer Tools',
    'Web Development',
    'Performance',
  ],
} as const;
