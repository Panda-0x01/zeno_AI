"""Test Ollama directly to see what error we get"""
import httpx
import json

async def test_chat():
    url = "http://localhost:11434/api/chat"
    payload = {
        "model": "llama2",
        "messages": [
            {"role": "user", "content": "Hello"}
        ],
        "stream": True
    }
    
    print(f"Sending request to {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            async with client.stream("POST", url, json=payload) as response:
                print(f"Status: {response.status_code}")
                if response.status_code != 200:
                    error = await response.aread()
                    print(f"Error: {error.decode()}")
                else:
                    print("Success! Streaming response:")
                    async for line in response.aiter_lines():
                        if line.strip():
                            print(line)
    except Exception as e:
        print(f"Exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_chat())
