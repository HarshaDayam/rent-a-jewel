/**
 * Parses a CSV string into an array of arrays representing rows.
 * Correctly handles quotes, escaped quotes (""), commas, and newlines within fields.
 */
export function parseCSV(csvString) {
  const result = [];
  let row = [];
  let currentVal = '';
  let insideQuotes = false;
  
  for (let i = 0; i < csvString.length; i++) {
    const char = csvString[i];
    const nextChar = csvString[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // Skip the second quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++; // Skip \n after \r
      row.push(currentVal.trim());
      if (row.length > 0 && row.some(cell => cell !== '')) {
        result.push(row);
      }
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  
  // Handle any remaining fields
  if (currentVal || row.length > 0) {
    row.push(currentVal.trim());
    if (row.some(cell => cell !== '')) {
      result.push(row);
    }
  }
  
  if (result.length === 0) return [];
  
  const headers = result[0].map(h => h.trim().toLowerCase());
  return result.slice(1).map(r => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = r[index] || '';
    });
    return obj;
  });
}

/**
 * Maps the parsed CSV rows into standardized product objects.
 * Handles variations in spreadsheet headers and cleans pricing values.
 */
export function parseProductsFromCSV(csvText) {
  const rawRows = parseCSV(csvText);
  
  return rawRows.map((row, idx) => {
    // Look up ID or generate one
    const id = row.id || row.p_id || row.productid || `p${idx + 1}`;
    
    // Look up product fields with common spreadsheet header aliases
    const name = row.name || row.title || row.productname || 'Unnamed Jewel';
    const category = row.category || row.type || 'Necklace';
    const desc = row.desc || row.description || row.details || '';
    const img = row.img || row.image || row.imageurl || row.photo || '';
    
    // Helper to clean price strings and parse to number
    const parsePriceVal = (val) => {
      if (val === undefined || val === null || val === '') return 0;
      // Strip leading non-digit characters first, then strip anything except digits and decimal dot
      const cleaned = val.toString().replace(/^[^\d]*/, '').replace(/[^0-9.]/g, '');
      return parseFloat(cleaned) || 0;
    };
    
    const price = parsePriceVal(row.price || row.rate || row.sellingprice || 0);
    const oldPrice = parsePriceVal(row.oldprice || row.mrp || row.originalprice || row.listprice || price);
    
    return {
      id,
      name,
      category,
      price,
      oldPrice: oldPrice || price, // Fallback to current price if old price not provided
      img,
      desc
    };
  });
}
