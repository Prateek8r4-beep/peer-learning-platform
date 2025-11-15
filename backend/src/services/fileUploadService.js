const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class FileUploadService {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.bucket = process.env.S3_BUCKET_NAME;
  }

  async uploadFile(file, folder = 'notes') {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${folder}/${uuidv4()}${fileExtension}`;
    
    const params = {
      Bucket: this.bucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
      Metadata: {
        originalName: file.originalname
      }
    };
    
    try {
      const result = await this.s3.upload(params).promise();
      
      return {
        url: result.Location,
        key: result.Key,
        size: file.size,
        type: file.mimetype,
        originalName: file.originalname
      };
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new Error('File upload failed');
    }
  }

  async uploadMultipleFiles(files, folder = 'notes') {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(fileKey) {
    const params = {
      Bucket: this.bucket,
      Key: fileKey
    };
    
    try {
      await this.s3.deleteObject(params).promise();
      return { success: true };
    } catch (error) {
      console.error('S3 Delete Error:', error);
      throw new Error('File deletion failed');
    }
  }

  generateSignedUrl(fileKey, expiresIn = 3600) {
    const params = {
      Bucket: this.bucket,
      Key: fileKey,
      Expires: expiresIn
    };
    
    return this.s3.getSignedUrl('getObject', params);
  }

  async getFileMetadata(fileKey) {
    const params = {
      Bucket: this.bucket,
      Key: fileKey
    };
    
    try {
      const metadata = await this.s3.headObject(params).promise();
      return {
        size: metadata.ContentLength,
        type: metadata.ContentType,
        lastModified: metadata.LastModified,
        metadata: metadata.Metadata
      };
    } catch (error) {
      console.error('S3 Metadata Error:', error);
      throw new Error('Failed to get file metadata');
    }
  }
}

module.exports = new FileUploadService();
