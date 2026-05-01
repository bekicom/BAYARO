import { useEffect, useMemo, useRef, useState } from "react";
import { getAppSettings } from "../../utils/appSettings";

const letterRows = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

const numberRows = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["-", "/", ":", ";", "(", ")", "$", "&", "@", '"'],
  [".", ",", "?", "!", "'", "%", "+", "="],
];

function isEditableTarget(target) {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (target.isContentEditable) return true;
  if (tag !== "input" && tag !== "textarea") return false;
  if (target.disabled || target.readOnly) return false;
  const type = (target.getAttribute("type") || "text").toLowerCase();
  return !["checkbox", "radio", "file", "button", "submit", "reset", "range", "color"].includes(type);
}

function setNativeValue(target, value) {
  const prototype = target.tagName.toLowerCase() === "textarea"
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  descriptor?.set?.call(target, value);
  target.dispatchEvent(new Event("input", { bubbles: true }));
  target.dispatchEvent(new Event("change", { bubbles: true }));
}

function insertIntoTarget(target, value) {
  if (!target) return;
  target.focus({ preventScroll: true });
  if (target.isContentEditable) {
    document.execCommand("insertText", false, value);
    return;
  }

  const current = target.value || "";
  const start = typeof target.selectionStart === "number" ? target.selectionStart : current.length;
  const end = typeof target.selectionEnd === "number" ? target.selectionEnd : start;
  const next = `${current.slice(0, start)}${value}${current.slice(end)}`;
  setNativeValue(target, next);
  const cursor = start + value.length;
  try {
    target.setSelectionRange(cursor, cursor);
  } catch {
    // Some input types do not support selection ranges.
  }
}

function backspaceTarget(target) {
  if (!target) return;
  target.focus({ preventScroll: true });
  if (target.isContentEditable) {
    document.execCommand("delete", false);
    return;
  }

  const current = target.value || "";
  const start = typeof target.selectionStart === "number" ? target.selectionStart : current.length;
  const end = typeof target.selectionEnd === "number" ? target.selectionEnd : start;
  if (start === 0 && end === 0) return;
  const nextStart = start === end ? Math.max(0, start - 1) : start;
  const next = `${current.slice(0, nextStart)}${current.slice(end)}`;
  setNativeValue(target, next);
  try {
    target.setSelectionRange(nextStart, nextStart);
  } catch {
    // Some input types do not support selection ranges.
  }
}

export function OnScreenKeyboard() {
  const keyboardRef = useRef(null);
  const targetRef = useRef(null);
  const dragRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(() => getAppSettings().onScreenKeyboardEnabled);
  const [shift, setShift] = useState(false);
  const [symbols, setSymbols] = useState(false);
  const [position, setPosition] = useState(() => ({
    x: Math.max(12, window.innerWidth - 680),
    y: Math.max(12, window.innerHeight - 310),
  }));

  const rows = useMemo(() => (symbols ? numberRows : letterRows), [symbols]);

  useEffect(() => {
    const onSettings = (event) => {
      const nextEnabled = event.detail?.onScreenKeyboardEnabled !== false;
      setEnabled(nextEnabled);
      if (!nextEnabled) setVisible(false);
    };
    const onStorage = (event) => {
      if (event.key === "bayaro_app_settings") {
        const nextEnabled = getAppSettings().onScreenKeyboardEnabled;
        setEnabled(nextEnabled);
        if (!nextEnabled) setVisible(false);
      }
    };
    window.addEventListener("bayaro:app-settings", onSettings);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("bayaro:app-settings", onSettings);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const onFocusIn = (event) => {
      if (!enabled) return;
      if (!isEditableTarget(event.target)) return;
      targetRef.current = event.target;
      setVisible(true);
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [enabled]);

  useEffect(() => {
    const onPointerMove = (event) => {
      const drag = dragRef.current;
      if (!drag) return;
      const nextX = event.clientX - drag.offsetX;
      const nextY = event.clientY - drag.offsetY;
      const width = keyboardRef.current?.offsetWidth || 640;
      const height = keyboardRef.current?.offsetHeight || 280;
      setPosition({
        x: Math.min(Math.max(8, nextX), Math.max(8, window.innerWidth - width - 8)),
        y: Math.min(Math.max(8, nextY), Math.max(8, window.innerHeight - height - 8)),
      });
    };
    const onPointerUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  if (!enabled || !visible) return null;

  const pressKey = (key) => {
    const target = targetRef.current;
    if (!isEditableTarget(target)) {
      setVisible(false);
      return;
    }

    if (key === "backspace") return backspaceTarget(target);
    if (key === "space") return insertIntoTarget(target, " ");
    if (key === "enter") {
      target.blur();
      setVisible(false);
      return;
    }
    if (key === "clear") {
      setNativeValue(target, "");
      target.focus({ preventScroll: true });
      return;
    }
    insertIntoTarget(target, shift && !symbols ? key.toUpperCase() : key);
  };

  return (
    <div
      ref={keyboardRef}
      className="screen-keyboard"
      style={{ left: position.x, top: position.y }}
      onPointerDown={(event) => event.preventDefault()}
    >
      <div
        className="screen-keyboard__bar"
        onPointerDown={(event) => {
          const rect = keyboardRef.current.getBoundingClientRect();
          dragRef.current = {
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
          };
        }}
      >
        <span>Klaviatura</span>
        <button type="button" onClick={() => setVisible(false)}>×</button>
      </div>

      <div className="screen-keyboard__rows">
        {rows.map((row, rowIndex) => (
          <div className="screen-keyboard__row" key={rowIndex}>
            {rowIndex === 2 && !symbols && (
              <button
                type="button"
                className={`screen-keyboard__key screen-keyboard__key--wide ${shift ? "is-active" : ""}`}
                onClick={() => setShift((value) => !value)}
              >
                Shift
              </button>
            )}
            {row.map((key) => (
              <button
                type="button"
                className="screen-keyboard__key"
                key={key}
                onClick={() => pressKey(key)}
              >
                {shift && !symbols ? key.toUpperCase() : key}
              </button>
            ))}
            {rowIndex === 2 && (
              <button
                type="button"
                className="screen-keyboard__key screen-keyboard__key--wide"
                onClick={() => pressKey("backspace")}
              >
                ⌫
              </button>
            )}
          </div>
        ))}
        <div className="screen-keyboard__row">
          <button
            type="button"
            className="screen-keyboard__key screen-keyboard__key--wide"
            onClick={() => setSymbols((value) => !value)}
          >
            {symbols ? "ABC" : "123"}
          </button>
          <button
            type="button"
            className="screen-keyboard__key screen-keyboard__key--space"
            onClick={() => pressKey("space")}
          >
            Bo'sh joy
          </button>
          <button
            type="button"
            className="screen-keyboard__key screen-keyboard__key--wide"
            onClick={() => pressKey("clear")}
          >
            Tozalash
          </button>
          <button
            type="button"
            className="screen-keyboard__key screen-keyboard__key--wide screen-keyboard__key--done"
            onClick={() => pressKey("enter")}
          >
            Tayyor
          </button>
        </div>
      </div>
    </div>
  );
}
