export interface Product {
  id: string;
  name: string;
  category: string;
  price?: number;
  description: string;
  image: string;
  isQuoteOnly?: boolean;
  tags: string[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
}

export const products: Product[] = [
  {
    id: "ice-block-machine-500",
    name: "Ice Block Machine 500kg",
    category: "Ice Block Machines",
    price: 285000,
    description: "Industrial ice block machine producing 500kg of ice blocks per day. Perfect for commercial use.",
    image: "https://images.unsplash.com/photo-1625939765503-ee4993769d5b?w=400&h=300&fit=crop",
    tags: ["Ice Block Machines Kenya", "Ice Makers Kenya"],
  },
  {
    id: "popsicle-machine-pro",
    name: "Popsicle Machine Pro",
    category: "Popsicle Machines",
    price: 145000,
    description: "Professional popsicle making machine with 40-mould capacity. Stainless steel construction.",
    image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop",
    tags: ["Popsicle Machines Kenya"],
  },
  {
    id: "ice-cream-trolley-deluxe",
    name: "Ice Cream Trolley Deluxe",
    category: "Ice Cream Trolleys",
    price: 95000,
    description: "Mobile ice cream trolley with freezer compartment. Ideal for outdoor vending.",
    image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop",
    tags: ["Ice Cream Trolleys Kenya"],
  },
  {
    id: "ice-cream-moulds-set",
    name: "Ice Cream Moulds Set",
    category: "Ice Cream Moulds",
    price: 12500,
    description: "Premium silicone ice cream moulds in various shapes. Set of 50 pieces.",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
    tags: ["Ice Cream Moulds Kenya"],
  },
  {
    id: "ice-cream-sticks-bulk",
    name: "Ice Cream Sticks Bulk",
    category: "Ice Cream Sticks",
    price: 3500,
    description: "Natural wooden ice cream sticks. Pack of 5000 pieces.",
    image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&h=300&fit=crop",
    tags: ["Ice Cream Sticks Kenya"],
  },
  {
    id: "cooler-box-120l",
    name: "Cooler Box 120L",
    category: "Ice Boxes / Cooler Boxes",
    price: 28000,
    description: "Heavy-duty 120L cooler box with superior insulation. Keeps ice for 5+ days.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
    tags: ["Cooler boxes Kenya"],
  },
  {
    id: "ice-cubes-machine-100kg",
    name: "Ice Cubes Machine 100kg",
    category: "Ice Cubes Machines",
    price: 125000,
    description: "Commercial ice cube maker producing 100kg of crystal-clear cubes daily.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    tags: ["Ice Cubes Machines Kenya", "Ice Makers Kenya"],
  },
  {
    id: "salad-oil-atm",
    name: "Salad Oil ATM Machine",
    category: "Salad Oil ATM",
    isQuoteOnly: true,
    description: "Automated salad oil dispensing machine. Custom configurations available.",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop",
    tags: [],
  },
  {
    id: "milk-atm-100l",
    name: "Milk ATM 100L",
    category: "Milk ATM",
    price: 185000,
    description: "Stainless steel milk ATM with 100L capacity. Includes cooling system.",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop",
    tags: ["Milk ATM's Kenya"],
  },
];

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
