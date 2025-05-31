/* eslint-disable @typescript-eslint/no-explicit-any */

export function classifyResults(results: any[]): {
    expand: any[];
    discard: any[];
  } {
    return {
      expand: results.filter(r => r.snippet.includes('AI')), 
      discard: results.filter(r => !r.snippet.includes('AI')),
    };
  }
  