export const icons = [
  'arrow-left',
  'arrow-right',
  'arrow-up-square',
  'backpack',
  'check-square',
  'close',
  'cup-hot',
  'exclamation-square',
  'github',
  'info-square',
  'magnify',
  'search',
  'trolley',
] as const;
export type IconName = (typeof icons)[number];
