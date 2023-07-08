import { useContext } from 'react'
import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import ProductList from './pages/ProductList'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterLayout from './layout/RegisterLayout'
import MainLayout from './layout/MainLayout'
import Profile from './pages/Profile'
import { AppContext } from './context/app.context'
import path from './constants/path'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'

function ProtectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}

function RejectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return !isAuthenticated ? <Outlet /> : <Navigate to='/' />
}

export default function useRouteElements() {
  const routeElements = useRoutes([
    {
      path: path.home,
      index: true,
      element: (
        <MainLayout>
          <ProductList />,
        </MainLayout>
      ),
    },

    {
      path: path.productDetail,
      element: (
        <MainLayout>
          <ProductDetail />
        </MainLayout>
      ),
    },

    {
      path: '',
      element: <ProtectedRoute />,
      children: [
        {
          path: path.profile,
          element: (
            <MainLayout>
              <Profile />
            </MainLayout>
          ),
        },
        {
          path: path.cart,
          element: (
            <MainLayout>
              <Cart />
            </MainLayout>
          ),
        },
      ],
    },

    {
      path: '',
      element: <RejectedRoute />,
      children: [
        {
          path: path.login,
          element: (
            <RegisterLayout>
              <Login />
            </RegisterLayout>
          ),
        },

        {
          path: path.register,
          element: (
            <RegisterLayout>
              <Register />
            </RegisterLayout>
          ),
        },
      ],
    },
  ])
  return routeElements
}
