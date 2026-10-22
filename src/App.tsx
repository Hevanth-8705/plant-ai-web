import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { MyPlantsPage } from './pages/MyPlantsPage.tsx';
import { PlantDetailsPage } from './pages/PlantDetailsPage.tsx';
import { WateringCalendarPage } from './pages/WateringCalendarPage.tsx';
import { FertilizerPlannerPage } from './pages/FertilizerPlannerPage.tsx';
import { GrowthTrackerPage } from './pages/GrowthTrackerPage.tsx';
import { SunlightCheckerPage } from './pages/SunlightCheckerPage.tsx';
import { DiseaseDetectionPage } from './pages/DiseaseDetectionPage.tsx';
import { HarvestPlannerPage } from './pages/HarvestPlannerPage.tsx';
import { PlantDiaryPage } from './pages/PlantDiaryPage.tsx';
import { GardenerLevelPage } from './pages/GardenerLevelPage.tsx';
import { EncyclopediaPage } from './pages/EncyclopediaPage.tsx';
import { AIChatPage } from './pages/AIChatPage.tsx';
import { NotificationsPage } from './pages/NotificationsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { InventoryPage } from './pages/InventoryPage.tsx';
import { WishlistPage } from './pages/WishlistPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { AddPlantModal } from './components/plants/AddPlantModal.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { Plant } from './types/index.ts';
import { Sprout, Compass } from 'lucide-react';
import { Button } from './components/common/Button.tsx';

function MainApp() {
  const { user, isAuthenticated } = useAuth();

  // Read initial path
  const getInitialPage = () => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/login') return 'login';
    if (path === '/register') return 'register';
    if (path === '/landing') return 'landing';
    return 'dashboard';
  };

  const [activePage, setActivePage] = useState<string>(getInitialPage);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [diagnosePlant, setDiagnosePlant] = useState<Plant | null>(null);
  const [showAddPlantModal, setShowAddPlantModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Sync URL changes with browser history
  const navigateTo = (page: string) => {
    setActivePage(page);
    if (page !== 'plant_details') setSelectedPlant(null);
    const newPath = page === 'dashboard' ? '/' : `/${page}`;
    window.history.pushState(null, '', newPath);
  };

  // Handle browser back / forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/login') setActivePage('login');
      else if (path === '/register') setActivePage('register');
      else if (path === '/landing') setActivePage('landing');
      else setActivePage('dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    navigateTo(mode);
  };

  const handleSelectPlant = (plant: Plant) => {
    setSelectedPlant(plant);
    setActivePage('plant_details');
  };

  const handleEditPlant = (plant: Plant) => {
    setEditingPlant(plant);
    setShowAddPlantModal(true);
  };

  const handleDiagnosePlant = (plant: Plant) => {
    setDiagnosePlant(plant);
    navigateTo('disease');
  };

  // Dedicated 3D Login Page Route
  if (activePage === 'login') {
    return (
      <LoginPage
        onSuccess={() => navigateTo('dashboard')}
        onNavigateRegister={() => navigateTo('register')}
        onNavigateHome={() => navigateTo('landing')}
      />
    );
  }

  // Dedicated 3D Registration Page Route
  if (activePage === 'register') {
    return (
      <RegisterPage
        onSuccess={() => navigateTo('dashboard')}
        onNavigateLogin={() => navigateTo('login')}
        onNavigateHome={() => navigateTo('landing')}
      />
    );
  }

  // If viewing landing page
  if (activePage === 'landing') {
    return (
      <LandingPage
        onEnterGarden={() => navigateTo('dashboard')}
        onOpenAuth={(mode) => navigateTo(mode)}
      />
    );
  }

  // Valid app page identifiers
  const validPages = [
    'dashboard',
    'plants',
    'plant_details',
    'watering',
    'fertilizer',
    'growth',
    'sunlight',
    'disease',
    'harvest',
    'diary',
    'chat',
    'notifications',
    'settings',
    'level',
    'encyclopedia',
    'inventory',
    'wishlist',
  ];

  // Polished 404 Page for Invalid Authentication or App Routes
  if (!validPages.includes(activePage)) {
    return (
      <div className="min-h-screen bg-[#102A20] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-800/60 border border-emerald-500/30 flex items-center justify-center mb-4 shadow-xl">
          <Compass className="w-8 h-8 text-emerald-300 animate-spin" style={{ animationDuration: '10s' }} />
        </div>
        <h1 className="text-3xl font-bold font-serif text-[#F7F5EC]">Lost in the Garden (404)</h1>
        <p className="text-xs sm:text-sm text-stone-300 max-w-sm mt-2 leading-relaxed">
          The botanical route you followed doesn't exist or has returned to nature.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <Button variant="secondary" onClick={() => navigateTo('dashboard')}>
            Return to Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigateTo('login')} className="text-white border-white/20">
            Go to 3D Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] text-stone-900 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        onOpenAddPlant={() => {
          setEditingPlant(null);
          setShowAddPlantModal(true);
        }}
        activePage={activePage}
        onNavigate={navigateTo}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activePage={activePage}
          onNavigate={navigateTo}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activePage === 'dashboard' && (
            <DashboardPage
              onNavigate={navigateTo}
              onOpenAddPlant={() => {
                setEditingPlant(null);
                setShowAddPlantModal(true);
              }}
              onSelectPlant={handleSelectPlant}
            />
          )}

          {activePage === 'plants' && (
            <MyPlantsPage
              onOpenAddPlant={() => {
                setEditingPlant(null);
                setShowAddPlantModal(true);
              }}
              onSelectPlant={handleSelectPlant}
            />
          )}

          {activePage === 'plant_details' && selectedPlant && (
            <PlantDetailsPage
              plantId={selectedPlant.id}
              onBack={() => navigateTo('plants')}
              onEdit={handleEditPlant}
              onDiagnose={handleDiagnosePlant}
            />
          )}

          {activePage === 'watering' && (
            <WateringCalendarPage onSelectPlant={handleSelectPlant} />
          )}

          {activePage === 'fertilizer' && (
            <FertilizerPlannerPage />
          )}

          {activePage === 'growth' && (
            <GrowthTrackerPage />
          )}

          {activePage === 'sunlight' && (
            <SunlightCheckerPage />
          )}

          {activePage === 'disease' && (
            <DiseaseDetectionPage
              initialPlant={diagnosePlant}
              onClearInitialPlant={() => setDiagnosePlant(null)}
            />
          )}

          {activePage === 'harvest' && (
            <HarvestPlannerPage />
          )}

          {activePage === 'diary' && (
            <PlantDiaryPage />
          )}

          {activePage === 'chat' && (
            <AIChatPage />
          )}

          {activePage === 'notifications' && (
            <NotificationsPage onNavigate={navigateTo} />
          )}

          {activePage === 'settings' && (
            <SettingsPage />
          )}

          {activePage === 'level' && (
            <GardenerLevelPage user={user} onNavigate={navigateTo} />
          )}
          {activePage === 'encyclopedia' && (
            <EncyclopediaPage
              onNavigate={navigateTo}
              onOpenAddPlantWithData={(plantData) => {
                setEditingPlant(plantData);
                setShowAddPlantModal(true);
              }}
            />
          )}
          {activePage === 'inventory' && (
            <InventoryPage />
          )}
          {activePage === 'wishlist' && (
            <WishlistPage />
          )}
        </main>
      </div>

      {/* Add / Edit Plant Modal */}
      <AddPlantModal
        isOpen={showAddPlantModal}
        onClose={() => {
          setShowAddPlantModal(false);
          setEditingPlant(null);
        }}
        onSuccess={(plant) => {
          setSelectedPlant(plant);
        }}
        initialPlant={editingPlant}
      />

      {/* Auth Modal for Quick Overlay */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}
