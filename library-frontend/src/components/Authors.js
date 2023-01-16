import { useState } from "react";
import { useMutation } from "@apollo/client";
import Select from "react-select";
import { EDIT_AUTHOR, ALL_AUTHORS } from "../queries";

const Authors = (props) => {
  const [born, setBorn] = useState("");
  const [setBornTo, setSetBornTo] = useState(0);
  const [selectedOption, setSelectedOption] = useState({
    value: "Select author",
    label: "Select author",
  });
  const authors = props.authors;

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const updateAuthor = (e) => {
    e.preventDefault();
    const name = selectedOption.value;

    editAuthor({ variables: { name, setBornTo } });

    setBorn("");
  };

  if (!props.show) {
    return null;
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      <form onSubmit={updateAuthor}>
        <Select
          defaultValue={selectedOption}
          options={authors.map((a) => {
            return { value: a.name, label: a.name };
          })}
          onChange={setSelectedOption}
        />
        <div>
          born:
          <input
            value={born}
            onChange={({ target }) => {
              setBorn(target.value);
              setSetBornTo(Number(target.value));
            }}
          />
        </div>
        <button>update author</button>
      </form>
    </div>
  );
};

export default Authors;
