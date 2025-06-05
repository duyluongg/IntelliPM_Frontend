import type { FC } from "react"
import { FaCalendarAlt, FaFileAlt, FaUsers, FaVideo, FaComments, FaCheckCircle } from "react-icons/fa"
import { Link, useLocation } from "react-router-dom"
import { useLogoutMutation } from "../../services/authApi";
import { useNavigate } from "react-router-dom";
const menuItems = [
  { name: "Tạo & Lên Lịch Cuộc Họp", icon: <FaCalendarAlt />, route: "/pm/meeting-room" },

]

const SidebarPM: FC = () => {
  const location = useLocation()
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token found");
      await logout({ refreshToken }).unwrap();
      localStorage.removeItem("accessToken"); // Xóa accessToken
      localStorage.removeItem("refreshToken"); // Xóa refreshToken
      navigate("/");
    } catch (error) {
      alert("Logout thất bại!");
    }
  };
  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col shadow-lg">
      <div className="p-4 text-lg font-bold border-b border-gray-700">
        📋 Quản lý Dự án
      </div>
      <nav className="flex-1 overflow-y-auto">
        {menuItems.map((item, index) => (
          <Link
            to={item.route}
            key={index}
            className={`flex items-center gap-3 p-4 hover:bg-gray-700 transition duration-150 ${
              location.pathname === item.route ? "bg-gray-700" : ""
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="p-4 border-t border-gray-700 text-sm text-red-400 hover:bg-gray-700 transition duration-150 text-left"
      >
        Đăng xuất
      </button>
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        © 2025 YourCompany
      </div>
    </div>
  )
}

export default SidebarPM
