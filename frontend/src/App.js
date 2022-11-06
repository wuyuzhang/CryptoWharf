import './App.css';
import ProjectList from './pages/ProjectList.tsx';
import CreateProject from './pages/CreateProject.tsx';
import LandingPage from './pages/LandingPage.tsx';
import NavBar from './pages/NavBar.tsx';
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { UserContext } from './context/UserContext.tsx';
import { useState } from "react";

function App() {
  const [page, setPage] = useState('features');
  const [user, setUser] = useState(null);
  const [signer, setSigner] = useState(null);

  return (
    <BrowserRouter>
      <div className="App">
        <UserContext.Provider value={{ page, setPage, user, setUser, signer, setSigner }}>
          <NavBar />
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/features' element={<LandingPage />} />
            <Route path='/onboarding' element={<CreateProject />} />
            <Route path='/projects' element={<ProjectList />} />
          </Routes>
          <div className="footer">Built with ❤️ in ETHSanFrancisco</div>
        </UserContext.Provider>
      </div>
    </BrowserRouter>
  );
}

export default App;
