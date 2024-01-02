import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase-config.ts";

interface User {
  name: string
}

function App() {

  const [users, setUsers] = useState([]);
  const usersRef = collection(db, "users");

  useEffect(() => {
    const getUsers = async () => {
      const data = await getDocs(usersRef);
      console.log(data)
      setUsers(data.docs.map((doc:object) => ({ ...doc.data(), id: doc.id })));
    }

    getUsers();
  }, []);

  return (
    <>
      { users.map((user:User) => {
        <h1>{user.name}</h1>
      })}
    </>
  )
}

export default App;