const noop = () => {
};


function deferred(delayInMs: number, action?: () => any): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve((action || noop)());
    }, delayInMs);
  });
}

export class WorkTracker {
  private _activePromises: number = 0;
  private _isComplete: boolean;

  constructor(complete: boolean = true,
              public minDelayInMs: number = 0) {
    this._isComplete = complete;
  }

  get complete(): boolean {
    return this._isComplete;
  }

  track<T>(promise: Promise<T>): Promise<T> {
    return this.trackInternal(promise, this.minDelayInMs);
  }

  private trackInternal<T>(promise: Promise<any>, minDelay?: number): Promise<T> {
    const complete = (x: any) => {
      this.updateIsComplete();
      return promise;
    };
    const completeAndBubbleReject = (e: any) => {
      this.updateIsComplete();
      return Promise.reject(e);
    };

    this._isComplete = false;
    this._activePromises++;
    if (minDelay === 0) {
      return promise.then(complete, completeAndBubbleReject);
    } else {
      return Promise.all([promise, deferred(minDelay)])
        .then(complete, completeAndBubbleReject);
    }
  }

  private updateIsComplete() {
    this._activePromises = Math.max(0, this._activePromises - 1);
    this._isComplete = this._activePromises === 0;
  }
}
