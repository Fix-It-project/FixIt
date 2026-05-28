export interface AdminUser {
	id: "admin";
	email: string;
	role: "admin";
}

export interface AdminJwtPayload {
	sub: "admin";
	email: string;
	role: "admin";
}
