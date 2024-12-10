import { Collection, ObjectId } from "mongodb";
import {
	CourseModel,
	TeacherModel,
	StudentModel,
	Course,
	Teacher,
	Student,
} from "./types.ts";
import {
	fromModelToStudent,
	fromModelToTeacher,
	fromModelToCourse,
} from "./utils.ts";

export const resolvers = {
	Query: {
		students: async (
			_: unknown,
			__: unknown,
			context: {
				studentsCollection: Collection<StudentModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<Student[]> => {
			const studentModel = await context.studentsCollection.find().toArray();

			return await Promise.all(
				studentModel.map((student) =>
					fromModelToStudent(student, context.coursesCollection)
				)
			);
		},

		student: async (
			_: unknown,
			args: { id: string },
			context: {
				studentsCollection: Collection<StudentModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<Student | null> => {
			const stu_DB = await context.studentsCollection.findOne({
				_id: new ObjectId(args.id),
			});

			if (!stu_DB) {
				return null;
			}

			return await fromModelToStudent(stu_DB, context.coursesCollection);
		},

		teachers: async (
			_: unknown,
			__: unknown,
			context: {
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<Teacher[]> => {
			const teacherModel = await context.teachersCollection.find().toArray();

			return await Promise.all(
				teacherModel.map((teacher) =>
					fromModelToTeacher(teacher, context.coursesCollection)
				)
			);
		},

		teacher: async (
			_: unknown,
			args: { id: string },
			context: {
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<Teacher | null> => {
			const tea_DB = await context.teachersCollection.findOne({
				_id: new ObjectId(args.id),
			});

			if (!tea_DB) {
				return null;
			}

			return await fromModelToTeacher(tea_DB, context.coursesCollection);
		},

		courses: async (
			_: unknown,
			__: unknown,
			context: {
				studentsCollection: Collection<StudentModel>;
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<Course[]> => {
			const courseModel = await context.coursesCollection.find().toArray();

			return await Promise.all(
				courseModel.map((course) =>
					fromModelToCourse(
						course,
						context.studentsCollection,
						context.teachersCollection
					)
				)
			);
		},

		course: async (
			_: unknown,
			args: { id: string },
			context: {
				studentsCollection: Collection<StudentModel>;
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<Course | null> => {
			const cou_DB = await context.coursesCollection.findOne({
				_id: new ObjectId(args.id),
			});

			if (!cou_DB) {
				return null;
			}

			return await fromModelToCourse(
				cou_DB,
				context.studentsCollection,
				context.teachersCollection
			);
		},
	},
	Mutation: {
		// createStudent: async (
		// 	_: unknown,
		// 	args: { name: string; email: string },
		// 	context: {
		// 		studentsCollection: Collection<StudentModel>;
		// 		coursesCollection: Collection<CourseModel>;
		// 	}
		// ): Promise<Student> => {
		// 	const { name, email } = args;
		// 	const { insertedId } = await context.studentsCollection.insertOne({
		// 		name,
		// 		email,
		// 		enrolledCourses: [],
		// 	});
		// 	const studentModel: StudentModel = {
		// 		_id: insertedId,
		// 		name,
		// 		email,
		// 		enrolledCourses: [],
		// 	};
		// 	return fromModelToStudent(studentModel!, context.coursesCollection);
		// },
	},

	// createCourse: async (
	// 	_: unknown,
	// 	args: { title: string; description: string; teacherId: string },
	// 	context: {
	// 		studentsCollection: Collection<StudentModel>;
	// 		teachersCollection: Collection<TeacherModel>;
	// 		coursesCollection: Collection<CourseModel>;
	// 	}
	// ): Promise<Course> => {
	// 	const { title, description, teacherId } = args;
	// 	const { insertedId } = await context.coursesCollection.insertOne({
	// 		title,
	// 		description,
	// 		teacherId: new ObjectId(teacherId),
	// 		studentIds: [],
	// 	});
	// 	const courseModel: CourseModel = {
	// 		_id: insertedId,
	// 		title,
	// 		description,
	// 		teacherId,
	// 		studentIds: [],
	// 	};
	// 	return fromModelToCourse(
	// 		courseModel!,
	// 		context.studentsCollection,
	// 		context.teachersCollection
	// 	);
	// },

	// createTeacher: async (
	// 	_: unknown,
	// 	args: { name: string; email: string },
	// 	context: {
	// 		teachersCollection: Collection<TeacherModel>;
	// 		coursesCollection: Collection<CourseModel>;
	// 	}
	// ): Promise<Teacher> => {
	// 	const { name, email } = args;
	// 	const { insertedId } = await context.teachersCollection.insertOne({
	// 		name,
	// 		email,
	// 		coursesTaught: [],
	// 	});
	// 	const teacherModel: TeacherModel = {
	// 		_id: insertedId,
	// 		name,
	// 		email,
	// 		coursesTaught: [],
	// 	};
	// 	return fromModelToTeacher(teacherModel!, context.coursesCollection);
	// },

	// updateStudent: async (
	// 	_: unknown,
	// 	args: { id: string; name?: string; email?: string },
	// 	context: {
	// 		studentsCollection: Collection<StudentModel>;
	// 		coursesCollection: Collection<CourseModel>;
	// 	}
	// ): Promise<Student | null> => {
	// 	const { id, name, email } = args;
	// 	const { modifiedCount } = await context.studentsCollection.updateOne(
	// 		{ _id: new ObjectId(id) },
	// 		{ $set: { id, name, email } }
	// 	);

	// 	if (modifiedCount === 0) {
	// 		console.log("Student not found");
	// 		return null;
	// 	}

	// 	const updatedStudentModel = await context.studentsCollection.findOne({
	// 		_id: new ObjectId(id),
	// 	});

	// 	if (!updatedStudentModel) {
	// 		console.log("Updated Student not found");
	// 		return null;
	// 	}

	// 	const updatedStudent: Student = await fromModelToStudent(
	// 		updatedStudentModel,
	// 		context.coursesCollection
	// 	);

	// 	return updatedStudent;
	// },

	/*updateCourse: async (
		_: unknown,
		args: { id: string; name?: string; email?: string },
		context: {
			studentsCollection: Collection<StudentModel>;
			coursesCollection: Collection<CourseModel>;
		}
	): Promise<Student | null> => {
		const { id, name, email } = args;
		const { modifiedCount } = await context.studentsCollection.updateOne(
			{ _id: new ObjectId(id) },
			{ $set: { id, name, email } }
		);

		if (modifiedCount === 0) {
			console.log("Student not found");
			return null;
		}

		const updatedStudentModel = await context.studentsCollection.findOne({
			_id: new ObjectId(id),
		});

		if (!updatedStudentModel) {
			console.log("Updated Student not found");
			return null;
		}

		const updatedStudent: Student = await fromModelToStudent(
			updatedStudentModel,
			context.coursesCollection
		);

		return updatedStudent;
	},*/

	// updateTeacher: async (
	// 	_: unknown,
	// 	args: { id: string; name?: string; email?: string },
	// 	context: {
	// 		teachersCollection: Collection<TeacherModel>;
	// 		coursesCollection: Collection<CourseModel>;
	// 	}
	// ): Promise<Teacher | null> => {
	// 	const { id, name, email } = args;
	// 	const { modifiedCount } = await context.teachersCollection.updateOne(
	// 		{ _id: new ObjectId(id) },
	// 		{ $set: { id, name, email } }
	// 	);
	// 	if (modifiedCount === 0) {
	// 		return null;
	// 	}

	// 	const updatedTeacherModel = await context.teachersCollection.findOne({
	// 		_id: new ObjectId(id),
	// 	});

	// 	if (!updatedTeacherModel) {
	// 		return null;
	// 	}

	// 	const updatedTeacher: Teacher = await fromModelToTeacher(
	// 		updatedTeacherModel,
	// 		context.coursesCollection
	// 	);

	// 	return updatedTeacher;
	// },
};
