import useRouteElements from './useRouteElements'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const routeElement = useRouteElements()

  return (
    <div>
      <ToastContainer />
      {routeElement}
    </div>
  )
}

export default App
