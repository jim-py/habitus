export async function registerSW() {
  if (!("serviceWorker" in navigator)) return;

  await navigator.serviceWorker.register("/sw.js");
}