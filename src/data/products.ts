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

export const products: Product[] = [
  {
    id: "ice-block-machine-500",
    name: "Ice Block Machine 500kg",
    category: "Ice Block Machines",
    price: 285000,
    description: "Industrial ice block machine producing 500kg of ice blocks per day. Perfect for commercial use.",
    fullDescription: "The Ice Block Machine 500kg is a high-capacity industrial ice production unit designed for businesses that require a reliable supply of ice blocks. Built with food-grade stainless steel components, this machine ensures hygiene and durability. The automated refrigeration cycle produces perfectly formed ice blocks with minimal operator intervention. Ideal for fish markets, meat processing plants, hotels, and ice distributors across Kenya.",
    image: "https://images.unsplash.com/photo-1625939765503-ee4993769d5b?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1625939765503-ee4993769d5b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&h=600&fit=crop"
    ],
    tags: ["Ice Block Machines Kenya", "Ice Makers Kenya"],
    specifications: [
      { label: "Daily Capacity", value: "500kg" },
      { label: "Power Supply", value: "380V / 3 Phase" },
      { label: "Power Consumption", value: "8.5 kW" },
      { label: "Refrigerant", value: "R404a" },
      { label: "Dimensions", value: "1800 x 1200 x 1500 mm" },
      { label: "Weight", value: "450 kg" },
      { label: "Warranty", value: "1 Year" }
    ],
    features: [
      "Automatic ice release system",
      "Food-grade stainless steel construction",
      "Energy-efficient compressor",
      "Low noise operation",
      "Easy maintenance design",
      "Digital temperature control"
    ]
  },
  {
    id: "popsicle-machine-pro",
    name: "Popsicle Machine Pro",
    category: "Popsicle Machines",
    price: 145000,
    description: "Professional popsicle making machine with 40-mould capacity. Stainless steel construction.",
    fullDescription: "The Popsicle Machine Pro is the ultimate solution for commercial popsicle and ice lolly production. With a 40-mould capacity per batch, you can produce hundreds of popsicles daily. The machine features precise temperature control ensuring consistent freezing and perfect texture every time. The stainless steel moulds are easy to clean and built to last for years of continuous operation.",
    image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop"
    ],
    tags: ["Popsicle Machines Kenya"],
    specifications: [
      { label: "Mould Capacity", value: "40 moulds/batch" },
      { label: "Batches Per Hour", value: "4-6 batches" },
      { label: "Power Supply", value: "220V / Single Phase" },
      { label: "Power Consumption", value: "3.5 kW" },
      { label: "Dimensions", value: "1200 x 800 x 1100 mm" },
      { label: "Warranty", value: "1 Year" }
    ],
    features: [
      "Quick freeze technology",
      "Removable mould system",
      "Digital timer and controls",
      "Auto-defrost function",
      "Multiple mould shapes available"
    ]
  },
  {
    id: "ice-cream-trolley-deluxe",
    name: "Ice Cream Trolley Deluxe",
    category: "Ice Cream Trolleys",
    price: 95000,
    description: "Mobile ice cream trolley with freezer compartment. Ideal for outdoor vending.",
    fullDescription: "Take your ice cream business anywhere with the Ice Cream Trolley Deluxe. This mobile vending solution features a built-in freezer compartment that maintains optimal temperature for hours. The eye-catching design attracts customers while the durable construction handles the demands of daily outdoor use. Perfect for beaches, parks, events, and street vending.",
    image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&h=600&fit=crop"
    ],
    tags: ["Ice Cream Trolleys Kenya"],
    specifications: [
      { label: "Freezer Capacity", value: "150L" },
      { label: "Temperature Range", value: "-18°C to -22°C" },
      { label: "Battery Life", value: "8-10 hours" },
      { label: "Dimensions", value: "1500 x 700 x 1200 mm" },
      { label: "Wheel Size", value: "8 inches (puncture-proof)" },
      { label: "Warranty", value: "6 Months" }
    ],
    features: [
      "Built-in rechargeable battery",
      "LED lighting display",
      "Umbrella holder included",
      "Storage compartments",
      "Easy-push ergonomic handles"
    ]
  },
  {
    id: "ice-cream-moulds-set",
    name: "Ice Cream Moulds Set",
    category: "Ice Cream Moulds",
    price: 12500,
    description: "Premium silicone ice cream moulds in various shapes. Set of 50 pieces.",
    fullDescription: "Create perfect ice cream pops and frozen treats with our Premium Ice Cream Moulds Set. Made from 100% food-grade silicone, these moulds are flexible for easy release, durable for repeated use, and safe for freezer temperatures. The set includes a variety of popular shapes that appeal to both children and adults.",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop"
    ],
    tags: ["Ice Cream Moulds Kenya"],
    specifications: [
      { label: "Quantity", value: "50 pieces" },
      { label: "Material", value: "Food-grade silicone" },
      { label: "Temperature Range", value: "-40°C to +230°C" },
      { label: "Shapes Included", value: "Classic, Star, Heart, Fruit" },
      { label: "Dishwasher Safe", value: "Yes" }
    ],
    features: [
      "BPA-free and non-toxic",
      "Flexible easy-release design",
      "Stackable for storage",
      "Reusable and eco-friendly"
    ]
  },
  {
    id: "ice-cream-sticks-bulk",
    name: "Ice Cream Sticks Bulk",
    category: "Ice Cream Sticks",
    price: 3500,
    description: "Natural wooden ice cream sticks. Pack of 5000 pieces.",
    fullDescription: "Stock up with our bulk pack of premium wooden ice cream sticks. Made from sustainably sourced birch wood, these sticks are smooth, splinter-free, and perfect for popsicles, ice lollies, and craft projects. The natural wood grain provides excellent grip and a classic look that customers love.",
    image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800&h=600&fit=crop"
    ],
    tags: ["Ice Cream Sticks Kenya"],
    specifications: [
      { label: "Quantity", value: "5000 pieces" },
      { label: "Material", value: "Natural birch wood" },
      { label: "Length", value: "114mm" },
      { label: "Width", value: "10mm" },
      { label: "Thickness", value: "2mm" }
    ],
    features: [
      "Smooth rounded edges",
      "Splinter-free finish",
      "Food-safe and natural",
      "Biodegradable"
    ]
  },
  {
    id: "cooler-box-120l",
    name: "Cooler Box 120L",
    category: "Ice Boxes / Cooler Boxes",
    price: 28000,
    description: "Heavy-duty 120L cooler box with superior insulation. Keeps ice for 5+ days.",
    fullDescription: "The 120L Heavy-Duty Cooler Box is built for serious cooling needs. Whether you're transporting fish, storing beverages for events, or keeping products cold during delivery, this cooler delivers exceptional performance. The thick polyurethane insulation maintains temperature for up to 5 days, while the rugged construction handles commercial use.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop"
    ],
    tags: ["Cooler boxes Kenya"],
    specifications: [
      { label: "Capacity", value: "120 Liters" },
      { label: "Insulation", value: "50mm Polyurethane" },
      { label: "Ice Retention", value: "5+ days" },
      { label: "External Dimensions", value: "950 x 500 x 500 mm" },
      { label: "Weight (Empty)", value: "12 kg" },
      { label: "Drain Plug", value: "Yes" }
    ],
    features: [
      "UV-resistant exterior",
      "Lockable lid latches",
      "Non-slip rubber feet",
      "Reinforced handles",
      "Fish ruler on lid"
    ]
  },
  {
    id: "ice-cubes-machine-100kg",
    name: "Ice Cubes Machine 100kg",
    category: "Ice Cubes Machines",
    price: 125000,
    description: "Commercial ice cube maker producing 100kg of crystal-clear cubes daily.",
    fullDescription: "Produce perfectly clear, professional-quality ice cubes with our Commercial Ice Cubes Machine. Designed for bars, restaurants, hotels, and catering businesses, this machine delivers 100kg of ice cubes daily. The advanced filtration and freezing process creates crystal-clear cubes that enhance any beverage presentation.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1625939765503-ee4993769d5b?w=800&h=600&fit=crop"
    ],
    tags: ["Ice Cubes Machines Kenya", "Ice Makers Kenya"],
    specifications: [
      { label: "Daily Capacity", value: "100kg" },
      { label: "Storage Bin", value: "35kg" },
      { label: "Cube Size", value: "22mm x 22mm x 22mm" },
      { label: "Power Supply", value: "220V / Single Phase" },
      { label: "Power Consumption", value: "1.2 kW" },
      { label: "Dimensions", value: "600 x 600 x 800 mm" },
      { label: "Warranty", value: "1 Year" }
    ],
    features: [
      "Crystal-clear ice technology",
      "Built-in storage bin",
      "Auto-clean function",
      "Water overflow protection",
      "Compact countertop design"
    ]
  },
  {
    id: "salad-oil-atm",
    name: "Salad Oil ATM Machine",
    category: "Salad Oil ATM",
    isQuoteOnly: true,
    description: "Automated salad oil dispensing machine. Custom configurations available.",
    fullDescription: "Our Salad Oil ATM Machine revolutionizes cooking oil retail. This automated dispensing system allows customers to purchase exact quantities of cooking oil at competitive prices. The machine features accurate digital measurement, multiple payment options, and a hygienic sealed system that prevents contamination. Custom configurations available to match your business needs.",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=600&fit=crop"
    ],
    tags: [],
    specifications: [
      { label: "Tank Capacity", value: "Custom (50L - 500L)" },
      { label: "Dispensing Accuracy", value: "±0.5%" },
      { label: "Payment Options", value: "Cash, M-Pesa, Card" },
      { label: "Power Supply", value: "220V / Single Phase" },
      { label: "Display", value: "7-inch LCD touchscreen" }
    ],
    features: [
      "Digital flow measurement",
      "Multiple payment integration",
      "Remote monitoring system",
      "Anti-theft construction",
      "Easy tank refilling",
      "Sales reporting dashboard"
    ]
  },
  {
    id: "milk-atm-100l",
    name: "Milk ATM 100L",
    category: "Milk ATM",
    price: 185000,
    description: "Stainless steel milk ATM with 100L capacity. Includes cooling system.",
    fullDescription: "The Milk ATM 100L is the complete solution for fresh milk retail. Built entirely from food-grade stainless steel, this machine keeps milk fresh and at safe temperatures throughout the day. The integrated cooling system maintains 2-4°C, while the digital dispensing ensures accurate portions for every customer. Perfect for dairy shops, supermarkets, and rural milk collection points.",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&h=600&fit=crop"
    ],
    tags: ["Milk ATM's Kenya"],
    specifications: [
      { label: "Tank Capacity", value: "100 Liters" },
      { label: "Cooling Temperature", value: "2-4°C" },
      { label: "Dispensing Speed", value: "1L per 15 seconds" },
      { label: "Power Consumption", value: "0.8 kW" },
      { label: "Material", value: "304 Stainless Steel" },
      { label: "Dimensions", value: "700 x 600 x 1400 mm" },
      { label: "Warranty", value: "1 Year" }
    ],
    features: [
      "Integrated cooling compressor",
      "Digital portion control",
      "M-Pesa payment integration",
      "Easy-clean design",
      "Temperature display",
      "Low milk level alert"
    ]
  },
];

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
