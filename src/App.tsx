import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase-config.ts";

interface User {
  name: string,
  id: string,
}

function App() {

  const [users, setUsers] = useState<User[]>([]);
  const usersRef = collection(db, "users");

  // Get users on mount
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

  // Get a cat img on mount
  useEffect(() => {
    const getCat = async () => {
      const resp = await fetch("https://api.thecatapi.com/v1/images/search");
      const data = await resp.json()

      setCat(data[0].url);
    }

    getCat();
  }, [])

  const [newUser, setNewUser] = useState<string>("");

  // Add a user to db
  const addUser = async () => {
    await addDoc(usersRef, { name: newUser });

    // Clear newUser state
    setNewUser("");

    // Update users array
    const data = await getDocs(usersRef);
    setUsers(data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id
    } as User)));
  }

  // Update a user in db
  const updateUser = async (id:string, name:string) => {
    const userDoc = doc(db, "users", id); // Create an instance of a doc
    const capitalizedName = { name: name[0].toUpperCase() + name.slice(1)}

    await updateDoc(userDoc, capitalizedName);

    // Update users array
    const data = await getDocs(usersRef);
    setUsers(data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id
    } as User)));
  }

  // Delete a user in db
  const deleteUser = async (id:string) => {
    const userDoc = doc(db, "users", id); // Create an instance of a doc

    await deleteDoc(userDoc);

    // Update users array
    const data = await getDocs(usersRef);
    setUsers(data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id
    } as User)));
  }

  return (
    <>
      <input className="help" onChange={e => setNewUser(e.target.value)} placeholder="New user name..." value={newUser}></input>
      <button className="HELP" onClick={addUser}>Add user</button>
      { users.map((user:User) => {
        return (
          <>
            <h1 key={user.id}>{user.name}</h1>
            <button className="HELP" onClick={() => updateUser(user.id, user.name)}>Capitalize name</button>
            <button className="HELP" onClick={() => deleteUser(user.id)}>Delete user</button>
          </>
        );
      })}
      <img src={cat || undefined} alt="cat" />
    </>
  )
}

export default App;