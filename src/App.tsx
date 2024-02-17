import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth, storage } from "./firebase-config.ts";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { v4 as uuid } from "uuid";

interface Cat {
  name: string;
  id: string;
}

interface User {
  email: string | null;
}

function App() {
  const [cats, setCats] = useState<Cat[]>([]);
  const catsRef = collection(db, "cats");

  // Get cats on mount
  useEffect(() => {
    const getCats = async () => {
      const data = await getDocs(catsRef);
      setCats(
        data.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              id: doc.id,
            } as Cat)
        )
      );
    };

    getCats();
  }, []);

  const [cat, setCat] = useState<string | null>(null);

  // Get a cat img on mount
  useEffect(() => {
    const getCat = async () => {
      const resp = await fetch("https://api.thecatapi.com/v1/images/search");
      const data = await resp.json();

      setCat(data[0].url);
    };

    getCat();
  }, []);

  const [newCat, setNewCat] = useState<string>("");

  // Add a cat to db
  const addCat = async () => {
    await addDoc(catsRef, { name: newCat });

    // Clear newCat state
    setNewCat("");

    // Update cats array
    const data = await getDocs(catsRef);
    setCats(
      data.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            id: doc.id,
          } as Cat)
      )
    );
  };

  // Update a cat in db
  const updateCat = async (id: string, name: string) => {
    const userDoc = doc(db, "cats", id); // Create an instance of a doc
    const capitalizedName = { name: name[0].toUpperCase() + name.slice(1) };

    await updateDoc(userDoc, capitalizedName);

    // Update cats array
    const data = await getDocs(catsRef);
    setCats(
      data.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            id: doc.id,
          } as Cat)
      )
    );
  };

  // Delete a cat in db
  const deleteCat = async (id: string) => {
    const userDoc = doc(db, "users", id); // Create an instance of a doc

    await deleteDoc(userDoc);

    // Update cats array
    const data = await getDocs(catsRef);
    setCats(
      data.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            id: doc.id,
          } as Cat)
      )
    );
  };

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [currUser, setCurrUser] = useState<User | null>({ email: null });

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setCurrUser(currentUser);
    });
  }, []);

  const register = async () => {
    try {
      // Create user and log in
      await createUserWithEmailAndPassword(
        auth,
        registerEmail,
        registerPassword
      );
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
    }
  };

  const login = async () => {
    try {
      // Log in user
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
    }
  };

  const logout = async () => {
    // Sign out user
    await signOut(auth);
  };

  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const imagesRef = ref(storage, "images/");

  const upload = () => {
    // If no image, do nothing
    if (image === null) return;

    const imageRef = ref(storage, `images/${uuid() + image.name}`);
    uploadBytes(imageRef, image).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImages((prev) => [...prev, url]);
      });
    });
  };

  // Get images on mount
  useEffect(() => {
    listAll(imagesRef).then((resp) => {
      resp.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImages((prev) => [...prev, url]);
        });
      });
    });
  }, []);

  const [tableOne, setTableOne] = useState({
    one: "",
    five: "",
    six: "",
    nine: "",
  });
  const [tableOneAnswers, setTableOneAnswers] = useState({
    one: "6",
    five: "5",
    six: "4",
    nine: "2",
  });

  function handleChange(e, num) {
    setTableOne((prev) => ({ ...prev, [num]: e.target.value }));
  }

  const [gameStatus, setGameStatus] = useState(null);

  function handleSubmit(e) {
    let gameLost = false;

    for (const key in tableOne) {
      if (tableOne[key] !== tableOneAnswers[key]) {
        gameLost = true;

        break;
      }
    }

    gameLost === true ? setGameStatus("lose") : setGameStatus("win");
  }

  return (
    <>
      <div className="flex">
        <table className="help">
          <tr className="flex">
            <td
              className={`help h-12 w-12 flex justify-center items-center ${
                tableOne.one === tableOneAnswers.one ? "bg-blue-200" : "bg-none"
              }`}
            >
              <input
                onChange={(e) => handleChange(e, "one")}
                className={`h-full w-full text-center focus:outline-none ${
                  tableOne.one === tableOneAnswers.one
                    ? "bg-blue-200"
                    : "bg-none"
                }`}
                type="text"
                value={tableOne.one}
              ></input>
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              8
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              9
            </td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center">
              3
            </td>
            <td
              className={`help h-12 w-12 flex justify-center items-center ${
                tableOne.five === tableOneAnswers.five
                  ? "bg-blue-200"
                  : "bg-none"
              }`}
            >
              <input
                onChange={(e) => handleChange(e, "five")}
                className={`h-full w-full text-center focus:outline-none ${
                  tableOne.five === tableOneAnswers.five
                    ? "bg-blue-200"
                    : "bg-none"
                }`}
                type="text"
                value={tableOne.five}
              ></input>
            </td>
            <td
              className={`help h-12 w-12 flex justify-center items-center ${
                tableOne.six === tableOneAnswers.six ? "bg-blue-200" : "bg-none"
              }`}
            >
              <input
                onChange={(e) => handleChange(e, "six")}
                className={`h-full w-full text-center focus:outline-none ${
                  tableOne.six === tableOneAnswers.six
                    ? "bg-blue-200"
                    : "bg-none"
                }`}
                type="text"
                value={tableOne.six}
              ></input>
            </td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center">
              7
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              1
            </td>
            <td
              className={`help h-12 w-12 flex justify-center items-center ${
                tableOne.nine === tableOneAnswers.nine
                  ? "bg-blue-200"
                  : "bg-none"
              }`}
            >
              <input
                onChange={(e) => handleChange(e, "nine")}
                className={`h-full w-full text-center focus:outline-none ${
                  tableOne.nine === tableOneAnswers.nine
                    ? "bg-blue-200"
                    : "bg-none"
                }`}
                type="text"
                value={tableOne.nine}
              ></input>
            </td>
          </tr>
        </table>
        {/* <table className="help">
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center">
              5
            </td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center">
              8
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              1
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              7
            </td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center">
              6
            </td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center">
              4
            </td>
          </tr>
        </table>
        <table className="help">
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center">
              1
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              4
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              3
            </td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center">
              6
            </td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center">
              3
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              8
            </td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
          </tr>
        </table>
      </div>
      <div className="flex">
        <table className="help">
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center">
              4
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              3
            </td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center">
              9
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              7
            </td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
          </tr>
        </table>
        <table className="help">
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center">
              9
            </td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center">
              8
            </td>
          </tr>
        </table>
        <table className="help">
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center">
              1
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              4
            </td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center">
              7
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              3
            </td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
          </tr>
        </table>
      </div>
      <div className="flex mb-96">
        <table className="help">
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center">
              9
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              6
            </td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center">
              4
            </td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center">
              2
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              1
            </td>
          </tr>
        </table>
        <table className="help">
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center">
              4
            </td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center">
              2
            </td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center">
              1
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              5
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              9
            </td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center">
              7
            </td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
          </tr>
        </table>
        <table className="help">
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center">
              7
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              1
            </td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center"></td>
            <td className="help h-12 w-12 flex justify-center items-center">
              2
            </td>
          </tr>
          <tr className="flex">
            <td className="help h-12 w-12 flex justify-center items-center">
              4
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              9
            </td>
            <td className="help h-12 w-12 flex justify-center items-center">
              0
            </td>
          </tr>
        </table> */}
      </div>
      {gameStatus === "lose" && (
        <div className="text-red-400">FUK!!!!!!!!!</div>
      )}
      {gameStatus === "win" && (
        <div className="text-green-800">FUK YEAH!!!!!!!!!</div>
      )}
      <button
        className="mt-4 mb-96 bg-sky-300 px-4 py-2 rounded-full"
        onClick={handleSubmit}
      >
        Submit
      </button>
      <div className="HELP mb-20">
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        ></input>
        <button className="bg-sky-300 px-4 py-2 rounded-full" onClick={upload}>
          Upload file
        </button>
        {images.map((url) => {
          return <img className="h-48" src={url} />;
        })}
      </div>
      <div className="HELP">
        <h1>Register User</h1>
        <input
          placeholder="Email..."
          onChange={(e) => setRegisterEmail(e.target.value)}
          className="help"
        ></input>
        <input
          placeholder="Password..."
          onChange={(e) => setRegisterPassword(e.target.value)}
          className="help"
        ></input>
        <button
          className="bg-sky-300 px-4 py-2 rounded-full"
          onClick={register}
        >
          Create User
        </button>
      </div>
      <div className="HELP">
        <h1>Login</h1>
        <input
          placeholder="Email..."
          onChange={(e) => setLoginEmail(e.target.value)}
          className="help"
        ></input>
        <input
          placeholder="Password..."
          onChange={(e) => setLoginPassword(e.target.value)}
          className="help"
        ></input>
        <button className="bg-sky-300 px-4 py-2 rounded-full" onClick={login}>
          Log In
        </button>
      </div>
      <div className="mb-20">
        <h4>User Logged In:</h4>
        {currUser?.email}
        <button className="bg-sky-300 px-4 py-2 rounded-full" onClick={logout}>
          Sign Out
        </button>
      </div>
      <input
        className="help"
        onChange={(e) => setNewCat(e.target.value)}
        placeholder="New user name..."
        value={newCat}
      ></input>
      <button className="HELP" onClick={addCat}>
        Add user
      </button>
      {cats.map((user: Cat) => {
        return (
          <div key={user.id}>
            <h1>{user.name}</h1>
            <button
              className="HELP"
              onClick={() => updateCat(user.id, user.name)}
            >
              Capitalize name
            </button>
            <button className="HELP" onClick={() => deleteCat(user.id)}>
              Delete user
            </button>
          </div>
        );
      })}
      <img className="h-48" src={cat || undefined} alt="cat" />
    </>
  );
}

export default App;
