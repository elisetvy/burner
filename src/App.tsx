import { useState, useEffect } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "./firebase-config.ts";

// interface User {
//   name: string
// }

function App() {

  // const [users, setUsers] = useState([]);
  // const usersRef = collection(db, "users");

  // useEffect(() => {
  //   const getUsers = async () => {
  //     const data = await getDocs(usersRef);
  //     console.log(data)
  //     setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  //   }

  //   getUsers();
  // }, []);

  const [cat, setCat] = useState(null);

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
      {/* { users.map((user:User) => {
        <h1>{user.name}</h1>
      })} */}
      <img src={cat} alt="cat" />
    </>
  )
}

export default App;