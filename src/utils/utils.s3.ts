import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import sharp from 'sharp';
import { v4 } from 'uuid';

@Injectable()
export class S3Storage {
  constructor(private readonly configService: ConfigService) {}
  private imageBucket = 'guestly-app-dev';
  private pdfBucket = this.configService.get('AWS_IMAGE_BUCKET_NAME');
  private videoBucket = this.configService.get('AWS_IMAGE_BUCKET_NAME');
  private region = 'eu-central-1';
  private acessKeyId = 'AKIAUZWM37K6BNKXZUPK';
  private secretAccessKey = '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';

  private s3 = new S3({
    region: this.region,
    accessKeyId: this.acessKeyId,
    secretAccessKey: this.secretAccessKey,
  });

  private objectofuploadedFiles(finalObjectInfo, resolvedPromise) {
    const obj = {};
    let counter = 0;
    for (let i = 0; i < finalObjectInfo.length; i++) {
      for (let j = 0; j < finalObjectInfo[i]['length']; j++) {
        !!obj[finalObjectInfo[i]['name']]
          ? obj[finalObjectInfo[i]['name']].push(resolvedPromise[counter])
          : (obj[finalObjectInfo[i]['name']] = [resolvedPromise[counter]]);

        counter++;
      }
    }
    return obj;
  }

  getFileStream(params: { Bucket: string; Key: string }) {
    return this.s3.getObject(params).createReadStream();
  }

  async getUploadingSignedUrl(
    contentType = 'video/mp4',
  ): Promise<{ url: string; Key: string }> {
    const ext = contentType === '-video/mp4' ? '-video/mp4' : '-image/jpg';
    const Key = `${v4()}${ext}`;
    const url = await this.s3.getSignedUrlPromise('putObject', {
      Bucket: this.videoBucket,
      key: Key,
      Expires: 60 * 2,
      contentType: contentType,
    });
    return { url, Key };
  }

  async deleteImage(fileKey: string): Promise<any> {
    if (['default.jpg', null, undefined].includes(fileKey)) return;
    const deleteParams = { Key: fileKey, Bucket: this.imageBucket };
    return this.s3.deleteObject(deleteParams).promise();
  }

  async deleteFiles(fileKey: string): Promise<any> {
    const deleteParams = { Key: fileKey, Bucket: this.videoBucket };
    return this.s3.deleteObject(deleteParams).promise();
  }

  async uploadPdf(body: Buffer): Promise<string> {
    const Key = `${v4()}.pdf`;
    await this.s3
      .putObject({
        Body: body,
        ContentType: 'application/pdf',
        Bucket: this.imageBucket,
        Key,
      })
      .promise();
    return Key;
  }

  async uploadFiles(files: Array<any>): Promise<any> {
    if (!files || files.length === 0) return;

    console.log(files);

    // example data
    //   [
    //       {photo : 'avatar' , length : 4}
    //       {product : 'avatar' , length : 4}
    //   ]

    const finalObjectInfo: Array<{ name: string; length: number }> =
      Object.entries(files).map((val) => ({
        name: val[0],
        length: val[1]['length'],
      }));
    console.log(finalObjectInfo, 'finalObjectInfo');
    const unresolvedPromiseOfSharp = Object.values(files)
      .flat()
      .map(async (file: any) => {
        const fileType = file.mimetype?.split('/')[1];
        let _sharp;
        if (file.mimetype.startsWith('image')) {
          if (fileType == 'jpeg' || fileType == 'jpg')
            _sharp = await sharp(file?.buffer)
              .resize()
              .toFormat('jpeg')
              .jpeg({ quality: 40 })
              .toBuffer();
          else if (fileType == 'gif')
            _sharp = await sharp(file?.buffer)
              .resize()
              .toFormat('gif')
              .gif()
              .toBuffer();
          else if (fileType == 'png')
            _sharp = await sharp(file?.buffer)
              .resize()
              .toFormat('png')
              .gif()
              .toBuffer();
          else if (fileType == 'webp')
            _sharp = await sharp(file?.buffer)
              .resize()
              .toFormat('webp')
              .webp()
              .toBuffer();
          else {
            _sharp = await sharp(file?.buffer)
              .resize()
              .toFormat('png')
              .png()
              .toBuffer();
          }
        } else {
          _sharp = file?.buffer;
        }
        console.log(_sharp, '_sharp');

        return _sharp;
      });

    const sharpImage = await Promise.all(unresolvedPromiseOfSharp);

    // console.log(sharpImage,'sharpImage')
    const resolvedFiles = [];

    const unresolvedpromise = Object.values(files)
      .flat()
      .map(async (file: any, i) => {
        const fileType = file.mimetype.split('/')[1];
        const params: any = {
          Body: sharpImage[i],
          Bucket: this.imageBucket,
          Key: `${v4()}.${fileType || 'jpeg'}`,
        };
        console.log(params, 'params');
        resolvedFiles.push({
          Key: params.Key,
          Bucket: this.imageBucket,
          originalname: file?.originalname,
          size: file?.size,
          mimetype: file?.mimetype,
          encoding: file?.encoding,
        });
        return await this.s3
          .putObject(params)
          .promise()
          .then((response) => console.log(response))
          .catch((e)=> console.log(e))
      });

    await Promise.all(unresolvedpromise);
    const result = await this.objectofuploadedFiles(
      finalObjectInfo,
      resolvedFiles,
    );
    console.log(result);
    return result;
  }

  async getUploadingSignedUrlList(
    count: number,
  ): Promise<{ urls: number[]; keys: number[] }> {
    const keyList = [];
    const urlList = [];

    if (count > 0) {
      for (let index = 0; index <= count; index++) {
        const { Key, url } = await this.getUploadingSignedUrl();

        keyList.push(Key);
        urlList.push(url);
      }
    }
    return { keys: keyList, urls: urlList };
  }
}
