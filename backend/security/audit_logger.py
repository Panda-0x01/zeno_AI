import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict

from config import settings


class AuditLogger:
    """Audit logger for tracking all actions and requests"""
    
    def __init__(self):
        self.enabled = settings.AUDIT_LOG_ENABLED
        self.log_dir = settings.LOG_DIR
        
        if self.enabled:
            # Setup file logger
            log_file = self.log_dir / f"audit_{datetime.now().strftime('%Y%m%d')}.log"
            
            self.logger = logging.getLogger("audit")
            self.logger.setLevel(logging.INFO)
            
            # File handler
            handler = logging.FileHandler(log_file)
            handler.setFormatter(logging.Formatter(
                '%(asctime)s - %(levelname)s - %(message)s'
            ))
            self.logger.addHandler(handler)
            
            # Rotate old logs (keep last 30 days)
            self._rotate_logs()
    
    def log_action(self, action: str, data: Dict[str, Any]):
        """Log an action with associated data"""
        if not self.enabled:
            return
        
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "data": data,
        }
        
        self.logger.info(json.dumps(log_entry))
    
    def _rotate_logs(self):
        """Remove logs older than 30 days"""
        try:
            cutoff = datetime.now().timestamp() - (30 * 24 * 60 * 60)
            
            for log_file in self.log_dir.glob("audit_*.log"):
                if log_file.stat().st_mtime < cutoff:
                    log_file.unlink()
        
        except Exception as e:
            print(f"Warning: Failed to rotate logs: {e}")
