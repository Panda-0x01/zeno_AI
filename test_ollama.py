import httpx
import asyncio

async def test():
    try:
        client = httpx.AsyncClient(timeout=5.0)
        response = await client.get('http://localhost:11434/api/tags')
        print(f'✅ Status: {response.status_code}')
        data = response.json()
        print(f'✅ Models: {len(data.get("models", []))} available')
        for model in data.get("models", []):
            print(f'   - {model["name"]}')
        await client.aclose()
    except Exception as e:
        print(f'❌ Error: {e}')

asyncio.run(test())
