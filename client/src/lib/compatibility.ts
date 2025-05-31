export interface UserPreferences {
  foodType: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'any';
  sleepSchedule: 'early-bird' | 'night-owl' | 'flexible';
  studyHabits: 'quiet' | 'music' | 'collaborative' | 'flexible';
  cleanliness: 'high' | 'medium' | 'low';
  socialLevel: 'very-social' | 'moderate' | 'private';
  smoking: 'yes' | 'no' | 'occasional';
  drinking: 'yes' | 'no' | 'social';
  pets: 'love' | 'neutral' | 'allergic';
}

export function calculateCompatibilityScore(
  userPrefs: Partial<UserPreferences>,
  roommatePrefs: Partial<UserPreferences>
): number {
  if (!userPrefs || !roommatePrefs) return 0;

  const weights = {
    foodType: 0.15,
    sleepSchedule: 0.15,
    studyHabits: 0.15,
    cleanliness: 0.20,
    socialLevel: 0.10,
    smoking: 0.10,
    drinking: 0.10,
    pets: 0.05,
  };

  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([key, weight]) => {
    const userPref = userPrefs[key as keyof UserPreferences];
    const roommatePref = roommatePrefs[key as keyof UserPreferences];

    if (userPref && roommatePref) {
      totalWeight += weight;
      
      if (userPref === roommatePref) {
        totalScore += weight;
      } else if (userPref === 'flexible' || roommatePref === 'flexible' || 
                 userPref === 'any' || roommatePref === 'any') {
        totalScore += weight * 0.7; // Partial compatibility for flexible preferences
      } else {
        // Check for partial compatibility
        const partialMatches = {
          foodType: ['vegetarian', 'vegan'],
          socialLevel: ['very-social', 'moderate'],
          smoking: ['no', 'occasional'],
          drinking: ['no', 'social'],
        };

        if (partialMatches[key as keyof typeof partialMatches]?.includes(userPref) &&
            partialMatches[key as keyof typeof partialMatches]?.includes(roommatePref)) {
          totalScore += weight * 0.5;
        }
      }
    }
  });

  return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
}

export function getCompatibilityDetails(
  userPrefs: Partial<UserPreferences>,
  roommatePrefs: Partial<UserPreferences>
): { category: string; match: boolean; userPref: string; roommatePref: string }[] {
  const categories = {
    foodType: 'Food Preference',
    sleepSchedule: 'Sleep Schedule',
    studyHabits: 'Study Habits',
    cleanliness: 'Cleanliness',
    socialLevel: 'Social Level',
    smoking: 'Smoking',
    drinking: 'Drinking',
    pets: 'Pet Preference',
  };

  return Object.entries(categories).map(([key, category]) => {
    const userPref = userPrefs[key as keyof UserPreferences] || 'Not specified';
    const roommatePref = roommatePrefs[key as keyof UserPreferences] || 'Not specified';
    
    const match = userPref === roommatePref || 
                  userPref === 'flexible' || roommatePref === 'flexible' ||
                  userPref === 'any' || roommatePref === 'any';

    return {
      category,
      match,
      userPref: formatPreference(userPref),
      roommatePref: formatPreference(roommatePref),
    };
  });
}

function formatPreference(pref: string): string {
  return pref.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}
