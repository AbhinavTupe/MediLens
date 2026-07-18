from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable


@dataclass(frozen=True)
class ParameterSpec:
    name: str
    aliases: tuple[str, ...]
    unit: str
    normal_min: float | None
    normal_max: float | None
    description: str
    common_causes: tuple[str, ...]
    lifestyle_suggestions: tuple[str, ...]
    consult_doctor: str

    @property
    def normal_range(self) -> str:
        if self.normal_min is None and self.normal_max is None:
            return ""
        if self.normal_min is None:
            return f"<= {self.normal_max:g}"
        if self.normal_max is None:
            return f">= {self.normal_min:g}"
        return f"{self.normal_min:g} - {self.normal_max:g}"


PARAMETER_SPECS: dict[str, ParameterSpec] = {
    "Hemoglobin": ParameterSpec(
        name="Hemoglobin",
        aliases=("hemoglobin", "haemoglobin", "hb", "hgb"),
        unit="g/dL",
        normal_min=13.0,
        normal_max=17.0,
        description="Oxygen-carrying protein in red blood cells.",
        common_causes=("iron deficiency", "blood loss", "chronic inflammation", "vitamin B12 or folate deficiency"),
        lifestyle_suggestions=("Eat iron-rich foods with vitamin C", "Avoid self-starting iron without clinician guidance"),
        consult_doctor="Consult a clinician promptly for marked low hemoglobin, breathlessness, chest pain, fainting, or black stools.",
    ),
    "RBC": ParameterSpec(
        name="RBC",
        aliases=("rbc", "red blood cell", "red blood cells", "rbc count"),
        unit="million/uL",
        normal_min=4.5,
        normal_max=5.5,
        description="Count of red blood cells circulating in blood.",
        common_causes=("anemia", "dehydration", "bone marrow disorders", "chronic hypoxia"),
        lifestyle_suggestions=("Hydrate well before repeat testing", "Discuss persistent abnormalities with a clinician"),
        consult_doctor="Consult a clinician if RBC is persistently outside range or paired with abnormal hemoglobin.",
    ),
    "WBC": ParameterSpec(
        name="WBC",
        aliases=("wbc", "white blood cell", "white blood cells", "total leukocyte count", "tlc"),
        unit="/uL",
        normal_min=4000,
        normal_max=11000,
        description="White blood cell count used to assess infection or inflammation signals.",
        common_causes=("infection", "inflammation", "medications", "bone marrow conditions"),
        lifestyle_suggestions=("Track fever or infection symptoms", "Avoid interpreting WBC without the differential count"),
        consult_doctor="Consult a clinician urgently for very high WBC, fever, severe weakness, or recurrent infections.",
    ),
    "Platelets": ParameterSpec(
        name="Platelets",
        aliases=("platelets", "platelet count", "plt"),
        unit="/uL",
        normal_min=150000,
        normal_max=410000,
        description="Blood cells involved in clotting.",
        common_causes=("infection", "iron deficiency", "inflammation", "bleeding risk", "medication effects"),
        lifestyle_suggestions=("Report unusual bruising or bleeding", "Review medications and supplements with a clinician"),
        consult_doctor="Consult a clinician quickly for very low platelets, bleeding, or unexplained bruising.",
    ),
    "MCV": ParameterSpec(
        name="MCV",
        aliases=("mcv", "mean corpuscular volume"),
        unit="fL",
        normal_min=80,
        normal_max=100,
        description="Average size of red blood cells.",
        common_causes=("iron deficiency", "vitamin B12 deficiency", "folate deficiency", "liver disease"),
        lifestyle_suggestions=("Pair interpretation with hemoglobin and ferritin", "Ask about B12 or folate testing if MCV is high"),
        consult_doctor="Consult a clinician if MCV is abnormal with anemia symptoms or persistent fatigue.",
    ),
    "MCH": ParameterSpec(
        name="MCH",
        aliases=("mch", "mean corpuscular hemoglobin"),
        unit="pg",
        normal_min=27,
        normal_max=33,
        description="Average hemoglobin amount per red blood cell.",
        common_causes=("iron deficiency", "thalassemia trait", "macrocytic anemia"),
        lifestyle_suggestions=("Interpret together with MCV and RDW", "Discuss iron studies if low"),
        consult_doctor="Consult a clinician if MCH is abnormal with low hemoglobin.",
    ),
    "MCHC": ParameterSpec(
        name="MCHC",
        aliases=("mchc", "mean corpuscular hemoglobin concentration"),
        unit="g/dL",
        normal_min=32,
        normal_max=36,
        description="Average concentration of hemoglobin inside red blood cells.",
        common_causes=("iron deficiency", "hereditary spherocytosis", "lab artifact"),
        lifestyle_suggestions=("Review with the full CBC", "Repeat testing if results conflict with symptoms"),
        consult_doctor="Consult a clinician if MCHC is abnormal with anemia or jaundice symptoms.",
    ),
    "RDW": ParameterSpec(
        name="RDW",
        aliases=("rdw", "red cell distribution width"),
        unit="%",
        normal_min=11.5,
        normal_max=14.5,
        description="Variation in red blood cell size.",
        common_causes=("iron deficiency", "mixed nutritional deficiency", "recent blood loss"),
        lifestyle_suggestions=("Pair RDW with ferritin, B12, and MCV", "Discuss dietary patterns if high"),
        consult_doctor="Consult a clinician if RDW is high with low hemoglobin or persistent fatigue.",
    ),
    "Ferritin": ParameterSpec(
        name="Ferritin",
        aliases=("ferritin", "serum ferritin"),
        unit="ng/mL",
        normal_min=20,
        normal_max=200,
        description="Storage form of iron and an inflammation-sensitive marker.",
        common_causes=("iron deficiency", "inflammation", "liver disease", "iron overload"),
        lifestyle_suggestions=("Discuss iron replacement only after medical review", "Include vitamin C foods with plant iron sources"),
        consult_doctor="Consult a clinician if ferritin is very low, very high, or discordant with hemoglobin.",
    ),
    "Vitamin D": ParameterSpec(
        name="Vitamin D",
        aliases=("vitamin d", "25-oh vitamin d", "25 hydroxy vitamin d", "25(oh)d"),
        unit="ng/mL",
        normal_min=20,
        normal_max=50,
        description="Vitamin involved in bone, muscle, and immune health.",
        common_causes=("limited sunlight", "low dietary intake", "malabsorption", "kidney or liver disease"),
        lifestyle_suggestions=("Discuss safe sunlight exposure", "Consider diet and supplementation under clinician guidance"),
        consult_doctor="Consult a clinician for severe deficiency, bone pain, muscle weakness, or kidney disease.",
    ),
    "Vitamin B12": ParameterSpec(
        name="Vitamin B12",
        aliases=("vitamin b12", "b12", "cobalamin"),
        unit="pg/mL",
        normal_min=200,
        normal_max=900,
        description="Vitamin needed for nerve function and red blood cell production.",
        common_causes=("low intake", "pernicious anemia", "metformin use", "malabsorption"),
        lifestyle_suggestions=("Discuss B12-rich foods or supplements", "Review medications that affect B12"),
        consult_doctor="Consult a clinician for numbness, gait changes, memory symptoms, or macrocytic anemia.",
    ),
    "Creatinine": ParameterSpec(
        name="Creatinine",
        aliases=("creatinine", "serum creatinine", "scr"),
        unit="mg/dL",
        normal_min=0.6,
        normal_max=1.3,
        description="Waste product used to estimate kidney filtration.",
        common_causes=("dehydration", "kidney disease", "high muscle mass", "medication effects"),
        lifestyle_suggestions=("Hydrate unless fluid-restricted", "Avoid unnecessary NSAID use unless prescribed"),
        consult_doctor="Consult a clinician promptly for rising creatinine, reduced urine, swelling, or high blood pressure.",
    ),
    "Urea": ParameterSpec(
        name="Urea",
        aliases=("urea", "blood urea", "bun", "blood urea nitrogen"),
        unit="mg/dL",
        normal_min=7,
        normal_max=20,
        description="Nitrogen waste marker influenced by kidney function, hydration, and protein intake.",
        common_causes=("dehydration", "kidney dysfunction", "high protein intake", "gastrointestinal bleeding"),
        lifestyle_suggestions=("Maintain hydration if medically appropriate", "Review protein intake with a clinician if elevated"),
        consult_doctor="Consult a clinician if urea is high with vomiting, confusion, swelling, or reduced urination.",
    ),
    "eGFR": ParameterSpec(
        name="eGFR",
        aliases=("egfr", "estimated gfr", "estimated glomerular filtration rate"),
        unit="mL/min/1.73m2",
        normal_min=60,
        normal_max=None,
        description="Estimated kidney filtration rate.",
        common_causes=("chronic kidney disease", "acute kidney stress", "dehydration", "age-related decline"),
        lifestyle_suggestions=("Monitor blood pressure", "Discuss diabetes and kidney-protective habits with a clinician"),
        consult_doctor="Consult a clinician if eGFR is below 60, falling over time, or paired with protein in urine.",
    ),
    "Glucose": ParameterSpec(
        name="Glucose",
        aliases=("glucose", "fasting glucose", "blood glucose", "fbs", "fasting blood sugar"),
        unit="mg/dL",
        normal_min=70,
        normal_max=100,
        description="Blood sugar value, often interpreted fasting or random depending on the report.",
        common_causes=("diabetes", "stress response", "recent meal", "medication effects"),
        lifestyle_suggestions=("Pair carbohydrates with protein and fiber", "Repeat fasting or HbA1c testing when advised"),
        consult_doctor="Consult a clinician for high glucose, excessive thirst, frequent urination, or unexplained weight loss.",
    ),
    "HbA1c": ParameterSpec(
        name="HbA1c",
        aliases=("hba1c", "hb a1c", "glycated hemoglobin", "a1c"),
        unit="%",
        normal_min=4.0,
        normal_max=5.6,
        description="Approximate average glucose exposure over the previous 2-3 months.",
        common_causes=("prediabetes", "diabetes", "anemia-related measurement bias", "kidney disease"),
        lifestyle_suggestions=("Prioritize consistent activity and high-fiber meals", "Discuss repeat testing if anemia is present"),
        consult_doctor="Consult a clinician if HbA1c is in prediabetes or diabetes range or symptoms are present.",
    ),
    "Cholesterol": ParameterSpec(
        name="Cholesterol",
        aliases=("total cholesterol", "cholesterol", "tc"),
        unit="mg/dL",
        normal_min=120,
        normal_max=200,
        description="Total cholesterol concentration across lipoprotein fractions.",
        common_causes=("dietary patterns", "genetics", "thyroid disease", "diabetes"),
        lifestyle_suggestions=("Choose unsaturated fats and fiber-rich foods", "Increase regular physical activity if cleared"),
        consult_doctor="Consult a clinician for persistent high cholesterol or known cardiovascular risk.",
    ),
    "Triglycerides": ParameterSpec(
        name="Triglycerides",
        aliases=("triglycerides", "tg"),
        unit="mg/dL",
        normal_min=0,
        normal_max=150,
        description="Blood fat marker influenced by diet, metabolism, alcohol, and insulin resistance.",
        common_causes=("insulin resistance", "alcohol intake", "high refined carbohydrate intake", "genetics"),
        lifestyle_suggestions=("Reduce sugary drinks and refined carbohydrates", "Limit alcohol if triglycerides are elevated"),
        consult_doctor="Consult a clinician urgently for very high triglycerides or abdominal pain.",
    ),
    "HDL": ParameterSpec(
        name="HDL",
        aliases=("hdl", "hdl cholesterol", "high density lipoprotein"),
        unit="mg/dL",
        normal_min=40,
        normal_max=None,
        description="Protective cholesterol fraction associated with reverse cholesterol transport.",
        common_causes=("low activity", "smoking", "insulin resistance", "genetics"),
        lifestyle_suggestions=("Increase aerobic activity if cleared", "Stop smoking and prioritize unsaturated fats"),
        consult_doctor="Consult a clinician if HDL is low with other lipid or metabolic risks.",
    ),
    "LDL": ParameterSpec(
        name="LDL",
        aliases=("ldl", "ldl cholesterol", "low density lipoprotein"),
        unit="mg/dL",
        normal_min=0,
        normal_max=100,
        description="Atherogenic cholesterol fraction used in cardiovascular risk assessment.",
        common_causes=("dietary patterns", "genetics", "diabetes", "hypothyroidism"),
        lifestyle_suggestions=("Increase soluble fiber", "Discuss cardiovascular risk-based targets with a clinician"),
        consult_doctor="Consult a clinician for high LDL, diabetes, hypertension, or family history of early heart disease.",
    ),
    "TSH": ParameterSpec(
        name="TSH",
        aliases=("tsh", "thyroid stimulating hormone"),
        unit="uIU/mL",
        normal_min=0.4,
        normal_max=4.0,
        description="Pituitary hormone used to screen thyroid function.",
        common_causes=("hypothyroidism", "hyperthyroidism", "thyroid medication dose", "pregnancy-related variation"),
        lifestyle_suggestions=("Take thyroid medication consistently if prescribed", "Discuss symptoms and repeat testing"),
        consult_doctor="Consult a clinician for abnormal TSH with palpitations, weight change, fatigue, or pregnancy.",
    ),
    "ALT": ParameterSpec(
        name="ALT",
        aliases=("alt", "sgpt", "alanine aminotransferase"),
        unit="U/L",
        normal_min=7,
        normal_max=56,
        description="Liver enzyme that can rise with liver cell injury.",
        common_causes=("fatty liver", "viral hepatitis", "alcohol", "medication effects"),
        lifestyle_suggestions=("Avoid alcohol until reviewed if elevated", "Review medications and supplements with a clinician"),
        consult_doctor="Consult a clinician for high ALT, jaundice, severe abdominal pain, or dark urine.",
    ),
    "AST": ParameterSpec(
        name="AST",
        aliases=("ast", "sgot", "aspartate aminotransferase"),
        unit="U/L",
        normal_min=8,
        normal_max=48,
        description="Enzyme found in liver, muscle, and other tissues.",
        common_causes=("liver injury", "muscle injury", "alcohol-related liver disease", "medication effects"),
        lifestyle_suggestions=("Avoid strenuous exercise before repeat testing if muscle source is suspected", "Review alcohol and medications"),
        consult_doctor="Consult a clinician for high AST with jaundice, weakness, chest pain, or abdominal pain.",
    ),
    "ALP": ParameterSpec(
        name="ALP",
        aliases=("alp", "alkaline phosphatase"),
        unit="U/L",
        normal_min=44,
        normal_max=147,
        description="Enzyme associated with bile ducts and bone turnover.",
        common_causes=("bile duct disease", "bone growth or disease", "vitamin D deficiency", "pregnancy"),
        lifestyle_suggestions=("Interpret with GGT, bilirubin, calcium, and vitamin D", "Discuss bone or liver symptoms"),
        consult_doctor="Consult a clinician for high ALP with jaundice, itching, bone pain, or unexplained weight loss.",
    ),
    "Bilirubin": ParameterSpec(
        name="Bilirubin",
        aliases=("bilirubin", "total bilirubin"),
        unit="mg/dL",
        normal_min=0.1,
        normal_max=1.2,
        description="Pigment produced from red blood cell breakdown and processed by the liver.",
        common_causes=("Gilbert syndrome", "liver disease", "bile duct obstruction", "hemolysis"),
        lifestyle_suggestions=("Hydrate and avoid alcohol until reviewed if elevated", "Track jaundice or dark urine symptoms"),
        consult_doctor="Consult a clinician promptly for jaundice, dark urine, pale stools, or abdominal pain.",
    ),
    "Sodium": ParameterSpec(
        name="Sodium",
        aliases=("sodium", "na", "na+"),
        unit="mmol/L",
        normal_min=135,
        normal_max=145,
        description="Major electrolyte involved in fluid balance and nerve signaling.",
        common_causes=("dehydration", "overhydration", "kidney disease", "medication effects"),
        lifestyle_suggestions=("Do not rapidly correct sodium without medical supervision", "Review fluid intake and medications"),
        consult_doctor="Consult a clinician urgently for confusion, seizures, severe weakness, or very abnormal sodium.",
    ),
    "Potassium": ParameterSpec(
        name="Potassium",
        aliases=("potassium", "k", "k+"),
        unit="mmol/L",
        normal_min=3.5,
        normal_max=5.1,
        description="Electrolyte essential for heart rhythm and muscle function.",
        common_causes=("kidney disease", "medications", "vomiting or diarrhea", "sample hemolysis"),
        lifestyle_suggestions=("Avoid potassium supplements unless prescribed", "Repeat testing may be needed if sample hemolysis is suspected"),
        consult_doctor="Consult a clinician urgently for very high or low potassium, palpitations, or weakness.",
    ),
    "Chloride": ParameterSpec(
        name="Chloride",
        aliases=("chloride", "cl", "cl-"),
        unit="mmol/L",
        normal_min=98,
        normal_max=107,
        description="Electrolyte that helps maintain acid-base and fluid balance.",
        common_causes=("dehydration", "vomiting", "kidney disorders", "acid-base disturbances"),
        lifestyle_suggestions=("Interpret alongside sodium, bicarbonate, and kidney markers", "Discuss persistent abnormalities"),
        consult_doctor="Consult a clinician for significant chloride abnormalities with dehydration, confusion, or breathing changes.",
    ),
}


def iter_specs() -> Iterable[ParameterSpec]:
    return PARAMETER_SPECS.values()


def get_spec(name: str) -> ParameterSpec | None:
    lowered = name.strip().lower()
    for spec in PARAMETER_SPECS.values():
        if lowered == spec.name.lower() or lowered in {alias.lower() for alias in spec.aliases}:
            return spec
    return None


DISEASE_KNOWLEDGE: dict[str, dict[str, object]] = {
    "Anemia": {
        "description": "A reduced oxygen-carrying capacity commonly linked to low hemoglobin, iron deficiency, B12 deficiency, blood loss, or chronic inflammation.",
        "risk_factors": ("low hemoglobin", "low ferritin", "low MCV", "nutritional deficiency", "blood loss"),
        "lifestyle_suggestions": (
            "Include iron-rich foods such as lentils, beans, leafy greens, eggs, and lean meat",
            "Pair iron sources with vitamin C for absorption",
            "Avoid tea or coffee immediately after meals if iron deficiency is suspected",
        ),
        "when_to_consult": "Seek medical advice for fatigue, shortness of breath, chest pain, black stools, fainting, or persistently low hemoglobin.",
        "reference_text": (
            "Anemia is evaluated using hemoglobin, RBC indices, ferritin, vitamin B12, and RDW. "
            "Low hemoglobin together with low ferritin or abnormal MCV strongly suggests an iron-related cause, "
            "but chronic disease, bleeding, and vitamin deficiency should also be considered."
        ),
    },
    "Diabetes": {
        "description": "A metabolic disorder characterized by elevated glucose or HbA1c values that reflect impaired glucose control.",
        "risk_factors": ("high glucose", "high HbA1c", "insulin resistance", "central obesity", "family history"),
        "lifestyle_suggestions": (
            "Choose high-fiber meals and avoid sugary drinks",
            "Add regular physical activity if medically cleared",
            "Discuss HbA1c follow-up testing and diabetes prevention strategies with a clinician",
        ),
        "when_to_consult": "Consult a clinician for repeated high glucose, excessive thirst, frequent urination, unexplained weight loss, or HbA1c in the prediabetes or diabetes range.",
        "reference_text": (
            "Diabetes risk assessment uses fasting glucose, HbA1c, triglycerides, HDL, LDL, and kidney markers. "
            "Higher glucose together with elevated HbA1c or insulin-resistance patterns increases the likelihood of diabetes."
        ),
    },
    "Chronic Kidney Disease": {
        "description": "A progressive reduction in kidney filtration typically reflected by elevated creatinine, urea, and reduced eGFR.",
        "risk_factors": ("high creatinine", "low eGFR", "high urea", "hypertension", "diabetes"),
        "lifestyle_suggestions": (
            "Maintain clinician-guided hydration and blood pressure control",
            "Review salt intake and avoid unnecessary NSAID use",
            "Discuss kidney-protective management if diabetes or hypertension is present",
        ),
        "when_to_consult": "Seek medical review for swelling, reduced urine output, rising creatinine, persistently low eGFR, or abnormal potassium levels.",
        "reference_text": (
            "Chronic kidney disease assessment focuses on creatinine, urea, eGFR, electrolytes, and urine-related findings when available. "
            "Declining eGFR with higher creatinine is more meaningful than either marker alone."
        ),
    },
}


def iter_disease_knowledge() -> Iterable[tuple[str, dict[str, object]]]:
    return DISEASE_KNOWLEDGE.items()


def build_reference_corpus() -> list[str]:
    corpus: list[str] = []
    for spec in iter_specs():
        corpus.append(
            (
                f"{spec.name}: {spec.description} Normal range: {spec.normal_range or 'not specified'}. "
                f"Common causes: {', '.join(spec.common_causes)}. "
                f"Lifestyle suggestions: {', '.join(spec.lifestyle_suggestions)}. "
                f"When to consult: {spec.consult_doctor}"
            )
        )
    for disease_name, knowledge in iter_disease_knowledge():
        corpus.append(
            (
                f"{disease_name}: {knowledge['description']} "
                f"Risk factors: {', '.join(knowledge['risk_factors'])}. "
                f"Lifestyle suggestions: {', '.join(knowledge['lifestyle_suggestions'])}. "
                f"When to consult: {knowledge['when_to_consult']}. "
                f"{knowledge['reference_text']}"
            )
        )
    return corpus
