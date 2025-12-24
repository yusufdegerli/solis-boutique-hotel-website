import { 
  Wifi, 
  Wind, 
  Tv, 
  Coffee, 
  Utensils, 
  Smartphone, 
  Waves, 
  Wine, 
  Sun 
} from 'lucide-react';

export const AMENITY_OPTIONS = [
  { key: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { key: 'balcony', label: 'Private Balcony', icon: Sun }, // Using Sun as proxy for outdoor/view or Wind
  { key: 'sauna', label: 'Sauna', icon: Waves },
  { key: 'breakfast', label: 'Breakfast', icon: Utensils },
  { key: 'hair_dryer', label: 'Hair Dryer', icon: Wind },
  { key: 'coffee_maker', label: 'Coffee Maker', icon: Coffee },
  { key: 'tv', label: 'Widescreen TV', icon: Tv },
  { key: 'ac', label: 'Air Conditioner', icon: Wind }, // Reusing Wind or maybe Thermometer
  { key: 'minibar', label: 'Mini Bar', icon: Wine },
  { key: 'smartphone', label: 'Free Smartphone', icon: Smartphone },
];

export const getAmenityIcon = (key: string) => {
  const option = AMENITY_OPTIONS.find(opt => opt.key === key);
  return option ? option.icon : Wifi; // Default fallback
};

export const getAmenityLabel = (key: string) => {
    const option = AMENITY_OPTIONS.find(opt => opt.key === key);
    return option ? option.label : key;
}
