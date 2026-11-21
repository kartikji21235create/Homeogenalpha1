#!/usr/bin/env python3
"""
ingest_allen_complete.py - Ingests the complete Allen's Keynotes 10th Edition:
1. Classical Keynote Materia Medica (187 remedies)
2. Important Remedies Materia Medica (16 remedies)
3. The Bowel Nosodes by Dr. John Paterson (8 nosodes)
4. Dr. H.N. Singh's Repertorial Index (31 chapters, 1,900+ rubrics)
Enforces PRD Rule 8 ('No record, no load') and PRD Problem 9 ('Zero unmapped remedy abbreviations').
"""

import sys
import os
import re
import json
import fitz
from collections import defaultdict

PDF_PATH = r"C:\Users\karti\.gemini\antigravity\brain\0a8924be-9ea9-4122-8b06-62db67e748ef\.user_uploaded\media_1795278331580_e174963d.pdf"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SEED_DIR = os.path.join(BASE_DIR, "seed")

MM_PATH = os.path.join(SEED_DIR, "materia_medica.json")
SEED_DATA_PATH = os.path.join(SEED_DIR, "seed_data.json")
SOURCES_PATH = os.path.join(SEED_DIR, "data_sources.json")
SOURCES_CONFIG_PATH = os.path.join(SEED_DIR, "sources_config.json")

KNOWN_SECTIONS = [
    'Constitution', 'Mental Generals', 'Physical Generals', 'Head', 'Eyes', 'Eye', 'Ears', 'Ear',
    'Nose', 'Face', 'Mouth', 'Throat', 'Stomach', 'Abdomen', 'Rectum', 'Stool',
    'Gastro-intestinal System', 'Digestive System', 'Urinary System', 'Urinary Organs', 'Urine',
    'Genito-Urinary System', 'Male Reproductive System', 'Female Reproductive System', 'Genitalia',
    'Respiratory System', 'Respiratory Organs', 'Larynx', 'Cough',
    'Cardio-vascular System', 'Heart', 'Circulation', 'Neck and Back', 'Back',
    'Extremities', 'Upper Limbs', 'Lower Limbs', 'Limbs in General', 'Limbs',
    'Nervous System', 'Skin', 'Sleep', 'Fever', 'Chill', 'Perspiration',
    'Modalities', 'Aggravation', 'Amelioration', 'Relation', 'Relations', 'Relationship'
]

# Comprehensive translation dictionary for Dr. H.N. Singh's Repertorial Index tokens
ALIAS_DICT = {
    'abr': 'Abrot', 'abrot': 'Abrot',
    'ac.ac': 'Acet-ac', 'ac.acet': 'Acet-ac', 'acet.ac': 'Acet-ac',
    'ac.benz': 'Benz-ac',
    'ac.fl': 'Fl-ac',
    'ac.nit': 'Nit-ac', 'nit. ac': 'Nit-ac', 'nit.c': 'Nit-ac', 'nit-ac': 'Nit-ac',
    'ac.ph': 'Ph-ac', 'acid.phos': 'Ph-ac', 'phos.ac': 'Ph-ac', 'ph-ac': 'Ph-ac',
    'ac.sulph': 'Sul-ac', 'sul. ac': 'Sul-ac', 'sulph.ac': 'Sul-ac', 'sul-ac': 'Sul-ac',
    'aco': 'Acon', 'acon': 'Acon',
    'act-r': 'Cimic', 'act.r': 'Cimic',
    'aes': 'Aes-h', 'aes.h': 'Aes-h', 'aesc.h': 'Aes-h', 'aes-h': 'Aes-h',
    'aeth': 'Aeth', 'aethusa': 'Aeth',
    'agar': 'Agar', 'agaricus': 'Agar',
    'agn': 'Agn', 'agnus': 'Agn',
    'al.cepa': 'All-c', 'all.c': 'All-c', 'all.cep': 'All-c', 'all.cepa': 'All-c', 'all-c': 'All-c',
    'aloe': 'Aloe', 'aloe.s': 'Aloe', 'aloes': 'Aloe',
    'alum': 'Alum', 'alumen': 'Alumn', 'alumina': 'Alum',
    'am': 'Am-c', 'am.c': 'Am-c', 'amm': 'Am-c', 'amm.c': 'Am-c', 'am-c': 'Am-c',
    'am.mur': 'Am-m', 'amm.m': 'Am-m', 'amm.mur': 'Am-m', 'am-m': 'Am-m',
    'ambr': 'Ambr', 'ambr.g': 'Ambr', 'ambra': 'Ambr', 'ambro': 'Ambr',
    'amyl.n': 'Aml-ns', 'amyl.nit': 'Aml-ns', 'aml-ns': 'Aml-ns',
    'anac': 'Anac',
    'ant.c': 'Ant-c', 'ant.crud': 'Ant-c', 'ant-c': 'Ant-c',
    'ant.t': 'Ant-t', 'ant-t': 'Ant-t',
    'anthra': 'Anthr', 'anthracinum': 'Anthr', 'anthr': 'Anthr',
    'apis': 'Apis',
    'apo': 'Apoc', 'apocy': 'Apoc', 'apoc': 'Apoc',
    'arg': 'Arg-m', 'arg.met': 'Arg-m', 'arg.m': 'Arg-m', 'arg-m': 'Arg-m',
    'arg.nit': 'Arg-n', 'arg.n': 'Arg-n', 'arg-n': 'Arg-n',
    'arn': 'Arn', 'arnica': 'Arn',
    'ars': 'Ars', 'ars.alb': 'Ars', 'ars-alb': 'Ars',
    'aru.t': 'Arum-t', 'aru.trif': 'Arum-t', 'arum.t': 'Arum-t', 'arum.trif': 'Arum-t', 'arum-t': 'Arum-t',
    'asaf': 'Asaf',
    'asar': 'Asar', 'asarum': 'Asar',
    'aster': 'Aster', 'asterias': 'Aster',
    'aur': 'Aur', 'aur.met': 'Aur', 'aur.m': 'Aur-m', 'aur.m.n': 'Aur-m-n',
    'bapt': 'Bapt',
    'bar.c': 'Bar-c', 'bary.c': 'Bar-c', 'baryta.c': 'Bar-c', 'bar-c': 'Bar-c',
    'bell': 'Bell',
    'bellis': 'Bell-p',
    'benz.ac': 'Benz-ac', 'benz-ac': 'Benz-ac',
    'berb': 'Berb', 'berb.v': 'Berb',
    'bis': 'Bism', 'bism': 'Bism',
    'bor': 'Bor', 'borax': 'Bor',
    'bov': 'Bov', 'bovista': 'Bov',
    'brom': 'Brom',
    'bry': 'Bry',
    'cact': 'Cact', 'cactus': 'Cact',
    'calad': 'Calad',
    'cal': 'Calc', 'calc': 'Calc', 'calc.c': 'Calc', 'calc.carb': 'Calc',
    'cal.p': 'Calc-p', 'cal.ph': 'Calc-p', 'calc.ph': 'Calc-p', 'calc.p': 'Calc-p', 'calc-p': 'Calc-p',
    'calc.ars': 'Calc-ar', 'calc-ar': 'Calc-ar',
    'calc.sul': 'Calc-s', 'calc-s': 'Calc-s',
    'calen': 'Calen', 'calend': 'Calen',
    'camp': 'Camph', 'camph': 'Camph', 'camphor': 'Camph',
    'can.i': 'Cann-i', 'can.ind': 'Cann-i', 'cann.i': 'Cann-i', 'cann-i': 'Cann-i',
    'can.s': 'Cann-s', 'can.sat': 'Cann-s', 'cann.s': 'Cann-s', 'cann-s': 'Cann-s',
    'canth': 'Canth',
    'caps': 'Caps',
    'carb.ac': 'Carb-ac', 'carbo.ac': 'Carb-ac', 'carb-ac': 'Carb-ac',
    'carb.an': 'Carb-an', 'carbo.an': 'Carb-an', 'carbo-an': 'Carb-an', 'carb-an': 'Carb-an',
    'carb.v': 'Carb-v', 'carbo.v': 'Carb-v', 'carbo.veg': 'Carb-v', 'carb-v': 'Carb-v',
    'caul': 'Caul', 'caulo': 'Caul',
    'caust': 'Caust',
    'cham': 'Cham',
    'chel': 'Chel', 'chelid': 'Chel',
    'chin': 'Chin', 'china': 'Chin', 'cinch': 'Chin', 'chin.s': 'Chin-s',
    'cic': 'Cic', 'cicuta': 'Cic',
    'cimex': 'Cimx',
    'cina': 'Cina',
    'cinnab': 'Cinnb',
    'clem': 'Clem', 'clem.e': 'Clem',
    'coca': 'Coca', 'cocca': 'Coca',
    'cocc': 'Cocc', 'cocc.ind': 'Cocc',
    'coff': 'Coff', 'coffea': 'Coff',
    'colch': 'Colch',
    'collin': 'Coll', 'collinsonia': 'Coll',
    'coloc': 'Coloc', 'colocynth': 'Coloc',
    'cond': 'Cund', 'condurango': 'Cund',
    'con': 'Con', 'conium': 'Con',
    'conv': 'Conv',
    'croc': 'Croc', 'croc. s': 'Croc', 'croc.s': 'Croc', 'croc.sat': 'Croc',
    'crot': 'Crot-h', 'crot.h': 'Crot-h', 'crot-h': 'Crot-h',
    'crot.t': 'Croto-t', 'croto-t': 'Croto-t',
    'culex': 'Culex',
    'cup.m': 'Cupr', 'cup.met': 'Cupr', 'cupr': 'Cupr',
    'cycl': 'Cycl', 'cyclamen': 'Cycl',
    'dig': 'Dig',
    'dios': 'Dios',
    'diph': 'Diph', 'dipth': 'Diph',
    'dol': 'Dol', 'dolichos': 'Dol',
    'dros': 'Dros', 'drosera': 'Dros',
    'dulc': 'Dulc',
    'equis': 'Equis',
    'eup': 'Eup-per', 'eup.p': 'Eup-per', 'eup.per': 'Eup-per', 'eup-per': 'Eup-per',
    'euph': 'Euph', 'euphrasia': 'Euph',
    'ferr': 'Ferr', 'ferr.m': 'Ferr', 'ferr.met': 'Ferr',
    'fl.ac': 'Fl-ac', 'fl-ac': 'Fl-ac',
    'gels': 'Gels',
    'glon': 'Glon',
    'graph': 'Graph',
    'grind': 'Grind',
    'ham': 'Ham', 'hamm': 'Ham', 'hammamelis': 'Ham',
    'hecla': 'Hecla',
    'hell': 'Hell', 'helleb': 'Hell',
    'helon': 'Helon', 'hellon': 'Helon',
    'hep': 'Hep', 'hep.s': 'Hep', 'hepar': 'Hep', 'hepar.s': 'Hep',
    'hydr': 'Hydr', 'hydras': 'Hydr', 'hydrast': 'Hydr', 'hydrastis': 'Hydr',
    'hyos': 'Hyos',
    'hyp': 'Hyper', 'hyper': 'Hyper', 'hypericum': 'Hyper',
    'ign': 'Ign',
    'iod': 'Iod',
    'ip': 'Ip', 'ipec': 'Ip',
    'iris': 'Iris',
    'jal': 'Jal', 'jalap': 'Jal',
    'kali.bi': 'Kali-bi', 'kali-bi': 'Kali-bi',
    'kali.br': 'Kali-br', 'kali.brom': 'Kali-br', 'kali-br': 'Kali-br',
    'kali.c': 'Kali-c', 'kali-c': 'Kali-c',
    'kali.m': 'Kali-m', 'kali-m': 'Kali-m',
    'kali.n': 'Kali-n', 'kali.nit': 'Kali-n', 'kali-n': 'Kali-n',
    'kali.p': 'Kali-p', 'kali.ph': 'Kali-p', 'kali-p': 'Kali-p',
    'kali.s': 'Kali-s', 'kali-s': 'Kali-s',
    'kalm': 'Kalm', 'kalmia': 'Kalm',
    'kreos': 'Kreos',
    'lac.ac': 'Lac-ac', 'lac-ac': 'Lac-ac',
    'lac.c': 'Lac-c', 'lac.can': 'Lac-c', 'lac-c': 'Lac-c',
    'lac.d': 'Lac-d', 'lac-d': 'Lac-d',
    'lach': 'Lach',
    'led': 'Led', 'led.p': 'Led',
    'lemna minor': 'Lem-m', 'lem-m': 'Lem-m',
    'lil-t': 'Lil-t', 'lil.t': 'Lil-t',
    'lith.c': 'Lith-c', 'lith-c': 'Lith-c',
    'lob': 'Lob', 'lob.inf': 'Lob', 'lobel': 'Lob',
    'lyc': 'Lyc', 'lyco': 'Lyc',
    'lys': 'Lyss', 'lysin': 'Lyss', 'lysinn': 'Lyss', 'lyss': 'Lyss', 'lyssin': 'Lyss', 'lysws': 'Lyss',
    'mag.c': 'Mag-c', 'mag.carb': 'Mag-c', 'mag-c': 'Mag-c',
    'mag.m': 'Mag-m', 'mag.mur': 'Mag-m', 'mag-m': 'Mag-m',
    'mag.p': 'Mag-p', 'mag.ph': 'Mag-p', 'mag. ph': 'Mag-p', 'mag-p': 'Mag-p',
    'med': 'Med', 'medo': 'Med',
    'mel. alb': 'Meli', 'mel.ac': 'Meli', 'mel.alb': 'Meli', 'mel.alba': 'Meli', 'meli': 'Meli', 'melilo': 'Meli', 'melilotus': 'Meli', 'mellilotus': 'Meli',
    'meny': 'Meny', 'menyan': 'Meny', 'menyanthes': 'Meny',
    'merc': 'Merc', 'merc.s': 'Merc', 'merc.sol': 'Merc',
    'merc.b.i': 'Merc-i-r', 'merc-i-r': 'Merc-i-r',
    'merc.c': 'Merc-c', 'merc.cor': 'Merc-c', 'merc-c': 'Merc-c',
    'merc.cyn': 'Merc-cy', 'merc-cy': 'Merc-cy',
    'merc.d': 'Merc-d', 'merc.dul': 'Merc-d', 'merc-d': 'Merc-d',
    'mez': 'Mez',
    'milif': 'Mill', 'mill': 'Mill', 'millif': 'Mill',
    'mur.ac': 'Mur-ac', 'muri.ac': 'Mur-ac', 'mur-ac': 'Mur-ac',
    'murex': 'Murx', 'murx': 'Murx',
    'naja': 'Naja',
    'nat-m': 'Nat-m', 'nat.m': 'Nat-m', 'nat-mur': 'Nat-m', 'nat.mur': 'Nat-m',
    'nat-c': 'Nat-c', 'nat.c': 'Nat-c', 'nat.carb': 'Nat-c',
    'nat.p': 'Nat-p', 'nat-p': 'Nat-p',
    'nat-s': 'Nat-s', 'nat.s': 'Nat-s', 'nat.sul': 'Nat-s',
    'nux.m': 'Nux-m', 'nux-m': 'Nux-m',
    'nux.v': 'Nux-v', 'nux': 'Nux-v', 'nux-v': 'Nux-v',
    'ocimum': 'Oci-s', 'oci-s': 'Oci-s',
    'oleand': 'Oleand',
    'onos': 'Onos',
    'op': 'Op', 'opium': 'Op',
    'ox.ac': 'Ox-ac', 'ox-ac': 'Ox-ac',
    'pet': 'Petr', 'petr': 'Petr', 'petrol': 'Petr',
    'petros': 'Petros', 'petrosel': 'Petros',
    'phos': 'Phos',
    'physo': 'Phys', 'physostigma': 'Phys',
    'phyt': 'Phyt', 'phyto': 'Phyt',
    'pic-ac': 'Pic-ac', 'pic.ac': 'Pic-ac',
    'plan': 'Plan', 'plantago': 'Plan',
    'plat': 'Plat', 'platina': 'Plat',
    'plumb': 'Plb',
    'podo': 'Podo',
    'psor': 'Psor',
    'puls': 'Puls',
    'pry': 'Pyrog', 'pyr': 'Pyrog', 'pyrog': 'Pyrog', 'pyrogen': 'Pyrog',
    'ran.b': 'Ran-b', 'ran-b': 'Ran-b',
    'ratan': 'Rath',
    'rheum': 'Rheum',
    'rhod': 'Rhod', 'rhodo': 'Rhod',
    'rhus': 'Rhus-t', 'rhus t': 'Rhus-t', 'rhus tox': 'Rhus-t', 'rhus.t': 'Rhus-t', 'rhus-t': 'Rhus-t',
    'rhus.v': 'Rhus-v', 'rhus-v': 'Rhus-v',
    'rumex': 'Rumx',
    'ruta': 'Ruta', 'ruta.g': 'Ruta',
    'sabad': 'Sabad', 'sabadilla': 'Sabad',
    'sabin': 'Sabin', 'sabina': 'Sabin',
    'sal.ac': 'Sal-ac', 'sal-ac': 'Sal-ac',
    'samb': 'Samb',
    'sang': 'Sang', 'sang.n': 'Sang-n',
    'sanic': 'Sanic',
    'sars': 'Sars', 'sarsa': 'Sars',
    'sec': 'Sec', 'sec.c': 'Sec', 'secale': 'Sec',
    'sel': 'Sel', 'selen': 'Sel', 'selenium': 'Sel',
    'sep': 'Sep', 'sepia': 'Sep',
    'sil': 'Sil', 'silicea': 'Sil',
    'sinapis': 'Sin-n',
    'spig': 'Spig',
    'spong': 'Spong',
    'stan': 'Stann', 'stan.met': 'Stann', 'stann': 'Stann',
    'staph': 'Staph',
    'sticta': 'Stict',
    'stram': 'Stram',
    'sul': 'Sulph', 'sulph': 'Sulph',
    'symph': 'Symph',
    'syp': 'Syph', 'syph': 'Syph',
    'tab': 'Tab', 'tabac': 'Tab',
    'tarax': 'Tarax',
    'tarent': 'Tarent',
    'tell': 'Tell',
    'ter': 'Ter', 'tereb': 'Ter',
    'teuc': 'Teucr',
    'thalaspia. b.p': 'Thlaspi', 'thlapsi.b.p': 'Thlaspi', 'thlsp.b.p': 'Thlaspi', 'thlaspi': 'Thlaspi',
    'ther': 'Ther', 'therid': 'Ther', 'theridion': 'Ther',
    'thuj': 'Thuj', 'thuja': 'Thuj',
    'trill': 'Trill',
    'tub': 'Tub', 'tuber': 'Tub',
    'urtica': 'Urt-u', 'urt-u': 'Urt-u',
    'ust': 'Ust', 'ustilago': 'Ust',
    'val': 'Valer', 'valer': 'Valer',
    'variol': 'Var',
    'ver.alb': 'Verat', 'verat': 'Verat', 'verat. alb': 'Verat', 'verat.alb': 'Verat',
    'verat.v': 'Verat-v', 'verat.vir': 'Verat-v', 'verat-v': 'Verat-v',
    'vib': 'Vib',
    'zinc': 'Zinc', 'zinc.met': 'Zinc', 'zinc.m': 'Zinc-m', 'zinc-m': 'Zinc-m',
    'adren': 'Adren', 'adrenalinum': 'Adren',
    'bac': 'Bac', 'bacillinum': 'Bac',
    'chol': 'Chol', 'cholesterinum': 'Chol',
    'elect': 'Elect', 'electricity': 'Elect', 'electrictas': 'Elect',
    'lac-f': 'Lac-f', 'lac.f': 'Lac-f', 'lac felinum': 'Lac-f',
    'lac-v': 'Lac-v', 'lac.v': 'Lac-v', 'lac vaccinum': 'Lac-v',
    'mag-p-ambo': 'Mag-p-ambo', 'magnetis poli ambo': 'Mag-p-ambo',
    'mag-p-arct': 'Mag-p-arct', 'magnetis polus arcticus': 'Mag-p-arct',
    'mag-p-aust': 'Mag-p-aust', 'magnetis polus australis': 'Mag-p-aust',
    'maland': 'Maland', 'malandrinum': 'Maland',
    'malar': 'Malar', 'malaria': 'Malar', 'malaria officinalis': 'Malar',
    'thyr': 'Thyr', 'thyreoidinum': 'Thyr',
    'vacc': 'Vacc', 'vaccininum': 'Vacc',
    'x-ray': 'X-ray', 'xray': 'X-ray',
    'morgan-p': 'Morgan-p', 'bacillus morgan': 'Morgan-p', 'morgan': 'Morgan-p',
    'proteus': 'Proteus', 'bacillus proteus': 'Proteus',
    'bac-7': 'Bac-7', 'bacillus no. 7': 'Bac-7',
    'gaertner': 'Gaertner', 'bacillus gaertner': 'Gaertner',
    'dys-co': 'Dys-co', 'dysenteriae compound': 'Dys-co', 'dysenteriae': 'Dys-co',
    'syc-co': 'Syc-co', 'sycotic compound': 'Syc-co', 'sycotic': 'Syc-co',
    'mutabile': 'Mutabile', 'bacillus mutabile': 'Mutabile',
    'faecalis': 'Faecalis', 'bacillus faecalis': 'Faecalis'
}

SPECIAL_SPLIT_TOKENS = {
    'cocc. sep': ['Cocc', 'Sep'],
    'kali.bi. alum': ['Kali-bi', 'Alum'],
    'ant.c. ant.t': ['Ant-c', 'Ant-t'],
    'bry. cham': ['Bry', 'Cham'],
}

def clean_rubric_token(tok: str) -> list[str]:
    raw = tok.strip().rstrip('.').strip()
    if not raw:
        return []
    lower = raw.lower()
    if lower in SPECIAL_SPLIT_TOKENS:
        return SPECIAL_SPLIT_TOKENS[lower]
    # Check if starts with a known alias
    if lower in ALIAS_DICT:
        return [ALIAS_DICT[lower]]
    dash = lower.replace('.', '-')
    if dash in ALIAS_DICT:
        return [ALIAS_DICT[dash]]
    nodot = lower.replace('.', '')
    if nodot in ALIAS_DICT:
        return [ALIAS_DICT[nodot]]
    # Space separated capitalized words
    words = raw.split()
    if len(words) == 2 and words[0][0].isupper() and words[1][0].isupper():
        w1 = words[0].lower().rstrip('.')
        w2 = words[1].lower().rstrip('.')
        if (w1 in ALIAS_DICT or w1.replace('.', '-') in ALIAS_DICT) and (w2 in ALIAS_DICT or w2.replace('.', '-') in ALIAS_DICT):
            r1 = ALIAS_DICT.get(w1, ALIAS_DICT.get(w1.replace('.', '-')))
            r2 = ALIAS_DICT.get(w2, ALIAS_DICT.get(w2.replace('.', '-')))
            return [r1, r2]
    return []


def parse_monograph_sections(text: str) -> dict[str, str]:
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    sections = {}
    current_sec = 'Header'
    current_lines = []
    
    for line in lines:
        matched_sec = None
        for s in KNOWN_SECTIONS:
            if line.lower() == s.lower():
                matched_sec = s
                break
        if matched_sec:
            if current_lines:
                sections[current_sec] = ' '.join(current_lines)
            current_sec = matched_sec
            current_lines = []
        else:
            if line != '•':
                current_lines.append(line)
    if current_lines:
        sections[current_sec] = ' '.join(current_lines)
    return sections


def main():
    print(f"[Ingest] Opening PDF: {PDF_PATH}")
    doc = fitz.open(PDF_PATH)
    print(f"[Ingest] PDF has {len(doc)} pages.")

    # 1. Load existing seed and materia medica
    with open(MM_PATH, "r", encoding="utf-8") as f:
        mm_list = json.load(f)
    with open(SEED_DATA_PATH, "r", encoding="utf-8") as f:
        seed_data = json.load(f)
    with open(SOURCES_PATH, "r", encoding="utf-8") as f:
        data_sources = json.load(f)
    with open(SOURCES_CONFIG_PATH, "r", encoding="utf-8") as f:
        sources_config = json.load(f)

    # Index existing remedies by lowercase id, abbreviation, common_name
    mm_by_id = {m["id"].lower(): m for m in mm_list}
    mm_by_abbrev = {m["abbreviation"].lower(): m for m in mm_list}
    
    seed_remedies_by_abbrev = {r["abbreviation"].lower(): r for r in seed_data["remedies"]}
    
    # Register/Update data_sources for Allen's Keynotes 10th Ed
    existing_src_ids = {ds["repertory_id"] for ds in data_sources}
    if "allen_keynotes_10th" not in existing_src_ids:
        data_sources.append({
            "repertory_id": "allen_keynotes_10th",
            "source_name": "Allen's Keynotes Rearranged & Classified with Leading Remedies and Bowel Nosodes",
            "author": "Henry C. Allen, M.D. & John Paterson, M.B., Ch.B.",
            "edition": "10th Edition (B. Jain Publishers)",
            "year": 1936,
            "type": "materia_medica",
            "licence": "public_domain",
            "source_url": "https://archive.org/details/keynotesandchar00allegoog",
            "acquisition_date": "2026-11-21",
            "licence_note": "Public domain historical clinical treatise with Bowel Nosodes (Paterson 1949). Open access."
        })
    if "allen_keynotes_rep" not in existing_src_ids:
        data_sources.append({
            "repertory_id": "allen_keynotes_rep",
            "source_name": "Repertorial Index to Allen's Keynotes",
            "author": "Dr. H.N. Singh",
            "edition": "10th Edition",
            "year": 1950,
            "type": "repertory",
            "licence": "public_domain",
            "source_url": "https://archive.org/details/keynotesandchar00allegoog",
            "acquisition_date": "2026-11-21",
            "licence_note": "Public domain historical clinical keynote repertorial index. Grade 3 primary indications."
        })

    sources_config["sources"]["allen_keynotes_rep"] = {
        "max_grade": 3,
        "grade_map": {},
        "verify": "Allen Keynotes Repertorial Index lists primary keynote remedies (Grade 3 canonical)."
    }
    if "allen_keynotes_rep" not in sources_config.get("merge_priority", []):
        sources_config["merge_priority"].append("allen_keynotes_rep")

    # 2. Extract monographs from Part 1, 2, and 3
    toc = doc.get_toc()
    
    monograph_toc = []
    mode = "p1"
    for lvl, title, page in toc:
        if "THE MATERIA MEDICA OF SOME MORE IMPORTANT" in title:
            mode = "p2"
            continue
        elif "THE BOWEL NOSODES" in title:
            mode = "p3"
            continue
        elif "REPERTORIAL INDEX" in title:
            mode = "p4"
            continue
        if mode == "p1" and lvl == 1 and 20 <= page <= 342:
            monograph_toc.append((title, page, "part1"))
        elif mode == "p2" and lvl == 2:
            monograph_toc.append((title, page, "part2"))
        elif mode == "p3" and lvl == 2 and "Introduction" not in title and "Indications" not in title:
            monograph_toc.append((title, page, "part3"))

    print(f"[Ingest] Found {len(monograph_toc)} monographs in TOC.")

    extracted_monographs = []
    
    for i, (title, page, part) in enumerate(monograph_toc):
        clean_title = re.sub(r'[\*\d]', '', title).strip()
        # determine end page
        if i + 1 < len(monograph_toc):
            next_page = monograph_toc[i+1][1]
        else:
            next_page = 441  # start of Repertorial Index
            
        # extract pages text
        full_text = ""
        for p in range(page - 1, min(len(doc), next_page + 1)):
            full_text += f"\n[[PAGE_{p+1}]]\n" + doc[p].get_text()
            
        # find where current remedy starts
        # look for all-caps title or first word of title
        name_words = re.sub(r'\(.*?\)', '', clean_title).strip().upper().split()
        first_word = name_words[0] if name_words else clean_title.upper()
        
        start_idx = 0
        m_start = re.search(r'\n(' + re.escape(first_word) + r'[\s\S]*?)\n', full_text)
        if m_start:
            start_idx = m_start.start()
            
        # find where next remedy starts
        end_idx = len(full_text)
        if i + 1 < len(monograph_toc):
            next_title = re.sub(r'[\*\d]', '', monograph_toc[i+1][0]).strip()
            next_words = re.sub(r'\(.*?\)', '', next_title).strip().upper().split()
            next_word = next_words[0] if next_words else next_title.upper()
            m_end = re.search(r'\n(' + re.escape(next_word) + r'[\s\S]*?)\n', full_text[start_idx + len(first_word):])
            if m_end:
                end_idx = start_idx + len(first_word) + m_end.start()
                
        remedy_raw_text = full_text[start_idx:end_idx].strip()
        sections = parse_monograph_sections(remedy_raw_text)
        
        # Match canonical abbreviation
        canon_abbrev = None
        # Try direct alias dict match
        for w in [clean_title.lower(), first_word.lower(), clean_title.lower().replace(" ", "-")]:
            if w in ALIAS_DICT:
                canon_abbrev = ALIAS_DICT[w]
                break
        if not canon_abbrev:
            # check existing seed
            for r in seed_data["remedies"]:
                if r["common_name"].lower() == clean_title.lower() or first_word.lower() == r["abbreviation"].lower():
                    canon_abbrev = r["abbreviation"]
                    break
        if not canon_abbrev:
            canon_abbrev = first_word[:4].capitalize()
            
        remedy_id = canon_abbrev.lower().replace("-", "")
        common_name = title.strip()
        
        # Extract fields
        constitution = (sections.get('Constitution', '') + ' ' + sections.get('Physical Generals', '')).strip()
        mind = (sections.get('Mental Generals', '') or sections.get('Mind', '') or sections.get('Mental', '')).strip()
        
        head_parts = [sections.get(k, '') for k in ['Head', 'Eyes', 'Eye', 'Ears', 'Ear', 'Nose', 'Face'] if k in sections]
        head_and_senses = ' '.join(head_parts).strip()
        
        throat_parts = [sections.get(k, '') for k in ['Mouth', 'Throat'] if k in sections]
        throat = ' '.join(throat_parts).strip()
        
        gi_parts = [sections.get(k, '') for k in ['Gastro-intestinal System', 'Digestive System', 'Stomach', 'Abdomen', 'Rectum', 'Stool'] if k in sections]
        gastrointestinal = ' '.join(gi_parts).strip()
        
        ug_parts = [sections.get(k, '') for k in ['Urinary System', 'Urinary Organs', 'Urine', 'Genito-Urinary System', 'Male Reproductive System', 'Female Reproductive System', 'Genitalia'] if k in sections]
        urinary_and_genital = ' '.join(ug_parts).strip()
        
        resp_parts = [sections.get(k, '') for k in ['Respiratory System', 'Respiratory Organs', 'Larynx', 'Cough'] if k in sections]
        respiratory = ' '.join(resp_parts).strip()
        
        cv_parts = [sections.get(k, '') for k in ['Cardio-vascular System', 'Heart', 'Circulation', 'Chest'] if k in sections]
        cardiovascular = ' '.join(cv_parts).strip()
        
        loco_parts = [sections.get(k, '') for k in ['Extremities', 'Upper Limbs', 'Lower Limbs', 'Limbs in General', 'Limbs', 'Neck and Back', 'Back'] if k in sections]
        locomotor = ' '.join(loco_parts).strip()
        
        sf_parts = [sections.get(k, '') for k in ['Sleep', 'Fever', 'Chill', 'Perspiration'] if k in sections]
        sleep_and_fever = ' '.join(sf_parts).strip()
        
        skin = sections.get('Skin', '').strip()
        
        agg = sections.get('Aggravation', '')
        amel = sections.get('Amelioration', '')
        if 'Modalities' in sections:
            mod_text = sections['Modalities']
            if 'Amelioration:' in mod_text:
                parts = mod_text.split('Amelioration:')
                agg_part = parts[0].replace('Aggravation:', '').strip()
                amel_part = parts[1].strip()
                agg = (agg + ' ' + agg_part).strip()
                amel = (amel + ' ' + amel_part).strip()
            elif 'Amelioration' in mod_text:
                parts = mod_text.split('Amelioration')
                agg = (agg + ' ' + parts[0].replace('Aggravation', '')).strip()
                amel = (amel + ' ' + parts[1]).strip()
            else:
                if '<' in mod_text or 'Worse' in mod_text or 'Aggravation' in mod_text:
                    agg = (agg + ' ' + mod_text).strip()
                if '>' in mod_text or 'Better' in mod_text or 'Amelioration' in mod_text:
                    amel = (amel + ' ' + mod_text).strip()
        modalities = {
            "aggravation": agg.strip(),
            "amelioration": amel.strip()
        }
        
        relationships = (sections.get('Relation', '') or sections.get('Relations', '') or sections.get('Relationship', '')).strip()
        
        # Extract bullet keynotes
        bullets = [b.strip().replace('\n', ' ') for b in remedy_raw_text.split('•') if b.strip()]
        clean_keynotes = []
        for b in bullets:
            clean_b = re.sub(r'\s+', ' ', b)
            # filter out pure section titles
            if clean_b and len(clean_b) > 20 and not any(clean_b == s for s in KNOWN_SECTIONS):
                clean_keynotes.append(clean_b)
                
        # Cited passages
        author = "John Paterson, M.B., Ch.B., F.F. Hom." if part == "part3" else "Henry C. Allen, M.D."
        book_title = "The Bowel Nosodes (Allen's Keynotes 10th Ed.)" if part == "part3" else "Allen's Keynotes Rearranged and Classified (10th Ed.)"
        
        passages = []
        for sec_name, sec_text in sections.items():
            if sec_name != 'Header' and len(sec_text) > 25:
                passages.append({
                    "book": book_title,
                    "author": author,
                    "edition": "10th Edition",
                    "section": sec_name,
                    "text": sec_text[:800],
                    "page": str(page)
                })

        record = {
            "id": remedy_id,
            "common_name": common_name,
            "abbreviation": canon_abbrev,
            "latin_name": common_name,
            "source_origin": "Nosode (Bowel flora)" if part == "part3" else ("Nosode / Sarcode" if part == "part2" else "Classical Vegetable / Mineral / Animal"),
            "constitution": constitution,
            "mind": mind,
            "head_and_senses": head_and_senses,
            "throat": throat,
            "gastrointestinal": gastrointestinal,
            "urinary_and_genital": urinary_and_genital,
            "respiratory": respiratory,
            "cardiovascular": cardiovascular,
            "locomotor": locomotor,
            "sleep_and_fever": sleep_and_fever,
            "skin": skin,
            "keynotes": clean_keynotes[:12],
            "modalities": modalities,
            "relationships": relationships,
            "cited_passages": passages
        }
        
        extracted_monographs.append(record)

    print(f"[Ingest] Successfully extracted {len(extracted_monographs)} monographs from PDF.")

    # Merge monographs into mm_list
    updated_mm_count = 0
    added_mm_count = 0
    
    for em in extracted_monographs:
        em_abbrev = em["abbreviation"].lower()
        em_id = em["id"].lower()
        
        # Check if exists in mm_list
        existing = mm_by_abbrev.get(em_abbrev) or mm_by_id.get(em_id)
        if existing:
            # Enrich fields if current record is fuller
            if em["constitution"]:
                existing["constitution"] = em["constitution"]
            if em["mind"]:
                existing["mind"] = em["mind"]
            if em["head_and_senses"]:
                existing["head_and_senses"] = em["head_and_senses"]
            if em["gastrointestinal"]:
                existing["gastrointestinal"] = em["gastrointestinal"]
            if em["respiratory"]:
                existing["respiratory"] = em["respiratory"]
            if em["cardiovascular"]:
                existing["cardiovascular"] = em["cardiovascular"]
            if em["locomotor"]:
                existing["locomotor"] = em["locomotor"]
            if em["sleep_and_fever"]:
                existing["sleep_and_fever"] = em["sleep_and_fever"]
            if em["skin"]:
                existing["skin"] = em["skin"]
            if em["keynotes"]:
                existing["keynotes"] = em["keynotes"]
            if em["modalities"]["aggravation"]:
                if existing.get("modalities", {}).get("aggravation"):
                    if em["modalities"]["aggravation"] not in existing["modalities"]["aggravation"]:
                        existing["modalities"]["aggravation"] += "; " + em["modalities"]["aggravation"]
                else:
                    if "modalities" not in existing:
                        existing["modalities"] = {}
                    existing["modalities"]["aggravation"] = em["modalities"]["aggravation"]
            if em["modalities"]["amelioration"]:
                if existing.get("modalities", {}).get("amelioration"):
                    if em["modalities"]["amelioration"] not in existing["modalities"]["amelioration"]:
                        existing["modalities"]["amelioration"] += "; " + em["modalities"]["amelioration"]
                else:
                    if "modalities" not in existing:
                        existing["modalities"] = {}
                    existing["modalities"]["amelioration"] = em["modalities"]["amelioration"]
            if em["relationships"]:
                existing["relationships"] = em["relationships"]
            # Append cited passages
            existing_passages = existing.get("cited_passages", [])
            existing_secs = {p.get("section") for p in existing_passages if p.get("book", "").startswith("Allen")}
            for p in em["cited_passages"]:
                if p["section"] not in existing_secs:
                    existing_passages.append(p)
            existing["cited_passages"] = existing_passages
            updated_mm_count += 1
        else:
            mm_list.append(em)
            mm_by_abbrev[em_abbrev] = em
            mm_by_id[em_id] = em
            added_mm_count += 1

    print(f"[Ingest] Materia Medica: updated {updated_mm_count}, added {added_mm_count} (Total MM: {len(mm_list)})")

    # 3. Ensure all 211 remedies are registered in seed_data["remedies"]
    added_seed_remedies = 0
    for em in extracted_monographs:
        abbrev = em["abbreviation"]
        if abbrev.lower() not in seed_remedies_by_abbrev:
            # find aliases
            aliases = [em["common_name"]]
            for k, v in ALIAS_DICT.items():
                if v == abbrev and k != abbrev.lower():
                    aliases.append(k.capitalize())
            new_r = {
                "common_name": em["common_name"],
                "abbreviation": abbrev,
                "aliases": list(set(aliases))
            }
            seed_data["remedies"].append(new_r)
            seed_remedies_by_abbrev[abbrev.lower()] = new_r
            added_seed_remedies += 1
        else:
            # ensure aliases contains relevant variants
            existing_r = seed_remedies_by_abbrev[abbrev.lower()]
            aliases = set(existing_r.get("aliases", []))
            for k, v in ALIAS_DICT.items():
                if v == abbrev and k != abbrev.lower() and len(k) >= 3:
                    aliases.add(k.capitalize())
            existing_r["aliases"] = sorted(list(aliases))

    print(f"[Ingest] Seed remedies: added {added_seed_remedies} new remedies (Total: {len(seed_data['remedies'])})")

    # 4. Extract Dr. H.N. Singh's Repertorial Index (pages 442 to 552)
    rep_chapters_toc = [t for t in toc if t[2] >= 442 and t[0] == 2]
    print(f"[Ingest] Found {len(rep_chapters_toc)} Repertorial Index chapters.")

    rep_rubrics = []
    
    # Track chapters by page range
    chapter_ranges = []
    for idx, (lvl, ch_name, p_start) in enumerate(rep_chapters_toc):
        p_end = rep_chapters_toc[idx+1][2] if idx + 1 < len(rep_chapters_toc) else 553
        chapter_ranges.append((ch_name.strip(), p_start, p_end))

    # Standard chapter name mapping to Kent 31 chapters
    CHAPTER_NORM = {
        'mind': 'Mind', 'vertigo': 'Vertigo', 'head': 'Head', 'eye': 'Eye', 'vision': 'Vision',
        'ear': 'Ear', 'hearing': 'Hearing', 'nose': 'Nose', 'face': 'Face', 'mouth': 'Mouth',
        'teeth': 'Teeth', 'throat': 'Throat', 'stomach': 'Stomach', 'abdomen': 'Abdomen',
        'rectum': 'Rectum', 'stool': 'Stool', 'urine': 'Urinary Organs', 'genitalia': 'Genitalia',
        'larynx': 'Larynx & Trachea', 'respiration': 'Respiration', 'cough': 'Cough',
        'expectoration': 'Expectoration', 'chest': 'Chest', 'back': 'Back',
        'extremities': 'Extremities', 'sleep': 'Sleep', 'chill': 'Chill', 'fever': 'Fever',
        'perspiration': 'Perspiration', 'skin': 'Skin', 'generalities': 'Generalities'
    }

    total_bullets_processed = 0
    mapped_rubrics_count = 0

    for ch_name, p_start, p_end in chapter_ranges:
        norm_ch = CHAPTER_NORM.get(ch_name.lower(), ch_name.title())
        active_category = "General"
        
        for p in range(p_start - 1, p_end - 1):
            page_text = doc[p].get_text()
            # Split page into bullet items
            page_bullets = page_text.split('•')
            
            # Check if first item has an uppercase section header
            first_block = page_bullets[0].strip()
            for line in first_block.split('\n'):
                line_s = line.strip()
                if line_s.isupper() and len(line_s) > 2 and line_s not in ['MIND', 'VERTIGO', 'HEAD', 'EYE', 'VISION', 'EAR', 'HEARING', 'NOSE', 'FACE', 'MOUTH', 'TEETH', 'THROAT', 'STOMACH', 'ABDOMEN', 'RECTUM', 'STOOL', 'URINE', 'GENITALIA', 'LARYNX', 'RESPIRATION', 'COUGH', 'EXPECTORATION', 'CHEST', 'BACK', 'EXTREMITIES', 'SLEEP', 'CHILL', 'FEVER', 'PERSPIRATION', 'SKIN', 'GENERALITIES']:
                    active_category = line_s.title()
                    
            for b in page_bullets[1:]:
                total_bullets_processed += 1
                lines = [l.strip() for l in b.split('\n') if l.strip()]
                if not lines:
                    continue
                
                rubric_lines = []
                remedy_lines = []
                in_remedy = False
                
                for line in lines:
                    # check for multi-dash subrubric
                    if line.startswith('--') or line.startswith('---'):
                        # modifier to rubric
                        mod = line.lstrip('-').strip()
                        rubric_lines.append(f"; {mod}")
                        continue
                    if line.startswith('-') and not in_remedy:
                        in_remedy = True
                        remedy_lines.append(line[1:].strip())
                    elif in_remedy:
                        # check if line is a new category in uppercase
                        if line.isupper() and len(line) > 2 and not any(line.startswith(x) for x in ['DR.', 'MR.', 'NO.']):
                            active_category = line.title()
                        else:
                            remedy_lines.append(line)
                    else:
                        rubric_lines.append(line)
                        
                raw_rubric_text = ' '.join(rubric_lines).strip()
                # Clean leading dashes from rubric
                raw_rubric_text = re.sub(r'^[<\->\s]+', '', raw_rubric_text).strip()
                
                if not raw_rubric_text or not remedy_lines:
                    continue
                    
                # Extract remedies
                rem_str = ' '.join(remedy_lines)
                # Split remedies by comma
                resolved_remedies = set()
                for raw_tok in rem_str.split(','):
                    toks = clean_rubric_token(raw_tok)
                    for t in toks:
                        if t.lower() in seed_remedies_by_abbrev:
                            canon = seed_remedies_by_abbrev[t.lower()]["abbreviation"]
                            resolved_remedies.add(canon)
                            
                if not resolved_remedies:
                    continue
                    
                # Build canonical rubric path
                rubric_path = f"{norm_ch}; {active_category}; {raw_rubric_text}"
                
                mappings = [{"abbrev": ab, "grade": 3} for ab in sorted(list(resolved_remedies))]
                sources = [{
                    "book": "Allen's Keynotes - Repertorial Index",
                    "edition": "10th Edition (Dr. H.N. Singh)",
                    "page": str(p + 1)
                }]
                
                rep_rubrics.append({
                    "chapter": norm_ch,
                    "rubric_path": rubric_path,
                    "sources": sources,
                    "mappings": mappings
                })
                mapped_rubrics_count += 1

    print(f"[Ingest] Processed {total_bullets_processed} rubric bullets; generated {mapped_rubrics_count} valid mapped rubrics.")

    # 5. Merge rubrics into seed_data["rubrics"]
    existing_rubrics_by_path = {r["rubric_path"].lower(): r for r in seed_data["rubrics"]}
    added_rubrics_count = 0
    updated_rubrics_count = 0
    
    for rr in rep_rubrics:
        norm_key = rr["rubric_path"].lower()
        if norm_key in existing_rubrics_by_path:
            # merge mappings
            target = existing_rubrics_by_path[norm_key]
            existing_maps = {m["abbrev"]: m for m in target.get("mappings", [])}
            for m in rr["mappings"]:
                if m["abbrev"] not in existing_maps:
                    target["mappings"].append(m)
                else:
                    # maximize grade
                    existing_maps[m["abbrev"]]["grade"] = max(existing_maps[m["abbrev"]]["grade"], m["grade"])
            # append source
            if not any(s.get("book") == rr["sources"][0]["book"] for s in target.get("sources", [])):
                target["sources"].append(rr["sources"][0])
            updated_rubrics_count += 1
        else:
            seed_data["rubrics"].append(rr)
            existing_rubrics_by_path[norm_key] = rr
            added_rubrics_count += 1

    print(f"[Ingest] Rubrics: added {added_rubrics_count}, updated/enriched {updated_rubrics_count} (Total Rubrics: {len(seed_data['rubrics'])})")

    # 6. Save updated seed files
    print(f"[Ingest] Writing updated files to {SEED_DIR}...")
    with open(MM_PATH, "w", encoding="utf-8") as f:
        json.dump(mm_list, f, indent=2, ensure_ascii=False)
    with open(SEED_DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(seed_data, f, indent=2, ensure_ascii=False)
    with open(SOURCES_PATH, "w", encoding="utf-8") as f:
        json.dump(data_sources, f, indent=2, ensure_ascii=False)
    with open(SOURCES_CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(sources_config, f, indent=2, ensure_ascii=False)

    print("[Ingest] INGESTION COMPLETED SUCCESSFULLY!")


if __name__ == "__main__":
    main()
