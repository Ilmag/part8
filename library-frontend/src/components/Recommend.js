const Recommend = (props) => {
  if (!props.show) {
    return null;
  }

  const books = props.books.filter((book) =>
    book.genres.includes(props.favoriteGenre)
  );

  return (
    <div>
      <h2> recommendations </h2>
      <p>
        books in your favorite genre{" "}
        <span style={{ fontWeight: "bold" }}>{props.favoriteGenre}</span>
      </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Recommend;
