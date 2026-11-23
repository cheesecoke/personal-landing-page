import { describe, expect, it } from 'vitest';

import { cropMargins } from './ProjectFigure';

describe('cropMargins', () => {
  it('matches the boards', () => {
    // Duo Decide hero: 1600 by 1000, subject from row 90 to 890.
    expect(cropMargins({ width: 1600, height: 1000 }, { top: 90, bottom: 890 })).toEqual({
      image: { marginTop: '-3.75%' },
      caption: { marginTop: 'calc(20px - 6.88%)' },
    });
    // Duo Decide details: 1200 by 800, subject from row 72 to 712.
    expect(cropMargins({ width: 1200, height: 800 }, { top: 72, bottom: 712 })).toEqual({
      image: { marginTop: '-4.00%' },
      caption: { marginTop: 'calc(20px - 7.33%)' },
    });
  });

  it('never pulls a subject that starts at the top out of view', () => {
    expect(cropMargins({ width: 1200, height: 800 }, { top: 10, bottom: 800 }).image).toEqual({
      marginTop: '-0.00%',
    });
  });
});
