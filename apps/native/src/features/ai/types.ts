export interface DiagnoseRequest {
    text: string;
    latitude: number;
    longitude: number;
    userId?: number | null;
    image?: string;
    audio?: string;
}