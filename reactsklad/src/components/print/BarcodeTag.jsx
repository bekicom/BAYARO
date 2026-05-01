import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { formatMoneyWithCurrency } from "../../utils/format";

function normalizeValue(value, fallback = "-") {
  const text = String(value || "").trim();
  return text ? text.toUpperCase() : fallback;
}

function getCategoryName(product) {
  if (typeof product?.categoryId === "object") return product.categoryId?.name || "";
  return product?.category || product?.categoryName || "";
}

function isShown(settings, key) {
  return settings?.[key] !== false;
}

export function buildProductMeta(product, settings) {
  return {
    title: normalizeValue(product?.name || "Mahsulot"),
    code: normalizeValue(product?.code || product?.model || "-"),
    category: normalizeValue(getCategoryName(product), ""),
    barcode: String(product?.barcode || "-"),
    price: formatMoneyWithCurrency(product?.retailPrice),
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getBarcodeOptions(barcode, orientation, preview) {
  // Use one scanner-friendly format for all labels.
  return {
    format: "CODE128",
    lineColor: "#111111",
    width: preview ? 0.92 : 0.84,
    height: orientation === "landscape" ? (preview ? 34 : 40) : (preview ? 40 : 46),
    displayValue: false,
    // Keep quiet zone so handheld scanners lock faster.
    margin: 8,
    marginLeft: 8,
    marginRight: 8,
    background: "#ffffff",
  };
}

export function createBarcodeSvgMarkup(barcode, orientation = "portrait") {
  if (typeof document === "undefined" || !barcode) return "";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  JsBarcode(svg, barcode, getBarcodeOptions(barcode, orientation, false));
  return svg.outerHTML;
}

export function buildBarcodeTagMarkup(product, settings) {
  const meta = buildProductMeta(product, settings);
  const orientationClass = settings.orientation === "landscape" ? "landscape" : "portrait";

  return `
    <div class="barcode-tag-print ${orientationClass}">
      <div class="barcode-simple">
        ${isShown(settings, "showName") ? `<div class="barcode-simple-title">${escapeHtml(meta.title)}</div>` : ""}
        ${settings?.showCategory && meta.category ? `<div class="barcode-simple-category">${escapeHtml(meta.category)}</div>` : ""}
        ${isShown(settings, "showCode") ? `<div class="barcode-simple-row barcode-simple-row--code">
          <span>KOD:</span>
          <strong>${escapeHtml(meta.code)}</strong>
        </div>` : ""}
        ${isShown(settings, "showPrice") ? `<div class="barcode-simple-price">${escapeHtml(meta.price)}</div>` : ""}
        <div class="barcode-simple-barcode">
          <div class="barcode-simple-code-frame">
            ${createBarcodeSvgMarkup(meta.barcode, settings.orientation)}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function BarcodeTag({ product, settings, style, preview = false, className = "" }) {
  const barcodeRef = useRef(null);
  const meta = buildProductMeta(product, settings);
  const orientationClass = settings.orientation === "landscape" ? "landscape" : "portrait";

  useEffect(() => {
    if (!barcodeRef.current || !product?.barcode) return;

    JsBarcode(barcodeRef.current, product.barcode, getBarcodeOptions(product.barcode, settings.orientation, preview));
  }, [preview, product?.barcode, settings.orientation]);

  return (
    <div className={`barcode-ticket barcode-ticket--tag ${orientationClass} ${className}`.trim()} style={style}>
      <div className="barcode-simple">
        {isShown(settings, "showName") ? <div className="barcode-simple-title">{meta.title}</div> : null}
        {settings?.showCategory && meta.category ? <div className="barcode-simple-category">{meta.category}</div> : null}
        {isShown(settings, "showCode") ? (
          <div className="barcode-simple-row barcode-simple-row--code">
            <span>KOD:</span>
            <strong>{meta.code}</strong>
          </div>
        ) : null}
        {isShown(settings, "showPrice") ? <div className="barcode-simple-price">{meta.price}</div> : null}
        <div className="barcode-simple-barcode">
          <div className="barcode-simple-code-frame">
            <svg ref={barcodeRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
