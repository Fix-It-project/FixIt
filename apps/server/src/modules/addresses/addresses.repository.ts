import { supabaseAdmin } from '../../shared/db/supabase.js';

const supabase = supabaseAdmin;

export interface CreateAddressData {
  user_id?: string;
  technician_id?: string;
  city: string;
  street: string;
  building_no?: string;
  apartment_no?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdateAddressData {
  city?: string;
  street?: string;
  building_no?: string;
  apartment_no?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export class AddressesRepository {
  async createAddress(data: CreateAddressData) {
    try {
      console.log('Creating address with data:', data);

      const { data: address, error } = await supabase
        .from('addresses')
        .insert({
          user_id: data.user_id ?? null,
          technician_id: data.technician_id ?? null,
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

  async getAddressByUserId(userId: string) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getAddressByTechnicianId(technicianId: string) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('technician_id', technicianId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async updateAddress(id: string, data: UpdateAddressData) {
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
}

export const addressesRepository = new AddressesRepository();
