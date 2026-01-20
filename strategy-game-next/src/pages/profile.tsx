import * as React from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { getUserById, updateUser, listUsers } from "../api/user";
import type { User } from "../models/User";

const ProfilePage: NextPage = () => {
  const router = useRouter();

  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedMsg, setSavedMsg] = React.useState<string | null>(null);

  const [user, setUser] = React.useState<User | null>(null);

  const [adminOpen, setAdminOpen] = React.useState(false);
  const [users, setUsers] = React.useState<User[]>([]);
  const [adminLoading, setAdminLoading] = React.useState(false);
  const [adminError, setAdminError] = React.useState<string | null>(null);

  async function onAdminLoadUsers() {
    setAdminError(null);
    setSavedMsg(null);
    setAdminLoading(true);
    try {
      const data = await listUsers();
      setUsers(data);
      setAdminOpen(true);
    } catch (err: any) {
      setAdminError(err?.message ?? "Failed to load users.");
      setAdminOpen(true);
    } finally {
      setAdminLoading(false);
    }
  }


  function findLocalUserId(): number | null {
    const raw = localStorage.getItem("userId");
    if (!raw) return null;

    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  async function loadProfile() {
    setError(null);
    setSavedMsg(null);
    setLoading(true);

    const idFromStorage = findLocalUserId();

    if (!idFromStorage) {
      setError("No user id found in local storage. Please login first.");
      setLoading(false);
      return;
    }

    try {
      const u = await getUserById(idFromStorage);
      setUser(u);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    // only run client-side
    if (typeof window === "undefined") return;
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSave() {
    if (!user) return;
    setError(null);
    setSavedMsg(null);
    setSaving(true);
    try {
      const updated = await updateUser(user.id, {
        username: user.username,
        description: user.description ?? "",
      });
      setUser(updated);
      setSavedMsg("Profile saved.");
      // try to keep localStorage 'user' in sync if present
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            if (parsed.id === updated.id) {
              parsed.username = updated.username;
              parsed.description = updated.description;
              localStorage.setItem("user", JSON.stringify(parsed));
            }
          }
        }
      } catch {
        // ignore storage update errors
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
      <main style={styles.page}>
        <section style={styles.card}>
          <div style={styles.topRow}>
            <h1 style={styles.h1}>Profile</h1>
            <div style={{display: "flex", gap: 8}}>
              <button
                  style={styles.linkBtn}
                  onClick={onAdminLoadUsers}
                  disabled={adminLoading}
              >
                {adminLoading ? "Loading users…" : "Administrator"}
              </button>
              <button
                  style={styles.linkBtn}
                  onClick={() => router.push("/lobby")}
              >
                Lobby
              </button>
            </div>
          </div>

          {loading && <div style={styles.block}>Loading…</div>}

          {error && <div style={{...styles.block, ...styles.error}}>{error}</div>}

          {!loading && !error && user && (
              <>
                <label style={styles.label}>
                  Username
                  <input
                      style={styles.input}
                      value={user.username}
                      onChange={(e) =>
                          setUser((prev) =>
                              prev ? { ...prev, username: e.target.value } : prev
                          )
                      }

                  />
                </label>

                <label style={styles.label}>
                  Description
                  <textarea
                      style={{ ...styles.input, height: 96, resize: "vertical" }}
                      value={user.description ?? ""}
                      onChange={(e) =>
                          setUser((prev) =>
                              prev ? { ...prev, description: e.target.value } : prev
                          )
                      }
                  />
                </label>

                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
                  <button style={styles.button} onClick={onSave} disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                      style={{ ...styles.button, background: "#fff", color: "#000" }}
                      onClick={() => router.back()}
                  >
                    Cancel
                  </button>
                  {savedMsg && <div style={{ marginLeft: 12 }}>{savedMsg}</div>}
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Joined</div>
                  <div>
                    {user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}
                  </div>

                  <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>Games won</div>
                  <div>{0}</div>
                </div>
              </>
          )}

          {!loading && !error && !user && (
              <div style={styles.block}>No profile found.</div>
          )}
        </section>
        {adminOpen && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 16 }}>Admin: Users</h2>
                <button
                    style={styles.linkBtn}
                    onClick={() => setAdminOpen(false)}
                >
                  Close
                </button>
              </div>

              {adminError && (
                  <div style={{ ...styles.block, ...styles.error }}>
                    {adminError}
                  </div>
              )}

              {!adminError && users.length === 0 && !adminLoading && (
                  <div style={styles.block}>No users.</div>
              )}

              {!adminError && users.length > 0 && (
                  <div style={{ overflowX: "auto", marginTop: 10 }}>
                    <table style={styles.table}>
                      <thead>
                      <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Username</th>
                        <th style={styles.th}>Description</th>
                        <th style={styles.th}>Created at</th>
                      </tr>
                      </thead>
                      <tbody>
                      {users.map((u) => (
                          <tr key={u.id}>
                            <td style={styles.td}>{u.id}</td>
                            <td style={styles.td}>{u.username}</td>
                            <td style={styles.td}>{u.description}</td>
                            <td style={styles.td}>{u.createdAt}</td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
              )}
            </div>
        )}

      </main>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "grid",
    placeItems: "center",
    background: "#fff",
    color: "#000",
    padding: 16,
    fontFamily:
        'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  card: {
    width: "100%",
    maxWidth: 720,
    border: "1px solid #000",
    padding: 18,
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  h1: { margin: 0, fontSize: 20, fontWeight: 700 },
  linkBtn: {
    border: "1px solid #000",
    background: "#fff",
    color: "#000",
    padding: "6px 10px",
    cursor: "pointer",
  },
  block: {
    marginTop: 12,
    padding: 10,
  },
  label: { display: "grid", gap: 6, fontSize: 14, marginTop: 12 },
  input: {
    border: "1px solid #000",
    padding: "8px 10px",
    fontSize: 14,
    background: "#fff",
    color: "#000",
  },
  button: {
    border: "1px solid #000",
    background: "#000",
    color: "#fff",
    padding: "10px 12px",
    fontSize: 14,
    cursor: "pointer",
  },
  error: { border: "1px solid #000", padding: 8, marginTop: 12 },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #000",
  },
  th: {
    textAlign: "left",
    borderBottom: "1px solid #000",
    padding: "8px 10px",
    fontSize: 13,
  },
  td: {
    borderBottom: "1px solid #000",
    padding: "8px 10px",
    fontSize: 13,
    verticalAlign: "top",
  },

};

export default ProfilePage;
