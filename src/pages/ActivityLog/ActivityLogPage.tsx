import { useState } from "react";
import { useAuth } from "../../services/AuthContext";
import { useGetActivityLogsByCreatedByQuery } from "../../services/activityLogApi";
import { useGetProjectsByAccountQuery } from "../../services/accountApi";
import { ChevronLeft, ChevronRight, Clock, User, Folder } from "lucide-react";

export default function ActivityLogPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const { data: logs, isLoading, error } = useGetActivityLogsByCreatedByQuery(userId!, {
    skip: !userId,
  });

  const { data: projectsData } = useGetProjectsByAccountQuery(user?.accessToken || "", {
    skip: !user?.accessToken,
  });

  const projectMap = new Map<number, string>();
  projectsData?.data?.forEach((proj: any) => {
    projectMap.set(proj.projectId, proj.projectName);
  });

  // Filter state
  const [selectedProject, setSelectedProject] = useState<number | "all">("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter logs
  const filteredLogs =
    selectedProject === "all"
      ? logs
      : logs?.filter((log) => log.projectId === selectedProject);

  const totalItems = filteredLogs?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentLogs = filteredLogs?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading)
    return <div className="flex justify-center items-center min-h-[60vh]">Loading logs...</div>;
  if (error)
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-red-500">
        Error loading logs
      </div>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header + Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📑 My Activity Logs
        </h1>

        <select
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          value={selectedProject}
          onChange={(e) =>
            setSelectedProject(
              e.target.value === "all" ? "all" : Number(e.target.value)
            )
          }
        >
          <option value="all">All Projects</option>
          {projectsData?.data?.map((proj: any) => (
            <option key={proj.projectId} value={proj.projectId}>
              {proj.projectName}
            </option>
          ))}
        </select>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {currentLogs?.map((log) => (
          <div
            key={log.id}
            className="bg-white shadow-md rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-shadow w-full"
          >
            {/* Message */}
            <div className="text-gray-800 font-medium mb-3 text-lg">
              {log.message}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />{" "}
                {new Date(log.createdAt).toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" /> {log.createdByName}
              </div>
              <div className="flex items-center gap-1">
                <Folder className="w-4 h-4 text-pink-500" />{" "}
                {projectMap.get(log.projectId) ?? "Unknown Project"}
              </div>
            </div>
          </div>
        ))}

        {!currentLogs?.length && (
          <div className="text-center text-gray-500 text-sm py-10">
            No activity logs found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            className="px-3 py-1 rounded-md border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded-md border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
