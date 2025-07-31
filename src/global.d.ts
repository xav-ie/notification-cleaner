declare global {
  function Application(name: "System Events"): SystemEvents;
  function Application(name: string): unknown;
}

export {};