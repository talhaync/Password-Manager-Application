import { useState, useEffect, useCallback, useRef } from "react";
import client from "../api/client";
import Sidebar from "../components/Sidebar";
import ItemList from "../components/ItemList";
import ItemDetail from "../components/ItemDetail";
import EntryModal from "../components/EntryModal";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const searchRef = useRef(null);

  const loadEntries = useCallback(async () => {
    try {
      const response = await client.get("/vault");
      setEntries(response.data);
      setError("");
    } catch {
      setError("Couldn't load your items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Cmd/Ctrl+K focuses search.
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = entries.filter((entry) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      entry.platformName?.toLowerCase().includes(q) ||
      entry.platformUsername?.toLowerCase().includes(q)
    );
  });

  // Derived rather than stored, so the detail panel never shows a stale copy
  // after the list reloads.
  const selected = entries.find((entry) => entry.id === selectedId) || null;

  const handleCreate = async (data) => {
    const response = await client.post("/vault", data);
    setModalOpen(false);
    await loadEntries();
    // Jump straight to the item that was just created.
    setSelectedId(response.data.id);
  };

  const confirmDelete = async () => {
    const entry = pendingDelete;
    setPendingDelete(null);
    try {
      await client.delete(`/vault/${entry.id}`);
      if (selectedId === entry.id) setSelectedId(null);
      loadEntries();
    } catch {
      setError("Couldn't delete the item.");
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-base text-fg">
      <Sidebar itemCount={entries.length} onCreate={() => setModalOpen(true)} />

      <ItemList
        ref={searchRef}
        entries={filtered}
        totalCount={entries.length}
        selectedId={selectedId}
        onSelect={setSelectedId}
        search={search}
        onSearchChange={setSearch}
        loading={loading}
        error={error}
        onCreate={() => setModalOpen(true)}
      />

      <ItemDetail entry={selected} onSaved={loadEntries} onDelete={setPendingDelete} />

      {modalOpen && (
        <EntryModal onClose={() => setModalOpen(false)} onSave={handleCreate} />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete item"
          message={`This permanently removes the credentials for ${pendingDelete.platformName}. This can't be undone.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}