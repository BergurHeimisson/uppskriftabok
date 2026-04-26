import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Recipe from './pages/Recipe'
import Add from './pages/Add'
import Edit from './pages/Edit'
import Grocery from './pages/Grocery'
import Menus from './pages/Menus'
import MenuDetail from './pages/MenuDetail'
import NewMenu from './pages/NewMenu'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/recipe/:id" element={<Recipe />} />
      <Route path="/add" element={<Add />} />
      <Route path="/recipe/:id/edit" element={<Edit />} />
      <Route path="/grocery" element={<Grocery />} />
      <Route path="/menus" element={<Menus />} />
      <Route path="/menus/new" element={<NewMenu />} />
      <Route path="/menus/:id" element={<MenuDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
