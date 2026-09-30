import React, { useState } from 'react';
import { ProduceItem } from '../../types';
import {
  X,
  ShieldCheck,
  Truck,
  Leaf,
  Sparkles,
  QrCode,
  MapPin,
  Clock,
  CheckCircle2,
  ShoppingBasket,
  CreditCard,
  ThermometerSnowflake,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: ProduceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: ProduceItem, quantity: number) => void;
  onOpenTrace?: (batchId: string) => void;
  onDirectCheckout?: (item: ProduceItem, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onOpenTrace,
  onDirectCheckout,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  if (!isOpen || !product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    onAddToCart(product, quantity);
    if (onDirectCheckout) {
      onDirectCheckout(product, quantity);
    }
    onClose();
  };

  const farmerShareAmount = Math.round(product.price * 0.941);
  const logisticsShareAmount = product.price - farmerShareAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 relative">
        {/* Toast feedback */}
        {addedToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-emerald-800 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Added {quantity} {product.unit} to your basket!</span>
          </div>
        )}

        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-emerald-800 font-semibold">{product.origin}</span>
            <span aria-hidden="true">·</span>
            <span>Batch {product.batchId}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-bold">0.00 ppm Tested Pure</span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two Column Layout */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Media & Verified Badges (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-lg">
                {product.badge}
              </div>

              {/* Sub-4°C Cold Chain Tag */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 backdrop-blur-md text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between shadow-xs">
                <span className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px]">
                  <ThermometerSnowflake className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cold-Chain Transit &lt; 4.0°C</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">IoT Verified</span>
              </div>
            </div>

            {/* Farmer Card */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 text-xs space-y-2">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Single-Origin Smallholder
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {product.farmer.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{product.farmer}</h4>
                  <p className="text-[11px] text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-700" />
                    <span>{product.origin}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-emerald-200/50 text-[11px] text-slate-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Harvested: {product.harvestTime}</span>
                </span>
                <span className="font-semibold text-emerald-800">94.1% Direct Sourcing</span>
              </div>
            </div>

            {/* Traceability Link */}
            {onOpenTrace && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTrace(product.batchId);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>Verify Soil Health &amp; Lab Data on Chain</span>
              </button>
            )}
          </div>

          {/* Right Column: Detailed Overview & Actions (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-emerald-800 capitalize tracking-wide">
                  {product.category} · Single-Origin Produce
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Grown using certified organic NPOP regenerative farming methods. Free from chemical pesticides, artificial waxes, or carbide ripening agents. Transported under continuous solar refrigeration directly to your city hub.
                </p>
              </div>

              {/* Price & Escrow Transparency Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-extrabold text-slate-900">₹{product.price}</span>
                    <span className="text-sm font-normal text-slate-500"> / {product.unit}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                    94.1% to Smallholder
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Farmer Share</span>
                    <span className="font-bold text-emerald-800">₹{farmerShareAmount} (Direct Escrow)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Reefer Transit &amp; QA</span>
                    <span className="font-medium text-slate-700">₹{logisticsShareAmount}</span>
                  </div>
                </div>
              </div>

              {/* Purity & Accreditation Checklist */}
              <div className="space-y-1.5 text-xs text-slate-700">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Guaranteed Standards
                </span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Residue Tested:</strong> 0.00 ppm pesticide limits certified by SGS India</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Smart Escrow:</strong> Funds released only after your doorstep crate inspection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Zero Intermediaries:</strong> Straight from farm gate to consumer crate</span>
                </div>
              </div>
            </div>

            {/* Purchase Controls */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">Quantity:</span>
                <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-0.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-white rounded-lg transition font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-slate-900 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-white rounded-lg transition font-bold text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-500">
                  Total: <strong className="text-slate-900">₹{product.price * quantity}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
                >
                  <ShoppingBasket className="w-4 h-4" />
                  <span>Add to Basket</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Lock in Escrow</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
