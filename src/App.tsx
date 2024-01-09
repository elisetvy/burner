import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "./firebase-config.ts";
import { createUserWithEmailAndPassword } from "firebase/auth";

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

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const register = async () => {
    try {
      // Create user and log in
      const user = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      console.log(user)
    } catch (err) {
      console.log(err.message);
    }
  }

  const login = async () => {

  }

  const logout = async () => {

  }

  return (
    <>
      <div className="HELP mb-10">
        <h1>Register User</h1>
        <input placeholder="Email..." onChange={e => setRegisterEmail(e.target.value)} className="help"></input>
        <input placeholder="Password..." onChange={e => setRegisterPassword(e.target.value)} className="help"></input>
        <button className="bg-sky-300 px-4 py-2" onClick={register}>Create User</button>
      </div>
      <div className="HELP mb-96">
        <h1>Login</h1>
        <input placeholder="Email..." onChange={e => setLoginEmail(e.target.value)} className="help"></input>
        <input placeholder="Password..." onChange={e => setLoginPassword(e.target.value)} className="help"></input>
        <button className="bg-sky-300 px-4 py-2">Login</button>
      </div>
      <h4>User Logged In:</h4>

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