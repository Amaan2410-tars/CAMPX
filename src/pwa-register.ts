import { registerSW } from "virtual:pwa-register";

// Student app only: admin intentionally does not register SW.
registerSW({
  immediate: true,
});

