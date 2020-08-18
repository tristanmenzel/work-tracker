# work-tracker

`WorkTracker` is a class that tracks the completion status of one or more asynchronous tasks. It is useful for showing and hiding busy indicators / loading spinners whilst asynchronous requests are in flight. 

```ts
const tracker = new WorkTracker();

// Initial state of complete is true by default
console.log(tracker.complete); 
// > true

const result = tracker.track(http.get('http://www.example.com'));

// complete will be false until the web request is complete
console.log(tracker.complete); 
// > false

await result;

// complete will be true after web request is complete
console.log(tracker.complete); 
// > true

```

The usefulness of `WorkTracker` becomes more evident when you have multiple in flight requests. These requests do not have to originate from the same block of code. Furthermore, `WorkTracker` does not care whether the requests are successful or not. 


```ts
const tracker = new WorkTracker();

// Initial state of complete is true by default
console.log(tracker.complete); 
// > true

const result1 = tracker.track(http.get('http://www.example.com'));
const result2 = tracker.track(http.get('http://www.example.com'));
const result3 = tracker.track(http.get('http://www.example.com'));

// complete will be false until all requests are complete
console.log(tracker.complete); 
// > false

await result1;
await result2;
await result3;

// complete will be true after all requests are complete
console.log(tracker.complete); 
// > true

```
