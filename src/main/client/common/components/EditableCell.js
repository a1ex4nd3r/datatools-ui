import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment'

export default class EditableCell extends Component {
  static propTypes = {
    isEditing: PropTypes.bool
  }
  constructor (props) {
    super(props)
    this.state = {
      isEditing: false,
      isFocused: false,
      data: ''
    }
  }
  componentWillMount () {
    this.setState({
      isEditing: this.props.isEditing,
      edited: false,
      isFocused: this.props.isFocused,
      data: this.props.data,
      originalData: this.props.data
    })
  }
  componentWillReceiveProps (nextProps) {
    if (this.props.data !== nextProps.data) {
      // console.log('setting data...', nextProps.data)
      this.setState({
        data: nextProps.data
        // edited: true
        // originalData: nextProps.data
      })
    }
    if (this.state.isEditing !== nextProps.isEditing) this.setState({isEditing: nextProps.isEditing})
  }
  cancel () {
    this.setState({
      isEditing: false,
      isFocused: false,
      data: this.props.data
    })
    this.props.onStopEditing()
  }
  beginEditing () {
    this.setState({isEditing: true})
  }
  handleClick (evt) {
    if (this.props.isFocused) {
      this.beginEditing()
    } else {
      this.props.onClick()
    }
  }
  handleDoubleClick (evt) {
    // this.setState({isEditing: true, isFocused: false})
  }
  handleKeyDown (evt) {
    let input = ReactDOM.findDOMNode(this.refs.cellInput)
    // console.log(input.selectionStart)
    // console.log(input.value.length)
    // if (evt.keyCode >= 65 && evt.keyCode <= 90) {
    //   evt.preventDefault()
    //   return false
    // }
    switch (evt.keyCode) {
      case 88: // x
        if (this.props.renderTime) {
          evt.preventDefault()
          this.props.onRowSelect(evt)
          break
        } else {
          return true
        }
      case 79: // o
        if (this.props.renderTime) {
          evt.preventDefault()
          this.props.onRowSelect(evt)
          break
        } else {
          return true
        }
      case 222: // single quote
        if (evt.shiftKey) {
          console.log('dupe left')
          this.props.duplicateLeft(evt)
          this.props.onRight(evt)
          return false
        }
        break
      case 13: // Enter
        evt.preventDefault()
        if (this.props.isFocused) {
          this.beginEditing()
        }
        // handle shift
        if (evt.shiftKey) {
          this.save(evt)
          this.props.onUp(evt)
        } else {
          this.save(evt)
        }
        break
      case 9: // Tab
        evt.preventDefault()
        // handle shift
        if (evt.shiftKey) {
          this.save(evt)
        } else {
          this.save(evt)
        }
        break
      case 27: // Esc
        this.cancel()
        break
      case 39: // right
        if (input.selectionStart === input.value.length) {
          this.save(evt)
          return false
        } else {
          return true
        }
      case 37: // left
        if (input.selectionStart === 0 && input.selectionEnd === input.value.length) {
          this.save(evt)
          return false
        } else {
          return true
        }
      case 38: // up
        this.save(evt)
        break
      case 40: // down
        this.save(evt)
        break
      default:
        return true
    }
  }
  save () {
    if (!this.props.renderTime) {
      if (this.state.data !== this.state.originalData) {
        this.setState({isEditing: false})
        this.props.onChange(this.state.data)
        this.props.onStopEditing()
      } else {
        this.cancel()
      }
    } else {
      let date = moment().startOf('day').format('YYYY-MM-DD')
      let momentTime = moment(date + 'T' + this.state.data, ['YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTh:mm:ss a', 'YYYY-MM-DDTh:mm a'], true)
      let value = momentTime.diff(date, 'seconds')
      console.log(value)

      // check for valid time and new value
      if (momentTime.isValid() && value !== this.state.data) {
        this.setState({data: value, isEditing: false})
        this.props.onChange(value)
        this.props.onStopEditing()
      } else {
        this.cancel()
      }
    }
  }
  cellRenderer (value) {
    if (this.props.cellRenderer) {
      return this.props.cellRenderer(value)
    } else {
      return value
    }
  }
  handleChange (evt) {
    this.setState({data: evt.target.value})
  }
  handlePaste (evt) {
    let text = evt.clipboardData.getData('Text')
    let rows = text.split(String.fromCharCode(13))

    for (var i = 0; i < rows.length; i++) {
      rows[i] = rows[i].split(String.fromCharCode(9))
    }

    if (rows.length > 1 || rows[0].length > 1) {
      this.cancel()
      this.props.handlePastedRows(rows)
      evt.preventDefault()
    }
  }
  _onInputFocus (evt) {
    evt.target.select()
  }
  render () {
    const rowCheckedColor = '#F3FAF6'
    const focusedNotEditing = this.props.isFocused && !this.state.isEditing
    const edgeDiff = this.props.isFocused ? 0 : 0.5
    const divStyle = {
      height: '100%',
      display: 'inline-block',
      paddingTop: `${3 + edgeDiff}px`,
      paddingLeft: `${3 + edgeDiff}px`,
      UserSelect: 'none',
      userSelect: 'none',
      fontWeight: this.state.edited ? 'bold' : 'normal'
    }
    const cellStyle = {
      backgroundColor: this.props.invalidData && !this.state.isEditing
        ? 'pink'
        : focusedNotEditing
        ? '#F4F4F4'
        : this.state.isEditing
        ? '#fff'
        : this.props.isSelected
        ? rowCheckedColor
        : '#fff',
      border: this.props.invalidData && focusedNotEditing
        ? '2px solid red'
        : this.props.isFocused
        ? `2px solid #66AFA2`
        : '1px solid #ddd',
      margin: `${-0.5 + edgeDiff}px`,
      padding: `${-edgeDiff}px`,
      whiteSpace: 'nowrap',
      cursor: 'default',
      fontWeight: '400',
      // fontFamily: '"Courier New", Courier, monospace',
      color: this.props.lightText ? '#aaa' : '#000',
      ...this.props.style
    }
    const cellHtml = this.state.isEditing
      ? <input
        type='text'
        ref='cellInput'
        readOnly={!this.state.isEditing}
        defaultValue={this.cellRenderer(this.state.data)}
        placeholder={this.props.placeholder || ''}
        onPaste={(evt) => this.handlePaste(evt)}
        style={{
          width: '100%',
          height: '100%',
          outline: 'none',
          margin: '1px',
          marginLeft: '2px',
          padding: '1px',
          border: 0,
          backgroundColor: 'rgba(0,0,0,0)'
        }}
        autoFocus='true'
        onKeyDown={(evt) => this.handleKeyDown(evt)}
        onChange={(evt) => this.handleChange(evt)}
        onFocus={(evt) => this._onInputFocus(evt)}
        onBlur={(evt) => this.cancel(evt)}
      />
      : <div
        style={divStyle}
      >
        {this.cellRenderer(this.state.data)}
      </div>
    return (
      <div
        className='editable-cell small'
        style={cellStyle}
        onClick={(evt) => this.handleClick(evt)}
      >
        {cellHtml}
      </div>
    )
  }
}
