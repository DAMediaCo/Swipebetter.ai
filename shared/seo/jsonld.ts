export interface SoftwareApplicationJsonLdProps {
  name: string;
  description: string;
  url: string;
  applicationCategory?: 'BusinessApplication' | 'LifestyleApplication' | 'SocialNetworkingApplication';
  operatingSystem?: string;
  softwareVersion?: string;
  featureList?: string[];
  screenshot?: string;
  isFree?: boolean;
  price?: string;
  priceCurrency?: string;
  aggregateRating?: {
    ratingValue: number;
    ratingCount: number;
  };
}

export function generateSoftwareApplicationJsonLd(props: SoftwareApplicationJsonLdProps): string {
  const {
    name,
    description,
    url,
    applicationCategory = 'LifestyleApplication',
    operatingSystem = 'Web, iOS, Android',
    softwareVersion = '1.0.0',
    featureList = [],
    screenshot,
    isFree = true,
    price = '0',
    priceCurrency = 'USD',
    aggregateRating,
  } = props;

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'WebApplication'],
    name,
    description,
    url,
    applicationCategory,
    operatingSystem,
    softwareVersion,
    offers: {
      '@type': 'Offer',
      price: isFree ? '0' : price,
      priceCurrency,
    },
  };

  if (featureList.length > 0) {
    jsonLd.featureList = featureList;
  }

  if (screenshot) {
    jsonLd.screenshot = screenshot;
  }

  if (aggregateRating) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: aggregateRating.ratingValue,
      ratingCount: aggregateRating.ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return JSON.stringify(jsonLd);
}

export function getToolPageJsonLd(toolType: 'bio-generator' | 'profile-analyzer' | 'rizz-assistant'): string {
  const baseUrl = 'https://swipebetter.ai';
  
  const tools: Record<string, SoftwareApplicationJsonLdProps> = {
    'bio-generator': {
      name: 'Tinder Bio Generator - SwipeBetter.ai',
      description: 'AI-powered dating bio generator that creates engaging, personalized bios for Tinder, Bumble, Hinge and other dating apps.',
      url: `${baseUrl}/tools/bio-generator`,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web, iOS, Android',
      featureList: [
        'AI-powered bio generation',
        'Personalized to your interests',
        'Multiple bio style options',
        'One-click copy to clipboard',
        'Works with Tinder, Bumble, Hinge',
      ],
      screenshot: `${baseUrl}/screenshots/bio-generator.png`,
      isFree: true,
    },
    'profile-analyzer': {
      name: 'Dating Profile Analyzer - SwipeBetter.ai',
      description: 'Get AI-powered feedback on your dating profile photos and bio to increase your matches on Tinder, Bumble, and Hinge.',
      url: `${baseUrl}/tools/profile-analyzer`,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web, iOS, Android',
      featureList: [
        'AI-powered profile analysis',
        'Photo-by-photo feedback',
        'Bio improvement suggestions',
        'Match score prediction',
        'Actionable improvement tips',
      ],
      screenshot: `${baseUrl}/screenshots/profile-analyzer.png`,
      isFree: true,
    },
    'rizz-assistant': {
      name: 'Rizz Assistant - SwipeBetter.ai',
      description: 'AI-powered conversation helper that generates witty, engaging replies for your dating app conversations.',
      url: `${baseUrl}/tools/rizz-assistant`,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web, iOS, Android',
      featureList: [
        'AI-powered reply suggestions',
        'Context-aware responses',
        'Multiple tone options',
        'Conversation starters',
        'Screenshot analysis',
      ],
      screenshot: `${baseUrl}/screenshots/rizz-assistant.png`,
      isFree: true,
    },
  };

  return generateSoftwareApplicationJsonLd(tools[toolType]);
}
