import pytest
from unittest.mock import AsyncMock, patch
from services.ollama_service import OllamaService


@pytest.mark.asyncio
async def test_is_connected_success():
    """Test successful Ollama connection check"""
    service = OllamaService()
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_response = AsyncMock()
        mock_response.status_code = 200
        mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
        
        result = await service.is_connected()
        assert result is True


@pytest.mark.asyncio
async def test_is_connected_failure():
    """Test failed Ollama connection check"""
    service = OllamaService()
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.get.side_effect = Exception("Connection failed")
        
        result = await service.is_connected()
        assert result is False


@pytest.mark.asyncio
async def test_list_models():
    """Test listing Ollama models"""
    service = OllamaService()
    
    mock_models = [
        {"name": "llama2", "size": 3825819519},
        {"name": "mistral", "size": 4109865159},
    ]
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_response = AsyncMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"models": mock_models}
        mock_client.return_value.__aenter__.return_value.get.return_value = mock_response
        
        models = await service.list_models()
        assert len(models) == 2
        assert models[0]["name"] == "llama2"


@pytest.mark.asyncio
async def test_chat_stream():
    """Test streaming chat responses"""
    service = OllamaService()
    
    messages = [{"role": "user", "content": "Hello"}]
    
    # Mock streaming response
    mock_lines = [
        '{"message": {"content": "Hello"}}',
        '{"message": {"content": " there"}}',
        '{"done": true}',
    ]
    
    with patch('httpx.AsyncClient') as mock_client:
        mock_response = AsyncMock()
        mock_response.aiter_lines.return_value = mock_lines
        mock_response.raise_for_status = AsyncMock()
        
        mock_stream = AsyncMock()
        mock_stream.__aenter__.return_value = mock_response
        
        mock_client.return_value.__aenter__.return_value.stream.return_value = mock_stream
        
        chunks = []
        async for chunk in service.chat_stream(messages, "llama2"):
            chunks.append(chunk)
        
        assert len(chunks) == 2
        assert chunks[0] == "Hello"
        assert chunks[1] == " there"
