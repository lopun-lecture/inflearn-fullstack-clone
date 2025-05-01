import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MediaService {
  private s3Client: S3Client;
  private cloudFrontDomain: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
  }

  async uploadMedia(file: Express.Multer.File, userId: string) {
    const fileExtension = file.originalname.split('.').pop();
    const key = `media/${userId}/${uuid()}.${fileExtension}`;

    const res = await this.s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_MEDIA_S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      fileName: file.originalname,
      storageType: 's3',
      s3: {
        bucket: process.env.AWS_MEDIA_S3_BUCKET_NAME,
        key,
        size: res?.Size,
        region: process.env.AWS_REGION,
        metadata: {
          uploadedAt: new Date().toISOString(),
          contentType: file.mimetype,
        },
      },
      cloudFront: {
        url: this.getMediaUrl(key),
      },
    };
  }

  getMediaUrl(key: string) {
    return `https://${this.cloudFrontDomain}/${key}`;
  }
}
