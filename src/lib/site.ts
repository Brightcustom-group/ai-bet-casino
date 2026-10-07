export const site = {
  name: 'AI Bet Casino',
  domain: 'aibetcasino.com',
  description:
    'Sports previews, odds analysis, betting tips and casino-game guides for adults in South Africa — informational content with responsible-gambling guidance.',
  locale: 'en-ZA',
  timeZone: 'Africa/Johannesburg',
} as const

// Responsible-gambling copy lives in one place so legal/compliance can review it.
// TODO(compliance): confirm wording and helpline details before production launch.
export const responsibleGambling = {
  ageNotice: '18+ only',
  shortNotice:
    'Information only. No outcome is guaranteed. Gambling involves risk — only stake what you can afford to lose.',
  helplineName: 'National Responsible Gambling Programme',
  helplinePhone: '0800 006 008',
  helplineUrl: 'https://responsiblegambling.org.za',
} as const
