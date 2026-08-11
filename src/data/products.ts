export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price?: number;
  description: string;
  fullDescription?: string;
  image: string;
  images?: string[];
  isQuoteOnly?: boolean;
  tags: string[];
  specifications?: ProductSpecification[];
  features?: string[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
}

export const products: Product[] = [];

export const getRelatedProducts = (product: Product, limit: number = 4): Product[] => {
  return products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, limit)
    .concat(
      products
        .filter(p => p.id !== product.id && p.category !== product.category)
        .slice(0, limit)
    )
    .slice(0, limit);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const services: Service[] = [
  {
    id: "cold-room",
    name: "Cold Room Repair & Installation",
    description: "Complete cold room design, installation, repair and maintenance for commercial and industrial use.",
    icon: "Snowflake",
    features: [
      "Custom cold room design & installation",
      "Panel, door & floor repairs",
      "Regular maintenance contracts",
      "Temperature monitoring systems",
    ],
  },
  {
    id: "fridge-repair",
    name: "Fridge & Freezer Repair",
    description: "Repair and servicing of fridges, deep freezers and display freezers for homes and businesses.",
    icon: "Thermometer",
    features: [
      "Domestic & commercial fridge repair",
      "Deep freezer servicing",
      "Display freezer maintenance",
      "Compressor & gas replacement",
    ],
  },
  {
    id: "ac",
    name: "Air Conditioner Repair & Installation",
    description: "Professional air conditioner supply, installation, servicing and repair.",
    icon: "Fan",
    features: [
      "Split & central AC installation",
      "Routine AC servicing",
      "Gas refilling",
      "Fault diagnosis & repair",
    ],
  },
  {
    id: "appliance-repair",
    name: "Washing Machine & Microwave Repair",
    description: "Fast, reliable repair of washing machines, microwaves and other household appliances.",
    icon: "Wind",
    features: [
      "Washing machine repair",
      "Microwave repair",
      "Spare parts replacement",
      "On-site diagnosis",
    ],
  },
];

export const categories = [
  "Ice Cream Machines",
  "Popsicle Machines",
  "Ice Cream Trolleys",
  "Ice Cream Moulds",
  "Ice Cream Sticks",
  "Ice Boxes / Cooler Boxes",
  "Deep Freezers",
  "Display Freezers",
  "Salad Oil ATM",
  "Milk ATM",
];


export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Products without a price (0 / null) are quote-only
export const isQuoteOnly = (price?: number | null): boolean => !price || price <= 0;

export const formatPriceOrQuote = (price?: number | null): string =>
  isQuoteOnly(price) ? "Price on request" : formatPrice(price as number);
