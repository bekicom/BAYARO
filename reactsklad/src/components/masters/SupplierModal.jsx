import { useEffect, useState } from "react";
import { formatGroupedNumberInput, parseGroupedNumberInput } from "../../utils/format";
import { ModalShell } from "../modal/ModalShell";

const initialState = {
  id: "",
  name: "",
  phone: "",
  address: "",
  note: "",
  openingBalanceAmount: "",
  openingBalanceCurrency: "usd",
};

export function SupplierModal({ open, current, onClose, onSubmit, loading }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (!open) return;
    setForm(current ? {
      id: current._id,
      name: current.name || "",
      phone: current.phone || "",
      address: current.address || "",
      note: current.note || "",
      openingBalanceAmount: "",
      openingBalanceCurrency: "usd",
    } : initialState);
  }, [open, current]);

  return (
    <ModalShell open={open} title={current ? "Yetkazib beruvchini tahrirlash" : "Yangi yetkazib beruvchi"} onClose={onClose} width="680px">
      <form
        className="form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({
            ...form,
            openingBalanceAmount: parseGroupedNumberInput(form.openingBalanceAmount),
          });
        }}
      >
        <label>
          <span>Nomi</span>
          <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required />
        </label>

        <label>
          <span>Telefon</span>
          <input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
        </label>

        <label className="full-width">
          <span>Manzil</span>
          <input value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
        </label>

        {!current ? (
          <>
            <label>
              <span>Boshlang'ich qarz</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Masalan 250"
                value={form.openingBalanceAmount}
                onChange={(event) => setForm((prev) => ({ ...prev, openingBalanceAmount: formatGroupedNumberInput(event.target.value) }))}
              />
            </label>

            <label>
              <span>Valyuta</span>
              <select value={form.openingBalanceCurrency} onChange={(event) => setForm((prev) => ({ ...prev, openingBalanceCurrency: event.target.value }))}>
                <option value="usd">USD</option>
              </select>
            </label>
          </>
        ) : null}

        <label className="full-width">
          <span>Izoh</span>
          <textarea rows="4" value={form.note} onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))} />
        </label>

        <div className="modal-footer full-width">
          <button type="button" className="ghost-btn" onClick={onClose}>Bekor qilish</button>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
