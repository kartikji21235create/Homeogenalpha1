# scripts/data/mm_data_allen_kent.py
# 34 Materia Medica monographs from Allen's Keynotes (1898) and Kent's Lectures (1905)
# All public domain sources

MATERIA_MEDICA_ALLEN_KENT = [
    {
        "id": "agn",
        "common_name": "Agnus Castus",
        "abbreviation": "Agn",
        "latin_name": "Vitex agnus-castus",
        "source_origin": "Vegetable Kingdom (Verbenaceae); tincture of ripe berries",
        "constitution": "Prematurely aged persons; old sinners with impotence. History of repeated gonorrhoea. Absent-minded, sad, low-spirited. Lymphatic constitutions.",
        "mind": "Extreme absent-mindedness; cannot recollect what he has just read. Sadness with impression of speedy death. Loss of courage; self-deprecation. Fear of death. Peevishness. Low-spirited, apprehensive of misfortune.",
        "head_and_senses": "Headache from abuse of alcohol or sexual excess. Tearing, pressive headache, mostly in temples and forehead. Itching of scalp. Pupils dilated.",
        "throat": "Metallic taste. Mouth and throat dry. Hardness of swallowing.",
        "gastrointestinal": "Nausea with sensation as if intestines were pressed downward. Want of appetite. Rumbling in bowels. Stools soft, thin, light colored. Flatus offensive.",
        "urinary_and_genital": "SEXUAL IMPOTENCE: relaxation of genitals with impotence. No erections; penis small, cold, relaxed. Desire gone or diminished. Gleety moisture from urethra. Sterility in women with suppressed menses. Leucorrhoea staining yellow. Agalactia.",
        "respiratory": "Dyspnoea; spleen seems swollen. Short breath on exertion.",
        "cardiovascular": "Palpitation; pulse slow and weak.",
        "locomotor": "Heaviness and lassitude of lower limbs. Swelling of ankles.",
        "sleep_and_fever": "Insomnia from sexual debility. Chill with internal heat.",
        "skin": "Corrosive itching; crawling and tingling on various parts. Figwarts on genitals.",
        "keynotes": [
            "Sexual impotence with complete loss of desire; penis small, cold, relaxed",
            "Prematurely aged persons; old sinners; history of repeated gonorrhoea",
            "Absent-mindedness; cannot remember what he has just read",
            "Agalactia; scanty milk after childbirth with sadness"
        ],
        "modalities": {
            "aggravation": "Sexual excess, motion, touch, warm room",
            "amelioration": "Open air, rest, pressing hard"
        },
        "relationships": {
            "complementary": ["Sel", "Lyc", "Sulph"],
            "antidotes": ["Camph", "Nat-m"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Agnus Castus", "text": "Allen notes: 'For the prematurely aged; old sinners; especially if the result of abuse of sexual powers. Relaxation of sexual organs with impotence. No erections; penis small, cold, relaxed.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Agnus Castus", "text": "Kent writes: 'Agnus castus is a remedy for the aged, for broken-down constitutions. It is especially useful in the results of sexual excesses. The mental state is one of sadness, with the impression of speedy death.'"}
        ]
    },
    {
        "id": "bar-c",
        "common_name": "Baryta Carbonica",
        "abbreviation": "Bar-c",
        "latin_name": "Barium carbonicum",
        "source_origin": "Mineral Kingdom; carbonate of barium",
        "constitution": "Dwarfish children who do not grow; backward mentally and physically. Childish old people; second childhood. Scrofulous constitutions with enlarged glands, especially tonsils.",
        "mind": "Childish behavior in old people; loss of memory, forgetful. Great mental and bodily weakness. Shy, timid, cowardly, hides behind furniture. Inattentive children who cannot learn. Confusion and loss of confidence. Fear of strangers.",
        "head_and_senses": "Vertigo of old people. Sensation as if brain falls from side to side. Heavy feeling in head. Baldness, especially on crown. Offensive foot-sweat causes baldness. Styes and tumors on eyelids.",
        "throat": "TONSILS ENLARGED; inflamed with every cold. Suppurating tonsils from every cold. Can only swallow liquids. Takes cold easily; throat affected first. Quinsy. Smarting pain in throat when swallowing.",
        "gastrointestinal": "Weakness of digestion in old people. Stomach feels as if food lay in a lump. Pain in stomach after eating, ameliorated by lying down. Children dislike fruits. Hard, knotty stools.",
        "urinary_and_genital": "Urging to urinate; cannot hold urine. Diminished sexual desire. Enlarged prostate in elderly men. Indurated testicles.",
        "respiratory": "Chronic cough of old people; cough from elongated uvula. Suffocative cough of aged, full of mucus but diminished power to expectorate.",
        "cardiovascular": "Palpitation when lying on left side. Aneurysm. Increased blood pressure. Fatty degeneration of heart.",
        "locomotor": "Heaviness of limbs; tension in knees. Fatty tumors. Paralytic weakness. Swollen glands in neck and groin.",
        "sleep_and_fever": "Sleeps on stomach. Talks in sleep. Senile insomnia. Chill predominates.",
        "skin": "Dry, rough skin. Warts. Eczema on face of old people. Tumors and cysts.",
        "keynotes": [
            "Dwarfish children, backward mentally and physically; do not grow",
            "Childish old people; second childhood; loss of memory",
            "Tonsils enlarged, suppurating with every cold",
            "Shy, timid, hides behind furniture; fear of strangers",
            "Takes cold easily; always affects the throat first"
        ],
        "modalities": {
            "aggravation": "Cold in every form; washing; lying on painful side; after eating; company of strangers",
            "amelioration": "Walking in open air; warm wraps"
        },
        "relationships": {
            "complementary": ["Dulc", "Sil", "Psor"],
            "antidotes": ["Ant-t", "Camph", "Bell"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Baryta Carbonica", "text": "Allen: 'Specially indicated in infancy and old age. Dwarfish physically and mentally. For scrofulous, dwarfish children who do not grow. Old people with childish behavior.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Baryta Carbonica", "text": "Kent: 'Baryta carb. is a remedy for children who are late in learning to talk, to walk, slow in everything. It is also for old people who become childish, have lost their memory, and are mentally and physically weak.'"}
        ]
    },
    {
        "id": "bar-m",
        "common_name": "Baryta Muriatica",
        "abbreviation": "Bar-m",
        "latin_name": "Barium muriaticum",
        "source_origin": "Mineral Kingdom; barium chloride",
        "constitution": "Scrofulous children and old people similar to Bar-c but with more glandular involvement. Arteriosclerosis in old age.",
        "mind": "Great anxiety and fear, especially in evening. Idiocy. Imbecility. Mental weakness with childish behavior. Want of self-confidence. Senile dementia.",
        "head_and_senses": "Vertigo with nausea. Noises in ears, buzzing and roaring. Deafness. Parotid glands enlarged.",
        "throat": "Tonsils enlarged and indurated. Chronic tonsillar hypertrophy. Difficulty swallowing solids.",
        "gastrointestinal": "Gastritis with pain after eating. Distension and flatulence. Pancreatitis. Enlarged mesenteric glands.",
        "urinary_and_genital": "Frequent urination at night. Enlarged prostate. Sterility.",
        "respiratory": "Bronchitis of old people. Asthmatic breathing with rattling mucus. Whooping cough.",
        "cardiovascular": "ARTERIOSCLEROSIS with high systolic and low diastolic blood pressure. Aneurysm. Cardiac symptoms of old age.",
        "locomotor": "Stiffness of joints. Glandular swellings along limbs. Weakness and trembling.",
        "sleep_and_fever": "Restless sleep. Night sweats. Hectic fever.",
        "skin": "Eczema, itching, dry eruptions. Indurated swellings. Warts.",
        "keynotes": [
            "Arteriosclerosis with high systolic and comparatively low diastolic pressure",
            "Acts on glandular structures more markedly than Baryta Carb",
            "Convulsions in children, with dentition; imbecility",
            "Pancreatitis; enlarged mesenteric glands"
        ],
        "modalities": {
            "aggravation": "Cold, damp weather; lying on painful side",
            "amelioration": "Warmth, dry weather"
        },
        "relationships": {
            "complementary": ["Con", "Dulc"],
            "antidotes": ["Bell", "Camph"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Baryta Muriatica", "text": "Allen: 'Acts on glandular structures more markedly than Baryta carb. Arteriosclerosis with high systolic and comparatively low diastolic pressure. Convulsions.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Baryta Muriatica", "text": "Kent: 'Baryta mur. has more convulsive tendency than Baryta carb. and acts more markedly upon the glandular system and the arterial walls.'"}
        ]
    },
    {
        "id": "benz-ac",
        "common_name": "Benzoic Acid",
        "abbreviation": "Benz-ac",
        "latin_name": "Acidum benzoicum",
        "source_origin": "Chemical compound; benzoic acid from gum benzoin",
        "constitution": "Gouty and rheumatic constitutions. Persons with uric acid diathesis. Useful when urine is highly offensive.",
        "mind": "Inclined to dwell on unpleasant things; depression. Disposition to feel angry. Anxiety while perspiring. Omits words in writing. Dullness; confusion.",
        "head_and_senses": "Rheumatic headache from drafts. Vertigo with tendency to fall sideways. Buzzing and roaring in ears. Cold sweat on forehead.",
        "throat": "Sensation of lump in throat. Angina with highly colored urine.",
        "gastrointestinal": "Diarrhea of children; stools white, very offensive. Watery stools with highly colored urine. Stomach ache with gagging.",
        "urinary_and_genital": "URINE DARK BROWN, HIGHLY OFFENSIVE — smells like horse urine. Excess of uric acid. Dribbling of urine in old men with enlarged prostate. Enuresis nocturna in children; urine smells strong. Urine hot, dark, offensive.",
        "respiratory": "Cough with expectoration of green mucus. Asthma with internal soreness of chest.",
        "cardiovascular": "Palpitation with rheumatic complaints. Irregular pulse.",
        "locomotor": "GOUTY NODES on joints. Cracking in joints. Rheumatic gout, alternating with urinary symptoms. Tearing and stitching in great toe. Ganglion on wrist.",
        "sleep_and_fever": "Awakes with palpitation. Chilliness, internal and external. Aromatic perspiration.",
        "skin": "Red spots on skin. Itching spots.",
        "keynotes": [
            "Urine dark brown, highly offensive — horse-like or intensely ammoniacal odor",
            "Gouty nodes on joints; alternation of cardiac/rheumatic/urinary symptoms",
            "Diarrhea of children; stools white, very offensive with highly colored urine",
            "Enuresis nocturna; strong-smelling urine soaking the bed"
        ],
        "modalities": {
            "aggravation": "Open air, uncovering, cold drafts, change of weather",
            "amelioration": "Warmth, dry heat"
        },
        "relationships": {
            "complementary": ["Cop", "Nit-ac"],
            "antidotes": ["Cop", "Colch"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Benzoic Acid", "text": "Allen: 'Urine of a very repulsive, ammoniacal odor. Enuresis nocturna; urine offensive, of a deep red color. Diarrhea of children; urine very offensive, of a strong, pungent smell.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Benzoicum Acidum", "text": "Kent: 'The urine is the most striking feature of Benzoic acid. It has a strong, ammoniacal, horse-like odor. It is offensive beyond description.'"}
        ]
    },
    {
        "id": "berb",
        "common_name": "Berberis Vulgaris",
        "abbreviation": "Berb",
        "latin_name": "Berberis vulgaris",
        "source_origin": "Vegetable Kingdom (Berberidaceae); tincture of bark of root",
        "constitution": "Persons with biliary or renal calculi tendency. Gouty and rheumatic diathesis with urinary complaints. Rapid change of symptoms — pains change in locality and character.",
        "mind": "Listless, apathetic, indifferent. Mental and physical exhaustion. Fear with chilliness. Difficulty thinking. Poor memory, especially for names.",
        "head_and_senses": "Vertigo with tendency to fall. Puffy feeling in head. Sensation of a tight cap on head. Sunken eyes with dark circles.",
        "throat": "Dryness; sticky sensation. Fauces dark red.",
        "gastrointestinal": "Bilious colic. Jaundice. Gallstone colic with stitching pains radiating. Stool clay-colored, burning. Fistula in ano with biliary symptoms.",
        "urinary_and_genital": "RENAL COLIC, shooting pains radiating from kidney to bladder and down thighs. Bubbling, sore sensation in kidneys. Urine with thick mucous sediment or bright red mealy sediment. Burning in urethra; in bladder even after urination.",
        "respiratory": "Stitching pains in chest. Short of breath with chest oppression.",
        "cardiovascular": "Palpitation with faintness. Pulse full and hard.",
        "locomotor": "RADIATING PAINS from one point — especially from lumbar region. Lumbago with soreness. Rheumatic pains in shoulders, arms, hands. Post-operative kidney pain.",
        "sleep_and_fever": "Restless sleep; wakes frequently. Night sweats.",
        "skin": "Itching and burning. Eczema of anus and hands. Pigmented skin patches.",
        "keynotes": [
            "Radiating pains from a single point; pains change in locality and character rapidly",
            "Renal colic: shooting, stitching pains from kidney to bladder and down thighs",
            "Bubbling, sore sensation in region of kidneys",
            "Biliary calculi with jaundice and clay-colored stools",
            "Urine with bright red, mealy sediment; thick mucous sediment"
        ],
        "modalities": {
            "aggravation": "Motion, jarring, standing, fatigue, urination",
            "amelioration": "Rest, lying down"
        },
        "relationships": {
            "complementary": ["Lyc", "Nat-s"],
            "antidotes": ["Camph", "Bell"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Berberis Vulgaris", "text": "Allen: 'The pains of Berberis radiate from one point, change in regard to place and character. Bubbling, sore, puffy sensation in region of kidneys. Renal colic, left side.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Berberis Vulgaris", "text": "Kent: 'Berberis is a remedy of wonderful radiating pains. The pains radiate from one point and change about. It has a bubbling sensation in the kidneys.'"}
        ]
    },
    {
        "id": "bism",
        "common_name": "Bismuthum",
        "abbreviation": "Bism",
        "latin_name": "Bismuthum subnitricum",
        "source_origin": "Mineral Kingdom; subnitrate of bismuth",
        "constitution": "Persons with gastric complaints; solitude is unbearable — must have company. Restlessness, anguish. Children who cling to mother's hand.",
        "mind": "Solitude is unbearable; must have company; child holds on to mother's hand. Anguish, restlessness. Moaning and complaining. Dissatisfied with everything.",
        "head_and_senses": "Headache alternating with gastric pain. Pressure on forehead extending to eyes. Boring pain in root of nose.",
        "throat": "White-coated tongue. Drinks taken in smallest quantity are vomited on reaching stomach.",
        "gastrointestinal": "GASTRITIS: vomiting of enormous quantities; water is vomited as soon as it reaches the stomach. Burning, cramping pain in stomach. Gastralgia with slow digestion. Pressure as from a load in one spot.",
        "urinary_and_genital": "Frequent urging. Renal colic, alternating with gastric symptoms.",
        "respiratory": "Difficult breathing; pinching in middle of diaphragm.",
        "cardiovascular": "Angina pectoris with burning, cramping pain, pressing behind sternum radiating to arms.",
        "locomotor": "Weariness in limbs. Paralytic pain in right arm.",
        "sleep_and_fever": "Restless sleep with vivid dreams. Cold extremities.",
        "skin": "Itching without eruption.",
        "keynotes": [
            "Solitude is unbearable; must have company; child clings to mother's hand",
            "Vomiting of enormous quantities; water vomited as soon as it reaches stomach",
            "Gastralgia: burning, cramping pain, pressure as from a load in one spot",
            "All symptoms appear in groups which alternate with each other"
        ],
        "modalities": {
            "aggravation": "Alone, eating, cold drinks",
            "amelioration": "Company, bending backward, cold bathing, motion"
        },
        "relationships": {
            "complementary": ["Calc", "Kreos"],
            "antidotes": ["Nux-v", "Caps", "Calc"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Bismuthum", "text": "Allen: 'Solitude is unbearable; craves company; child holds on to mother's hand for company. Vomiting of enormous quantities. Water is vomited as soon as it reaches the stomach.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Bismuthum", "text": "Kent: 'The peculiar mental state of Bismuth is that the patient is not able to stay alone. He must have company. The gastric symptoms are most striking; vomiting of enormous quantities.'"}
        ]
    },
    {
        "id": "bov",
        "common_name": "Bovista",
        "abbreviation": "Bov",
        "latin_name": "Bovista lycoperdon",
        "source_origin": "Fungus Kingdom (Lycoperdaceae); puffball fungus",
        "constitution": "Persons who are awkward, drop things. Old maids with palpitation. Sensitive to touch. Blunt instruments leave deep impression.",
        "mind": "Awkwardness, drops things. Misapplies words in speaking and writing. Cannot bear tight clothing. Sensitive, takes everything amiss. Absent-minded.",
        "head_and_senses": "Headache early morning on waking, with stitches in temples. Distortion of vision.",
        "throat": "Scraping in throat, as from a foreign body.",
        "gastrointestinal": "Colic after midnight; must bend double. Diarrhea before and during menses. Intolerance of tight clothing around waist.",
        "urinary_and_genital": "MENSES TOO EARLY AND TOO PROFUSE. Flow only at night or early morning. Diarrhea before and during menses. Leucorrhoea acrid, thick, tough, greenish; follows menses. Metrorrhagia between periods.",
        "respiratory": "Deep breathing; stitches in chest.",
        "cardiovascular": "Palpitation with vertigo; in old maids. Visible beating of carotids.",
        "locomotor": "Awkwardness; drops things from hands. Weakness and heaviness. Joints crack easily.",
        "sleep_and_fever": "Excessive perspiration in axillae. Chill in open air.",
        "skin": "Urticaria on excitement or bathing. Blunt instruments make deep impression on skin. Herpetic eruptions. Moist eczema.",
        "keynotes": [
            "Awkwardness: drops things, misapplies words in speaking and writing",
            "Menses flow only at night or early morning; too early and profuse",
            "Blunt instruments leave deep impression on skin (great sensitivity)",
            "Urticaria on excitement, on bathing, with rheumatic lameness",
            "Intolerance of tight clothing around waist"
        ],
        "modalities": {
            "aggravation": "Morning, hot weather, bathing, full moon, coffee",
            "amelioration": "Hot food, bending double"
        },
        "relationships": {
            "complementary": ["Calc", "Rhus-t"],
            "antidotes": ["Camph"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Bovista", "text": "Allen: 'Awkward; everything falls from hands. Deep impression made on skin by blunt instruments. Hemorrhage between periods. Menses flow only at night.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Bovista", "text": "Kent: 'Bovista is a remedy that produces great awkwardness, objects fall from the hands. The patient drops things. It has marked skin symptoms and menstrual disturbances.'"}
        ]
    },
    {
        "id": "brom",
        "common_name": "Bromium",
        "abbreviation": "Brom",
        "latin_name": "Bromum",
        "source_origin": "Chemical element; liquid bromine",
        "constitution": "Fair, light-haired persons with blue eyes, thin skin. Scrofulous children with enlarged glands, especially parotids. Aggravated by heat; better at sea.",
        "mind": "Great depression; fear of ghosts in evening. Desire to ride or travel. Sensation as if he would see something if he turned around. Illusion that strangers are looking at him.",
        "head_and_senses": "Vertigo with tendency to fall backward. Headache from suppressed catarrh. Fan-like motion of alae nasi.",
        "throat": "Membranous croup beginning in larynx and extending upward. Hoarseness. Sensation of cobweb in throat. Swollen parotid and submaxillary glands, stony hard.",
        "gastrointestinal": "Loud eructations. Pain in stomach after eating oysters. Hemorrhoids during menses.",
        "urinary_and_genital": "Swelling and induration of left ovary. Menses too early, too profuse. Loud emission of flatus from vagina.",
        "respiratory": "MEMBRANOUS CROUP: rattling of mucus, sawing respiration. Croup after measles. Asthma of sailors, better at sea. Spasmodic cough with rattling, raw, sore feeling in throat. Cold sensation when inspiring.",
        "cardiovascular": "Palpitation with nausea. Cardiac distress with dyspnoea.",
        "locomotor": "Hard swelling of glands. Stiff neck from glandular enlargement.",
        "sleep_and_fever": "Profuse night sweats. Worse from overheating.",
        "skin": "Boils on arms and face. Acne. Stony hard glandular swellings.",
        "keynotes": [
            "Membranous croup: begins in larynx, extends upward; sawing respiration",
            "Fair, light-haired persons with blue eyes; scrofulous glandular enlargements",
            "Fan-like motion of alae nasi (wings of nose) during respiratory distress",
            "Better at seashore; asthma of sailors better at sea",
            "Left-sided ovarian affections; stony hard glandular swellings"
        ],
        "modalities": {
            "aggravation": "Warm room, overheating, evening until midnight, dust, drafts",
            "amelioration": "At sea, motion, any exertion"
        },
        "relationships": {
            "complementary": ["Arg-n"],
            "antidotes": ["Am-c", "Camph", "Mag-c"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Bromium", "text": "Allen: 'Fan-like motion of alae nasi. Membranous and diphtheritic croup; membrane begins in larynx and extends upward. Stony hard swelling of glands, especially of lower jaw and throat.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Bromium", "text": "Kent: 'Bromium is suited to persons of a light complexion, blue eyes, and thin skin. It has great enlargement and hardness of glands. The croup symptoms are very important.'"}
        ]
    },
    {
        "id": "bufo",
        "common_name": "Bufo Rana",
        "abbreviation": "Bufo",
        "latin_name": "Bufo bufo",
        "source_origin": "Animal Kingdom; trituration of toad poison",
        "constitution": "Feeble-minded persons, idiots, epileptics. Prematurely senile. Low moral sense. Children who get angry when not understood.",
        "mind": "Feeble-minded; imbecility. Desire for solitude but dreads being alone. Angry when misunderstood. Propensity to bite. Howling, impatient. Longs for solitude to practise masturbation.",
        "head_and_senses": "Epileptic aura begins in face, spreading to limbs. Numbness of brain. Hot head.",
        "throat": "Stammering, stuttering speech. Biting the tongue. Cannot articulate.",
        "gastrointestinal": "Vomiting immediately after eating. Desire for sweet drinks. Watery, involuntary stools during sleep.",
        "urinary_and_genital": "Desire for solitude to practise masturbation. Impotence with desire. Blisters on genitals. Menses too early, too copious. Epilepsy at time of menses.",
        "respiratory": "Rattling in chest. Dyspnea. Cough after waking.",
        "cardiovascular": "Palpitation from least exertion. Pulse irregular.",
        "locomotor": "Numbness and tingling in fingers. Paralytic weakness. Tottering gait. Swelling of bones.",
        "sleep_and_fever": "Sleeps with hands under head. Sleep during perspiration. Convulsions during sleep.",
        "skin": "Large blisters; burning. Pemphigus. Bluish discoloration. Lymphangitis.",
        "keynotes": [
            "Epilepsy: aura begins in face, then spreads; worse during sleep, at menses",
            "Feeble-minded, imbecility; angry when misunderstood; desire for solitude",
            "Stammering, stuttering; biting the tongue; cannot articulate",
            "Desire for solitude to practise masturbation; low moral sense"
        ],
        "modalities": {
            "aggravation": "Warm room, during sleep, sexual excess, at menses, on waking",
            "amelioration": "Bathing, cold air, putting feet in hot water"
        },
        "relationships": {
            "complementary": ["Salam"],
            "antidotes": ["Lach", "Seneg"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Bufo Rana", "text": "Allen: 'Epilepsy: aura begins in face, with rushing sensation from solar plexus or uterus. Angry when misunderstood; imbecility. Desire for solitude to practise masturbation.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Bufo", "text": "Kent: 'Bufo is a remedy of low mentality. The patient is feeble-minded, idiotic. The epilepsy is striking; the aura begins in the face and spreads.'"}
        ]
    },
    {
        "id": "cadm-s",
        "common_name": "Cadmium Sulphuricum",
        "abbreviation": "Cadm-s",
        "latin_name": "Cadmium sulphuricum",
        "source_origin": "Mineral Kingdom; cadmium sulphate",
        "constitution": "Extreme prostration, exhaustion. Yellow fever, cholera, gastric ulcer. Very chilly. Face cold with cold perspiration.",
        "mind": "Extreme irritability. Horror of solitude and of work. Anxiety; fear of being alone. Stupor.",
        "head_and_senses": "Vertigo; room and bed seem to spin. Hammering in head. Temples throbbing. Blue circles around eyes.",
        "throat": "Salty taste. Difficult swallowing.",
        "gastrointestinal": "BLACK VOMIT; coffee-ground vomit. Nausea incessant, violent. Vomiting of a green, slimy fluid. Burning and cutting in stomach. Stomach so irritable that everything is ejected. Gastric ulcer.",
        "urinary_and_genital": "Frequent micturition; urine mixed with blood and pus.",
        "respiratory": "Difficult respiration. Chest constriction. Rattling breathing. Cough with gagging and vomiting.",
        "cardiovascular": "Palpitation with constriction. Pulse small, slow.",
        "locomotor": "Weariness, coldness of extremities. Numbness.",
        "sleep_and_fever": "Stuporous sleep. Chilliness with cold sweat. Yellow fever symptoms.",
        "skin": "Yellow discoloration. Vitiligo. Blue spots on skin. Itching at night.",
        "keynotes": [
            "Black or coffee-ground vomit; incessant, violent nausea not relieved by vomiting",
            "Extreme prostration; chilly, with cold perspiration; nearly moribund",
            "Gastric ulcer; stomach so irritable that everything is ejected",
            "Yellow fever; cholera with intense prostration and black vomit"
        ],
        "modalities": {
            "aggravation": "Walking, carrying burdens, acids, alcohol, open air, morning",
            "amelioration": "Eating, rest, pressure"
        },
        "relationships": {
            "complementary": ["Carb-v", "Lob"],
            "antidotes": ["Zinc"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Cadmium Sulphuricum", "text": "Allen: 'Black vomit. Incessant nausea; violent retching. Stomach so irritable that everything is ejected. Deathly nausea.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Cadmium Sulph.", "text": "Kent: 'Cadmium sulph. is a remedy of extreme prostration with vomiting of black or coffee-ground material, like the vomit of yellow fever.'"}
        ]
    },
    {
        "id": "calad",
        "common_name": "Caladium Seguinum",
        "abbreviation": "Calad",
        "latin_name": "Caladium seguinum",
        "source_origin": "Vegetable Kingdom (Araceae); American arum",
        "constitution": "Persons addicted to tobacco. Sexual weakness with mental depression. Very sensitive to noise.",
        "mind": "Forgetful, absent-minded. Very sensitive to noise. Fear of cutting himself. Dread of motion. Nervous agitation.",
        "head_and_senses": "Headache from tobacco smoke. Flies seem to swarm about head. Sensation as if ear were closed.",
        "throat": "Dryness of mouth and throat without thirst. Sweet taste.",
        "gastrointestinal": "Sighing during sleep. Craving for warm drinks. Gnawing in stomach. Acidity.",
        "urinary_and_genital": "SEXUAL IMPOTENCE with mental depression. Erections when half asleep, cease when fully awake. Emissions without dreams. Pruritus vulvae with voluptuous itching driving to masturbation. Organs seem enlarged and relaxed.",
        "respiratory": "Larynx seems constricted. Asthma alternating with itch.",
        "cardiovascular": "Sighing respiration during sleep. Palpitation.",
        "locomotor": "Great weakness. Cramps in soles.",
        "sleep_and_fever": "Groaning and moaning during sleep. Falls asleep during evening fever. Sweat attracts flies.",
        "skin": "Insect bites burn intensely. Sweet sweat attracts flies. Pruritus.",
        "keynotes": [
            "Impotence: erections when half asleep, cease when fully awake; with mental depression",
            "Pruritus vulvae with voluptuous itching driving to onanism",
            "Sweat attracts flies; insect bites burn intensely",
            "Desire to lie down with aversion to motion; tobacco habit",
            "Asthma alternating with itching rash"
        ],
        "modalities": {
            "aggravation": "Motion, tobacco, insects",
            "amelioration": "Rest, sweat, short sleep"
        },
        "relationships": {
            "complementary": ["Nit-ac"],
            "antidotes": ["Carbn-s", "Ign", "Merc"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Caladium Seguinum", "text": "Allen: 'Impotence; relaxation of penis during excitement. Erections when half asleep; cease when fully awake. Pruritus vaginae inducing onanism. Sweat attracts flies.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Caladium", "text": "Kent: 'Caladium is a remedy of sexual weakness. Erections come during partial sleep and go away when fully awake. The sweat attracts the flies.'"}
        ]
    },
    {
        "id": "calc-f",
        "common_name": "Calcarea Fluorica",
        "abbreviation": "Calc-f",
        "latin_name": "Calcium fluoratum",
        "source_origin": "Mineral Kingdom; calcium fluoride (Schuessler tissue salt)",
        "constitution": "Hard, stony glands. Bony exostoses. Varicose veins. Tissue remedy for elastic fibers, connective tissue, and bone surfaces.",
        "mind": "Indecision; fear of poverty. Fluctuating moods. Anxiety about financial matters. Groundless fears.",
        "head_and_senses": "Bony growths on skull. Hard nodules on scalp. Cataract. Flickering and sparks before eyes. Calcareous deposits on cornea.",
        "throat": "Enlarged and indurated tonsils with plugs of mucus. Relaxed and elongated uvula. Tickling in throat.",
        "gastrointestinal": "Hiccough. Flatulence. Diarrhea in infants. Nausea. Indurated liver.",
        "urinary_and_genital": "Dragging in uterine region. Flooding. Hard nodules in mammae. Uterine fibroids.",
        "respiratory": "Croup. Hoarseness after reading aloud. Cough with tickling. Spasmodic cough.",
        "cardiovascular": "Dilated blood vessels; varicose veins and hemorrhoids. Chief remedy for vascular tumors with enlarged veins.",
        "locomotor": "BONY EXOSTOSES; hard growths on bones. Chronic lumbago, better from continued motion, worse beginning motion. Gouty enlargement of finger joints.",
        "sleep_and_fever": "Vivid dreams. Unrefreshed sleep.",
        "skin": "Fissures and cracks, especially in palms. Hard, elevated edges of ulcers. Chaps. Suppuration with callous, hard edges.",
        "keynotes": [
            "Hard, stony glands; bony exostoses; calcareous deposits",
            "Varicose veins; hemorrhoids; chief remedy for vascular tumors",
            "Fissures and cracks, especially in palms; hard-edged ulcers",
            "Chronic lumbago worse on beginning motion, better from continued motion",
            "Tissue salt for elastic fibers, connective tissue, and periosteum"
        ],
        "modalities": {
            "aggravation": "Rest, beginning of motion, cold, damp weather, drafts, sprains",
            "amelioration": "Heat, warm applications, continued motion, rubbing"
        },
        "relationships": {
            "complementary": ["Calc", "Calc-p", "Sil", "Nat-m"],
            "antidotes": []
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Calcarea Fluorica", "text": "Allen: 'Chief remedy for hard, stony glands. Bony exostoses on surface of bones. Varicose and enlarged veins. Fissures of the anus or palms of hands.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Calcarea Fluorica", "text": "Kent: 'Calcarea fluorica is the tissue remedy for hardened glands, varicose veins, bony growths, and fissured, cracked skin with hard edges.'"}
        ]
    },
    {
        "id": "calc-s",
        "common_name": "Calcarea Sulphurica",
        "abbreviation": "Calc-s",
        "latin_name": "Calcium sulphuricum",
        "source_origin": "Mineral Kingdom; calcium sulphate, plaster of Paris (Schuessler tissue salt)",
        "constitution": "Suppurative processes that do not heal. Discharges thick, lumpy, yellow. Last stage of suppuration when discharge has found an outlet.",
        "mind": "Irritable. Desire for exciting things. Jealousy.",
        "head_and_senses": "Scald-head of children, thick, yellow crusts. Pimples on scalp. Eye discharge thick, yellow.",
        "throat": "Last stages of cold with thick, lumpy, yellow mucous discharge. Diphtheria.",
        "gastrointestinal": "Desire for fruit and green vegetables. Liver abscess. Diarrhea with pus-like discharge.",
        "urinary_and_genital": "Pus in urine. Abscess near genitals. Yellow, thick leucorrhoea.",
        "respiratory": "Cough with purulent, thick, lumpy expectoration. Abscess of lung. Empyema. Last stage of pneumonia.",
        "cardiovascular": "Palpitation with oppression of chest.",
        "locomotor": "Burning in soles. Abscess of joints. Suppurating wounds that won't heal.",
        "sleep_and_fever": "Night sweats with suppuration. Hectic fever.",
        "skin": "SUPPURATING WOUNDS that won't heal; yellow pus discharge. Cuts, wounds that do not heal rapidly. Boils, abscesses, ulcers with thick yellow pus. Burns and scalds.",
        "keynotes": [
            "Suppurative processes: thick, lumpy, yellow pus; wound won't heal when discharge has found an outlet",
            "Supplements Hepar when suppuration will not cease",
            "Yellow, thick, purulent discharges from any mucous membrane",
            "Burns and scalds that suppurate; neglected wounds"
        ],
        "modalities": {
            "aggravation": "Wet, cold, washing, bathing, after midnight, drafts",
            "amelioration": "Open air, warmth, dry weather, eating"
        },
        "relationships": {
            "complementary": ["Hep", "Sil"],
            "antidotes": []
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Calcarea Sulphurica", "text": "Allen: 'Supplements Hepar in suppurative processes. Where Hep begins the work, Calc-s takes it up and completes it. Thick, lumpy, yellow discharge from any mucous surface.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Calcarea Sulphurica", "text": "Kent: 'Calcarea sulphurica is a remedy for suppuration. It is used when suppuration has found an outlet and does not cease. It follows Hepar sulph.'"}
        ]
    },
    {
        "id": "cann-i",
        "common_name": "Cannabis Indica",
        "abbreviation": "Cann-i",
        "latin_name": "Cannabis indica",
        "source_origin": "Vegetable Kingdom (Cannabaceae); tincture of tops of female plant",
        "constitution": "Persons with exaggerated mental symptoms; delirium. Perception of time and space distorted. Cannabis users.",
        "mind": "EXAGGERATED TIME PERCEPTION: minutes seem hours, distances seem vast. Excessive loquacity and laughing. Delirium with great mental exaltation. Theorizing; full of ideas; constant change of subject. Forgets what he was about to say. Fear of becoming insane.",
        "head_and_senses": "Head feels as though opening and shutting. Throbbing pain in vertex. Shocks through brain. Involuntary shaking of head.",
        "throat": "Dryness of mouth and throat. Inability to swallow, choking on trying.",
        "gastrointestinal": "Excessive appetite. Flatulence with rumbling. Sensation in anus as if sitting on a ball.",
        "urinary_and_genital": "Urethritis. Burning during urination. Sensation of incomplete urination. Sexual excitement. Backache after sexual excess.",
        "respiratory": "Oppression of breathing with desire to take deep breath. Suffocation on lying down.",
        "cardiovascular": "Palpitation. Pulse slow. Stitching pains in heart.",
        "locomotor": "Numbness in limbs; crawling sensation. Pain in right shoulder extending to arm.",
        "sleep_and_fever": "Cannot control sleep; starts and wakes frequently. Dreams prophetic. Very sleepy but cannot sleep.",
        "skin": "Itching without eruption.",
        "keynotes": [
            "Exaggerated perception of time and space: minutes seem hours, distances vast",
            "Excessive loquacity; laughing; theorizing; constant change of subject",
            "Sensation in anus as if sitting on a ball",
            "Forgets what he was about to say; begins sentence, then forgets it",
            "Fear of becoming insane; delirium with great exaltation"
        ],
        "modalities": {
            "aggravation": "Morning, coffee, liquor, tobacco, dark room, urinating",
            "amelioration": "Fresh air, cold water, rest"
        },
        "relationships": {
            "complementary": ["Bell", "Hyos"],
            "antidotes": ["Camph", "Lemon juice"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Cannabis Indica", "text": "Allen: 'Very forgetful; begins a sentence but cannot finish it. Time and space seem extended. A few seconds seem ages, a short distance an immense distance.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Cannabis Indica", "text": "Kent: 'Cannabis indica produces a delirium of exaltation. Time and space are both exaggerated. He imagines that minutes are hours.'"}
        ]
    },
    {
        "id": "cann-s",
        "common_name": "Cannabis Sativa",
        "abbreviation": "Cann-s",
        "latin_name": "Cannabis sativa",
        "source_origin": "Vegetable Kingdom (Cannabaceae); tincture of flowering tops",
        "constitution": "Urethral and sexual complaints predominate over mental symptoms (unlike Cannabis Indica).",
        "mind": "Fixed ideas. Absent-mindedness. Feels as if in a dream. Sudden loss of thoughts.",
        "head_and_senses": "Headache as if boiling water poured on head. Pressure on root of nose. Opacity of cornea.",
        "throat": "Dry, sticky sensation in throat.",
        "gastrointestinal": "Hiccough. Pain in liver region.",
        "urinary_and_genital": "GONORRHOEA: burning during urination; urethra inflamed, swollen, painful. Dragging in testicles. Sensation of narrowing of urethra. Urethral discharge purulent. Zigzag pain along urethra.",
        "respiratory": "Oppression of breathing. Rattling in chest.",
        "cardiovascular": "Palpitation; pulse slow and weak.",
        "locomotor": "Contraction of fingers after fractures. Dislocation of patella on going upstairs.",
        "sleep_and_fever": "Sleepy, drowsy. Chilliness of back.",
        "skin": "Dry, parchment-like. Pemphigus.",
        "keynotes": [
            "Gonorrhoea: burning, biting pain along urethra during urination; zigzag pain",
            "Urethral discharge purulent; urethra swollen and inflamed",
            "Sensation of narrowing of urethra; retention of urine",
            "Dislocation of patella on going upstairs"
        ],
        "modalities": {
            "aggravation": "Urination, touch, walking, lying down at night",
            "amelioration": "Rest, fresh air"
        },
        "relationships": {
            "complementary": ["Canth"],
            "antidotes": ["Camph", "Merc"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Cannabis Sativa", "text": "Allen: 'Gonorrhoea; burning while urinating; urethra very sensitive to touch. Zigzag pain along urethra. Urethral discharge yellowish, purulent.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Cannabis Sativa", "text": "Kent: 'Cannabis sativa differs from Cannabis indica in its marked action on the urinary organs. The urethral symptoms predominate.'"}
        ]
    },
    {
        "id": "caps",
        "common_name": "Capsicum",
        "abbreviation": "Caps",
        "latin_name": "Capsicum annuum",
        "source_origin": "Vegetable Kingdom (Solanaceae); cayenne pepper",
        "constitution": "Fat, flabby, unclean persons. Homesickness. Persons of lax fiber with cold, red cheeks. Children who are clumsy. Want of reaction.",
        "mind": "HOMESICKNESS with red cheeks and sleeplessness. Peevish, obstinate, easily offended. Clumsy children. Delirium tremens. Nostalgia, wants to go home.",
        "head_and_senses": "Headache as if brain would burst on coughing. Mastoid process very tender, painful to touch. Chronic otitis media.",
        "throat": "Sore, dark-red, constricted; burning and smarting. Pain extends to ears on swallowing. Inflamed throat of smokers and drinkers. Subacute inflammation of Eustachian tube.",
        "gastrointestinal": "Burning, smarting in mouth and throat. Desire for stimulants. Thirst after every stool. Flatulence. Hemorrhoids that burn and bleed.",
        "urinary_and_genital": "Strangury; frequent ineffectual urging. Tenesmus of bladder.",
        "respiratory": "Cough explosive, causing headache as if head would fly to pieces. Pain in distant parts on coughing — bladder, knees, ears. Breath smells fetid.",
        "cardiovascular": "Palpitation with redness of face.",
        "locomotor": "Stiffness and contraction of limbs. Pain in hips, sacrum, extending down thigh.",
        "sleep_and_fever": "Chill begins in back; wants to be covered but covering does not help. Shivering after every drink. Thirst with chilliness.",
        "skin": "Red, hot. Urticaria. Burning of skin.",
        "keynotes": [
            "Homesickness with red cheeks, sleeplessness, and hot feeling in throat",
            "Fat, flabby persons with lax fiber; lazy, averse to exercise; unclean",
            "Mastoiditis; chronic otitis media; pain in ear with every cough",
            "Explosive cough causing pain in distant parts (bladder, knees, ears, head)",
            "Chill begins in back; shivering after every drink; wants covering but it doesn't relieve"
        ],
        "modalities": {
            "aggravation": "Open air, uncovering, drafts, bathing, after eating and drinking, evening",
            "amelioration": "Continued motion, while eating, warmth"
        },
        "relationships": {
            "complementary": ["Nat-m"],
            "antidotes": ["Calad", "Camph", "Chin"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Capsicum", "text": "Allen: 'Homesickness, with red cheeks and sleeplessness. Fat, flabby, unclean persons who dread the open air. Chill begins in back, spreading all over.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Capsicum", "text": "Kent: 'Capsicum is suited to fat, flabby, red-faced persons, averse to exercise, to work, to going outside of their routine. Homesickness is the most striking mental symptom.'"}
        ]
    },
    {
        "id": "carb-an",
        "common_name": "Carbo Animalis",
        "abbreviation": "Carb-an",
        "latin_name": "Carbo animalis",
        "source_origin": "Animal Kingdom; animal charcoal from ox-hide leather",
        "constitution": "Elderly persons with venous stasis. Broken-down constitutions. Cancer. Glands indurated after contusions. Blue color of skin.",
        "mind": "Desire to be alone; avoids conversation. Homesickness. Easily frightened. Sad, reflective. Hearing voices at night.",
        "head_and_senses": "Headache as if head had been blown to pieces. Vertigo. Sensation as if something lay above eyes pressing them down.",
        "throat": "Copper-colored eruptions. Sore throat of speakers.",
        "gastrointestinal": "Weak digestion; food distresses. Desire for salt. Burning in stomach. Flatus offensive, hot. Indurated glands of abdomen.",
        "urinary_and_genital": "Indurated cervix. Cancer of uterus with burning, tearing pains. Lochia thin, offensive. Dark, offensive menses. Menses followed by great exhaustion. Mammae hard, painful.",
        "respiratory": "Cough with green, offensive expectoration. Pleurisy with indurated exudation. Sensation of coldness in chest.",
        "cardiovascular": "Cyanosis; venous stasis. Blue color of body in general.",
        "locomotor": "Weak ankles in children. Joints feel as if strained. Burning in coccyx.",
        "sleep_and_fever": "Unrefreshing sleep. Night sweats, offensive. Exhaustion from nursing sick.",
        "skin": "Copper-colored eruptions. Acne rosacea. Easily suppurating ulcers. Bluish discoloration.",
        "keynotes": [
            "Glands indurated: hard, stony; especially after contusions or injuries to glands",
            "Venous stasis; blue color of skin; broken-down constitutions",
            "Cancer of uterus, mammae — burning, tearing pains; indurated cervix",
            "Desire to be alone; hearing imaginary voices at night",
            "Menses flow only in morning; followed by great exhaustion"
        ],
        "modalities": {
            "aggravation": "Night, cold, after shaving, during menses, slight causes",
            "amelioration": "Warmth, rubbing, rest"
        },
        "relationships": {
            "complementary": ["Calc-p"],
            "antidotes": ["Ars", "Nux-v", "Vinegar"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Carbo Animalis", "text": "Allen: 'Glands indurated, stony hard, following contusions, especially mammae and uterus. Blue color of body. Weak, broken down constitutions, with venous engorgement.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Carbo Animalis", "text": "Kent: 'Carbo animalis is a remedy of great sluggishness of circulation. The veins are engorged. It is a cancer remedy when the glands become indurated and stony hard.'"}
        ]
    },
    {
        "id": "carbn-s",
        "common_name": "Carboneum Sulphuratum",
        "abbreviation": "Carbn-s",
        "latin_name": "Carboneum sulphuratum",
        "source_origin": "Chemical compound; carbon disulphide (bisulphide of carbon)",
        "constitution": "Chronic effects of alcohol. Peripheral nerve damage. Neuritis. Vision disturbances from toxic exposures.",
        "mind": "Irritability and mental confusion. Vertigo with nausea. Loss of will power. Hallucinations of sight. Poor memory. Stupor.",
        "head_and_senses": "OPTIC NEURITIS: impaired vision, central scotoma. Colors appear faded. Myopia. Headache from overuse of eyes. Ringing in ears. Diminished hearing.",
        "throat": "Metallic taste. Dryness.",
        "gastrointestinal": "Hiccough, eructations. Chronic gastritis with vomiting. Atonic dyspepsia. Pain in liver region.",
        "urinary_and_genital": "Decreased sexual power. Amenorrhoea.",
        "respiratory": "Difficult breathing. Chronic bronchitis.",
        "cardiovascular": "Cardiac weakness with dyspnoea. Arteriosclerosis. Fatty heart.",
        "locomotor": "PERIPHERAL NEURITIS with anaesthesia, numbness, tingling. Cramps in calves. Paralysis of extensors. Wrist drop. Tottering gait.",
        "sleep_and_fever": "Deep, heavy, stupid sleep. Disturbed by frightful dreams.",
        "skin": "Anaesthesia of skin. Vesicular eruptions. Dry, scaly skin.",
        "keynotes": [
            "Peripheral neuritis: numbness, anaesthesia, tingling, wrist drop, paralysis of extensors",
            "Optic neuritis: central scotoma, colors faded, impaired vision",
            "Chronic effects of alcohol; toxic neuritis",
            "Tottering gait; cramps in calves; loss of sensation"
        ],
        "modalities": {
            "aggravation": "Exertion, alcohol, stimulants, overuse of eyes",
            "amelioration": "Open air, rest"
        },
        "relationships": {
            "complementary": ["Nux-v"],
            "antidotes": ["Acon"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Carboneum Sulphuratum", "text": "Allen: 'Useful in chronic alcoholism. Peripheral neuritis with anaesthesia. Impaired vision from optic neuritis; central scotoma.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Carboneum Sulphuratum", "text": "Kent: 'Carboneum sulph. produces a marked effect on the nervous system, especially the peripheral nerves. Neuritis with numbness and anaesthesia.'"}
        ]
    },
    {
        "id": "caul",
        "common_name": "Caulophyllum",
        "abbreviation": "Caul",
        "latin_name": "Caulophyllum thalictroides",
        "source_origin": "Vegetable Kingdom (Berberidaceae); Blue Cohosh; tincture of root",
        "constitution": "Women with uterine complaints. Spasmodic and paretic conditions of uterus. Rheumatic diathesis affecting small joints.",
        "mind": "Fretful, apprehensive, nervous. Excitable; hysterical. Fear of delivery.",
        "head_and_senses": "Headache from uterine trouble.",
        "throat": "Dryness of throat.",
        "gastrointestinal": "Nausea and vomiting during pregnancy. Spasmodic pains in stomach.",
        "urinary_and_genital": "FALSE LABOR PAINS: spasmodic, fly all over; short, irregular, ineffectual. Rigid os that will not dilate. Habitual abortion from uterine weakness. After-pains. Leucorrhoea profuse, acrid. Bearing-down pains. Needle-like pains in cervix. Menses profuse, passive hemorrhage.",
        "respiratory": "Difficult breathing; spasmodic.",
        "cardiovascular": "Feeble pulse. Palpitation.",
        "locomotor": "RHEUMATIC PAINS in small joints: fingers, toes, wrists, ankles. Stiffness of small joints. Erratic pains changing every few minutes. Drawing pains in joints.",
        "sleep_and_fever": "Sleeplessness from uterine irritability. Chills alternating with heat.",
        "skin": "Moth spots on forehead. Blisters on fingers and toes.",
        "keynotes": [
            "False labor pains: spasmodic, irregular, fly all over; cease when regular pains should begin",
            "Rigid os in labor that will not dilate; spasmodic dysmenorrhoea",
            "Habitual abortion from uterine atony and debility",
            "Rheumatic pains in small joints: fingers, toes, wrists, ankles",
            "After-pains too severe; needle-like pains in cervix"
        ],
        "modalities": {
            "aggravation": "Pregnancy, suppressed menses, coffee, evening, open air",
            "amelioration": "Warmth"
        },
        "relationships": {
            "complementary": ["Cimic", "Puls", "Sec"],
            "antidotes": []
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Caulophyllum", "text": "Allen: 'False labor pains, or extremely severe spasmodic pains flying all over the abdomen, not expulsive. Rigid os. Habitual abortion from uterine debility.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Caulophyllum", "text": "Kent: 'Caulophyllum is especially useful in women with uterine atony; the pains are spasmodic and irregular. It is a great remedy for rigid os in labor.'"}
        ]
    },
    {
        "id": "chin-s",
        "common_name": "Chininum Sulphuricum",
        "abbreviation": "Chin-s",
        "latin_name": "Chininum sulphuricum",
        "source_origin": "Chemical compound; quinine sulphate",
        "constitution": "Malarial and periodic conditions. Ringing in ears. Persons debilitated by malarial fevers.",
        "mind": "Despondent, gloomy. Inclination to weep. Inability to think. Fear of dogs and animals.",
        "head_and_senses": "Vertigo with ringing in ears. Violent neuralgia of left side of head, recurring periodically. Orbital neuralgia worse left side.",
        "throat": "Difficult swallowing.",
        "gastrointestinal": "Acute gastric catarrh. Hiccough. Vomiting of bile. Enlarged spleen from malaria.",
        "urinary_and_genital": "Profuse uterine hemorrhages. Excessive menstruation.",
        "respiratory": "Difficult breathing; suffocating sensation.",
        "cardiovascular": "Palpitation with feeling of sinking. Cardiac weakness.",
        "locomotor": "Great weakness and prostration. Pain in spine and limbs. Acute articular rheumatism.",
        "sleep_and_fever": "INTERMITTENT FEVER with marked periodicity. Chill at 3 PM. Anticipating type. Profuse sweat without relief. Malarial fever returning periodically.",
        "skin": "Urticaria. Rash. Itching.",
        "keynotes": [
            "Intermittent fever with marked periodicity; malarial conditions",
            "Ringing in ears (tinnitus); deafness from quinine abuse",
            "Periodical neuralgia of left side of head; orbital neuralgia recurring at regular intervals",
            "Spleen enlarged from malaria; liver enlarged; debility after fever"
        ],
        "modalities": {
            "aggravation": "Periodically, touch, jar, 3 PM, cold air",
            "amelioration": "Warmth, pressure, rest"
        },
        "relationships": {
            "complementary": ["Ferr", "Arn"],
            "antidotes": ["Arn", "Puls"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Chininum Sulphuricum", "text": "Allen: 'Intermittent fever with marked periodicity; anticipating type. Ringing in ears, with deafness; a quinism symptom.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Chininum Sulph.", "text": "Kent: 'Chininum sulph. is used in periodic complaints, especially intermittent fever of malarial origin with marked regularity of paroxysms.'"}
        ]
    },
    {
        "id": "cic",
        "common_name": "Cicuta Virosa",
        "abbreviation": "Cic",
        "latin_name": "Cicuta virosa",
        "source_origin": "Vegetable Kingdom (Umbelliferae); water hemlock; tincture of fresh root",
        "constitution": "Convulsive conditions. Epilepsy. Effects of concussion, falls, injuries to head. Pustular eruptions.",
        "mind": "Confounds present with past. Mistrusts people. Childish behavior; sings, dances, laughs immoderately. Moaning and howling. Violent frenzy. Everything appears strange and terrible.",
        "head_and_senses": "Head turned or twisted to one side during convulsions. Objects appear double, moving, black. Strabismus from brain affections.",
        "throat": "Spasmodic constriction of throat and esophagus. Cannot swallow; food and drink roll audibly into stomach.",
        "gastrointestinal": "Hiccough with crying. Desire for chalk, coal, indigestible things. Distension of abdomen after eating.",
        "urinary_and_genital": "Involuntary urination during convulsions.",
        "respiratory": "Chest feels tight. Tonic spasm of pectoral muscles.",
        "cardiovascular": "Pulse slow, hard, full. Palpitation.",
        "locomotor": "OPISTHOTONOS; body bent backward. Spasmodic jerking of limbs. Spasms renewed by touch. Cataleptic rigidity.",
        "sleep_and_fever": "Disturbed sleep with jerking. Moaning in sleep.",
        "skin": "Pustular eruptions that form thick, yellow scabs. Eczema, no itching. Elevated, pea-sized, blood-boil-like eruptions.",
        "keynotes": [
            "Convulsions: violent, with opisthotonos; head turned to one side; renewed by touch",
            "Effects of concussion of brain, falls, injuries to head",
            "Pustular eruptions forming thick, lemon-yellow scabs, especially on face and scalp",
            "Confounds present with past; everything appears strange and terrible",
            "Desire for chalk, coal, indigestible things (pica)"
        ],
        "modalities": {
            "aggravation": "Touch, drafts, concussion, tobacco, turning head, dentition",
            "amelioration": "Warmth, thinking of complaints"
        },
        "relationships": {
            "complementary": ["Cupr"],
            "antidotes": ["Arn", "Op", "Tab"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Cicuta Virosa", "text": "Allen: 'Convulsions, violent, with frightful distortions of limbs and whole body. Effects of concussion of brain, spasms; head turned to one side. Pustular eruptions forming thick, yellow scabs.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Cicuta Virosa", "text": "Kent: 'Cicuta is one of the most violent convulsive remedies. The body is thrown into most violent convulsions, opisthotonos, with head drawn to one side. Spasms renewed by touch.'"}
        ]
    },
    {
        "id": "cina",
        "common_name": "Cina",
        "abbreviation": "Cina",
        "latin_name": "Artemisia cina",
        "source_origin": "Vegetable Kingdom (Compositae); wormseed; tincture of flower heads",
        "constitution": "CHILDREN with worm complaints; cross, irritable, ugly. Picks nose, grinds teeth, cries in sleep. Sickly pale face with dark circles under eyes.",
        "mind": "Very cross, ill-humored, contrary; does not want to be touched, looked at, or carried. Wants things but pushes them away when offered. Restless, uneasy. Child cries piteously if looked at. Strikes and kicks.",
        "head_and_senses": "Headache from worms. Head constantly turns from side to side. Dilated pupils. Strabismus from worms.",
        "throat": "Grinding of teeth during sleep. Swallowing motion as if something coming up in throat.",
        "gastrointestinal": "CANINE HUNGER; hungry soon after a full meal. Pain in abdomen from worms; twisting about navel. Vomiting and diarrhea from worms. White mucous stools with thread-like worms.",
        "urinary_and_genital": "Enuresis from worms. Urine turns milky on standing.",
        "respiratory": "Gagging, suffocative cough in morning on rising. Whooping cough: child becomes stiff, loses breath, then clonic spasm. Face turns pale or blue during cough.",
        "cardiovascular": "Pulse hard, small, accelerated.",
        "locomotor": "Child jerks and twitches in sleep. Sudden inward jerking of fingers.",
        "sleep_and_fever": "Restless sleep; screaming, jerking, grinding teeth; lies on stomach or hands-and-knees position. Intermittent fever with clean tongue, great hunger, canine appetite.",
        "skin": "Pale, sickly, with dark circles under eyes. Itching of nose.",
        "keynotes": [
            "Worm affections: picks nose, grinds teeth at night, screams in sleep",
            "Cross, contrary, wants things but pushes them away when offered",
            "Canine hunger; hungry soon after eating; hunger with nausea",
            "Whooping cough: child becomes rigid, then clonic spasms; face pale/blue",
            "Cannot be touched, looked at, or carried; kicks and strikes"
        ],
        "modalities": {
            "aggravation": "Night, full moon, sun, summer, looked at, touched, worms",
            "amelioration": "Lying on abdomen, being rocked, wiping eyes"
        },
        "relationships": {
            "complementary": ["Dros"],
            "antidotes": ["Camph", "Chin"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Cina", "text": "Allen: 'Cross, ugly, ill-humored; will not be touched, cannot bear to be looked at. Picks and bores at the nose constantly. Grinds the teeth during sleep. Canine hunger; hungry soon after a meal.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Cina", "text": "Kent: 'Cina is preeminently a worm remedy. The child is cross, ugly, wants to be rocked, bores at the nose, grinds teeth, screams in sleep.'"}
        ]
    },
    {
        "id": "clem",
        "common_name": "Clematis Erecta",
        "abbreviation": "Clem",
        "latin_name": "Clematis recta",
        "source_origin": "Vegetable Kingdom (Ranunculaceae); tincture of leaves and stems",
        "constitution": "Fair-haired, scrofulous persons. Urethral stricture. Orchitis. Testicular induration.",
        "mind": "Fear of being alone; dread of company yet wants someone near. Confusion, homesickness. Ill humor, morose.",
        "head_and_senses": "Headache as from too much heat. Eruptions on occiput. Eye inflammation with vesicular eruptions.",
        "throat": "Toothache better holding cold water in mouth.",
        "gastrointestinal": "Toothache relieved by holding cold water in mouth; worse warmth of bed.",
        "urinary_and_genital": "URETHRAL STRICTURE with slow, interrupted stream. Orchitis; testicles indurated. Swelling and induration of right testicle. Gonorrhoeal complications. Inguinal glands swollen.",
        "respiratory": "Stitches in chest on inspiring.",
        "cardiovascular": "Pulse soft, small.",
        "locomotor": "Drawing and tearing in limbs. Swelling of inguinal glands.",
        "sleep_and_fever": "Sleepless before midnight from heat in body.",
        "skin": "VESICULAR ERUPTIONS: moist, pustular; forming thick scabs. Itching worse warmth of bed, washing. Eczema and herpes. Acne rosacea.",
        "keynotes": [
            "Urethral stricture with slow, interrupted, forked stream of urine",
            "Orchitis: testicles indurated; swelling of right testicle",
            "Vesicular, pustular eruptions forming thick scabs; worse warmth of bed",
            "Toothache relieved by holding cold water in mouth; worse warmth of bed",
            "Ill effects of suppressed gonorrhoea"
        ],
        "modalities": {
            "aggravation": "Night, warmth of bed, washing, new and full moon",
            "amelioration": "Open air, cold applications, cold water in mouth"
        },
        "relationships": {
            "complementary": ["Petr"],
            "antidotes": ["Bry", "Camph"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Clematis Erecta", "text": "Allen: 'Orchitis from suppressed gonorrhoea; testicles indurated, with drawing, tearing pain. Stricture of urethra; urine passes in a thin, feeble stream, forked.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Clematis", "text": "Kent: 'Clematis has marked action on the genito-urinary organs. The testicles become indurated and there is a slow, interrupted, forked stream of urine from stricture.'"}
        ]
    },
    {
        "id": "croc",
        "common_name": "Crocus Sativus",
        "abbreviation": "Croc",
        "latin_name": "Crocus sativus",
        "source_origin": "Vegetable Kingdom (Iridaceae); saffron; tincture of dried stigmas",
        "constitution": "Hysterical persons with rapidly changing moods. Hemorrhages of dark, stringy blood.",
        "mind": "Sudden change from hilarity to sadness; laughing and crying alternately. Sings involuntarily and then bursts into laughter. Excessively joyful then excessively sad. Absent-minded.",
        "head_and_senses": "Headache during climaxis. Sensation as if something alive moving in stomach or abdomen.",
        "throat": "Scraping and tickling in throat.",
        "gastrointestinal": "Sensation as if something alive is moving in stomach or abdomen (also felt in uterus and chest). Nausea.",
        "urinary_and_genital": "HEMORRHAGE: dark, stringy, clotted blood forming long black strings from nose, uterus, or any orifice. Threatened abortion with dark, stringy blood. Menses profuse, dark, clotted. Sensation of something alive moving in uterus.",
        "respiratory": "Cough with sensation of something alive in chest.",
        "cardiovascular": "Palpitation. Pulse rapid.",
        "locomotor": "Chorea and spasmodic muscular contractions. Twitching of single muscles.",
        "sleep_and_fever": "Yawning and sleepiness. Dreams of traveling.",
        "skin": "Itching without eruption.",
        "keynotes": [
            "Hemorrhages: dark, stringy, clotted blood forming long black strings",
            "Rapidly alternating moods: laughing and crying alternately; sings, then weeps",
            "Sensation as if something alive moving in stomach, abdomen, or uterus",
            "Threatened abortion with dark, stringy blood",
            "Chorea and spasmodic muscular contractions"
        ],
        "modalities": {
            "aggravation": "Fasting, before breakfast, looking fixedly, warm room, music, pregnancy",
            "amelioration": "Open air, after breakfast, yawning"
        },
        "relationships": {
            "complementary": ["Nux-v"],
            "antidotes": ["Acon", "Bell", "Op"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Crocus Sativus", "text": "Allen: 'Hemorrhages: blood dark, stringy, forming long black strings from nose, uterus, or any orifice. Alternation of gaiety and sadness; laughs, sings, then cries and becomes morose.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Crocus Sativus", "text": "Kent: 'The hemorrhages of Crocus are dark, stringy, tenacious; they hang in long strings. The mental state is marked by rapid alternation of moods.'"}
        ]
    },
    {
        "id": "crot-h",
        "common_name": "Crotalus Horridus",
        "abbreviation": "Crot-h",
        "latin_name": "Crotalus horridus",
        "source_origin": "Animal Kingdom; rattlesnake venom; trituration of venom",
        "constitution": "Hemorrhagic constitutions. Blood decomposed, dark, non-coagulable. Right-sided complaints. Broken-down constitutions, drunkenness.",
        "mind": "Loquacity, jumping from one subject to another. Delusions of being surrounded by enemies. Sadness, weeping. Delirium with desire to escape. Mistakes in writing, omitting letters.",
        "head_and_senses": "Headache extending into eyes. Ciliary neuralgia. Yellow, sallow complexion. Jaundiced face.",
        "throat": "Dark purple swelling. Diphtheria, gangrenous; membrane dark, gangrenous; bleeds on removal. Cannot swallow solids or warm drinks; can only swallow cold fluids.",
        "gastrointestinal": "Cannot lie on right side or back without immediate vomiting. Vomiting of bile and blood. Black vomit. Liver region sensitive. Jaundice with hemorrhagic tendency.",
        "urinary_and_genital": "Hematuria. Urine dark, bloody. Vicarious menstruation. Menses dark, profuse.",
        "respiratory": "Difficult breathing. Cough with bloody expectoration. Lungs full of dark blood.",
        "cardiovascular": "Palpitation with faintness. Heart weak, trembling. Action feeble. Pulse weak, irregular, intermittent.",
        "locomotor": "Swelling of limbs with hemorrhage under skin. Ecchymoses. Paralysis of one side (right).",
        "sleep_and_fever": "Hemorrhagic purpura. Yellow fever. Sepsis. Malignant fevers.",
        "skin": "PURPURA HEMORRHAGICA; ecchymoses; black and blue spots. Skin yellow, jaundiced. Gangrene. Boils, carbuncles with bluish surroundings.",
        "keynotes": [
            "Hemorrhages: dark, decomposed blood that won't coagulate; oozing from every orifice",
            "Right-sided complaints; yellowish complexion; jaundice with hemorrhagic tendency",
            "Loquacity; delusions of being surrounded by enemies; jumps from subject to subject",
            "Cannot lie on right side without vomiting; malignant conditions",
            "Blood decomposed, dark, fluid, non-coagulable; purpura hemorrhagica"
        ],
        "modalities": {
            "aggravation": "Right side, open air, evening and morning, in spring, yearly, damp and wet, alcohol",
            "amelioration": "Light, sun, magnetism"
        },
        "relationships": {
            "complementary": ["Lach", "Naja"],
            "antidotes": ["Lach", "Am-c", "Camph"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Crotalus Horridus", "text": "Allen: 'Hemorrhages from every orifice, dark, decomposed blood that does not coagulate. Right-sided complaints. Yellowness of whole body. Loquacity, jumps from one subject to another.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Crotalus Horridus", "text": "Kent: 'Crotalus is a right-sided remedy with marked hemorrhagic tendency. The blood is dark, fluid, and does not coagulate. It is a remedy for the most malignant types of disease.'"}
        ]
    },
    {
        "id": "crot-t",
        "common_name": "Croton Tiglium",
        "abbreviation": "Crot-t",
        "latin_name": "Croton tiglium",
        "source_origin": "Vegetable Kingdom (Euphorbiaceae); tincture of oil from seeds",
        "constitution": "Persons with skin and bowel complaints. Vesicular eruptions. Sudden, explosive diarrhea. Nursing women.",
        "mind": "Cannot think; confusion of mind. Anxiety about health.",
        "head_and_senses": "Headache as if eyes were being pulled backward by a string. Granular lids. Eye inflammation.",
        "throat": "Scraping in pharynx.",
        "gastrointestinal": "DIARRHEA: sudden, explosive, watery, shot out of rectum like a cork from a bottle. Stool yellow, watery. Gurgling in intestines then sudden explosive stool. Nausea at sight or smell of food. Every drink produces stool.",
        "urinary_and_genital": "Drawing pain through spermatic cord to testicle. Vesicular eruption on scrotum. Internal mammary pain going straight through to back when child nurses.",
        "respiratory": "Sensation of suffocation. Cough with gagging.",
        "cardiovascular": "Palpitation.",
        "locomotor": "Drawing and stitching in limbs.",
        "sleep_and_fever": "Chilliness with hot face.",
        "skin": "VESICULAR ERUPTIONS: intense itching, but too tender to scratch; better gentle rubbing. Pustules coalesce and form thick scabs. Eczema over whole body. Herpetic eruptions on genitals.",
        "keynotes": [
            "Diarrhea: sudden, explosive, watery, shot out like a cork from a bottle",
            "Vesicular eruptions: intense itching, too tender to scratch, better gentle rubbing",
            "Drawing pain from mammae straight through to back when child nurses",
            "Every drink or smallest quantity of food causes immediate stool",
            "Gurgling in intestines, then sudden profuse watery stool"
        ],
        "modalities": {
            "aggravation": "Summer, eating, drinking, washing, touch, night",
            "amelioration": "Gentle rubbing, sleep"
        },
        "relationships": {
            "complementary": ["Rhus-t"],
            "antidotes": ["Ant-t"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Croton Tiglium", "text": "Allen: 'Profuse watery diarrhea, comes out like a shot. Intense itching, but too tender to scratch; relieved by gentle rubbing. Drawing pain through chest to back when child nurses.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Croton Tiglium", "text": "Kent: 'The stool of Croton tig. is watery, yellow, copious, coming out with a gush, like a shot from a gun. The vesicular eruption with intense itching is relieved by gentle rubbing.'"}
        ]
    },
    {
        "id": "fl-ac",
        "common_name": "Fluoricum Acidum",
        "abbreviation": "Fl-ac",
        "latin_name": "Acidum fluoricum",
        "source_origin": "Chemical compound; hydrofluoric acid",
        "constitution": "Complaints of old age or prematurely aged. Syphilitic patients after abuse of mercury. Deep destructive processes — caries of bones, varicose veins. Increased sexual desire.",
        "mind": "Indifference to those he loves best. Buoyancy, excessive gaiety. Aversion to his own family. Irresponsibility. Materialistic.",
        "head_and_senses": "Hair falls out after typhoid. Alopecia areata. Pressure on sides of head from within outward.",
        "throat": "Warm drinks disagree.",
        "gastrointestinal": "Desire for highly seasoned food, spicy food, wine. Nausea and fullness. Liver complaints of drunkards.",
        "urinary_and_genital": "INCREASED SEXUAL DESIRE in old people. Syphilitic ulcers. Copious, watery urine. Discharges excoriating.",
        "respiratory": "Difficult breathing; short of breath.",
        "cardiovascular": "Varicose veins. Naevi.",
        "locomotor": "CARIES OF LONG BONES: especially tibiae; fistulous openings with thin, acrid discharge. Nails grow rapidly and crumble. Felons; succession of.",
        "sleep_and_fever": "Short sleep, feels refreshed by it. Can only sleep briefly but feels greatly rested. Night sweats.",
        "skin": "Varicose veins, ulcers with red edges. Old scars redden, itch. Nails crumbling. Hair falling. Fistulae and old ulcers.",
        "keynotes": [
            "Caries of long bones, especially tibia, with fistulous openings and thin acrid discharge",
            "Increased sexual desire especially in old age; prematurely aged persons",
            "Short sleep that is very refreshing; feels rested after short nap",
            "Indifference to loved ones; buoyancy; aversion to his own family",
            "Nails grow rapidly and crumble; hair falls after typhoid; alopecia areata"
        ],
        "modalities": {
            "aggravation": "Warmth, warm drinks, morning, rest, wine",
            "amelioration": "Cold, cold bathing, brief sleep, walking in open air"
        },
        "relationships": {
            "complementary": ["Sil", "Coff", "Coca"],
            "antidotes": ["Sil"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Fluoricum Acidum", "text": "Allen: 'Complaints of old age or prematurely aged. Diseases of bones; caries, especially of long bones; fistulous ulcers. Increased sexual desire in old men. Short sleep refreshes.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Fluoricum Acidum", "text": "Kent: 'Fluoricum acidum has deep, destructive processes in bones and periosteum, fistulous openings with thin, acrid, excoriating discharge. The patient is indifferent to loved ones.'"}
        ]
    },
    {
        "id": "guaj",
        "common_name": "Guaiacum",
        "abbreviation": "Guaj",
        "latin_name": "Guaiacum officinale",
        "source_origin": "Vegetable Kingdom (Zygophyllaceae); resin of guaiacum wood",
        "constitution": "Rheumatic and gouty constitutions. Contracted muscles and tendons. Growing pains. Syphilitic persons.",
        "mind": "Forgetful. Indolent. Contemptuous. Over-sensitive. Desire for apples.",
        "head_and_senses": "Gouty tearing in head. External headache on left side. Neuralgia from ear to ear through head.",
        "throat": "Sore throat with rheumatic pains; swollen, dry. Tonsils swollen.",
        "gastrointestinal": "Desire for apples. Craving for fruit. Constipation, hard dry stool. Diarrhea.",
        "urinary_and_genital": "Sharp stitches in kidney region. Nephritis.",
        "respiratory": "Fetid breath. Cough with rattling. Pleuritic stitches. Rheumatic pleurisy.",
        "cardiovascular": "Palpitation. Rheumatic endocarditis.",
        "locomotor": "RHEUMATIC COMPLAINTS with contracted, stiff joints; immovable stiffness. Growing pains in limbs. Gouty abscesses of joints. Arthritic lancinating pains from without inward. Ankylosis.",
        "sleep_and_fever": "Profuse fetid sweat on feet. Night sweats.",
        "skin": "Rheumatic abscesses. Fetid perspiration.",
        "keynotes": [
            "Rheumatic complaints: contracted, stiff joints; immovable stiffness",
            "Growing pains in limbs of children",
            "Gouty abscesses and rheumatic nodosities of joints",
            "Arthritic lancinating pains from without inward",
            "Desire for apples; intolerance of tight clothing"
        ],
        "modalities": {
            "aggravation": "Motion, heat, touch, pressure, damp weather, 6 PM to 4 AM",
            "amelioration": "Cold applications, external pressure"
        },
        "relationships": {
            "complementary": ["Caust", "Merc"],
            "antidotes": ["Nux-v"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Guaiacum", "text": "Allen: 'Rheumatic complaints of gouty or syphilitic persons. Immovable stiffness of contracted parts. Growing pains.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Guaiacum", "text": "Kent: 'Guaiacum is a rheumatic and gouty remedy. The joints are stiff, contracted, and there are growing pains in the limbs of children.'"}
        ]
    },
    {
        "id": "ip",
        "common_name": "Ipecacuanha",
        "abbreviation": "Ip",
        "latin_name": "Cephaelis ipecacuanha",
        "source_origin": "Vegetable Kingdom (Rubiaceae); tincture of dried root",
        "constitution": "Persons who are fat, flabby, with tendency to hemorrhage. Children who are hard to please. Nausea predominates in every complaint.",
        "mind": "Irritable, impatient. Holds everything in contempt. Full of desires but does not know for what. Cross, morose, ill-humored. Child screams and howls.",
        "head_and_senses": "Headache as if bruised, through skull. Bones of head feel as if crushed. Nausea with headache.",
        "throat": "CLEAN TONGUE WITH NAUSEA — almost diagnostic of Ipecac. Mouth moist, much saliva.",
        "gastrointestinal": "PERSISTENT NAUSEA NOT RELIEVED BY VOMITING — the cornerstone symptom. Nausea with clean tongue. Vomiting of food, bile, blood, mucus, without relief. Stomach feels relaxed as if hanging down. Griping pain around navel.",
        "urinary_and_genital": "Profuse uterine hemorrhage of bright red blood with nausea. Cutting pain from navel to uterus.",
        "respiratory": "SPASMODIC COUGH with gagging and vomiting; each breath threatens suffocation. Rattling of mucus in chest but no expectoration. Asthma with wheezing. Bronchitis of infants. Coarse rattling, chest seems full of mucus.",
        "cardiovascular": "Hemorrhages from any orifice, bright red, profuse, with nausea.",
        "locomotor": "Body rigid, stretched out stiff during cough.",
        "sleep_and_fever": "Intermittent fever: thirst during chill; nausea during all stages. Short chill, long heat.",
        "skin": "Pale, blue circles under eyes. Miliary rash.",
        "keynotes": [
            "Persistent nausea not relieved by vomiting — accompanies most complaints",
            "Clean tongue with nausea — pathognomonic of Ipecac",
            "Hemorrhages: bright red, profuse, gushing, with nausea",
            "Rattling cough: chest seems full of mucus but nothing comes up; infant bronchitis",
            "Spasmodic cough with gagging and vomiting; each breath threatens suffocation"
        ],
        "modalities": {
            "aggravation": "Periodically, moist warm wind, lying down, overeating, veal, pork",
            "amelioration": "Open air, rest, pressure, cold drinks, closing eyes"
        },
        "relationships": {
            "complementary": ["Arn", "Cupr"],
            "antidotes": ["Ars", "Chin", "Tab"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Ipecacuanha", "text": "Allen: 'Persistent nausea and vomiting, with pale, twitching face. Clean tongue. Hemorrhages bright red and profuse. The nausea is not relieved by vomiting.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Ipecacuanha", "text": "Kent: 'Ipecac is marked by its constant, persistent nausea. The nausea is not relieved by vomiting. The tongue is clean. The hemorrhages are bright red.'"}
        ]
    },
    {
        "id": "olnd",
        "common_name": "Oleander",
        "abbreviation": "Olnd",
        "latin_name": "Nerium oleander",
        "source_origin": "Vegetable Kingdom (Apocynaceae); tincture of leaves",
        "constitution": "Persons with violent headache, skin eruptions, and paralytic weakness. Effects of nursing sick people.",
        "mind": "Difficulty collecting thoughts. Slow perception. Absent-minded. Peevish, sensitive to contradiction. Violent temper.",
        "head_and_senses": "Vertigo when looking down, when looking fixedly. Headache ameliorated by looking sideways or cross-eyed. Diplopia; letters run together while reading.",
        "throat": "Crumbs and food lodge in throat. Difficulty swallowing.",
        "gastrointestinal": "UNDIGESTED FOOD IN STOOLS — involuntary, thin, yellowish. Diarrhea; food passes undigested. Ravenous hunger with trembling. Burning in stomach. Flatus offensive.",
        "urinary_and_genital": "Frequent micturition. Burning in urethra.",
        "respiratory": "Difficult breathing; dyspnoea.",
        "cardiovascular": "Palpitation with anxiety. Weak, trembling pulse.",
        "locomotor": "Paralytic weakness in limbs. Numbness of limbs. Stiffness of joints.",
        "sleep_and_fever": "Dreams vivid. Unrefreshing sleep.",
        "skin": "Violent itching of skin; scratching changes location of itch. Eczema behind ears. Sensitive scalp; biting, gnawing on scalp.",
        "keynotes": [
            "Undigested food in thin, yellowish, involuntary stools",
            "Headache ameliorated by looking sideways or cross-eyed",
            "Vertigo looking down or looking fixedly at an object",
            "Violent itching on skin; scratching changes place of itching",
            "Paralytic weakness; slow perception; letters run together while reading"
        ],
        "modalities": {
            "aggravation": "Rest, friction of clothes, undressing, looking down, in room",
            "amelioration": "Open air, looking sideways"
        },
        "relationships": {
            "complementary": ["Alum"],
            "antidotes": ["Camph"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Oleander", "text": "Allen: 'Vertigo when looking downward; when looking fixedly at an object. Undigested food in stool. Headache ameliorated by looking cross-eyed.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Oleander", "text": "Kent: 'Oleander is a remedy of great weakness. The stools contain undigested food. The headache is peculiar — relieved by looking sideways.'"}
        ]
    },
    {
        "id": "plb",
        "common_name": "Plumbum Metallicum",
        "abbreviation": "Plb",
        "latin_name": "Plumbum metallicum",
        "source_origin": "Mineral Kingdom; metallic lead",
        "constitution": "Sclerotic conditions. Slow progressive paralysis. Arteriosclerosis. Emaciation. Lead poisoning. Distinctly slow in action.",
        "mind": "Slow perception; apathetic. Delirium alternating with colic. Intellectual weakness, progressive. Memory impaired. Quiet melancholy.",
        "head_and_senses": "Hair very dry. Distinct BLUE LINE ON GUMS at base of teeth. Yellow complexion. Optic neuritis progressing to atrophy. Sudden loss of sight.",
        "throat": "Sweet taste. Paralysis of throat; cannot swallow. Blue line on margin of gums.",
        "gastrointestinal": "COLIC: excessive, violent, radiating to all parts of abdomen; AMELIORATED BY HARD PRESSURE, bending double; walls of abdomen feel drawn toward spine by a string. Obstinate constipation; stool hard, lumpy, black. Retraction of abdomen. Fecal impaction.",
        "urinary_and_genital": "Chronic nephritis. Urine scanty, albuminous. Testicles drawn up. Desire diminished.",
        "respiratory": "Difficult breathing; dyspnoea. Cannot raise arms above head.",
        "cardiovascular": "Arteriosclerosis. Cardiac dropsy. Pulse small, hard, tense.",
        "locomotor": "WRIST DROP; extensor paralysis. Progressive muscular atrophy. Paralysis of single muscles. Emaciation of paralyzed parts. Neuritis. Distinct paralysis of extensors.",
        "sleep_and_fever": "Cannot lie on affected side. Screaming in sleep. Deathly pallor.",
        "skin": "Yellow, dry, shiny. Blue line on gums. Emaciation.",
        "keynotes": [
            "Colic: violent, radiating; walls drawn toward spine; ameliorated by HARD PRESSURE and bending double",
            "Wrist drop: paralysis of extensors; progressive muscular atrophy",
            "Blue line on gums at base of teeth — pathognomonic of lead",
            "Obstinate constipation: stool hard, lumpy, black like sheep dung",
            "Emaciation of paralyzed parts; general progressive emaciation"
        ],
        "modalities": {
            "aggravation": "Night, motion, company, touch, exertion, clear weather",
            "amelioration": "Hard pressure, rubbing, physical exertion (sometimes), bending double"
        },
        "relationships": {
            "complementary": ["Alum", "Plat"],
            "antidotes": ["Alum", "Petr", "Plat", "Op"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Plumbum Metallicum", "text": "Allen: 'Distinct blue line along margin of gums. Colic: excessive, radiating; abdomen retracted, as if drawn to spine. Wrist drop; paralysis of extensors. Emaciation of affected parts.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Plumbum", "text": "Kent: 'Plumbum produces a slow progressive paralysis. The extensor muscles are affected first — the wrist drop of lead poisoning. The colic is violent and the abdomen is retracted.'"}
        ]
    },
    {
        "id": "podo",
        "common_name": "Podophyllum",
        "abbreviation": "Podo",
        "latin_name": "Podophyllum peltatum",
        "source_origin": "Vegetable Kingdom (Berberidaceae); May Apple; tincture of root gathered after fruit has ripened",
        "constitution": "Persons with bilious, hepatic complaints. Alternation of symptoms — headache alternating with diarrhea. Teething children with diarrhea.",
        "mind": "Loquacious during fever. Depression; imagines he is very ill. Fidgety, restless.",
        "head_and_senses": "Headache alternating with diarrhea. Bilious headache. Rolling of head from side to side.",
        "throat": "Grinding of teeth at night. Offensive breath. Desire to press gums together during dentition.",
        "gastrointestinal": "PROFUSE, GUSHING, WATERY DIARRHEA: offensive, putrid stool; worse in morning and forenoon. Diarrhea during dentition. Stool changeable in color: greenish, watery, chalk-like. Prolapse of rectum before or with stool. Liver engorged, sensitive. Gallstones. Jaundice.",
        "urinary_and_genital": "Prolapse of uterus. Ovarian tumor. Pain in ovaries extending to thighs.",
        "respiratory": "Difficult breathing with fullness in chest.",
        "cardiovascular": "Palpitation. Sensation of heart ascending to throat.",
        "locomotor": "Weakness in joints. Cracking in joints. Pain between shoulders.",
        "sleep_and_fever": "Sleeping with eyes half open. Moaning in sleep. Bilious remittent fever.",
        "skin": "Jaundiced complexion. Eruption of small pimples.",
        "keynotes": [
            "Profuse, gushing, watery, offensive diarrhea; worse morning, during dentition",
            "Prolapse of rectum before or with stool — stools escape with flatus",
            "Headache alternating with diarrhea; liver engorged with jaundice",
            "Diarrhea of teething children: stools profuse, watery, greenish, changeable",
            "Liver region sore, rubbing ameliorates; gallstones with jaundice"
        ],
        "modalities": {
            "aggravation": "Early morning, 2-4 AM, hot weather, during dentition, eating, drinking, bathing",
            "amelioration": "Lying on abdomen, rubbing liver region, external warmth, evening"
        },
        "relationships": {
            "complementary": ["Nat-m", "Sulph"],
            "antidotes": ["Lept", "Nux-v"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Podophyllum", "text": "Allen: 'Diarrhea profuse, gushing, watery, fetid; worse early morning and hot weather. Prolapse of rectum before or with stool. Headache alternates with diarrhea.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Podophyllum", "text": "Kent: 'Podophyllum has gushing, copious, watery stools that come out with a rush, early in the morning. The prolapse of rectum with the stool is very characteristic.'"}
        ]
    },
    {
        "id": "stann",
        "common_name": "Stannum Metallicum",
        "abbreviation": "Stann",
        "latin_name": "Stannum metallicum",
        "source_origin": "Mineral Kingdom; metallic tin",
        "constitution": "Diseases of mucous membranes with profuse, thick, yellow-green discharge. Extreme weakness; can hardly talk. Neuralgia that gradually increases then gradually decreases.",
        "mind": "Sad, despondent, feels like crying but crying makes him worse. Anxious, restless. Discouraged. Dread of people.",
        "head_and_senses": "Headache gradually increasing and gradually decreasing (like sunrise and sunset). Frontal headache. Face pale and sunken.",
        "throat": "Profuse accumulation of thick mucus.",
        "gastrointestinal": "Bitter taste. Nausea. Sensation of emptiness in stomach. Cramp-like colic relieved by hard pressure.",
        "urinary_and_genital": "Prolapse of uterus and vagina. Leucorrhoea; mucous, transparent. Bearing-down sensation.",
        "respiratory": "COUGH with profuse, thick, sweetish, yellow-green expectoration. So weak can hardly talk. Hectic fever. EXTREME WEAKNESS IN CHEST; can hardly talk. Reading aloud, laughing, singing cause cough. Phthisis mucosa. Deep hollow cough.",
        "cardiovascular": "Palpitation with weak feeling in chest. Dyspnoea.",
        "locomotor": "Great weakness and debility. Paralytic heaviness. Fingers jerk while holding pen.",
        "sleep_and_fever": "Hectic fever. Profuse night sweats, especially toward morning. Exhausting perspiration.",
        "skin": "Pale, waxy, sickly complexion.",
        "keynotes": [
            "Extreme weakness in chest: so weak can hardly talk; from phthisis",
            "Pains gradually increase and then gradually decrease (like sunrise/sunset)",
            "Profuse, thick, sweetish, yellow-green expectoration",
            "Sad, feels like crying, but crying makes worse",
            "Cough and chest complaints worse from laughing, talking, singing, reading aloud"
        ],
        "modalities": {
            "aggravation": "Using voice (talking, laughing, singing, reading), lying on right side, warm drinks, exertion, 10 AM",
            "amelioration": "Hard pressure, coughing, rapid walking, expectoration"
        },
        "relationships": {
            "complementary": ["Puls"],
            "antidotes": ["Puls"]
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Stannum Metallicum", "text": "Allen: 'So weak she can hardly talk. Pains gradually increase and then gradually decrease. Profuse muco-purulent discharge from bronchi, thick, yellow-green, sweetish.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Stannum", "text": "Kent: 'Stannum is a remedy of great weakness, especially in the chest. The pains gradually increase to a great height and then gradually decrease.'"}
        ]
    },
    {
        "id": "vib",
        "common_name": "Viburnum Opulus",
        "abbreviation": "Vib",
        "latin_name": "Viburnum opulus",
        "source_origin": "Vegetable Kingdom (Caprifoliaceae); cramp bark; tincture of fresh bark",
        "constitution": "Women with uterine and ovarian complaints. Spasmodic dysmenorrhoea. Threatened miscarriage. Cramps and colicky pains.",
        "mind": "Nervous, fidgety, irritable. Inability to concentrate. Despondent during menses.",
        "head_and_senses": "Heavy, dull headache over eyes. Vertigo.",
        "throat": "Dryness.",
        "gastrointestinal": "Nausea with uterine pains. Cramps in stomach. Colicky pains in bowels.",
        "urinary_and_genital": "SPASMODIC DYSMENORRHOEA: cramping, colicky pains beginning in back and going around to lower abdomen and down thighs. Menses too late, scanty, lasting a few hours. THREATENED MISCARRIAGE: cramps in early months. Bearing-down pains before menses. Ovarian pains shooting down thighs.",
        "respiratory": "Difficult breathing during menses.",
        "cardiovascular": "Palpitation with uterine complaints.",
        "locomotor": "Cramps and spasms in lower limbs. Aching in sacral region and thighs. Excruciating, colicky pains in pelvic region.",
        "sleep_and_fever": "Disturbed sleep from pains. Chilliness alternating with heat.",
        "skin": "Itching without eruption.",
        "keynotes": [
            "Spasmodic dysmenorrhoea: cramps beginning in back, extending around to abdomen and down thighs",
            "Threatened miscarriage with cramping pains in early months",
            "Menses too late, scanty, lasting only a few hours, with severe cramps",
            "Bearing-down pains before and during menses with spasmodic uterine contractions",
            "Cramp bark — antispasmodic for uterine cramps and colic"
        ],
        "modalities": {
            "aggravation": "Lying down, warm room, evening, motion, in close room",
            "amelioration": "Open air, rest, rubbing, pressure"
        },
        "relationships": {
            "complementary": ["Cimic", "Caul"],
            "antidotes": []
        },
        "cited_passages": [
            {"book": "Keynotes and Characteristics", "author": "Henry C. Allen, M.D. (1898)", "section": "Viburnum Opulus", "text": "Allen: 'Spasmodic dysmenorrhoea; pains crampy, colicky, in uterine region; extending down anterior surface of thighs. Threatened miscarriage. Menses too late, scanty.'"},
            {"book": "Lectures on Homoeopathic Materia Medica", "author": "James Tyler Kent, M.D. (1905)", "section": "Viburnum Opulus", "text": "Kent: 'Viburnum is a remedy for spasmodic uterine pains. It is the cramp bark and relieves the cramping, colicky pains of dysmenorrhoea and threatened miscarriage.'"}
        ]
    }
]
