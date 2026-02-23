import { addressesRepository, type CreateAddressData, type UpdateAddressData } from './addresses.repository.js';

type OwnerRole = 'user' | 'technician';

export class AddressesService {
  async getAddresses(ownerId: string, role: OwnerRole) {
    if (role === 'user') {
      return await addressesRepository.getAddressesByUserId(ownerId);
    }
    return await addressesRepository.getAddressesByTechnicianId(ownerId);
  }

  async addAddress(
    ownerId: string,
    role: OwnerRole,
    data: Omit<CreateAddressData, 'user_id' | 'technician_id'>,
  ) {
    const ownerKey = role === 'user' ? 'user_id' : 'technician_id';
    return await addressesRepository.createAddress({
      [ownerKey]: ownerId,
      city: data.city,
      street: data.street,
      building_no: data.building_no,
      apartment_no: data.apartment_no,
      latitude: data.latitude,
      longitude: data.longitude,
    });
  }

  async updateAddress(
    ownerId: string,
    role: OwnerRole,
    addressId: string,
    data: UpdateAddressData,
  ) {
    return await addressesRepository.updateAddress(addressId, data, ownerId, role);
  }

  async deleteAddress(ownerId: string, role: OwnerRole, addressId: string) {
    // Prevent deleting the only address
    const count =
      role === 'user'
        ? await addressesRepository.getAddressCountByUserId(ownerId)
        : await addressesRepository.getAddressCountByTechnicianId(ownerId);

    if (count <= 1) {
      throw new Error('You must have at least one address');
    }

    await addressesRepository.deleteAddress(addressId, ownerId, role);
    return { success: true, message: 'Address deleted successfully' };
  }
}

export const addressesService = new AddressesService();
