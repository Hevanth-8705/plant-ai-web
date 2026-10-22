import React from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  Droplets, 
  FlaskConical, 
  TrendingUp, 
  Sun, 
  Stethoscope, 
  Apple, 
  BookOpen, 
  Bot, 
  Bell, 
  Settings, 
  Sparkles, 
  Trophy,
  Package,
  Star 
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeCount?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { unreadCount } = useNotifications();

  const navSections: NavSection[] = [
    {
      title: 'Garden Core',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'plants', label: 'My Plants', icon: <Sprout className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Care Schedules',
      items: [
        { id: 'watering', label: 'Watering Calendar', icon: <Droplets className="w-4 h-4" /> },
        { id: 'fertilizer', label: 'Fertilizer Planner', icon: <FlaskConical className="w-4 h-4" /> },
        { id: 'sunlight', label: 'Sunlight Checker', icon: <Sun className="w-4 h-4" /> },
      ],
    },
    {
      title: 'AI & Intelligence',
      items: [
        { 
          id: 'chat', 
          label: 'PlantPal AI Chat', 
          icon: <Bot className="w-4 h-4" />, 
          badge: 'Smart' 
        },
        { 
          id: 'disease', 
          label: 'Disease Detection', 
          icon: <Stethoscope className="w-4 h-4" />, 
          badge: 'Vision AI' 
        },
        { 
          id: 'encyclopedia', 
          label: 'Plant Encyclopedia', 
          icon: <BookOpen className="w-4 h-4" />, 
          badge: 'Grounded' 
        },
      ],
    },
    {
      title: 'Tracking & Records',
      items: [
        { id: 'growth', label: 'Growth Tracker', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'harvest', label: 'Harvest Planner', icon: <Apple className="w-4 h-4" /> },
        { id: 'diary', label: 'Plant Diary', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'inventory', label: 'Inventory Manager', icon: <Package className="w-4 h-4" /> },
        { id: 'wishlist', label: 'Plant Wishlist', icon: <Star className="w-4 h-4" /> },
        { id: 'level', label: 'Gardener Level & Badges', icon: <Trophy className="w-4 h-4" />, badge: 'Rank 3' },
      ],
    },
    {
      title: 'System',
      items: [
        { 
          id: 'notifications', 
          label: 'Notifications', 
          icon: <Bell className="w-4 h-4" />, 
          badgeCount: unreadCount 
        },
        { id: 'settings', label: 'Settings & Data', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-stone-50/70 border-r border-stone-200/80 p-4 overflow-y-auto">
      {/* Navigation Sections */}
      <div className="space-y-6 flex-1">
        {navSections.map((sec) => (
          <div key={sec.title}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-600 px-3 mb-2 font-mono">
              {sec.title}
            </p>
            <div className="space-y-1">
              {sec.items.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-xs shadow-emerald-800/20'
                        : 'text-stone-700 hover:bg-stone-200/60 hover:text-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? 'text-white' : 'text-stone-500'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-emerald-900/60 text-emerald-100'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-rose-600 text-white">
                        {item.badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pro Botanical Tip Box */}
      <div className="mt-6 p-3.5 bg-gradient-to-br from-emerald-800 to-emerald-900 text-white rounded-2xl shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span className="text-xs font-bold text-emerald-100">Gardener's Rule</span>
        </div>
        <p className="text-[11px] text-emerald-100/90 leading-relaxed">
          "Check soil moisture with your finger 2 inches deep before watering on schedule."
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop permanent sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-61px)] sticky top-[61px]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-white z-10 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
