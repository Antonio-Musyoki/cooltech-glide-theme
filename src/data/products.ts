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
    name: "Cold Room Solutions",
    description: "Complete cold room assembly, repair, and maintenance services for commercial and industrial applications.",
    icon: "Snowflake",
    features: [
      "Custom cold room design & installation",
      "Regular maintenance contracts",
      "24/7 emergency repairs",
      "Temperature monitoring systems",
    ],
  },
  {
    id: "refrigeration",
    name: "Refrigeration Services",
    description: "Expert refrigeration unit maintenance and repairs for all commercial refrigeration equipment.",
    icon: "Thermometer",
    features: [
      "Commercial freezer repairs",
      "Walk-in cooler maintenance",
      "Display case servicing",
      "Compressor replacements",
    ],
  },
  {
    id: "hvac",
    name: "HVAC Systems",
    description: "Residential and commercial HVAC system installation, maintenance, and optimization.",
    icon: "Wind",
    features: [
      "Central AC installation",
      "Ductwork design & install",
      "Energy efficiency audits",
      "Ventilation solutions",
    ],
  },
  {
    id: "ac",
    name: "Air Conditioning",
    description: "Professional AC assembly, maintenance, and repair for homes and businesses.",
    icon: "Fan",
    features: [
      "Split AC installation",
      "Regular AC servicing",
      "Gas refilling",
      "Thermostat upgrades",
    ],
  },
];

export const categories = [
  "Ice Block Machines",
  "Popsicle Machines",
  "Ice Cream Trolleys",
  "Ice Cream Moulds",
  "Ice Cream Sticks",
  "Ice Boxes / Cooler Boxes",
  "Ice Cubes Machines",
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
