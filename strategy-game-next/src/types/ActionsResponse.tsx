export type PlaceHouseResponse = {
    success: boolean;
    message: string;   // e.g. "HOUSE_PLACED" or "CELL_OCCUPIED"
    traceId: string;
};