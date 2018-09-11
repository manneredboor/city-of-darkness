const FontFaceObserver = require('fontfaceobserver')
export const fonts = Promise.all([
  new FontFaceObserver('RF Dewi Expanded Black Custom').load(null, 10000),
  new FontFaceObserver('Typeface Custom').load('九龍城寨', 10000),
])
// export const dewiReg = new FontFaceObserver('RF Dewi Regular')
// export const dewiExp = new FontFaceObserver('RF Dewi Expanded Black')
// export const dewiExt = new FontFaceObserver('RF Dewi Extended Bold')
