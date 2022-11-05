import './App.css';
import ProjectList from './pages/ProjectList.tsx';
import CreateProject from './pages/CreateProject.tsx';
import LandingPage from './pages/LandingPage.tsx';
import NavBar from './pages/NavBar.tsx';
import { BrowserRouter, Route, Routes } from "react-router-dom"

function App() {

  return (
    <BrowserRouter>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/features' element={<LandingPage />} />
          <Route path='/onboarding' element={<CreateProject />} />
          <Route path='/projects' element={<ProjectList />} />
        </Routes>
        <div className="footer">Built with ❤️ in ETHSanFrancisco</div>
      </div>
    </BrowserRouter>
  );
}

export default App;
