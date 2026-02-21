import supabase from '../../shared/db/supabase.js';
import { supabaseAdmin } from '../../shared/db/supabase.js';
import { env } from '@FixIt/env/server';

export interface TechnicianSignUpData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  category_id: string;
}

export interface TechnicianDocumentFiles {
  criminal_record?: Express.Multer.File;
  birth_certificate?: Express.Multer.File;
  national_id?: Express.Multer.File;
}

const STORAGE_BUCKET = env.STORAGE_BUCKET;

export class TechnicianAuthRepository {
  // ─── Supabase Auth ────────────────────────────────────────────────────────

  async signUp({ email, password, first_name, last_name, phone }: TechnicianSignUpData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          phone,
          role: 'technician',
        },
      },
    });

    if (error) {
      if (
        error.message.includes('already registered') ||
        error.message.includes('already exists')
      ) {
        throw new Error('A technician with this email already exists');
      }
      throw error;
    }

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signOut(_accessToken: string) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true, message: 'Logged out successfully' };
  }

  async getUser(accessToken: string) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error) throw error;
    return data.user;
  }

  async refreshToken(refreshToken: string) {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error) throw error;
    return data;
  }

  // ─── Supabase Storage ─────────────────────────────────────────────────────

  /**
   * Uploads a single document buffer to Supabase storage.
   * Returns the public URL of the uploaded file.
   */
  async uploadDocument(
    technicianId: string,
    documentName: 'criminal_record' | 'birth_certificate' | 'national_id',
    file: Express.Multer.File,
  ): Promise<string> {
    const filePath = `${technicianId}/${documentName}`;

    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload ${documentName}: ${error.message}`);
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  /**
   * Uploads all three documents and returns their public URLs.
   * Skips any document whose file is not provided.
   */
  async uploadDocuments(technicianId: string, files: TechnicianDocumentFiles) {
    const uploads: {
      criminal_record?: string;
      birth_certificate?: string;
      national_id?: string;
    } = {};

    const uploadTasks: Promise<void>[] = [];

    if (files.criminal_record) {
      uploadTasks.push(
        this.uploadDocument(technicianId, 'criminal_record', files.criminal_record).then(
          (url) => { uploads.criminal_record = url; },
        ),
      );
    }

    if (files.birth_certificate) {
      uploadTasks.push(
        this.uploadDocument(technicianId, 'birth_certificate', files.birth_certificate).then(
          (url) => { uploads.birth_certificate = url; },
        ),
      );
    }

    if (files.national_id) {
      uploadTasks.push(
        this.uploadDocument(technicianId, 'national_id', files.national_id).then(
          (url) => { uploads.national_id = url; },
        ),
      );
    }

    await Promise.all(uploadTasks);
    return uploads;
  }
}

export const technicianAuthRepository = new TechnicianAuthRepository();
