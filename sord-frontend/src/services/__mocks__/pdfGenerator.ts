import { QuoteData } from '../pdfGenerator';

export const generateQuotePDF = jest.fn().mockImplementation((data: QuoteData) => {
  // Mock implementation that just returns void
  return undefined;
});
