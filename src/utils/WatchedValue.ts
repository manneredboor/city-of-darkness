export type Listener<T> = (value: T) => void

export class WatchedValue<T> {
  private listeners: Listener<T>[] = []

  value: T

  constructor(val: T) {
    this.value = val
  }

  public set(val: T) {
    if (this.value !== val) {
      this.value = val
      this.fire()
    }
  }

  public fire() {
    const length = this.listeners.length
    for (let i = 0; i < length; i++) {
      this.listeners[i](this.value)
    }
  }

  public subscribe(fn: Listener<T>) {
    if (this.listeners.indexOf(fn) === -1) {
      this.listeners.push(fn)
    }
  }

  public unsubscribe(fn: Listener<T>) {
    const index = this.listeners.indexOf(fn)
    if (index !== -1) {
      this.listeners.splice(index, 1)
    }
  }
}
