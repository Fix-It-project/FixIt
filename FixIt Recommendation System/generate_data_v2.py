"""
FixIt — Realistic Synthetic Data Generator (v2)

Generates data with LEARNABLE patterns that mirror real-world behavior:

1. USER PERSONAS:
   - Budget users    → prefer cheap, nearby technicians; simple problems
   - Balanced users  → moderate price/distance tradeoff
   - Quality users   → willing to pay more for experienced technicians

2. TECHNICIAN EXPERIENCE:
   - Years of experience → higher hourly rate
   - Sub-specialties within category (e.g., "leaky pipes" under Plumbing)
   - Better experience → higher completion rate + higher ratings

3. PROXIMITY BIAS:
   - Users STRONGLY prefer nearby technicians (probability decays with distance)
   - Same-cluster technicians get massive booking boost

4. PROBLEM SEVERITY:
   - Simple problems → budget users pick cheap/nearby techs
   - Complex problems → quality users pick experienced/specialized techs

5. REPEAT BOOKINGS:
   - Satisfied users (4-5 star) have 40% chance of re-booking same technician
   - Creates collaborative filtering signal

6. PRICE-QUALITY ALIGNMENT:
   - Experienced techs charge more but deliver better results
   - Budget users get lower satisfaction from expensive techs (overpaying)
   - Quality users get lower satisfaction from cheap inexperienced techs (poor work)

7. SPECIALIZATION MATCHING:
   - Technicians have sub-specialties (e.g., "pipe repair", "drain cleaning")
   - Users whose problem matches a tech's specialty get higher ratings

Usage:
    python generate_data_v2.py
"""

import random
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from faker import Faker

fake = Faker("ar_EG")
np.random.seed(42)
random.seed(42)

# ══════════════════════════════════════════════
#  CONSTANTS
# ══════════════════════════════════════════════
NUM_USERS = 500
NUM_TECHNICIANS = 100
NUM_BOOKINGS = 3000

CLUSTERS = {
    "Maadi":          (29.9592, 31.2590),
    "Nasr City":      (30.0626, 31.3283),
    "6th of October": (29.9714, 30.9415),
}

CATEGORIES = ["Plumbing", "Electrical", "Carpentry"]

# User personas and their behavior weights
USER_PERSONAS = {
    "budget":   {"price_sensitivity": 0.9, "quality_preference": 0.2, "max_radius_km": 8,  "frac": 0.35},
    "balanced": {"price_sensitivity": 0.5, "quality_preference": 0.5, "max_radius_km": 15, "frac": 0.40},
    "quality":  {"price_sensitivity": 0.2, "quality_preference": 0.9, "max_radius_km": 25, "frac": 0.25},
}

# Technician experience tiers
EXPERIENCE_TIERS = {
    "junior":      {"years_range": (1, 3),   "rate_range": (100, 200), "quality_base": 0.60, "frac": 0.30},
    "mid":         {"years_range": (4, 7),   "rate_range": (180, 300), "quality_base": 0.75, "frac": 0.40},
    "senior":      {"years_range": (8, 15),  "rate_range": (280, 450), "quality_base": 0.90, "frac": 0.20},
    "expert":      {"years_range": (15, 25), "rate_range": (400, 600), "quality_base": 0.95, "frac": 0.10},
}

# Sub-specialties per category (technicians are strong in 1-2 of these)
SUBSPECIALTIES = {
    "Plumbing": [
        ("pipe_repair",     "My kitchen sink is leaking continuously."),
        ("pipe_repair",     "Bathroom pipe burst, flooding the floor!"),
        ("drain_cleaning",  "The kitchen drain is clogged and water backs up."),
        ("drain_cleaning",  "Shower drain is very slow and smells terrible."),
        ("water_heater",    "The water heater is making strange noises and water is cold."),
        ("water_heater",    "Need the water heater replaced, it's rusty and old."),
        ("toilet_repair",   "The toilet won't flush properly."),
        ("toilet_repair",   "Toilet is constantly running, wasting water."),
        ("appliance_hookup","Need help installing a new washing machine drain."),
        ("appliance_hookup","Dishwasher water line needs professional installation."),
    ],
    "Electrical": [
        ("wiring",          "Half the lights in the apartment went out suddenly."),
        ("wiring",          "Need to rewire the living room for extra outlets."),
        ("fuse_box",        "The fuse box keeps tripping when I turn on the AC."),
        ("fuse_box",        "Main circuit breaker needs inspection and replacement."),
        ("fan_install",     "Need to install a new ceiling fan in the bedroom."),
        ("fan_install",     "Ceiling fan is wobbling dangerously and making noise."),
        ("outlet_repair",   "Sparking sound coming from the wall outlet."),
        ("outlet_repair",   "Wall outlet stopped working and smells like burning."),
        ("smart_setup",     "Wiring for the new smart TV setup."),
        ("smart_setup",     "Need smart home wiring for lights and thermostat."),
    ],
    "Carpentry": [
        ("door_repair",     "The bedroom door is stuck and won't close."),
        ("door_repair",     "Front door lock mechanism is jammed, door won't open."),
        ("shelving",        "Need custom shelves built for the living room."),
        ("shelving",        "Wall-mounted bookshelf needs professional installation."),
        ("cabinet_repair",  "Kitchen cabinet hinges are broken."),
        ("cabinet_repair",  "Bathroom cabinet door fell off, need repair."),
        ("furniture_assembly","Assembling a new IKEA wardrobe."),
        ("furniture_assembly","New office desk needs professional assembly."),
        ("table_repair",    "Fixing a broken leg on the dining table."),
        ("table_repair",    "Antique wooden table has cracks and needs restoration."),
    ],
}

# Problem severity by sub-specialty (0-1, higher = more complex)
SEVERITY = {
    "pipe_repair": 0.7, "drain_cleaning": 0.3, "water_heater": 0.8,
    "toilet_repair": 0.4, "appliance_hookup": 0.5,
    "wiring": 0.8, "fuse_box": 0.9, "fan_install": 0.4,
    "outlet_repair": 0.6, "smart_setup": 0.7,
    "door_repair": 0.3, "shelving": 0.5, "cabinet_repair": 0.3,
    "furniture_assembly": 0.2, "table_repair": 0.6,
}

EARTH_RADIUS_KM = 6371.0


# ══════════════════════════════════════════════
#  HELPERS
# ══════════════════════════════════════════════

def generate_location(cluster_coords, radius_degrees=0.02):
    lat = cluster_coords[0] + np.random.uniform(-radius_degrees, radius_degrees)
    lon = cluster_coords[1] + np.random.uniform(-radius_degrees, radius_degrees)
    return round(lat, 6), round(lon, 6)


def haversine_km(lat1, lon1, lat2, lon2):
    rlat1, rlon1 = np.radians(lat1), np.radians(lon1)
    rlat2, rlon2 = np.radians(lat2), np.radians(lon2)
    dlat, dlon = rlat2 - rlat1, rlon2 - rlon1
    a = np.sin(dlat / 2)**2 + np.cos(rlat1) * np.cos(rlat2) * np.sin(dlon / 2)**2
    return 2 * EARTH_RADIUS_KM * np.arcsin(np.sqrt(a))


# ══════════════════════════════════════════════
#  1. GENERATE USERS
# ══════════════════════════════════════════════
print("Generating users with behavioral personas …")
users_data = []
persona_names = list(USER_PERSONAS.keys())
persona_probs = [USER_PERSONAS[p]["frac"] for p in persona_names]

for i in range(1, NUM_USERS + 1):
    cluster_name = random.choice(list(CLUSTERS.keys()))
    lat, lon = generate_location(CLUSTERS[cluster_name])

    persona = np.random.choice(persona_names, p=persona_probs)

    # Users tend to need one category more than others (e.g., old apartment = plumbing)
    primary_cat = np.random.choice(CATEGORIES, p=[0.5, 0.3, 0.2])
    cat_probs = {c: 0.10 for c in CATEGORIES}
    cat_probs[primary_cat] = 0.80
    total = sum(cat_probs.values())
    cat_probs = {c: v / total for c, v in cat_probs.items()}

    users_data.append({
        "user_id": i,
        "name": fake.name(),
        "phone": fake.phone_number(),
        "cluster": cluster_name,
        "latitude": lat,
        "longitude": lon,
        "join_date": fake.date_between(start_date="-1y", end_date="today"),
        # Hidden behavioral attributes (not exported to CSV)
        "_persona": persona,
        "_primary_category": primary_cat,
        "_category_probs": cat_probs,
        "_price_sensitivity": USER_PERSONAS[persona]["price_sensitivity"],
        "_quality_preference": USER_PERSONAS[persona]["quality_preference"],
        "_max_radius_km": USER_PERSONAS[persona]["max_radius_km"],
    })

users_df = pd.DataFrame(users_data)
print(f"  → {len(users_df)} users  |  personas: {dict(users_df['_persona'].value_counts())}")


# ══════════════════════════════════════════════
#  2. GENERATE TECHNICIANS
# ══════════════════════════════════════════════
print("Generating technicians with experience & specialties …")
technicians_data = []
tier_names = list(EXPERIENCE_TIERS.keys())
tier_probs = [EXPERIENCE_TIERS[t]["frac"] for t in tier_names]

for i in range(1, NUM_TECHNICIANS + 1):
    cluster_name = random.choice(list(CLUSTERS.keys()))
    lat, lon = generate_location(CLUSTERS[cluster_name], radius_degrees=0.03)

    category = np.random.choice(CATEGORIES, p=[0.35, 0.35, 0.30])
    tier = np.random.choice(tier_names, p=tier_probs)
    tier_info = EXPERIENCE_TIERS[tier]

    years_exp = random.randint(*tier_info["years_range"])
    base_rate = random.randint(*tier_info["rate_range"])

    # Assign 1-2 sub-specialties (what they're really good at)
    all_subs = list(set(s[0] for s in SUBSPECIALTIES[category]))
    n_specs = min(2, len(all_subs)) if tier in ("senior", "expert") else 1
    specialties = random.sample(all_subs, n_specs)

    technicians_data.append({
        "technician_id": i,
        "name": fake.name(),
        "phone": fake.phone_number(),
        "category": category,
        "cluster": cluster_name,
        "latitude": lat,
        "longitude": lon,
        "years_experience": years_exp,
        "base_hourly_rate": base_rate,
        # Hidden attributes
        "_tier": tier,
        "_quality_base": tier_info["quality_base"],
        "_specialties": specialties,
    })

technicians_df = pd.DataFrame(technicians_data)
print(f"  → {len(technicians_df)} technicians")
print(f"     tiers:      {dict(technicians_df['_tier'].value_counts())}")
print(f"     categories: {dict(technicians_df['category'].value_counts())}")


# ══════════════════════════════════════════════
#  3. GENERATE BOOKINGS WITH REAL PATTERNS
# ══════════════════════════════════════════════
print("\nGenerating bookings with realistic behavioral patterns …")
bookings_data = []
start_date = datetime.now() - timedelta(days=365)

# Track per-user booking history for repeat booking pattern
user_history = {uid: [] for uid in range(1, NUM_USERS + 1)}

for booking_id in range(1, NUM_BOOKINGS + 1):
    # ── Pick a user ──────────────────────────
    user = users_df.sample(1).iloc[0]
    uid = user["user_id"]

    # ── Pick category based on user preference ──
    cat_probs = user["_category_probs"]
    category = np.random.choice(
        list(cat_probs.keys()),
        p=list(cat_probs.values()),
    )

    # ── Pick a problem (sub-specialty + description) ──
    problems = SUBSPECIALTIES[category]
    sub_spec, description = random.choice(problems)
    severity = SEVERITY[sub_spec]

    # ── Check for repeat booking ─────────────
    # If user had a great experience, they may re-book the same tech
    repeat_tech = None
    past = user_history[uid]
    if past:
        good_past = [(tid, cat) for tid, cat, rating in past if rating >= 4 and cat == category]
        if good_past and random.random() < 0.55:
            repeat_tech = random.choice(good_past)[0]

    # ── Select technician ────────────────────
    eligible = technicians_df[technicians_df["category"] == category].copy()

    if repeat_tech is not None and repeat_tech in eligible["technician_id"].values:
        tech = eligible[eligible["technician_id"] == repeat_tech].iloc[0]
    else:
        # Score each eligible technician
        scores = []
        for _, t in eligible.iterrows():
            # 1) DISTANCE SCORE: closer = much higher probability
            dist = haversine_km(user["latitude"], user["longitude"],
                                t["latitude"], t["longitude"])
            max_r = user["_max_radius_km"]
            dist_score = max(0, 1.0 - (dist / max_r)) ** 3  # steep cubic decay

            # Same cluster massive bonus
            if t["cluster"] == user["cluster"]:
                dist_score = min(1.0, dist_score + 0.4)

            # 2) PRICE SCORE: budget users prefer cheap, quality users don't care
            price_norm = (t["base_hourly_rate"] - 100) / 500  # normalize to ~[0,1]
            price_sensitivity = user["_price_sensitivity"]
            price_score = 1.0 - (price_sensitivity * price_norm)
            price_score = max(0.05, price_score)

            # 3) QUALITY/EXPERIENCE SCORE: quality users prefer experienced techs
            quality_pref = user["_quality_preference"]
            exp_norm = t["years_experience"] / 25.0
            quality_score = quality_pref * exp_norm + (1 - quality_pref) * 0.5

            # 4) SEVERITY-EXPERIENCE MATCH: complex problems need experienced techs
            # High severity + high experience = good match
            # High severity + low experience = bad match (user avoids)
            sev_match = 1.0 - abs(severity - exp_norm) * 0.5

            # 5) SPECIALTY BONUS: tech specializes in this exact problem
            spec_bonus = 1.3 if sub_spec in t["_specialties"] else 1.0

            # Combine scores
            total = (
                0.35 * dist_score
                + 0.25 * price_score
                + 0.20 * quality_score
                + 0.15 * sev_match
                + 0.05
            ) * spec_bonus

            scores.append(max(total, 0.01))

        # Sharpen distribution: square scores to amplify differences
        # (reduces random noise while keeping natural variance)
        scores_arr = np.array(scores) ** 2
        prob = scores_arr / scores_arr.sum()
        chosen_idx = np.random.choice(len(eligible), p=prob)
        tech = eligible.iloc[chosen_idx]

    # ── Determine outcome ────────────────────
    dist = haversine_km(user["latitude"], user["longitude"],
                        tech["latitude"], tech["longitude"])

    # Base completion probability from tech quality
    completion_prob = tech["_quality_base"]
    # Distance penalty: very far → lower completion
    if dist > 20:
        completion_prob *= 0.7
    elif dist > 10:
        completion_prob *= 0.85

    status = "Completed" if random.random() < completion_prob else "Canceled"

    # ── Rating calculation (multi-factor) ────
    rating = None
    final_cost = 0
    if status == "Completed":
        hours = max(1, int(1 + severity * 3 + random.uniform(-0.5, 0.5)))
        final_cost = tech["base_hourly_rate"] * hours

        # Base rating from technician quality
        base_rating = tech["_quality_base"] * 5  # e.g., 0.9 → 4.5

        # Specialty match bonus (+0.5 stars if tech specializes)
        if sub_spec in tech["_specialties"]:
            base_rating += 0.5

        # Distance satisfaction (nearby = +0.3, far = -0.5)
        if dist < 5:
            base_rating += 0.3
        elif dist > 15:
            base_rating -= 0.5

        # Price-value alignment
        # Budget users penalize expensive techs, quality users penalize cheap/bad techs
        price_norm = (tech["base_hourly_rate"] - 100) / 500
        if user["_persona"] == "budget" and price_norm > 0.5:
            base_rating -= 0.4  # "too expensive for what I needed"
        elif user["_persona"] == "quality" and tech["_tier"] in ("junior",) and severity > 0.6:
            base_rating -= 0.6  # "not skilled enough for my complex problem"

        # Clamp and discretize
        rating = int(np.clip(round(base_rating + np.random.normal(0, 0.3)), 1, 5))

    # ── Record booking and update history ────
    bookings_data.append({
        "booking_id": booking_id,
        "user_id": uid,
        "technician_id": int(tech["technician_id"]),
        "service_category": category,
        "problem_description": description,
        "booking_date": start_date + timedelta(days=random.randint(0, 365)),
        "status": status,
        "final_cost": final_cost,
        "rating": rating,
        "simulated_distance_deg": round(
            np.sqrt((user["latitude"] - tech["latitude"])**2 +
                    (user["longitude"] - tech["longitude"])**2), 4),
    })

    if status == "Completed" and rating is not None:
        user_history[uid].append((int(tech["technician_id"]), category, rating))

bookings_df = pd.DataFrame(bookings_data)

# ══════════════════════════════════════════════
#  4. PRINT PATTERN DIAGNOSTICS
# ══════════════════════════════════════════════
print("\n" + "=" * 60)
print("  DATA PATTERN DIAGNOSTICS")
print("=" * 60)

completed = bookings_df[bookings_df["status"] == "Completed"]
print(f"\nBookings: {len(bookings_df)} total  |  {len(completed)} completed  |  "
      f"{len(bookings_df) - len(completed)} canceled")
print(f"Avg rating: {completed['rating'].mean():.2f}")
print(f"Rating distribution:\n{completed['rating'].value_counts().sort_index()}")

# Same-cluster affinity
bookings_merged = bookings_df.merge(
    users_df[["user_id", "cluster"]].rename(columns={"cluster": "user_cluster"}),
    on="user_id"
).merge(
    technicians_df[["technician_id", "cluster"]].rename(columns={"cluster": "tech_cluster"}),
    on="technician_id"
)
same = (bookings_merged["user_cluster"] == bookings_merged["tech_cluster"]).mean()
print(f"\nSame-cluster bookings: {same:.1%}  (random would be ~33%)")

# Repeat bookings
repeat_pairs = bookings_df.groupby(["user_id", "technician_id"]).size()
repeats = (repeat_pairs > 1).sum()
print(f"User-technician pairs with repeat bookings: {repeats}  "
      f"({repeats / len(repeat_pairs):.1%} of all pairs)")

# Experience–rating correlation
tech_ratings = completed.merge(
    technicians_df[["technician_id", "_tier", "years_experience"]],
    on="technician_id"
)
print(f"\nAvg rating by technician tier:")
for tier in ["junior", "mid", "senior", "expert"]:
    subset = tech_ratings[tech_ratings["_tier"] == tier]
    if len(subset):
        print(f"  {tier:10s}: {subset['rating'].mean():.2f}  ({len(subset)} bookings)")

# ══════════════════════════════════════════════
#  5. EXPORT (strip hidden columns)
# ══════════════════════════════════════════════
users_export = users_df.drop(columns=[c for c in users_df.columns if c.startswith("_")])
techs_export = technicians_df.drop(columns=[c for c in technicians_df.columns if c.startswith("_")])
bookings_export = bookings_df

output_dir = "Data"
import os
os.makedirs(output_dir, exist_ok=True)

users_export.to_csv(f"{output_dir}/fixit_users.csv", index=False)
techs_export.to_csv(f"{output_dir}/fixit_technicians.csv", index=False)
bookings_export.to_csv(f"{output_dir}/fixit_bookings.csv", index=False)

print(f"\n✅ Files saved to {output_dir}/")
print(f"   fixit_users.csv        ({len(users_export)} rows)")
print(f"   fixit_technicians.csv   ({len(techs_export)} rows)")
print(f"   fixit_bookings.csv      ({len(bookings_export)} rows)")
