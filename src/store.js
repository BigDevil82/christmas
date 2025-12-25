import { create } from 'zustand';

const useStore = create((set) => ({
  phase: 'tree', // 'tree', 'blooming', 'nebula', 'collapsing'
  setPhase: (phase) => set({ phase }),
  
  handGesture: 'None', // 'None', 'Open_Palm', 'Closed_Fist', etc.
  setHandGesture: (gesture) => set({ handGesture: gesture }),
  
  cameraTarget: [0, 0, 0],
  setCameraTarget: (target) => set({ cameraTarget: target }),

  isHandTrackerVisible: true,
  toggleHandTracker: () => set((state) => ({ isHandTrackerVisible: !state.isHandTrackerVisible })),

  // For Nebula phase interaction
  nebulaRotation: 0,
  setNebulaRotation: (rotation) => set({ nebulaRotation: rotation }),
  
  activePhotoIndex: null,
  setActivePhotoIndex: (index) => set({ activePhotoIndex: index }),
}));

export default useStore;
