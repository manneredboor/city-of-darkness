import * as ReactDOM from 'react-dom'
import * as React from 'react'
import { Editor } from '../Editor/Editor'
require('../css/editor.css')

const editorRoot = document.createElement('div')
document.body.appendChild(editorRoot)
ReactDOM.render(<Editor />, editorRoot)
