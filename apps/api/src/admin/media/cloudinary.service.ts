import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export type UploadedImage = {
  url: string;
  width: number;
  height: number;
};

@Injectable()
export class CloudinaryService {
  private readonly configured: boolean;

  constructor(config: ConfigService) {
    const cloudName = config.get<string>('cloudinary.cloudName') ?? '';
    const apiKey = config.get<string>('cloudinary.apiKey') ?? '';
    const apiSecret = config.get<string>('cloudinary.apiSecret') ?? '';

    this.configured = Boolean(cloudName && apiKey && apiSecret);
    if (this.configured) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }
  }

  async uploadImage(buffer: Buffer, mimetype: string): Promise<UploadedImage> {
    if (!this.configured) {
      throw new ServiceUnavailableException(
        'Image uploads are not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      );
    }

    const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'giftbuddy',
      resource_type: 'image',
    });

    return {
      url: result.secure_url,
      width: result.width,
      height: result.height,
    };
  }
}
