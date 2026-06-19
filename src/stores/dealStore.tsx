import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product, PreDeal, getPreDeals, actOnPreDeal as actApi } from "@/lib/api";

interface DealStoreState {
  selectedProductsCart: Product[];
  activePreDeals: PreDeal[];
  isLoadingDeals: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  fetchPreDeals: () => Promise<void>;
  actOnDeal: (dealId: number, action: "accept" | "reject") => Promise<{ status: string }>;
}

const DealContext = createContext<DealStoreState | undefined>(undefined);

export const DealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProductsCart, setSelectedProductsCart] = useState<Product[]>([]);
  const [activePreDeals, setActivePreDeals] = useState<PreDeal[]>([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState<boolean>(false);

  // Re-hydrate persistent cart from LocalStorage
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("tureep_cart") : null;
    if (saved) {
      try {
        setSelectedProductsCart(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const saveCartLocal = (newCart: Product[]) => {
    setSelectedProductsCart(newCart);
    if (typeof window !== "undefined") {
      localStorage.setItem("tureep_cart", JSON.stringify(newCart));
    }
  };

  const addToCart = useCallback(
    (product: Product) => {
      setSelectedProductsCart((prev) => {
        if (prev.find((p) => p.id === product.id)) return prev;
        const next = [...prev, product];
        saveCartLocal(next);
        return next;
      });
    },
    []
  );

  const removeFromCart = useCallback((productId: number) => {
    setSelectedProductsCart((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      saveCartLocal(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    saveCartLocal([]);
  }, []);

  const fetchPreDeals = useCallback(async () => {
    setIsLoadingDeals(true);
    try {
      const deals = await getPreDeals();
      setActivePreDeals(deals);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDeals(false);
    }
  }, []);

  const actOnDeal = async (dealId: number, action: "accept" | "reject") => {
    try {
      const res = await actApi(dealId, action);
      setActivePreDeals((prev) =>
        prev.map((deal) => (deal.id === dealId ? { ...deal, status: action === "accept" ? "accepted" : "rejected" } : deal))
      );
      return res;
    } catch (err: any) {
      throw err;
    }
  };

  return (
    <DealContext.Provider
      value={{
        selectedProductsCart,
        activePreDeals,
        isLoadingDeals,
        addToCart,
        removeFromCart,
        clearCart,
        fetchPreDeals,
        actOnDeal,
      }}
    >
      {children}
    </DealContext.Provider>
  );
};

export const useDealStore = (): DealStoreState => {
  const context = useContext(DealContext);
  if (!context) {
    throw new Error("useDealStore must be used within an accredited DealProvider.");
  }
  return context;
};
