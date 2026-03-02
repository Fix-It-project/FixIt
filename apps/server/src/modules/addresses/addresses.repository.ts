import { supabaseAdmin } from '../../shared/db/supabase.js';

const supabase = supabaseAdmin;

/** Shared address fields (no owner) — used during signup flows */
export interface AddressFields {
  city: string;
  street: string;
  building_no?: string;
  apartment_no?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CreateUserAddressData extends AddressFields {
  user_id: string;
}

export interface CreateTechnicianAddressData extends AddressFields {
  technician_id: string;
}

export type CreateAddressData = CreateUserAddressData | CreateTechnicianAddressData;

export interface UpdateAddressData {
  city?: string;
  street?: string;
  building_no?: string;
  apartment_no?: string;
  latitude?: number | null;
  longitude?: number | null;
}

/** Alias kept for backward-compat — the shared fields callers pass during signup. */
export type SignUpAddressData = AddressFields;

export interface IAddressesRepository {
  createAddress(data: CreateAddressData): Promise<any>;
  getAddressesByUserId(userId: string): Promise<any[]>;
  getAddressCountByUserId(userId: string): Promise<number>;
  getAddressesByTechnicianId(technicianId: string): Promise<any[]>;
  getAddressCountByTechnicianId(technicianId: string): Promise<number>;
  updateAddress(id: string, data: UpdateAddressData, ownerId: string, ownerRole: 'user' | 'technician'): Promise<any>;
  deleteAddress(id: string, ownerId: string, ownerRole: 'user' | 'technician'): Promise<void>;
}

export class AddressesRepository implements IAddressesRepository {
  async createAddress(data: CreateAddressData) {
    try {
      console.log('Creating address with data:', data);

      const { data: address, error } = await supabase
        .from('addresses')
        .insert({
          user_id: 'user_id' in data ? data.user_id : null,
          technician_id: 'technician_id' in data ? data.technician_id : null,
          city: data.city,
          street: data.street,
          building_no: data.building_no ?? null,
          apartment_no: data.apartment_no ?? null,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      console.log('Inserted address:', address);
      return address;
    } catch (error) {
      console.error('Error inserting address:', error);
      throw error;
    }
  }

  async getAddressesByUserId(userId: string) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  async getAddressCountByUserId(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('addresses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count ?? 0;
  }

  async getAddressesByTechnicianId(technicianId: string) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('technician_id', technicianId);

    if (error) throw error;
    return data;
  }

  async getAddressCountByTechnicianId(technicianId: string): Promise<number> {
    const { count, error } = await supabase
      .from('addresses')
      .select('*', { count: 'exact', head: true })
      .eq('technician_id', technicianId);

    if (error) throw error;
    return count ?? 0;
  }

  async updateAddress(id: string, data: UpdateAddressData, ownerId: string, ownerRole: 'user' | 'technician') {
    const ownerColumn = ownerRole === 'user' ? 'user_id' : 'technician_id';
    
    const { data: existing, error: checkError } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', id)
      .eq(ownerColumn, ownerId)
      .maybeSingle();
      
    if (checkError) throw checkError;
    if (!existing) throw new Error('Address not found or unauthorized to update');

    const { data: address, error } = await supabase
      .from('addresses')
      .update({
        city: data.city,
        street: data.street,
        building_no: data.building_no,
        apartment_no: data.apartment_no,
        latitude: data.latitude,
        longitude: data.longitude,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return address;
  }

  async deleteAddress(id: string, ownerId: string, ownerRole: 'user' | 'technician') {
    const ownerColumn = ownerRole === 'user' ? 'user_id' : 'technician_id';

    const { data: existing, error: checkError } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', id)
      .eq(ownerColumn, ownerId)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!existing) throw new Error('Address not found or unauthorized to delete');

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export const addressesRepository = new AddressesRepository();
