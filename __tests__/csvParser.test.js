import { parseCSV, parseProductsFromCSV } from "../lib/csvParser";

describe("parseCSV utility", () => {
  it("should parse standard comma-separated lines", () => {
    const csv = "id,name,price\np1,Jewel A,100\np2,Jewel B,200";
    const result = parseCSV(csv);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: "p1", name: "Jewel A", price: "100" });
    expect(result[1]).toEqual({ id: "p2", name: "Jewel B", price: "200" });
  });

  it("should handle quoted fields containing commas", () => {
    const csv = 'id,name,desc\np1,"Gold Chain, 22K","Gorgeous, shiny necklace"';
    const result = parseCSV(csv);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "p1",
      name: "Gold Chain, 22K",
      desc: "Gorgeous, shiny necklace"
    });
  });

  it("should handle escaped double quotes within quoted fields", () => {
    const csv = 'id,name,desc\np1,"Necklace ""Classic"" Collection",Beautiful';
    const result = parseCSV(csv);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Necklace "Classic" Collection');
  });

  it("should skip empty lines", () => {
    const csv = "id,name\np1,Jewel A\n\n\np2,Jewel B\n";
    const result = parseCSV(csv);
    expect(result).toHaveLength(2);
  });
});

describe("parseProductsFromCSV mapper", () => {
  it("should map headers correctly and clean price numbers", () => {
    const csv = `id,name,category,price,oldPrice,img,desc
p1,AD Necklace,Necklace,Rs. 599.00,899,https://image.com/1.jpg,Detailed description`;
    const result = parseProductsFromCSV(csv);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "p1",
      name: "AD Necklace",
      category: "Necklace",
      price: 599,
      oldPrice: 899,
      img: "https://image.com/1.jpg",
      desc: "Detailed description"
    });
  });

  it("should map typical spreadsheet column variations (mrp, rate, imageurl, title)", () => {
    const csv = `p_id,title,category,rate,mrp,imageUrl,description
p2,Bangle Set,Bangles,899.00,1299.00,https://image.com/2.jpg,Bangle description`;
    const result = parseProductsFromCSV(csv);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "p2",
      name: "Bangle Set",
      category: "Bangles",
      price: 899,
      oldPrice: 1299,
      img: "https://image.com/2.jpg",
      desc: "Bangle description"
    });
  });

  it("should fall back to default values for missing data", () => {
    const csv = "name\nOnly Name";
    const result = parseProductsFromCSV(csv);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "p1",
      name: "Only Name",
      category: "Necklace",
      price: 0,
      oldPrice: 0,
      img: "",
      desc: ""
    });
  });
});
