import { initCounterTable } from "@/lib/counter/init";

let initialized = false;

export async function initApp() {
  if (initialized) return;
  await initCounterTable();
  initialized = true;
}
