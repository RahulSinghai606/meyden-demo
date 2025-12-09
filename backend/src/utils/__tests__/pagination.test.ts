import { getPaginationParams } from '../pagination';
import { Request } from 'express';

describe('Pagination Utils', () => {
    it('should return default values when no query params provided', () => {
        const req = { query: {} } as unknown as Request;
        const result = getPaginationParams(req);
        expect(result).toEqual({ page: 1, limit: 20, offset: 0 });
    });

    it('should parse valid page and limit', () => {
        const req = { query: { page: '2', limit: '10' } } as unknown as Request;
        const result = getPaginationParams(req);
        expect(result).toEqual({ page: 2, limit: 10, offset: 10 });
    });

    it('should use custom default limit', () => {
        const req = { query: {} } as unknown as Request;
        const result = getPaginationParams(req, 50);
        expect(result).toEqual({ page: 1, limit: 50, offset: 0 });
    });

    it('should handle invalid numbers gracefully', () => {
        const req = { query: { page: 'invalid', limit: 'invalid' } } as unknown as Request;
        const result = getPaginationParams(req);
        expect(result).toEqual({ page: 1, limit: 20, offset: 0 });
    });
});
