import urllib.request
import json
import time

URL_DIAGNOSE = "http://localhost:3001/api/ai/diagnose"
URL_AGENT = "http://localhost:3001/api/ai/agent"

headers = {"Content-Type": "application/json"}

print("=================================================")
print("TEST 1: Flow 1 (Direct Diagnosis)")
payload1 = {
    "text": "My fridge is leaking water all over the floor and it's completely warm inside.",
    "user_id": "test-user-123",
    "latitude": 30.0444,
    "longitude": 31.2357
}
req1 = urllib.request.Request(URL_DIAGNOSE, data=json.dumps(payload1).encode('utf-8'), headers=headers)
try:
    with urllib.request.urlopen(req1) as response:
        print(json.dumps(json.loads(response.read().decode('utf-8')), indent=2))
except Exception as e:
    print("Error:", e)


print("\n=================================================")
print("TEST 2: Flow 2 - Message 1 (Conversational)")
payload2 = {
    "text": "Hi, my fridge is leaking.",
    "session_id": "mobile-chat-999",
    "user_id": "test-user-123",
    "latitude": 30.0444,
    "longitude": 31.2357
}
req2 = urllib.request.Request(URL_AGENT, data=json.dumps(payload2).encode('utf-8'), headers=headers)
try:
    with urllib.request.urlopen(req2) as response:
        print(json.dumps(json.loads(response.read().decode('utf-8')), indent=2))
except Exception as e:
    print("Error:", e)


print("\n=================================================")
print("TEST 3: Flow 2 - Message 2 (Memory Test)")
payload3 = {
    "text": "Actually, it's also making a really loud grinding noise.",
    "session_id": "mobile-chat-999",
    "user_id": "test-user-123",
    "latitude": 30.0444,
    "longitude": 31.2357
}
req3 = urllib.request.Request(URL_AGENT, data=json.dumps(payload3).encode('utf-8'), headers=headers)
try:
    with urllib.request.urlopen(req3) as response:
        print(json.dumps(json.loads(response.read().decode('utf-8')), indent=2))
except Exception as e:
    print("Error:", e)

print("\n=================================================")
