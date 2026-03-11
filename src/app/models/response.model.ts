export interface ResponseData {
    message: string,
    data: any,
    status: number,
    type?: string,
    errors?: any,
}

export interface ResponseDataPagination {
    count: number,
    next: string,
    previous: string,
    results: any[],
    errors?: any,
}