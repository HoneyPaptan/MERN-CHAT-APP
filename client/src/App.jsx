
import axios from "axios"
import { UserContextProvide } from "./UserContext"

import Routes from "./Routes"

function App() {

  axios.defaults.baseURL = 'http://localhost:4000'
  axios.defaults.withCredentials = true
 
  return (
    <UserContextProvide>
      <Routes />

    </UserContextProvide>

  )
}

export default App
