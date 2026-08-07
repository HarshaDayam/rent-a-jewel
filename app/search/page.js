import { parseProductsFromCSV } from "../../lib/csvParser";
import { mockProducts } from "../../data/mockProducts";
import SearchView from "../../components/SearchView";

// Next.js config to ensure dynamically fetched data is server-rendered but cached with revalidation
export const revalidate = 3600; // Revalidate cache every hour

async function getProducts() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    console.log("No GOOGLE_SHEET_ID set in environment. Using fallback mock products on search page.");
    return mockProducts;
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch sheet data on search page, HTTP status: ${res.status}`);
    }
    
    const csvText = await res.text();
    const parsedProducts = parseProductsFromCSV(csvText);
    
    if (parsedProducts && parsedProducts.length > 0) {
      return parsedProducts;
    }
    
    return mockProducts;
  } catch (err) {
    console.error("Error fetching Google Sheet catalog for search page, falling back to mock database:", err);
    return mockProducts;
  }
}

export default async function SearchPage() {
  const products = await getProducts();
  return <SearchView products={products} />;
}
