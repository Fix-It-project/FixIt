"""Quick debug script to diagnose evaluation issues."""
import logging
import pandas as pd
from app.data_pipeline import DataPipeline
from app.content_engine import ContentEngine
from app.collaborative_engine import CollaborativeEngine
from app.hybrid_engine import HybridEngine
from app.evaluation import OfflineEvaluator

logging.basicConfig(level=logging.WARNING)

# Load CSVs
users = pd.read_csv('Data/fixit_users.csv', parse_dates=['join_date'])
techs = pd.read_csv('Data/fixit_technicians.csv')
books = pd.read_csv('Data/fixit_bookings.csv', parse_dates=['booking_date'])

# Split
ev = OfflineEvaluator(books)
train, test = ev.train_test_split()

comp_test = test[test['status'] == 'Completed']
print(f"Test bookings: {len(test)}, Completed: {len(comp_test)}")

# Train engines
p = DataPipeline()
p.load_from_db(users, techs, train)

c = ContentEngine()
c.build(technicians_df=p.technicians_df, bookings_df=train)

cf = CollaborativeEngine()
cf.build(users_df=p.users_df, technicians_df=p.technicians_df, bookings_df=train)

h = HybridEngine(pipeline=p, content_engine=c, collab_engine=cf)

# Test ONE booking manually
row = comp_test.iloc[0]
uid = int(row['user_id'])
desc = row['problem_description']
cat = row['service_category']
tid = int(row['technician_id'])

print(f"\nTest booking: user={uid}, tech={tid}, cat='{cat}'")
print(f"  Description: {desc}")

# Check if user exists
user_row = users[users['user_id'] == uid]
print(f"  User found in users_df: {not user_row.empty}")
if not user_row.empty:
    lat = float(user_row.iloc[0]['latitude'])
    lon = float(user_row.iloc[0]['longitude'])
    print(f"  User location: ({lat}, {lon})")

    try:
        recs, cold, eng = h.recommend(
            user_id=uid,
            problem_description=desc,
            latitude=lat,
            longitude=lon,
            radius_km=15.0,
            top_k=5,
        )
        print(f"  Recommendations: {len(recs)}, engine: {eng}")
        for r in recs:
            print(f"    tech={r.technician_id}  cat={r.category}  score={r.match_score}")
        if tid in [r.technician_id for r in recs]:
            print(f"  ✅ Booked tech {tid} found in recommendations!")
        else:
            print(f"  ❌ Booked tech {tid} not in top-5")
    except Exception as e:
        print(f"  ERROR: {e}")
        import traceback
        traceback.print_exc()
