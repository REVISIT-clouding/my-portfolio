"use client";

import { useEffect, useState } from "react";
import { BiBarChartAlt2, BiBriefcase, BiCodeBlock, BiEdit, BiTrash, BiX } from "react-icons/bi";
import { FcAddDatabase } from "react-icons/fc";
import { SiSkillshare } from "react-icons/si";

const stackOf = (s) =>
    (Array.isArray(s) ? s : String(s || "").split(",")).map((t) => t.trim()).filter(Boolean);

// jsonb array (or newline string) -> one item per line for the textarea
const listOf = (v) =>
    (Array.isArray(v) ? v : String(v || "").split("\n"))
        .map((x) => (typeof x === "string" ? x.trim() : String(x?.title ?? x?.text ?? "")))
        .filter(Boolean);

// Used for both creating (no `existing`) and editing (pass the item as `existing`)
export function CreateEXP({ onSuccess, existing, onCancel }) {
    const editing = !!existing;

    const [title, setTitle] = useState(existing?.title ?? "");
    const [subtitle, setSubtitle] = useState(existing?.subtitle ?? "");
    const [summary, setSummary] = useState(existing?.summary ?? "");
    const [details, setDetails] = useState(existing?.details ?? "");
    const [overview, setOverview] = useState(existing?.overview ?? "");
    const [contributions, setContributions] = useState(listOf(existing?.contributions).join("\n"));
    const [keyFeatures, setKeyFeatures] = useState(listOf(existing?.key_features).join("\n"));
    const [techImpl, setTechImpl] = useState(existing?.technical_implementation ?? "");
    const [challenges, setChallenges] = useState(listOf(existing?.engineering_challenges).join("\n"));
    const [limitations, setLimitations] = useState(listOf(existing?.known_limitations).join("\n"));
    const [mode, setMode] = useState(existing?.mode ?? "project");
    const [stack, setStack] = useState(stackOf(existing?.stack).join(", "));
    const [footerleft, setFooterleft] = useState(existing?.footerLeft ?? existing?.footerleft ?? "");
    const [status, setStatus] = useState(existing?.status ?? "In progress");
    const [href, setHref] = useState(existing?.href ?? "");
    const [imgFile, setImgFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [projectDate, setProjectDate] = useState(existing?.project_date ?? "");
    const [keptImages, setKeptImages] = useState(Array.isArray(existing?.images) ? existing.images : []);
    const [newFiles, setNewFiles] = useState([]);
    const [displayOrder, setDisplayOrder] = useState(existing?.display_order ?? 100);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        let formattedHref = href.trim();
        if (formattedHref && !/^https?:\/\//i.test(formattedHref)) {
            formattedHref = `https://${formattedHref}`;
        }

        try {
            let res;

            const fd = new FormData();
            fd.append("title", title);
            fd.append("subtitle", subtitle);
            fd.append("summary", summary);
            fd.append("details", details);
            fd.append("overview", overview);
            fd.append("contributions", contributions);
            fd.append("key_features", keyFeatures);
            fd.append("technical_implementation", techImpl);
            fd.append("engineering_challenges", challenges);
            fd.append("known_limitations", limitations);
            fd.append("stack", stack);
            fd.append("status", status);
            fd.append("mode", mode);
            fd.append("footerleft", footerleft);
            fd.append("display_order", displayOrder);
            fd.append("href", formattedHref);
            fd.append("project_date", projectDate);
            fd.append("existingImages", JSON.stringify(keptImages));
            newFiles.forEach((f) => fd.append("images", f));

            if (imgFile) {
                fd.append("img", imgFile);
            } else if (editing && existing?.img) {
                fd.append("existingImg", existing.img);
            }

            if (editing) {
                res = await fetch(`/api/projectandwork/${existing.id}`, {
                    method: "PUT",
                    body: fd,
                });
            } else {
                res = await fetch("/api/projectandwork", {
                    method: "POST",
                    body: fd,
                });
            }

            const data = await res.json();

            if (res.ok) {
                if (onSuccess) onSuccess();
            } else {
                setError(data.message || (editing ? "Failed to update" : "Failed to create"));
            }
        } catch (err) {
            setError("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold">{editing ? "Edit Experience" : "Create Experience"}</h2>

            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input type="text" placeholder="Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} required />

            <textarea placeholder="Summary" value={summary} onChange={(e) => setSummary(e.target.value)} required />
            <textarea placeholder="Details" value={details} onChange={(e) => setDetails(e.target.value)} />
            <textarea placeholder="Overview" rows={4} value={overview} onChange={(e) => setOverview(e.target.value)} />
            <textarea placeholder="My contribution (one per line)" rows={4} value={contributions} onChange={(e) => setContributions(e.target.value)} />
            <textarea placeholder="Key features (one per line)" rows={4} value={keyFeatures} onChange={(e) => setKeyFeatures(e.target.value)} />
            <textarea placeholder="Technical implementation" rows={5} value={techImpl} onChange={(e) => setTechImpl(e.target.value)} />
            <textarea placeholder="Engineering challenges (one per line)" rows={4} value={challenges} onChange={(e) => setChallenges(e.target.value)} />
            <textarea placeholder="Known limitations (one per line)" rows={4} value={limitations} onChange={(e) => setLimitations(e.target.value)} />

            <input type="text" placeholder="Stack (comma separated)" value={stack} onChange={(e) => setStack(e.target.value)} required />
            <input type="text" placeholder="E.g Full stack Development" value={footerleft} onChange={(e) => setFooterleft(e.target.value)} />

            {/* Image Upload Input (Available for both Create and Edit) */}
            <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-semibold">
                    {editing ? "Change Image (Optional)" : "Upload Image File"}
                </label>

                {editing && existing?.img && (
                    <div className="flex items-center gap-2 mb-1">
                        <img src={existing.img} alt="Current" className="h-10 w-16 object-cover rounded border" />
                        <span className="text-xs text-gray-400">Current image will be kept if no new file is chosen.</span>
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImgFile(e.target.files[0])}
                    required={!editing} // Required only on create, optional on edit
                />
            </div>
            <label className="text-xs font-semibold text-gray-500">Project date</label>
            <input type="date" value={projectDate} onChange={(e) => setProjectDate(e.target.value)} />

            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Gallery images (optional, pick several)</label>

                {keptImages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {keptImages.map((url) => (
                            <div key={url} className="relative">
                                <img src={url} alt="" className="h-14 w-20 rounded border object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setKeptImages(keptImages.filter((u) => u !== url))}
                                    className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-xs text-white"
                                    aria-label="Remove image"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setNewFiles(Array.from(e.target.files))}
                />
                {newFiles.length > 0 && <span className="text-xs text-gray-400">{newFiles.length} new image(s) will be added.</span>}
            </div>

            <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="work">Work</option>
                <option value="project">Project</option>
            </select>

            <input type="text" placeholder="Status of project" value={status} onChange={(e) => setStatus(e.target.value)} />
            <input
                type="number"
                placeholder="Display order (1 = first)"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
            />
            <input type="text" placeholder="Link" value={href} onChange={(e) => setHref(e.target.value)} />

            <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                    {loading ? (editing ? "Saving..." : "Submitting...") : editing ? "Save changes" : "Submit Experience"}
                </button>
                {editing && (
                    <button type="button" onClick={onCancel} className="rounded border px-4 hover:bg-gray-100">
                        Cancel
                    </button>
                )}
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
    );
}

export function CreateSkill({ onSuccess }) {
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/skills", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            const data = await res.json();

            if (res.ok) {
                setName("");
                if (onSuccess) onSuccess();
            } else {
                setError(data.message || "Failed to add skill");
            }
        } catch (err) {
            setError("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md rounded bg-white p-4 shadow">
            <h2 className="text-xl font-bold">Add a Skill</h2>
            <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
                <input
                    type="text"
                    value={name}
                    placeholder="Next.js"
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 rounded border p-2"
                    required
                />
                <button type="submit" disabled={loading} className="rounded bg-blue-500 px-4 text-white hover:bg-blue-600">
                    {loading ? "Adding..." : "Add"}
                </button>
            </form>
            {error && <p className="mt-2 text-red-500">{error}</p>}
        </div>
    );
}


function Dashboard({ projects, skills }) {
    const [s, setS] = useState(null);
    const [err, setErr] = useState("");

    useEffect(() => {
        fetch("/api/stats", { cache: "no-store" })
            .then(async (r) => {
                const d = await r.json();
                r.ok ? setS(d) : setErr(d.message || "Failed to load stats");
            })
            .catch(() => setErr("Something went wrong"));
    }, []);

    if (err)
        return (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {err}
            </p>
        );
    if (!s) return <p className="text-sm text-gray-500">Loading dashboard...</p>;

    const max = Math.max(1, ...s.days.map((d) => d.visits));
    const cards = [
        ["Visits (30d)", s.visits30],
        ["Unique visitors (30d)", s.unique30],
        ["Project opens (30d)", s.opens30],
        ["Endorsements", s.endorsements],
        ["Projects", projects],
        ["Skills", skills],
    ];

    const List = ({ title, rows }) => (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 text-xs uppercase tracking-widest text-gray-500">{title}</h3>
            {rows.length === 0 ? (
                <p className="text-sm text-gray-400">No data yet.</p>
            ) : (
                <ul className="divide-y divide-gray-100 text-sm">
                    {rows.map((r) => (
                        <li key={r.name} className="flex justify-between py-2">
                            <span className="truncate pr-3 text-gray-700">{r.name}</span>
                            <b className="text-black">{r.count}</b>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    return (
        <div className="space-y-6 text-black">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {cards.map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5">
                        <p className="text-xs uppercase tracking-widest text-gray-500">{label}</p>
                        <p className="mt-2 text-4xl font-extrabold leading-none tracking-tight">
                            {value}
                            <span className="text-red-500">.</span>
                        </p>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="mb-4 text-xs uppercase tracking-widest text-gray-500">Visits, last 14 days</h3>
                <div className="flex h-40 items-end gap-1.5">
                    {s.days.map((d, i) => {
                        const last = i === s.days.length - 1;
                        return (
                            <div key={d.day} className="group flex h-full flex-1 flex-col justify-end" title={`${d.day}: ${d.visits}`}>
                                <span className={`text-center text-[10px] ${last ? "font-semibold text-black" : "text-gray-400"}`}>{d.visits}</span>
                                <div
                                    className={`rounded-t transition-colors ${last ? "bg-red-500" : "bg-gray-200 group-hover:bg-red-400"}`}
                                    style={{ height: `${(d.visits / max) * 100}%`, minHeight: 2 }}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-gray-500">
                    <span>{s.days[0].day.slice(5)}</span>
                    <span>{s.days[s.days.length - 1].day.slice(5)}</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <List title="Most opened projects" rows={s.topProjects} />
                <List title="Most endorsed skills" rows={s.topSkills} />
                <List title="Visitor countries" rows={s.countries} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <List title="Devices" rows={s.devices || []} />
                <List title="Browsers" rows={s.browsers || []} />
            </div>
        </div>
    );
}

export default function Admin() {
    const [view, setView] = useState("dashboard");
    const [addOpen, setAddOpen] = useState(false);
    const [editing, setEditing] = useState(null); // the experience item being edited
    const [contents, setContents] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loadingSkills, setLoadingSkills] = useState(true);

    const fetchAllExp = async () => {
        try {
            const res = await fetch("/api/projectandwork", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();

            if (res.ok) {
                setContents(data.fetchAll || data || []);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    const fetchSkills = async () => {
        try {
            const res = await fetch("/api/skills", { cache: "no-store" });
            const data = await res.json();

            if (res.ok) {
                setSkills(data.skills || data || []);
            }
        } catch (error) {
            console.error("Skills fetch error:", error);
        } finally {
            setLoadingSkills(false);
        }
    };

    useEffect(() => {
        fetchAllExp();
        fetchSkills();
    }, []);

    const switchView = (v) => {
        setView(v);
        setAddOpen(false);
        setEditing(null);
    };


    const nav = [
        ["dashboard", "Dashboard", BiBarChartAlt2, null],
        ["experience", "Experience", BiBriefcase, contents.length],
        ["skills", "Skills", SiSkillshare, skills.length],
    ];

    const startEdit = (item) => {
        setAddOpen(false);
        setEditing(item);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDeleteExp = async (item) => {
        if (!confirm(`Delete "${item.title}"? This can't be undone.`)) return;

        try {
            const res = await fetch(`/api/projectandwork/${item.id}`, { method: "DELETE" });
            const data = await res.json();

            if (res.ok) {
                if (editing?.id === item.id) setEditing(null);
                fetchAllExp();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Something went wrong while deleting.");
        }
    };

    const handleDelete = async (skillName) => {
        if (!confirm(`Delete the skill "${skillName}"?`)) return;

        try {
            const res = await fetch(`/api/skills/${encodeURIComponent(skillName)}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: skillName }),
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message);
                fetchSkills();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Something went wrong while deleting.");
        }
    };

    const formOpen = addOpen || !!editing;

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
            {/* SIDEBAR (a top tab strip on phones) */}
            <aside className="flex gap-2 border-b bg-white p-3 md:min-h-screen md:w-56 md:flex-col md:border-b-0 md:border-r md:p-4">
                <h1 className="hidden px-2 pb-3 text-lg font-bold md:block">Admin</h1>
                {nav.map(([key, label, Icon, count]) => (
                    <button
                        key={key}
                        onClick={() => switchView(key)}
                        aria-current={view === key ? "page" : undefined}
                        className={`flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium md:flex-none ${view === key ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                            }`}
                    >
                        <Icon className="text-xl" />
                        {label}
                        {count !== null && (
                            <span className="ml-auto rounded-full bg-black/10 px-2 text-xs">{count}</span>
                        )}
                    </button>
                ))}
            </aside>

            {/* MAIN */}
            <main className="flex-1 p-6">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">
                        {view === "dashboard" ? "Dashboard" : view === "experience" ? "Experience" : "Skills"}
                    </h1>
                    {view !== "dashboard" && (
                        <button
                            onClick={() => {
                                if (editing) setEditing(null);
                                else setAddOpen(!addOpen);
                            }}
                            className="flex cursor-pointer items-center gap-2 rounded-md bg-gray-200 p-2 transition active:scale-95"
                        >
                            <span>{formOpen ? "Close Form" : view === "experience" ? "Add Experience" : "Add New Skill"}</span>
                            {view === "experience" ? (
                                <FcAddDatabase size={30} />
                            ) : (
                                <BiCodeBlock size={30} className="text-green-500" />
                            )}
                        </button>
                    )}
                </div>

                {view === "dashboard" && <Dashboard projects={contents.length} skills={skills.length} />}

                {/* EXPERIENCE */}
                {view === "experience" && (
                    <>
                        {addOpen && !editing && (
                            <div className="mb-6">
                                <CreateEXP
                                    onSuccess={() => {
                                        setAddOpen(false);
                                        fetchAllExp();
                                    }}
                                />
                            </div>
                        )}

                        {editing && (
                            <div className="mb-6">
                                <CreateEXP
                                    key={editing.id}
                                    existing={editing}
                                    onCancel={() => setEditing(null)}
                                    onSuccess={() => {
                                        setEditing(null);
                                        fetchAllExp();
                                    }}
                                />
                            </div>
                        )}

                        {contents.length === 0 && <p className="text-gray-500">No experience added yet.</p>}

                        <div className="grid gap-4">
                            {contents.map((item, index) => (
                                <div
                                    key={item.id || index}
                                    className={`rounded border bg-white p-4 shadow-sm ${editing?.id === item.id ? "ring-2 ring-blue-500" : ""}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2 text-xs">
                                            <span className="rounded bg-gray-100 px-2 py-0.5">{item.mode}</span>
                                            <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700">{item.status}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => startEdit(item)}
                                                aria-label={`Edit ${item.title}`}
                                                title="Edit"
                                                className="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                                            >
                                                <BiEdit size={26} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteExp(item)}
                                                aria-label={`Delete ${item.title}`}
                                                title="Delete"
                                                className="rounded p-1 text-gray-600 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <BiTrash size={26} />
                                            </button>
                                        </div>
                                    </div>

                                    {item.img && (
                                        <img src={item.img} alt="Preview" height={45} width={100} className="m-1 w-full border" />
                                    )}

                                    <h3 className="text-lg font-bold">{item.title}</h3>
                                    <h3 className="text-md font-bold text-gray-800">{item.subtitle}</h3>
                                    <p className="text-sm text-gray-600">{item.summary}</p>
                                    <h1 className="py-1 text-xl font-bold">Details</h1>
                                    <p className="text-sm text-gray-600">{item.details}</p>

                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {stackOf(item.stack).map((t) => (
                                            <span key={t} className="rounded-full border px-2.5 py-0.5 text-xs">{t}</span>
                                        ))}
                                    </div>

                                    <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                                        <span>{item.footerLeft ?? item.footerleft}</span>
                                        <span className="rounded bg-yellow-100 px-2 py-0.5">#{item.display_order}</span>
                                        {item.href && (
                                            <a href={item.href} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 underline">
                                                View
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* SKILLS */}
                {view === "skills" && (
                    <>
                        {addOpen && (
                            <div className="mb-6">
                                <CreateSkill onSuccess={fetchSkills} />
                            </div>
                        )}

                        {loadingSkills ? (
                            <p className="text-gray-500">Loading skills...</p>
                        ) : skills.length === 0 ? (
                            <p className="text-gray-500">No skills added yet.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {skills.map((s, i) => (
                                    <span
                                        key={s.id || i}
                                        className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-xl text-gray-700 shadow-sm"
                                    >
                                        {s.name}
                                        <button
                                            onClick={() => handleDelete(s.name)}
                                            aria-label={`Delete ${s.name}`}
                                            title="Delete skill"
                                            className="grid h-6 w-6 place-items-center rounded-full text-base text-gray-400 hover:bg-red-100 hover:text-red-600"
                                        >
                                            <BiX />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}