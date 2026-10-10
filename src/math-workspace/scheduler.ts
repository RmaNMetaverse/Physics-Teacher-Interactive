interface Task { start: (release: () => void) => () => void; stop?: () => void; release?: () => void; cancelled: boolean }
const queued: Task[] = [];
let active = 0;
function pump() {
  while (active < 2 && queued.length) {
    const task = queued.shift()!;
    if (task.cancelled) continue;
    active++;
    let released = false;
    task.release = () => { if (released) return; released = true; active--; pump(); };
    task.stop = task.start(task.release);
  }
}
/** A whole notebook shares two worker slots; cancelled queued work never starts. */
export function scheduleCalculation(start: Task['start']) {
  const task: Task = { start, cancelled: false }; queued.push(task); pump();
  return () => { task.cancelled = true; task.stop?.(); task.release?.(); };
}
