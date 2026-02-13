import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveUserState, getUserState, clearUserState } from './geolocation';

describe('geolocation utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('saveUserState', () => {
    it('saves state to localStorage', () => {
      saveUserState('CA');
      expect(localStorage.getItem('userState')).toBe('CA');
    });

    it('overwrites existing state', () => {
      saveUserState('NY');
      saveUserState('TX');
      expect(localStorage.getItem('userState')).toBe('TX');
    });

    it('handles uppercase abbreviations', () => {
      saveUserState('FL');
      expect(localStorage.getItem('userState')).toBe('FL');
    });
  });

  describe('getUserState', () => {
    it('returns null when no state is saved', () => {
      expect(getUserState()).toBe(null);
    });

    it('returns saved state', () => {
      localStorage.setItem('userState', 'CA');
      expect(getUserState()).toBe('CA');
    });

    it('returns most recent state', () => {
      localStorage.setItem('userState', 'NY');
      expect(getUserState()).toBe('NY');
      localStorage.setItem('userState', 'TX');
      expect(getUserState()).toBe('TX');
    });
  });

  describe('clearUserState', () => {
    it('removes state from localStorage', () => {
      localStorage.setItem('userState', 'CA');
      clearUserState();
      expect(localStorage.getItem('userState')).toBe(null);
    });

    it('handles clearing when no state exists', () => {
      expect(() => clearUserState()).not.toThrow();
      expect(localStorage.getItem('userState')).toBe(null);
    });
  });

  describe('error handling', () => {
    it('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw
      expect(() => saveUserState('CA')).not.toThrow();

      setItemSpy.mockRestore();
    });
  });
});
