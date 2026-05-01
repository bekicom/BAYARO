export const BARCODE_LABEL_OPTIONS = [
  { value: "55x35", label: "55 x 35 mm", width: 55, height: 35 },
  { value: "58x40", label: "58 x 40 mm", width: 58, height: 40 },
  { value: "60x40", label: "60 x 40 mm", width: 60, height: 40 },
  { value: "70x40", label: "70 x 40 mm", width: 70, height: 40 },
  { value: "80x50", label: "80 x 50 mm", width: 80, height: 50 },
];

export const BARCODE_PRINT_DEFAULTS = {
  labelSize: "55x35",
  copies: 1,
  orientation: "landscape",
  showName: true,
  showPrice: true,
  showCode: true,
  showCategory: false,
};

const STORAGE_KEY = "kiyim_dokon_barcode_print_settings";

export function getBarcodePrintSettings() {
  if (typeof window === "undefined") return BARCODE_PRINT_DEFAULTS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return BARCODE_PRINT_DEFAULTS;

    const parsed = JSON.parse(raw);
    return {
      ...BARCODE_PRINT_DEFAULTS,
      ...parsed,
      showCode: typeof parsed?.showCode === "boolean" ? parsed.showCode : typeof parsed?.showModel === "boolean" ? parsed.showModel : BARCODE_PRINT_DEFAULTS.showCode,
      labelSize: BARCODE_LABEL_OPTIONS.some((item) => item.value === parsed?.labelSize)
        ? parsed.labelSize
        : BARCODE_PRINT_DEFAULTS.labelSize,
      orientation: ["portrait", "landscape"].includes(parsed?.orientation)
        ? parsed.orientation
        : BARCODE_PRINT_DEFAULTS.orientation,
      copies: Number(parsed?.copies) > 0 ? Number(parsed.copies) : BARCODE_PRINT_DEFAULTS.copies,
    };
  } catch {
    return BARCODE_PRINT_DEFAULTS;
  }
}

export function saveBarcodePrintSettings(settings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function getBarcodeLabelOption(value) {
  return BARCODE_LABEL_OPTIONS.find((item) => item.value === value) || BARCODE_LABEL_OPTIONS[0];
}

export function getBarcodeTicketDimensions(settings) {
  const option = getBarcodeLabelOption(settings?.labelSize);
  const isLandscape = settings?.orientation === "landscape";

  return {
    widthMm: isLandscape ? option.width : option.height,
    heightMm: isLandscape ? option.height : option.width,
  };
}
