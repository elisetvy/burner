import { useState, useEffect } from "react";
import { db } from "./firebase-config.ts";

function App() {

  const [users, setUsers] = useState([]);
  const usersRef =

  useEffect(() => {
    const getUsers = () => {

    }

    getUsers();
  }, []);

  return (

    <>

    </>
  )
}

export default App;