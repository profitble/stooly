let tempImage: string | null = null;

export const setPhotoImage = (base64: string): void => {
  tempImage = base64;
};

export const getPhotoImage = (): string | null => {
  const image = tempImage;
  tempImage = null;
  return image;
};