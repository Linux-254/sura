function hexChannel(value: string) {
  const channel = Number.parseInt(value, 16) / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

export function contrastRatio(foreground: string, background: string) {
  const luminance = (hex: string) => {
    const normalized = hex.replace("#", "");
    const red = hexChannel(normalized.slice(0, 2));
    const green = hexChannel(normalized.slice(2, 4));
    const blue = hexChannel(normalized.slice(4, 6));
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

export function meetsNormalTextContrast(foreground: string, background: string) {
  return contrastRatio(foreground, background) >= 4.5;
}
