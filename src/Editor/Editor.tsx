import * as React from 'react'
import { vec } from 'utils/Vector'
import { Intro } from 'Intro'
import { EditorWindow } from 'Editor/EditorWindow'
import { EditorButton } from 'Editor/EditorButton'

interface RafState {
  isDown: boolean
  movingItem: number | string
}

interface EditorProps {}

interface EditorState {
  introLastUpd: number
  isShownCode: boolean
  selectedItem: number
}

export class Editor extends React.PureComponent<EditorProps, EditorState> {
  intro: Intro
  codeText: React.RefObject<HTMLTextAreaElement>

  rafState: RafState = {
    isDown: false,
    movingItem: -1,
  }

  constructor(props: EditorProps) {
    super(props)
    this.codeText = React.createRef()
    this.intro = (window as any).kwcIntro as Intro
    this.intro.renderHooks.push(this.renderRaf)
    this.state = {
      introLastUpd: Date.now(),
      isShownCode: false,
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

    intro.canvas.addEventListener('mousedown', () => (rafState.isDown = true))

    intro.canvas.addEventListener('mouseup', () => {
      rafState.isDown = false
      rafState.movingItem = -1
      this.updIntro()
    })

    // const dots: Vector[] = []
    // intro.canvas.addEventListener('mousedown', () => {
    //   dots.push(this.sv(intro.state.mouse.x, intro.state.mouse.y))
    //   console.log(dots)
    // })
  }

  componentDidUpdate(prevProps: EditorProps, prevState: EditorState) {
    const { introLastUpd, isShownCode } = this.state

    if (introLastUpd !== prevState.introLastUpd) {
      this.intro.renderLetters()
    }

    if (!prevState.isShownCode && isShownCode && this.codeText.current) {
      this.codeText.current.focus()
      this.codeText.current.select()
    }
  }

  updIntro = () => this.setState({ introLastUpd: Date.now() })

  render() {
    const intro = this.intro
    const introState = intro.state
    const { selectedItem, isShownCode, introLastUpd } = this.state
    const currentItem = introState.textDrawings[selectedItem]
    return (
      <>
        {isShownCode && (
          <div className="editor-popup">
            <button onClick={() => this.setState({ isShownCode: false })}>
              close
            </button>
            <textarea
              ref={this.codeText}
              value={`export default ${JSON.stringify(
                intro.state.textDrawings,
              )}`}
            />
          </div>
        )}

        <EditorWindow x={20} y={20}>
          {/* Buttons */}
          <EditorButton
            text="T"
            onClick={() => {
              const x = window.innerWidth / 2
              const y = window.innerHeight / 2
              introState.textDrawings.push({
                text: 'LOLKEK',
                dur: 4,
                delay: 1,
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
            onClick={() => {
              intro.state.debugMode = !intro.state.debugMode
              document.body.classList.toggle(
                'editor-debug',
                intro.state.debugMode,
              )
            }}
          />
          <EditorButton
            text="S"
            onClick={() => this.setState({ isShownCode: true })}
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
                  if (selectedItem === i) {
                    this.setState({ selectedItem: -1 })
                  } else if (selectedItem > i) {
                    this.setState({
                      selectedItem: selectedItem - 1,
                    })
                  }
                  introState.textDrawings.splice(i, 1)
                  this.updIntro()
                }}
              >
                x
              </button>
            </div>
          ))}
        </EditorWindow>

        {/* Props */}
        {selectedItem !== -1 && (
          <EditorWindow x={window.innerWidth - 400} y={60}>
            <React.Fragment key={selectedItem + introLastUpd}>
              <div className="editor-props-grp">
                <input
                  type="text"
                  defaultValue={currentItem.text}
                  onChange={e => {
                    currentItem.text = e.currentTarget.value
                    intro.renderLetters()
                  }}
                />
              </div>
              <hr />
              <div className="editor-props-grp">
                <input
                  type="number"
                  defaultValue={String(currentItem.dur)}
                  onChange={e => {
                    currentItem.dur = Number(e.currentTarget.value)
                  }}
                />
                duration <br />
                <input
                  type="number"
                  defaultValue={String(currentItem.delay)}
                  onChange={e => {
                    currentItem.delay = Number(e.currentTarget.value)
                  }}
                />
                delay <br />
              </div>
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
            </React.Fragment>
          </EditorWindow>
        )}
      </>
    )
  }

  renderRaf = (time: number) => {
    const ctx = this.intro.ctx
    const rafState = this.rafState
    if (!this.intro.state.debugMode) return

    const rv = this.intro.restoreVec

    this.intro.state.textDrawings.forEach((itm, i) => {
      ctx.save()

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

          const { x: mx, y: my } = this.intro.state.mouse

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
