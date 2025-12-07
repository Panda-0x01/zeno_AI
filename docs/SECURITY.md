# JARVIS Security & Privacy Whitepaper

## Executive Summary

JARVIS is designed with a **local-first, privacy-preserving** architecture. All data processing occurs on your machine, with no telemetry, analytics, or cloud dependencies by default.

## Core Principles

1. **Local-First**: All AI processing happens locally via Ollama
2. **Zero Telemetry**: No data collection or tracking
3. **User Control**: Explicit consent for all system actions
4. **Transparent**: Open source, auditable code
5. **Encrypted**: Optional encryption for sensitive data

## Threat Model

### In Scope

- **Malicious Plugins**: User-installed plugins with harmful code
- **Command Injection**: AI-generated commands that could harm system
- **Data Exfiltration**: Unauthorized access to local files
- **Privilege Escalation**: Attempts to gain elevated permissions

### Out of Scope

- **Physical Access**: Attacker with physical machine access
- **OS Vulnerabilities**: Underlying operating system exploits
- **Supply Chain**: Compromised dependencies (mitigated by checksums)

## Security Architecture

### 1. Network Isolation

**Implementation**:
- Backend binds to `127.0.0.1` only (no external access)
- WebSocket requires secret token (generated per session)
- No outbound connections except to local Ollama

**Rationale**: Prevents remote attacks and data exfiltration.

**Verification**:
```bash
# Check listening ports
netstat -an | grep 8765
# Should show: 127.0.0.1:8765 (not 0.0.0.0:8765)
```

### 2. Command Sandboxing

**Implementation**:
- Whitelist of safe command patterns
- Blacklist of dangerous operations (rm -rf /, fork bombs, etc.)
- Path validation for file operations
- 30-second timeout on all commands

**Blocked Patterns**:
- Recursive delete of root (`rm -rf /`)
- Fork bombs (`:(){:|:&};:`)
- Filesystem formatting (`mkfs.*`)
- Direct disk writes (`dd if=... of=/dev/...`)
- Piping to shell (`curl ... | bash`)
- Sudo/su commands

**Safe Directories**:
- `~/Documents`
- `~/Downloads`
- `~/Desktop`
- `~/.jarvis`

**Code Reference**: `backend/security/sandbox.py`

### 3. User Confirmation

**Implementation**:
- All system actions require explicit user approval
- Clear description of action intent
- Confirmation dialog with action details

**Action Types Requiring Confirmation**:
- Shell command execution
- File system modifications
- Application launching
- Network requests (if enabled)

**Bypass**: Can be disabled in settings (not recommended)

### 4. Audit Logging

**Implementation**:
- All actions logged with timestamps
- JSON format for machine readability
- Daily log rotation (30-day retention)
- Stored in `~/.jarvis/logs/`

**Logged Events**:
- Chat requests (model, message count)
- Action executions (type, command, result)
- Settings changes
- Plugin activations

**Example Log Entry**:
```json
{
  "timestamp": "2024-12-05T10:30:45.123Z",
  "action": "execute_action",
  "data": {
    "type": "shell",
    "command": "ls -la",
    "result": "success"
  }
}
```

**Access**: Logs are plain text, readable by user

### 5. Data Encryption

**Implementation**:
- Optional AES-256-GCM encryption for chat history
- Password-derived key using PBKDF2 (100,000 iterations)
- Encrypted at rest, decrypted in memory only
- No key storage (user must enter password on startup)

**Encryption Flow**:
1. User enables encryption in settings
2. User sets encryption password
3. Key derived: `PBKDF2(password, salt, 100000, SHA256)`
4. Chat history encrypted: `AES-256-GCM(data, key, nonce)`
5. Stored in `~/.jarvis/history.db.enc`

**Decryption Flow**:
1. User starts JARVIS
2. Prompted for password
3. Key derived from password
4. History decrypted into memory
5. Password cleared from memory

**Security Notes**:
- Password never stored
- Key never written to disk
- Memory cleared on exit
- Brute-force protection via PBKDF2 iterations

**Code Reference**: `backend/security/encryption.py` (to be implemented)

### 6. Electron Security

**Configuration**:
```javascript
{
  contextIsolation: true,    // Isolate renderer from main
  nodeIntegration: false,    // No Node.js in renderer
  sandbox: true,             // Enable OS-level sandbox
  webSecurity: true,         // Enforce same-origin policy
}
```

**Preload Script**:
- Controlled API exposure via `contextBridge`
- No direct access to Node.js APIs
- Whitelist of allowed operations

**Content Security Policy**:
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
connect-src ws://127.0.0.1:8765;
```

## Privacy Guarantees

### Data Storage

| Data Type | Location | Encrypted | Retention |
|-----------|----------|-----------|-----------|
| Chat History | `~/.jarvis/history.db` | Optional | User-controlled |
| Audit Logs | `~/.jarvis/logs/` | No | 30 days |
| Settings | `~/.jarvis/settings.json` | No | Permanent |
| Plugins | `~/.jarvis/plugins/` | No | User-controlled |

### Data Sharing

**JARVIS NEVER**:
- Sends data to external servers
- Collects telemetry or analytics
- Phones home for updates
- Shares data with third parties

**User-Initiated Sharing**:
- Export conversations (manual action)
- Plugin network requests (explicit consent)

### Third-Party Components

| Component | Purpose | Network Access | License |
|-----------|---------|----------------|---------|
| Ollama | AI inference | Local only | MIT |
| Electron | Desktop shell | Update checks (optional) | MIT |
| FastAPI | Backend server | None | MIT |
| React | UI framework | None | MIT |
| Whisper (optional) | Speech-to-text | None | MIT |
| VOSK (optional) | Speech-to-text | None | Apache 2.0 |
| Porcupine (optional) | Wake word | None | Proprietary* |

*Porcupine free tier requires API key but runs locally

## Attack Scenarios & Mitigations

### Scenario 1: Malicious Plugin

**Attack**: User installs plugin that exfiltrates data

**Mitigation**:
- Plugins require explicit user enablement
- Audit log tracks all plugin actions
- Future: Plugin sandboxing in separate process

**User Action**: Review plugin code before installation

### Scenario 2: AI Command Injection

**Attack**: AI generates malicious command (e.g., `rm -rf /`)

**Mitigation**:
- Command sandboxing blocks dangerous patterns
- User confirmation required before execution
- Audit log records all commands

**Example**:
```
AI: "Let me clean up your system: rm -rf /"
Sandbox: BLOCKED (matches dangerous pattern)
User: Sees error, no harm done
```

### Scenario 3: Path Traversal

**Attack**: AI tries to read sensitive file (e.g., `/etc/passwd`)

**Mitigation**:
- Path validation restricts to safe directories
- Symbolic link resolution prevents escapes
- User confirmation shows full path

**Example**:
```
AI: "Let me read your password file: /etc/passwd"
Sandbox: BLOCKED (not in safe directory)
User: Sees error, no access granted
```

### Scenario 4: Data Exfiltration

**Attack**: Plugin or AI tries to send data externally

**Mitigation**:
- No outbound network access by default
- Firewall rules can block JARVIS entirely
- Audit log shows all network attempts

**User Action**: Monitor audit logs for suspicious activity

## Compliance & Best Practices

### GDPR Compliance

- **Data Minimization**: Only stores necessary data
- **Right to Erasure**: User can delete all data
- **Data Portability**: Export in standard formats
- **Privacy by Design**: Local-first architecture

### Security Best Practices

1. **Keep Software Updated**: Regular updates for security patches
2. **Use Encryption**: Enable for sensitive conversations
3. **Review Plugins**: Audit code before installation
4. **Monitor Logs**: Check audit logs periodically
5. **Strong Password**: Use strong encryption password
6. **Firewall**: Consider blocking JARVIS from network

### Recommended Settings

```json
{
  "encryptionEnabled": true,
  "auditLogEnabled": true,
  "requireConfirmation": true,
  "wakeWordEnabled": false,
  "pluginsEnabled": false
}
```

## Incident Response

### If You Suspect Compromise

1. **Stop JARVIS**: Close application immediately
2. **Review Logs**: Check `~/.jarvis/logs/` for suspicious activity
3. **Scan System**: Run antivirus/malware scan
4. **Change Passwords**: If encryption was enabled
5. **Report Issue**: Open GitHub issue with details (no sensitive data)

### Reporting Security Issues

**Email**: security@jarvis-project.example (replace with actual)

**PGP Key**: [Public key for encrypted reports]

**Response Time**: 48 hours for acknowledgment

## Future Security Enhancements

1. **Plugin Sandboxing**: Separate process with IPC
2. **Code Signing**: Verify plugin authenticity
3. **Hardware Security**: TPM integration for key storage
4. **Network Monitoring**: Real-time network activity alerts
5. **Secure Updates**: Signed updates with rollback

## Conclusion

JARVIS prioritizes your privacy and security through:
- Local-first architecture (no cloud dependencies)
- Multiple layers of security controls
- Transparent, auditable code
- User control over all actions

**Remember**: Security is a shared responsibility. Review plugins, monitor logs, and report issues.

---

**Last Updated**: December 2024  
**Version**: 1.0.0
