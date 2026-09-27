import type { BuildingPhoto } from '@/lib/types';

/**
 * Put photo files in public/images/buildings, then add them here by building ID.
 * Example:
 * 'xu-gym': {
 *   url: '/images/buildings/xu-gym.jpg',
 *   caption: 'Entrance to the Xavier University Gym',
 * },
 */
export const BUILDING_PHOTOS: Partial<Record<string, BuildingPhoto>> = {};
