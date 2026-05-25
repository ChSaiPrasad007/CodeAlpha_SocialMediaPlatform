export const fileToDataUrl = (file, maxSizeMb = 2) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select an image file.'));
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      reject(new Error(`Image must be smaller than ${maxSizeMb}MB.`));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });
