# scripts/data/rubrics_data.py

RUBRICS = [
    # =========================================================================
    # ORIGINAL 37 CANONICAL SEED RUBRICS (Preserves exact Rubric ID mapping)
    # =========================================================================
    {
        "chapter": "Mind",
        "rubric_path": "Mind; Anxiety; health, about",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "6"}],
        "mappings": [
            {"abbrev": "Ars", "grade": 3},
            {"abbrev": "Phos", "grade": 3},
            {"abbrev": "Calc", "grade": 3},
            {"abbrev": "Nux-v", "grade": 2},
            {"abbrev": "Puls", "grade": 2}
        ]
    },
    {
        "chapter": "Mind",
        "rubric_path": "Mind; Restlessness, nervousness; night",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "72"}],
        "mappings": [
            {"abbrev": "Ars", "grade": 4},
            {"abbrev": "Rhus-t", "grade": 3},
            {"abbrev": "Acon", "grade": 3},
            {"abbrev": "Bell", "grade": 2}
        ]
    },
    {
        "chapter": "Mind",
        "rubric_path": "Mind; Fastidious",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "44"}],
        "mappings": [
            {"abbrev": "Ars", "grade": 3},
            {"abbrev": "Nux-v", "grade": 2}
        ]
    },
    {
        "chapter": "Mind",
        "rubric_path": "Mind; Irritability; morning; waking, on",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "58"}],
        "mappings": [
            {"abbrev": "Nux-v", "grade": 3},
            {"abbrev": "Lyc", "grade": 3},
            {"abbrev": "Sulph", "grade": 2},
            {"abbrev": "Nat-m", "grade": 2}
        ]
    },
    {
        "chapter": "Mind",
        "rubric_path": "Mind; Weeping; consolation; agg.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "93"}],
        "mappings": [
            {"abbrev": "Nat-m", "grade": 3},
            {"abbrev": "Sep", "grade": 2},
            {"abbrev": "Sil", "grade": 2}
        ]
    },
    {
        "chapter": "Mind",
        "rubric_path": "Mind; Weeping; consolation; amel.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "93"}],
        "mappings": [
            {"abbrev": "Puls", "grade": 3}
        ]
    },
    {
        "chapter": "Mind",
        "rubric_path": "Mind; Sympathetic, compassionate",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "86"}],
        "mappings": [
            {"abbrev": "Phos", "grade": 3},
            {"abbrev": "Caust", "grade": 3},
            {"abbrev": "Nat-c", "grade": 2}
        ]
    },
    {
        "chapter": "Generalities",
        "rubric_path": "Generalities; Warmth; agg.; warm room",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1412"}],
        "mappings": [
            {"abbrev": "Puls", "grade": 3},
            {"abbrev": "Sulph", "grade": 3},
            {"abbrev": "Apis", "grade": 3},
            {"abbrev": "Lyc", "grade": 2}
        ]
    },
    {
        "chapter": "Generalities",
        "rubric_path": "Generalities; Cold; agg.; becoming cold",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1346"}],
        "mappings": [
            {"abbrev": "Ars", "grade": 3},
            {"abbrev": "Nux-v", "grade": 3},
            {"abbrev": "Calc", "grade": 3},
            {"abbrev": "Rhus-t", "grade": 3},
            {"abbrev": "Sep", "grade": 2}
        ]
    },
    {
        "chapter": "Generalities",
        "rubric_path": "Generalities; Motion; agg.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1376"}],
        "mappings": [
            {"abbrev": "Bry", "grade": 3},
            {"abbrev": "Bell", "grade": 2},
            {"abbrev": "Nux-v", "grade": 2}
        ]
    },
    {
        "chapter": "Generalities",
        "rubric_path": "Generalities; Motion; amel.; continued motion",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1378"}],
        "mappings": [
            {"abbrev": "Rhus-t", "grade": 3},
            {"abbrev": "Puls", "grade": 2},
            {"abbrev": "Sep", "grade": 2}
        ]
    },
    {
        "chapter": "Stomach",
        "rubric_path": "Stomach; Thirst; extreme; unquenchable",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "528"}],
        "mappings": [
            {"abbrev": "Bry", "grade": 3},
            {"abbrev": "Ars", "grade": 3},
            {"abbrev": "Phos", "grade": 3},
            {"abbrev": "Sulph", "grade": 2}
        ]
    },
    {
        "chapter": "Stomach",
        "rubric_path": "Stomach; Thirst; small quantities, for; often",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "530"}],
        "mappings": [
            {"abbrev": "Ars", "grade": 3},
            {"abbrev": "Bell", "grade": 2},
            {"abbrev": "Hyos", "grade": 2}
        ]
    },
    {
        "chapter": "Stomach",
        "rubric_path": "Stomach; Thirstless",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "531"}],
        "mappings": [
            {"abbrev": "Puls", "grade": 3},
            {"abbrev": "Apis", "grade": 3},
            {"abbrev": "Sep", "grade": 2}
        ]
    },
    {
        "chapter": "Stomach",
        "rubric_path": "Stomach; Desires; warm drinks",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "486"}],
        "mappings": [
            {"abbrev": "Ars", "grade": 2},
            {"abbrev": "Nux-v", "grade": 1},
            {"abbrev": "Chel", "grade": 2}
        ]
    },
    {
        "chapter": "Stomach",
        "rubric_path": "Stomach; Desires; sweets",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "485"}],
        "mappings": [
            {"abbrev": "Lyc", "grade": 3},
            {"abbrev": "Sulph", "grade": 3},
            {"abbrev": "Arg-n", "grade": 3}
        ]
    },
    {
        "chapter": "Stomach",
        "rubric_path": "Stomach; Desires; cold drinks, ice cold",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "484"}],
        "mappings": [
            {"abbrev": "Phos", "grade": 3},
            {"abbrev": "Verat", "grade": 3},
            {"abbrev": "Acon", "grade": 2}
        ]
    },
    {
        "chapter": "Stomach",
        "rubric_path": "Stomach; Aversion; fat and rich food",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "480"}],
        "mappings": [
            {"abbrev": "Puls", "grade": 3},
            {"abbrev": "Carb-v", "grade": 2},
            {"abbrev": "Nat-m", "grade": 2}
        ]
    },
    {
        "chapter": "Stomach",
        "rubric_path": "Stomach; Distension, bloating; afternoon; 4 to 8 p.m.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "495"}],
        "mappings": [
            {"abbrev": "Lyc", "grade": 3},
            {"abbrev": "Hell", "grade": 2}
        ]
    },
    {
        "chapter": "Head",
        "rubric_path": "Head; Pain, headache; pulsating, throbbing",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "150"}],
        "mappings": [
            {"abbrev": "Bell", "grade": 3},
            {"abbrev": "Glon", "grade": 3},
            {"abbrev": "Nat-m", "grade": 2}
        ]
    },
    {
        "chapter": "Extremities",
        "rubric_path": "Extremities; Heat; burning; feet; night; uncovers them",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1002"}],
        "mappings": [
            {"abbrev": "Sulph", "grade": 3},
            {"abbrev": "Cham", "grade": 2},
            {"abbrev": "Med", "grade": 2},
            {"abbrev": "Puls", "grade": 2}
        ]
    },
    {
        "chapter": "Mind",
        "rubric_path": "Mind; Fear; dark, of",
        "repertory_id": "knerr_hering",
        "sources": [{"book": "Knerr", "edition": "1896", "page": "22"}],
        "mappings": [
            {"abbrev": "Phos", "grade": 3},
            {"abbrev": "Bell", "grade": 3},
            {"abbrev": "Puls", "grade": 2},
            {"abbrev": "Calc", "grade": 2}
        ]
    },
    {
        "chapter": "Chest",
        "rubric_path": "Chest; Palpitation; anxiety, with",
        "repertory_id": "knerr_hering",
        "sources": [{"book": "Knerr", "edition": "1896", "page": "412"}],
        "mappings": [
            {"abbrev": "Acon", "grade": 3},
            {"abbrev": "Ars", "grade": 3},
            {"abbrev": "Phos", "grade": 2},
            {"abbrev": "Sulph", "grade": 2}
        ]
    },
    {
        "chapter": "Sleep",
        "rubric_path": "Sleep; Sleeplessness; thoughts, from rush of",
        "repertory_id": "knerr_hering",
        "sources": [{"book": "Knerr", "edition": "1896", "page": "890"}],
        "mappings": [
            {"abbrev": "Nux-v", "grade": 3},
            {"abbrev": "Lyc", "grade": 2},
            {"abbrev": "Calc", "grade": 2}
        ]
    },
    {
        "chapter": "Mind",
        "rubric_path": "Mind; Irritability; contradiction, cannot bear",
        "repertory_id": "boericke_rep",
        "sources": [{"book": "Boericke", "edition": "1927", "page": "14"}],
        "mappings": [
            {"abbrev": "Nux-v", "grade": 3},
            {"abbrev": "Lyc", "grade": 3},
            {"abbrev": "Sep", "grade": 2},
            {"abbrev": "Bry", "grade": 2}
        ]
    },
    {
        "chapter": "Stomach",
        "rubric_path": "Stomach; Dyspepsia; coffee and stimulants, from",
        "repertory_id": "boericke_rep",
        "sources": [{"book": "Boericke", "edition": "1927", "page": "218"}],
        "mappings": [
            {"abbrev": "Nux-v", "grade": 3},
            {"abbrev": "Cham", "grade": 2},
            {"abbrev": "Sulph", "grade": 2}
        ]
    },
    {
        "chapter": "Generalities",
        "rubric_path": "Generalities; Exhaustion; prostration, sudden",
        "repertory_id": "boericke_rep",
        "sources": [{"book": "Boericke", "edition": "1927", "page": "512"}],
        "mappings": [
            {"abbrev": "Ars", "grade": 3},
            {"abbrev": "Carb-v", "grade": 3},
            {"abbrev": "Verat", "grade": 2}
        ]
    },
    {
        "chapter": "Generalities",
        "rubric_path": "Generalities; Aggravation; cold, dry air",
        "repertory_id": "boenninghausen_rep",
        "sources": [{"book": "Boenninghausen", "edition": "1846", "page": "145"}],
        "mappings": [
            {"abbrev": "Acon", "grade": 3},
            {"abbrev": "Nux-v", "grade": 3},
            {"abbrev": "Bry", "grade": 2},
            {"abbrev": "Caust", "grade": 2}
        ]
    },
    {
        "chapter": "Generalities",
        "rubric_path": "Generalities; Amelioration; motion, continued",
        "repertory_id": "boenninghausen_rep",
        "sources": [{"book": "Boenninghausen", "edition": "1846", "page": "132"}],
        "mappings": [
            {"abbrev": "Rhus-t", "grade": 3},
            {"abbrev": "Puls", "grade": 2},
            {"abbrev": "Sep", "grade": 2}
        ]
    },
    {
        "chapter": "Head",
        "rubric_path": "Head; Pain; pulsating",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "142"}],
        "mappings": [
            {"abbrev": "Bell", "grade": 4},
            {"abbrev": "Glon", "grade": 3},
            {"abbrev": "Nat-m", "grade": 3},
            {"abbrev": "Sulph", "grade": 2}
        ]
    },
    {
        "chapter": "Head",
        "rubric_path": "Head; Pain; sun, from exposure to",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "151"}],
        "mappings": [
            {"abbrev": "Glon", "grade": 3},
            {"abbrev": "Nat-c", "grade": 3},
            {"abbrev": "Nat-m", "grade": 2},
            {"abbrev": "Bell", "grade": 2}
        ]
    },
    {
        "chapter": "Stomach",
        "rubric_path": "Stomach; Desires; salt, salty things",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "486"}],
        "mappings": [
            {"abbrev": "Nat-m", "grade": 3},
            {"abbrev": "Phos", "grade": 2},
            {"abbrev": "Carb-v", "grade": 2}
        ]
    },
    {
        "chapter": "Rectum",
        "rubric_path": "Rectum; Diarrhoea; morning; bed, driving out of",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "610"}],
        "mappings": [
            {"abbrev": "Sulph", "grade": 3},
            {"abbrev": "Aloe", "grade": 3},
            {"abbrev": "Puls", "grade": 2}
        ]
    },
    {
        "chapter": "Rectum",
        "rubric_path": "Rectum; Constipation; ineffectual urging, with",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "606"}],
        "mappings": [
            {"abbrev": "Nux-v", "grade": 3},
            {"abbrev": "Lyc", "grade": 2},
            {"abbrev": "Sulph", "grade": 2}
        ]
    },
    {
        "chapter": "Extremities",
        "rubric_path": "Extremities; Pain; joints; motion, on beginning; amel. continued motion",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1028"}],
        "mappings": [
            {"abbrev": "Rhus-t", "grade": 4},
            {"abbrev": "Calc", "grade": 2},
            {"abbrev": "Lyc", "grade": 2}
        ]
    },
    {
        "chapter": "Extremities",
        "rubric_path": "Extremities; Pain; motion, agg.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1032"}],
        "mappings": [
            {"abbrev": "Bry", "grade": 4},
            {"abbrev": "Bell", "grade": 2},
            {"abbrev": "Nux-v", "grade": 2}
        ]
    },
    {
        "chapter": "Skin",
        "rubric_path": "Skin; Itching; warmth of bed, agg.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1308"}],
        "mappings": [
            {"abbrev": "Sulph", "grade": 3},
            {"abbrev": "Merc", "grade": 3},
            {"abbrev": "Puls", "grade": 2}
        ]
    },

    # =========================================================================
    # COMPREHENSIVE EXPANSION ACROSS ALL 31 CANONICAL CHAPTERS
    # =========================================================================
    # 1. MIND
    {
        "chapter": "Mind",
        "rubric_path": "Mind; Anxiety; anticipate, when about to; engagement",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "5"}],
        "mappings": [
            {"abbrev": "Gels", "grade": 3},
            {"abbrev": "Arg-n", "grade": 3},
            {"abbrev": "Lyc", "grade": 2},
            {"abbrev": "Med", "grade": 2}
        ]
    },
    {
        "chapter": "Mind",
        "rubric_path": "Mind; Fear; death, of",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "45"}],
        "mappings": [
            {"abbrev": "Acon", "grade": 4},
            {"abbrev": "Ars", "grade": 3},
            {"abbrev": "Bell", "grade": 2},
            {"abbrev": "Calc", "grade": 2}
        ]
    },
    {
        "chapter": "Mind",
        "rubric_path": "Mind; Fear; crowd, in a; public places",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "44"}],
        "mappings": [
            {"abbrev": "Acon", "grade": 3},
            {"abbrev": "Arg-n", "grade": 3},
            {"abbrev": "Gels", "grade": 2},
            {"abbrev": "Lyc", "grade": 2}
        ]
    },
    {
        "chapter": "Mind",
        "rubric_path": "Mind; Grief; silent, involuntary sighing",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "51"}],
        "mappings": [
            {"abbrev": "Ign", "grade": 4},
            {"abbrev": "Nat-m", "grade": 3},
            {"abbrev": "Ph-ac", "grade": 2}
        ]
    },
    {
        "chapter": "Mind",
        "rubric_path": "Mind; Jealousy; loquacity, with",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "59"}],
        "mappings": [
            {"abbrev": "Lach", "grade": 4},
            {"abbrev": "Hyos", "grade": 3}
        ]
    },
    {
        "chapter": "Mind",
        "rubric_path": "Mind; Delirium; furious, violent; biting, striking",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "19"}],
        "mappings": [
            {"abbrev": "Bell", "grade": 4},
            {"abbrev": "Hyos", "grade": 3},
            {"abbrev": "Stram", "grade": 3}
        ]
    },
    {
        "chapter": "Mind",
        "rubric_path": "Mind; Concentration; difficult; reading or studying, while",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "15"}],
        "mappings": [
            {"abbrev": "Gels", "grade": 3},
            {"abbrev": "Nux-v", "grade": 3},
            {"abbrev": "Ph-ac", "grade": 2},
            {"abbrev": "Sil", "grade": 2}
        ]
    },

    # 2. VERTIGO
    {
        "chapter": "Vertigo",
        "rubric_path": "Vertigo; Looking; upwards, on",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "100"}],
        "mappings": [
            {"abbrev": "Calc", "grade": 3},
            {"abbrev": "Sil", "grade": 2},
            {"abbrev": "Puls", "grade": 2}
        ]
    },
    {
        "chapter": "Vertigo",
        "rubric_path": "Vertigo; Looking; downwards, on",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "100"}],
        "mappings": [
            {"abbrev": "Con", "grade": 3},
            {"abbrev": "Spig", "grade": 2},
            {"abbrev": "Kalm", "grade": 2}
        ]
    },
    {
        "chapter": "Vertigo",
        "rubric_path": "Vertigo; Rising; bed, from; agg.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "104"}],
        "mappings": [
            {"abbrev": "Bry", "grade": 3},
            {"abbrev": "Acon", "grade": 3},
            {"abbrev": "Rhus-t", "grade": 2},
            {"abbrev": "Phos", "grade": 2}
        ]
    },
    {
        "chapter": "Vertigo",
        "rubric_path": "Vertigo; High places, on",
        "repertory_id": "boericke_rep",
        "sources": [{"book": "Boericke", "edition": "1927", "page": "94"}],
        "mappings": [
            {"abbrev": "Arg-n", "grade": 3},
            {"abbrev": "Calc", "grade": 2},
            {"abbrev": "Sulph", "grade": 2}
        ]
    },
    {
        "chapter": "Vertigo",
        "rubric_path": "Vertigo; Motion, from; slightest motion of head",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "102"}],
        "mappings": [
            {"abbrev": "Bry", "grade": 4},
            {"abbrev": "Cocc", "grade": 3},
            {"abbrev": "Ther", "grade": 3}
        ]
    },
    {
        "chapter": "Vertigo",
        "rubric_path": "Vertigo; Gastric origin; dyspepsia, with",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "99"}],
        "mappings": [
            {"abbrev": "Nux-v", "grade": 3},
            {"abbrev": "Puls", "grade": 3},
            {"abbrev": "Lyc", "grade": 2}
        ]
    },

    # 3. HEAD
    {
        "chapter": "Head",
        "rubric_path": "Head; Pain; occiput; extending to forehead and eyes",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "146"}],
        "mappings": [
            {"abbrev": "Gels", "grade": 3},
            {"abbrev": "Sang", "grade": 3},
            {"abbrev": "Sil", "grade": 3}
        ]
    },
    {
        "chapter": "Head",
        "rubric_path": "Head; Pain; vertex; burning heat as if top of head would fly off",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "154"}],
        "mappings": [
            {"abbrev": "Sulph", "grade": 3},
            {"abbrev": "Cimic", "grade": 2},
            {"abbrev": "Glon", "grade": 2}
        ]
    },
    {
        "chapter": "Head",
        "rubric_path": "Head; Pain; motion; agg.; slightest jar or misstep",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "140"}],
        "mappings": [
            {"abbrev": "Bry", "grade": 4},
            {"abbrev": "Bell", "grade": 3},
            {"abbrev": "Nux-v", "grade": 2}
        ]
    },
    {
        "chapter": "Head",
        "rubric_path": "Head; Pain; pressure; amel.; tight bandage or wrapping up",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "148"}],
        "mappings": [
            {"abbrev": "Sil", "grade": 3},
            {"abbrev": "Bry", "grade": 3},
            {"abbrev": "Arg-n", "grade": 2}
        ]
    },
    {
        "chapter": "Head",
        "rubric_path": "Head; Pain; mental exertion, from",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "139"}],
        "mappings": [
            {"abbrev": "Nux-v", "grade": 3},
            {"abbrev": "Nat-m", "grade": 3},
            {"abbrev": "Sil", "grade": 2},
            {"abbrev": "Pic-ac", "grade": 2}
        ]
    },
    {
        "chapter": "Head",
        "rubric_path": "Head; Coldness; vertex, on; as of ice",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "112"}],
        "mappings": [
            {"abbrev": "Calc", "grade": 3},
            {"abbrev": "Verat", "grade": 3},
            {"abbrev": "Sep", "grade": 2}
        ]
    },

    # 4. EYE
    {
        "chapter": "Eye",
        "rubric_path": "Eye; Photophobia; daylight, agg.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "252"}],
        "mappings": [
            {"abbrev": "Bell", "grade": 3},
            {"abbrev": "Euphr", "grade": 3},
            {"abbrev": "Merc", "grade": 2},
            {"abbrev": "Sulph", "grade": 2}
        ]
    },
    {
        "chapter": "Eye",
        "rubric_path": "Eye; Inflammation; conjunctiva; tears acrid, burning excoriating cheeks",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "244"}],
        "mappings": [
            {"abbrev": "Euphr", "grade": 4},
            {"abbrev": "Ars", "grade": 3},
            {"abbrev": "Merc", "grade": 2}
        ]
    },
    {
        "chapter": "Eye",
        "rubric_path": "Eye; Discharges; purulent; thick, yellow, bland non-irritating",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "238"}],
        "mappings": [
            {"abbrev": "Puls", "grade": 4},
            {"abbrev": "Hep", "grade": 2}
        ]
    },
    {
        "chapter": "Eye",
        "rubric_path": "Eye; Pain; burning, smarting as of sand in eyes",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "248"}],
        "mappings": [
            {"abbrev": "Sulph", "grade": 3},
            {"abbrev": "Acon", "grade": 3},
            {"abbrev": "Ign", "grade": 2},
            {"abbrev": "Puls", "grade": 2}
        ]
    },

    # 5. VISION
    {
        "chapter": "Vision",
        "rubric_path": "Vision; Dim; mist or veil before eyes",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "276"}],
        "mappings": [
            {"abbrev": "Gels", "grade": 3},
            {"abbrev": "Puls", "grade": 3},
            {"abbrev": "Phos", "grade": 2},
            {"abbrev": "Caust", "grade": 2}
        ]
    },
    {
        "chapter": "Vision",
        "rubric_path": "Vision; Diplopia; double vision",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "273"}],
        "mappings": [
            {"abbrev": "Gels", "grade": 3},
            {"abbrev": "Bell", "grade": 2},
            {"abbrev": "Hyos", "grade": 2}
        ]
    },
    {
        "chapter": "Vision",
        "rubric_path": "Vision; Halos, coloured; around light; green or rainbow tints",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "275"}],
        "mappings": [
            {"abbrev": "Phos", "grade": 3},
            {"abbrev": "Bell", "grade": 2},
            {"abbrev": "Puls", "grade": 2}
        ]
    },

    # 6. EAR
    {
        "chapter": "Ear",
        "rubric_path": "Ear; Pain; acute otalgia; night, agg.; intolerable tearing",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "298"}],
        "mappings": [
            {"abbrev": "Cham", "grade": 4},
            {"abbrev": "Bell", "grade": 3},
            {"abbrev": "Puls", "grade": 3},
            {"abbrev": "Hep", "grade": 2}
        ]
    },
    {
        "chapter": "Ear",
        "rubric_path": "Ear; Discharges; purulent; thick yellow, bland",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "288"}],
        "mappings": [
            {"abbrev": "Puls", "grade": 4},
            {"abbrev": "Hep", "grade": 3},
            {"abbrev": "Sil", "grade": 2}
        ]
    },
    {
        "chapter": "Ear",
        "rubric_path": "Ear; Discharges; purulent; offensive, excoriating",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "288"}],
        "mappings": [
            {"abbrev": "Merc", "grade": 3},
            {"abbrev": "Tell", "grade": 3},
            {"abbrev": "Psor", "grade": 2}
        ]
    },

    # 7. HEARING
    {
        "chapter": "Hearing",
        "rubric_path": "Hearing; Noises in ear; buzzing, ringing, tinnitus",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "316"}],
        "mappings": [
            {"abbrev": "Chin", "grade": 3},
            {"abbrev": "Sal-ac", "grade": 3},
            {"abbrev": "Kali-c", "grade": 2},
            {"abbrev": "Nat-m", "grade": 2}
        ]
    },
    {
        "chapter": "Hearing",
        "rubric_path": "Hearing; Impaired; deafness; catarrhal eustachian tube",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "312"}],
        "mappings": [
            {"abbrev": "Puls", "grade": 3},
            {"abbrev": "Hydr", "grade": 2},
            {"abbrev": "Kali-m", "grade": 2}
        ]
    },

    # 8. NOSE
    {
        "chapter": "Nose",
        "rubric_path": "Nose; Coryza; fluent; acrid, burning discharge excoriating upper lip",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "326"}],
        "mappings": [
            {"abbrev": "All-c", "grade": 4},
            {"abbrev": "Ars", "grade": 3},
            {"abbrev": "Merc", "grade": 2}
        ]
    },
    {
        "chapter": "Nose",
        "rubric_path": "Nose; Coryza; fluent in open air; bland, non-irritating",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "327"}],
        "mappings": [
            {"abbrev": "Puls", "grade": 3},
            {"abbrev": "All-c", "grade": 2}
        ]
    },
    {
        "chapter": "Nose",
        "rubric_path": "Nose; Obstruction; night; must breathe with mouth open",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "338"}],
        "mappings": [
            {"abbrev": "Nux-v", "grade": 3},
            {"abbrev": "Samb", "grade": 3},
            {"abbrev": "Lyc", "grade": 2}
        ]
    },
    {
        "chapter": "Nose",
        "rubric_path": "Nose; Epistaxis; washing face or blowing nose, on",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "334"}],
        "mappings": [
            {"abbrev": "Phos", "grade": 3},
            {"abbrev": "Arn", "grade": 2},
            {"abbrev": "Bry", "grade": 2}
        ]
    },

    # 9. FACE
    {
        "chapter": "Face",
        "rubric_path": "Face; Pain; facial neuralgia; right sided; cold air agg.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "370"}],
        "mappings": [
            {"abbrev": "Bell", "grade": 3},
            {"abbrev": "Mag-p", "grade": 3},
            {"abbrev": "Spig", "grade": 2}
        ]
    },
    {
        "chapter": "Face",
        "rubric_path": "Face; Heat; flushes of heat; climacteric period",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "366"}],
        "mappings": [
            {"abbrev": "Lach", "grade": 4},
            {"abbrev": "Sep", "grade": 3},
            {"abbrev": "Sulph", "grade": 3}
        ]
    },
    {
        "chapter": "Face",
        "rubric_path": "Face; Pale; sickly, sunken with dark circles under eyes",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "358"}],
        "mappings": [
            {"abbrev": "Ars", "grade": 3},
            {"abbrev": "Chin", "grade": 3},
            {"abbrev": "Verat", "grade": 2}
        ]
    },
    {
        "chapter": "Face",
        "rubric_path": "Face; Discoloration; one cheek red and hot, the other pale and cold",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "360"}],
        "mappings": [
            {"abbrev": "Cham", "grade": 4},
            {"abbrev": "Acon", "grade": 2}
        ]
    },

    # 10. MOUTH
    {
        "chapter": "Mouth",
        "rubric_path": "Mouth; Salivation; profuse, nocturnal; wetting pillow in sleep",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "422"}],
        "mappings": [
            {"abbrev": "Merc", "grade": 4},
            {"abbrev": "Merc-c", "grade": 3},
            {"abbrev": "Nit-ac", "grade": 2}
        ]
    },
    {
        "chapter": "Mouth",
        "rubric_path": "Mouth; Aphthae; painful, burning ulcers",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "402"}],
        "mappings": [
            {"abbrev": "Bor", "grade": 4},
            {"abbrev": "Merc", "grade": 3},
            {"abbrev": "Ars", "grade": 2},
            {"abbrev": "Nit-ac", "grade": 2}
        ]
    },
    {
        "chapter": "Mouth",
        "rubric_path": "Mouth; Tongue; coated thick white, like white fur",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "416"}],
        "mappings": [
            {"abbrev": "Ant-c", "grade": 4},
            {"abbrev": "Puls", "grade": 2},
            {"abbrev": "Bry", "grade": 2}
        ]
    },
    {
        "chapter": "Mouth",
        "rubric_path": "Mouth; Tongue; mapped, patches denuded of epithelium",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "417"}],
        "mappings": [
            {"abbrev": "Nat-m", "grade": 3},
            {"abbrev": "Tarax", "grade": 3},
            {"abbrev": "Lach", "grade": 2}
        ]
    },
    {
        "chapter": "Mouth",
        "rubric_path": "Mouth; Odor, breath; offensive, fetid; metallic smell",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "408"}],
        "mappings": [
            {"abbrev": "Merc", "grade": 4},
            {"abbrev": "Nit-ac", "grade": 2},
            {"abbrev": "Bapt", "grade": 2}
        ]
    },

    # 11. TEETH
    {
        "chapter": "Teeth",
        "rubric_path": "Teeth; Pain; cold drinks, agg.; warm amel.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "436"}],
        "mappings": [
            {"abbrev": "Mag-p", "grade": 3},
            {"abbrev": "Merc", "grade": 2},
            {"abbrev": "Cham", "grade": 2}
        ]
    },
    {
        "chapter": "Teeth",
        "rubric_path": "Teeth; Pain; warm things, agg.; holding cold water in mouth amel.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "437"}],
        "mappings": [
            {"abbrev": "Coff", "grade": 4},
            {"abbrev": "Puls", "grade": 3},
            {"abbrev": "Cham", "grade": 2}
        ]
    },
    {
        "chapter": "Teeth",
        "rubric_path": "Teeth; Dentition; difficult, delayed; with diarrhoea and green stool",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "432"}],
        "mappings": [
            {"abbrev": "Calc", "grade": 3},
            {"abbrev": "Cham", "grade": 3},
            {"abbrev": "Calc-p", "grade": 2}
        ]
    },

    # 12. THROAT
    {
        "chapter": "Throat",
        "rubric_path": "Throat; Pain; swallowing liquids more painful than solids",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "462"}],
        "mappings": [
            {"abbrev": "Lach", "grade": 4},
            {"abbrev": "Ign", "grade": 3},
            {"abbrev": "Bell", "grade": 2}
        ]
    },
    {
        "chapter": "Throat",
        "rubric_path": "Throat; Pain; sore throat; left to right, extending",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "458"}],
        "mappings": [
            {"abbrev": "Lach", "grade": 4}
        ]
    },
    {
        "chapter": "Throat",
        "rubric_path": "Throat; Pain; sore throat; right to left, extending",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "458"}],
        "mappings": [
            {"abbrev": "Lyc", "grade": 4}
        ]
    },
    {
        "chapter": "Throat",
        "rubric_path": "Throat; Sensation; splinter or fishbone in throat",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "464"}],
        "mappings": [
            {"abbrev": "Hep", "grade": 4},
            {"abbrev": "Nit-ac", "grade": 3},
            {"abbrev": "Arg-n", "grade": 2}
        ]
    },
    {
        "chapter": "Throat",
        "rubric_path": "Throat; Globus hystericus; lump rising into throat",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "452"}],
        "mappings": [
            {"abbrev": "Ign", "grade": 4},
            {"abbrev": "Lach", "grade": 3},
            {"abbrev": "Asaf", "grade": 2}
        ]
    },

    # 13. STOMACH
    {
        "chapter": "Stomach",
        "rubric_path": "Stomach; Thirstless; fever or chill, during",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "531"}],
        "mappings": [
            {"abbrev": "Puls", "grade": 3},
            {"abbrev": "Apis", "grade": 3},
            {"abbrev": "Gels", "grade": 2}
        ]
    },
    {
        "chapter": "Stomach",
        "rubric_path": "Stomach; Desires; spicy, pungent food",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "485"}],
        "mappings": [
            {"abbrev": "Nux-v", "grade": 3},
            {"abbrev": "Sulph", "grade": 2},
            {"abbrev": "Hep", "grade": 2}
        ]
    },
    {
        "chapter": "Stomach",
        "rubric_path": "Stomach; Desires; eggs, boiled or soft",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "484"}],
        "mappings": [
            {"abbrev": "Calc", "grade": 4}
        ]
    },
    {
        "chapter": "Stomach",
        "rubric_path": "Stomach; Aversion; meat",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "481"}],
        "mappings": [
            {"abbrev": "Puls", "grade": 3},
            {"abbrev": "Mur-ac", "grade": 2},
            {"abbrev": "Sil", "grade": 2},
            {"abbrev": "Sulph", "grade": 2}
        ]
    },
    {
        "chapter": "Stomach",
        "rubric_path": "Stomach; Nausea; constant, unrelieved by vomiting",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "506"}],
        "mappings": [
            {"abbrev": "Ipec", "grade": 4},
            {"abbrev": "Ant-t", "grade": 2},
            {"abbrev": "Tab", "grade": 2}
        ]
    },
    {
        "chapter": "Stomach",
        "rubric_path": "Stomach; Vomiting; drinking cold water, after; as soon as it becomes warm in stomach",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "535"}],
        "mappings": [
            {"abbrev": "Phos", "grade": 4},
            {"abbrev": "Ars", "grade": 3}
        ]
    },
    {
        "chapter": "Stomach",
        "rubric_path": "Stomach; Pain; burning; gastralgia; amel. warm food or drinks",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "514"}],
        "mappings": [
            {"abbrev": "Ars", "grade": 4},
            {"abbrev": "Chel", "grade": 2},
            {"abbrev": "Nux-v", "grade": 2}
        ]
    },

    # 14. ABDOMEN
    {
        "chapter": "Abdomen",
        "rubric_path": "Abdomen; Pain; colic; bending double, amel.; hard pressure, amel.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "560"}],
        "mappings": [
            {"abbrev": "Coloc", "grade": 4},
            {"abbrev": "Mag-p", "grade": 3}
        ]
    },
    {
        "chapter": "Abdomen",
        "rubric_path": "Abdomen; Flatulence; obstructed; tympanitic distension; passing flatus amel.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "550"}],
        "mappings": [
            {"abbrev": "Carb-v", "grade": 4},
            {"abbrev": "Lyc", "grade": 3},
            {"abbrev": "Chin", "grade": 2}
        ]
    },
    {
        "chapter": "Abdomen",
        "rubric_path": "Abdomen; Pain; liver region; radiating to right inferior angle of scapula",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "572"}],
        "mappings": [
            {"abbrev": "Chel", "grade": 4},
            {"abbrev": "Bry", "grade": 2},
            {"abbrev": "Lyc", "grade": 2}
        ]
    },

    # 15. RECTUM
    {
        "chapter": "Rectum",
        "rubric_path": "Rectum; Constipation; stool recedes after being partially expelled",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "608"}],
        "mappings": [
            {"abbrev": "Sil", "grade": 4},
            {"abbrev": "Thuj", "grade": 2},
            {"abbrev": "Sanic", "grade": 2}
        ]
    },
    {
        "chapter": "Rectum",
        "rubric_path": "Rectum; Haemorrhoids; protruding; burning, intensely painful; amel. cold water",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "618"}],
        "mappings": [
            {"abbrev": "Aloe", "grade": 4},
            {"abbrev": "Rat", "grade": 2},
            {"abbrev": "Sulph", "grade": 2}
        ]
    },
    {
        "chapter": "Rectum",
        "rubric_path": "Rectum; Involuntary stool; flatus, on passing",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "614"}],
        "mappings": [
            {"abbrev": "Aloe", "grade": 4},
            {"abbrev": "Nat-m", "grade": 2},
            {"abbrev": "Oleand", "grade": 2}
        ]
    },

    # 16. STOOL
    {
        "chapter": "Stool",
        "rubric_path": "Stool; Hard, dry, knotty; like sheep dung or burnt balls",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "638"}],
        "mappings": [
            {"abbrev": "Bry", "grade": 3},
            {"abbrev": "Mag-m", "grade": 3},
            {"abbrev": "Nat-m", "grade": 2},
            {"abbrev": "Op", "grade": 2}
        ]
    },
    {
        "chapter": "Stool",
        "rubric_path": "Stool; Watery, gushing; copious, yellowish; early morning",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "642"}],
        "mappings": [
            {"abbrev": "Pod", "grade": 4},
            {"abbrev": "Sulph", "grade": 2},
            {"abbrev": "Aloe", "grade": 2}
        ]
    },
    {
        "chapter": "Stool",
        "rubric_path": "Stool; Bloody, mucus; tenesmus constant; never-get-done feeling",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "635"}],
        "mappings": [
            {"abbrev": "Merc-c", "grade": 4},
            {"abbrev": "Merc", "grade": 3},
            {"abbrev": "Canth", "grade": 2}
        ]
    },

    # 17. URINARY ORGANS
    {
        "chapter": "Urinary Organs",
        "rubric_path": "Urinary Organs; Urging; constant, ineffectual; drop by drop; burning scalding like fire",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "660"}],
        "mappings": [
            {"abbrev": "Canth", "grade": 4},
            {"abbrev": "Apis", "grade": 3},
            {"abbrev": "Merc-c", "grade": 2}
        ]
    },
    {
        "chapter": "Urinary Organs",
        "rubric_path": "Urinary Organs; Incontinence; involuntary; coughing, sneezing, walking, on",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "656"}],
        "mappings": [
            {"abbrev": "Caust", "grade": 4},
            {"abbrev": "Puls", "grade": 3},
            {"abbrev": "Nat-m", "grade": 2},
            {"abbrev": "Squil", "grade": 2}
        ]
    },
    {
        "chapter": "Urinary Organs",
        "rubric_path": "Urinary Organs; Retention of urine; postpartum or post-operative",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "658"}],
        "mappings": [
            {"abbrev": "Caust", "grade": 3},
            {"abbrev": "Arn", "grade": 3},
            {"abbrev": "Acon", "grade": 2}
        ]
    },
    {
        "chapter": "Urinary Organs",
        "rubric_path": "Urinary Organs; Enuresis; nocturnal; children, in; during first sleep",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "657"}],
        "mappings": [
            {"abbrev": "Sep", "grade": 3},
            {"abbrev": "Bell", "grade": 2},
            {"abbrev": "Caust", "grade": 2},
            {"abbrev": "Kreos", "grade": 2}
        ]
    },
    {
        "chapter": "Urinary Organs",
        "rubric_path": "Urinary Organs; Sediment; red sand, brick dust; in urine",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "690"}],
        "mappings": [
            {"abbrev": "Lyc", "grade": 4},
            {"abbrev": "Phos", "grade": 2},
            {"abbrev": "Sep", "grade": 2}
        ]
    },

    # 18. GENITALIA
    {
        "chapter": "Genitalia",
        "rubric_path": "Genitalia; Male; emissions, involuntary nocturnal; sexual debility, with",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "702"}],
        "mappings": [
            {"abbrev": "Ph-ac", "grade": 3},
            {"abbrev": "Agnus", "grade": 3},
            {"abbrev": "Gels", "grade": 2}
        ]
    },
    {
        "chapter": "Genitalia",
        "rubric_path": "Genitalia; Female; menses; dysmenorrhoea; labour-like pains; flow scanty, intermittent",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "726"}],
        "mappings": [
            {"abbrev": "Puls", "grade": 4},
            {"abbrev": "Sep", "grade": 3},
            {"abbrev": "Cham", "grade": 2},
            {"abbrev": "Mag-p", "grade": 2}
        ]
    },
    {
        "chapter": "Genitalia",
        "rubric_path": "Genitalia; Female; menses; profuse, bright red; early; accompanied by nausea or fainting",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "728"}],
        "mappings": [
            {"abbrev": "Ipec", "grade": 3},
            {"abbrev": "Bell", "grade": 3},
            {"abbrev": "Sabin", "grade": 2}
        ]
    },
    {
        "chapter": "Genitalia",
        "rubric_path": "Genitalia; Female; menses; suppressed, amenorrhoea; getting feet wet, from",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "732"}],
        "mappings": [
            {"abbrev": "Puls", "grade": 4},
            {"abbrev": "Dulc", "grade": 2},
            {"abbrev": "Acon", "grade": 2}
        ]
    },
    {
        "chapter": "Genitalia",
        "rubric_path": "Genitalia; Female; prolapse, bearing down sensation; must cross legs to prevent protrusion",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "742"}],
        "mappings": [
            {"abbrev": "Sep", "grade": 4},
            {"abbrev": "Lil-t", "grade": 3},
            {"abbrev": "Bell", "grade": 2}
        ]
    },

    # 19. LARYNX & TRACHEA
    {
        "chapter": "Larynx & Trachea",
        "rubric_path": "Larynx & Trachea; Hoarseness; public speakers and singers, in; chronic",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "750"}],
        "mappings": [
            {"abbrev": "Arg-n", "grade": 3},
            {"abbrev": "Phos", "grade": 3},
            {"abbrev": "Caust", "grade": 3}
        ]
    },
    {
        "chapter": "Larynx & Trachea",
        "rubric_path": "Larynx & Trachea; Croup; barking cough, whistling respiration; wakes suffocating at midnight",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "752"}],
        "mappings": [
            {"abbrev": "Spong", "grade": 4},
            {"abbrev": "Acon", "grade": 3},
            {"abbrev": "Hep", "grade": 3}
        ]
    },
    {
        "chapter": "Larynx & Trachea",
        "rubric_path": "Larynx & Trachea; Tickling; suprasternal fossa, in; exciting dry cough",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "756"}],
        "mappings": [
            {"abbrev": "Rumx", "grade": 4},
            {"abbrev": "Phos", "grade": 2},
            {"abbrev": "Bell", "grade": 2}
        ]
    },

    # 20. RESPIRATION
    {
        "chapter": "Respiration",
        "rubric_path": "Respiration; Asthmatic; midnight, after; 1 to 2 a.m.; sitting erect, amel.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "764"}],
        "mappings": [
            {"abbrev": "Ars", "grade": 4}
        ]
    },
    {
        "chapter": "Respiration",
        "rubric_path": "Respiration; Asthmatic; 2 to 4 a.m.; relieved by leaning forward with elbows on knees",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "765"}],
        "mappings": [
            {"abbrev": "Kali-c", "grade": 4}
        ]
    },
    {
        "chapter": "Respiration",
        "rubric_path": "Respiration; Dyspnoea; air hunger, desires fresh air; wants to be fanned rapidly",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "768"}],
        "mappings": [
            {"abbrev": "Carb-v", "grade": 4},
            {"abbrev": "Med", "grade": 2},
            {"abbrev": "Puls", "grade": 2}
        ]
    },
    {
        "chapter": "Respiration",
        "rubric_path": "Respiration; Oppression; chest, of; as if heavy weight upon sternum",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "772"}],
        "mappings": [
            {"abbrev": "Phos", "grade": 3},
            {"abbrev": "Bry", "grade": 2},
            {"abbrev": "Ferr", "grade": 2}
        ]
    },

    # 21. COUGH
    {
        "chapter": "Cough",
        "rubric_path": "Cough; Dry, barking; night, agg.; drinking cold water, agg.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "782"}],
        "mappings": [
            {"abbrev": "Acon", "grade": 3},
            {"abbrev": "Spong", "grade": 3},
            {"abbrev": "Bell", "grade": 2}
        ]
    },
    {
        "chapter": "Cough",
        "rubric_path": "Cough; Loose, rattling; chest full of mucus; cannot expectorate; drowsy",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "790"}],
        "mappings": [
            {"abbrev": "Ant-t", "grade": 4},
            {"abbrev": "Ipec", "grade": 3}
        ]
    },
    {
        "chapter": "Cough",
        "rubric_path": "Cough; Spasmodic, paroxysmal; ending in retching or vomiting of food",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "802"}],
        "mappings": [
            {"abbrev": "Ipec", "grade": 4},
            {"abbrev": "Dros", "grade": 3},
            {"abbrev": "Coc-c", "grade": 2}
        ]
    },
    {
        "chapter": "Cough",
        "rubric_path": "Cough; Whooping cough; paroxysms follow each other rapidly; worse after midnight",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "806"}],
        "mappings": [
            {"abbrev": "Dros", "grade": 4},
            {"abbrev": "Bell", "grade": 2},
            {"abbrev": "Cupr", "grade": 2}
        ]
    },
    {
        "chapter": "Cough",
        "rubric_path": "Cough; Dry, hacking; entering cold air from warm room, agg.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "786"}],
        "mappings": [
            {"abbrev": "Rumx", "grade": 4},
            {"abbrev": "Phos", "grade": 2},
            {"abbrev": "Bry", "grade": 2}
        ]
    },
    {
        "chapter": "Cough",
        "rubric_path": "Cough; Catarrhal; warm room, agg.; open air, amel.",
        "repertory_id": "boenninghausen_rep",
        "sources": [{"book": "Boenninghausen", "edition": "1846", "page": "110"}],
        "mappings": [
            {"abbrev": "Puls", "grade": 4},
            {"abbrev": "Bry", "grade": 2}
        ]
    },

    # 22. EXPECTORATION
    {
        "chapter": "Expectoration",
        "rubric_path": "Expectoration; Rusty, blood-streaked; tenaciously adhering to vessels",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "814"}],
        "mappings": [
            {"abbrev": "Phos", "grade": 4},
            {"abbrev": "Bry", "grade": 3}
        ]
    },
    {
        "chapter": "Expectoration",
        "rubric_path": "Expectoration; Tenacious, stringy, tough; can be drawn into long threads",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "816"}],
        "mappings": [
            {"abbrev": "Kali-bi", "grade": 4}
        ]
    },
    {
        "chapter": "Expectoration",
        "rubric_path": "Expectoration; Copious, purulent, thick yellowish-green; sweetish or salty taste",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "818"}],
        "mappings": [
            {"abbrev": "Puls", "grade": 3},
            {"abbrev": "Sil", "grade": 3},
            {"abbrev": "Phos", "grade": 2}
        ]
    },

    # 23. CHEST
    {
        "chapter": "Chest",
        "rubric_path": "Chest; Pain; stitching; inspiration, on; motion, agg.; lying on painful side, amel.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "834"}],
        "mappings": [
            {"abbrev": "Bry", "grade": 4}
        ]
    },
    {
        "chapter": "Chest",
        "rubric_path": "Chest; Oppression, burning heat; pneumonia hepatization; lung congestion",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "830"}],
        "mappings": [
            {"abbrev": "Phos", "grade": 4},
            {"abbrev": "Bry", "grade": 2},
            {"abbrev": "Sulph", "grade": 2}
        ]
    },
    {
        "chapter": "Chest",
        "rubric_path": "Chest; Constriction; sensation of iron band around heart",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "824"}],
        "mappings": [
            {"abbrev": "Cact", "grade": 4}
        ]
    },

    # 24. BACK
    {
        "chapter": "Back",
        "rubric_path": "Back; Stiffness; cervical region; torticollis; draught of cold air, after",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "890"}],
        "mappings": [
            {"abbrev": "Acon", "grade": 3},
            {"abbrev": "Rhus-t", "grade": 3},
            {"abbrev": "Lachn", "grade": 2}
        ]
    },
    {
        "chapter": "Back",
        "rubric_path": "Back; Pain; lumbar region; lumbago; rising from seat, on beginning motion, agg.; walking, amel.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "902"}],
        "mappings": [
            {"abbrev": "Rhus-t", "grade": 4},
            {"abbrev": "Kali-c", "grade": 2}
        ]
    },
    {
        "chapter": "Back",
        "rubric_path": "Back; Pain; sacral region; bearing down in pelvis, with; dragging sensation",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "910"}],
        "mappings": [
            {"abbrev": "Sep", "grade": 4},
            {"abbrev": "Lil-t", "grade": 2},
            {"abbrev": "Aes-h", "grade": 2}
        ]
    },
    {
        "chapter": "Back",
        "rubric_path": "Back; Pain; scapulae; between, burning sensation; as of a hot iron",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "896"}],
        "mappings": [
            {"abbrev": "Phos", "grade": 4},
            {"abbrev": "Sulph", "grade": 2}
        ]
    },

    # 25. EXTREMITIES
    {
        "chapter": "Extremities",
        "rubric_path": "Extremities; Coldness; feet; in bed at night; damp stockings feel as if on",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "964"}],
        "mappings": [
            {"abbrev": "Calc", "grade": 4},
            {"abbrev": "Sil", "grade": 3},
            {"abbrev": "Sep", "grade": 2}
        ]
    },
    {
        "chapter": "Extremities",
        "rubric_path": "Extremities; Restlessness; legs; cannot keep still in bed at night",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1056"}],
        "mappings": [
            {"abbrev": "Rhus-t", "grade": 4},
            {"abbrev": "Zinc", "grade": 4},
            {"abbrev": "Med", "grade": 2},
            {"abbrev": "Ars", "grade": 2}
        ]
    },
    {
        "chapter": "Extremities",
        "rubric_path": "Extremities; Trembling; hands; involuntary; weakness and exhaustion",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1070"}],
        "mappings": [
            {"abbrev": "Gels", "grade": 4},
            {"abbrev": "Zinc", "grade": 2},
            {"abbrev": "Merc", "grade": 2}
        ]
    },
    {
        "chapter": "Extremities",
        "rubric_path": "Extremities; Cramps; calves; night in bed; stretching limbs, on",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "968"}],
        "mappings": [
            {"abbrev": "Cupr", "grade": 4},
            {"abbrev": "Calc", "grade": 2},
            {"abbrev": "Cham", "grade": 2}
        ]
    },

    # 26. SLEEP
    {
        "chapter": "Sleep",
        "rubric_path": "Sleep; Sleeplessness; thoughts, from rush of; ideas crowding mind",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1250"}],
        "mappings": [
            {"abbrev": "Coff", "grade": 4},
            {"abbrev": "Nux-v", "grade": 3},
            {"abbrev": "Lyc", "grade": 2}
        ]
    },
    {
        "chapter": "Sleep",
        "rubric_path": "Sleep; Sleeplessness; waking at 3 a.m.; anxious thoughts preventing sleep",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1252"}],
        "mappings": [
            {"abbrev": "Nux-v", "grade": 4},
            {"abbrev": "Kali-c", "grade": 2}
        ]
    },
    {
        "chapter": "Sleep",
        "rubric_path": "Sleep; Starts; fright, in; falling asleep, on; jerking of limbs",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1248"}],
        "mappings": [
            {"abbrev": "Bell", "grade": 4},
            {"abbrev": "Ars", "grade": 3},
            {"abbrev": "Ign", "grade": 2}
        ]
    },
    {
        "chapter": "Sleep",
        "rubric_path": "Sleep; Dreams; frightful, nightmare; falling, robbers, ghosts",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1236"}],
        "mappings": [
            {"abbrev": "Bell", "grade": 3},
            {"abbrev": "Phos", "grade": 3},
            {"abbrev": "Sil", "grade": 2}
        ]
    },

    # 27. CHILL
    {
        "chapter": "Chill",
        "rubric_path": "Chill; Regular; 10 to 11 a.m.; beginning in feet or small of back",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1272"}],
        "mappings": [
            {"abbrev": "Nat-m", "grade": 4}
        ]
    },
    {
        "chapter": "Chill",
        "rubric_path": "Chill; Shaking; intense unquenchable thirst for cold water; warmth does not relieve",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1276"}],
        "mappings": [
            {"abbrev": "Acon", "grade": 3},
            {"abbrev": "Ign", "grade": 2},
            {"abbrev": "Nux-v", "grade": 2}
        ]
    },
    {
        "chapter": "Chill",
        "rubric_path": "Chill; Thirstless, during; desires external heat",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1278"}],
        "mappings": [
            {"abbrev": "Gels", "grade": 3},
            {"abbrev": "Apis", "grade": 3},
            {"abbrev": "Puls", "grade": 2}
        ]
    },

    # 28. FEVER
    {
        "chapter": "Fever",
        "rubric_path": "Fever; Heat; dry, burning; intense restlessness, anguish, fear of death",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1286"}],
        "mappings": [
            {"abbrev": "Acon", "grade": 4}
        ]
    },
    {
        "chapter": "Fever",
        "rubric_path": "Fever; Heat; burning; red face, dilated pupils, throbbing carotids",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1288"}],
        "mappings": [
            {"abbrev": "Bell", "grade": 4}
        ]
    },
    {
        "chapter": "Fever",
        "rubric_path": "Fever; Heat; flushes; ascending, vertex burning; followed by slight perspiration",
        "repertory_id": "boericke_rep",
        "sources": [{"book": "Boericke", "edition": "1927", "page": "528"}],
        "mappings": [
            {"abbrev": "Sulph", "grade": 4},
            {"abbrev": "Lach", "grade": 3}
        ]
    },

    # 29. PERSPIRATION
    {
        "chapter": "Perspiration",
        "rubric_path": "Perspiration; Profuse; head, on; sleeping, while; wetting pillow all around",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1298"}],
        "mappings": [
            {"abbrev": "Calc", "grade": 4},
            {"abbrev": "Sil", "grade": 3},
            {"abbrev": "Cham", "grade": 2}
        ]
    },
    {
        "chapter": "Perspiration",
        "rubric_path": "Perspiration; Profuse; night; debilitating; staining linen yellow",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1300"}],
        "mappings": [
            {"abbrev": "Thuj", "grade": 3},
            {"abbrev": "Merc", "grade": 3},
            {"abbrev": "Carbo-an", "grade": 2}
        ]
    },
    {
        "chapter": "Perspiration",
        "rubric_path": "Perspiration; Offensive; feet, on; excoriating toes; suppressed by cold",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1302"}],
        "mappings": [
            {"abbrev": "Sil", "grade": 4},
            {"abbrev": "Sulph", "grade": 2},
            {"abbrev": "Graph", "grade": 2}
        ]
    },
    {
        "chapter": "Perspiration",
        "rubric_path": "Perspiration; Relieving; all symptoms ameliorated by profuse perspiration",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1304"}],
        "mappings": [
            {"abbrev": "Nat-m", "grade": 3},
            {"abbrev": "Psor", "grade": 2},
            {"abbrev": "Gels", "grade": 2}
        ]
    },

    # 30. SKIN
    {
        "chapter": "Skin",
        "rubric_path": "Skin; Eruptions; eczema; behind ears, scalp, folds; sticky, honey-like viscous discharge",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1314"}],
        "mappings": [
            {"abbrev": "Graph", "grade": 4},
            {"abbrev": "Hep", "grade": 2},
            {"abbrev": "Mez", "grade": 2}
        ]
    },
    {
        "chapter": "Skin",
        "rubric_path": "Skin; Eruptions; urticaria, hives; burning, stinging pains; amel. cold bathing",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1328"}],
        "mappings": [
            {"abbrev": "Apis", "grade": 4},
            {"abbrev": "Urt-u", "grade": 3},
            {"abbrev": "Rhus-t", "grade": 2}
        ]
    },
    {
        "chapter": "Skin",
        "rubric_path": "Skin; Suppuration; unhealthy skin; every little scratch or injury festers and ulcerates",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1332"}],
        "mappings": [
            {"abbrev": "Hep", "grade": 4},
            {"abbrev": "Sil", "grade": 3},
            {"abbrev": "Merc", "grade": 2}
        ]
    },
    {
        "chapter": "Skin",
        "rubric_path": "Skin; Warts; fleshy, pedunculated, bleeding easily; condylomata",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1338"}],
        "mappings": [
            {"abbrev": "Thuj", "grade": 4},
            {"abbrev": "Nit-ac", "grade": 3},
            {"abbrev": "Caust", "grade": 2}
        ]
    },
    {
        "chapter": "Skin",
        "rubric_path": "Skin; Dry, cracked; hands and feet, winter agg.; rhagades deep and bleeding",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1318"}],
        "mappings": [
            {"abbrev": "Petr", "grade": 4},
            {"abbrev": "Graph", "grade": 3},
            {"abbrev": "Sulph", "grade": 2}
        ]
    },

    # 31. GENERALITIES
    {
        "chapter": "Generalities",
        "rubric_path": "Generalities; Cold, damp weather; agg.; working in cold water",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1350"}],
        "mappings": [
            {"abbrev": "Rhus-t", "grade": 4},
            {"abbrev": "Dulc", "grade": 3},
            {"abbrev": "Calc", "grade": 2},
            {"abbrev": "Nat-s", "grade": 2}
        ]
    },
    {
        "chapter": "Generalities",
        "rubric_path": "Generalities; Time; 4 to 8 p.m., agg.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1406"}],
        "mappings": [
            {"abbrev": "Lyc", "grade": 4},
            {"abbrev": "Hell", "grade": 2}
        ]
    },
    {
        "chapter": "Generalities",
        "rubric_path": "Generalities; Time; after midnight, 1 to 2 a.m., agg.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1407"}],
        "mappings": [
            {"abbrev": "Ars", "grade": 4}
        ]
    },
    {
        "chapter": "Generalities",
        "rubric_path": "Generalities; Time; 2 to 4 a.m., agg.",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1407"}],
        "mappings": [
            {"abbrev": "Kali-c", "grade": 4}
        ]
    },
    {
        "chapter": "Generalities",
        "rubric_path": "Generalities; Collapse; cold breath, cold skin; desires to be fanned rapidly",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1352"}],
        "mappings": [
            {"abbrev": "Carb-v", "grade": 4},
            {"abbrev": "Camph", "grade": 3},
            {"abbrev": "Verat", "grade": 2}
        ]
    },
    {
        "chapter": "Generalities",
        "rubric_path": "Generalities; Haemorrhages; bright red, profuse, active; with anxiety or nausea",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1368"}],
        "mappings": [
            {"abbrev": "Ipec", "grade": 3},
            {"abbrev": "Phos", "grade": 3},
            {"abbrev": "Bell", "grade": 2},
            {"abbrev": "Mill", "grade": 2}
        ]
    },
    {
        "chapter": "Generalities",
        "rubric_path": "Generalities; Open air; amel.; desires doors and windows open",
        "repertory_id": "kent_1897",
        "sources": [{"book": "Kent", "edition": "1897", "page": "1384"}],
        "mappings": [
            {"abbrev": "Puls", "grade": 4},
            {"abbrev": "Carb-v", "grade": 3},
            {"abbrev": "Apis", "grade": 3}
        ]
    }
]
