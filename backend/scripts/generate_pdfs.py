"""
Run once: python scripts/generate_pdfs.py
Generates 5 safety PDF documents and seeds them into Databricks.
"""
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fpdf import FPDF
from pathlib import Path

OUT = Path(__file__).parent.parent / "data" / "pdfs"
OUT.mkdir(parents=True, exist_ok=True)

DOCS = [
    {
        "file": "OSHA_PPE_Requirements.pdf",
        "title": "OSHA Personal Protective Equipment (PPE) Requirements",
        "ref": "29 CFR 1910.132 – 1910.138",
        "sections": {
            "Overview": (
                "Personal Protective Equipment (PPE) is equipment worn to minimize exposure to hazards "
                "that cause serious workplace injuries and illnesses. OSHA Standard 29 CFR 1910.132 requires "
                "employers to conduct a hazard assessment and provide appropriate PPE at no cost to employees."
            ),
            "Head Protection (29 CFR 1910.135)": (
                "Hard hats must be worn where there is a potential for head injury from falling objects, "
                "bumps, or electrical hazards. Class E (Electrical) hard hats protect against up to 20,000 volts. "
                "Inspect hard hats daily for cracks, dents, and deterioration. Replace after any impact."
            ),
            "Eye and Face Protection (29 CFR 1910.133)": (
                "Safety glasses, goggles, or face shields must be worn when exposed to flying particles, "
                "molten metal, liquid chemicals, acids, caustic liquids, chemical gases, or intense light. "
                "All eye protection must meet ANSI Z87.1 standards. Side shields are required in areas with "
                "flying debris."
            ),
            "Hand Protection (29 CFR 1910.138)": (
                "Gloves must be selected based on the specific hazard: chemical-resistant gloves for corrosives, "
                "cut-resistant gloves for sharp edges, insulated gloves for electrical work, and heat-resistant "
                "gloves for high-temperature operations. Never use gloves near rotating machinery."
            ),
            "Foot Protection (29 CFR 1910.136)": (
                "Safety-toed footwear must be worn where there is danger of foot injury from hot substances, "
                "corrosive materials, or falling/rolling objects. ASTM F2413 compliant footwear with impact "
                "resistance of 75 ft-lb and compression resistance of 2500 lb is required."
            ),
            "Respiratory Protection (29 CFR 1910.134)": (
                "A written Respiratory Protection Program is required when engineering controls are not feasible. "
                "Medical evaluation, fit testing, and training are mandatory before respirator use. N95 filters "
                "remove 95% of airborne particles. Supplied-air respirators (SCBA) are required for IDLH atmospheres."
            ),
            "PPE Training Requirements": (
                "Employers must train each employee on: when PPE is necessary, what PPE is required, "
                "how to properly don/doff/adjust/wear PPE, limitations of PPE, and proper care/maintenance. "
                "Retraining is required when reason to believe the employee does not understand proper use."
            ),
        }
    },
    {
        "file": "Chemical_Safety_HAZMAT.pdf",
        "title": "Chemical Safety and HAZMAT Handling Procedures",
        "ref": "29 CFR 1910.1200 – OSHA HazCom Standard",
        "sections": {
            "Hazard Communication (HazCom)": (
                "OSHA's Hazard Communication Standard (HCS) requires chemical manufacturers to evaluate "
                "hazards and communicate them via Safety Data Sheets (SDS) and labels. The GHS-aligned "
                "SDS has 16 sections providing comprehensive hazard information."
            ),
            "Safety Data Sheets (SDS)": (
                "SDS sections: 1-Identification, 2-Hazard Identification, 3-Composition, 4-First Aid, "
                "5-Firefighting, 6-Accidental Release, 7-Handling/Storage, 8-Exposure Controls/PPE, "
                "9-Physical/Chemical Properties, 10-Stability/Reactivity, 11-Toxicology, 12-Ecological, "
                "13-Disposal, 14-Transport, 15-Regulatory, 16-Other Information."
            ),
            "Chemical Storage Requirements": (
                "Flammable liquids must be stored in approved flammable storage cabinets away from ignition "
                "sources. Incompatible chemicals must be segregated: acids from bases, oxidizers from "
                "flammables, and toxics from food/beverages. All containers must be labeled with chemical "
                "name, hazard warnings, and date opened."
            ),
            "Chemical Spill Response": (
                "Minor spills (under 1 gallon): Don appropriate PPE, contain spill with absorbent materials, "
                "clean from outside in, dispose as hazardous waste. Major spills: evacuate area, call "
                "emergency response, do not enter without SCBA. Report all spills to supervisor immediately. "
                "Spill kit contents: absorbent pads, neutralizing agents, goggles, gloves, waste bags."
            ),
            "Emergency Response Procedures": (
                "Chemical emergency contacts: Emergency: 911, CHEMTREC: 1-800-424-9300, Poison Control: "
                "1-800-222-1222. For chemical exposure: remove contaminated clothing, flush with water "
                "15-20 minutes, seek medical attention. Do not induce vomiting for ingested chemicals "
                "unless directed by Poison Control."
            ),
            "HAZMAT Classification": (
                "DOT hazmat classes: Class 1-Explosives, Class 2-Gases, Class 3-Flammable Liquids, "
                "Class 4-Flammable Solids, Class 5-Oxidizers, Class 6-Toxic/Infectious, Class 7-Radioactive, "
                "Class 8-Corrosives, Class 9-Miscellaneous. Proper shipping name, UN number, and placards "
                "required for transport."
            ),
        }
    },
    {
        "file": "Fire_Prevention_Emergency.pdf",
        "title": "Fire Prevention and Emergency Response Procedures",
        "ref": "29 CFR 1910.157 – OSHA Fire Safety",
        "sections": {
            "Fire Prevention Plan": (
                "OSHA 29 CFR 1910.39 requires employers to have a written fire prevention plan including: "
                "list of major fire hazards, proper storage/handling of hazardous materials, ignition source "
                "control procedures, and housekeeping practices. Plan must be reviewed with each employee."
            ),
            "Fire Extinguisher Types": (
                "Class A: Ordinary combustibles (wood, paper, cloth) – water, foam, dry chemical. "
                "Class B: Flammable liquids/gases – CO2, dry chemical, foam. "
                "Class C: Electrical equipment – CO2, dry chemical (non-conductive). "
                "Class D: Combustible metals – dry powder only. "
                "Class K: Kitchen cooking oils – wet chemical agents."
            ),
            "PASS Technique": (
                "P – Pull the safety pin to break the tamper seal. "
                "A – Aim the nozzle at the base of the fire, not the flames. "
                "S – Squeeze the handle to discharge the extinguishing agent. "
                "S – Sweep from side to side at the base until fire is out. "
                "Extinguishers must be inspected monthly and serviced annually."
            ),
            "Fire Emergency Evacuation": (
                "Upon fire alarm activation: immediately stop work, close doors and windows, activate "
                "nearest pull station if not already alarmed, use nearest safe exit (not elevators), "
                "proceed to designated assembly point, report to floor warden, do not re-enter building "
                "until authorized by fire department."
            ),
            "Fire Watch Requirements": (
                "A fire watch must be posted during and after hot work operations (welding, cutting, "
                "grinding) for a minimum of 30 minutes. Fire watch personnel must have a fire extinguisher, "
                "knowledge of fire alarm activation, and authority to stop hot work. Document fire watch "
                "activities in the hot work permit."
            ),
            "Emergency Action Plan": (
                "EAP must include: emergency escape procedures and route assignments, procedures for "
                "critical operations before evacuation, headcount procedures, rescue/medical duties, "
                "means of reporting emergencies, and contact list. Must be reviewed annually and updated "
                "when facility layout changes."
            ),
        }
    },
    {
        "file": "Electrical_Safety_LOTO.pdf",
        "title": "Electrical Safety and Lockout/Tagout (LOTO) Procedures",
        "ref": "29 CFR 1910.147 / 1910.301-399",
        "sections": {
            "Electrical Hazard Overview": (
                "Electrical hazards cause over 300 deaths and 4,000 injuries annually in the U.S. "
                "Primary electrical hazards: electric shock (as low as 10mA can cause involuntary muscle "
                "reaction, 100mA can be fatal), arc flash (temperatures up to 35,000°F), arc blast "
                "(pressure waves up to 2000 lb/ft²), and fire from electrical faults."
            ),
            "Lockout/Tagout (LOTO) – 29 CFR 1910.147": (
                "LOTO prevents unexpected energization of equipment during servicing. Required steps: "
                "1-Notify affected employees, 2-Identify all energy sources, 3-Shut down equipment, "
                "4-Isolate energy sources, 5-Apply lockout/tagout devices, 6-Release stored energy "
                "(bleed, discharge, block), 7-Verify zero energy state before starting work."
            ),
            "Energy Isolation Devices": (
                "Acceptable lockout devices: padlocks (individually keyed, one key per worker), "
                "hasps (allows multiple locks for group lockout), lockout blocks, valve covers, "
                "and blanking flanges. Tags alone are NOT adequate when locks can be applied. "
                "Each authorized employee must apply their own personal lock."
            ),
            "Arc Flash Safety": (
                "Arc flash boundary categories require appropriate PPE: Incident Energy 1.2-4 cal/cm² "
                "requires Arc-Rated clothing 4 cal/cm² minimum. 4-8 cal/cm² requires AR clothing 8 cal/cm². "
                "8-25 cal/cm² requires AR clothing 25 cal/cm². Over 25 cal/cm² requires 40 cal/cm² AR suit. "
                "Always verify voltage before work with calibrated meters."
            ),
            "Ground Fault Circuit Interrupter (GFCI)": (
                "GFCIs are required for all 120V single-phase 15A/20A receptacles in construction, "
                "near water, and in temporary installations. GFCIs detect current imbalance of 4-6mA "
                "and trip in 1/40 second. Test GFCIs monthly using the Test/Reset button. "
                "Replace any GFCI that fails testing immediately."
            ),
            "Electrical PPE Requirements": (
                "When working on or near energized electrical equipment: insulated gloves rated for "
                "voltage, arc flash rated face shield and balaclava, arc-rated clothing, "
                "insulated tools, rubber mats, and safety glasses. Never work alone on energized systems. "
                "Minimum approach distances must be maintained per NFPA 70E."
            ),
        }
    },
    {
        "file": "Fall_Protection_Standards.pdf",
        "title": "Fall Protection and Working at Heights Safety Standards",
        "ref": "29 CFR 1926.502 / 1910.23 – OSHA Fall Protection",
        "sections": {
            "Fall Hazard Statistics": (
                "Falls are the leading cause of death in construction, accounting for over 350 fatalities "
                "annually. In general industry, falls cause over 200,000 injuries per year. OSHA requires "
                "fall protection at 4 feet (general industry), 5 feet (maritime), and 6 feet (construction). "
                "Fall protection is required near any unprotected edge or opening."
            ),
            "Fall Protection Systems": (
                "Guardrail systems: top rail 42 inches (±3), mid-rail at 21 inches, toe board 3.5 inches. "
                "Withstand 200 lb force. Safety net systems: installed within 30 feet below work area, "
                "withstand 17,500 lb drop test. Personal Fall Arrest Systems (PFAS): harness, lanyard, "
                "anchorage rated at 5,000 lb per worker."
            ),
            "Personal Fall Arrest System (PFAS)": (
                "Full-body harness must be worn (body belts are prohibited for fall arrest). "
                "Self-retracting lanyards limit free fall to 2 feet. Shock-absorbing lanyards allow "
                "up to 6-foot free fall. Anchorage points must support 5,000 lb. Perform pre-use "
                "inspection: check webbing for cuts, burns, chemical damage, and hardware for corrosion."
            ),
            "Ladder Safety": (
                "Portable ladders must extend 3 feet above landing. Set at 4:1 ratio (1 foot out "
                "for every 4 feet up). Never use top two rungs of a step ladder. Three points of "
                "contact at all times. Secure top and bottom to prevent movement. Rated for the combined "
                "weight of worker, tools, and materials. Inspect before each use."
            ),
            "Scaffolding Safety (29 CFR 1926.451)": (
                "Scaffolds must support 4x the maximum intended load. Planks must overlap 12 inches "
                "and extend 6-12 inches beyond supports. Guardrails required when scaffold is 10 feet "
                "or higher. Scaffold must be erected/moved/dismantled by a competent person. "
                "Access ladders or stairways required when scaffold is more than 2 feet above/below "
                "access point."
            ),
            "Fall Protection Training": (
                "Employees must be trained to recognize fall hazards and procedures to minimize them. "
                "Training topics: nature of fall hazards, correct use and operation of guardrail systems, "
                "PFAS, safety nets, covers, and warning lines. Retraining required when behavior indicates "
                "inadequate understanding or workplace changes create new hazards."
            ),
        }
    },
]

def clean(text):
    return (text
        .replace('–', '-').replace('—', '--')
        .replace('’', "'").replace('‘', "'")
        .replace('“', '"').replace('”', '"')
        .replace('²', '2').replace('°', ' degrees')
        .replace('®', '(R)').replace('©', '(C)')
    )

def make_pdf(doc):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Header
    pdf.set_fill_color(249, 115, 22)
    pdf.rect(0, 0, 210, 28, 'F')
    pdf.set_font("Helvetica", "B", 15)
    pdf.set_text_color(255, 255, 255)
    pdf.set_xy(10, 7)
    pdf.multi_cell(190, 7, clean(doc["title"]), align="C")

    # Ref
    pdf.set_font("Helvetica", size=9)
    pdf.set_xy(10, 21)
    pdf.cell(190, 5, clean(f"Reference: {doc['ref']}"), align="C")

    pdf.set_text_color(30, 30, 30)
    pdf.set_y(35)

    for section, content in doc["sections"].items():
        # Section heading
        pdf.set_fill_color(30, 41, 59)
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(0, 8, clean(f"  {section}"), new_x="LMARGIN", new_y="NEXT", fill=True)
        # Body
        pdf.set_font("Helvetica", size=10)
        pdf.set_text_color(40, 40, 40)
        pdf.set_x(10)
        pdf.multi_cell(190, 5.5, clean(content))
        pdf.ln(3)

    # Footer
    pdf.set_y(-15)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 10, "SafetyAI Workplace Assistant - Confidential Safety Document", align="C")

    out_path = OUT / doc["file"]
    pdf.output(str(out_path))
    print(f"Created: {out_path}")
    return doc["file"], doc["title"], doc["sections"]

if __name__ == "__main__":
    from fpdf import FPDF
    results = []
    for doc in DOCS:
        fname, title, sections = make_pdf(doc)
        results.append({"file": fname, "title": title, "sections": sections})
    print(f"\nAll {len(results)} PDFs generated in backend/data/pdfs/")

    # Seed into Databricks
    try:
        import uuid
        from datetime import datetime
        sys.path.insert(0, str(Path(__file__).parent.parent))
        from services.databricks import get_connection
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS safety_documents (
                id STRING, doc_name STRING, doc_file STRING,
                section STRING, content STRING, created_at STRING
            ) USING DELTA
        """)
        cursor.execute("DELETE FROM safety_documents")
        conn.commit()
        for doc in DOCS:
            for section, content in doc["sections"].items():
                cursor.execute(
                    "INSERT INTO safety_documents VALUES (?,?,?,?,?,?)",
                    [str(uuid.uuid4()), doc["title"], doc["file"], section, content, datetime.now().isoformat()]
                )
        conn.commit()
        cursor.close()
        conn.close()
        print("Seeded safety_documents table in Databricks successfully!")
    except Exception as e:
        print(f"Databricks seeding skipped: {e}")
