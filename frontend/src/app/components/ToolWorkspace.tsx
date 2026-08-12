"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

interface ToolWorkspaceValue {
  jobDescription: string;
  setJobDescription: Dispatch<SetStateAction<string>>;
  resumeText: string;
  setResumeText: Dispatch<SetStateAction<string>>;
  clear: () => void;
}

const ToolWorkspaceContext = createContext<ToolWorkspaceValue | null>(null);

export function ToolWorkspaceProvider({
  children,
  initialResumeText = "",
}: {
  children: ReactNode;
  initialResumeText?: string;
}) {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState(initialResumeText);

  return (
    <ToolWorkspaceContext.Provider
      value={{
        jobDescription,
        setJobDescription,
        resumeText,
        setResumeText,
        clear: () => {
          setJobDescription("");
          setResumeText("");
        },
      }}
    >
      {children}
    </ToolWorkspaceContext.Provider>
  );
}

export function useWorkspaceJobDescription(): [
  string,
  Dispatch<SetStateAction<string>>,
  boolean,
] {
  const workspace = useContext(ToolWorkspaceContext);
  const [localValue, setLocalValue] = useState("");
  return workspace
    ? [workspace.jobDescription, workspace.setJobDescription, true]
    : [localValue, setLocalValue, false];
}

export function useWorkspaceResumeText(): [
  string,
  Dispatch<SetStateAction<string>>,
  boolean,
] {
  const workspace = useContext(ToolWorkspaceContext);
  const [localValue, setLocalValue] = useState("");
  return workspace
    ? [workspace.resumeText, workspace.setResumeText, true]
    : [localValue, setLocalValue, false];
}

export function ToolWorkspaceStatus() {
  const workspace = useContext(ToolWorkspaceContext);
  if (!workspace) return null;

  const hasJobDescription = Boolean(workspace.jobDescription.trim());
  const hasResume = Boolean(workspace.resumeText.trim());

  return (
    <aside
      aria-label="Shared tool inputs"
      className="rounded-2xl border border-indigo-200/80 bg-indigo-50/70 px-5 py-4 dark:border-indigo-800 dark:bg-indigo-950/30"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            One working set for steps 1–3
          </p>
          <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
            Enter each item once and it carries forward while this page is open. This
            feature does not save the text.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <StatusPill ready={hasJobDescription} label="Job description" />
          <StatusPill ready={hasResume} label="Resume" />
          {(hasJobDescription || hasResume) && (
            <button
              type="button"
              onClick={workspace.clear}
              className="rounded-full px-3 py-1.5 font-medium text-gray-600 underline decoration-gray-300 underline-offset-4 transition hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-gray-300 dark:hover:text-white"
            >
              Clear both
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

function StatusPill({ ready, label }: { ready: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-medium ${
        ready
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
          : "border-gray-200 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${ready ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`}
      />
      {label}: {ready ? "ready" : "not added"}
    </span>
  );
}
