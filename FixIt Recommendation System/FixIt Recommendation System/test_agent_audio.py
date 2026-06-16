import urllib.request
import json
import base64
import time

def test_endpoint():
    url = "http://localhost:3001/api/ai/agent"
    
    # 2. Test Audio
    print("Testing Audio...")
    # This is a dummy valid base64 audio? No, whisper needs a real valid audio.
    # But wait, audio_engine.py checks if it can transcribe. If whisper fails, it might return empty or error.
    # Let's just pass a tiny valid WAV header with silence
    wav_bytes = b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00'
    audio_b64 = base64.b64encode(wav_bytes).decode('utf-8')

    payload_audio = {
        "message": "",
        "latitude": 30.06,
        "longitude": 31.32,
        "session_id": "test_multimodal_audio",
        "audio": audio_b64
    }
    
    req = urllib.request.Request(url, data=json.dumps(payload_audio).encode('utf-8'), headers={'Content-Type': 'application/json'})
    start = time.time()
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            print(f"Success in {time.time()-start:.2f}s!")
            print(f"Message: {res_data.get('message', '')[:100]}...")
            cards = res_data.get('cards')
            if cards:
                print(f"Found {len(cards)} technician cards!")
            else:
                print("No cards returned. (Maybe AI asked for more info?)")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_endpoint()
