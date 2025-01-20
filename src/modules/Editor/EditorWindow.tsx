import * as React from 'react'
import { Vector, vec } from 'modules/utils/Vector'

interface EditorWindowProps {
  children: JSX.Element | JSX.Element[]
  x?: number
  y?: number
}

interface EditorWindowState {
  isDown: boolean
  offset: Vector
  x: number
  y: number
}

export class EditorWindow extends React.PureComponent<
  EditorWindowProps,
  EditorWindowState
> {
  el: React.RefObject<HTMLDivElement>

  constructor(props: EditorWindowProps) {
    super(props)
    const { x = 0, y = 0 } = props
    this.el = React.createRef()
    this.state = { isDown: false, offset: vec(0, 0), x, y }
  }

  handleMouseMove = (e: MouseEvent) => {
    const { isDown, offset } = this.state
    if (!isDown) return
    this.setState({
      x: e.pageX - offset.x,
      y: e.pageY - offset.y,
    })
  }

  handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = this.el.current
    if (!el) return
    this.setState({
      isDown: !this.state.isDown,
      offset: vec(e.pageX - el.offsetLeft, e.pageY - el.offsetTop),
    })
  }

  componentDidMount() {
    window.addEventListener('mousemove', this.handleMouseMove)
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove)
  }

  render() {
    const { children } = this.props
    const { isDown, x, y } = this.state
    return (
      <div ref={this.el} className="editor-window" style={{ top: y, left: x }}>
        <div
          className={`editor-drag ${isDown ? 'active' : ''}`}
          onMouseDown={this.handleMouseDown}
        />
        <div>{children}</div>
      </div>
    )
  }
}
