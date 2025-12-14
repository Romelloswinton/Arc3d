export * from './theme';
export * from './widgets';

// App constants
export const APP_NAME = 'nanobanana pro';
export const APP_TAGLINE = 'Ultimate Twitch Customization Platform';

// Feature tiers
export const TIERS = {
  FREE: {
    name: 'Free',
    price: '$0',
    features: [
      'Basic overlay templates',
      '5 custom badges',
      'Limited widget library',
      'Community support',
      'Export to PNG',
    ]
  },
  PRO: {
    name: 'Pro',
    price: '$9.99/mo',
    features: [
      'Unlimited overlays & badges',
      'Advanced canvas tools',
      'Full widget library',
      'AI-powered customization',
      'Priority support',
      'Export to multiple formats',
      'Custom animations',
      'Collaboration tools',
    ]
  }
};
