import { logger } from '../logger';

describe('Logger Utils', () => {
    it('should have info method', () => {
        expect(typeof logger.info).toBe('function');
    });

    it('should have error method', () => {
        expect(typeof logger.error).toBe('function');
    });

    it('should have warn method', () => {
        expect(typeof logger.warn).toBe('function');
    });

    it('should have debug method', () => {
        expect(typeof logger.debug).toBe('function');
    });
});
