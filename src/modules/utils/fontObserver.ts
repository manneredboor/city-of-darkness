const FontFaceObserver = require('fontfaceobserver')
export const fonts = Promise.all([
  new FontFaceObserver('Kanit Sans').load(null, 100000),
  new FontFaceObserver('Typeface Custom').load('九龍城寨', 100000),
])
