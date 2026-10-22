export const MAX_IMAGE_BYTES = 96 * 1024;
export const TARGET_IMAGE_BYTES = 60 * 1024;
export async function compressPhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('JPEG, PNG, WebP 사진을 선택해 주세요.');
  if (file.size > 20 * 1024 * 1024) throw new Error('원본이 20MB보다 커요. 더 작은 사진을 선택해 주세요.');
  const bitmap = await createImageBitmap(file);
  try {
    let edge = Math.min(1024, Math.max(bitmap.width, bitmap.height));
    let best;
    while (edge >= 256) {
      const ratio = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
      canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.7, 0.55, 0.4]) {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality));
        if (!blob) throw new Error('사진을 압축하지 못했어요. 다른 사진으로 시도해 주세요.');
        // WebP 미지원 브라우저는 PNG를 반환하므로 JPEG로 다시 인코딩합니다.
        const output = blob.type === 'image/webp' ? blob : await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
        if (!output) throw new Error('이 브라우저에서 사진을 저장할 수 없어요.');
        const result = { blob: output, width: canvas.width, height: canvas.height };
        if (!best || output.size < best.blob.size) best = result;
        if (output.size <= TARGET_IMAGE_BYTES) return await finish(result);
      }
      edge = Math.floor(edge * 0.75);
    }
    // 작은 원본은 확대하지 않고 한 번 압축합니다.
    if (!best) {
      const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
      canvas.getContext('2d').drawImage(bitmap, 0, 0);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.65));
      if (blob) best = { blob, width: bitmap.width, height: bitmap.height };
    }
    if (!best || best.blob.size > MAX_IMAGE_BYTES) throw new Error('96KB 이하로 줄이지 못했어요. 다른 사진을 선택해 주세요.');
    return await finish(best);
  } finally { bitmap.close(); }
}
async function finish(result) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(result.blob);
  });
  return { dataUrl, bytes: result.blob.size, width: result.width, height: result.height };
}
