const fs = require('fs');
const path = require('path');

function parseCSV(csvString) {
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

function parseProductsFromCSV(csvText) {
  const rawRows = parseCSV(csvText);
  
  return rawRows.map((row, idx) => {
    const id = row.id || row.p_id || row.productid || `p${idx + 1}`;
    const name = row.name || row.title || row.productname || 'Unnamed Jewel';
    const category = row.category || row.type || 'Necklace';
    const desc = row.desc || row.description || row.details || '';
    
    // Support 'images' or other image fields
    const imgField = row.images || row.img || row.image || row.imageurl || row.photo || '';
    // Handle multiple images separated by '|'
    const img = imgField.includes('|') ? imgField.split('|')[0] : imgField;
    
    const parsePriceVal = (val) => {
      if (val === undefined || val === null || val === '') return 0;
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
      oldPrice: oldPrice || price,
      img,
      desc
    };
  });
}

const csvPath = path.join(__dirname, '../data_sheet.csv');
const jsonPath = path.join(__dirname, '../data/products.json');

try {
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const products = parseProductsFromCSV(csvText);
  fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), 'utf8');
  console.log(`Successfully generated data/products.json with ${products.length} products!`);
} catch (err) {
  console.error('Failed to generate products JSON:', err);
  process.exit(1);
}
