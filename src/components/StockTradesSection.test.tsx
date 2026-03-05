import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StockTradesSection, { type StockTrade } from './StockTradesSection';

describe('StockTradesSection', () => {
  describe('BUG #41 REGRESSION: Stock trading data math errors', () => {
    it('purchase count + sale count should equal total trades', () => {
      const trades: StockTrade[] = [
        {
          ticker: 'AAPL',
          company: 'Apple Inc.',
          tradedDate: '2024-01-15',
          filedDate: '2024-02-01',
          transaction: 'Purchase',
          tradeSizeUsd: 50000,
          excessReturn: 5.2,
        },
        {
          ticker: 'MSFT',
          company: 'Microsoft',
          tradedDate: '2024-01-20',
          filedDate: '2024-02-05',
          transaction: 'Sale',
          tradeSizeUsd: 30000,
          excessReturn: 3.1,
        },
        {
          ticker: 'GOOGL',
          company: 'Alphabet',
          tradedDate: '2024-02-10',
          filedDate: '2024-02-25',
          transaction: 'Purchase',
          tradeSizeUsd: 75000,
          excessReturn: -1.2,
        },
      ];

      const { container } = render(<StockTradesSection trades={trades} memberName="Test Member" />);

      // Find the stat boxes
      const statBoxes = container.querySelectorAll('.font-mono.font-black');
      const totalTrades = parseInt(statBoxes[0]?.textContent || '0');
      const purchases = parseInt(statBoxes[1]?.textContent || '0');
      const sales = parseInt(statBoxes[2]?.textContent || '0');

      // Total should equal purchases + sales
      expect(totalTrades).toBe(3);
      expect(purchases).toBe(2);
      expect(sales).toBe(1);
      expect(purchases + sales).toBe(totalTrades);
    });

    it('handles case-insensitive transaction types', () => {
      const trades: StockTrade[] = [
        {
          ticker: 'AAPL',
          company: 'Apple Inc.',
          tradedDate: '2024-01-15',
          filedDate: '2024-02-01',
          transaction: 'purchase' as any, // lowercase
          tradeSizeUsd: 50000,
          excessReturn: null,
        },
        {
          ticker: 'MSFT',
          company: 'Microsoft',
          tradedDate: '2024-01-20',
          filedDate: '2024-02-05',
          transaction: 'SALE' as any, // uppercase
          tradeSizeUsd: 30000,
          excessReturn: null,
        },
      ];

      const { container } = render(<StockTradesSection trades={trades} memberName="Test Member" />);

      const statBoxes = container.querySelectorAll('.font-mono.font-black');
      const totalTrades = parseInt(statBoxes[0]?.textContent || '0');
      const purchases = parseInt(statBoxes[1]?.textContent || '0');
      const sales = parseInt(statBoxes[2]?.textContent || '0');

      expect(totalTrades).toBe(2);
      expect(purchases).toBe(1);
      expect(sales).toBe(1);
      expect(purchases + sales).toBe(totalTrades);
    });

    it('handles transaction types with extra whitespace', () => {
      const trades: StockTrade[] = [
        {
          ticker: 'AAPL',
          company: 'Apple Inc.',
          tradedDate: '2024-01-15',
          filedDate: '2024-02-01',
          transaction: ' Purchase ' as any,
          tradeSizeUsd: 50000,
          excessReturn: null,
        },
        {
          ticker: 'MSFT',
          company: 'Microsoft',
          tradedDate: '2024-01-20',
          filedDate: '2024-02-05',
          transaction: '  Sale  ' as any,
          tradeSizeUsd: 30000,
          excessReturn: null,
        },
      ];

      const { container } = render(<StockTradesSection trades={trades} memberName="Test Member" />);

      const statBoxes = container.querySelectorAll('.font-mono.font-black');
      const purchases = parseInt(statBoxes[1]?.textContent || '0');
      const sales = parseInt(statBoxes[2]?.textContent || '0');

      expect(purchases).toBe(1);
      expect(sales).toBe(1);
    });

    it('all displayed trades are counted in summary stats', () => {
      // This was the Ashley Moody scenario: showed trades in table but not in counters
      const trades: StockTrade[] = Array.from({ length: 23 }, (_, i) => ({
        ticker: `STOCK${i}`,
        company: `Company ${i}`,
        tradedDate: '2024-01-15',
        filedDate: '2024-02-01',
        transaction: i < 15 ? 'Purchase' : 'Sale',
        tradeSizeUsd: 10000,
        excessReturn: null,
      }));

      const { container } = render(<StockTradesSection trades={trades} memberName="Ashley Moody" />);

      const statBoxes = container.querySelectorAll('.font-mono.font-black');
      const totalTrades = parseInt(statBoxes[0]?.textContent || '0');
      const purchases = parseInt(statBoxes[1]?.textContent || '0');
      const sales = parseInt(statBoxes[2]?.textContent || '0');

      // Total should be 23 (all trades counted)
      expect(totalTrades).toBe(23);
      // 15 purchases, 8 sales
      expect(purchases).toBe(15);
      expect(sales).toBe(8);
      // Math must be consistent
      expect(purchases + sales).toBe(totalTrades);
    });

    it('handles empty trade list correctly', () => {
      const trades: StockTrade[] = [];

      render(<StockTradesSection trades={trades} memberName="Test Member" />);

      // Component now shows a "Being Compiled" message instead of "No Stock Trades Found"
      expect(screen.getByText('Stock Trade Data Being Compiled')).toBeInTheDocument();
    });

    it('zero purchases or sales should display as 0, not hide the counter', () => {
      // Jim Costa scenario: "0 purchases + 0 sales" but header says "1 total trade"
      // This shouldn't happen with our fix, but let's test the edge case
      const trades: StockTrade[] = [
        {
          ticker: 'AAPL',
          company: 'Apple Inc.',
          tradedDate: '2024-01-15',
          filedDate: '2024-02-01',
          transaction: 'Purchase',
          tradeSizeUsd: 50000,
          excessReturn: null,
        },
      ];

      const { container } = render(<StockTradesSection trades={trades} memberName="Jim Costa" />);

      const statBoxes = container.querySelectorAll('.font-mono.font-black');
      const totalTrades = parseInt(statBoxes[0]?.textContent || '0');
      const purchases = parseInt(statBoxes[1]?.textContent || '0');
      const sales = parseInt(statBoxes[2]?.textContent || '0');

      expect(totalTrades).toBe(1);
      expect(purchases).toBe(1);
      expect(sales).toBe(0); // Should show 0, not hide
      expect(purchases + sales).toBe(totalTrades);
    });
  });
});
