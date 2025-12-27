# Security Configuration

This document outlines the security measures implemented in Zeno AI to protect users from potential security risks.

## Content Security Policy (CSP)

### Development Mode
- Allows `unsafe-inline` and `unsafe-eval` for development tools
- Permits connections to localhost development servers
- WebSocket connections to local backend (ws://127.0.0.1:8765)

### Production Mode
- Strict CSP with minimal permissions
- Only allows connections to self and local backend
- Blocks unsafe inline scripts and eval
- Prevents XSS attacks and code injection

## Electron Security Features

### Enabled Security Features
- ✅ **Context Isolation**: Isolates the main world from the isolated world
- ✅ **Node Integration Disabled**: Prevents renderer from accessing Node.js APIs
- ✅ **Sandbox Mode**: Runs renderer in a sandboxed environment
- ✅ **Web Security**: Enforces same-origin policy
- ✅ **Preload Script**: Secure communication between main and renderer
- ✅ **Secure WebSocket Token**: Generated cryptographically secure tokens

### Security Headers
```javascript
'Content-Security-Policy': [
  // Production CSP
  "default-src 'self'; " +
  "connect-src 'self' ws://127.0.0.1:8765 ws://localhost:8765; " +
  "img-src 'self' data: blob:; " +
  "font-src 'self' data:; " +
  "style-src 'self' 'unsafe-inline'; " +
  "script-src 'self';"
]
```

## WebSocket Security

### Token-Based Authentication
- Cryptographically secure 32-byte random tokens
- Tokens generated on each app startup
- Tokens passed via query parameters (secure over localhost)

### Local-Only Connections
- Backend only accepts connections from 127.0.0.1
- No external network access required
- All AI processing happens locally

## Data Privacy

### Local-First Architecture
- All conversations stored locally in MySQL database
- No data sent to external servers
- AI models run entirely on user's machine
- Audit logging for security monitoring

### Encryption Support
- Optional conversation encryption (configurable)
- Secure token generation using Node.js crypto module
- Database credentials stored in environment variables

## Recommended Security Practices

### For Users
1. Keep Ollama updated to latest version
2. Only install models from trusted sources
3. Review audit logs periodically
4. Use strong database passwords
5. Keep the application updated

### For Developers
1. Regular security audits of dependencies
2. Validate all user inputs
3. Sanitize database queries
4. Use parameterized queries to prevent SQL injection
5. Regular updates of Electron and Node.js

## Security Warnings Resolution

### Electron CSP Warning
- **Issue**: "This renderer process has either no Content Security Policy set"
- **Solution**: Implemented comprehensive CSP headers in both Electron main process and HTML meta tags
- **Status**: ✅ Resolved

### Insecure Content Warning
- **Issue**: Policy with "unsafe-eval" enabled in development
- **Solution**: Separate CSP policies for development and production
- **Status**: ✅ Resolved

## Reporting Security Issues

If you discover a security vulnerability, please:
1. Do NOT create a public GitHub issue
2. Email the maintainers privately
3. Provide detailed reproduction steps
4. Allow time for fix before public disclosure

## Security Checklist

- [x] Content Security Policy implemented
- [x] Context isolation enabled
- [x] Node integration disabled
- [x] Sandbox mode enabled
- [x] Secure WebSocket authentication
- [x] Local-only data storage
- [x] Input validation and sanitization
- [x] Parameterized database queries
- [x] Audit logging enabled
- [x] Secure token generation

## Compliance

This application follows:
- OWASP Electron Security Guidelines
- Electron Security Best Practices
- Node.js Security Best Practices
- Web Application Security Standards