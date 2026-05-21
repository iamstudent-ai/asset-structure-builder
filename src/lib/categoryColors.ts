interface CategoryStyle {
  bg: string;
  text: string;
  border: string;
  icon: string;
}

/** Returns soft, modern Tailwind classes for a given asset category */
export const getCategoryStyle = (category: string): CategoryStyle => {
  const key = category.trim();
  switch (key) {
    case "Access Points":
      return { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", icon: "text-sky-600" };
    case "AIO":
      return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", icon: "text-indigo-600" };
    case "Analogue Telephone":
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "text-amber-600" };
    case "Biometric":
      return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: "text-purple-600" };
    case "CCTV Camera":
      return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "text-red-600" };
    case "Desktop":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "text-emerald-600" };
    case "Firewall":
      return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: "text-rose-600" };
    case "IP Telephone":
      return { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", icon: "text-cyan-600" };
    case "Laptop":
      return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "text-blue-600" };
    case "Mobile":
      return { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", icon: "text-teal-600" };
    case "Monitor":
      return { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", icon: "text-violet-600" };
    case "NAS":
      return { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", icon: "text-slate-600" };
    case "Network Drive":
      return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: "text-gray-600" };
    case "NVR CCTV":
      return { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", icon: "text-pink-600" };
    case "PABX":
      return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "text-orange-600" };
    case "Portable SSD":
      return { bg: "bg-lime-50", text: "text-lime-700", border: "border-lime-200", icon: "text-lime-600" };
    case "Printer":
      return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: "text-yellow-600" };
    case "Projector":
      return { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200", icon: "text-fuchsia-600" };
    case "Router":
      return { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-300", icon: "text-teal-700" };
    case "Server":
      return { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300", icon: "text-orange-700" };
    case "Switch":
      return { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-300", icon: "text-slate-700" };
    case "Tablet":
      return { bg: "bg-sky-100", text: "text-sky-800", border: "border-sky-300", icon: "text-sky-700" };
    case "TV":
      return { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300", icon: "text-purple-700" };
    case "WiFi":
      return { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-300", icon: "text-cyan-700" };
    default:
      return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: "text-gray-600" };
  }
};
