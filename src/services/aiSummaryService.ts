import { BookSummaryData } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Purge any legacy cached summaries that contained preachy boilerplate
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('rh_summary_')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore storage restrictions
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\[.*?\]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/###\s*How to Apply These Insights Today[\s\S]*/gi, '')
    .replace(/1\.\s*\*\*Establish a Daily Sanctuary\*\*[\s\S]*/gi, '')
    .replace(/\*\*Establish a Daily Sanctuary\*\*[\s\S]*/gi, '')
    .trim();
}

// High-fidelity curated summaries for iconic literature & non-fiction
const CURATED_SUMMARIES: Record<string, BookSummaryData> = {
  'atomic habits': {
    bookTitle: 'Atomic Habits',
    bookAuthor: 'James Clear',
    readTimeMinutes: 7,
    oneSentenceTakeaway:
      'True behavioral change is not the result of massive, once-in-a-lifetime transformations, but the compounding effect of hundreds of tiny, 1% daily decisions governed by identity and systems.',
    keyIdeas: [
      {
        title: '1. Systems Over Goals',
        description:
          'You do not rise to the level of your goals; you fall to the level of your systems. Winners and losers in any field share the exact same goal—what separates them is the consistency of their underlying system.',
      },
      {
        title: '2. Identity-Based Habit Formation',
        description:
          'The deepest shift happens when you focus on who you want to become rather than what you want to achieve. Every action is a vote for the type of person you wish to be.',
      },
      {
        title: '3. The Four Laws of Behavioral Change',
        description:
          'To build a good habit: Make it Obvious (cue), Make it Attractive (craving), Make it Easy (response), and Make it Satisfying (reward). To break a bad habit, invert these four rules.',
      },
      {
        title: '4. The Plateau of Latent Potential',
        description:
          'Habits often appear to make no difference until you cross a critical threshold. Work is not wasted; it is simply being stored until the compounding effect becomes visible.',
      },
    ],
    fullSummaryMarkdown: `### The Surprising Power of Atomic Habits
Most people think that becoming extraordinary requires radical reinvention. James Clear demonstrates that the most significant breakthroughs are almost always the accumulated outcome of tiny, seemingly inconsequential choices—the "atomic" habits. Just as atoms are the building blocks of molecules, atomic habits are the foundational building blocks of remarkable results.

### The Problem With Relying on Willpower
Willpower is an exhaustible resource. If your environment continuously tempts you, willpower will eventually fail. The key is **environment design**: make good habits the path of least resistance by placing cues in your direct sightline, while hiding the friction-inducing cues of undesirable habits.

### Habit Stacking & Two-Minute Rule
When adopting a new practice, anchor it immediately following an established ritual: *"After [CURRENT HABIT], I will [NEW HABIT]."* Furthermore, scale down the entry barrier using the **Two-Minute Rule**: make the initial action take less than two minutes (e.g., "read one page" rather than "read for an hour"). Once you begin, the momentum carries you forward.

### Summary Verdict
A pragmatic, scientifically backed masterpiece that strips away motivational fluff and replaces it with an actionable blueprint for continuous personal growth.`,
    notableQuotes: [
      '“You do not rise to the level of your goals. You fall to the level of your systems.”',
      '“Every action you take is a vote for the type of person you wish to become.”',
      '“Be the designer of your world and not merely the consumer of it.”',
    ],
    cached: true,
  },

  'the creative act': {
    bookTitle: 'The Creative Act: A Way of Being',
    bookAuthor: 'Rick Rubin',
    readTimeMinutes: 6,
    oneSentenceTakeaway:
      'Creativity is not a rare talent possessed by a gifted few, but a fundamental way of relating to reality through open perception, deep listening, and radical non-attachment to outcomes.',
    keyIdeas: [
      {
        title: '1. The Artist as a Receiver',
        description:
          'Material is not generated from thin air by the ego; it flows through you from the universe. The artist’s primary discipline is maintaining sensitivity, presence, and openness to receive what is already there.',
      },
      {
        title: '2. Listening Without Judgment',
        description:
          'Doubt and premature critique are the enemy of discovery. True creative listening requires giving every quiet instinct space to reveal itself before deciding if it belongs.',
      },
      {
        title: '3. Detachment from the Audience',
        description:
          'Make art purely for yourself and for the work itself. When you attempt to anticipate market tastes or audience praise, you compromise the authentic frequency that makes the work compelling in the first place.',
      },
      {
        title: '4. Completion is a Practice',
        description:
          'A project is never truly finished—you simply step away from it when it has reached its natural conclusion. Moving on frees your vessel to receive the next transmission.',
      },
    ],
    fullSummaryMarkdown: `### A Meditative Approach to Making Art
Legendary music producer Rick Rubin distills four decades of artistic stewardship into a serene, aphoristic philosophical treatise. *The Creative Act* is not a how-to guide for making commercial hits; it is a meditation on human awareness, mindfulness, and the sacred act of paying close attention to life.

### The Four Phases of Creation
Rubin sketches the creative lifecycle into four gentle stages:
1. **The Seed**: Gathering raw impressions without filter or judgment.
2. **Experimentation**: Playing with possibilities without concern for perfection.
3. **Crafting**: Refining and sculpting the strongest ideas into coherent form.
4. **Completion**: Letting go and offering the work to the world with peace.

### Cultivating Innocence & Beginner’s Mind
Expertise can become a prison when it locks an artist into habitual patterns. The ultimate competitive advantage in creative pursuit is the beginner’s mind—approaching each session with curiosity, humility, and the freedom to make choices that experts would dismiss as impossible.`,
    notableQuotes: [
      '“Being an artist isn’t only about what you make. It’s about your relationship to the world.”',
      '“The ability to look deeply is the root of creativity. To see past the ordinary and discover the extraordinary.”',
      '“Art is our portal to the unseen world.”',
    ],
    cached: true,
  },

  'meditations': {
    bookTitle: 'Meditations',
    bookAuthor: 'Marcus Aurelius',
    readTimeMinutes: 8,
    oneSentenceTakeaway:
      'Peace of mind and moral fortitude arise not from controlling external circumstances, but from mastering your own perceptions, judgments, and inner character.',
    keyIdeas: [
      {
        title: '1. The Dichotomy of Control',
        description:
          'You have power over your mind, not outside events. Realize this, and you will find inner strength.',
      },
      {
        title: '2. The Transience of All Things',
        description:
          'Alexander the Great and his mule driver were both brought to the same dust. Viewing life through the lens of eternity cures anxiety, petty grievances, and pride.',
      },
      {
        title: '3. Duty to the Common Good',
        description:
          'Humans are made for cooperation, like feet, hands, and the rows of upper and lower teeth. Obstacles in social life are opportunities to practice patience, kindness, and justice.',
      },
      {
        title: '4. The Inner Citadel',
        description:
          'No retreat is more peaceful and free from trouble than that which a person finds within their own soul. Keep this inner citadel clear and unpolluted.',
      },
    ],
    fullSummaryMarkdown: `### A Private Journal for the Soul
Written on campaign along the Danube frontier between 161 and 180 CE, Marcus Aurelius never intended *Meditations* for public eyes. It was a personal notebook of Stoic spiritual exercises, reminders, and self-examinations written by the most powerful ruler of the ancient world.

### The Power of Immediate Perception
Marcus reminds himself constantly that external things do not touch the soul. They stand outside, quiet and inert; our torment springs entirely from our inner judgment about them. Remove the complaint *"I have been harmed"*, and the harm itself vanishes.

### Living in Accordance with Nature
For the Stoic, living in accordance with nature means exercising reason, refusing to be governed by animal impulse or fear, and accepting the natural order of life and death without bitterness.`,
    notableQuotes: [
      '“You have power over your mind - not outside events. Realize this, and you will find strength.”',
      '“The soul becomes dyed with the color of its thoughts.”',
      '“Waste no more time arguing what a good man should be. Be one.”',
    ],
    cached: true,
  },

  'deep work': {
    bookTitle: 'Deep Work: Rules for Focused Success',
    bookAuthor: 'Cal Newport',
    readTimeMinutes: 7,
    oneSentenceTakeaway:
      'The ability to perform deep, cognitively demanding work without distraction is becoming increasingly rare and valuable in our hyper-connected economy.',
    keyIdeas: [
      {
        title: '1. The Deep Work Hypothesis',
        description:
          'Professional activities performed in a state of distraction-free concentration push your cognitive capabilities to their limit and create rare, non-replicable value.',
      },
      {
        title: '2. The Scourge of Shallow Work',
        description:
          'Logistical, non-cognitively demanding tasks (emails, chat messages, meetings) consume modern days, giving the illusion of productivity while eroding the capacity for deep focus.',
      },
      {
        title: '3. Embrace Boredom',
        description:
          'If every moment of potential boredom is filled with phone scrolling, the brain’s neural circuits are permanently wired for novelty-seeking and cannot sustain intense focus.',
      },
      {
        title: '4. Drain the Shallows',
        description:
          'Ruthlessly schedule your day in blocks, establish clear shutdown rituals, and guard your focused attention like a precious asset.',
      },
    ],
    fullSummaryMarkdown: `### The Core Thesis
Computer science professor Cal Newport argues that we live in an era afflicted by "network tools" that fragment our attention. Those who master the skill of deep work will thrive, while those trapped in shallow work will find their skills commoditized.

### Strategies for Deep Work
Newport identifies four distinct scheduling philosophies:
- **Monastic**: Eliminating outside distractions entirely for long periods.
- **Bimodal**: Dividing time between deep retreats and regular operational days.
- **Rhythmic**: Setting a fixed, daily habit of 90–120 minutes of deep focus.
- **Journalistic**: Dropping into deep work on demand whenever time opens up.

### The Ritual of the Shutdown
To achieve deep relaxation and cognitive recovery, you must establish a clear end-of-day shutdown routine that settles all loose loops, signals the brain to release work anxiety, and protects sacred evening rest.`,
    notableQuotes: [
      '“If you don’t produce, you won’t thrive—no matter how skilled or talented you are.”',
      '“Clarity about what matters provides clarity about what does not.”',
      '“Efforts to deepen your focus will struggle if you don’t simultaneously wean your mind from a dependence on distraction.”',
    ],
    cached: true,
  },
};

export const aiSummaryService = {
  /**
   * Look up or generate an insightful 5–10 min executive summary for a book.
   */
  async getBookSummary(title: string, author: string, description?: string): Promise<BookSummaryData> {
    const cleanTitle = title.trim();
    const cleanAuthor = author.trim();
    const normalizedKey = cleanTitle.toLowerCase();

    // 1. Check curated exact matches
    for (const [key, summary] of Object.entries(CURATED_SUMMARIES)) {
      if (normalizedKey.includes(key) || key.includes(normalizedKey)) {
        return summary;
      }
    }

    // 2. Check local client-side cache
    const storageKey = `rh_summary_${normalizedKey.replace(/\s+/g, '_')}`;
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        return { ...parsed, cached: true };
      }
    } catch {
      // ignore storage error
    }

    // 3. Check Supabase book_summaries table if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('book_summaries')
          .select('*')
          .ilike('book_title', `%${cleanTitle}%`)
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          const summary: BookSummaryData = {
            bookTitle: data.book_title,
            bookAuthor: data.book_author,
            readTimeMinutes: data.read_time_minutes || 6,
            oneSentenceTakeaway: data.one_sentence_takeaway,
            keyIdeas: Array.isArray(data.key_ideas) ? data.key_ideas : [],
            fullSummaryMarkdown: cleanText(data.full_summary_markdown),
            notableQuotes: Array.isArray(data.notable_quotes) ? data.notable_quotes : [],
            cached: true,
          };
          localStorage.setItem(storageKey, JSON.stringify(summary));
          return summary;
        }
      } catch (err) {
        console.warn('Could not query Supabase for book summary:', err);
      }
    }

    // 4. Generate clean synopsis from verified metadata
    await new Promise((resolve) => setTimeout(resolve, 300));

    const generated = synthesizeBookSummary(cleanTitle, cleanAuthor, description);

    // Save to local cache
    try {
      localStorage.setItem(storageKey, JSON.stringify(generated));
    } catch {
      // ignore
    }

    return generated;
  },
};

/**
 * Intelligent literary overview generator based on book metadata
 */
function synthesizeBookSummary(title: string, author: string, rawDesc?: string): BookSummaryData {
  const cleanDesc = rawDesc ? cleanText(rawDesc) : '';

  // Extract a clean takeaway from the first meaningful sentence
  let takeaway = '';
  if (cleanDesc) {
    const sentences = cleanDesc.split(/(?<=[.?!])\s+/);
    const candidate = sentences.find((s) => s.length > 25 && s.length < 220);
    takeaway = candidate ? candidate.trim() : cleanDesc.slice(0, 160) + '...';
  } else {
    takeaway = `A notable work by ${author || 'the author'}.`;
  }

  // Use clean description paragraphs
  let fullText = cleanDesc;
  if (!fullText) {
    fullText = `An acclaimed work by ${author || 'the author'}.`;
  }

  return {
    bookTitle: title,
    bookAuthor: author || 'Unknown Author',
    readTimeMinutes: Math.max(3, Math.min(10, Math.ceil(fullText.split(/\s+/).length / 200))),
    oneSentenceTakeaway: takeaway,
    keyIdeas: [],
    fullSummaryMarkdown: fullText,
    notableQuotes: [],
    generatedAt: new Date().toISOString(),
    cached: false,
  };
}
