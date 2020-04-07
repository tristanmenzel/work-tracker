# work-tracker

Tracks asynchronous work using promises. Useful for toggling loading indicators

**Usage**

```ts
import { WorkTracker } from 'work-tracker';

var tracker = new WorkTracker();

console.log(tracker.complete); // true

var deferred = new Deferred();
tracker.track(deferred.promise);

console.log(tracker.complete); // false

deferred.resolves(); // OR deferred.reject()

console.log(tracker.complete): // true

```
