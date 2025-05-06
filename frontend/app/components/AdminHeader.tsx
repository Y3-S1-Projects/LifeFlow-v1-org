import { Heart, Search, User, LogOut } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface Section {
  title: string;
  range: [number, number];
}

interface AdminHeaderProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  tabData: Tab[];
  sections: Section[];
}

export const AdminHeader = ({
  activeTab,
  setActiveTab,
  tabData,
  sections,
}: AdminHeaderProps) => {
  return (
    <div className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-200 shadow-md">
      <div className="p-5 bg-gradient-to-r from-red-600 to-red-700">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Heart className="mr-2 h-6 w-6 fill-white" /> LifeFlow
        </h2>
      </div>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 text-sm border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 focus:outline-none"
          />
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        {sections.map(({ title, range }, index) => (
          <div key={index} className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              {title}
            </p>
            <ul className="space-y-1">
              {tabData.slice(range[0], range[1]).map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-red-50 to-red-100 text-red-700 font-medium shadow-sm"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`mr-3 ${
                        activeTab === tab.id ? "text-red-600" : "text-gray-400"
                      }`}
                    >
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <span className="ml-auto w-1.5 h-6 rounded-full bg-red-600"></span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white">
            <User className="h-5 w-5" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-800">Admin User</p>
            <p className="text-xs text-gray-500">admin@bloodconnect.org</p>
          </div>
          <LogOut className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};
