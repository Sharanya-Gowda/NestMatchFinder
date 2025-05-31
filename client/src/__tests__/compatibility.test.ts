import { calculateCompatibilityScore, getCompatibilityDetails, UserPreferences } from '../lib/compatibility';

describe('Compatibility System Tests', () => {
  const mockUserPrefs: UserPreferences = {
    foodType: 'vegetarian',
    sleepSchedule: 'early-bird',
    studyHabits: 'quiet',
    cleanliness: 'high',
    socialLevel: 'moderate',
    smoking: 'no',
    drinking: 'no',
    pets: 'love'
  };

  const mockRoommatePrefs: UserPreferences = {
    foodType: 'vegetarian',
    sleepSchedule: 'early-bird',
    studyHabits: 'quiet',
    cleanliness: 'high',
    socialLevel: 'moderate',
    smoking: 'no',
    drinking: 'no',
    pets: 'love'
  };

  test('should calculate 100% compatibility for identical preferences', () => {
    const score = calculateCompatibilityScore(mockUserPrefs, mockRoommatePrefs);
    expect(score).toBe(100);
  });

  test('should calculate 0% compatibility for completely different preferences', () => {
    const differentPrefs: UserPreferences = {
      foodType: 'non-vegetarian',
      sleepSchedule: 'night-owl',
      studyHabits: 'music',
      cleanliness: 'low',
      socialLevel: 'very-social',
      smoking: 'yes',
      drinking: 'yes',
      pets: 'allergic'
    };

    const score = calculateCompatibilityScore(mockUserPrefs, differentPrefs);
    expect(score).toBeLessThan(50);
  });

  test('should handle partial compatibility with flexible preferences', () => {
    const flexiblePrefs: UserPreferences = {
      foodType: 'any',
      sleepSchedule: 'flexible',
      studyHabits: 'flexible',
      cleanliness: 'medium',
      socialLevel: 'moderate',
      smoking: 'no',
      drinking: 'social',
      pets: 'neutral'
    };

    const score = calculateCompatibilityScore(mockUserPrefs, flexiblePrefs);
    expect(score).toBeGreaterThan(50);
    expect(score).toBeLessThan(100);
  });

  test('should return 0 for empty preferences', () => {
    const score = calculateCompatibilityScore({}, {});
    expect(score).toBe(0);
  });

  test('should generate compatibility details correctly', () => {
    const details = getCompatibilityDetails(mockUserPrefs, mockRoommatePrefs);
    
    expect(details).toHaveLength(8);
    expect(details[0].category).toBe('Food Preference');
    expect(details[0].match).toBe(true);
    expect(details[0].userPref).toBe('Vegetarian');
    expect(details[0].roommatePref).toBe('Vegetarian');
  });

  test('should handle missing preferences in details', () => {
    const partialPrefs = {
      foodType: 'vegetarian' as const,
      sleepSchedule: 'early-bird' as const
    };

    const details = getCompatibilityDetails(partialPrefs, {});
    expect(details[0].roommatePref).toBe('Not specified');
  });
});