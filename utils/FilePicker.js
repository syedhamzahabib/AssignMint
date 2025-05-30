// utils/FilePicker.js - React Native compatible file picker
import { Alert, Platform } from 'react-native';

// For React Native - install: npm install react-native-document-picker
// import DocumentPicker from 'react-native-document-picker';

// For Web - install: npm install react-native-file-picker-web
// import { launchImageLibrary } from 'react-native-image-picker';

class FilePicker {
  
  // Web implementation using HTML5 File API
  static pickFilesWeb() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '.pdf,.doc,.docx,.txt,.jpg,.png,.gif,.zip,.py,.js,.html,.css,.csv,.xlsx,.ppt,.pptx';
      
      input.onchange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
          const processedFiles = files.map((file, index) => ({
            id: `file_${Date.now()}_${index}`,
            name: file.name,
            size: this.formatFileSize(file.size),
            type: file.name.split('.').pop().toLowerCase(),
            uploadTime: new Date().toISOString(),
            category: this.categorizeFile(file.name.split('.').pop().toLowerCase()),
            file: file,
            rawSize: file.size,
            uri: URL.createObjectURL(file) // For preview
          }));
          resolve(processedFiles);
        } else {
          resolve([]);
        }
      };
      
      input.onerror = () => {
        reject(new Error('File selection failed'));
      };
      
      input.click();
    });
  }

  // React Native implementation
  static async pickFilesNative() {
    try {
      // Uncomment when using react-native-document-picker
      /*
      const results = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.plainText,
          DocumentPicker.types.images,
          DocumentPicker.types.zip,
          'application/javascript',
          'text/html',
          'text/css',
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ],
        allowMultiSelection: true,
        copyTo: 'documentDirectory'
      });

      return results.map((file, index) => ({
        id: `file_${Date.now()}_${index}`,
        name: file.name,
        size: this.formatFileSize(file.size),
        type: file.name.split('.').pop().toLowerCase(),
        uploadTime: new Date().toISOString(),
        category: this.categorizeFile(file.name.split('.').pop().toLowerCase()),
        file: file,
        rawSize: file.size,
        uri: file.uri,
        fileCopyUri: file.fileCopyUri
      }));
      */
      
      // Mock implementation for demo
      return this.getMockFiles();
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        return [];
      } else {
        throw error;
      }
    }
  }

  // Main method that chooses implementation based on platform
  static async pickFiles() {
    try {
      if (Platform.OS === 'web') {
        return await this.pickFilesWeb();
      } else {
        return await this.pickFilesNative();
      }
    } catch (error) {
      Alert.alert('File Selection Error', error.message);
      return [];
    }
  }

  // Camera picker for images (React Native only)
  static async pickImageFromCamera() {
    try {
      // Uncomment when using react-native-image-picker
      /*
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        allowsEditing: true,
        selectionLimit: 1
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return [{
          id: `img_${Date.now()}`,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          size: this.formatFileSize(asset.fileSize),
          type: 'jpg',
          uploadTime: new Date().toISOString(),
          category: 'Image',
          file: asset,
          rawSize: asset.fileSize,
          uri: asset.uri
        }];
      }
      */
      
      return [];
    } catch (error) {
      Alert.alert('Camera Error', error.message);
      return [];
    }
  }

  // Mock files for demo purposes
  static getMockFiles() {
    return [
      {
        id: `file_${Date.now()}_1`,
        name: 'solution_document.pdf',
        size: '2.4 MB',
        type: 'pdf',
        uploadTime: new Date().toISOString(),
        category: 'Document',
        rawSize: 2400000,
        uri: 'mock://file1'
      },
      {
        id: `file_${Date.now()}_2`,
        name: 'source_code.py',
        size: '15.2 KB',
        type: 'py',
        uploadTime: new Date().toISOString(),
        category: 'Source Code',
        rawSize: 15200,
        uri: 'mock://file2'
      }
    ];
  }

  // File categorization
  static categorizeFile(extension) {
    const categories = {
      'pdf': 'Document',
      'doc': 'Document',
      'docx': 'Document',
      'txt': 'Document',
      'md': 'Documentation',
      'py': 'Source Code',
      'js': 'Source Code',
      'jsx': 'Source Code',
      'ts': 'Source Code',
      'tsx': 'Source Code',
      'html': 'Source Code',
      'css': 'Source Code',
      'java': 'Source Code',
      'cpp': 'Source Code',
      'c': 'Source Code',
      'swift': 'Source Code',
      'kt': 'Source Code',
      'jpg': 'Image',
      'jpeg': 'Image',
      'png': 'Image',
      'gif': 'Image',
      'svg': 'Image',
      'webp': 'Image',
      'xlsx': 'Spreadsheet',
      'xls': 'Spreadsheet',
      'csv': 'Data File',
      'json': 'Data File',
      'xml': 'Data File',
      'zip': 'Archive',
      'rar': 'Archive',
      '7z': 'Archive',
      'tar': 'Archive',
      'gz': 'Archive',
      'mp4': 'Video',
      'avi': 'Video',
      'mov': 'Video',
      'wmv': 'Video',
      'mp3': 'Audio',
      'wav': 'Audio',
      'flac': 'Audio',
      'pptx': 'Presentation',
      'ppt': 'Presentation',
      'sketch': 'Design',
      'fig': 'Design',
      'psd': 'Design'
    };
    
    return categories[extension] || 'Other File';
  }

  // Format file size
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validate file type
  static isValidFileType(filename) {
    const allowedExtensions = [
      'pdf', 'doc', 'docx', 'txt', 'md',
      'py', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'java', 'cpp', 'c',
      'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp',
      'xlsx', 'xls', 'csv', 'json', 'xml',
      'zip', 'rar', '7z', 'tar', 'gz',
      'mp4', 'avi', 'mov', 'mp3', 'wav',
      'pptx', 'ppt', 'sketch', 'fig', 'psd'
    ];
    
    const extension = filename.split('.').pop().toLowerCase();
    return allowedExtensions.includes(extension);
  }

  // Validate file size (in bytes)
  static isValidFileSize(size, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return size <= maxSizeBytes;
  }

  // Check total upload size
  static validateTotalSize(files, maxTotalMB = 50) {
    const totalSize = files.reduce((sum, file) => sum + file.rawSize, 0);
    const maxTotalBytes = maxTotalMB * 1024 * 1024;
    return {
      isValid: totalSize <= maxTotalBytes,
      totalSize: this.formatFileSize(totalSize),
      maxSize: this.formatFileSize(maxTotalBytes)
    };
  }

  // Get file icon
  static getFileIcon(type) {
    const icons = {
      'pdf': '📄',
      'doc': '📝',
      'docx': '📝',
      'txt': '📃',
      'md': '📋',
      'py': '🐍',
      'js': '💻',
      'jsx': '⚛️',
      'ts': '💻',
      'tsx': '⚛️',
      'html': '🌐',
      'css': '🎨',
      'java': '☕',
      'cpp': '⚙️',
      'c': '⚙️',
      'swift': '🍎',
      'kt': '🤖',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'png': '🖼️',
      'gif': '🎞️',
      'svg': '🖼️',
      'webp': '🖼️',
      'xlsx': '📊',
      'xls': '📊',
      'csv': '📈',
      'json': '🔧',
      'xml': '🔧',
      'zip': '📦',
      'rar': '📦',
      '7z': '📦',
      'tar': '📦',
      'gz': '📦',
      'mp4': '🎥',
      'avi': '🎥',
      'mov': '🎥',
      'wmv': '🎥',
      'mp3': '🎵',
      'wav': '🎵',
      'flac': '🎵',
      'pptx': '📊',
      'ppt': '📊',
      'sketch': '🎨',
      'fig': '🎨',
      'psd': '🎨'
    };
    return icons[type] || '📎';
  }
}

export default FilePicker;

// Usage example in your component:
/*
import FilePicker from '../utils/FilePicker';

const handleFilePicker = async () => {
  try {
    const selectedFiles = await FilePicker.pickFiles();
    
    if (selectedFiles.length > 0) {
      // Validate files
      const validFiles = selectedFiles.filter(file => {
        if (!FilePicker.isValidFileType(file.name)) {
          Alert.alert('Invalid File', `${file.name} is not a supported file type`);
          return false;
        }
        if (!FilePicker.isValidFileSize(file.rawSize, 10)) {
          Alert.alert('File Too Large', `${file.name} exceeds 10MB limit`);
          return false;
        }
        return true;
      });

      // Check total size
      const sizeValidation = FilePicker.validateTotalSize([...deliveryFiles, ...validFiles]);
      if (!sizeValidation.isValid) {
        Alert.alert(
          'Total Size Exceeded', 
          `Total size (${sizeValidation.totalSize}) exceeds ${sizeValidation.maxSize} limit`
        );
        return;
      }

      setDeliveryFiles(prev => [...prev, ...validFiles]);
    }
  } catch (error) {
    Alert.alert('File Selection Error', error.message);
  }
};
*/