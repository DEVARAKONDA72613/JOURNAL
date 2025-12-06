// Month Background Configuration
// Images mapped to months as specified:
// 1st image → January, 2nd → February, 3rd → March, etc.

const monthBackgrounds = {
  // 0 = January, 1 = February, ..., 11 = December
  0: '/assets/covers/jan.jpg',      // January 2026 - 1st image
  1: '/assets/covers/feb.jpg',       // February 2026 - 2nd image
  2: '/assets/covers/march.jpg',     // March 2026 - 3rd image
  3: '/assets/covers/aprl.jpg',      // April 2026 - 4th image
  4: '/assets/covers/mat.jpg',       // May 2026 - 5th image
  5: '/assets/covers/june.jpg',      // June 2026 - 6th image
  6: '/assets/covers/july.jpg',      // July 2026 - 7th image
  7: '/assets/covers/aug.jpg',       // August 2026 - 8th image
  8: '/assets/covers/sept.jpg',       // September 2026 - 9th image
  9: '/assets/covers/oct.jpg',        // October 2026 - 10th image
  10: '/assets/covers/nov.jpg',       // November 2026 - 11th image
  11: '/assets/covers/dec.jpg',       // December 2026 - 12th image
}

// Welcome page background (shown on the landing page) - using cover.jpg
export const welcomeBackground = '/assets/covers/cover.jpg'

// Get background image for a specific month (0-11)
export const getMonthBackground = (monthIndex) => {
  return monthBackgrounds[monthIndex] || monthBackgrounds[0]
}

// Export all backgrounds for reference
export default monthBackgrounds

