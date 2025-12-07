# MySQL Database Setup for JARVIS

## Overview
JARVIS now uses MySQL to persist conversations and messages across app restarts.

## Installation

### Windows

1. **Download MySQL:**
   - Go to https://dev.mysql.com/downloads/installer/
   - Download MySQL Installer (mysql-installer-community)
   - Run the installer

2. **Install MySQL Server:**
   - Choose "Server only" or "Developer Default"
   - Set root password (remember this!)
   - Complete installation

3. **Create JARVIS Database User:**
   Open MySQL Command Line Client or MySQL Workbench and run:
   ```sql
   CREATE USER 'jarvis'@'localhost' IDENTIFIED BY 'jarvis123';
   CREATE DATABASE jarvis_db;
   GRANT ALL PRIVILEGES ON jarvis_db.* TO 'jarvis'@'localhost';
   FLUSH PRIVILEGES;
   ```

### macOS

```bash
# Install MySQL using Homebrew
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation
mysql_secure_installation

# Create database and user
mysql -u root -p
```

Then run the SQL commands above.

### Linux

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation

# Create database and user
sudo mysql
```

Then run the SQL commands above.

## Configuration

The database settings are in `backend/.env`:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=jarvis
MYSQL_PASSWORD=jarvis123
MYSQL_DATABASE=jarvis_db
```

**Change the password** for production use!

## Install Python MySQL Connector

```bash
backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

This will install `mysql-connector-python`.

## Verify Installation

1. **Check MySQL is running:**
   ```bash
   # Windows
   Get-Service MySQL*
   
   # macOS/Linux
   mysql --version
   ```

2. **Test connection:**
   ```bash
   mysql -u jarvis -p jarvis_db
   # Enter password: jarvis123
   ```

3. **Start JARVIS:**
   ```bash
   npm run dev
   ```

   You should see in the terminal:
   ```
   [Database] Connected to MySQL database: jarvis_db
   [Database] Tables initialized successfully
   [Database] Ready
   ```

## Database Schema

### conversations table
- `id` (VARCHAR 36) - UUID primary key
- `title` (VARCHAR 255) - Conversation title
- `model` (VARCHAR 100) - AI model used
- `created_at` (TIMESTAMP) - Creation time
- `updated_at` (TIMESTAMP) - Last update time

### messages table
- `id` (VARCHAR 36) - UUID primary key
- `conversation_id` (VARCHAR 36) - Foreign key to conversations
- `role` (ENUM) - 'user', 'assistant', or 'system'
- `content` (TEXT) - Message content
- `created_at` (TIMESTAMP) - Creation time

## Features

✅ **Auto-save:** Messages are automatically saved to database
✅ **Persistence:** Conversations survive app restarts
✅ **History:** Full conversation history preserved
✅ **Delete:** Deleting a conversation removes all its messages

## Troubleshooting

### "Database connection failed"
- Check MySQL is running
- Verify credentials in `.env`
- Ensure user has permissions

### "Access denied for user 'jarvis'"
Run this in MySQL:
```sql
GRANT ALL PRIVILEGES ON jarvis_db.* TO 'jarvis'@'localhost';
FLUSH PRIVILEGES;
```

### "Can't connect to MySQL server"
- Check MySQL service is running
- Verify port 3306 is not blocked
- Try `localhost` vs `127.0.0.1` in `.env`

### App works without database
If MySQL isn't available, JARVIS will still work but conversations won't persist. You'll see:
```
[Database] Warning: Could not connect to MySQL
   Conversations will not be persisted
```

## Optional: Use Different Database

You can change the database name/user in `.env`:

```env
MYSQL_DATABASE=my_custom_db
MYSQL_USER=my_user
MYSQL_PASSWORD=my_secure_password
```

Then create the database and user in MySQL accordingly.
