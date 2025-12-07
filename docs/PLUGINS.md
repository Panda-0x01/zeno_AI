# JARVIS Plugin Development Guide

## Overview

JARVIS plugins extend the assistant's capabilities with custom commands and integrations. Plugins are Python modules that register commands accessible to the AI and user.

## Plugin Structure

### Basic Plugin

```python
# ~/.jarvis/plugins/weather_plugin.py
from jarvis.plugin import Plugin, command
from typing import Optional

class WeatherPlugin(Plugin):
    """Get weather information"""
    
    # Plugin metadata
    name = "weather"
    description = "Weather information and forecasts"
    version = "1.0.0"
    author = "Your Name"
    
    def __init__(self):
        super().__init__()
        # Initialize plugin resources
        self.api_key = self.get_config("api_key", "")
    
    @command(
        name="current",
        description="Get current weather for a location",
        parameters={
            "location": {"type": "string", "required": True, "description": "City name"},
            "units": {"type": "string", "required": False, "description": "imperial or metric"},
        }
    )
    async def get_current_weather(self, location: str, units: str = "imperial"):
        """Get current weather"""
        # Your implementation
        return {
            "location": location,
            "temperature": 72,
            "conditions": "Sunny",
            "units": units,
        }
    
    @command(
        name="forecast",
        description="Get weather forecast",
        parameters={
            "location": {"type": "string", "required": True},
            "days": {"type": "number", "required": False, "description": "Number of days (1-7)"},
        }
    )
    async def get_forecast(self, location: str, days: int = 3):
        """Get weather forecast"""
        # Your implementation
        return {
            "location": location,
            "forecast": [
                {"day": "Monday", "high": 75, "low": 60, "conditions": "Sunny"},
                {"day": "Tuesday", "high": 73, "low": 58, "conditions": "Cloudy"},
            ]
        }
```

### Plugin Base Class

```python
class Plugin:
    """Base class for all plugins"""
    
    name: str  # Unique plugin identifier
    description: str  # Short description
    version: str = "1.0.0"
    author: str = ""
    
    def __init__(self):
        self.config = self.load_config()
    
    def get_config(self, key: str, default: any = None) -> any:
        """Get configuration value"""
        return self.config.get(key, default)
    
    def load_config(self) -> dict:
        """Load plugin configuration from ~/.jarvis/plugins/<name>.json"""
        pass
    
    async def on_load(self):
        """Called when plugin is loaded"""
        pass
    
    async def on_unload(self):
        """Called when plugin is unloaded"""
        pass
```

## Command Decorator

```python
@command(
    name: str,                    # Command name (unique within plugin)
    description: str,             # Command description
    parameters: dict = {},        # Parameter definitions
    requires_confirmation: bool = False,  # Require user confirmation
    category: str = "general",    # Command category
)
```

### Parameter Types

- `string`: Text input
- `number`: Numeric input (int or float)
- `boolean`: True/False
- `array`: List of values
- `object`: Dictionary/object

### Parameter Definition

```python
parameters = {
    "param_name": {
        "type": "string",
        "required": True,
        "description": "Parameter description",
        "default": "default_value",  # Optional
        "enum": ["option1", "option2"],  # Optional: restrict to specific values
    }
}
```

## Plugin Configuration

### Configuration File

Create `~/.jarvis/plugins/<plugin_name>.json`:

```json
{
  "enabled": true,
  "api_key": "your-api-key",
  "custom_setting": "value"
}
```

### Accessing Configuration

```python
class MyPlugin(Plugin):
    def __init__(self):
        super().__init__()
        self.api_key = self.get_config("api_key", "")
        self.enabled = self.get_config("enabled", True)
```

## Advanced Features

### Async Operations

All command methods should be async:

```python
@command(name="fetch_data")
async def fetch_data(self, url: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()
```

### Error Handling

```python
@command(name="risky_operation")
async def risky_operation(self):
    try:
        # Your code
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}
```

### State Management

```python
class StatefulPlugin(Plugin):
    def __init__(self):
        super().__init__()
        self.state = {}
    
    @command(name="set_value")
    async def set_value(self, key: str, value: str):
        self.state[key] = value
        return {"success": True}
    
    @command(name="get_value")
    async def get_value(self, key: str):
        return {"value": self.state.get(key)}
```

### Lifecycle Hooks

```python
class MyPlugin(Plugin):
    async def on_load(self):
        """Initialize resources"""
        self.db = await connect_to_database()
        print(f"{self.name} plugin loaded")
    
    async def on_unload(self):
        """Cleanup resources"""
        await self.db.close()
        print(f"{self.name} plugin unloaded")
```

## Security Considerations

### Sandboxing

Plugins run in the same process as the backend. Follow these guidelines:

1. **Validate Input**: Always validate and sanitize user input
2. **Limit Permissions**: Request minimal permissions needed
3. **No Arbitrary Code**: Don't execute arbitrary code from user input
4. **Secure Secrets**: Store API keys in config, not code
5. **Audit Logging**: Log all sensitive operations

### Example: Safe File Access

```python
from pathlib import Path
from security.sandbox import Sandbox

class FilePlugin(Plugin):
    def __init__(self):
        super().__init__()
        self.sandbox = Sandbox()
    
    @command(name="read_file")
    async def read_file(self, path: str):
        file_path = Path(path)
        
        # Validate path
        if not self.sandbox.is_path_safe(file_path):
            return {"error": "Access denied: unsafe path"}
        
        try:
            content = file_path.read_text()
            return {"content": content}
        except Exception as e:
            return {"error": str(e)}
```

## Testing Plugins

### Unit Tests

```python
# tests/test_weather_plugin.py
import pytest
from plugins.weather_plugin import WeatherPlugin

@pytest.mark.asyncio
async def test_get_current_weather():
    plugin = WeatherPlugin()
    result = await plugin.get_current_weather("Seattle", "imperial")
    
    assert result["location"] == "Seattle"
    assert "temperature" in result
    assert result["units"] == "imperial"
```

### Manual Testing

1. Place plugin in `~/.jarvis/plugins/`
2. Restart JARVIS
3. Check logs for plugin loading
4. Test commands via chat:
   ```
   User: "What's the weather in Seattle?"
   AI: [Calls weather.current command]
   ```

## Plugin Distribution

### Package Structure

```
my-plugin/
├── README.md
├── plugin.py
├── requirements.txt
├── config.example.json
└── tests/
    └── test_plugin.py
```

### Installation Instructions

```markdown
# My Plugin

## Installation

1. Copy `plugin.py` to `~/.jarvis/plugins/my_plugin.py`
2. Install dependencies: `pip install -r requirements.txt`
3. Copy `config.example.json` to `~/.jarvis/plugins/my_plugin.json`
4. Edit config with your API keys
5. Restart JARVIS
```

## Example Plugins

### 1. Calculator Plugin

```python
class CalculatorPlugin(Plugin):
    name = "calculator"
    description = "Perform calculations"
    
    @command(name="calculate", description="Evaluate math expression")
    async def calculate(self, expression: str):
        try:
            # Safe evaluation (limited scope)
            result = eval(expression, {"__builtins__": {}}, {})
            return {"result": result}
        except Exception as e:
            return {"error": f"Invalid expression: {e}"}
```

### 2. Note-Taking Plugin

```python
from datetime import datetime
from pathlib import Path

class NotesPlugin(Plugin):
    name = "notes"
    description = "Take and manage notes"
    
    def __init__(self):
        super().__init__()
        self.notes_dir = Path.home() / ".jarvis" / "notes"
        self.notes_dir.mkdir(exist_ok=True)
    
    @command(name="create", description="Create a new note")
    async def create_note(self, title: str, content: str):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{title.replace(' ', '_')}.md"
        filepath = self.notes_dir / filename
        
        filepath.write_text(f"# {title}\n\n{content}")
        return {"success": True, "file": str(filepath)}
    
    @command(name="list", description="List all notes")
    async def list_notes(self):
        notes = [f.stem for f in self.notes_dir.glob("*.md")]
        return {"notes": notes}
```

### 3. System Info Plugin

```python
import platform
import psutil

class SystemInfoPlugin(Plugin):
    name = "system"
    description = "Get system information"
    
    @command(name="info", description="Get system info")
    async def get_system_info(self):
        return {
            "os": platform.system(),
            "version": platform.version(),
            "cpu_count": psutil.cpu_count(),
            "memory_gb": round(psutil.virtual_memory().total / (1024**3), 2),
            "disk_usage": psutil.disk_usage('/').percent,
        }
    
    @command(name="processes", description="List running processes")
    async def list_processes(self, limit: int = 10):
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
            processes.append(proc.info)
        
        # Sort by CPU usage
        processes.sort(key=lambda x: x['cpu_percent'], reverse=True)
        return {"processes": processes[:limit]}
```

## Best Practices

1. **Clear Documentation**: Document all commands and parameters
2. **Error Messages**: Provide helpful error messages
3. **Async/Await**: Use async for I/O operations
4. **Resource Cleanup**: Implement `on_unload` for cleanup
5. **Configuration**: Use config files for settings
6. **Testing**: Write unit tests for commands
7. **Security**: Validate all inputs
8. **Logging**: Log important operations
9. **Versioning**: Use semantic versioning
10. **Dependencies**: Minimize external dependencies

## Troubleshooting

### Plugin Not Loading

- Check plugin file is in `~/.jarvis/plugins/`
- Verify Python syntax (no errors)
- Check logs in `~/.jarvis/logs/`
- Ensure plugin class inherits from `Plugin`

### Command Not Working

- Verify command decorator syntax
- Check parameter types match
- Test command directly in Python
- Review audit logs for errors

### Permission Denied

- Check file paths are in safe directories
- Verify sandbox allows operation
- Review security settings

## Resources

- [Example Plugins Repository](https://github.com/jarvis/plugins)
- [Plugin API Reference](https://docs.jarvis.example/api)
- [Community Plugins](https://jarvis.example/plugins)

## Support

- GitHub Issues: Report bugs
- Discussions: Ask questions
- Discord: Community chat
