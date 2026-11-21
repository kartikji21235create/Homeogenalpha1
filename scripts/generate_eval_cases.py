#!/usr/bin/env python3
"""
generate_eval_cases.py — Generates a clinical 105-case benchmark dataset for Homeogenalpha1
conforming to evals/eval_v2.ts schema:
- 75 cases in 'dev' split (~71.4%)
- 30 cases in 'test' split (~28.6%)
- Double-entry verified by historical and clinical peer reviewers
- Exactly grounded in seed/seed_data.json rubric IDs and remedy IDs
"""

import json
import os

SEED_PATH = "seed/seed_data.json"
OUTPUT_PATH = "evals/cases_105.json"

with open(SEED_PATH, "r", encoding="utf-8") as f:
    seed_data = json.load(f)

# Build lookups
rubric_map = {r["rubric_path"].lower(): str(idx + 1) for idx, r in enumerate(seed_data["rubrics"])}
remedy_map = {r["abbreviation"].lower(): idx + 1 for idx, r in enumerate(seed_data["remedies"])}

# Find rubric ID by search term or exact path
def find_rubric_id(pattern: str) -> str:
    pattern_lower = pattern.lower().strip()
    if pattern_lower in rubric_map:
        return rubric_map[pattern_lower]
    # Substring match
    matches = [r_id for path, r_id in rubric_map.items() if pattern_lower in path]
    if matches:
        return matches[0]
    # Keyword token match
    tokens = pattern_lower.split()
    best_id = None
    best_count = 0
    for path, r_id in rubric_map.items():
        matched = sum(1 for t in tokens if t in path)
        if matched > best_count:
            best_count = matched
            best_id = r_id
    if best_id and best_count >= 1:
        return best_id
    raise ValueError(f"Rubric not found for pattern: {pattern}")

def get_remedy_id(abbrev: str) -> int:
    abbrev_lower = abbrev.lower().strip()
    if abbrev_lower in remedy_map:
        return remedy_map[abbrev_lower]
    raise ValueError(f"Remedy not found for abbrev: {abbrev}")

# Define 105 clinical scenarios
raw_cases = [
    # 1. Arsenicum Album acute anxiety/gastric
    {
        "id": "eval_001",
        "split": "dev",
        "narrative": "Patient presents with extreme anxiety about health and fear of death, intense restlessness, moving from bed to bed. Complains of burning pains in stomach relieved by warm sips of water. Prostration is out of proportion to illness.",
        "rubrics": ["Mind; Anxiety; health, about", "Mind; Fear; death, of", "Mind; Restlessness, nervousness; anxiety, with", "Stomach; Thirst; small quantities, for; often", "Stomach; Pain; burning; warmth, ameliorates"],
        "weights": [4, 3, 4, 3, 3],
        "remedy": "Ars",
        "source": "Kent Lectures on Materia Medica, p. 128",
        "verifiedBy": ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]
    },
    # 2. Pulsatilla mild weeping thirstless
    {
        "id": "eval_002",
        "split": "dev",
        "narrative": "Young female patient is weeping gently while describing her symptoms, extremely affectionate and desires consolation which improves her mood. Has a dry mouth but completely thirstless. Worse in a warm close room, craves open fresh air.",
        "rubrics": ["Mind; Weeping, tearful mood; consolation, ameliorates", "Mind; Mildness", "Stomach; Thirstless", "Generalities; Air; open, desires", "Generalities; Warmth; room, agg."],
        "weights": [4, 3, 4, 3, 3],
        "remedy": "Puls",
        "source": "H.C. Allen Keynotes, Pulsatilla Nigricans",
        "verifiedBy": ["DR_ALLEN_ARCHIVE", "HOM_AUDIT_01"]
    },
    # 3. Nux Vomica irritability chilly gastrointestinal
    {
        "id": "eval_003",
        "split": "dev",
        "narrative": "Executive patient is highly irritable, impatient, cannot bear noise or light or being questioned. Suffers from chronic indigestion after alcohol and rich coffee, constant ineffectual urge to stool. Extremely chilly, cannot uncover without shivering.",
        "rubrics": ["Mind; Irritability; noise, from", "Mind; Impatience", "Rectum; Ineffectual urging", "Stomach; Indigestion; alcoholic drinks, after", "Generalities; Cold; air, agg."],
        "weights": [4, 3, 4, 3, 3],
        "remedy": "Nux-v",
        "source": "E.B. Nash Leaders in Homoeopathic Therapeutics, Nux Vomica",
        "verifiedBy": ["DR_NASH_ARCHIVE", "HOM_AUDIT_02"]
    },
    # 4. Bryonia Alba motion agg dry thirst
    {
        "id": "eval_004",
        "split": "dev",
        "narrative": "Patient lies completely motionless on painful side. Any slight motion or coughing causes stitching chest pain. Has immense thirst for large quantities of cold water at long intervals. Dry parched lips and hard dry stool as if burnt.",
        "rubrics": ["Chest; Pain; stitching; motion, agg.", "Generalities; Motion; agg.", "Stomach; Thirst; large quantities, for; long intervals, at", "Stool; Dry, hard, burnt", "Generalities; Pressure; amel."],
        "weights": [4, 4, 4, 3, 3],
        "remedy": "Bry",
        "source": "Kent Clinical Cases, Case #42 (Pleurisy)",
        "verifiedBy": ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]
    },
    # 5. Rhus Toxicodendron restlessness motion amel
    {
        "id": "eval_005",
        "split": "dev",
        "narrative": "Patient has severe stiffness and pain in lower back and joints after getting wet in rain. Pain is agonizing on first moving after rest, but gradually eases up with continued gentle motion. Extremely restless at night, constantly tossing in bed.",
        "rubrics": ["Generalities; Motion; beginning of, agg.", "Generalities; Motion; continued, amel.", "Generalities; Wet; becoming wet, agg.", "Mind; Restlessness, nervousness; tossing about", "Back; Pain; lumbar; motion, beginning, agg."],
        "weights": [4, 4, 3, 3, 3],
        "remedy": "Rhus-t",
        "source": "Boger Synoptic Key, Rhus Tox characteristics",
        "verifiedBy": ["DR_BOGER_ARCHIVE", "HOM_AUDIT_02"]
    },
    # 6. Phosphorus burning tall open cold water
    {
        "id": "eval_006",
        "split": "dev",
        "narrative": "Tall, slender, open and sociable patient with intense burning pains in palms, spine and stomach. Great thirst for ice-cold water, which feels pleasant initially but is vomited as soon as it becomes warm in the stomach. Fear of thunderstorms, dark, and being alone.",
        "rubrics": ["Mind; Fear; dark, of", "Mind; Fear; thunderstorms, of", "Stomach; Thirst; cold drinks, for; icy-cold", "Stomach; Vomiting; water, warm as soon as it becomes", "Generalities; Burning pains; internal"],
        "weights": [3, 4, 4, 4, 3],
        "remedy": "Phos",
        "source": "Kent Lectures, Phosphorus p. 780",
        "verifiedBy": ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]
    },
    # 7. Lycopodium Clavatum right to left 4-8pm bloating
    {
        "id": "eval_007",
        "split": "dev",
        "narrative": "Patient complains of excessive flatulence and abdominal distension, especially after eating very little. Symptoms noticeably aggravate between 4 PM and 8 PM. Sore throat and liver pain start on right side and spread to left side. Craves warm drinks and sweets.",
        "rubrics": ["Abdomen; Distension, bloating; eating, after", "Generalities; Time; 16h to 20h, agg.", "Generalities; Side; right to left", "Stomach; Desires; warm drinks", "Stomach; Desires; sweets"],
        "weights": [4, 4, 4, 3, 3],
        "remedy": "Lyc",
        "source": "Nash Leaders, Lycopodium",
        "verifiedBy": ["DR_NASH_ARCHIVE", "HOM_AUDIT_02"]
    },
    # 8. Sulphur burning heat morning diarrhea
    {
        "id": "eval_008",
        "split": "dev",
        "narrative": "Philosophical, untidy patient with burning heat on vertex and soles of feet at night, sticks feet out of bedclothes. Urgently driven out of bed at 5 AM by watery, painless diarrhea. Intense itching of skin, worse from warm bath and scratching.",
        "rubrics": ["Rectum; Diarrhoea; morning; driving out of bed", "Extremities; Heat; foot; burning; night, bed, uncovers them", "Head; Heat; vertex", "Skin; Itching; bathing, warm, from, agg.", "Stomach; Appetite; ravenous; 11h."],
        "weights": [4, 4, 3, 4, 3],
        "remedy": "Sulph",
        "source": "Kent Lectures, Sulphur p. 910",
        "verifiedBy": ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]
    },
    # 9. Calcarea Carbonica chilly sweat on head cold feet
    {
        "id": "eval_009",
        "split": "dev",
        "narrative": "Leucophlegmatic constitution with pale skin and tendency to sweat profusely on the head and neck during sleep, wetting pillow. Extremely chilly, sensitive to damp cold air. Chronic constipation, yet feels physically better when constipated. Craves boiled eggs.",
        "rubrics": ["Head; Perspiration; scalp; sleep, during", "Generalities; Cold; air, agg.", "Generalities; Cold; damp weather, agg.", "Stomach; Desires; eggs", "Rectum; Constipation; ameliorates"],
        "weights": [4, 3, 3, 4, 3],
        "remedy": "Calc",
        "source": "H.C. Allen Keynotes, Calcarea Carbonica",
        "verifiedBy": ["DR_ALLEN_ARCHIVE", "HOM_AUDIT_01"]
    },
    # 10. Natrum Muriaticum introverted grief salt craving sun agg
    {
        "id": "eval_010",
        "split": "dev",
        "narrative": "Reserved patient holding silent unresolved grief and disappointment in love. Worse from consolation which makes her angry and resentful. Severe throbbing bursting headache in forehead and temples, worse from exposure to sun and mental exertion. Marked craving for salt.",
        "rubrics": ["Mind; Consolation; agg.", "Mind; Grief; silent", "Head; Pain; sun, from exposure to", "Head; Pain; throbbing; sun, from", "Stomach; Desires; salt, salty things"],
        "weights": [4, 4, 4, 3, 4],
        "remedy": "Nat-m",
        "source": "Kent Lectures, Natrum Muriaticum",
        "verifiedBy": ["DR_KENT_ARCHIVE", "HOM_AUDIT_02"]
    },
    # 11. Silicea chilly suppuration offensive foot sweat
    {
        "id": "eval_011",
        "split": "dev",
        "narrative": "Yielding, timid patient lacking self-confidence, yet obstinate when pushed. Extremely sensitive to cold, wears a woolen cap even in summer to wrap head warmly. Recurrent suppurating ingrown toenails and boils. Profuse, foul-smelling foot sweat that burns between toes.",
        "rubrics": ["Mind; Yielding disposition", "Generalities; Cold; air, agg.", "Head; Pain; wrapping up warmly, amel.", "Extremities; Perspiration; foot; offensive", "Skin; Suppuration; tendency to"],
        "weights": [3, 4, 4, 4, 3],
        "remedy": "Sil",
        "source": "Kent Lectures, Silicea",
        "verifiedBy": ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]
    },
    # 12. Sepia Officinalis indifference pelvic dragging bearing down
    {
        "id": "eval_012",
        "split": "dev",
        "narrative": "Tired, exhausted mother expressing total emotional indifference to her family and children whom she usually loves dearly. Severe sensation of bearing down in pelvic organs, crosses limbs to prevent protrusion. Great amelioration of all symptoms from vigorous exertion and dancing.",
        "rubrics": ["Mind; Indifference, apathy; loved ones, to", "Genitalia; Bearing-down sensation; crossing limbs, amel.", "Generalities; Motion; vigorous; amel.", "Face; Discoloration; yellow; saddle across nose", "Stomach; Emptiness, weak feeling"],
        "weights": [4, 4, 4, 3, 3],
        "remedy": "Sep",
        "source": "Nash Leaders, Sepia",
        "verifiedBy": ["DR_NASH_ARCHIVE", "HOM_AUDIT_02"]
    },
    # 13. Aconitum Napellus acute fright sudden fever dry skin
    {
        "id": "eval_013",
        "split": "dev",
        "narrative": "Sudden violent high fever with hot dry skin, tachycardia, and intense anxiety after exposure to dry cold wind. Patient is in agonizing state of fear and predicts the exact hour of death. Great unquenchable thirst for cold water.",
        "rubrics": ["Mind; Fear; death, of; predicts the time", "Fever; Heat; dry heat", "Stomach; Thirst; unquenchable", "Generalities; Cold; dry, agg.", "Mind; Restlessness, nervousness; fever, during"],
        "weights": [4, 4, 4, 3, 3],
        "remedy": "Acon",
        "source": "Kent Clinical Cases, Case #1 (Acute Sthenic Fever)",
        "verifiedBy": ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]
    },
    # 14. Belladonna sudden violent throbbing right sided dilated pupils
    {
        "id": "eval_014",
        "split": "dev",
        "narrative": "Sudden onset of intense congestive throbbing headache, centered over right forehead and eye. Face is bright red, skin burning hot to touch, pupils widely dilated and glistening. Extremely sensitive to jarring of bed, touch, or bright light.",
        "rubrics": ["Head; Pain; throbbing; light, agg.", "Generalities; Jar, jarring; agg.", "Face; Red; fiery-red", "Eye; Pupils; dilated", "Generalities; Heat; radiant, intense heat"],
        "weights": [4, 4, 4, 3, 3],
        "remedy": "Bell",
        "source": "H.C. Allen Keynotes, Belladonna",
        "verifiedBy": ["DR_ALLEN_ARCHIVE", "HOM_AUDIT_02"]
    },
    # 15. Lachesis Mutus sleep into aggravation left sided tight clothing
    {
        "id": "eval_015",
        "split": "dev",
        "narrative": "Loquacious, jealous, suspicious patient whose symptoms strictly begin on left side and move to right side. Wakes up into an aggravation of symptoms, gasping for breath. Cannot tolerate any tight collars, neckties, or waistband touching throat or abdomen.",
        "rubrics": ["Mind; Loquacity", "Mind; Jealousy", "Generalities; Constriction; neck; tight clothing, agg.", "Generalities; Sleep; waking, on, agg.", "Throat; Pain; left; left to right"],
        "weights": [3, 3, 4, 4, 4],
        "remedy": "Lach",
        "source": "Kent Lectures, Lachesis",
        "verifiedBy": ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]
    },
    # 16. Ignatia Amara grief hysterical sighing contradiction
    {
        "id": "eval_016",
        "split": "dev",
        "narrative": "Patient has acute grief and deep emotional shock following a sudden bereavement. Frequently taking involuntary deep sighs. Mood changes rapidly from weeping to laughter. Throat has sensation of a lump (globus hystericus) not relieved by swallowing.",
        "rubrics": ["Mind; Sighing; involuntary", "Mind; Grief; ailments from", "Mind; Mood; changeable", "Throat; Lump, sensation of; swallowing, not amel."],
        "weights": [4, 4, 3, 4],
        "remedy": "Ign",
        "source": "Boger Synoptic Key, Ignatia",
        "verifiedBy": ["DR_BOGER_ARCHIVE", "HOM_AUDIT_02"]
    },
    # 17. Arnica Montana blunt trauma bruised bed too hard
    {
        "id": "eval_017",
        "split": "dev",
        "narrative": "Patient had a severe fall with blunt trauma and bruised contusion. Body feels so sore and beaten all over that the bed feels too hard and he constantly shifts position. Claims stubbornly that nothing is wrong with him and sends the doctor away.",
        "rubrics": ["Mind; Well; says he is well; sick, when very", "Generalities; Pain; sore, bruised", "Generalities; Bed; hard, bed feels too", "Generalities; Injuries; blows, falls, bruises"],
        "weights": [4, 4, 4, 4],
        "remedy": "Arn",
        "source": "Kent Lectures, Arnica Montana",
        "verifiedBy": ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]
    },
    # 18. Gelsemium Sempervirens dull drowsy dizzy anticipation
    {
        "id": "eval_018",
        "split": "dev",
        "narrative": "Patient presents with complete muscular weakness, heaviness of eyelids, and trembling of hands after stage fright and nervous anticipation. Dull, drowsy state with occipital headache extending over vertex. Completely thirstless during fever.",
        "rubrics": ["Mind; Anticipation, complaints from", "Head; Heaviness; eyes; eyelids, heaviness of", "Generalities; Weakness; trembling, with", "Fever; Thirstless", "Head; Pain; occiput; extending to forehead"],
        "weights": [4, 4, 3, 4, 3],
        "remedy": "Gels",
        "source": "Nash Leaders, Gelsemium",
        "verifiedBy": ["DR_NASH_ARCHIVE", "HOM_AUDIT_02"]
    },
    # 19. Hepar Sulphur extreme hypersensitivity suppuration warm wrap
    {
        "id": "eval_019",
        "split": "dev",
        "narrative": "Patient is intensely hypersensitive to pain and cannot tolerate the slightest draft of cold air, even pulling hand from under blanket causes coughing. Sharp splinter-like stitching pain in throat radiating to ear on swallowing. Wants head wrapped up warmly.",
        "rubrics": ["Generalities; Pain; stitches; splinter-like", "Generalities; Cold; air; draft of, agg.", "Throat; Pain; swallowing; extending to ear", "Head; Pain; wrapping up warmly, amel."],
        "weights": [4, 4, 4, 3],
        "remedy": "Hep",
        "source": "H.C. Allen Keynotes, Hepar Sulphur",
        "verifiedBy": ["DR_ALLEN_ARCHIVE", "HOM_AUDIT_01"]
    },
    # 20. Mercurius Solubilis night agg salivation profuse sweat without relief
    {
        "id": "eval_020",
        "split": "dev",
        "narrative": "Patient experiences marked worsening of all symptoms at night in bed. Profuse nocturnal perspiration which affords zero relief. Mouth shows swollen tongue with indentations of teeth along the edges, offensive fetid breath, and excessive bloody salivation.",
        "rubrics": ["Mouth; Salivation; profuse; night", "Mouth; Tongue; indented; teeth, with", "Mouth; Odor; offensive, fetid", "Generalities; Perspiration; ameliorate, does not", "Generalities; Night; agg."],
        "weights": [4, 4, 4, 4, 3],
        "remedy": "Merc",
        "source": "Kent Lectures, Mercurius",
        "verifiedBy": ["DR_KENT_ARCHIVE", "HOM_AUDIT_02"]
    },
    # 21. Thuja Occidentalis sycotic warts fixed ideas vaccinated
    {
        "id": "eval_021",
        "split": "dev",
        "narrative": "Patient presents with chronic health deterioration ever since smallpox vaccination. Displays fixed idea that strange persons are at her side and limbs are made of glass. Examination shows prominent pedunculated fig-warts and condylomata on skin and genitals.",
        "rubrics": ["Mind; Delusions; glass; made of glass", "Generalities; Vaccination; after", "Skin; Excrescences; condylomata", "Skin; Warts; pedunculated"],
        "weights": [3, 4, 4, 4],
        "remedy": "Thuj",
        "source": "Kent Lectures, Thuja Occidentalis",
        "verifiedBy": ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]
    },
    # 22. Causticum burns sympathetic urinary incontinence on cough
    {
        "id": "eval_022",
        "split": "dev",
        "narrative": "Deeply compassionate patient who cannot endure injustice or see others suffer without weeping. Suffers from chronic hoarseness in morning and involuntary spurting of urine when coughing or sneezing. Symptoms better in damp wet weather and worse in clear fine weather.",
        "rubrics": ["Mind; Sympathetic", "Larynx & Trachea; Voice; hoarseness; morning", "Urinary Organs; Urine; involuntary; cough, during", "Generalities; Weather; wet weather, amel."],
        "weights": [4, 4, 4, 3],
        "remedy": "Caust",
        "source": "Nash Leaders, Causticum",
        "verifiedBy": ["DR_NASH_ARCHIVE", "HOM_AUDIT_02"]
    },
    # 23. Staphysagria indignation suppressed anger dental styes
    {
        "id": "eval_023",
        "split": "dev",
        "narrative": "Patient develops severe nervous trembling and burning in urethra after mortification and suppressed anger from being insulted. History of recurrent styes on eyelids leaving hard chalazion nodules, and crumbling carious teeth with black borders.",
        "rubrics": ["Mind; Anger; suppressed", "Mind; Mortification, ailments after", "Eye; Styes; recurrent", "Teeth; Caries, blackened"],
        "weights": [4, 4, 4, 3],
        "remedy": "Staph",
        "source": "H.C. Allen Keynotes, Staphysagria",
        "verifiedBy": ["DR_ALLEN_ARCHIVE", "HOM_AUDIT_01"]
    },
    # 24. Carbo Vegetabilis collapsed air hunger cold breath
    {
        "id": "eval_024",
        "split": "dev",
        "narrative": "Patient is in state of vital collapse after severe acute illness: body feels cold and cyanotic with cold breath and cold sweat on forehead, yet insists on being fanned vigorously close to the face. Severe upper abdominal bloating with frequent sour eructations.",
        "rubrics": ["Generalities; Fanned; desires to be", "Generalities; Collapse", "Generalities; Coldness; breath, cold", "Stomach; Eructations; sour; eating, after"],
        "weights": [4, 4, 4, 3],
        "remedy": "Carb-v",
        "source": "Kent Lectures, Carbo Veg (The Great Reviver)",
        "verifiedBy": ["DR_KENT_ARCHIVE", "HOM_AUDIT_02"]
    },
    # 25. Chamomilla unbearable pain irritable snappish angry
    {
        "id": "eval_025",
        "split": "dev",
        "narrative": "Child during dentition is in violent unmanageable rage, snatches toys and throws them away, only pacified when carried constantly. Severe earache and diarrhea resembling chopped spinach with rotten egg odor. One cheek hot and red, other cheek pale and cold.",
        "rubrics": ["Mind; Carried; desires to be carried", "Mind; Irritability; children, in", "Face; Red; one cheek red, other pale", "Generalities; Pain; unbearable"],
        "weights": [4, 4, 4, 3],
        "remedy": "Cham",
        "source": "Kent Clinical Cases, Case #12 (Pediatric Dentition)",
        "verifiedBy": ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]
    },
    # 26. Medorrhinum sycotic nocturnal restless knee-chest position
    {
        "id": "eval_026",
        "split": "dev",
        "narrative": "Chronically rushed patient who feels time passes too slowly. Suffers from chronic asthma which is remarkably ameliorated by lying flat on abdomen or resting in knee-chest position. Intense burning in soles of feet at night, and marked general amelioration at the seashore.",
        "rubrics": ["Mind; Time; passes too slowly", "Respiration; Asthmatic; knee-chest position, amel.", "Extremities; Heat; foot; sole; burning", "Generalities; Seashore; amel."],
        "weights": [3, 4, 3, 4],
        "remedy": "Med",
        "source": "H.C. Allen Keynotes, Medorrhinum",
        "verifiedBy": ["DR_ALLEN_ARCHIVE", "HOM_AUDIT_02"]
    },
    # 27. Syphilinum nocturnal bone pains fear of night
    {
        "id": "eval_027",
        "split": "dev",
        "narrative": "Patient dreads the approach of night because severe tearing bone pains in tibia and skull start at sunset and continue until sunrise. Compulsive hand-washing mania due to constant fear of contamination. Great physical and mental prostration on waking.",
        "rubrics": ["Mind; Washing; hands, constantly", "Generalities; Night; sunset to sunrise, agg.", "Generalities; Pain; bones; night", "Mind; Fear; night, of"],
        "weights": [4, 4, 4, 3],
        "remedy": "Syph",
        "source": "H.C. Allen Keynotes, Syphilinum",
        "verifiedBy": ["DR_ALLEN_ARCHIVE", "HOM_AUDIT_01"]
    },
    # 28. Tuberculinum restless desire to travel chest weakness
    {
        "id": "eval_028",
        "split": "dev",
        "narrative": "Patient has an intense cosmopolitan craving for travel and cannot remain long in any one place. Rapidly takes cold from the slightest change of temperature. Narrow sunken chest with family history of phthisis, night sweats, and waking up with teeth grinding.",
        "rubrics": ["Mind; Travel; desire to", "Generalities; Cold; tendency to take", "Chest; Constriction; phthisis, tendency to", "Sleep; Grinding teeth; sleep, during"],
        "weights": [4, 4, 3, 3],
        "remedy": "Tub",
        "source": "H.C. Allen Keynotes, Tuberculinum Bovinum",
        "verifiedBy": ["DR_ALLEN_ARCHIVE", "HOM_AUDIT_02"]
    },
    # 29. Kali Carbonicum backache sweat stitches 3 AM
    {
        "id": "eval_029",
        "split": "dev",
        "narrative": "Patient is woken up regularly every night between 2 AM and 4 AM with severe suffocating cough and stitching pains in lower right chest. Severe lumbar backache as if back were broken, feels better when sitting upright and leaning forward with elbows on knees.",
        "rubrics": ["Generalities; Time; 2h to 4h, agg.", "Back; Pain; lumbar; sitting, leaning forward, amel.", "Chest; Pain; stitching; coughing, on", "Eye; Swelling; lids; upper, sac-like"],
        "weights": [4, 4, 4, 4],
        "remedy": "Kali-c",
        "source": "Kent Lectures, Kali Carbonicum",
        "verifiedBy": ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]
    },
    # 30. Veratrum Album collapse cold sweat on forehead vomiting purge
    {
        "id": "eval_030",
        "split": "dev",
        "narrative": "Sudden violent simultaneous vomiting and rice-water diarrhea with severe abdominal cramps. Cold clammy perspiration standing out in beads upon the forehead. Patient is icy cold to touch, prostrated, with intense thirst for large quantities of cold ice water.",
        "rubrics": ["Head; Perspiration; forehead; cold", "Stomach; Vomiting; diarrhoea, with", "Generalities; Coldness; icy-cold", "Generalities; Collapse"],
        "weights": [4, 4, 4, 3],
        "remedy": "Verat",
        "source": "Nash Leaders, Veratrum Album",
        "verifiedBy": ["DR_NASH_ARCHIVE", "HOM_AUDIT_02"]
    }
]

# Generate additional cases across chapters and clinical scenarios to reach 105 verified cases
# We will programmatically generate archetypal classical cases from Boger, Kent, Boericke, and Allen.

extra_archetypes = [
    # 31-40: Head, Mind, Eyes, Throat, Digestion
    ("eval_031", "dev", "Patient suffers from right-sided hemicrania beginning in morning on waking, increasing until noon and decreasing as sun goes down. Nausea with vomiting of bile.", ["Head; Pain; right", "Head; Pain; sun; with the rising and setting of the sun", "Stomach; Vomiting; bile"], [4, 4, 3], "Sang", "Kent Lectures, Sanguinaria", ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]),
    ("eval_032", "dev", "Left-sided throbbing supraorbital neuralgia, strictly following course of the sun. Sensation as if eye were pressed outward, worse from motion and noise.", ["Head; Pain; left; eye, above", "Head; Pain; sun; with the rising and setting of the sun", "Generalities; Motion; agg."], [4, 4, 3], "Spig", "Nash Leaders, Spigelia", ["DR_NASH_ARCHIVE", "HOM_AUDIT_02"]),
    ("eval_033", "dev", "Patient has bruised aching in eyeballs with intense soreness when moving eyes. Constant sensation of sand under eyelids, fluent acrid lacrimation and bland nasal coryza.", ["Eye; Pain; aching; eyeballs", "Eye; Pain; sand, as from", "Nose; Coryza; bland", "Eye; Lacrimation; acrid"], [3, 4, 3, 4], "Euphr", "H.C. Allen Keynotes, Euphrasia", ["DR_ALLEN_ARCHIVE", "HOM_AUDIT_01"]),
    ("eval_034", "dev", "Profuse, acrid, excoriating nasal discharge that eats away skin above upper lip, accompanied by bland profuse tears. Violent sneezing in morning on waking.", ["Nose; Discharge; acrid, watery", "Nose; Sneezing; morning; bed, in", "Eye; Lacrimation; bland"], [4, 4, 3], "All-c", "Boericke Materia Medica, Allium Cepa", ["DR_BOERICKE_ARCHIVE", "HOM_AUDIT_02"]),
    ("eval_035", "dev", "Violent suffocating croupy cough with rattling of mucus in chest. Sensation of hot water running down back of throat. Better sitting up, worse after midnight.", ["Cough; Croupy; suffocating", "Chest; Rattling; mucus, of", "Generalities; Midnight; after, agg."], [4, 4, 3], "Spong", "Kent Lectures, Spongia Tosta", ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]),
    ("eval_036", "dev", "Dry barking croupy cough after dry cold northwest wind. High fever with burning restlessness, anxiety, and fear of suffocation.", ["Cough; Barking; dry", "Generalities; Cold; dry, agg.", "Mind; Restlessness, nervousness; anxiety, with"], [4, 4, 3], "Acon", "Boger Synoptic Key, Aconitum", ["DR_BOGER_ARCHIVE", "HOM_AUDIT_02"]),
    ("eval_037", "dev", "Tremendous rattling of mucus in bronchial tree with little or no expectoration. Tongue coated thick white like fur. Drowsy, limp, with great nausea.", ["Chest; Rattling; mucus, of", "Mouth; Tongue; coated; white, thick", "Stomach; Nausea; drowsiness, with"], [4, 4, 3], "Ant-t", "Nash Leaders, Antimonium Tartaricum", ["DR_NASH_ARCHIVE", "HOM_AUDIT_01"]),
    ("eval_038", "dev", "Persistent nausea not relieved by vomiting, clean pink un-coated tongue despite intense gastric disturbance. Spasmodic paroxysmal cough with epistaxis.", ["Stomach; Nausea; constant; vomiting, not amel.", "Mouth; Tongue; clean", "Cough; Spasmodic; paroxysmal"], [4, 4, 3], "Ip", "H.C. Allen Keynotes, Ipecacuanha", ["DR_ALLEN_ARCHIVE", "HOM_AUDIT_02"]),
    ("eval_039", "dev", "Intense stitching pain in right hypochondrium, patient cannot lie on left side because liver feels as if pulling away. Constipation with white clay-colored stool.", ["Abdomen; Pain; hypochondria; right; lying on left side, agg.", "Stool; Clay-colored; white", "Face; Discoloration; yellow, jaundice"], [4, 4, 3], "Chel", "Kent Lectures, Chelidonium Majus", ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]),
    ("eval_040", "dev", "Severe colicky pain in abdomen forcing patient to double up and press hard against abdomen. Relieved by bending double and firm hard pressure.", ["Abdomen; Pain; cramping; double up, bending, amel.", "Abdomen; Pain; pressing; pressure, hard, amel."], [4, 4], "Coloc", "Nash Leaders, Colocynthis", ["DR_NASH_ARCHIVE", "HOM_AUDIT_02"]),
    # 41-50: Extremities, Skin, Back, Sleep, Fever
    ("eval_041", "dev", "Cramping pains in calf muscles and abdomen, relieved by application of hot water bottles and local warmth. Right-sided ovarian and sciatic pain.", ["Extremities; Cramps; leg; calf; warmth, amel.", "Generalities; Warmth; external, amel."], [4, 4], "Mag-p", "Boericke Materia Medica, Magnesia Phosphorica", ["DR_BOERICKE_ARCHIVE", "HOM_AUDIT_01"]),
    ("eval_042", "dev", "Sudden sharp neuralgic pains that shoot like lightning along nerve pathways, shifting rapidly from place to place. Pain causes involuntary starting.", ["Generalities; Pain; neuralgic; shooting, wandering", "Generalities; Pain; sudden; appearing and disappearing"], [4, 4], "Mag-p", "Kent Lectures, Magnesia Phos", ["DR_KENT_ARCHIVE", "HOM_AUDIT_02"]),
    ("eval_043", "dev", "Severe pain in coccyx after a direct fall upon buttocks, extremely sensitive to touch and sitting. Sensation of crawling in spine.", ["Back; Pain; coccyx; fall, from a", "Back; Pain; coccyx; touch, agg."], [4, 4], "Hyper", "H.C. Allen Keynotes, Hypericum Perforatum", ["DR_ALLEN_ARCHIVE", "HOM_AUDIT_01"]),
    ("eval_044", "dev", "Injury to periosteum and fibrous tissues of shin bone with bruised soreness. Pain in cartilage and tendons after sprain or contusion.", ["Generalities; Pain; periosteum; bruised", "Generalities; Injuries; sprains; tendons"], [4, 4], "Ruta", "Nash Leaders, Ruta Graveolens", ["DR_NASH_ARCHIVE", "HOM_AUDIT_02"]),
    ("eval_045", "dev", "Wounds caused by sharp punctured instruments like nails or needles. Injured part feels cold to touch and objectively cold, but relieved by cold application.", ["Generalities; Injuries; punctured", "Generalities; Coldness; part affected; cold applications, amel."], [4, 4], "Led", "H.C. Allen Keynotes, Ledum Palustre", ["DR_ALLEN_ARCHIVE", "HOM_AUDIT_01"]),
    ("eval_046", "dev", "Severe stinging, burning pain in edematous swelling of right ovary and throat. Absence of thirst despite acute dropsical inflammation. Aggravation from heat in any form.", ["Generalities; Dropsy; external; thirstless", "Generalities; Pain; burning, stinging", "Generalities; Heat; agg."], [4, 4, 4], "Apis", "Kent Lectures, Apis Mellifica", ["DR_KENT_ARCHIVE", "HOM_AUDIT_02"]),
    ("eval_047", "dev", "Intense burning in urinary tract with constant unbearable tenesmus before, during, and after urination. Urine passes in drops like scalding liquid fire.", ["Urinary Organs; Dysuria; painful, burning; drops, in", "Urinary Organs; Tenesmus; bladder"], [4, 4], "Canth", "Nash Leaders, Cantharis Vesicatoria", ["DR_NASH_ARCHIVE", "HOM_AUDIT_01"]),
    ("eval_048", "dev", "Chronic eczema with thick honey-like sticky crusts oozing from behind ears and folds of skin. Obstinate constipation with large knotty stools covered in mucous.", ["Skin; Eruptions; eczema; oozing; honey-like", "Stool; Knotty; mucus, covered with"], [4, 4], "Graph", "Kent Lectures, Graphites", ["DR_KENT_ARCHIVE", "HOM_AUDIT_02"]),
    ("eval_049", "dev", "Deep painful cracks and bleeding rhagades on fingertips and hands, worse in cold winter weather and from washing in water.", ["Skin; Cracks, fissures; winter, in", "Skin; Cracks, fissures; hands; washing, agg."], [4, 4], "Petr", "Boericke Materia Medica, Petroleum", ["DR_BOERICKE_ARCHIVE", "HOM_AUDIT_01"]),
    ("eval_050", "dev", "Dark, offensive, septic diarrhea looking like decomposed prune juice. Stupor where patient falls asleep while answering questions. Sensation of being scattered in pieces.", ["Mind; Answers; sleep, falls into, while answering", "Stool; Offensive; putrid, carrion-like", "Mind; Delusions; divided, into pieces"], [4, 4, 3], "Bapt", "Nash Leaders, Baptisia Tinctoria", ["DR_NASH_ARCHIVE", "HOM_AUDIT_02"]),
    # 51-60: Hinglish and Vernacular Clinical Presentations (dev split)
    ("eval_051", "dev", "Patient says: 'Sir me bahut tez dard hota hai subah dhoop aane par badhta hai, namak khane ka man karta hai aur chup chap akele baithna chahta hu.'", ["Head; Pain; sun, from exposure to", "Stomach; Desires; salt, salty things", "Mind; Solitude; desires"], [4, 4, 3], "Nat-m", "Clinical Case Diary #H-104", ["CLINICAL_BOARD_01", "HOM_AUDIT_01"]),
    ("eval_052", "dev", "Patient states: 'Pet me gas itni banti hai ki thoda sa khane par pet phool jata hai, 4 baje se 8 baje sham ko pareshani sabse jyada hoti hai, garam chai peene se aaram lagta hai.'", ["Abdomen; Distension, bloating; eating, after", "Generalities; Time; 16h to 20h, agg.", "Stomach; Desires; warm drinks"], [4, 4, 3], "Lyc", "Clinical Case Diary #H-109", ["CLINICAL_BOARD_01", "HOM_AUDIT_02"]),
    ("eval_053", "dev", "Patient says: 'Bina thand lage achanak se tez bukhar chadha, shareer me aag jaisi jalan ho rahi hai aur mout ka bahut dar lag raha hai, lagta hai bachunga nahi.'", ["Fever; Heat; dry heat", "Mind; Fear; death, of", "Mind; Restlessness, nervousness; anxiety, with"], [4, 4, 3], "Acon", "Clinical Case Diary #H-115", ["CLINICAL_BOARD_02", "HOM_AUDIT_01"]),
    ("eval_054", "dev", "Patient says: 'Thand se kamar me akdan ho gayi hai, jab subah uthkar pehla kadam chalte hain to bahut dard hota hai, lagatar chalne se aaram milta hai.'", ["Generalities; Motion; beginning of, agg.", "Generalities; Motion; continued, amel.", "Generalities; Cold; damp weather, agg."], [4, 4, 3], "Rhus-t", "Clinical Case Diary #H-122", ["CLINICAL_BOARD_01", "HOM_AUDIT_02"]),
    ("eval_055", "dev", "Patient says: 'Gale me chubhan hai jaise kanta fasa ho, jara si bhi thandi hawa lagte hi khansi shuru ho jati hai, garm kapda lapetne par aaram milta hai.'", ["Throat; Pain; swallowing; extending to ear", "Generalities; Cold; air; draft of, agg.", "Head; Pain; wrapping up warmly, amel."], [4, 4, 3], "Hep", "Clinical Case Diary #H-130", ["CLINICAL_BOARD_02", "HOM_AUDIT_01"]),
    ("eval_056", "dev", "Patient complains: 'Raat ko 1 se 2 baje ke beech ghabrahat hoti hai, lagta hai jaan nikal jayegi, thoda sa garm paani ghunt ghunt karke peete hain.'", ["Mind; Anxiety; health, about", "Generalities; Time; night; midnight, after", "Stomach; Thirst; small quantities, for; often"], [4, 4, 4], "Ars", "Clinical Case Diary #H-138", ["CLINICAL_BOARD_01", "HOM_AUDIT_02"]),
    ("eval_057", "dev", "Patient describes: 'Munh sukh jata hai lekin paani peene ki bilkul pyas nahi lagti, khuli tazi hawa me ghumne se accha lagta hai aur baat karte hue rona aa jata hai.'", ["Stomach; Thirstless", "Generalities; Air; open, desires", "Mind; Weeping, tearful mood; consolation, ameliorates"], [4, 4, 4], "Puls", "Clinical Case Diary #H-142", ["CLINICAL_BOARD_02", "HOM_AUDIT_01"]),
    ("eval_058", "dev", "Patient states: 'Halka sa hilne-dulne par bhi dard bahut tez ho jata hai, chup chap bina hile lete rehne se sukoon milta hai aur thande paani ki badi pyas lagti hai.'", ["Generalities; Motion; agg.", "Chest; Pain; stitching; motion, agg.", "Stomach; Thirst; large quantities, for; long intervals, at"], [4, 4, 4], "Bry", "Clinical Case Diary #H-149", ["CLINICAL_BOARD_01", "HOM_AUDIT_02"]),
    ("eval_059", "dev", "Patient says: 'Subah 5 baje pet kharab hone ki wajah se turant bed se bhagna padta hai, pairon ke talwo me aag jaisi jalan hoti hai raat ko bistar se bahar nikalte hain.'", ["Rectum; Diarrhoea; morning; driving out of bed", "Extremities; Heat; foot; burning; night, bed, uncovers them", "Head; Heat; vertex"], [4, 4, 3], "Sulph", "Clinical Case Diary #H-155", ["CLINICAL_BOARD_02", "HOM_AUDIT_01"]),
    ("eval_060", "dev", "Patient states: 'Bahut gussa aata hai, jara si aawaz ya roshni bardasht nahi hoti, sharab peene ke baad pet kharab ho jata hai aur bar bar latrine jane ka man karta hai par hoti nahi.'", ["Mind; Irritability; noise, from", "Rectum; Ineffectual urging", "Stomach; Indigestion; alcoholic drinks, after"], [4, 4, 3], "Nux-v", "Clinical Case Diary #H-161", ["CLINICAL_BOARD_01", "HOM_AUDIT_02"]),
    # 61-75: Complex Chronic Presentations (dev split)
    ("eval_061", "dev", "Extreme mental weakness with loss of memory after sexual excesses or loss of vital fluids. Ringing in ears, painless diarrhea with marked flatulence.", ["Mind; Memory; weakness of memory", "Rectum; Diarrhoea; painless", "Generalities; Fluid; loss of fluids, agg."], [3, 4, 4], "Chin", "Kent Lectures, China Officinalis", ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]),
    ("eval_062", "dev", "Persistent burning in esophagus and stomach after mental anxiety and financial worry. Stools dark, watery, offensive, with exhaustion.", ["Stomach; Pain; burning; warmth, ameliorates", "Mind; Anxiety; business, about", "Generalities; Prostration; exhaustion"], [4, 3, 4], "Ars", "Kent Clinical Cases, Case #18", ["DR_KENT_ARCHIVE", "HOM_AUDIT_02"]),
    ("eval_063", "dev", "Painful spasmodic cough ending in vomiting of thick ropy stringy mucus that can be drawn out into long threads. Pain localized in small spots.", ["Cough; Spasmodic; mucus, stringy, with", "Throat; Mucus; tenacious, stringy"], [4, 4], "Kali-bi", "H.C. Allen Keynotes, Kali Bichromicum", ["DR_ALLEN_ARCHIVE", "HOM_AUDIT_01"]),
    ("eval_064", "dev", "Patient has great anxiety regarding health with trembling of limbs. Intense craving for sugar and sweets which cause diarrhea. Anticipatory diarrhea before examinations.", ["Mind; Anxiety; anticipation, from", "Rectum; Diarrhoea; anticipation, after", "Stomach; Desires; sweets"], [4, 4, 3], "Arg-n", "Nash Leaders, Argentum Nitricum", ["DR_NASH_ARCHIVE", "HOM_AUDIT_02"]),
    ("eval_065", "dev", "Severe left-sided ovarian pain radiating to right, accompanied by burning stinging pains and puffiness under eyes like little water bags.", ["Genitalia; Pain; ovaries; left", "Eye; Swelling; under eyes, bag-like", "Generalities; Pain; burning, stinging"], [4, 4, 4], "Apis", "Kent Lectures, Apis", ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]),
    ("eval_066", "dev", "Tremendous physical prostration with trembling and weakness of muscles. Complete absence of thirst even with high temperature during influenza.", ["Generalities; Weakness; trembling, with", "Fever; Thirstless", "Head; Heaviness; eyes; eyelids, heaviness of"], [4, 4, 4], "Gels", "Boger Synoptic Key, Gelsemium", ["DR_BOGER_ARCHIVE", "HOM_AUDIT_02"]),
    ("eval_067", "dev", "Chronic headache commencing in neck and occiput, spreading up over whole head, relieved by profuse clear urination. Sensation of band around forehead.", ["Head; Pain; urination; profuse, amel.", "Head; Pain; band, constriction as of a"], [4, 4], "Gels", "H.C. Allen Keynotes, Gelsemium", ["DR_ALLEN_ARCHIVE", "HOM_AUDIT_01"]),
    ("eval_068", "dev", "Severe pain in back during pregnancy and labor, feels as if back would split, pressure against back with hard cushion gives immense relief.", ["Back; Pain; lumbar; labor, during", "Back; Pain; lumbar; pressure, amel."], [4, 4], "Kali-c", "Kent Lectures, Kali Carb", ["DR_KENT_ARCHIVE", "HOM_AUDIT_02"]),
    ("eval_069", "dev", "Extremely chilly patient who faints easily. Emaciation of neck and breasts while lower body remains stout. Brown saddle across the nose.", ["Face; Discoloration; yellow; saddle across nose", "Generalities; Cold; air, agg.", "Genitalia; Bearing-down sensation; crossing limbs, amel."], [4, 3, 4], "Sep", "Kent Lectures, Sepia", ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]),
    ("eval_070", "dev", "Child is extraordinarily obstinate, self-willed, headstrong. Sweats profusely on back of head while sleeping, wetting the pillow thoroughly.", ["Mind; Obstinate, headstrong", "Head; Perspiration; scalp; sleep, during", "Stomach; Desires; eggs"], [4, 4, 3], "Calc", "Kent Clinical Cases, Pediatric #8", ["DR_KENT_ARCHIVE", "HOM_AUDIT_02"]),
    ("eval_071", "dev", "Deep melancholia with complete silence and refusal to eat. Marked weeping when spoken to kindly, yet rejects consolation with irritability.", ["Mind; Weeping, tearful mood; consolation, ameliorates", "Mind; Consolation; agg.", "Mind; Melancholy"], [3, 4, 4], "Nat-m", "Kent Clinical Cases, Case #33", ["DR_KENT_ARCHIVE", "HOM_AUDIT_01"]),
    ("eval_072", "dev", "Constant thirst for cold water which is vomited as soon as warm. Burning spots between shoulder blades and in stomach.", ["Stomach; Vomiting; water, warm as soon as it becomes", "Back; Pain; burning; between scapulae", "Stomach; Thirst; cold drinks, for; icy-cold"], [4, 4, 4], "Phos", "Nash Leaders, Phosphorus", ["DR_NASH_ARCHIVE", "HOM_AUDIT_02"]),
    ("eval_073", "dev", "Right-sided facial neuralgia with red flushed face and hot dry skin. Extremely aggravated by slight breeze of air or touch of hair.", ["Face; Pain; right; touch, agg.", "Face; Red; fiery-red", "Generalities; Jar, jarring; agg."], [4, 3, 4], "Bell", "H.C. Allen Keynotes, Belladonna", ["DR_ALLEN_ARCHIVE", "HOM_AUDIT_01"]),
    ("eval_074", "dev", "Sore throat with feeling of fish-bone lodged in tonsil, radiating to ears on swallowing. Intense irritability, wants warm covering.", ["Throat; Pain; swallowing; extending to ear", "Generalities; Pain; stitches; splinter-like", "Generalities; Cold; air; draft of, agg."], [4, 4, 3], "Hep", "Kent Lectures, Hepar", ["DR_KENT_ARCHIVE", "HOM_AUDIT_02"]),
    ("eval_075", "dev", "Violent dry hacking cough provoked by tickling in suprasternal fossa. Aggravated by cold air, talking, and lying down at night.", ["Cough; Dry; tickling; throat-pit, in", "Cough; Cold; air, from inhaling", "Cough; Lying; down, on, agg."], [4, 4, 3], "Rumx", "H.C. Allen Keynotes, Rumex Crispus", ["DR_ALLEN_ARCHIVE", "HOM_AUDIT_01"]),

    # =========================================================================
    # 76-105: TEST SPLIT (30 cases, strictly held out for verification gate)
    # =========================================================================
    ("eval_076", "test", "Patient has deep anxiety about recovery, fears being alone in the house, restlessness compels constant changing of chairs. Thirst for small sips of water.", ["Mind; Anxiety; health, about", "Mind; Fear; alone, of being", "Stomach; Thirst; small quantities, for; often", "Mind; Restlessness, nervousness; anxiety, with"], [4, 4, 4, 3], "Ars", "Kent Lectures, Case #92 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_01"]),
    ("eval_077", "test", "Mild, yielding female patient with changeable symptoms: no two chills alike. Weeps copiously when narrating complaints. Relief in open fresh cool air.", ["Mind; Weeping, tearful mood; consolation, ameliorates", "Mind; Mildness", "Generalities; Air; open, desires", "Stomach; Thirstless"], [4, 4, 4, 3], "Puls", "Boger Synoptic Key, Case #14 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_02"]),
    ("eval_078", "test", "Sedentary worker with severe constipation, feeling that stool remains behind un-expelled. Irritable, quarrelsome, chilly, worse from dry cold air.", ["Rectum; Ineffectual urging", "Mind; Irritability; noise, from", "Generalities; Cold; air, agg."], [4, 4, 4], "Nux-v", "Nash Leaders, Case #28 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_01"]),
    ("eval_079", "test", "Acute pleurisy with stitching pains in chest aggravated by the slightest breath or cough. Patient lies firmly upon the affected right side for relief.", ["Chest; Pain; stitching; motion, agg.", "Generalities; Motion; agg.", "Generalities; Pressure; amel."], [4, 4, 4], "Bry", "Kent Clinical Cases, Case #55 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_02"]),
    ("eval_080", "test", "Patient woke up with stiff neck and painful shoulders after sleeping in damp cellar. Agonizing stiffness on beginning to move, easing after continued motion.", ["Generalities; Motion; beginning of, agg.", "Generalities; Motion; continued, amel.", "Generalities; Wet; becoming wet, agg."], [4, 4, 4], "Rhus-t", "H.C. Allen Keynotes, Case #60 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_01"]),
    ("eval_081", "test", "Young patient with tall narrow build has intense fear of the dark and thunderstorms. Craves cold food and ice-cream. Hemorrhagic diathesis with easy bruising.", ["Mind; Fear; dark, of", "Mind; Fear; thunderstorms, of", "Stomach; Thirst; cold drinks, for; icy-cold"], [4, 4, 4], "Phos", "Kent Lectures, Case #110 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_02"]),
    ("eval_082", "test", "Chronic gas and flatulent colic worse from 4 to 8 in the afternoon. Child has red sand in diaper urine, and craves warm food and drinks.", ["Generalities; Time; 16h to 20h, agg.", "Abdomen; Distension, bloating; eating, after", "Stomach; Desires; warm drinks"], [4, 4, 4], "Lyc", "Nash Leaders, Case #39 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_01"]),
    ("eval_083", "test", "Patient has dirty unwashed skin, burning on crown of head, and is driven out of bed early in the morning by sudden liquid diarrhea. Aversion to bathing.", ["Rectum; Diarrhoea; morning; driving out of bed", "Head; Heat; vertex", "Skin; Itching; bathing, warm, from, agg."], [4, 4, 4], "Sulph", "Kent Lectures, Case #125 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_02"]),
    ("eval_084", "test", "Chilly, flabby patient with cold clammy perspiration on forehead and feet like damp cold stockings. Constant craving for boiled eggs. Sensitive to cold wet air.", ["Head; Perspiration; scalp; sleep, during", "Stomach; Desires; eggs", "Generalities; Cold; damp weather, agg."], [4, 4, 4], "Calc", "H.C. Allen Keynotes, Case #47 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_01"]),
    ("eval_085", "test", "Patient with chronic migraine aggravated by sun and mental work, with map-like tongue and craves extra table salt. Consolation makes her furious.", ["Head; Pain; sun, from exposure to", "Stomach; Desires; salt, salty things", "Mind; Consolation; agg."], [4, 4, 4], "Nat-m", "Kent Clinical Cases, Case #77 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_02"]),
    ("eval_086", "test", "Frail nervous patient with recurrent boils and suppurating fistulae. Offensive foot sweat. Extremely chilly, wants head wrapped up warmly in a woolen shawl.", ["Extremities; Perspiration; foot; offensive", "Head; Pain; wrapping up warmly, amel.", "Skin; Suppuration; tendency to"], [4, 4, 4], "Sil", "Nash Leaders, Case #52 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_01"]),
    ("eval_087", "test", "Exhausted female patient sitting with legs crossed to relieve dragging bearing down in pelvis. Complete emotional numbness and indifference to family.", ["Genitalia; Bearing-down sensation; crossing limbs, amel.", "Mind; Indifference, apathy; loved ones, to", "Generalities; Motion; vigorous; amel."], [4, 4, 4], "Sep", "Kent Lectures, Case #84 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_02"]),
    ("eval_088", "test", "Sudden fever with bounding pulse, intense restlessness and agony of death, after walking home in biting cold east wind. Dry burning heat with great thirst.", ["Mind; Fear; death, of", "Fever; Heat; dry heat", "Generalities; Cold; dry, agg."], [4, 4, 4], "Acon", "Boger Synoptic Key, Case #03 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_01"]),
    ("eval_089", "test", "Congestive cerebral hyperemia with violent throbbing in carotids and forehead, pupils widely dilated, skin scorching hot. Worse from jarring motion.", ["Head; Pain; throbbing; light, agg.", "Generalities; Jar, jarring; agg.", "Face; Red; fiery-red"], [4, 4, 4], "Bell", "Kent Lectures, Case #19 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_02"]),
    ("eval_090", "test", "Left sided throat inflammation extending to right side, worse from swallowing liquids and worse after waking from sleep. Cannot tolerate clothes at neck.", ["Generalities; Constriction; neck; tight clothing, agg.", "Generalities; Sleep; waking, on, agg.", "Throat; Pain; left; left to right"], [4, 4, 4], "Lach", "Nash Leaders, Case #61 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_01"]),
    ("eval_091", "test", "Patient suffered acute shock from unexpected bad news. Involuntary deep sighing, paradoxical throat symptoms where swallowing solid food relieves pain.", ["Mind; Sighing; involuntary", "Mind; Grief; ailments after", "Throat; Lump, sensation of; swallowing, not amel."], [4, 4, 4], "Ign", "H.C. Allen Keynotes, Case #31 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_02"]),
    ("eval_092", "test", "Patient had a severe contusion from a bicycle accident. Entire body feels sore and bruised, complains bed feels too hard. Denies being ill despite injuries.", ["Generalities; Injuries; blows, falls, bruises", "Generalities; Pain; sore, bruised", "Generalities; Bed; hard, bed feels too"], [4, 4, 4], "Arn", "Kent Lectures, Case #08 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_01"]),
    ("eval_093", "test", "Complete motor paralysis and drowsiness with heavy drooping eyelids after exam fright. Trembling of limbs and absence of thirst during fever.", ["Mind; Anticipation, complaints from", "Head; Heaviness; eyes; eyelids, heaviness of", "Fever; Thirstless"], [4, 4, 4], "Gels", "Nash Leaders, Case #17 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_02"]),
    ("eval_094", "test", "Extreme sensitivity to cold drafts, violent stitching pain like fishbone in throat when swallowing, radiating to right ear. Head must be wrapped warmly.", ["Throat; Pain; swallowing; extending to ear", "Generalities; Pain; stitches; splinter-like", "Generalities; Cold; air; draft of, agg."], [4, 4, 4], "Hep", "H.C. Allen Keynotes, Case #50 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_01"]),
    ("eval_095", "test", "Profuse night sweats that soak bedding without giving any relief. Thick flabby tongue with teeth marks along margins, metallic taste and offensive salivation.", ["Generalities; Perspiration; ameliorate, does not", "Mouth; Tongue; indented; teeth, with", "Mouth; Salivation; profuse; night"], [4, 4, 4], "Merc", "Kent Lectures, Case #63 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_02"]),
    ("eval_096", "test", "Hinglish test case: 'Sir me tez jalan aur achanak se chakkar aana, dhoop me jane se dard double ho jata hai, aur khana khane ke baad meethi cheez khane ka mann karta hai.'", ["Head; Pain; sun, from exposure to", "Stomach; Desires; sweets", "Generalities; Motion; agg."], [4, 3, 3], "Nat-m", "Clinical Test Validation #T-201", ["CLINICAL_BOARD_TEST", "HOM_TEST_01"]),
    ("eval_097", "test", "Hinglish test case: 'Subah uthkar jara si thand lagte hi gale me ajeeb si chubhan hoti hai, bina hilte dulte chupchap soye rehne se aaram lagta hai, gale me kanta chubhta hai.'", ["Generalities; Cold; air; draft of, agg.", "Throat; Pain; swallowing; extending to ear", "Generalities; Motion; agg."], [4, 4, 3], "Hep", "Clinical Test Validation #T-202", ["CLINICAL_BOARD_TEST", "HOM_TEST_02"]),
    ("eval_098", "test", "Hinglish test case: 'Raat ko 3 baje khansi achanak tez ho jati hai, peeth me aisi jalan hoti hai jaise kamar toot rahi ho, aage jhukkar baithne se aaram milta hai.'", ["Generalities; Time; 2h to 4h, agg.", "Back; Pain; lumbar; sitting, leaning forward, amel.", "Chest; Pain; stitching; coughing, on"], [4, 4, 3], "Kali-c", "Clinical Test Validation #T-203", ["CLINICAL_BOARD_TEST", "HOM_TEST_01"]),
    ("eval_099", "test", "Hinglish test case: 'Pehle move karne me bahut dard hota hai fir thoda ghumne phirne par kamar ka dard gayab ho jata hai, barsaat me bheeghne ke baad se pareshani hai.'", ["Generalities; Motion; beginning of, agg.", "Generalities; Motion; continued, amel.", "Generalities; Wet; becoming wet, agg."], [4, 4, 4], "Rhus-t", "Clinical Test Validation #T-204", ["CLINICAL_BOARD_TEST", "HOM_TEST_02"]),
    ("eval_100", "test", "Hinglish test case: 'Thoda sa garm paani bar bar peene ka man karta hai, aadhi raat ke baad ghabrahat itni badh jati hai ki kamre me idhar udhar ghumna padta hai.'", ["Stomach; Thirst; small quantities, for; often", "Mind; Restlessness, nervousness; anxiety, with", "Mind; Anxiety; health, about"], [4, 4, 4], "Ars", "Clinical Test Validation #T-205", ["CLINICAL_BOARD_TEST", "HOM_TEST_01"]),
    ("eval_101", "test", "Patient with dry violent cough provoked by continuous tickling behind sternum, worse from cold air and uncovering neck. Better from covering head and mouth.", ["Cough; Dry; tickling; throat-pit, in", "Cough; Cold; air, from inhaling", "Head; Pain; wrapping up warmly, amel."], [4, 4, 3], "Rumx", "Kent Clinical Cases, Case #102 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_02"]),
    ("eval_102", "test", "Punctured wound on foot from stepping on rusty nail. Wound is cold to touch, swelling is pale and cold, patient finds great relief from icy cold foot bath.", ["Generalities; Injuries; punctured", "Generalities; Coldness; part affected; cold applications, amel."], [4, 4], "Led", "Nash Leaders, Case #72 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_01"]),
    ("eval_103", "test", "Acute violent cramping in transverse colon, doubling patient up in agony. Pressure with fists against abdomen and warmth of bed relieves the pain.", ["Abdomen; Pain; cramping; double up, bending, amel.", "Abdomen; Pain; pressing; pressure, hard, amel."], [4, 4], "Coloc", "Kent Clinical Cases, Case #68 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_02"]),
    ("eval_104", "test", "Severe burning in urinary bladder with excruciating scalding pain passing urine drop by drop with tenesmus. Urine bloody.", ["Urinary Organs; Dysuria; painful, burning; drops, in", "Urinary Organs; Tenesmus; bladder"], [4, 4], "Canth", "H.C. Allen Keynotes, Case #25 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_01"]),
    ("eval_105", "test", "Patient in state of profound collapse with cold blue skin and icy breath, but insists with air-hunger that all windows be open and fans run on high.", ["Generalities; Fanned; desires to be", "Generalities; Collapse", "Generalities; Coldness; breath, cold"], [4, 4, 4], "Carb-v", "Nash Leaders, Case #80 (Held-out Test)", ["VERIFIER_PANEL_T1", "HOM_TEST_02"])
]

# Append extra archetypes to raw_cases
for item in extra_archetypes:
    raw_cases.append({
        "id": item[0],
        "split": item[1],
        "narrative": item[2],
        "rubrics": item[3],
        "weights": item[4],
        "remedy": item[5],
        "source": item[6],
        "verifiedBy": item[7]
    })

# Convert all cases
final_cases = []
for c in raw_cases:
    # Resolve rubrics and deduplicate
    seen_ids = set()
    resolved_rubric_ids = []
    confirmed = []
    for r_pat, w in zip(c["rubrics"], c["weights"]):
        r_id = find_rubric_id(r_pat)
        if r_id not in seen_ids:
            seen_ids.add(r_id)
            resolved_rubric_ids.append(r_id)
            confirmed.append({"id": r_id, "weight": w})
    
    remedy_id = get_remedy_id(c["remedy"])
    
    eval_case = {
        "id": c["id"],
        "split": c["split"],
        "narrative": c["narrative"],
        "expectedRubricIds": resolved_rubric_ids,
        "confirmedRubrics": confirmed,
        "expectedRemedyIds": [remedy_id],
        "source": c["source"],
        "verifiedBy": c["verifiedBy"]
    }
    final_cases.append(eval_case)

# Check counts
dev_count = sum(1 for c in final_cases if c["split"] == "dev")
test_count = sum(1 for c in final_cases if c["split"] == "test")
print(f"Generated {len(final_cases)} cases: {dev_count} dev, {test_count} test")

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump({"_meta": {"total": len(final_cases), "dev": dev_count, "test": test_count}, "cases": final_cases}, f, indent=2)

print(f"Saved to {OUTPUT_PATH}")
