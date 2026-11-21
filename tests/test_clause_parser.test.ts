import { test, describe } from "node:test";
import * as assert from "node:assert/strict";
import { parseClauses, clauseHint } from "../src/lib/ai/clause_parser";

describe("Rule-Based Clause Parser (Negation, Laterality, Modalities, Time)", () => {
  test("negation is scoped to its own clause", () => {
    const c = parseClauses("no thirst but desires cold drinks");
    assert.equal(c.length, 2);
    assert.equal(c[0].negated, true);
    assert.equal(c[1].negated, false);
  });

  test("laterality detection (right vs left vs bilateral)", () => {
    assert.equal(parseClauses("pain in right shoulder")[0].side, "right");
    assert.equal(parseClauses("left sided headache")[0].side, "left");
    assert.equal(parseClauses("pain from right to left")[0].side, null);
  });

  test("english modalities keep direction per factor", () => {
    const c = parseClauses("headache worse from cold and motion, better from pressure")[0];
    const has = (f: string, d: string) => c.modalities.some((m) => m.factor === f && m.direction === d);
    assert.ok(has("cold", "worse"));
    assert.ok(has("motion", "worse"));
    assert.ok(has("pressure", "better"));
  });

  test("hinglish modalities: factor before cue (thand se badhta, dabane se aaram)", () => {
    const c = parseClauses("sir dard thand se badhta hai, dabane se aaram")[0];
    const has = (f: string, d: string) => c.modalities.some((m) => m.factor === f && m.direction === d);
    assert.ok(has("cold", "worse"));
    assert.ok(has("pressure", "better"));
  });

  test("time of day and hint string generation", () => {
    const c = parseClauses("cough worse at night. no fever")[0];
    assert.equal(c.timeOfDay, "night");
    assert.match(clauseHint(c), /worse from night/);
    assert.equal(parseClauses("no fever")[0].negated, true);
  });
});
