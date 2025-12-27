import base64
import mimetypes
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import aiofiles
import asyncio
from PIL import Image
import io

class FileService:
    """Service for handling file uploads and processing"""
    
    SUPPORTED_IMAGE_TYPES = {
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'
    }
    
    SUPPORTED_TEXT_TYPES = {
        'text/plain', 'text/markdown', 'text/javascript', 'text/typescript',
        'text/html', 'text/css', 'application/json', 'application/javascript'
    }
    
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    MAX_IMAGE_SIZE = (2048, 2048)  # Max image dimensions
    
    def __init__(self):
        self.upload_dir = Path("uploads")
        self.upload_dir.mkdir(exist_ok=True)
    
    def is_supported_file(self, filename: str, content_type: str) -> bool:
        """Check if file type is supported"""
        if content_type in self.SUPPORTED_IMAGE_TYPES:
            return True
        if content_type in self.SUPPORTED_TEXT_TYPES:
            return True
        
        # Check by extension for text files
        ext = Path(filename).suffix.lower()
        text_extensions = {
            '.txt', '.md', '.js', '.ts', '.jsx', '.tsx', '.py', '.java',
            '.cpp', '.c', '.h', '.html', '.css', '.json', '.xml', '.yaml', '.yml'
        }
        return ext in text_extensions
    
    def validate_file(self, filename: str, content_type: str, size: int) -> Tuple[bool, Optional[str]]:
        """Validate file before processing"""
        if size > self.MAX_FILE_SIZE:
            return False, f"File size exceeds {self.MAX_FILE_SIZE // 1024 // 1024}MB limit"
        
        if not self.is_supported_file(filename, content_type):
            return False, "File type not supported"
        
        return True, None
    
    async def process_image(self, file_data: bytes, filename: str) -> Dict:
        """Process image file for AI analysis"""
        try:
            # Open image with PIL
            image = Image.open(io.BytesIO(file_data))
            
            # Get image info
            width, height = image.size
            format_name = image.format or 'Unknown'
            
            # Resize if too large
            if width > self.MAX_IMAGE_SIZE[0] or height > self.MAX_IMAGE_SIZE[1]:
                image.thumbnail(self.MAX_IMAGE_SIZE, Image.Resampling.LANCZOS)
                width, height = image.size
            
            # Convert to RGB if necessary (for JPEG compatibility)
            if image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode in ('RGBA', 'LA') else None)
                image = background
            
            # Convert to base64 for AI model
            buffer = io.BytesIO()
            image.save(buffer, format='JPEG', quality=85)
            base64_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            return {
                'type': 'image',
                'filename': filename,
                'width': width,
                'height': height,
                'format': format_name,
                'base64': base64_data,
                'size': len(file_data),
                'processed_size': len(buffer.getvalue())
            }
            
        except Exception as e:
            raise ValueError(f"Failed to process image: {str(e)}")
    
    async def process_text_file(self, file_data: bytes, filename: str) -> Dict:
        """Process text file for AI analysis"""
        try:
            # Try to decode as UTF-8
            try:
                content = file_data.decode('utf-8')
            except UnicodeDecodeError:
                # Try other encodings
                for encoding in ['latin-1', 'cp1252', 'iso-8859-1']:
                    try:
                        content = file_data.decode(encoding)
                        break
                    except UnicodeDecodeError:
                        continue
                else:
                    raise ValueError("Could not decode text file")
            
            # Get file extension for syntax highlighting hint
            ext = Path(filename).suffix.lower()
            
            # Determine language/type
            language_map = {
                '.js': 'javascript',
                '.ts': 'typescript',
                '.jsx': 'javascript',
                '.tsx': 'typescript',
                '.py': 'python',
                '.java': 'java',
                '.cpp': 'cpp',
                '.c': 'c',
                '.h': 'c',
                '.html': 'html',
                '.css': 'css',
                '.json': 'json',
                '.xml': 'xml',
                '.yaml': 'yaml',
                '.yml': 'yaml',
                '.md': 'markdown',
                '.txt': 'text'
            }
            
            language = language_map.get(ext, 'text')
            
            return {
                'type': 'text',
                'filename': filename,
                'content': content,
                'language': language,
                'size': len(file_data),
                'lines': len(content.splitlines())
            }
            
        except Exception as e:
            raise ValueError(f"Failed to process text file: {str(e)}")
    
    async def process_files(self, files_data: List[Tuple[str, str, bytes]]) -> List[Dict]:
        """Process multiple files
        
        Args:
            files_data: List of (filename, content_type, file_data) tuples
        
        Returns:
            List of processed file information
        """
        processed_files = []
        
        for filename, content_type, file_data in files_data:
            # Validate file
            is_valid, error = self.validate_file(filename, content_type, len(file_data))
            if not is_valid:
                processed_files.append({
                    'filename': filename,
                    'error': error,
                    'type': 'error'
                })
                continue
            
            try:
                if content_type.startswith('image/'):
                    processed_file = await self.process_image(file_data, filename)
                else:
                    processed_file = await self.process_text_file(file_data, filename)
                
                processed_files.append(processed_file)
                
            except Exception as e:
                processed_files.append({
                    'filename': filename,
                    'error': str(e),
                    'type': 'error'
                })
        
        return processed_files
    
    def create_file_context_for_ai(self, processed_files: List[Dict]) -> str:
        """Create context string for AI model based on processed files"""
        context_parts = []
        
        for file_info in processed_files:
            if file_info.get('type') == 'error':
                context_parts.append(f"❌ Error processing {file_info['filename']}: {file_info['error']}")
                continue
            
            if file_info['type'] == 'image':
                context_parts.append(
                    f"🖼️ Image: {file_info['filename']} "
                    f"({file_info['width']}x{file_info['height']}, {file_info['format']})"
                )
            
            elif file_info['type'] == 'text':
                lines = file_info['lines']
                size_kb = file_info['size'] / 1024
                context_parts.append(
                    f"📄 {file_info['language'].title()} file: {file_info['filename']} "
                    f"({lines} lines, {size_kb:.1f}KB)"
                )
                
                # Include content for small files
                if file_info['size'] < 5000:  # Less than 5KB
                    context_parts.append(f"```{file_info['language']}\n{file_info['content']}\n```")
                else:
                    # For larger files, include first few lines
                    lines = file_info['content'].splitlines()[:20]
                    context_parts.append(f"```{file_info['language']}\n" + "\n".join(lines) + "\n... (truncated)\n```")
        
        return "\n\n".join(context_parts)
    
    def get_images_for_vision_model(self, processed_files: List[Dict]) -> List[str]:
        """Extract base64 images for vision-capable models"""
        images = []
        for file_info in processed_files:
            if file_info.get('type') == 'image' and 'base64' in file_info:
                images.append(file_info['base64'])
        return images