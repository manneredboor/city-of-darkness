import * as React from 'react'
import { Vector, vec } from 'utils/Vector'
import { Intro } from 'Intro'
import { EditorWindow } from 'Editor/EditorWindow'
import { EditorButton } from 'Editor/EditorButton'

interface RafState {
  isDown: boolean
  mouse: Vector
  movingItem: number | string
}

interface EditorProps {}

interface EditorState {
  debugMode: boolean
  introState: number
  selectedItem: number
}

export class Editor extends React.PureComponent<EditorProps, EditorState> {
  intro: Intro

  rafState: RafState = {
    isDown: false,
    mouse: vec(0, 0),
    movingItem: -1,
  }

  constructor(props: EditorProps) {
    super(props)
    this.intro = (window as any).kwnIntro as Intro
    this.intro.renderHooks.push(this.renderRaf)
    this.state = {
      debugMode: true,
      introState: Date.now(),
      selectedItem: -1,
    }
  }

  sv = (x: number, y: number) => this.intro.saveVec(vec(x, y))

  loadStyles() {
    const style = document.createElement('link')
    style.rel = 'stylesheet'
    style.href = 'css/editor.css'
    document.head.appendChild(style)
    document.body.classList.add('editor-debug')
  }

  componentDidMount() {
    this.loadStyles()

    const intro = this.intro
    const rafState = this.rafState

    intro.canvas.addEventListener(
      'mousemove',
      e => (rafState.mouse = vec(e.pageX, e.pageY)),
    )

    intro.canvas.addEventListener('mousedown', () => (rafState.isDown = true))

    intro.canvas.addEventListener('mouseup', () => {
      rafState.isDown = false
      rafState.movingItem = -1
      this.updIntro()
    })
  }

  componentDidUpdate(prevProps: EditorProps, prevState: EditorState) {
    const { debugMode, introState } = this.state

    if (introState !== prevState.introState) {
      this.intro.renderLetters()
    }

    if (debugMode !== prevState.debugMode) {
      document.body.classList.toggle('editor-debug', debugMode)
    }
  }

  updIntro = () => this.setState({ introState: Date.now() })

  render() {
    const intro = this.intro
    const introState = intro.state
    const { debugMode, selectedItem } = this.state
    const currentItem = introState.textDrawings[selectedItem]
    return (
      <>
        <EditorWindow x={20} y={20}>
          {/* Buttons */}
          <EditorButton
            text="T"
            onClick={() => {
              const x = window.innerWidth / 2
              const y = window.innerHeight / 2
              introState.textDrawings.push({
                text: 'LOLKEK',
                path: [
                  [vec(x, y), vec(x, y + 30)],
                  [vec(x + 250, y), vec(x + 250, y + 30)],
                  [vec(x + 400, y), vec(x + 400, y + 30)],
                ],
              })
              this.updIntro()
            }}
          />
          <EditorButton
            text="D"
            onClick={() => this.setState({ debugMode: !debugMode })}
          />
          <EditorButton
            text="S"
            onClick={() => {
              const win = document.createElement('div')
              win.classList.add('editor-popup')
              const code = document.createElement('textarea')
              code.value =
                'export default ' + JSON.stringify(intro.state.textDrawings)
              const close = document.createElement('button')
              close.textContent = 'close'
              win.appendChild(close)
              win.appendChild(code)
              document.body.appendChild(win)
              code.focus()
              code.select()
              close.addEventListener('click', () =>
                document.body.removeChild(win),
              )
            }}
          />
        </EditorWindow>

        {/* Hierarchy */}
        <EditorWindow x={100} y={20}>
          {introState.textDrawings.map((itm, i) => (
            <div className="editor-hierarchy-row" key={i}>
              <div
                className="editor-hierarchy-item"
                onClick={() => this.setState({ selectedItem: i })}
              >
                {itm.text}
              </div>
              <button
                onClick={() => {
                  introState.textDrawings = [
                    ...introState.textDrawings.slice(0, i),
                    ...introState.textDrawings.slice(i + 1),
                  ]
                  this.setState({ selectedItem: -1 })
                  this.updIntro()
                }}
              >
                x
              </button>
            </div>
          ))}
        </EditorWindow>

        {/* Animation */}
        {selectedItem !== -1 && (
          <EditorWindow
            x={window.innerWidth - 400}
            y={window.innerHeight - 300}
          >
            <input
              type="range"
              min="0"
              max="10000"
              style={{ width: 300 }}
              onMouseMove={e => {
                const el = e.currentTarget
                intro.state.animProg = Number(el.value) / Number(el.max)
              }}
            />
          </EditorWindow>
        )}

        {/* Props */}
        {selectedItem !== -1 && (
          <EditorWindow x={window.innerWidth - 400} y={60}>
            <>
              <div className="editor-props-grp">
                <input
                  type="text"
                  value={currentItem.text}
                  onChange={e => {
                    currentItem.text = e.currentTarget.value
                    intro.renderLetters()
                  }}
                />
              </div>
              <hr />
              {currentItem.path.map((p, j) => (
                <React.Fragment key={j}>
                  <div className="editor-props-grp">
                    {/* x1 */}
                    <input
                      type="number"
                      defaultValue={String(p[0].x)}
                      onChange={e => (p[0].x = Number(e.currentTarget.value))}
                    />
                    {/* y1 */}
                    <input
                      type="number"
                      defaultValue={String(p[0].y)}
                      onChange={e => (p[0].y = Number(e.currentTarget.value))}
                    />
                    <br />
                    {/* x2 */}
                    <input
                      type="number"
                      defaultValue={String(p[1].x)}
                      onChange={e => (p[1].x = Number(e.currentTarget.value))}
                    />
                    {/* y2 */}
                    <input
                      type="number"
                      defaultValue={String(p[1].y)}
                      onChange={e => (p[1].y = Number(e.currentTarget.value))}
                    />
                    {/* h */}
                    <input
                      type="number"
                      defaultValue={String(p[1].y - p[0].y)}
                      onChange={e =>
                        (p[1].y = p[0].y + Number(e.currentTarget.value))
                      }
                    />
                  </div>
                  <hr />
                </React.Fragment>
              ))}
              <div
                className="editor-props-btn"
                onClick={() => {
                  currentItem.path.splice(-1)
                  this.updIntro()
                }}
              >
                -
              </div>
              <hr />
              <div
                className="editor-props-btn"
                onClick={() => {
                  const x = this.intro.state.bgW / 2
                  const y = this.intro.state.bgH / 2
                  currentItem.path.push([vec(x, y), vec(x, y + 50)])
                  this.updIntro()
                }}
              >
                +
              </div>
            </>
          </EditorWindow>
        )}
      </>
    )
  }

  renderRaf = (time: number) => {
    const ctx = this.intro.ctx
    const state = this.state
    const rafState = this.rafState
    if (!state.debugMode) return

    const rv = this.intro.restoreVec

    this.intro.state.textDrawings.forEach((itm, i) => {
      ctx.save()

      const mx = rafState.mouse.x
      const my = rafState.mouse.y

      itm.path.forEach((p, j) => {
        const { x: x1, y: y1 } = rv(p[0])
        const { x: x2, y: y2 } = rv(p[1])

        if (j < itm.path.length - 1) {
          const { x: nx1, y: ny1 } = rv(itm.path[j + 1][0])
          const { x: nx2, y: ny2 } = rv(itm.path[j + 1][1])

          ctx.strokeStyle = '#fff'

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(nx1, ny1)
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(x2, y2)
          ctx.lineTo(nx2, ny2)
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()

        if (this.state.selectedItem === i) {
          ctx.beginPath()
          ctx.rect(x1, y1 - 20, 10, 10)
          ctx.fillStyle = '#fff'
          ctx.fill()

          if (
            rafState.isDown &&
            mx > x1 &&
            my > y1 - 20 &&
            mx < x1 + 10 &&
            my < y1 - 10
          ) {
            rafState.movingItem = `${i}-${j}`
          }

          if (rafState.movingItem === `${i}-${j}`) {
            const dot1 = this.sv(mx - 5, my + 15)
            const dot2 = this.sv(mx - 5, my + 15 + y2 - y1)
            this.intro.state.textDrawings[i].path[j] = [dot1, dot2]
          }
        }
      })
      ctx.restore()
    })
  }
}
