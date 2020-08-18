function wait(delayInMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delayInMs);
  });
}

export class EventEmitter<T> {
  private readonly subs: Array<(e: T) => void> = [];

  constructor(fn: (emit: (e: T) => void) => void) {
    fn(e => this.emit(e));
  }

  private emit(e: T) {
    this.subs.forEach(s => s(e));
  }

  subscribe(sub: (e: T) => void) {
    this.subs.push(sub);
    return {
      unsubscribe: () => {
        const i = this.subs.indexOf(sub);
        if (i === -1) return;
        this.subs.splice(i, 1);
      }
    };
  }
}

export class WorkTracker {
  private activePromises: number = 0;
  private emitCompleteChanged: (e: boolean) => void;

  constructor(private isComplete: boolean = true,
              public minDelayInMs: number = 0) {
  }

  private setComplete(value: boolean) {
    if (this.isComplete === value) return;
    this.emitCompleteChanged(this.isComplete = value);
  }

  get complete(): boolean {
    return this.isComplete;
  }

  completeChanged = new EventEmitter<boolean>(emit => this.emitCompleteChanged = emit);

  async track<T>(promise: Promise<T>): Promise<T> {
    this.activePromises++;
    this.setComplete(false);
    try {
      const minDelay = wait(this.minDelayInMs);
      const res = await promise;
      await minDelay;
      return res;
    } finally {
      this.activePromises--;
      this.setComplete(this.activePromises === 0);
    }
  }
}
