export interface UploadDocumentInput {
	uri: string;
	name: string;
	type: string;
}

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
	nationalId: UploadDocumentInput;
	criminalRecord: UploadDocumentInput;
	certificate: UploadDocumentInput;
}

function appendDocument(
	formData: FormData,
	field: string,
	document: UploadDocumentInput,
): void {
	formData.append(field, {
		uri: document.uri,
		type: document.type,
		name: document.name,
	} as unknown as Blob); // Platform workaround: RN FormData requires Blob cast
}

export function buildFormData(
	data: TechnicianSignUpInput,
	location: { latitude: number; longitude: number } | null,
	expoPushToken?: string,
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

	// Push token so the server can notify this device when an admin verifies
	// the account (a pending tech can't register via the auth-gated endpoint).
	if (expoPushToken) {
		formData.append("expo_push_token", expoPushToken);
	}

	// Document files
	appendDocument(formData, "national_id", data.nationalId);
	appendDocument(formData, "criminal_record", data.criminalRecord);
	appendDocument(formData, "birth_certificate", data.certificate);

	return formData;
}
