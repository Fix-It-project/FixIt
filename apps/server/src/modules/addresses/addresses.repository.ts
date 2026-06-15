import { supabaseAdmin } from '../../shared/db/supabase.js';
import { AppError } from '../../shared/errors/index.js';
import { logger } from '../../shared/logger.js';

const supabase = supabaseAdmin;

/** Shared address fields (no owner) — used during signup flows */
export interface AddressFields {
  city: string;
  street: string;
  building_no?: string;
  apartment_no?: string;
  latitude?: number | null;
  longitude?: number | null;
  is_active?: boolean;
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
  deactivateAllAddresses(ownerId: string, ownerRole: 'user' | 'technician'): Promise<void>;
  setAddressActive(id: string, ownerId: string, ownerRole: 'user' | 'technician'): Promise<any>;
}

export class AddressesRepository implements IAddressesRepository {
  async createAddress(data: CreateAddressData) {
    try {
      logger.info({ data }, "Creating address with data");

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
          is_active: data.is_active ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      logger.info({ address }, "Inserted address");
      return address;
    } catch (error) {
      logger.error({ error }, "Error inserting address");
      throw error;
    }
  }

  async getAddressesByUserId(userId: string) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .is('deleted_at', null)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getAddressCountByUserId(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('addresses')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('user_id', userId);

    if (error) throw error;
    return count ?? 0;
  }

  async getAddressesByTechnicianId(technicianId: string) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .is('deleted_at', null)
      .eq('technician_id', technicianId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getAddressCountByTechnicianId(technicianId: string): Promise<number> {
    const { count, error } = await supabase
      .from('addresses')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
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
      .is('deleted_at', null)
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
      .select('id, is_active')
      .eq('id', id)
      .eq(ownerColumn, ownerId)
      .is('deleted_at', null)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!existing) throw new Error('Address not found or unauthorized to delete');
    if (existing.is_active === true) {
      throw AppError.conflict('Switch to another saved address before deleting this one.');
    }

    // Soft delete: addresses referenced by orders.destination_address_id cannot be
    // hard-deleted (FK ON DELETE NO ACTION), and order history must be preserved.
    const { error } = await supabase
      .from('addresses')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  async deactivateAllAddresses(ownerId: string, ownerRole: 'user' | 'technician') {
    const ownerColumn = ownerRole === 'user' ? 'user_id' : 'technician_id';

    const { error } = await supabase
      .from('addresses')
      .update({ is_active: false })
      .eq(ownerColumn, ownerId)
      .eq('is_active', true);

    if (error) throw error;
  }

  /** Hard-deletes every address belonging to a technician (account removal). */
  async deleteByTechnicianId(technicianId: string) {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('technician_id', technicianId);

    if (error) throw error;
  }

  async setAddressActive(id: string, ownerId: string, ownerRole: 'user' | 'technician') {
    const ownerColumn = ownerRole === 'user' ? 'user_id' : 'technician_id';

    // Verify ownership
    const { data: existing, error: checkError } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', id)
      .eq(ownerColumn, ownerId)
      .is('deleted_at', null)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!existing) throw new Error('Address not found or unauthorized');

    const { data: address, error } = await supabase
      .from('addresses')
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return address;
  }
}

export const addressesRepository = new AddressesRepository();
