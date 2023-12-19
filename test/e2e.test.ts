import { createQueryHook } from '../src/query';
import { createMutateHook } from '../src/mutate';

describe('it', () => {
  describe('createQueryHook', () => {
    it('should be defined', () => {
      expect(createQueryHook).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof createQueryHook).toEqual('function');
    });

    it('should be defined', () => {
      expect(createMutateHook).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof createMutateHook).toEqual('function');
    });
  });
});
