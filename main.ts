import { ApolloServer } from "@apollo/server";
import { schema } from "./schema.ts";
import { MongoClient } from "mongodb";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers } from "./resolvers.ts";
import { CourseModel, StudentModel, TeacherModel } from "./types.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");

if (!MONGO_URL) {
	throw new Error("Please provide a MONGO_URL");
}

const mongoClient = new MongoClient(MONGO_URL);
await mongoClient.connect();

console.info("Connected to MongoDB");

const mongoDB = mongoClient.db("Clases");
const studentsCollection = mongoDB.collection<StudentModel>("estudiantes");
const teachersCollection = mongoDB.collection<TeacherModel>("profesores");
const coursesCollection = mongoDB.collection<CourseModel>("cursos");

const server = new ApolloServer({
	typeDefs: schema,
	resolvers,
});

const { url } = await startStandaloneServer(server, {
	context: async () => ({
		studentsCollection,
		teachersCollection,
		coursesCollection,
	}),
});

console.info(`Server ready at ${url}`);
