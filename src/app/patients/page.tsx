"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Patient {
  id: string;
  patient_number: string;
  display_name: string;
  sex: "MALE" | "FEMALE" | "OTHER";
  year_of_birth?: number;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // New patient modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [sexInput, setSexInput] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [yobInput, setYobInput] = useState("1985");

  function loadPatients(query = "") {
    setLoading(true);
    fetch(`/api/patients?search=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setPatients(data.data.patients);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPatients();
  }, []);

  async function handleCreatePatient(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: nameInput,
          sex: sexInput,
          year_of_birth: Number(yobInput) || undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setShowAddModal(false);
        setNameInput("");
        loadPatients();
      } else {
        alert(data.error?.message || "Failed to create patient.");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    }
  }

  async function handleDeletePatient(patientId: string, name: string) {
    const confirmed = confirm(
      `Are you sure you want to permanently delete patient "${name}"?\n\nThis will trigger an irreversible cascading deletion of all consultations, rubrics, and prescriptions associated with this patient under DPDP rules.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/patients/${patientId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        alert(
          `Patient deleted successfully.\nCascaded deletion: ${data.data.consultationsDeleted} consultations and ${data.data.prescriptionsDeleted} prescriptions purged.`
        );
        loadPatients(search);
      } else {
        alert(data.error?.message || "Failed to delete patient.");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Patient Registry
          </span>
          <h1 className="font-display text-3xl font-bold text-text-primary mt-1">
            Patient Directory &amp; Records
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Doctor-isolated patient records with DPDP erasure and privacy controls.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold text-bg hover:bg-accent-strong transition shrink-0"
        >
          + Add New Patient
        </button>
      </div>

      {/* Search Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            loadPatients(e.target.value);
          }}
          placeholder="Search by patient name or patient number (e.g. Aarav, P-1001)..."
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
        />
      </div>

      {/* Patient Table */}
      <section className="rounded-xl border border-border bg-surface overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-sm text-text-secondary">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12 text-sm text-text-secondary">
            No patients found matching &ldquo;{search}&rdquo;.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-raised border-b border-border text-xs text-text-secondary uppercase">
              <tr>
                <th className="py-3 px-4">Patient No</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Sex</th>
                <th className="py-3 px-4">Year of Birth</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-text-primary">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-surface-raised/40 transition">
                  <td className="py-3 px-4 font-mono font-medium text-accent">{p.patient_number}</td>
                  <td className="py-3 px-4 font-medium">{p.display_name}</td>
                  <td className="py-3 px-4 text-xs text-text-secondary">{p.sex}</td>
                  <td className="py-3 px-4 text-xs text-text-secondary">{p.year_of_birth || "—"}</td>
                  <td className="py-3 px-4 text-right space-x-3">
                    <Link
                      href="/consultation"
                      className="text-xs text-accent hover:underline font-medium"
                    >
                      New Consultation
                    </Link>
                    <button
                      onClick={() => handleDeletePatient(p.id, p.display_name)}
                      className="text-xs text-danger hover:underline font-medium"
                      title="Cascading delete under DPDP"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-display font-semibold text-lg text-text-primary">Register Patient</h3>
              <button onClick={() => setShowAddModal(false)} className="text-text-secondary hover:text-text-primary">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Full Display Name
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Priya Patel"
                  className="w-full rounded-md border border-border bg-bg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Sex</label>
                  <select
                    value={sexInput}
                    onChange={(e: any) => setSexInput(e.target.value)}
                    className="w-full rounded-md border border-border bg-bg px-3 py-2 text-text-primary focus:outline-none focus:border-accent text-xs"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Year of Birth</label>
                  <input
                    type="number"
                    min={1910}
                    max={2026}
                    value={yobInput}
                    onChange={(e) => setYobInput(e.target.value)}
                    className="w-full rounded-md border border-border bg-bg px-3 py-2 text-text-primary focus:outline-none focus:border-accent text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-5 py-2 text-xs font-semibold text-bg hover:bg-accent-strong"
                >
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
