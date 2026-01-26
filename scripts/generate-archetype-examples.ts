/**
 * Archetype Bio Examples Generator
 * Generates 100+ example pages for SEO long-tail traffic
 * Run with: npx tsx scripts/generate-archetype-examples.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Seeded random number generator for deterministic results
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return function() {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    hash ^= hash >>> 16;
    return (hash >>> 0) / 4294967296;
  };
}

// Pick random item from array using seeded RNG
function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

// Shuffle array using seeded RNG
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Dating app platforms
const DATING_APPS = ['Tinder', 'Bumble', 'Hinge', 'OkCupid', 'Feeld'] as const;
type DatingApp = typeof DATING_APPS[number];

// Archetype definitions
interface Archetype {
  id: string;
  name: string;
  emoji: string;
  description: string;
  traits: string[];
  bioTemplates: string[];
  whyItWorks: string[];
  keywords: string[];
}

const ARCHETYPES: Archetype[] = [
  {
    id: 'adventurer',
    name: 'The Adventurer',
    emoji: '',
    description: 'Thrill-seekers who live for experiences and spontaneous adventures',
    traits: ['spontaneous', 'outdoorsy', 'travel-lover', 'adrenaline-seeker'],
    bioTemplates: [
      "Life's too short for boring weekends. Currently planning my next {destination} trip. Looking for someone who says 'yes' first and asks questions later.",
      "Passport stamps > material things. {activity} enthusiast who believes the best stories start with 'So there I was...'",
      "Weekend forecast: {activity} with a chance of spontaneous road trips. Warning: I might convince you to {adventure}.",
      "If you can't find me, check the nearest {location}. Bonus points if you bring {item} and a sense of adventure.",
      "My ideal date involves {activity}, questionable decisions, and stories we'll laugh about later. Couch potatoes need not apply.",
      "{number} countries and counting. Next stop: wherever you want to go. I bring the snacks and killer playlist.",
      "Looking for a co-pilot for life's adventures. Must be okay with {quirk} and spontaneous 'let's just go' moments.",
    ],
    whyItWorks: [
      "Creates excitement and suggests an active, fulfilling lifestyle",
      "Shows confidence and decisiveness - attractive qualities",
      "Invites the reader into the adventure, making them imagine experiences together",
      "Demonstrates passion and enthusiasm without being boastful",
      "Filters for compatible matches who also value experiences",
    ],
    keywords: ['hiking', 'travel', 'adventure', 'spontaneous', 'outdoors'],
  },
  {
    id: 'intellectual',
    name: 'The Intellectual',
    emoji: '',
    description: 'Deep thinkers who value meaningful conversations and curiosity',
    traits: ['curious', 'well-read', 'thoughtful', 'analytical'],
    bioTemplates: [
      "Currently reading {book}. Can debate {topic} for hours. Looking for someone who challenges my thinking.",
      "I have strong opinions about {topic} and I'm willing to be wrong. Let's get coffee and solve the world's problems.",
      "Museum dates > club nights. I find {subject} fascinating and can explain why {fact}. Yes, I'm fun at parties.",
      "Sapiosexual is overused, but I genuinely find intelligence attractive. Impress me with your take on {topic}.",
      "My love language is sending interesting articles at 2am. Current obsession: {interest}. Previous: {past_interest}.",
      "Looking for someone who can hold a conversation beyond small talk. Bonus if you can explain {concept} to me.",
      "I ask too many questions and remember everything you tell me. Currently curious about {topic}.",
    ],
    whyItWorks: [
      "Signals depth and substance beyond surface-level attraction",
      "Creates conversation hooks that make messaging easier",
      "Shows self-awareness and humor about intellectual tendencies",
      "Attracts matches who also value mental stimulation",
      "Demonstrates curiosity, which is attractive and suggests good listening skills",
    ],
    keywords: ['books', 'philosophy', 'science', 'curiosity', 'deep conversations'],
  },
  {
    id: 'funny',
    name: 'The Funny One',
    emoji: '',
    description: 'Life of the party who uses humor to connect and charm',
    traits: ['witty', 'playful', 'self-deprecating', 'quick-witted'],
    bioTemplates: [
      "I'm {height} but my personality is at least {taller_height}. Will make you laugh at inappropriate moments.",
      "Looking for someone to {silly_activity}. I promise I'm funnier in person. My texts are like movie trailers - they don't do it justice.",
      "Pro: I'll make you laugh until you snort. Con: I might {embarrassing_habit}. It's a package deal.",
      "My therapist says I use humor as a defense mechanism. I told her that's hilarious.",
      "I peaked in {year} when {funny_achievement}. Been riding that high ever since. Looking for my biggest fan.",
      "Warning: I will quote {movie} at least {number} times on our first date. Second date? We're at {higher_number}.",
      "I'm basically a golden retriever in human form. Will greet you enthusiastically and probably {dog_behavior}.",
    ],
    whyItWorks: [
      "Humor is universally attractive and memorable",
      "Self-deprecating jokes show confidence and humility",
      "Creates a warm, approachable vibe that makes messaging feel low-pressure",
      "Shows personality immediately - no boring generic bios here",
      "Demonstrates social intelligence and quick wit",
    ],
    keywords: ['humor', 'witty', 'jokes', 'funny', 'comedy'],
  },
  {
    id: 'professional',
    name: 'The Professional',
    emoji: '',
    description: 'Ambitious career-focused individuals who know what they want',
    traits: ['ambitious', 'driven', 'put-together', 'goal-oriented'],
    bioTemplates: [
      "{job_title} by day, {hobby} enthusiast by night. Looking for someone who matches my energy and supports my goals.",
      "Building {career_goal} one {action} at a time. I work hard but I know how to unwind. Let's grab {drink} and talk dreams.",
      "Yes, I actually love my job. {industry} professional who believes you can have it all - career, love, and {hobby}.",
      "Swipe right if you want someone who has their life together but isn't boring about it. I make time for what matters.",
      "My calendar is full but I'll make room for the right person. Currently obsessed with {interest} and my morning routine.",
      "I date with intention. Looking for a partner, not a project. Must appreciate ambition and {quality}.",
      "Work-life balance is my love language. {job} during the week, {weekend_activity} on weekends. Join me?",
    ],
    whyItWorks: [
      "Shows stability and maturity - signals long-term potential",
      "Balance of professional ambition with personal interests is attractive",
      "Direct about intentions, which saves everyone's time",
      "Demonstrates they have their own life and aren't looking for completion",
      "Confidence without arrogance - appealing to mature daters",
    ],
    keywords: ['career', 'ambitious', 'professional', 'driven', 'successful'],
  },
  {
    id: 'creative',
    name: 'The Creative',
    emoji: '',
    description: 'Artists and dreamers who see the world differently',
    traits: ['artistic', 'imaginative', 'expressive', 'unique'],
    bioTemplates: [
      "{creative_field} by passion, {day_job} by necessity. Looking for someone who appreciates {art_form} and late-night {activity}.",
      "I see beauty in {unexpected_thing}. Currently working on {project}. My ideal date involves {creative_activity}.",
      "Warning: I will photograph our food, sketch you while you sleep, and write songs about our arguments. Worth it?",
      "My apartment looks like a {art_style} painting exploded. I make {creation} and collect {objects}. Let's create something together.",
      "I process emotions through {art_form}. Currently feeling {emotion} about {topic}. Looking for my muse.",
      "Normal is boring. I want someone who {unusual_quality} and doesn't mind that I {quirk}.",
      "Let's skip the small talk and go straight to discussing {deep_topic} over {drink} at my favorite {venue}.",
    ],
    whyItWorks: [
      "Unique and memorable - stands out from generic profiles",
      "Shows depth and emotional intelligence",
      "Invites curiosity and questions from potential matches",
      "Demonstrates passion and dedication to interests",
      "Signals openness and creativity in relationships too",
    ],
    keywords: ['art', 'music', 'creative', 'artist', 'unique'],
  },
  {
    id: 'fitness',
    name: 'The Fitness Enthusiast',
    emoji: '',
    description: 'Health-conscious individuals who prioritize physical wellness',
    traits: ['disciplined', 'health-conscious', 'active', 'dedicated'],
    bioTemplates: [
      "{fitness_activity} is my therapy. Looking for someone who can keep up or at least cheer from the sidelines.",
      "Yes, I wake up at {early_time} to work out. No, I won't make you join me. Unless you want to.",
      "I meal prep on Sundays and never skip leg day. But I also believe in balance - pizza is a food group.",
      "Looking for a {gym_activity} partner or someone to stretch with after. Both equally important.",
      "Current PRs: {exercise} - {weight}. Current dating goals: Someone who {quality} and doesn't judge my protein shakes.",
      "I take my health seriously but not myself. Will flex for you if asked nicely.",
      "Fitness journey > fitness destination. Let's grow together, in and out of the gym.",
    ],
    whyItWorks: [
      "Shows discipline and dedication - transferable relationship qualities",
      "Physical fitness signals health and vitality",
      "Balance between commitment and humor makes it approachable",
      "Filters for compatible lifestyles",
      "Demonstrates self-improvement mindset",
    ],
    keywords: ['fitness', 'gym', 'health', 'active', 'workout'],
  },
  {
    id: 'foodie',
    name: 'The Foodie',
    emoji: '',
    description: 'Culinary explorers who express love through food',
    traits: ['adventurous eater', 'cook', 'restaurant lover', 'cultured'],
    bioTemplates: [
      "The way to my heart is through {cuisine} food. Currently obsessed with {restaurant}. Take me somewhere I haven't been.",
      "I cook better than your ex and I'm not afraid to admit I have opinions about {food_topic}.",
      "Looking for someone to share tapas with. I don't share dessert though - we'll order two.",
      "My kitchen is the heart of my home. I make a mean {dish} and I'm working on perfecting my {other_dish}.",
      "Food is my love language. Let me cook for you and I'll know if this is going to work by your reaction.",
      "I have a running list of {number} restaurants to try. Looking for a dining partner with adventurous taste buds.",
      "Farmers market dates > fancy restaurants. Let's pick ingredients and cook together.",
    ],
    whyItWorks: [
      "Food is universal - everyone can relate",
      "Shows nurturing qualities through cooking",
      "Creates easy date ideas and conversation topics",
      "Demonstrates appreciation for experiences and culture",
      "Suggests they'll put effort into the relationship",
    ],
    keywords: ['food', 'cooking', 'restaurants', 'culinary', 'chef'],
  },
  {
    id: 'homebody',
    name: 'The Cozy Homebody',
    emoji: '',
    description: 'Comfort-seekers who treasure quality time at home',
    traits: ['cozy', 'introverted', 'comfort-loving', 'low-key'],
    bioTemplates: [
      "Netflix and actually chill. Looking for someone who appreciates a quiet night in with {comfort_item}.",
      "I have strong opinions about {home_topic} and I'm not ashamed. My couch has permanent butt imprints.",
      "Introvert looking for another introvert to cancel plans with. Let's stay home and {activity} together.",
      "My ideal weekend: {home_activity}, {comfort_food}, and no pants required. Join me?",
      "I recharge by staying in. Looking for someone who gets that and doesn't try to 'fix' me.",
      "Warning: Once you experience my home-cooked {dish} and my {cozy_item} collection, you might never leave.",
      "Let's be the old couple who stays in on Friday nights. We can start practicing now.",
    ],
    whyItWorks: [
      "Authentically attracts compatible introverts",
      "Honest about lifestyle expectations",
      "Cozy vibes feel safe and comforting",
      "Filters out high-maintenance matches",
      "Shows comfort with themselves and their needs",
    ],
    keywords: ['cozy', 'homebody', 'introvert', 'netflix', 'quiet'],
  },
  {
    id: 'romantic',
    name: 'The Hopeless Romantic',
    emoji: '',
    description: 'Old souls who believe in love and grand gestures',
    traits: ['romantic', 'thoughtful', 'old-fashioned', 'sentimental'],
    bioTemplates: [
      "Still believe in {romantic_concept}. Looking for someone who wants to be swept off their feet.",
      "I write love letters and remember anniversaries. Looking for someone who appreciates the little things.",
      "Hopeless romantic in a hookup culture. I want the real thing - the {romantic_thing} and the {other_romantic_thing}.",
      "I'll plan surprise dates and remember how you take your coffee. Looking for someone who matches my energy.",
      "Old soul looking for a love story. Not interested in games - let's be embarrassingly in love.",
      "I believe in soulmates, fate, and that we matched for a reason. Change my mind or prove me right.",
      "Looking for my person. The one I can {romantic_activity} with and still feel butterflies years from now.",
    ],
    whyItWorks: [
      "Vulnerable and genuine - rare in dating app culture",
      "Clear about relationship goals and expectations",
      "Appeals to others seeking serious relationships",
      "Demonstrates emotional availability and investment",
      "Romantic energy is magnetic and hopeful",
    ],
    keywords: ['romantic', 'love', 'soulmate', 'relationship', 'committed'],
  },
  {
    id: 'mystery',
    name: 'The Mysterious One',
    emoji: '',
    description: 'Intriguing souls who reveal themselves slowly',
    traits: ['enigmatic', 'confident', 'selective', 'intriguing'],
    bioTemplates: [
      "I have layers. Swipe right to start peeling them back.",
      "Ask me about {mysterious_topic}. Better yet, ask me about {other_topic}. Actually, just buy me coffee.",
      "I'm an open book written in a language you'll have to learn. Worth the effort.",
      "Looking for someone curious enough to ask the right questions.",
      "What you see isn't what you get. It's better.",
      "I don't overshare online. If you want to know me, you'll have to show up.",
      "Low-key living my best life. Looking for someone to join the adventure I won't post about.",
    ],
    whyItWorks: [
      "Creates curiosity and encourages conversation",
      "Confidence is attractive without arrogance",
      "Stands out from over-sharing profiles",
      "Suggests depth worth exploring",
      "Challenges matches to engage meaningfully",
    ],
    keywords: ['mysterious', 'intriguing', 'confident', 'deep', 'interesting'],
  },
];

// Fill-in data for templates
const FILL_DATA = {
  destination: ['Bali', 'Iceland', 'Japan', 'Patagonia', 'New Zealand', 'Morocco'],
  activity: ['rock climbing', 'surfing', 'hiking', 'skiing', 'scuba diving', 'camping'],
  adventure: ['book a flight tonight', 'go skydiving', 'try that weird restaurant', 'road trip without GPS'],
  location: ['hiking trail', 'climbing gym', 'beach', 'mountain', 'farmers market'],
  item: ['good coffee', 'trail mix', 'a map', 'hiking boots', 'sunscreen'],
  quirk: ['4am alarms for sunrise hikes', 'spreadsheets for trip planning', 'packing light', 'talking to strangers'],
  number: ['23', '15', '30', '12', '18', '25'],
  book: ['Sapiens', 'a philosophy book you\'ve never heard of', '3 books at once', 'whatever the algorithm recommended'],
  topic: ['coffee brewing methods', 'space exploration', 'consciousness', 'the Oxford comma', 'pizza toppings'],
  subject: ['ancient history', 'behavioral economics', 'astrophysics', 'linguistics', 'art history'],
  fact: ['the moon is slowly leaving us', 'octopuses have three hearts', 'honey never spoils'],
  interest: ['quantum computing', 'stoic philosophy', 'urban planning', 'evolutionary biology'],
  past_interest: ['ancient Rome', 'mushroom foraging', 'the Fermi paradox', 'coffee chemistry'],
  concept: ['blockchain', 'the grandfather paradox', 'why we dream', 'the Monty Hall problem'],
  height: ['5\'8"', '5\'10"', '6\'0"', '5\'6"', '5\'11"'],
  taller_height: ['6\'5"', '6\'7"', '7\'0"', '8\'2"'],
  silly_activity: ['judge dogs at the park', 'narrate strangers\' lives', 'rate pizza places', 'rate cereal'],
  embarrassing_habit: ['laugh at my own jokes', 'snort when I laugh', 'talk during movies', 'cry at commercials'],
  year: ['2016', '2019', '7th grade', 'my gap year', 'last Tuesday'],
  funny_achievement: ['I caught a grape in my mouth from 20 feet', 'I won a costume contest', 'I made a stranger laugh on the subway'],
  movie: ['The Office', 'Parks and Rec', 'Arrested Development', 'It\'s Always Sunny', 'Schitt\'s Creek'],
  higher_number: ['47', '200', 'literally every scene'],
  dog_behavior: ['wag when excited', 'nap in sunbeams', 'get distracted by squirrels'],
  job_title: ['Marketing Director', 'Software Engineer', 'Startup Founder', 'Product Manager', 'Financial Analyst'],
  hobby: ['tennis', 'photography', 'cooking', 'reading', 'yoga'],
  career_goal: ['my dream company', 'a better future', 'something meaningful', 'my empire'],
  action: ['meeting', 'late night', 'coffee', 'idea'],
  industry: ['Tech', 'Finance', 'Healthcare', 'Creative', 'Consulting'],
  drink: ['an old fashioned', 'oat milk lattes', 'natural wine', 'craft beer'],
  quality: ['intellectual conversations', 'emotional intelligence', 'drive', 'good taste'],
  job: ['Building products', 'Closing deals', 'Creating strategies', 'Solving problems'],
  weekend_activity: ['hiking', 'brunching', 'exploring new neighborhoods', 'lazy mornings'],
  creative_field: ['Photographer', 'Writer', 'Musician', 'Designer', 'Filmmaker'],
  day_job: ['barista', 'freelancer', 'accountant', 'teacher'],
  art_form: ['photography', 'live music', 'obscure films', 'street art', 'poetry'],
  unexpected_thing: ['rainy days', 'old buildings', 'strangers\' conversations', 'empty streets at night'],
  project: ['a short film', 'my second album', 'a photo series', 'a novel nobody asked for'],
  creative_activity: ['gallery hopping', 'record shopping', 'people watching', 'writing in cafes'],
  art_style: ['modern art', 'vintage thrift store', 'Pinterest board', 'chaotic neutral'],
  creation: ['things nobody needs', 'art from trash', 'songs about breakfast', 'weird ceramics'],
  objects: ['vintage cameras', 'weird art', 'houseplants I forget to water', 'records I\'ve never played'],
  unusual_quality: ['appreciates weird humor', 'stays up too late thinking', 'notices small details'],
  deep_topic: ['what scares us', 'childhood dreams', 'parallel universes', 'our therapists'],
  venue: ['dive bar', 'coffee shop', 'rooftop', 'bookstore'],
  emotion: ['inspired', 'nostalgic', 'chaotic', 'contemplative'],
  fitness_activity: ['Running', 'Lifting', 'CrossFit', 'Yoga', 'Swimming', 'Boxing'],
  early_time: ['5am', '5:30am', '6am', 'an unreasonable hour'],
  gym_activity: ['climbing', 'running', 'yoga', 'hiking'],
  exercise: ['Deadlift', 'Squat', 'Bench', 'Run'],
  weight: ['315lbs', '225lbs', '405lbs', 'a 7-minute mile'],
  cuisine: ['Thai', 'Japanese', 'Italian', 'Mexican', 'Indian', 'Korean'],
  restaurant: ['that new ramen place', 'a hidden gem taco spot', 'the trendy wine bar', 'my kitchen'],
  food_topic: ['olive oil', 'instant ramen upgrades', 'the best tacos in the city', 'breakfast foods'],
  dish: ['risotto', 'homemade pasta', 'beef wellington', 'the perfect steak'],
  other_dish: ['sourdough', 'croissants', 'ramen from scratch', 'authentic pad thai'],
  comfort_item: ['good wine', 'a cozy blanket', 'takeout', 'board games'],
  home_topic: ['blanket quality', 'candle scents', 'the correct room temperature', 'pillow counts'],
  home_activity: ['binge-watching', 'cooking experiments', 'napping', 'reading in the bathtub'],
  comfort_food: ['fresh pasta', 'grilled cheese', 'homemade soup', 'takeout thai'],
  cozy_item: ['blanket', 'candle', 'houseplant', 'cookbook'],
  romantic_concept: ['love at first sight', 'the one', 'fate', 'handwritten notes'],
  romantic_thing: ['slow dancing in the kitchen', 'love letters', 'surprise dates', 'grand gestures'],
  other_romantic_thing: ['growing old together', 'inside jokes', 'comfortable silences', 'daily I love yous'],
  romantic_activity: ['slow dance in the living room', 'stargaze', 'have breakfast in bed', 'fall asleep on the couch'],
  mysterious_topic: ['my scar', 'why I moved here', 'the book I\'m writing', 'my past life'],
  other_topic: ['my hidden talent', 'my controversial opinion', 'my worst date story'],
};

interface BioExample {
  bio: string;
  whyItWorks: string;
}

interface ArchetypePageData {
  archetype: Archetype;
  app: DatingApp;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  examples: BioExample[];
}

function fillTemplate(template: string, rng: () => number): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const options = FILL_DATA[key as keyof typeof FILL_DATA];
    if (options) {
      return pickRandom(options, rng);
    }
    return `{${key}}`;
  });
}

function generateExamplesForArchetype(archetype: Archetype, app: DatingApp): BioExample[] {
  const seed = `${archetype.id}-${app}`;
  const rng = seededRandom(seed);
  
  // Shuffle templates and pick 5
  const shuffledTemplates = shuffle(archetype.bioTemplates, rng).slice(0, 5);
  const shuffledWhyItWorks = shuffle(archetype.whyItWorks, rng);
  
  return shuffledTemplates.map((template, i) => ({
    bio: fillTemplate(template, rng),
    whyItWorks: shuffledWhyItWorks[i % shuffledWhyItWorks.length],
  }));
}

function generatePageData(archetype: Archetype, app: DatingApp): ArchetypePageData {
  const slug = `${archetype.id}-${app.toLowerCase()}-bios`;
  const examples = generateExamplesForArchetype(archetype, app);
  
  return {
    archetype,
    app,
    slug,
    metaTitle: `Top 10 ${archetype.name} Dating Bios for ${app} | SwipeBetter.ai`,
    metaDescription: `Get the best ${archetype.name.toLowerCase()} bio examples for ${app}. AI-crafted dating bios that actually get matches. ${archetype.description}.`,
    examples,
  };
}

function generateAllPages(): ArchetypePageData[] {
  const pages: ArchetypePageData[] = [];
  
  for (const archetype of ARCHETYPES) {
    for (const app of DATING_APPS) {
      pages.push(generatePageData(archetype, app));
    }
  }
  
  return pages;
}

// Export for database insertion
interface DatabaseRecord {
  slug: string;
  archetype_id: string;
  archetype_name: string;
  app: string;
  meta_title: string;
  meta_description: string;
  examples_json: string;
  keywords: string[];
  created_at: Date;
}

function generateDatabaseRecords(): DatabaseRecord[] {
  const pages = generateAllPages();
  
  return pages.map(page => ({
    slug: page.slug,
    archetype_id: page.archetype.id,
    archetype_name: page.archetype.name,
    app: page.app,
    meta_title: page.metaTitle,
    meta_description: page.metaDescription,
    examples_json: JSON.stringify(page.examples),
    keywords: [...page.archetype.keywords, page.app.toLowerCase(), 'dating bio', 'bio examples'],
    created_at: new Date(),
  }));
}

// Export for static file generation
function generateStaticFiles(): void {
  const pages = generateAllPages();
  
  const outputDir = path.join(__dirname, '../generated/archetype-pages');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate index file
  const index = {
    generated_at: new Date().toISOString(),
    total_pages: pages.length,
    archetypes: ARCHETYPES.map(a => ({ id: a.id, name: a.name })),
    apps: DATING_APPS,
    pages: pages.map(p => ({
      slug: p.slug,
      archetype: p.archetype.name,
      app: p.app,
      url: `/examples/${p.slug}`,
    })),
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'index.json'),
    JSON.stringify(index, null, 2)
  );
  
  // Generate individual page files
  for (const page of pages) {
    const pageData = {
      slug: page.slug,
      archetype: {
        id: page.archetype.id,
        name: page.archetype.name,
        emoji: page.archetype.emoji,
        description: page.archetype.description,
      },
      app: page.app,
      meta: {
        title: page.metaTitle,
        description: page.metaDescription,
      },
      examples: page.examples,
      relatedPages: pages
        .filter(p => p.archetype.id === page.archetype.id && p.app !== page.app)
        .map(p => ({ slug: p.slug, app: p.app })),
    };
    
    fs.writeFileSync(
      path.join(outputDir, `${page.slug}.json`),
      JSON.stringify(pageData, null, 2)
    );
  }
  
  console.log(`Generated ${pages.length} pages in ${outputDir}`);
}

// Main execution (ESM compatible)
const args = process.argv.slice(2);

if (args.includes('--static')) {
  console.log('Generating static JSON files...');
  generateStaticFiles();
} else if (args.includes('--database')) {
  console.log('Generating database records...');
  const records = generateDatabaseRecords();
  console.log(JSON.stringify(records, null, 2));
  console.log(`\nTotal records: ${records.length}`);
} else {
  console.log('Archetype Bio Examples Generator');
  console.log('=================================');
  console.log('');
  console.log('Usage:');
  console.log('  npx tsx scripts/generate-archetype-examples.ts --static    # Generate JSON files');
  console.log('  npx tsx scripts/generate-archetype-examples.ts --database  # Output database records');
  console.log('');
  console.log('Available Archetypes:');
  ARCHETYPES.forEach(a => console.log(`  - ${a.name}: ${a.description}`));
  console.log('');
  console.log('Dating Apps:', DATING_APPS.join(', '));
  console.log('');
  console.log(`Total pages that will be generated: ${ARCHETYPES.length * DATING_APPS.length}`);
}

export {
  ARCHETYPES,
  DATING_APPS,
  generateAllPages,
  generateDatabaseRecords,
  generateStaticFiles,
  ArchetypePageData,
  BioExample,
};
