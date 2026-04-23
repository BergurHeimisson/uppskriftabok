import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Recipe from './pages/Recipe'
import Add from './pages/Add'
import Grocery from './pages/Grocery'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/recipe/:id" element={<Recipe />} />
      <Route path="/add" element={<Add />} />
      <Route path="/grocery" element={<Grocery />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
