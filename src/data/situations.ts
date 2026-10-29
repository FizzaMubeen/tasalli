import { Situation } from '../types';

export const SITUATIONS: Situation[] = [
  {
    slug: 'job-rizq',
    title: 'Job & Rizq',
    arabicTitle: 'الرِّزْقُ وَالْعَمَل',
    description: 'When striving for halal provision, facing unemployment, or uncertain about career paths.',
    iconName: 'Briefcase'
  },
  {
    slug: 'money-debt',
    title: 'Money & Debt',
    arabicTitle: 'الدَّيْنُ وَالْمَال',
    description: 'When carrying financial strain, striving to repay debts, or seeking barakah.',
    iconName: 'Coins'
  },
  {
    slug: 'anxiety',
    title: 'Anxiety & Worry',
    arabicTitle: 'الْقَلَقُ وَالْهَمّ',
    description: 'When racing thoughts, dread of the future, or chest tightness cloud the mind.',
    iconName: 'CloudRain'
  },
  {
    slug: 'grief',
    title: 'Grief & Loss',
    arabicTitle: 'الْحُزْنُ وَالْفَقْد',
    description: 'When mourning the departure of a loved one or carrying deep sorrow of loss.',
    iconName: 'HeartHandshake'
  },
  {
    slug: 'illness',
    title: 'Illness & Pain',
    arabicTitle: 'الْمَرَضُ وَالشِّفَاء',
    description: 'When bearing physical sickness, chronic pain, or praying for physical and spiritual shifa.',
    iconName: 'ShieldAlert'
  },
  {
    slug: 'exams',
    title: 'Exams & Study',
    arabicTitle: 'الدِّرَاسَةُ وَالامْتِحَان',
    description: 'When feeling exam apprehension, seeking focus, memory retention, and mental clarity.',
    iconName: 'GraduationCap'
  },
  {
    slug: 'marriage',
    title: 'Marriage & Spouse',
    arabicTitle: 'الزَّوَاجُ وَالسَّكِينَة',
    description: 'When praying for a righteous spouse, resolving marital tension, or cultivating mawaddah.',
    iconName: 'Heart'
  },
  {
    slug: 'family-conflict',
    title: 'Family Conflict',
    arabicTitle: 'صِلَةُ الرَّحِمِ وَالْأَهْل',
    description: 'When navigating strained ties with parents, siblings, or relatives with gentle patience.',
    iconName: 'Users'
  },
  {
    slug: 'guilt-tawbah',
    title: 'Guilt & Tawbah',
    arabicTitle: 'التَّوْبَةُ وَالاسْتِغْفَار',
    description: 'When weighed down by past missteps, seeking the vast ocean of Allah’s forgiveness.',
    iconName: 'Sparkles'
  },
  {
    slug: 'loneliness',
    title: 'Loneliness',
    arabicTitle: 'الْوَحْدَةُ وَالْأُنْس',
    description: 'When feeling estranged or unheard, rediscovering that Allah is closer than your jugular vein.',
    iconName: 'Moon'
  },
  {
    slug: 'anger',
    title: 'Anger & Frustration',
    arabicTitle: 'الْغَضَبُ وَالْحِلْم',
    description: 'When heat rises in the chest and you seek calmness, self-restraint, and soft speech.',
    iconName: 'Flame'
  },
  {
    slug: 'gratitude',
    title: 'Gratitude & Joy',
    arabicTitle: 'الشُّكْرُ وَالْحَمْد',
    description: 'When your heart overflows with appreciation, recognizing hidden gifts and praising Allah.',
    iconName: 'Sun'
  },
  {
    slug: 'patience',
    title: 'Patience in Hardship',
    arabicTitle: 'الصَّبْرُ وَالْفَرَج',
    description: 'When walking through prolonged trials, holding fast to sabr jameel and imminent ease.',
    iconName: 'Anchor'
  }
];

export const SITUATIONS_MAP = new Map(SITUATIONS.map(s => [s.slug, s]));
