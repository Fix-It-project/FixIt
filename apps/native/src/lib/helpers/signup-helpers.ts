export interface TechnicianSignUpInput {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phone: string;
	categoryId: string;
	city: string;
	street: string;
	buildingNumber: string;
	apartmentNumber: string;
	nationalIdUri: string;
	criminalRecordUri: string;
	certificateUri: string;
}

export function buildFormData(
	data: TechnicianSignUpInput,
	location: { latitude: number; longitude: number } | null,
): FormData {
	const formData = new FormData();

	formData.append("email", data.email);
	formData.append("password", data.password);
	formData.append("first_name", data.firstName);
	formData.append("last_name", data.lastName);
	formData.append("phone", data.phone);
	formData.append("category_id", data.categoryId);

	// Address fields
	formData.append("city", data.city);
	formData.append("street", data.street);
	formData.append("building_no", data.buildingNumber);
	formData.append("apartment_no", data.apartmentNumber);

	if (location) {
		formData.append("latitude", location.latitude.toString());
		formData.append("longitude", location.longitude.toString());
	}

	// Document files
	if (data.nationalIdUri) {
		formData.append("national_id", {
			uri: data.nationalIdUri,
			type: "image/jpeg",
			name: "national_id.jpg",
		} as unknown as Blob); // Platform workaround: RN FormData requires Blob cast
	}

	if (data.criminalRecordUri) {
		formData.append("criminal_record", {
			uri: data.criminalRecordUri,
			type: "image/jpeg",
			name: "criminal_record.jpg",
		} as unknown as Blob); // Platform workaround: RN FormData requires Blob cast
	}

	if (data.certificateUri) {
		formData.append("birth_certificate", {
			uri: data.certificateUri,
			type: "image/jpeg",
			name: "birth_certificate.jpg",
		} as unknown as Blob); // Platform workaround: RN FormData requires Blob cast
	}

	return formData;
}
