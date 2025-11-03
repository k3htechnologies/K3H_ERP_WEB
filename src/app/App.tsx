import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import SignIn from '../features/authentication/pages/signIn'


function App() {
  return (
    <Router>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/signin" />} />

        {/* Auth */}
        <Route path="/signin" element={<SignIn />} />

      </Routes>
    </Router>
  )
}

export default App
