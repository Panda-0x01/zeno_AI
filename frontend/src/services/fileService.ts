export interface FileAttachment {
  file: File;
  type: 'image' | 'text' | 'document';
  preview?: string;
  content?: string;
}

export class FileService {
  static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  static readonly SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  static readonly SUPPORTED_TEXT_TYPES = [
    'text/plain',
    'text/markdown',
    'text/javascript',
    'text/typescript',
    'text/html',
    'text/css',
    'application/json',
    'application/javascript'
  ];

  static isImageFile(file: File): boolean {
    return this.SUPPORTED_IMAGE_TYPES.includes(file.type) || 
           file.type.startsWith('image/');
  }

  static isTextFile(file: File): boolean {
    if (this.SUPPORTED_TEXT_TYPES.includes(file.type)) {
      return true;
    }
    
    // Check by extension
    const extension = file.name.toLowerCase().split('.').pop();
    const textExtensions = [
      'txt', 'md', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 
      'cpp', 'c', 'html', 'css', 'json', 'xml', 'yaml', 'yml'
    ];
    
    return textExtensions.includes(extension || '');
  }

  static isSupportedFile(file: File): boolean {
    return this.isImageFile(file) || this.isTextFile(file);
  }

  static validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: `File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit` };
    }

    if (!this.isSupportedFile(file)) {
      return { valid: false, error: 'File type not supported' };
    }

    return { valid: true };
  }

  static async createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isImageFile(file)) {
        reject(new Error('File is not an image'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });
  }

  static async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isTextFile(file)) {
        reject(new Error('File is not a text file'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getFileTypeCategory(file: File): 'image' | 'text' | 'document' {
    if (this.isImageFile(file)) return 'image';
    if (this.isTextFile(file)) return 'text';
    return 'document';
  }
}