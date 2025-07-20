interface DailyVerse {
  reference: string;
  text: string;
}

// Collection of inspirational quotes
const encouragingVerses: DailyVerse[] = [
  {
    reference: "Henry Ford",
    text: "Whether you think you can, or you think you can't – you're right."
  },
  {
    reference: "Epictetus",
    text: "You become what you give your attention to."
  },
  {
    reference: "Socrates",
    text: "The way to gain a good reputation is to endeavor to be what you desire to appear."
  },
  {
    reference: "Brené Brown",
    text: "Courage starts with showing up and letting ourselves be seen."
  },
  {
    reference: "Peter T. McIntyre",
    text: "Confidence comes not from always being right but from not fearing to be wrong."
  },
  {
    reference: "Stephen R. Covey",
    text: "Most people do not listen with the intent to understand; they listen with the intent to reply."
  },
  {
    reference: "Oprah Winfrey",
    text: "The greatest discovery of all time is that a person can change their future by merely changing their attitude."
  },
  {
    reference: "Dale Carnegie",
    text: "To be interesting, be interested."
  },
  {
    reference: "Maya Angelou",
    text: "People will forget what you said, people will forget what you did, but people will never forget how you made them feel."
  },
  {
    reference: "Zig Ziglar",
    text: "You don't have to be great to start, but you have to start to be great."
  }
];

// Get today's date in YYYY-MM-DD format
function getTodayKey(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Get verse based on the day
export function getDailyVerse(): DailyVerse {
  const today = getTodayKey();
  // Use the day of the year to select a verse
  const dayOfYear = Math.floor((new Date().getTime() - new Date(today.slice(0, 4)).getTime()) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % encouragingVerses.length;
  return encouragingVerses[index];
} 