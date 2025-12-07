"""Database service for persisting conversations and messages"""
import mysql.connector
from mysql.connector import Error
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import os


class DatabaseService:
    """Service for MySQL database operations"""
    
    def __init__(self):
        self.host = os.getenv("MYSQL_HOST", "localhost")
        self.port = int(os.getenv("MYSQL_PORT", "3306"))
        self.user = os.getenv("MYSQL_USER", "jarvis")
        self.password = os.getenv("MYSQL_PASSWORD", "jarvis123")
        self.database = os.getenv("MYSQL_DATABASE", "jarvis_db")
        self.connection = None
        
    def connect(self):
        """Connect to MySQL database"""
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database
            )
            print(f"[Database] Connected to MySQL database: {self.database}")
            return True
        except Error as e:
            print(f"[Database] Connection failed: {e}")
            print(f"[Database] Will attempt to create database...")
            return self._create_database()
    
    def _create_database(self):
        """Create database if it doesn't exist"""
        try:
            # Connect without database
            conn = mysql.connector.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password
            )
            cursor = conn.cursor()
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.database}")
            cursor.close()
            conn.close()
            
            # Now connect to the database
            self.connection = mysql.connector.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database
            )
            print(f"[Database] Created and connected to database: {self.database}")
            return True
        except Error as e:
            print(f"[Database] Failed to create database: {e}")
            return False
    
    def initialize_tables(self):
        """Create tables if they don't exist"""
        if not self.connection:
            return False
            
        try:
            cursor = self.connection.cursor()
            
            # Conversations table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id VARCHAR(36) PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    model VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)
            
            # Messages table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id VARCHAR(36) PRIMARY KEY,
                    conversation_id VARCHAR(36) NOT NULL,
                    role ENUM('user', 'assistant', 'system') NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
                    INDEX idx_conversation_id (conversation_id),
                    INDEX idx_created_at (created_at)
                )
            """)
            
            self.connection.commit()
            cursor.close()
            print("[Database] Tables initialized successfully")
            return True
        except Error as e:
            print(f"[Database] Failed to initialize tables: {e}")
            return False
    
    def save_conversation(self, conversation_id: str, title: str, model: str) -> bool:
        """Save or update a conversation"""
        if not self.connection:
            return False
            
        try:
            cursor = self.connection.cursor()
            cursor.execute("""
                INSERT INTO conversations (id, title, model)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    model = VALUES(model),
                    updated_at = CURRENT_TIMESTAMP
            """, (conversation_id, title, model))
            self.connection.commit()
            cursor.close()
            return True
        except Error as e:
            print(f"[Database] Failed to save conversation: {e}")
            return False
    
    def save_message(self, message_id: str, conversation_id: str, role: str, content: str) -> bool:
        """Save a message"""
        if not self.connection:
            return False
            
        try:
            cursor = self.connection.cursor()
            cursor.execute("""
                INSERT INTO messages (id, conversation_id, role, content)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    content = VALUES(content)
            """, (message_id, conversation_id, role, content))
            self.connection.commit()
            cursor.close()
            return True
        except Error as e:
            print(f"[Database] Failed to save message: {e}")
            return False
    
    def get_all_conversations(self) -> List[Dict[str, Any]]:
        """Get all conversations"""
        if not self.connection:
            return []
            
        try:
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT id, title, model, created_at, updated_at
                FROM conversations
                ORDER BY updated_at DESC
            """)
            conversations = cursor.fetchall()
            cursor.close()
            
            # Convert datetime to string
            for conv in conversations:
                conv['created_at'] = conv['created_at'].isoformat() if conv['created_at'] else None
                conv['updated_at'] = conv['updated_at'].isoformat() if conv['updated_at'] else None
            
            return conversations
        except Error as e:
            print(f"[Database] Failed to get conversations: {e}")
            return []
    
    def get_conversation_messages(self, conversation_id: str) -> List[Dict[str, Any]]:
        """Get all messages for a conversation"""
        if not self.connection:
            return []
            
        try:
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT id, role, content, created_at
                FROM messages
                WHERE conversation_id = %s
                ORDER BY created_at ASC
            """, (conversation_id,))
            messages = cursor.fetchall()
            cursor.close()
            
            # Convert datetime to string
            for msg in messages:
                msg['created_at'] = msg['created_at'].isoformat() if msg['created_at'] else None
            
            return messages
        except Error as e:
            print(f"[Database] Failed to get messages: {e}")
            return []
    
    def delete_conversation(self, conversation_id: str) -> bool:
        """Delete a conversation and all its messages"""
        if not self.connection:
            return False
            
        try:
            cursor = self.connection.cursor()
            cursor.execute("DELETE FROM conversations WHERE id = %s", (conversation_id,))
            self.connection.commit()
            cursor.close()
            return True
        except Error as e:
            print(f"[Database] Failed to delete conversation: {e}")
            return False
    
    def close(self):
        """Close database connection"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("[Database] Connection closed")
