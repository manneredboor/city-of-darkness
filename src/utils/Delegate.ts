type Listener = () => void

export class Delegate {
  private listeners: Listener[] = []

  public fire() {
    const length = this.listeners.length
    for (let i = 0; i < length; i++) {
      this.listeners[i]()
    }
  }

  public subscribe(fn: Listener) {
    if (this.listeners.indexOf(fn) === -1) {
      this.listeners.push(fn)
    }
  }

  public unsubscribe(fn: Listener) {
    const index = this.listeners.indexOf(fn)
    if (index !== -1) {
      this.listeners.splice(index, 1)
    }
  }
}
