import React from 'react';
import { CartItem, ActiveScreen } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (itemId: string, newQty: number) => void;
  onClearCart: () => void;
  setActiveScreen: (screen: ActiveScreen) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onClearCart,
  setActiveScreen,
}) => {
  if (!isOpen) return null;

  const totalItems = cart.reduce((acc, c) => acc + c.quantity, 0);
  const subtotal = cart.reduce((acc, c) => acc + c.item.price * c.quantity, 0);
  const growerShare = (subtotal * 0.99).toFixed(2);
  const platformFee = (subtotal * 0.01).toFixed(2);

  const handleProceed = () => {
    onClose();
    setActiveScreen('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">shopping_basket</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Harvest Basket</h3>
                <p className="text-xs text-slate-500">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} · Direct from smallholders
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg hover:bg-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
              aria-label="Close cart"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl">shopping_cart</span>
                </div>
                <h4 className="font-medium text-slate-900 mb-1">Your basket is empty</h4>
                <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
                  Explore today's morning harvest and connect directly with certified regional growers.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    setActiveScreen('marketplace');
                  }}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                  Browse Fresh Lots
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                  <span>Farm produce</span>
                  <button
                    onClick={onClearCart}
                    className="text-rose-600 hover:text-rose-700 font-medium hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-3">
                  {cart.map((cartItem) => (
                    <div
                      key={cartItem.item.id}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200/70 flex items-center gap-3 transition-colors"
                    >
                      <img
                        src={cartItem.item.imageUrl}
                        alt={cartItem.item.name}
                        className="w-16 h-16 rounded-lg object-cover bg-slate-200 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-semibold text-slate-900 text-sm truncate">
                            {cartItem.item.name}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {cartItem.item.origin} · {cartItem.item.farmer}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-slate-900 text-sm">
                            ₹{cartItem.item.price * cartItem.quantity}
                            <span className="text-xs font-normal text-slate-500 ml-1">
                              (₹{cartItem.item.price}/{cartItem.item.unit})
                            </span>
                          </span>

                          {/* Stepper */}
                          <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-xs">
                            <button
                              onClick={() => onUpdateQty(cartItem.item.id, cartItem.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-l-lg transition-colors font-bold"
                              title="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-slate-900">
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQty(cartItem.item.id, cartItem.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-r-lg transition-colors font-bold"
                              title="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Direct-to-Grower Escrow Guarantee Box */}
                <div className="mt-6 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-emerald-700">handshake</span>
                      Direct Escrow Model
                    </span>
                    <span className="text-emerald-800">99% Grower Split</span>
                  </div>

                  {/* Split bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex mb-2">
                    <div className="bg-emerald-600 h-full w-[99%]" title="99% to Farmer"></div>
                    <div className="bg-amber-500 h-full w-[1%]" title="1% Platform Tech"></div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>
                      Grower direct: <strong className="text-emerald-800 font-bold">₹{growerShare}</strong>
                    </span>
                    <span>
                      Platform fee (1%): <strong className="text-slate-800 font-bold">₹{platformFee}</strong>
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-slate-200 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 block uppercase tracking-wider font-medium">Subtotal</span>
                  <span className="text-2xl font-bold text-slate-900">₹{subtotal}</span>
                </div>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  ✓ Free Cold-Chain Delivery
                </span>
              </div>

              <button
                onClick={handleProceed}
                className="w-full py-3.5 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-sm"
              >
                <span>Proceed to Escrow Checkout</span>
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </button>

              <p className="text-[11px] text-center text-slate-400">
                Payment held securely in RBI escrow until quality acceptance at doorstep.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
