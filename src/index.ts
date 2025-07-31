#!/usr/bin/env osascript -l JavaScript

interface SystemEvents {
  processes: {
    byName(name: string): Process;
  };
  includeStandardAdditions: boolean;
}

interface Process {
  windows: UIElement[];
}

interface UIElement {
  role(): string;
  description?(): string | undefined;
  groups(): UIElement[];
  uiElements(): UIElement[];
  actions(): Action[];
}

interface Action {
  description(): string;
  perform(): void;
}

type ActionType = "Clear All" | "Close";

interface ExecutionResult {
  success: boolean;
  error?: string;
}

let cachedScrollArea: UIElement | undefined;



function getScrollArea(systemEvents: SystemEvents): UIElement | undefined {
  if (cachedScrollArea) return cachedScrollArea;

  try {
    const scrollArea = systemEvents.processes
      .byName("NotificationCenter")
      .windows[0]?.groups()[0]
      ?.uiElements()[0]
      ?.uiElements()[0];

    if (!scrollArea) return undefined;

    cachedScrollArea =
      scrollArea.role() === "AXScrollArea" ? scrollArea : undefined;
    return cachedScrollArea;
  } catch (e) {
    return undefined;
  }
}

function collectActionsFromElement(element: UIElement): Action[] {
  try {
    return element.actions().filter((action) => {
      const desc = action.description() as ActionType;
      return desc === "Clear All" || desc === "Close";
    });
  } catch {
    return [];
  }
}

function processElement(elem: UIElement): Action[] {
  try {
    if (elem.role() !== "AXGroup") return [];
    if (elem.description?.() === "widget") return [];

    const elementActions = collectActionsFromElement(elem);
    const childActions = elem.uiElements().flatMap(collectActionsFromElement);

    return [...elementActions, ...childActions];
  } catch {
    return [];
  }
}

function extractActions(scrollArea: UIElement): Action[] {
  try {
    const allActions = scrollArea.uiElements().flatMap(processElement);
    const clearAllActions = allActions.filter(
      (action) => action.description() === "Clear All",
    );
    const closeActions = allActions.filter(
      (action) => action.description() === "Close",
    );

    return [...clearAllActions, ...closeActions];
  } catch {
    return [];
  }
}

async function executeConcurrent(actions: Action[]): Promise<number> {
  const promises: Promise<boolean>[] = actions.map((action) =>
    Promise.resolve().then(() => {
      try {
        action.perform();
        return true;
      } catch (e) {
        return false;
      }
    }),
  );

  const results = await Promise.all(promises);
  return results.filter(Boolean).length;
}

async function clearNotifications(systemEvents: SystemEvents): Promise<string> {
  const scrollArea = getScrollArea(systemEvents);
  if (!scrollArea) return "No notifications window found - please open Notification Center manually";

  const actions = extractActions(scrollArea);
  if (actions.length === 0) return "No notifications to clear";

  console.log(`Clearing ${actions.length} notifications...`);

  const successful = await executeConcurrent(actions);
  return `Cleared ${successful} notifications`;
}

async function run(): Promise<string> {
  const systemEvents = Application("System Events");
  systemEvents.includeStandardAdditions = true;

  try {
    return await clearNotifications(systemEvents);
  } catch (e) {
    return `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

// Execute with proper promise handling
run()
  .then(console.log)
  .catch((error) => console.log(`Error: ${error}`));
