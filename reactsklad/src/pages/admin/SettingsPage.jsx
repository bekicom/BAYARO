import { useMemo, useState } from "react";
import { BarcodeTag } from "../../components/print/BarcodeTag";
import { PageHeader } from "../../components/page_header/PageHeader";
import { getAppSettings, saveAppSettings } from "../../utils/appSettings";
import {
  BARCODE_LABEL_OPTIONS,
  BARCODE_PRINT_DEFAULTS,
  getBarcodeLabelOption,
  getBarcodePrintSettings,
  getBarcodeTicketDimensions,
  saveBarcodePrintSettings,
} from "../../utils/barcodeSettings";

const PREVIEW_PRODUCT = {
  name: "TEST MAHSULOT",
  code: "4512",
  category: "Kiyimlar",
  barcode: "2427000098116",
  retailPrice: 25,
  sizeOptions: ["5-8"],
  colorOptions: ["Multikolor"],
  gender: "ogil_bola",
};

export function SettingsPage() {
  const [settings, setSettings] = useState(() => getBarcodePrintSettings());
  const [appSettings, setAppSettings] = useState(() => getAppSettings());
  const [saved, setSaved] = useState("");

  const labelOption = useMemo(
    () => getBarcodeLabelOption(settings.labelSize),
    [settings.labelSize],
  );
  const { widthMm: previewWidthMm, heightMm: previewHeightMm } = getBarcodeTicketDimensions(settings);
  const previewWidth = previewWidthMm * 4;
  const previewHeight = previewHeightMm * 4;

  const updateSettings = (patch) => {
    setSaved("");
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = () => {
    saveBarcodePrintSettings(settings);
    saveAppSettings(appSettings);
    setSaved("Sozlamalar saqlandi");
  };

  const handleReset = () => {
    saveBarcodePrintSettings(BARCODE_PRINT_DEFAULTS);
    saveAppSettings({ onScreenKeyboardEnabled: true });
    setSettings(BARCODE_PRINT_DEFAULTS);
    setAppSettings({ onScreenKeyboardEnabled: true });
    setSaved("Standart sozlama tiklandi");
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Sozlamalar"
        subtitle="Shtixkod chop etishdan oldin label ko'rinishi va yo'nalishini sozlang"
      />

      <section className="panel-box barcode-settings-panel">
        <div className="keyboard-settings-strip">
          <div>
            <h3>Ekran klaviaturasi</h3>
            <p>POS monitor uchun input bosilganda kichik klaviatura chiqishini yoqish yoki o'chirish.</p>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={appSettings.onScreenKeyboardEnabled}
              onChange={(event) => {
                const next = {
                  ...appSettings,
                  onScreenKeyboardEnabled: event.target.checked,
                };
                setSaved("");
                setAppSettings(next);
                saveAppSettings(next);
              }}
            />
            <span>{appSettings.onScreenKeyboardEnabled ? "Yoqilgan" : "O'chirilgan"}</span>
          </label>
        </div>

        <div className="barcode-settings-head">
          <div className="barcode-settings-title">
            <span className="settings-icon-box" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h2M4 12h4M4 17h2M10 7h1M10 17h1M15 7h1M15 12h1M15 17h1M19 7h1M19 12h1M19 17h1" />
              </svg>
            </span>
            <div>
              <h3>Shtixkod chop etish sozlamalari</h3>
            </div>
          </div>
          <div className="page-actions">
            <button type="button" className="ghost-btn" onClick={handleReset}>Standart holat</button>
            <button type="button" className="primary-btn" onClick={handleSave}>Saqlash</button>
          </div>
        </div>

        {saved ? <div className="success-inline-box">{saved}</div> : null}

        <div className="barcode-settings-grid">
          <label>
            Label o'lchami
            <select
              value={settings.labelSize}
              onChange={(event) => updateSettings({ labelSize: event.target.value })}
            >
              {BARCODE_LABEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label>
            Har chop etishda nusxa soni
            <input
              type="number"
              min="1"
              max="20"
              value={settings.copies}
              onChange={(event) => updateSettings({ copies: Math.max(1, Number(event.target.value) || 1) })}
            />
          </label>

          <label>
            Yo'nalish
            <select
              value={settings.orientation}
              onChange={(event) => updateSettings({ orientation: event.target.value })}
            >
              <option value="portrait">Kitob</option>
              <option value="landscape">Albom</option>
            </select>
          </label>
        </div>

        <div className="barcode-settings-checks">
          <span>Ko'rinadigan ma'lumotlar</span>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={settings.showName}
              onChange={(event) => updateSettings({ showName: event.target.checked })}
            />
            Nomi
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={settings.showPrice}
              onChange={(event) => updateSettings({ showPrice: event.target.checked })}
            />
            Narx
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={settings.showCode}
              onChange={(event) => updateSettings({ showCode: event.target.checked })}
            />
            Kod
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={settings.showCategory}
              onChange={(event) => updateSettings({ showCategory: event.target.checked })}
            />
            Kategoriya
          </label>
        </div>

        <div className="barcode-preview-block">
          <BarcodeTag
            product={PREVIEW_PRODUCT}
            settings={settings}
            preview
            style={{
              width: `${previewWidth}px`,
              minHeight: `${previewHeight}px`,
              "--ticket-width-mm": `${previewWidthMm}mm`,
              "--ticket-height-mm": `${previewHeightMm}mm`,
            }}
            className="barcode-ticket-preview"
          />
        </div>
      </section>
    </div>
  );
}
