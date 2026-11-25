import { describe, expect, test } from "vitest";

import { ehEpico } from "./lib.mjs";

describe("ehEpico (SCRUM-96: épico não entra em sprint)", () => {
  test("reconhece o épico pelo nível ou pelo nome", () => {
    expect(ehEpico({ name: "Epic", hierarchyLevel: 1 })).toBe(true);
    expect(ehEpico({ name: "Épico" })).toBe(true);
  });

  test("tarefa, história e subtarefa vão para o sprint", () => {
    expect(ehEpico({ name: "Tarefa", hierarchyLevel: 0 })).toBe(false);
    expect(ehEpico({ name: "História", hierarchyLevel: 0 })).toBe(false);
    expect(ehEpico({ name: "Subtask", hierarchyLevel: -1 })).toBe(false);
  });
});
