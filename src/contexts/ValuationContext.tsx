import { createContext, useContext, useState, type ReactNode } from "react";

const DW = [10,10,5,5,5,5,7,3,5,5,5,2.5,2.5,2.5,2.5,5,5,2.5,2.5,2.5,2.5,2.5,2.5];
const FA = [3,3,2,2,3,4,5,2,1,2,1,1,2,5,2,1,3,2,2,2,2];
const FB = [2,2,2,2,2,2,2,2,5,5,5,5,5,5,4,3,2,3,2,4,4];
const FC = [1,2,2,1,3,2,1,1,3,2,4,1,2,5,2,2,3,4,3,5,3];

interface ValuationContextType {
  weights: number[];
  setWeights: (w: number[]) => void;
  firmScores: number[][];
  setFirmScores: (s: number[][]) => void;
  firmNames: string[];
  setFirmNames: (n: string[]) => void;
}

const ValCtx = createContext<ValuationContextType | null>(null);

export function useVal() {
  const ctx = useContext(ValCtx);
  if (!ctx) throw new Error("useVal must be used within ValuationProvider");
  return ctx;
}

// Alias for compatibility
export const useValuation = useVal;

export function ValuationProvider({ children }: { children: ReactNode }) {
  const [weights, setWeights] = useState([...DW]);
  const [firmScores, setFirmScores] = useState([[...FA], [...FB], [...FC]]);
  const [firmNames, setFirmNames] = useState(["Firm A", "Firm B", "Firm C"]);

  return (
    <ValCtx.Provider value={{ weights, setWeights, firmScores, setFirmScores, firmNames, setFirmNames }}>
      {children}
    </ValCtx.Provider>
  );
}

export { DW, FA, FB, FC };
