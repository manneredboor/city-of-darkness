export default function measureText(
  text: string,
  className: string,
  size?: number,
) {
  const textMeasure = document.createElement('div')
  textMeasure.className = className
  textMeasure.innerHTML = text
  if (size) textMeasure.style.fontSize = size + 'px'
  textMeasure.style.position = 'absolute'
  textMeasure.style.left = '-10000px'
  textMeasure.style.top = '-10000px'
  document.body.appendChild(textMeasure)
  const textW = textMeasure.clientWidth + 1
  document.body.removeChild(textMeasure)
  return textW
}
