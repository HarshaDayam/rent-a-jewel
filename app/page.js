import { parseProductsFromCSV } from "../lib/csvParser";
import { mockProducts } from "../data/mockProducts";
import CatalogView from "../components/CatalogView";

// Next.js config to ensure dynamically fetched data is server-rendered but cached with revalidation
export const revalidate = 3600; // Revalidate cache every hour

async function getProducts() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    console.log("No GOOGLE_SHEET_ID set in environment. Using fallback mock products.");
    return mockProducts;
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch sheet data, HTTP status: ${res.status}`);
    }
    
    const csvText = await res.text();
    const parsedProducts = parseProductsFromCSV(csvText);
    
    if (parsedProducts && parsedProducts.length > 0) {
      console.log(`Successfully fetched and parsed ${parsedProducts.length} products from Google Sheets!`);
      return parsedProducts;
    }
    
    console.log("Empty or invalid parse results from sheet. Falling back to mock data.");
    return mockProducts;
  } catch (err) {
    console.error("Error fetching Google Sheet catalog, falling back to mock database:", err);
    return mockProducts;
  }
}

export default async function Home() {
  const products = await getProducts();
  return <CatalogView products={products} />;
}
