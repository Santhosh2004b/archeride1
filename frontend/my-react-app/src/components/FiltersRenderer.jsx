// src/components/FiltersRenderer.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * FiltersRenderer
 * Props:
 * - config: { fields: [ { name, label, type, options?, source? } ] }
 * - values: { key: value }
 * - onChange: (name, value) => void
 * - onApply: () => void
 * - onClear: () => void
 * - sources: { projects: [{ value, label }, ...], ... }
 * - compactOnMobile: boolean (default true)
 */

const useDebounced = (value, delay = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

const DebouncedText = ({ label, name, value, onChange, delay = 300 }) => {
  const [local, setLocal] = useState(value ?? "");
  useEffect(() => setLocal(value ?? ""), [value]);
  const debounced = useDebounced(local, delay);

  useEffect(() => {
    if ((value ?? "") !== debounced) {
      onChange(name, debounced);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <label className="flex flex-col text-xs">
      <span className="text-xs text-slate-600 mb-1">{label}</span>
      <input
        name={name}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm focus:outline-none"
        type="text"
        inputMode="search"
        placeholder={label}
      />
    </label>
  );
};

const FieldControl = ({ field, value, onChange, sources }) => {
  const { name, label, type, options, source } = field;
  const src = source ? sources?.[source] || [] : null;

  const normalizedOptions = useMemo(() => {
    if (!options) return src || [];
    if (options.length === 0) return [];
    if (typeof options[0] === "string") {
      return options.map((o) => ({ value: o, label: o }));
    }
    return options;
  }, [options, src]);

  const internalChange = (v) => onChange(name, v);

  if (type === "select") {
    return (
      <label className="flex flex-col text-xs">
        <span className="text-xs text-slate-600 mb-1">{label}</span>
        <select
          name={name}
          value={value ?? ""}
          onChange={(e) => internalChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm focus:outline-none"
        >
          <option value="">{label} (All)</option>
          {normalizedOptions.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (type === "date") {
    return (
      <label className="flex flex-col text-xs">
        <span className="text-xs text-slate-600 mb-1">{label}</span>
        <input
          type="date"
          name={name}
          value={value ?? ""}
          onChange={(e) => internalChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm focus:outline-none"
        />
      </label>
    );
  }

  if (type === "textarea") {
    return (
      <label className="flex flex-col text-xs">
        <span className="text-xs text-slate-600 mb-1">{label}</span>
        <textarea
          name={name}
          value={value ?? ""}
          onChange={(e) => internalChange(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm focus:outline-none"
        />
      </label>
    );
  }

  // default: debounced text
  return <DebouncedText label={label} name={name} value={value} onChange={onChange} />;
};

const FiltersRenderer = ({
  config,
  values,
  onChange,
  onApply,
  onClear,
  sources = {},
  compactOnMobile = true,
}) => {
  const [open, setOpen] = useState(!compactOnMobile);

  useEffect(() => {
    const m = window.matchMedia?.("(min-width: 640px)");
    if (compactOnMobile) setOpen(!!m?.matches);
    const handle = () => {
      if (compactOnMobile) setOpen(window.innerWidth >= 640);
    };
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [compactOnMobile]);

  if (!config || !Array.isArray(config.fields)) return null;

  return (
    <div className="w-full">
      {compactOnMobile && (
        <div className="sm:hidden mb-2">
          <button
            type="button"
            onClick={() => setOpen((s) => !s)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
          >
            <span className="font-semibold">Filters</span>
            <span className="text-xs text-slate-600">{open ? "Hide" : "Show"}</span>
          </button>
        </div>
      )}

      {open && (
        <div className="w-full bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-3 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {config.fields.map((f) => (
              <div key={f.name}>
                <FieldControl field={f} value={values[f.name]} onChange={onChange} sources={sources} />
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-end">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center justify-center rounded-full border border-gray-300 px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={onApply}
                className="inline-flex items-center justify-center rounded-full bg-brandDark px-4 py-2 text-xs sm:text-sm text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltersRenderer;
