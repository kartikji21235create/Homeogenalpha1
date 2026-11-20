import json
import os
import sys

# Add scripts directory to path
sys.path.insert(0, os.path.dirname(__file__))

from data.remedies_data import REMEDIES
from data.rubrics_data import RUBRICS
from data.synonyms_data import SYNONYMS
from data.mm_data import MATERIA_MEDICA
from data.mm_data_part2 import MATERIA_MEDICA_PART2
from data.mm_data_part3 import MATERIA_MEDICA_PART3
from data.mm_data_part4 import MATERIA_MEDICA_PART4
from data.mm_data_extended import MATERIA_MEDICA_EXTENDED

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
SEED_DIR = os.path.join(BASE_DIR, "seed")

CANONICAL_31_CHAPTERS = [
    "Mind", "Vertigo", "Head", "Eye", "Vision", "Ear", "Hearing", "Nose",
    "Face", "Mouth", "Teeth", "Throat", "Stomach", "Abdomen", "Rectum",
    "Stool", "Urinary Organs", "Genitalia", "Larynx & Trachea", "Respiration",
    "Cough", "Expectoration", "Chest", "Back", "Extremities", "Sleep",
    "Chill", "Fever", "Perspiration", "Skin", "Generalities"
]

def validate_and_generate():
    print("==================================================")
    print("Homeogenalpha1 Comprehensive Datasets Generator")
    print("==================================================")

    # 1. Load Data Sources for provenance verification
    data_sources_path = os.path.join(SEED_DIR, "data_sources.json")
    with open(data_sources_path, "r", encoding="utf-8") as f:
        data_sources = json.load(f)
    valid_repertory_ids = {ds["repertory_id"] for ds in data_sources}
    print(f"[1/5] Verified {len(valid_repertory_ids)} licensed data source identifiers in catalog.")

    # 2. Build remedy abbreviation lookup map
    remedy_abbrevs = {r["abbreviation"] for r in REMEDIES}
    alias_map = {}
    for r in REMEDIES:
        for alias in r.get("aliases", []):
            alias_map[alias.lower()] = r["abbreviation"]

    print(f"[2/5] Remedies registered: {len(REMEDIES)}. Primary abbreviations: {len(remedy_abbrevs)}")

    # 3. Validate Rubrics
    chapters_found = set()
    seen_paths = set()
    cleaned_rubrics = []
    mapping_count = 0

    for i, rubric in enumerate(RUBRICS):
        path_str = rubric["rubric_path"].strip()
        if path_str in seen_paths:
            raise ValueError(f"DUPLICATE RUBRIC PATH at index {i}: '{path_str}'")
        seen_paths.add(path_str)

        chapter = rubric["chapter"]
        chapters_found.add(chapter)

        rep_id = rubric.get("repertory_id", "kent_1897")
        if rep_id not in valid_repertory_ids:
            raise ValueError(f"UNLICENSED REPERTORY ID '{rep_id}' in rubric '{path_str}' (PRD Rule 8)")

        # Validate mappings
        valid_mappings = []
        for m in rubric["mappings"]:
            abbrev = m["abbrev"]
            if abbrev not in remedy_abbrevs:
                # check aliases
                resolved = alias_map.get(abbrev.lower())
                if resolved:
                    m["abbrev"] = resolved
                else:
                    raise ValueError(f"UNMAPPED REMEDY ABBREVIATION '{abbrev}' in rubric '{path_str}' (PRD Problem 9)")
            
            grade = m["grade"]
            if not isinstance(grade, int) or grade < 1 or grade > 4:
                raise ValueError(f"INVALID GRADE {grade} in rubric '{path_str}' (Must be 1-4)")
            valid_mappings.append(m)

        rubric["mappings"] = valid_mappings
        mapping_count += len(valid_mappings)
        cleaned_rubrics.append(rubric)

    print(f"[3/5] Rubrics validated: {len(cleaned_rubrics)} across {len(chapters_found)} chapters with {mapping_count} remedy mappings.")
    missing_chapters = set(CANONICAL_31_CHAPTERS) - chapters_found
    if missing_chapters:
        raise ValueError(f"MISSING CANONICAL CHAPTERS: {missing_chapters}")
    print("      All 31 canonical chapters verified present and populated!")

    # 4. Merge Materia Medica monographs
    all_mm = MATERIA_MEDICA + MATERIA_MEDICA_PART2 + MATERIA_MEDICA_PART3 + MATERIA_MEDICA_PART4 + MATERIA_MEDICA_EXTENDED
    mm_ids = set()
    for mm in all_mm:
        mm_id = mm["id"]
        if mm_id in mm_ids:
            raise ValueError(f"DUPLICATE MATERIA MEDICA ID: '{mm_id}'")
        mm_ids.add(mm_id)

        # Validate structure
        assert mm["common_name"], f"Remedy {mm_id} missing common_name"
        assert mm["abbreviation"], f"Remedy {mm_id} missing abbreviation"
        assert len(mm["keynotes"]) >= 2, f"Remedy {mm_id} insufficient keynotes"
        assert mm["modalities"]["aggravation"], f"Remedy {mm_id} missing aggravation"
        assert mm["modalities"]["amelioration"], f"Remedy {mm_id} missing amelioration"
        assert len(mm["cited_passages"]) >= 2, f"Remedy {mm_id} insufficient cited passages"

    print(f"[4/5] Materia Medica monographs validated: {len(all_mm)} complete clinical profiles.")

    # 5. Write seed_data.json and materia_medica.json
    seed_data = {
        "remedies": REMEDIES,
        "rubrics": cleaned_rubrics,
        "synonyms": SYNONYMS
    }

    seed_data_file = os.path.join(SEED_DIR, "seed_data.json")
    with open(seed_data_file, "w", encoding="utf-8") as f:
        json.dump(seed_data, f, indent=2)
    print(f"[5/5] Successfully generated '{seed_data_file}' ({os.path.getsize(seed_data_file):,} bytes)")

    mm_file = os.path.join(SEED_DIR, "materia_medica.json")
    with open(mm_file, "w", encoding="utf-8") as f:
        json.dump(all_mm, f, indent=2)
    print(f"      Successfully generated '{mm_file}' ({os.path.getsize(mm_file):,} bytes)")

    print("==================================================")
    print("DATASET BUILD COMPLETED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    validate_and_generate()
