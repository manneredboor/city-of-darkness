import * as ReactDOM from 'react-dom'
import * as React from 'react'
import { Editor } from '../modules/Editor/Editor'

const editorRoot = document.createElement('div')
document.body.appendChild(editorRoot)
ReactDOM.render(<Editor />, editorRoot)
