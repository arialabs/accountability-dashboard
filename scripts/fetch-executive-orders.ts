#!/usr/bin/env tsx
/**
 * Fetch executive orders from Federal Register API
 * Usage: tsx scripts/fetch-executive-orders.ts
 */

import FederalRegisterClient from '../pipeline/sources/federal-register';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface ExecutiveOrderData {
  id: number;
  order_number?: number;
  title: string;
  summary: string;
  signed_date: string;
  president: string;
  federal_register_number: string;
  federal_register_url: string;
  category?: string;
  significance?: string;
  controversial?: boolean;
}

async function main() {
  const client = new FederalRegisterClient();
  
  console.log('🔍 Fetching executive orders from Federal Register...\n');
  
  try {
    // Fetch orders from Trump's second term (starting January 20, 2025)
    const orders = await client.getExecutiveOrders('donald-trump', {
      perPage: 100,
      startDate: '2025-01-20',
    });
    
    console.log(`✅ Found ${orders.length} executive orders\n`);
    
    // Transform data
    const executiveOrders: ExecutiveOrderData[] = orders.map((order, index) => ({
      id: index + 1,
      order_number: order.executive_order_number,
      title: order.title,
      summary: order.abstract || 'No summary available',
      signed_date: order.signing_date || order.publication_date,
      president: 'Donald Trump',
      federal_register_number: order.document_number,
      federal_register_url: order.html_url,
      category: categorizeOrder(order.title, order.abstract),
      significance: determineSignificance(order),
      controversial: false, // Manual review needed
    }));
    
    // Display summary
    console.log('📋 Executive Orders Summary:');
    console.log('─'.repeat(80));
    executiveOrders.forEach(order => {
      console.log(`\n[${order.order_number || 'N/A'}] ${order.title}`);
      console.log(`   Date: ${order.signed_date}`);
      console.log(`   Category: ${order.category}`);
      console.log(`   URL: ${order.federal_register_url}`);
    });
    console.log('\n' + '─'.repeat(80));
    
    // Save to JSON file
    const outputPath = join(process.cwd(), 'src/data/executive-orders.json');
    const output = {
      generated_at: new Date().toISOString(),
      president: 'Donald Trump',
      term: '2025-2029',
      total: executiveOrders.length,
      orders: executiveOrders,
    };
    
    writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\n💾 Saved ${executiveOrders.length} orders to ${outputPath}`);
    
    // Category breakdown
    const categoryCount = executiveOrders.reduce((acc: any, order) => {
      acc[order.category || 'Other'] = (acc[order.category || 'Other'] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 By Category:');
    Object.entries(categoryCount)
      .sort((a: any, b: any) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count}`);
      });
    
  } catch (error) {
    console.error('❌ Error fetching executive orders:', error);
    process.exit(1);
  }
}

/**
 * Categorize order based on title and abstract
 */
function categorizeOrder(title: string, abstract?: string): string {
  const text = `${title} ${abstract || ''}`.toLowerCase();
  
  if (text.includes('immigration') || text.includes('border') || text.includes('deportation')) {
    return 'Immigration';
  }
  if (text.includes('energy') || text.includes('oil') || text.includes('gas') || text.includes('drilling')) {
    return 'Energy';
  }
  if (text.includes('environment') || text.includes('climate') || text.includes('epa')) {
    return 'Environment';
  }
  if (text.includes('trade') || text.includes('tariff') || text.includes('import')) {
    return 'Trade';
  }
  if (text.includes('health') || text.includes('medicare') || text.includes('fda')) {
    return 'Health';
  }
  if (text.includes('education') || text.includes('school')) {
    return 'Education';
  }
  if (text.includes('defense') || text.includes('military') || text.includes('national security')) {
    return 'Defense';
  }
  if (text.includes('justice') || text.includes('law enforcement') || text.includes('pardon')) {
    return 'Justice';
  }
  if (text.includes('federal') || text.includes('government') || text.includes('bureaucracy')) {
    return 'Government Reform';
  }
  if (text.includes('economy') || text.includes('tax') || text.includes('fiscal')) {
    return 'Economy';
  }
  
  return 'Other';
}

/**
 * Determine significance based on various factors
 */
function determineSignificance(order: any): string {
  // Major if it has high page count or affects multiple agencies
  if (order.agencies && order.agencies.length > 3) {
    return 'major';
  }
  
  const pageCount = order.end_page && order.start_page 
    ? order.end_page - order.start_page 
    : 0;
  
  if (pageCount > 10) return 'major';
  if (pageCount > 5) return 'moderate';
  
  return 'minor';
}

// Run if executed directly
if (require.main === module) {
  main();
}
