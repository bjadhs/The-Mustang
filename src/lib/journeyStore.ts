/**
 * Tiny pub/sub store shared between the video stage and the instrument UI.
 * Holds scroll progress (0..1), the film's current time and real duration.
 * Kept outside React state on purpose: values change every frame.
 */

export interface JourneyState {
  progress: number;
  time: number;
  duration: number;
}

type Listener = (s: JourneyState) => void;

const state: JourneyState = { progress: 0, time: 0, duration: 0 };
const listeners = new Set<Listener>();

export const journey = {
  get(): JourneyState {
    return state;
  },
  set(partial: Partial<JourneyState>) {
    Object.assign(state, partial);
    listeners.forEach((l) => l(state));
  },
  subscribe(l: Listener): () => void {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};
