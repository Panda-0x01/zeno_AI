import subprocess
import platform
import os
from typing import Dict, Any
from pathlib import Path

from security.audit_logger import AuditLogger
from security.sandbox import Sandbox
from config import settings


class ActionService:
    """Service for executing system actions with security controls"""
    
    def __init__(self, audit_logger: AuditLogger):
        self.audit_logger = audit_logger
        self.sandbox = Sandbox()
    
    async def execute_action(
        self,
        action_type: str,
        command: str,
        description: str = "",
    ) -> Dict[str, Any]:
        """Execute an action with appropriate security checks"""
        
        # Log the action
        self.audit_logger.log_action("execute_action", {
            "type": action_type,
            "command": command,
            "description": description,
        })
        
        # Route to appropriate handler
        if action_type == "shell":
            return await self.execute_shell_command(command)
        elif action_type == "file":
            return await self.execute_file_operation(command)
        elif action_type == "app":
            return await self.launch_application(command)
        elif action_type == "notification":
            return await self.send_notification(command, description)
        else:
            return {
                "success": False,
                "error": f"Unknown action type: {action_type}",
            }
    
    async def execute_shell_command(self, command: str) -> Dict[str, Any]:
        """Execute a shell command in sandboxed environment"""
        try:
            # Security check
            if not self.sandbox.is_command_safe(command):
                return {
                    "success": False,
                    "error": "Command blocked by security policy",
                }
            
            # Execute command
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30,
            )
            
            return {
                "success": result.returncode == 0,
                "output": result.stdout,
                "error": result.stderr if result.returncode != 0 else None,
            }
        
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Command timeout (30s limit)",
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }
    
    async def execute_file_operation(self, command: str) -> Dict[str, Any]:
        """Execute file operations (read, write, etc.)"""
        try:
            # Parse command (format: "read:/path/to/file" or "write:/path/to/file:content")
            parts = command.split(":", 2)
            operation = parts[0]
            file_path = Path(parts[1])
            
            # Security check
            if not self.sandbox.is_path_safe(file_path):
                return {
                    "success": False,
                    "error": "Path blocked by security policy",
                }
            
            if operation == "read":
                content = file_path.read_text()
                return {
                    "success": True,
                    "output": content,
                }
            elif operation == "write":
                content = parts[2] if len(parts) > 2 else ""
                file_path.write_text(content)
                return {
                    "success": True,
                    "output": f"Written to {file_path}",
                }
            else:
                return {
                    "success": False,
                    "error": f"Unknown file operation: {operation}",
                }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }
    
    async def launch_application(self, app_name: str) -> Dict[str, Any]:
        """Launch an application"""
        try:
            system = platform.system()
            
            if system == "Windows":
                subprocess.Popen(["start", app_name], shell=True)
            elif system == "Darwin":  # macOS
                subprocess.Popen(["open", "-a", app_name])
            else:  # Linux
                subprocess.Popen([app_name])
            
            return {
                "success": True,
                "output": f"Launched {app_name}",
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }
    
    async def send_notification(self, title: str, message: str) -> Dict[str, Any]:
        """Send desktop notification"""
        try:
            system = platform.system()
            
            if system == "Windows":
                # Use PowerShell for Windows notifications
                ps_script = f'''
                [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
                [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
                $template = @"
                <toast>
                    <visual>
                        <binding template="ToastText02">
                            <text id="1">{title}</text>
                            <text id="2">{message}</text>
                        </binding>
                    </visual>
                </toast>
"@
                $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
                $xml.LoadXml($template)
                $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
                [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("JARVIS").Show($toast)
                '''
                subprocess.run(["powershell", "-Command", ps_script], check=True)
            
            elif system == "Darwin":  # macOS
                subprocess.run([
                    "osascript", "-e",
                    f'display notification "{message}" with title "{title}"'
                ], check=True)
            
            else:  # Linux
                subprocess.run(["notify-send", title, message], check=True)
            
            return {
                "success": True,
                "output": "Notification sent",
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }
