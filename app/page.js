import products from "../data/products.json";
import CatalogView from "../components/CatalogView";

export default function Home() {
  return <CatalogView products={products} />;
}

