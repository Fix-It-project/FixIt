import urllib.request
import json
import time

def test_endpoint():
    url = "http://localhost:3001/api/ai/agent"
    
    # 3. Test Flow 2 Identical Structure
    print("Testing Flow 2 Identical Structure...")

    payload = {
        "text": "My fridge is leaking water.",
        "latitude": 30.06,
        "longitude": 31.32,
        "userId": 123,
        "session_id": "test_schema_unification"
    }
    
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    start = time.time()
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            print(f"Success in {time.time()-start:.2f}s!")
            print("Response Keys:", res_data.keys())
            if "data" in res_data:
                print("Data Keys:", res_data["data"].keys())
                print("Message:", res_data["data"].get("message", "")[:100] + "...")
                print("Service Order Keys:", res_data["data"].get("service_order", {}).keys())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_endpoint()
