import re
from pathlib import Path
from typing import List


class Sandbox:
    """Security sandbox for validating commands and paths"""
    
    # Dangerous command patterns
    BLOCKED_COMMANDS = [
        r"rm\s+-rf\s+/",  # Recursive delete root
        r":\(\)\{.*\};:",  # Fork bomb
        r"mkfs\.",  # Format filesystem
        r"dd\s+if=.*of=/dev/",  # Disk operations
        r">\s*/dev/sd",  # Write to disk
        r"curl.*\|\s*bash",  # Pipe to shell
        r"wget.*\|\s*sh",  # Pipe to shell
        r"chmod\s+777",  # Dangerous permissions
        r"chown\s+root",  # Change ownership to root
        r"sudo\s+",  # Sudo commands
        r"su\s+",  # Switch user
    ]
    
    # Allowed safe directories
    SAFE_DIRECTORIES = [
        Path.home() / "Documents",
        Path.home() / "Downloads",
        Path.home() / "Desktop",
        Path.home() / ".jarvis",
    ]
    
    def is_command_safe(self, command: str) -> bool:
        """Check if a command is safe to execute"""
        command_lower = command.lower()
        
        # Check against blocked patterns
        for pattern in self.BLOCKED_COMMANDS:
            if re.search(pattern, command_lower):
                return False
        
        # Block commands with multiple pipes (potential chaining)
        if command.count("|") > 2:
            return False
        
        # Block commands with suspicious redirects
        if ">>" in command or "2>&1" in command:
            # Allow only if writing to safe locations
            if not any(str(safe_dir) in command for safe_dir in self.SAFE_DIRECTORIES):
                return False
        
        return True
    
    def is_path_safe(self, path: Path) -> bool:
        """Check if a file path is safe to access"""
        try:
            # Resolve to absolute path
            abs_path = path.resolve()
            
            # Check if path is within safe directories
            for safe_dir in self.SAFE_DIRECTORIES:
                try:
                    abs_path.relative_to(safe_dir.resolve())
                    return True
                except ValueError:
                    continue
            
            # Not in any safe directory
            return False
        
        except Exception:
            return False
    
    def sanitize_input(self, user_input: str) -> str:
        """Sanitize user input to prevent injection"""
        # Remove null bytes
        sanitized = user_input.replace("\x00", "")
        
        # Remove control characters except newline and tab
        sanitized = "".join(
            char for char in sanitized
            if char.isprintable() or char in ["\n", "\t"]
        )
        
        return sanitized
