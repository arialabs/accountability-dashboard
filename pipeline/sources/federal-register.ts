/**
 * Federal Register API Client
 * Fetches executive orders, presidential documents, and agency actions
 * API Docs: https://www.federalregister.gov/developers/documentation/api/v1
 */

interface FederalRegisterDocument {
  abstract: string;
  action?: string;
  agencies: Array<{
    name: string;
    id: number;
  }>;
  body_html_url: string;
  citation?: string;
  document_number: string;
  end_page?: number;
  html_url: string;
  pdf_url: string;
  publication_date: string;
  signing_date?: string;
  start_page?: number;
  title: string;
  type: string;
  subtype?: string;
  executive_order_number?: number;
}

interface FederalRegisterResponse {
  count: number;
  description: string;
  total_pages: number;
  next_page_url?: string;
  results: FederalRegisterDocument[];
}

export class FederalRegisterClient {
  private baseUrl = 'https://www.federalregister.gov/api/v1';

  /**
   * Fetch executive orders by president
   */
  async getExecutiveOrders(
    president: string = 'donald-trump',
    options: {
      perPage?: number;
      page?: number;
      startDate?: string; // YYYY-MM-DD
      endDate?: string;
    } = {}
  ): Promise<FederalRegisterDocument[]> {
    const { perPage = 100, page = 1, startDate, endDate } = options;

    const params = new URLSearchParams({
      'conditions[type]': 'PRESDOCU',
      'conditions[presidential_document_type]': 'executive_order',
      'conditions[president]': president,
      per_page: perPage.toString(),
      page: page.toString(),
      'order': 'newest',
    });

    if (startDate) {
      params.append('conditions[publication_date][gte]', startDate);
    }
    if (endDate) {
      params.append('conditions[publication_date][lte]', endDate);
    }

    const url = `${this.baseUrl}/documents.json?${params}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Federal Register API error: ${response.status}`);
      }

      const data: FederalRegisterResponse = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error fetching executive orders:', error);
      throw error;
    }
  }

  /**
   * Fetch presidential documents (memoranda, proclamations, etc.)
   */
  async getPresidentialDocuments(
    president: string = 'donald-trump',
    options: {
      perPage?: number;
      page?: number;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<FederalRegisterDocument[]> {
    const { perPage = 100, page = 1, startDate, endDate } = options;

    const params = new URLSearchParams({
      'conditions[type]': 'PRESDOCU',
      'conditions[president]': president,
      per_page: perPage.toString(),
      page: page.toString(),
      'order': 'newest',
    });

    if (startDate) {
      params.append('conditions[publication_date][gte]', startDate);
    }
    if (endDate) {
      params.append('conditions[publication_date][lte]', endDate);
    }

    const url = `${this.baseUrl}/documents.json?${params}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Federal Register API error: ${response.status}`);
      }

      const data: FederalRegisterResponse = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error fetching presidential documents:', error);
      throw error;
    }
  }

  /**
   * Fetch agency-specific documents (rules, regulations)
   */
  async getAgencyDocuments(
    agencyIds: number[],
    options: {
      perPage?: number;
      page?: number;
      startDate?: string;
      endDate?: string;
      type?: 'RULE' | 'PRORULE' | 'NOTICE';
    } = {}
  ): Promise<FederalRegisterDocument[]> {
    const { perPage = 100, page = 1, startDate, endDate, type } = options;

    const params = new URLSearchParams({
      per_page: perPage.toString(),
      page: page.toString(),
      'order': 'newest',
    });

    // Add agency IDs
    agencyIds.forEach(id => {
      params.append('conditions[agency_ids][]', id.toString());
    });

    if (type) {
      params.append('conditions[type]', type);
    }

    if (startDate) {
      params.append('conditions[publication_date][gte]', startDate);
    }
    if (endDate) {
      params.append('conditions[publication_date][lte]', endDate);
    }

    const url = `${this.baseUrl}/documents.json?${params}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Federal Register API error: ${response.status}`);
      }

      const data: FederalRegisterResponse = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error fetching agency documents:', error);
      throw error;
    }
  }

  /**
   * Get full document details including body text
   */
  async getDocumentDetails(documentNumber: string): Promise<any> {
    const url = `${this.baseUrl}/documents/${documentNumber}.json`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Federal Register API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching document details:', error);
      throw error;
    }
  }

  /**
   * Search documents by term
   */
  async searchDocuments(
    query: string,
    options: {
      perPage?: number;
      page?: number;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<FederalRegisterDocument[]> {
    const { perPage = 100, page = 1, startDate, endDate } = options;

    const params = new URLSearchParams({
      'conditions[term]': query,
      per_page: perPage.toString(),
      page: page.toString(),
      'order': 'newest',
    });

    if (startDate) {
      params.append('conditions[publication_date][gte]', startDate);
    }
    if (endDate) {
      params.append('conditions[publication_date][lte]', endDate);
    }

    const url = `${this.baseUrl}/documents.json?${params}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Federal Register API error: ${response.status}`);
      }

      const data: FederalRegisterResponse = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }
}

// Department agency IDs for tracking cabinet actions
export const DEPARTMENT_AGENCIES = {
  state: [15], // Department of State
  defense: [95], // Department of Defense
  justice: [268], // Department of Justice
  interior: [253], // Department of the Interior
  agriculture: [12], // Department of Agriculture
  commerce: [74], // Department of Commerce
  labor: [284], // Department of Labor
  hhs: [227], // Health and Human Services
  hud: [242], // Housing and Urban Development
  transportation: [492], // Department of Transportation
  energy: [120], // Department of Energy
  education: [114], // Department of Education
  veterans: [519], // Veterans Affairs
  homeland: [237], // Homeland Security
  epa: [145], // EPA
  treasury: [497], // Treasury
};

export default FederalRegisterClient;
