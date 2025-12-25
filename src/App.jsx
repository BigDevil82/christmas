import HandTracker from './components/HandTracker';
import Scene from './components/Scene';
import UI from './components/UI';

const App = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <Scene />
      <UI />
      <HandTracker />
    </div>
  );
};

export default App;
