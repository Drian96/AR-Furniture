/**
 * Utility functions for working with 3D model files
 */

/**
 * Check if a URL points to a 3D model file (GLB or GLTF)
 * @param url - The URL to check
 * @returns true if the URL appears to be a 3D model file
 */
export const is3DModel = (url: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith('.glb') || lowerUrl.endsWith('.gltf');
};

/**
 * Check if a file is a 3D model based on its name
 * @param fileName - The file name to check
 * @returns true if the file appears to be a 3D model
 */
export const is3DModelFile = (fileName: string): boolean => {
  if (!fileName) return false;
  const lowerName = fileName.toLowerCase();
  return lowerName.endsWith('.glb') || lowerName.endsWith('.gltf');
};
