export interface SeedProduct {
  name: string;
  description: string;
  image: string;
  category: "T-Shirt" | "Pants";
  price: number;
  availableSizes: ("S" | "M" | "L" | "XL" | "XXL")[];
  stockQuantity: number;
  tags: string[];
}

export const seedProducts: SeedProduct[] = [
  // ─── T-SHIRTS (15) ────────────────────────────────────────────────────────

  {
    name: "Classic White Essential Tee",
    description:
      "A timeless crew-neck tee in 100% organic cotton. The foundation of every wardrobe.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format",
    category: "T-Shirt",
    price: 24.99,
    availableSizes: ["S", "M", "L", "XL"],
    stockQuantity: 120,
    tags: ["casual", "everyday", "basics", "cotton", "white"],
  },
  {
    name: "Midnight Black Crew Tee",
    description:
      "Clean, minimal black tee with a slightly relaxed fit. Goes with everything.",
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&auto=format",
    category: "T-Shirt",
    price: 24.99,
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    stockQuantity: 100,
    tags: ["casual", "everyday", "basics", "black"],
  },
  {
    name: "Nike Dri-FIT Running Tee",
    description:
      "Moisture-wicking performance tee designed for high-intensity runs. Lightweight and breathable.",
    image:
      "https://images.unsplash.com/photo-1542513217-0b0eedf7005d?w=600&auto=format",
    category: "T-Shirt",
    price: 39.99,
    availableSizes: ["S", "M", "L"],
    stockQuantity: 60,
    tags: ["running", "sports", "fitness", "gym", "performance", "nike"],
  },
  {
    name: "Oversized Streetwear Graphic Tee",
    description:
      "Bold abstract print on a relaxed oversized silhouette. Drop-shoulder cut.",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format",
    category: "T-Shirt",
    price: 34.99,
    availableSizes: ["M", "L", "XL", "XXL"],
    stockQuantity: 45,
    tags: ["streetwear", "graphic", "oversized", "casual", "urban"],
  },
  {
    name: "Linen Blend Summer Tee",
    description: "Light and airy linen-cotton blend. Perfect for warm weather.",
    image:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format",
    category: "T-Shirt",
    price: 32.99,
    availableSizes: ["S", "M", "L", "XL"],
    stockQuantity: 75,
    tags: ["summer", "linen", "casual", "lightweight", "beach"],
  },
  {
    name: "Vintage Washed Pocket Tee",
    description:
      "Pre-washed for a soft vintage feel. Left chest pocket adds a classic touch.",
    image:
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&auto=format",
    category: "T-Shirt",
    price: 29.99,
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    stockQuantity: 90,
    tags: ["vintage", "casual", "everyday", "retro"],
  },
  {
    name: "Slim Fit V-Neck Tee",
    description:
      "A sleek v-neck with a tailored slim cut. Smart-casual essential.",
    image:
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&auto=format",
    category: "T-Shirt",
    price: 27.99,
    availableSizes: ["S", "M", "L"],
    stockQuantity: 55,
    tags: ["slim-fit", "casual", "smart-casual", "vneck"],
  },
  {
    name: "Gym Performance Tank",
    description:
      "Cut-off muscle tank with moisture management. Built for the weight room.",
    image:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format",
    category: "T-Shirt",
    price: 22.99,
    availableSizes: ["S", "M", "L", "XL"],
    stockQuantity: 80,
    tags: ["gym", "fitness", "sports", "workout", "muscle"],
  },
  {
    name: "Striped Breton Tee",
    description:
      "Classic French navy stripes on a fitted crew neck. Timeless nautical style.",
    image:
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&auto=format",
    category: "T-Shirt",
    price: 31.99,
    availableSizes: ["S", "M", "L", "XL"],
    stockQuantity: 65,
    tags: ["casual", "nautical", "striped", "summer", "classic"],
  },
  {
    name: "Heavyweight Cotton Tee",
    description:
      "230gsm premium cotton. Substantial feel with a boxy, structured silhouette.",
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format",
    category: "T-Shirt",
    price: 36.99,
    availableSizes: ["M", "L", "XL", "XXL"],
    stockQuantity: 50,
    tags: ["heavyweight", "premium", "basics", "boxy", "cotton"],
  },
  {
    name: "Outdoor Trail Tee",
    description:
      "Quick-dry UPF 30 fabric with a relaxed fit. Ready for the trail or the campsite.",
    image:
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&auto=format",
    category: "T-Shirt",
    price: 38.99,
    availableSizes: ["S", "M", "L", "XL"],
    stockQuantity: 40,
    tags: ["outdoor", "hiking", "trail", "sports", "summer"],
  },
  {
    name: "Band Graphic Tee",
    description: "Retro-inspired faded graphic print. Soft tri-blend fabric.",
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format",
    category: "T-Shirt",
    price: 29.99,
    availableSizes: ["S", "M", "L"],
    stockQuantity: 35,
    tags: ["graphic", "retro", "streetwear", "vintage", "casual"],
  },
  {
    name: "Recycled Eco Tee",
    description:
      "Made from 100% recycled materials. Sustainably produced, minimal footprint.",
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format",
    category: "T-Shirt",
    price: 34.99,
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    stockQuantity: 70,
    tags: ["eco", "sustainable", "casual", "basics"],
  },
  {
    name: "Long Sleeve Essential Tee",
    description:
      "Lightweight long sleeve in breathable cotton. Ideal for layering.",
    image:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format",
    category: "T-Shirt",
    price: 28.99,
    availableSizes: ["S", "M", "L", "XL"],
    stockQuantity: 85,
    tags: ["casual", "everyday", "long-sleeve", "basics", "layering"],
  },
  {
    name: "Polo Shirt Classic",
    description:
      "Pique cotton polo with a two-button placket. Smart casual go-to.",
    image:
      "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&auto=format",
    category: "T-Shirt",
    price: 42.99,
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    stockQuantity: 60,
    tags: ["polo", "smart-casual", "formal", "classic", "cotton"],
  },

  // ─── PANTS (15) ───────────────────────────────────────────────────────────

  {
    name: "Classic Slim Chino",
    description:
      "Versatile slim-fit chino in stretch cotton. Works from office to weekend.",
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format",
    category: "Pants",
    price: 59.99,
    availableSizes: ["S", "M", "L", "XL"],
    stockQuantity: 80,
    tags: ["chino", "slim-fit", "casual", "smart-casual", "formal", "cotton"],
  },
  {
    name: "Pro Flex Running Joggers",
    description:
      "Four-way stretch joggers with zippered pockets. Built for the track.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format",
    category: "Pants",
    price: 64.99,
    availableSizes: ["S", "M", "L"],
    stockQuantity: 50,
    tags: ["running", "sports", "gym", "fitness", "jogger", "stretch"],
  },
  {
    name: "Relaxed Cargo Pants",
    description:
      "Modern cargo with six pockets and a relaxed fit. Functional streetwear.",
    image:
      "https://images.unsplash.com/photo-1517423738875-5ce310acd3da?w=600&auto=format",
    category: "Pants",
    price: 69.99,
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    stockQuantity: 55,
    tags: ["cargo", "casual", "streetwear", "relaxed", "urban"],
  },
  {
    name: "Slim Fit Dress Pants",
    description:
      "Tailored slim-fit trousers in a wrinkle-resistant fabric. Professional and polished.",
    image:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format",
    category: "Pants",
    price: 79.99,
    availableSizes: ["S", "M", "L", "XL"],
    stockQuantity: 45,
    tags: ["formal", "slim-fit", "office", "smart-casual", "dress"],
  },
  {
    name: "Linen Wide-Leg Pants",
    description:
      "Breezy wide-leg cut in pure linen. Effortlessly relaxed summer style.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format",
    category: "Pants",
    price: 67.99,
    availableSizes: ["S", "M", "L", "XL"],
    stockQuantity: 40,
    tags: ["linen", "summer", "casual", "relaxed", "wide-leg", "beach"],
  },
  {
    name: "Tech Fleece Sweatpants",
    description:
      "Lightweight tech fleece for warmth without bulk. Tapered jogger silhouette.",
    image:
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format",
    category: "Pants",
    price: 72.99,
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    stockQuantity: 65,
    tags: ["gym", "fitness", "casual", "jogger", "fleece", "everyday"],
  },
  {
    name: "Classic Denim Jeans",
    description:
      "Mid-rise straight cut denim in a classic indigo wash. Timeless staple.",
    image:
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format",
    category: "Pants",
    price: 74.99,
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    stockQuantity: 90,
    tags: ["denim", "casual", "everyday", "classic", "jeans"],
  },
  {
    name: "Compression Gym Tights",
    description:
      "4-way stretch compression tights with moisture wicking. Engineered for performance.",
    image:
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format",
    category: "Pants",
    price: 54.99,
    availableSizes: ["S", "M", "L"],
    stockQuantity: 45,
    tags: ["gym", "fitness", "compression", "running", "sports", "performance"],
  },
  {
    name: "Outdoor Hiking Pants",
    description:
      "Water-resistant ripstop fabric with articulated knees. Made for the mountain.",
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format",
    category: "Pants",
    price: 84.99,
    availableSizes: ["S", "M", "L", "XL"],
    stockQuantity: 35,
    tags: ["outdoor", "hiking", "trail", "sports", "water-resistant"],
  },
  {
    name: "Relaxed Fit Corduroy",
    description:
      "Warm mid-weight corduroy with a relaxed, straight cut. Autumn essential.",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format",
    category: "Pants",
    price: 69.99,
    availableSizes: ["S", "M", "L", "XL"],
    stockQuantity: 30,
    tags: ["casual", "relaxed", "autumn", "corduroy", "everyday"],
  },
  {
    name: "Tapered Jogger Pants",
    description:
      "Slim tapered leg with elastic waist and cuffs. Athleisure done right.",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format",
    category: "Pants",
    price: 57.99,
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    stockQuantity: 70,
    tags: ["jogger", "casual", "gym", "athleisure", "everyday"],
  },
  {
    name: "Pleated Wide-Leg Trousers",
    description:
      "Elegant pleated trousers with a high waist and wide leg. Modern formal.",
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format",
    category: "Pants",
    price: 89.99,
    availableSizes: ["S", "M", "L"],
    stockQuantity: 25,
    tags: ["formal", "wide-leg", "smart-casual", "office", "pleated"],
  },
  {
    name: "Quick-Dry Swim Shorts",
    description:
      "Fast-drying boardshorts for beach and pool. Mesh liner and stretch waistband.",
    image:
      "https://images.unsplash.com/photo-1534126511673-b6899657816a?w=600&auto=format",
    category: "Pants",
    price: 44.99,
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    stockQuantity: 80,
    tags: ["beach", "summer", "swim", "sports", "outdoor", "casual"],
  },
  {
    name: "Slim Stretch Chino",
    description:
      "2% elastane gives this slim chino a comfortable stretch with a clean look.",
    image:
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&auto=format",
    category: "Pants",
    price: 62.99,
    availableSizes: ["S", "M", "L", "XL"],
    stockQuantity: 65,
    tags: ["chino", "slim-fit", "stretch", "smart-casual", "casual"],
  },
  {
    name: "Track Pants Classic",
    description:
      "Classic side-stripe track pants in tricot fabric. Vintage athletic look.",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format",
    category: "Pants",
    price: 52.99,
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    stockQuantity: 55,
    tags: ["sports", "gym", "casual", "track", "vintage", "athleisure"],
  },
];
