import type { Product } from '@/types/product';

export const mockProducts: Product[] = [
  {
    acidity: 2,
    body: 3,
    category: 'Blend',
    description:
      'A Blue Mountain Blend inspired coffee with speciality beans from Brazil and El Salvador, roasted for smooth natural sweetness.',
    name: 'Golden Lagoon',
    origin: ['Brazil', 'El Salvador'],
    recommended_for: ['Espresso', 'Flat white', 'Filter'],
    roast_level: 2.5,
    sku: '100001',
    sweetness: 4,
    tasting_notes: ['Plum', 'Chocolate', 'Caramel'],
    weight_g: 250,
  },
  {
    acidity: 3,
    body: 4,
    category: 'Single origin',
    description:
      'A chocolatey Guatemalan coffee with a full body, gentle sweetness, and a blackberry aroma.',
    name: 'Bush man',
    origin: ['Guatemala'],
    recommended_for: ['Espresso', 'Cafetière'],
    roast_level: 2.5,
    sku: '100010',
    sweetness: 3,
    tasting_notes: ['Chocolate', 'Blackberry', 'Brown sugar'],
    weight_g: 250,
  },
  {
    acidity: 2,
    body: 4,
    category: 'Single origin',
    description:
      'A washed Costa Rican coffee from Tarrazu with a creamy body and notes of plums and chocolate.',
    name: 'Hot Valley Sauce',
    origin: ['Costa Rica'],
    recommended_for: ['Espresso', 'Filter'],
    roast_level: 3.5,
    sku: '100006',
    sweetness: 3,
    tasting_notes: ['Plum', 'Dark chocolate', 'Cream'],
    weight_g: 250,
  },
];
