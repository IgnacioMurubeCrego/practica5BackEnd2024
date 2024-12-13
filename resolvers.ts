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
		createStudent: async (
			_: unknown,
			args: { name: string; email: string },
			context: {
				studentsCollection: Collection<StudentModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<Student> => {
			const { name, email } = args;
			const { insertedId } = await context.studentsCollection.insertOne({
				name,
				email,
				enrolledCourses: [],
			});
			const studentModel: StudentModel = {
				_id: insertedId,
				name,
				email,
				enrolledCourses: [],
			};
			return fromModelToStudent(studentModel!, context.coursesCollection);
		},

		createCourse: async (
			_: unknown,
			args: { title: string; description: string; teacherId: string },
			context: {
				studentsCollection: Collection<StudentModel>;
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<Course> => {
			const { title, description, teacherId } = args;
			const { insertedId } = await context.coursesCollection.insertOne({
				title,
				description,
				teacherId: new ObjectId(teacherId),
				studentIds: [],
			});
			const courseModel: CourseModel = {
				_id: insertedId,
				title: title,
				description: description,
				teacherId: new ObjectId(teacherId),
				studentIds: [],
			};
			return fromModelToCourse(
				courseModel!,
				context.studentsCollection,
				context.teachersCollection
			);
		},

		createTeacher: async (
			_: unknown,
			args: { name: string; email: string },
			context: {
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<Teacher> => {
			const { name, email } = args;
			const { insertedId } = await context.teachersCollection.insertOne({
				name,
				email,
				coursesTaught: [],
			});
			const teacherModel: TeacherModel = {
				_id: insertedId,
				name,
				email,
				coursesTaught: [],
			};
			return fromModelToTeacher(teacherModel!, context.coursesCollection);
		},

		updateStudent: async (
			_: unknown,
			args: { id: string; name?: string; email?: string },
			context: {
				studentsCollection: Collection<StudentModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<Student | null> => {
			const { id, name, email } = args;

			const update: any = {};
			if (name) {
				update.name = name;
			} else if (email) {
				update.email = email;
			}

			const { modifiedCount } = await context.studentsCollection.updateOne(
				{ _id: new ObjectId(id) },
				{ $set: update }
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
		},

		updateTeacher: async (
			_: unknown,
			args: { id: string; name?: string; email?: string },
			context: {
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<Teacher | null> => {
			const { id, name, email } = args;

			const update: any = {};
			if (name) {
				update.name = name;
			} else if (email) {
				update.email = email;
			}
			const { modifiedCount } = await context.teachersCollection.updateOne(
				{ _id: new ObjectId(id) },
				{ $set: update }
			);
			if (modifiedCount === 0) {
				return null;
			}

			const updatedTeacherModel = await context.teachersCollection.findOne({
				_id: new ObjectId(id),
			});

			if (!updatedTeacherModel) {
				return null;
			}

			const updatedTeacher: Teacher = await fromModelToTeacher(
				updatedTeacherModel,
				context.coursesCollection
			);

			return updatedTeacher;
		},

		updateCourse: async (
			_: unknown,
			args: {
				id: string;
				title?: string;
				description?: string;
				teacherId: string;
			},
			context: {
				studentsCollection: Collection<StudentModel>;
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<Course | null> => {
			const { id, title, description, teacherId } = args;

			const update: any = {};
			update.id = id;
			update.teacherId = teacherId;

			if (title) {
				update.title = title;
			} else if (description) {
				update.description = description;
			} else if (teacherId) {
				update.teacherId = teacherId;
			}

			const { modifiedCount } = await context.coursesCollection.updateOne(
				{ _id: new ObjectId(id) },
				{ $set: update }
			);

			if (modifiedCount === 0) {
				console.log("Course not found");
				return null;
			}

			const updatedCourseModel = await context.coursesCollection.findOne({
				_id: new ObjectId(id),
			});

			if (!updatedCourseModel) {
				console.log("Updated course not found");
				return null;
			}

			const updatedCourse: Course = await fromModelToCourse(
				updatedCourseModel,
				context.studentsCollection,
				context.teachersCollection
			);

			return updatedCourse;
		},

		enrollStudentInCourse: async (
			_: unknown,
			args: { studentId: string; courseId: string },
			context: {
				studentsCollection: Collection<StudentModel>;
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<Course> => {
			const { studentId, courseId } = args;
			const course = await context.coursesCollection.findOne({
				_id: new ObjectId(courseId),
			});
			if (!course) {
				throw console.error("Course not found");
			}
			const update: any = {};
			update.studentIds = [...course.studentIds, new ObjectId(studentId)];
			const { modifiedCount } = await context.coursesCollection.updateOne(
				{ _id: new ObjectId(courseId) },
				{ $set: { studentIds: update } }
			);

			if (modifiedCount === 0) {
				throw console.error("Course failed to be updated");
			}

			const updatedCourse: CourseModel = {
				_id: course._id,
				title: course.title,
				description: course.description,
				teacherId: course.teacherId,
				studentIds: update.studentIds,
			};

			return await fromModelToCourse(
				updatedCourse,
				context.studentsCollection,
				context.teachersCollection
			);
		},

		deleteStudent: async (
			_: unknown,
			args: { id: string },
			context: {
				studentsCollection: Collection<StudentModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<boolean> => {
			const id = args.id;

			const { deletedCount } = await context.studentsCollection.deleteOne({
				_id: new ObjectId(id),
			});

			if (deletedCount === 0) {
				return false;
			}

			await context.coursesCollection.updateMany(
				{ studentIds: new ObjectId(id) },
				{ $pull: { studentIds: new ObjectId(id) } }
			);

			return true;
		},

		deleteCourse: async (
			_: unknown,
			args: { id: string },
			context: {
				studentsCollection: Collection<StudentModel>;
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<boolean> => {
			const id = args.id;

			const { deletedCount } = await context.coursesCollection.deleteOne({
				_id: new ObjectId(id),
			});

			if (deletedCount === 0) {
				return false;
			}

			await context.studentsCollection.updateMany(
				{ enrolledCourses: new ObjectId(id) },
				{ $pull: { enrolledCourses: new ObjectId(id) } }
			);

			await context.teachersCollection.updateMany(
				{ coursesTaught: new ObjectId(id) },
				{ $pull: { coursesTaught: new ObjectId(id) } }
			);

			return true;
		},

		deleteTeacher: async (
			_: unknown,
			args: { id: string },
			context: {
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<boolean> => {
			const id = args.id;

			const { deletedCount } = await context.teachersCollection.deleteOne({
				_id: new ObjectId(id),
			});

			if (deletedCount === 0) {
				return false;
			}

			// Hook
			const courseswithTeacher: CourseModel[] = await context.coursesCollection
				.find({
					teacherId: new ObjectId(id),
				})
				.toArray();

			const coursesIds: ObjectId[] = courseswithTeacher.map(
				(c) => new ObjectId(c._id)
			);

			if (coursesIds.length === 0) {
				return true;
			}

			await context.coursesCollection.updateMany(
				{ _id: { $in: coursesIds } },
				{ $set: { teacherId: undefined } }
			);

			return true;
		},

		removeStudentFromCourse: async (
			_: unknown,
			args: { studentId: string; courseId: string },
			context: {
				studentsCollection: Collection<StudentModel>;
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<Course | null> => {
			const { studentId, courseId } = args;

			const student_DB = await context.studentsCollection.findOne({
				_id: new ObjectId(studentId),
			});

			if (!student_DB) {
				console.log(`No student found with id ${studentId} in DB`);
				return null;
			}

			const { modifiedCount } = await context.coursesCollection.updateOne(
				{
					_id: new ObjectId(courseId),
					studentIds: { $exists: true, $type: "array" },
				},
				{ $pull: { studentIds: new ObjectId(studentId) } }
			);

			if (modifiedCount === 0) {
				console.log(`No student found with id ${studentId} in course`);
				return null;
			}

			const course = await context.coursesCollection.findOne({
				_id: new ObjectId(courseId),
			});

			if (!course) {
				return null;
			}

			const course_final = fromModelToCourse(
				course,
				context.studentsCollection,
				context.teachersCollection
			);

			return course_final;
		},
	},
};
