type Listener = () => void

export class Delegate {
  private listeners: Listener[] = []

  public fire() {
    this.listeners.forEach(fn => fn())
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
