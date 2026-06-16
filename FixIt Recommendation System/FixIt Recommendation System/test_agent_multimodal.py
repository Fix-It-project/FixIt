import urllib.request
import json
import base64
import time

def create_tiny_png_base64():
    # 1x1 transparent PNG
    png_bytes = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    return base64.b64encode(png_bytes).decode('utf-8')

def test_endpoint():
    url = "http://localhost:3001/api/ai/agent"
    
    image_b64 = create_tiny_png_base64()
    
    # 1. Test Image + Text
    print("Testing Image + Text...")
    payload_image = {
        "message": "My fridge is leaking water everywhere. Here is a picture.",
        "latitude": 30.06,
        "longitude": 31.32,
        "session_id": "test_multimodal",
        "image": f"data:image/png;base64,{image_b64}"
    }
    
    req = urllib.request.Request(url, data=json.dumps(payload_image).encode('utf-8'), headers={'Content-Type': 'application/json'})
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
