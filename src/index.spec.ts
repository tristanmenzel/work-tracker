import { WorkTracker } from './index';

class Deferred<T = any> {
  readonly promise;
  resolve: (arg?: T) => void;
  reject: (error?: any) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}

describe('When creating a work tracker', () => {
  describe('and no arguments are provided', () => {

    test('complete is true', () => {
      const wt = new WorkTracker();
      expect(wt.complete).toBe(true);
    });
  });
  describe('and true is provided', () => {

    test('complete is true', () => {
      const wt = new WorkTracker(true);
      expect(wt.complete).toBe(true);
    });
  });
  describe('and false is provided', () => {

    test('complete is false', () => {
      const wt = new WorkTracker(false);
      expect(wt.complete).toBe(false);
    });
  });
});

describe('When tracking an incomplete promise', () => {

  test('complete is false', () => {
    const wt = new WorkTracker();
    const d = new Deferred();
    expect(wt.complete).toBe(true);
    wt.track(d.promise);
    expect(wt.complete).toBe(false);
  });
});
describe('When tracking a complete promise', () => {

  test('complete is true', () => {
    const wt = new WorkTracker();
    const d = new Deferred();
    d.resolve();
    expect(wt.complete).toBe(true);
    wt.track(d.promise);
    expect(wt.complete).toBe(false);
  });
});
describe('When tracking a promise', () => {
  describe('and the promise is not resolved yet', () => {
    test('complete is false until the promise is resolved', async () => {
      const wt = new WorkTracker();
      const d = new Deferred();
      expect(wt.complete).toBe(true);
      const res = wt.track(d.promise);
      expect(wt.complete).toBe(false);
      d.resolve();
      await res;
      expect(wt.complete).toBe(true);
    });

  });
});

describe('When tracking multiple promises', () => {
  describe('and all the promises are not resolved yet', () => {
    test('complete is false until all the promises are resolved', async () => {
      const wt = new WorkTracker();
      const d1 = new Deferred();
      const d2 = new Deferred();
      expect(wt.complete).toBe(true);
      const res1 = wt.track(d1.promise);
      const res2 = wt.track(d2.promise);
      expect(wt.complete).toBe(false);
      d1.resolve();
      await res1;
      expect(wt.complete).toBe(false);
      d2.resolve();
      await res2;
      expect(wt.complete).toBe(true);
    });

  });
});
describe('When observing change events', () => {
  test('an event is emitted for each change', async () => {
    const wt = new WorkTracker();
    const changes: boolean[] = [];
    wt.completeChanged.subscribe(c=> changes.push(c));
    const d1 = new Deferred();
    const res1 = wt.track(d1.promise);

    d1.resolve();
    await res1;
    expect(changes.length).toBe(2);
    expect(changes[0]).toBe(false);
    expect(changes[1]).toBe(true);
  });
  test('unsubscribe should prevent our handler from being notified', async () => {

    const wt = new WorkTracker();
    const changes: boolean[] = [];
    const sub = wt.completeChanged.subscribe(c=> changes.push(c));
    const d1 = new Deferred();
    const res1 = wt.track(d1.promise);
    sub.unsubscribe();
    d1.resolve();
    await res1;
    expect(changes.length).toBe(1);
    expect(changes[0]).toBe(false);
  })
})
