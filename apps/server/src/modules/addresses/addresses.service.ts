import { addressesRepository, type AddressFields, type UpdateAddressData } from './addresses.repository.js';

type OwnerRole = 'user' | 'technician';

const MAX_ADDRESSES_PER_OWNER = 3;

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
    data: AddressFields,
  ) {
    // Enforce max addresses per owner
    const count = role === 'user'
      ? await addressesRepository.getAddressCountByUserId(ownerId)
      : await addressesRepository.getAddressCountByTechnicianId(ownerId);

    if (count >= MAX_ADDRESSES_PER_OWNER) {
      throw new Error(`Maximum of ${MAX_ADDRESSES_PER_OWNER} addresses allowed`);
    }

    // Atomically deactivate all existing addresses, then create the new one as active
    await addressesRepository.deactivateAllAddresses(ownerId, role);

    const ownerData = role === 'user'
      ? { user_id: ownerId, ...data, is_active: true }
      : { technician_id: ownerId, ...data, is_active: true };

    return await addressesRepository.createAddress(ownerData);
  }

  async setActiveAddress(ownerId: string, role: OwnerRole, addressId: string) {
    // Deactivate all, then activate the chosen one
    await addressesRepository.deactivateAllAddresses(ownerId, role);
    return await addressesRepository.setAddressActive(addressId, ownerId, role);
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
