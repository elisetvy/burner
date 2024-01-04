import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase-config.ts";

interface User {
  name: string,
  id: string,
}

function App() {

  const [users, setUsers] = useState<User[]>([]);
  const usersRef = collection(db, "users");

  useEffect(() => {
    const getUsers = async () => {
      const data = await getDocs(usersRef);
      setUsers(data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      } as User)));
    }

    getUsers();
  }, []);

  const [cat, setCat] = useState<string | null>(null);

  useEffect(() => {
    const getCat = async () => {
      const resp = await fetch("https://api.thecatapi.com/v1/images/search");
      const data = await resp.json()

      setCat(data[0].url);
    }

    getCat();
  }, [])

  return (
    <>
      { users.map((user:User) => {
        return (
          <h1 key={user.id}>{user.name}</h1>
        );
      })}
      <img src={cat || undefined} alt="cat" />
    </>
  )
}

export default App;