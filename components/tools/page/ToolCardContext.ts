/**
 * ToolCardContext — shared между ToolsPage и каждым ToolCard'ом.
 *
 * P1-CR-3 step 3/6 — extracted from ToolsPage.tsx.
 *
 * Вместо того чтобы каждая карточка subscribed `useAppStore` три раза
 * (openTool, toggleFav, toolsFavourites), parent subscribed ONCE и
 * раздаёт via context. С ~60 cards mounted это режет store-selector
 * runs 3×, и Zustand writes unrelated to favourites больше не будят
 * cards.
 */
import { createContext } from 'react';

export interface ToolCardContextValue {
  openTool: (id: string) => void;
  toggleFav: (id: string) => void;
  favouriteSet: ReadonlySet<string>;
}

export const ToolCardContext = createContext<ToolCardContextValue | null>(null);
