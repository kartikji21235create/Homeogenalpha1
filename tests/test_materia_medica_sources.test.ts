import { describe, it } from "node:test";
import assert from "node:assert";
import { db } from "../src/lib/db/store";
import { GET as getSources } from "../src/app/api/sources/route";
import { GET as getMateriaMedicaList } from "../src/app/api/mm/route";
import { GET as getMateriaMedicaItem } from "../src/app/api/mm/[id]/route";
import { GET as searchMateriaMedicaPassages } from "../src/app/api/mm/search/route";
import { GET as searchRubrics } from "../src/app/api/rubrics/search/route";
import { NextRequest } from "next/server";

describe("Open Data Sources & Materia Medica Library (PRD Section 6, 10, 14)", () => {
  it("enforces PRD Section 6 Data Sources Catalog ('No record, no load')", async () => {
    const res = await getSources();
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert.ok(Array.isArray(body.data.sources));
    assert.strictEqual(body.data.count >= 11, true);

    // Verify key repertories exist
    const repertoryIds = body.data.sources.map((s: any) => s.repertory_id);
    assert.ok(repertoryIds.includes("kent_1897"));
    assert.ok(repertoryIds.includes("knerr_hering"));
    assert.ok(repertoryIds.includes("boericke_rep"));
    assert.ok(repertoryIds.includes("boenninghausen_rep"));
    assert.ok(repertoryIds.includes("boger_boenninghausen"));
    assert.ok(repertoryIds.includes("publicum"));

    // Verify key materia medicas exist
    assert.ok(repertoryIds.includes("boericke_mm"));
    assert.ok(repertoryIds.includes("allen_keynotes"));
    assert.ok(repertoryIds.includes("kent_lectures"));
    assert.ok(repertoryIds.includes("clarke_dict"));
    assert.ok(repertoryIds.includes("hering_guiding"));

    // Verify license integrity
    for (const source of body.data.sources) {
      assert.ok(source.licence, `Source ${source.repertory_id} missing licence`);
      assert.ok(source.licence_note, `Source ${source.repertory_id} missing licence_note`);
    }
  });

  it("lists all available Materia Medica monographs (GET /api/mm)", async () => {
    const res = await getMateriaMedicaList();
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.ok, true);
    assert.ok(Array.isArray(body.data.remedies));
    assert.ok(body.data.count >= 10);

    const ars = body.data.remedies.find((r: any) => r.id === "ars");
    assert.ok(ars);
    assert.strictEqual(ars.common_name, "Arsenicum Album");
    assert.strictEqual(ars.abbreviation, "Ars");
  });

  it("retrieves complete clinical monograph with cited passages (GET /api/mm/:id)", async () => {
    const req = new NextRequest("http://localhost:3000/api/mm/ars");
    const res = await getMateriaMedicaItem(req, { params: Promise.resolve({ id: "ars" }) });
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.ok, true);
    const remedy = body.data;

    assert.strictEqual(remedy.id, "ars");
    assert.ok(remedy.latin_name.includes("Acidum"));
    assert.ok(remedy.mind.toLowerCase().includes("restlessness"));
    assert.ok(remedy.modalities.aggravation.toLowerCase().includes("midnight"));
    assert.ok(remedy.modalities.amelioration.toLowerCase().includes("warmth"));

    // Citations validation
    assert.ok(Array.isArray(remedy.cited_passages));
    assert.ok(remedy.cited_passages.length >= 2);
    const boerickeCitation = remedy.cited_passages.find((p: any) => p.author.includes("William Boericke"));
    assert.ok(boerickeCitation);
    assert.ok(boerickeCitation.text.length > 20);

    // Test 404 for unknown remedy
    const notFoundReq = new NextRequest("http://localhost:3000/api/mm/unknown_remedy_xyz");
    const notFoundRes = await getMateriaMedicaItem(notFoundReq, { params: Promise.resolve({ id: "unknown_remedy_xyz" }) });
    assert.strictEqual(notFoundRes.status, 404);
  });

  it("satisfies PRD Section 10/14 contract: GET /api/mm/search -> cited passages (400 if empty)", async () => {
    // 1. Rejection on empty query
    const emptyReq = new NextRequest("http://localhost:3000/api/mm/search?q=");
    const emptyRes = await searchMateriaMedicaPassages(emptyReq);
    assert.strictEqual(emptyRes.status, 400);
    const emptyBody = await emptyRes.json();
    assert.strictEqual(emptyBody.error.code, "empty_query");

    // 2. Successful search retrieving book, section, and cited text
    const searchReq = new NextRequest("http://localhost:3000/api/mm/search?q=burning");
    const searchRes = await searchMateriaMedicaPassages(searchReq);
    assert.strictEqual(searchRes.status, 200);

    const searchBody = await searchRes.json();
    assert.strictEqual(searchBody.ok, true);
    assert.ok(Array.isArray(searchBody.data.passages));
    assert.ok(searchBody.data.passages.length > 0);

    const firstResult = searchBody.data.passages[0];
    assert.ok(firstResult.remedy_id);
    assert.ok(firstResult.common_name);
    assert.ok(firstResult.passage.book);
    assert.ok(firstResult.passage.author);
    assert.ok(firstResult.passage.section);
    assert.ok(firstResult.passage.text.toLowerCase().includes("burning"));
  });

  it("filters rubrics by open repertory provenance (Kent 1897, Knerr 1896, Boericke 1927, Boenninghausen 1846)", async () => {
    // 1. Search all open repertories
    const allReq = new NextRequest("http://localhost:3000/api/rubrics/search?q=anxiety&repertory_id=all");
    const allRes = await searchRubrics(allReq);
    assert.strictEqual(allRes.status, 200);
    const allBody = await allRes.json();
    assert.ok(allBody.data.rubrics.length > 0);
    assert.ok(allBody.data.rubrics[0].sources.length > 0);

    // 2. Search Knerr's Hering repertory specifically
    const knerrReq = new NextRequest("http://localhost:3000/api/rubrics/search?q=fear&repertory_id=knerr_hering");
    const knerrRes = await searchRubrics(knerrReq);
    assert.strictEqual(knerrRes.status, 200);
    const knerrBody = await knerrRes.json();
    assert.ok(knerrBody.data.rubrics.length > 0);
    for (const r of knerrBody.data.rubrics) {
      assert.strictEqual(r.repertory_id, "knerr_hering");
    }

    // 3. Search Boericke Pocket Repertory specifically
    const boerickeReq = new NextRequest("http://localhost:3000/api/rubrics/search?q=fever&repertory_id=boericke_rep");
    const boerickeRes = await searchRubrics(boerickeReq);
    assert.strictEqual(boerickeRes.status, 200);
    const boerickeBody = await boerickeRes.json();
    assert.ok(boerickeBody.data.rubrics.length > 0);
    for (const r of boerickeBody.data.rubrics) {
      assert.strictEqual(r.repertory_id, "boericke_rep");
    }

    // 4. Search Boenninghausen Therapeutic Pocket Book specifically
    const boenninghausenReq = new NextRequest("http://localhost:3000/api/rubrics/search?q=cough&repertory_id=boenninghausen_rep");
    const boenninghausenRes = await searchRubrics(boenninghausenReq);
    assert.strictEqual(boenninghausenRes.status, 200);
    const boenninghausenBody = await boenninghausenRes.json();
    assert.ok(boenninghausenBody.data.rubrics.length > 0);
    for (const r of boenninghausenBody.data.rubrics) {
      assert.strictEqual(r.repertory_id, "boenninghausen_rep");
    }
  });
});
