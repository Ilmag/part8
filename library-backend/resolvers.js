const { UserInputError, AuthenticationError } = require("@apollo/server");
const jwt = require("jsonwebtoken");

const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");

const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const resolvers = {
    Query: {
        bookCount: async() => Book.collection.countDocuments(),
        authorCount: async() => Author.collection.countDocuments(),
        allBooks: async(root, args) => {
            if (args.name && args.genre) {
                const author = await Author.find({ name: args.name });
                const id = author[0]._id;
                return Book.find({
                    author: id,
                    genres: { $in: [args.genre] },
                }).populate("author");
            } else if (args.name || args.genre) {
                if (args.name) {
                    const author = await Author.find({ name: args.name });
                    const id = author[0]._id;
                    return Book.find({ author: id }).populate("author");
                } else {
                    return Book.find({ genres: { $in: [args.genre] } }).populate(
                        "author"
                    );
                }
            } else {
                return Book.find({}).populate("author");
            }
        },
        allAuthors: async() => {
            const authors = await Author.find({});
            return authors.map((a) => {
                return {
                    name: a.name,
                    born: a.born,
                    bookCount: a.books.length,
                };
            });
        },
        me: (root, args, context) => {
            return context.currentUser;
        },
        allGenres: async() => {
            const books = await Book.find({});
            const genres = new Set(
                books
                .map((book) => book.genres)
                .join(",")
                .split(",")
            );
            const allGenres = [...genres].map((genre) => {
                return { genre };
            });
            return allGenres;
        },
        booksByGenre: async(root, args) => {
            const books = await Book.find({});
            const filtered = books.filter((book) => book.genres.includes(args.genre));
            return filtered;
        },
    },
    Mutation: {
        addBook: async(root, args, context) => {
            if (!context.currentUser) {
                throw new AuthenticationError("not authenticated");
            }
            const author = await Author.findOne({ name: args.author });
            if (author) {
                const book = new Book({...args, author: author._id });
                try {
                    await book.save();
                } catch (error) {
                    throw new UserInputError(error.message, { invalidArgs: args.author });
                }

                pubsub.publish("BOOK_ADDED", {
                    bookAdded: {...args, author: author },
                });

                await Author.findByIdAndUpdate(author._id, {
                    books: author.books.concat(book._id),
                });

                return {...args, author: author };
            } else {
                const newAuthor = new Author({ name: args.author });
                const book = new Book({...args, author: newAuthor._id });
                try {
                    await newAuthor.save();
                } catch (error) {
                    throw new UserInputError(error.message, { invalidArgs: args.author });
                }
                try {
                    await book.save();
                } catch (error) {
                    throw new UserInputError(error.message, { invalidArgs: args.title });
                }

                pubsub.publish("BOOK_ADDED", {
                    bookAdded: {...args, author: { name: args.author } },
                });

                await Author.findByIdAndUpdate(newAuthor._id, {
                    books: newAuthor.books.concat(book._id),
                });

                return {...args, author: { name: args.author } };
            }
        },
        editAuthor: async(root, args, context) => {
            if (!context.currentUser) {
                throw new AuthenticationError("not authenticated");
            }
            console.log(args);
            const author = await Author.findOne({ name: args.name });
            if (author) {
                const id = author._id;
                return await Author.findByIdAndUpdate(id, {
                    born: args.setBornTo,
                });
            } else {
                return null;
            }
        },
        createUser: async(root, args) => {
            const user = new User({
                username: args.username,
                favoriteGenre: args.favoriteGenre,
            });
            return await user.save().catch((error) => {
                throw new UserInputError(error.message, { invalidArgs: args.username });
            });
        },
        login: async(root, args) => {
            const user = await User.findOne({ username: args.username });
            if (!user || args.password !== "saidumlo") {
                throw new UserInputError("wrong credentials");
            }

            const userForLogin = { username: user.username, id: user._id };
            return {
                value: jwt.sign(userForLogin, JWT_SECRET),
                favoriteGenre: user.favoriteGenre,
            };
        },
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
        },
    },
};

module.exports = resolvers;