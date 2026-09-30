/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveScreen, CartItem, ProduceItem, OrderRecord } from './types';
import { INITIAL_PRODUCE, INITIAL_ORDERS } from './data/mockData';
import {
  Header,
  Footer,
  LandingScreen,
  MarketplaceScreen,
  TraceabilityScreen,
  CommunityScreen,
  CheckoutScreen,
  MyOrdersScreen,
  CustomerProfileScreen,
  CartDrawer,
  TraceModal,
  VideoModal,
  AddressModal,
  EscrowSuccessModal,
  FloatingRolePortalWidget,
  GeminiChatModal,
  GeminiLiveVoiceModal,
  AIFloatingTrigger,
  ProductDetailModal,
  GlobalSearchModal,
} from './components';
import { HackathonRoleBanner } from './components/HackathonRoleBanner';
import { AccessDeniedScreen } from './components/AccessDeniedScreen';
import { FarmerPanel, AdminPanel, SupportPanel } from './panels';
import { firestoreService } from './services/firestoreService';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('landing');
  const [currentAddress, setCurrentAddress] = useState<string>('Bandra West, Mumbai 400050');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [produceList, setProduceList] = useState<ProduceItem[]>(INITIAL_PRODUCE);
  const [selectedProduct, setSelectedProduct] = useState<ProduceItem | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [searchModalAutoVoice, setSearchModalAutoVoice] = useState<boolean>(false);
  const { currentRole, switchRole } = useAuth();

  // Initial cart with 3 items matching user's reference
  const [cart, setCart] = useState<CartItem[]>([
    {
      item: INITIAL_PRODUCE[0], // Organic Shimla Royal Apples (₹220)
      quantity: 1,
    },
    {
      item: INITIAL_PRODUCE[3], // Pure Raw A2 Gir Cow Milk (₹95)
      quantity: 1,
    },
    {
      item: INITIAL_PRODUCE[1], // Nashik Red Vine Tomatoes (₹45)
      quantity: 1,
    },
  ]);

  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('ramesh');

  // Modals & Drawer state
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [activeTraceBatchId, setActiveTraceBatchId] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [isEscrowSuccessOpen, setIsEscrowSuccessOpen] = useState<boolean>(false);
  const [lastPlacedTotal, setLastPlacedTotal] = useState<number>(898.45);
  const [isAIChatOpen, setIsAIChatOpen] = useState<boolean>(false);
  const [isAIVoiceOpen, setIsAIVoiceOpen] = useState<boolean>(false);

  // Fetch real data from Firestore database with real-time listener
  useEffect(() => {
    // Bootstrap Firestore collections with initial production-ready data if needed
    firestoreService.initializeDatabase();

    // Load real produce items
    firestoreService.getProduceItems().then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setProduceList(data);
      }
    }).catch((err) => console.warn('Using fallback produce:', err));

    // Listen to real-time orders in Firestore
    const unsubscribeOrders = firestoreService.listenOrders((realOrders) => {
      if (realOrders && Array.isArray(realOrders) && realOrders.length > 0) {
        setOrders(realOrders);
      }
    });

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, []);

  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleAddToCart = (produce: ProduceItem, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === produce.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === produce.id ? { ...c, quantity: c.quantity + quantity } : c
        );
      }
      return [...prev, { item: produce, quantity }];
    });
  };

  const handleUpdateCartQty = (itemId: string, newQty: number) => {
    setCart((prev) => {
      if (newQty <= 0) {
        return prev.filter((c) => c.item.id !== itemId);
      }
      return prev.map((c) => (c.item.id === itemId ? { ...c, quantity: newQty } : c));
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handlePlaceOrder = async (
    total: number,
    paymentMeta?: { paymentId?: string; orderId?: string; method?: string }
  ) => {
    setLastPlacedTotal(total);

    // Capture items from current cart (or fallback default items if cart was empty)
    const orderItems =
      cart.length > 0
        ? cart.map((c) => ({
            name: c.item.name,
            quantity: c.quantity,
            price: c.item.price,
            farmerName: c.item.farmer,
          }))
        : [
            { name: 'Vine-Ripened Country Tomatoes (3 kg crate)', quantity: 3, price: 45, farmerName: 'Ramesh Patel' },
            { name: 'Hydroponic Baby Spinach (500g)', quantity: 2, price: 40, farmerName: 'Ramesh Patel' },
            { name: 'Organic Shimla Royal Delicious Apples (1 kg)', quantity: 2, price: 220, farmerName: 'Green Valley Orchards' },
            { name: 'Raw Pure A2 Gir Cow Milk (1L Glass Bottle)', quantity: 2, price: 95, farmerName: 'Nandini Pastoral Dairy' },
          ];

    const newOrder: OrderRecord = {
      id: `FD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: 'Today',
      items: orderItems,
      subtotal: Math.round(total * 0.94),
      logisticsFee: 45,
      platformFee: 8.45,
      discount: 0,
      total: total,
      escrowStatus: 'Locked',
      reeferTemp: '3.8°C',
      slot: 'Today 11:30 AM – 1:00 PM',
      driverName: 'Santosh Yadav',
      vanNumber: 'MH-15-EG-4402',
      eta: 'Today 12:45 PM',
      paymentId: paymentMeta?.paymentId,
      razorpayOrderId: paymentMeta?.orderId,
      paymentMethod: paymentMeta?.method || 'Escrow Locked',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setIsEscrowSuccessOpen(true);

    // CRITICAL: Reset product cart card and basket after every order
    setCart([]);
    setIsCartDrawerOpen(false);

    try {
      await firestoreService.saveOrder(newOrder);
      console.log('Order successfully persisted in real Firestore database:', newOrder.id);
    } catch (err) {
      console.error('Failed to sync order to Firestore database:', err);
    }
  };

  const handleReleaseEscrow = async (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, escrowStatus: 'Inspected & Released' } : o))
    );

    try {
      await firestoreService.releaseOrderEscrow(orderId);
      console.log('Escrow release successfully persisted in Firestore for order:', orderId);
    } catch (err) {
      console.error('Failed to sync escrow release to database:', err);
    }
  };

  const handleRateOrder = async (orderId: string, rating: number, reviewComment?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              rating,
              reviewComment: reviewComment !== undefined ? reviewComment : o.reviewComment,
              ratedAt: 'Just now',
            }
          : o
      )
    );

    try {
      await firestoreService.rateOrder(orderId, rating, reviewComment);
      console.log('Order rating persisted in Firestore for order:', orderId);
    } catch (err) {
      console.error('Failed to sync rating to database:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <Header
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        cartCount={cartCount}
        openCartDrawer={() => setIsCartDrawerOpen(true)}
        openAddressModal={() => setIsAddressModalOpen(true)}
        currentAddress={currentAddress}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenSearchModal={() => {
          setIsSearchModalOpen(true);
          setSearchModalAutoVoice(false);
        }}
        onOpenVoiceSearch={() => {
          setIsSearchModalOpen(true);
          setSearchModalAutoVoice(true);
        }}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        onOpenAIVoice={() => setIsAIVoiceOpen(true)}
      />

      {/* Hackathon Role Status Banner & Alerts */}
      <div className="pt-20">
        <HackathonRoleBanner
          activeScreen={activeScreen}
          setActiveScreen={setActiveScreen}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {activeScreen === 'landing' && (
          <LandingScreen
            setActiveScreen={setActiveScreen}
            onAddToCart={handleAddToCart}
            onOpenTrace={(batchId) => setActiveTraceBatchId(batchId)}
            openAddressModal={() => setIsAddressModalOpen(true)}
            currentAddress={currentAddress}
            onSelectProduct={(item) => setSelectedProduct(item)}
          />
        )}

        {activeScreen === 'marketplace' && (
          <MarketplaceScreen
            produceList={produceList}
            cart={cart}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            setActiveScreen={setActiveScreen}
            onOpenTrace={(batchId) => setActiveTraceBatchId(batchId)}
            onOpenCart={() => setIsCartDrawerOpen(true)}
            searchQuery={searchQuery}
            onSelectProduct={(item) => setSelectedProduct(item)}
          />
        )}

        {activeScreen === 'traceability' && (
          <TraceabilityScreen
            setActiveScreen={setActiveScreen}
            onOpenVideo={() => setIsVideoModalOpen(true)}
            onSelectFarmerForChat={(farmerId) => setSelectedFarmerId(farmerId)}
          />
        )}

        {activeScreen === 'community' && (
          <CommunityScreen
            selectedFarmerId={selectedFarmerId}
            setSelectedFarmerId={setSelectedFarmerId}
            onAddToCartDirect={(item, qty) => handleAddToCart(item, qty)}
            onOpenTrace={(batchId) => setActiveTraceBatchId(batchId)}
          />
        )}

        {activeScreen === 'checkout' && (
          <CheckoutScreen
            cart={cart}
            currentAddress={currentAddress}
            openAddressModal={() => setIsAddressModalOpen(true)}
            onPlaceOrder={handlePlaceOrder}
            setActiveScreen={setActiveScreen}
          />
        )}

        {activeScreen === 'orders' && (
          <MyOrdersScreen
            orders={orders}
            onReleaseEscrow={handleReleaseEscrow}
            onRateOrder={handleRateOrder}
            setActiveScreen={setActiveScreen}
          />
        )}

        {activeScreen === 'profile' && (
          <CustomerProfileScreen
            orders={orders}
            currentAddress={currentAddress}
            setActiveScreen={setActiveScreen}
            openAddressModal={() => setIsAddressModalOpen(true)}
          />
        )}

        {activeScreen === 'farmer-panel' && (
          currentRole === 'farmer' ? (
            <div className="max-w-7xl mx-auto px-6 py-6 w-full">
              <FarmerPanel />
            </div>
          ) : (
            <AccessDeniedScreen
              attemptedScreen="farmer-panel"
              requiredRole="farmer"
              requiredRoleName="Farmer Workflow & Dispatch Panel"
              setActiveScreen={setActiveScreen}
            />
          )
        )}

        {activeScreen === 'admin-panel' && (
          currentRole === 'admin' ? (
            <div className="max-w-7xl mx-auto px-6 py-6 w-full">
              <AdminPanel />
            </div>
          ) : (
            <AccessDeniedScreen
              attemptedScreen="admin-panel"
              requiredRole="admin"
              requiredRoleName="Admin Command Center"
              setActiveScreen={setActiveScreen}
            />
          )
        )}

        {activeScreen === 'support-panel' && (
          currentRole === 'support' ? (
            <div className="max-w-7xl mx-auto px-6 py-6 w-full">
              <SupportPanel />
            </div>
          ) : (
            <AccessDeniedScreen
              attemptedScreen="support-panel"
              requiredRole="support"
              requiredRoleName="Customer Support Arbitration Desk"
              setActiveScreen={setActiveScreen}
            />
          )
        )}
      </div>

      {/* Simplified Universal Footer */}
      <Footer setActiveScreen={setActiveScreen} />

      {/* Slide-Over Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onClearCart={handleClearCart}
        setActiveScreen={setActiveScreen}
      />

      {/* Product Detail Page / Inspection Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onOpenTrace={(batchId) => {
          setSelectedProduct(null);
          setActiveTraceBatchId(batchId);
        }}
        onDirectCheckout={() => {
          setSelectedProduct(null);
          setActiveScreen('checkout');
        }}
      />

      {/* Global Instant Search & Voice Type Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => {
          setIsSearchModalOpen(false);
          setSearchModalAutoVoice(false);
        }}
        produceList={produceList}
        autoStartVoice={searchModalAutoVoice}
        onSelectProduce={(item) => {
          setSelectedProduct(item);
          setIsSearchModalOpen(false);
        }}
        onSelectCategory={(cat) => {
          setActiveScreen('marketplace');
          setIsSearchModalOpen(false);
        }}
      />

      {/* Modals */}
      <TraceModal
        batchId={activeTraceBatchId}
        onClose={() => setActiveTraceBatchId(null)}
      />

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        currentAddress={currentAddress}
        onSelectAddress={(addr) => setCurrentAddress(addr)}
      />

      <EscrowSuccessModal
        isOpen={isEscrowSuccessOpen}
        onClose={() => setIsEscrowSuccessOpen(false)}
        orderTotal={lastPlacedTotal}
        setActiveScreen={setActiveScreen}
      />

      {/* Floating Stakeholder Portal Switcher (Non-intrusive role navigation) */}
      <FloatingRolePortalWidget
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
      />

      {/* Gemini Intelligence Chat & Live Voice Modals */}
      <GeminiChatModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        onOpenVoice={() => {
          setIsAIChatOpen(false);
          setIsAIVoiceOpen(true);
        }}
      />

      <GeminiLiveVoiceModal
        isOpen={isAIVoiceOpen}
        onClose={() => setIsAIVoiceOpen(false)}
        onSwitchToChat={() => {
          setIsAIVoiceOpen(false);
          setIsAIChatOpen(true);
        }}
      />

      <AIFloatingTrigger
        onOpenChat={() => setIsAIChatOpen(true)}
        onOpenVoice={() => setIsAIVoiceOpen(true)}
      />
    </div>
  );
}
