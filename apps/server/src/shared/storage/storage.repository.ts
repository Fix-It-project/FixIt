import { supabaseAdmin } from '../db/supabase.js';
import { env } from '@FixIt/env/server';

const STORAGE_BUCKET = env.STORAGE_BUCKET;

export type DocumentName = 'criminal_record' | 'birth_certificate' | 'national_id';

export interface DocumentFiles {
  criminal_record?: Express.Multer.File;
  birth_certificate?: Express.Multer.File;
  national_id?: Express.Multer.File;
}

export interface IStorageRepository {
  uploadFile(folder: string, fileName: string, file: Express.Multer.File): Promise<string>;
  uploadDocuments(technicianId: string, files: DocumentFiles): Promise<{
    criminal_record?: string;
    birth_certificate?: string;
    national_id?: string;
  }>;
}

export class StorageRepository implements IStorageRepository {
  /**
   * Uploads a single file buffer to Supabase Storage.
   * Returns the public URL of the uploaded file.
   */
  async uploadFile(
    folder: string,
    fileName: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload ${fileName}: ${error.message}`);
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  /**
   * Uploads technician documents in parallel and returns their public URLs.
   * Skips any document whose file is not provided.
   */
  async uploadDocuments(technicianId: string, files: DocumentFiles) {
    const uploads: {
      criminal_record?: string;
      birth_certificate?: string;
      national_id?: string;
    } = {};

    const documentNames: DocumentName[] = ['criminal_record', 'birth_certificate', 'national_id'];

    const uploadTasks = documentNames
      .filter((name) => files[name])
      .map((name) =>
        this.uploadFile(technicianId, name, files[name]!).then((url) => {
          uploads[name] = url;
        }),
      );

    await Promise.all(uploadTasks);
    return uploads;
  }
}

export const storageRepository = new StorageRepository();
