import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import Recommend from "./components/Recommend";
import { useQuery, useSubscription } from "@apollo/client";
import { ALL_AUTHORS, ALL_BOOKS, BOOK_ADDED, ALL_GENRES } from "./queries";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const [favoriteGenre, setFavoriteGenre] = useState(null);

  const authors = useQuery(ALL_AUTHORS, {
    pollInterval: 2000,
    fetchPolicy: "cache-and-network",
  });
  const books = useQuery(ALL_BOOKS, {
    pollInterval: 2000,
    fetchPolicy: "cache-and-network",
  });
  const allGenres = useQuery(ALL_GENRES, {
    pollInterval: 2000,
    fetchPolicy: "cache-and-network",
  });

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      window.alert(
        `A new book ${data.data.bookAdded.title} by ${data.data.bookAdded.author.name} has been added`
      );
    },
  });

  if (authors.loading || books.loading || allGenres.loading) {
    return <h2>Loading...</h2>;
  }

  const styling = token ? null : { display: "none" };

  const loginLogout = (e) => {
    if (token) {
      localStorage.clear();
      setToken(null);
      setFavoriteGenre(null);
      setPage("authors");
    } else {
      setPage("login");
    }
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("add")} style={styling}>
          add book
        </button>
        <button onClick={() => setPage("recommend")} style={styling}>
          recommend
        </button>
        <button onClick={loginLogout}>{token ? "logout" : "login"}</button>
      </div>

      <Authors show={page === "authors"} authors={authors.data.allAuthors} />

      <Books
        show={page === "books"}
        books={books.data.allBooks}
        allGenres={allGenres.data.allGenres.map((i) => i.genre)}
      />

      <NewBook show={page === "add"} setPage={setPage} />

      <Recommend
        show={page === "recommend"}
        books={books.data.allBooks}
        favoriteGenre={favoriteGenre}
      />

      <Login
        show={page === "login"}
        setToken={setToken}
        setPage={setPage}
        setFavoriteGenre={setFavoriteGenre}
      />
    </div>
  );
};

export default App;
