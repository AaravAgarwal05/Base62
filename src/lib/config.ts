import { initCounterTable } from "./counter/init";

let initialized = false;

export function initApp() {
  if (initialized) return;
  initCounterTable();
  initialized = true;
}
