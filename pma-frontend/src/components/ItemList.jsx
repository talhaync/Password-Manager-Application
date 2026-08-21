import { forwardRef, useState } from "react";
import { Search, Copy, Check, Plus } from "lucide-react";
import client from "../api/client";
import Button from "./ui/Button";
import PatternBackdrop from "./PatternBackdrop";

const ItemList = forwardRef(function ItemList(
  { entries, totalCount, selectedId, onSelect, search, onSearchChange, loading, error, onCreate },
  searchRef
) {
  const handleKeyDown = (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();

    const index = entries.findIndex((entry) => entry.id === selectedId);
    const next =
      e.key === "ArrowDown"
        ? Math.min(index + 1, entries.length - 1)
        : Math.max(index - 1, 0);

    if (entries[next]) onSelect(entries[next].id);
  };

  return (
    <section
      className="w-[336px] shrink-0 flex flex-col bg-surface border-r border-line"
      onKeyDown={handleKeyDown}
    >
      <div className="h-14 px-3 flex items-center border-b border-line">
        <div className="relative w-full">
          <Search
            size={16}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            aria-label="Search items"
            className="w-full h-9 pl-9 pr-12 text-sm rounded-sm bg-base text-fg border border-line placeholder:text-muted/60 transition-colors duration-[130ms] ease-out focus:border-accent focus:outline-none focus-visible:outline-none"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted/60 font-sans pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto scroll-thin py-1">
        {/* Rows rarely fill this column, so the pattern sits behind whatever
            space they leave. It's fixed to the scroll container, not the rows,
            so it doesn't move while scrolling. */}
        <PatternBackdrop opacity={0.3} fade="ellipse 90% 45% at 50% 100%" />

        <div className="relative">
          {loading ? (
            <SkeletonRows />
          ) : error ? (
            <p className="px-4 py-6 text-xs text-danger">{error}</p>
          ) : entries.length === 0 ? (
            <EmptyState hasItems={totalCount > 0} search={search} onCreate={onCreate} />
          ) : (
            entries.map((entry) => (
              <ItemRow
                key={entry.id}
                entry={entry}
                selected={entry.id === selectedId}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
});

function ItemRow({ entry, selected, onSelect }) {
  const [copied, setCopied] = useState(false);

  const copy = async (e) => {
    e.stopPropagation();
    try {
      const password = (await client.get(`/vault/${entry.id}/reveal`)).data.password;
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* silent — a list row is not the place for an error banner */
    }
  };

  return (
    <div
      role="option"
      tabIndex={0}
      aria-selected={selected}
      onClick={() => onSelect(entry.id)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(entry.id)}
      className={`group relative h-[60px] pl-4 pr-2 flex items-center gap-3 cursor-pointer transition-colors duration-[130ms] ease-out ${
        selected ? "bg-hover" : "hover:bg-hover/60"
      }`}
    >
      {selected && <span className="absolute left-0 inset-y-0 w-0.5 bg-accent" />}

      <div className="size-9 shrink-0 rounded-sm bg-raised border border-line flex items-center justify-center">
        <span className="text-xs font-medium text-muted">
          {entry.platformName?.[0]?.toUpperCase() || "?"}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-fg truncate">{entry.platformName}</div>
        <div className="text-xs text-muted truncate mt-0.5">{entry.platformUsername}</div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-[130ms] ease-out">
        <button
          type="button"
          title="Copy password"
          aria-label="Copy password"
          onClick={copy}
          className={`inline-flex items-center justify-center rounded-sm p-2 transition-colors duration-[130ms] ease-out ${
            copied ? "text-success" : "text-muted hover:text-fg hover:bg-raised"
          }`}
        >
          {copied ? (
            <Check size={18} strokeWidth={1.5} />
          ) : (
            <Copy size={18} strokeWidth={1.5} />
          )}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ hasItems, search, onCreate }) {
  if (hasItems) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-xs text-muted">No results for “{search}”</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 text-center">
      <p className="text-xs text-muted mb-3">No items yet. Add your first login.</p>
      <Button variant="secondary" size="sm" icon={Plus} onClick={onCreate}>
        New item
      </Button>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="h-[60px] pl-4 pr-2 flex items-center gap-3">
          <div className="size-9 shrink-0 rounded-sm bg-hover animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 rounded-full bg-hover animate-pulse" />
            <div className="h-2.5 w-24 rounded-full bg-hover/70 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ItemList;