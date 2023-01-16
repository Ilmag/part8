import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../queries";

const Login = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.GraphQLErrors[0].message);
    },
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      const genre = result.data.login.favoriteGenre;
      props.setToken(token);
      props.setFavoriteGenre(genre);
      localStorage.setItem("user-token", token);
      props.setPage("authors");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.data]);

  const submit = (e) => {
    e.preventDefault();
    login({ variables: { username, password } });

    setUsername("");
    setPassword("");
  };

  if (!props.show) {
    return null;
  }

  return (
    <div>
      <h2>{error}</h2>
      <form onSubmit={submit}>
        <div>
          username:{" "}
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password:{" "}
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button>login</button>
      </form>
    </div>
  );
};

export default Login;
