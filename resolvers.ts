import { Collection, ObjectId } from "mongodb";
import { CourseModel, TeacherModel, StudentModel, Course, Teacher, Student } from "./types.ts";
import { Context } from "node:vm";

export const resolvers = {
	Student: {
		enrolledCourses: async (parent: StudentModel, _: unknown, context: Context) => {
			return await context.coursesCollection
				.find({
					_id: { $in: parent.enrolledCourses },
				})
				.toArray();
		},
	},
	Teacher: {
		coursesTaught: async (parent: TeacherModel, _: unknown, context: Context) => {
			return await context.coursesCollection
				.find({
					teacherId: parent._id,
				})
				.toArray();
		},
	},
	Course: {
		teacherId: async (parent: CourseModel, _: unknown, context: Context) => {
			return await context.teachersCollection.findOne({
				_id: parent.teacherId,
			});
		},
		studentIds: async (parent: CourseModel, _: unknown, context: Context) => {
			return await context.studentsCollection
				.find({
					_id: { $in: parent.studentIds },
				})
				.toArray();
		},
	},

	Query: {
		students: async (
			_: unknown,
			__: unknown,
			context: {
				studentsCollection: Collection<StudentModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<StudentModel[]> => {
			const studentModel = await context.studentsCollection.find().toArray();

			return await Promise.all(studentModel.map((student) => student));
		},

		student: async (
			_: unknown,
			args: { id: string },
			context: {
				studentsCollection: Collection<StudentModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<StudentModel | null> => {
			const stu_DB = await context.studentsCollection.findOne({
				_id: new ObjectId(args.id),
			});

			if (!stu_DB) {
				return null;
			}

			return stu_DB;
		},

		teachers: async (
			_: unknown,
			__: unknown,
			context: {
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<TeacherModel[]> => {
			const teacherModel = await context.teachersCollection.find().toArray();

			return teacherModel.map((teacher) => teacher);
		},

		teacher: async (
			_: unknown,
			args: { id: string },
			context: {
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<TeacherModel | null> => {
			const tea_DB = await context.teachersCollection.findOne({
				_id: new ObjectId(args.id),
			});

			if (!tea_DB) {
				return null;
			}

			return tea_DB;
		},

		courses: async (
			_: unknown,
			__: unknown,
			context: {
				studentsCollection: Collection<StudentModel>;
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<CourseModel[]> => {
			const courseModel = await context.coursesCollection.find().toArray();

			return courseModel;
		},

		course: async (
			_: unknown,
			args: { id: string },
			context: {
				studentsCollection: Collection<StudentModel>;
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<CourseModel | null> => {
			const cou_DB = await context.coursesCollection.findOne({
				_id: new ObjectId(args.id),
			});

			if (!cou_DB) {
				return null;
			}

			return cou_DB;
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
		): Promise<StudentModel> => {
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
			return studentModel;
		},

		createCourse: async (
			_: unknown,
			args: {
				title: string;
				description: string;
				teacherId: string;
			},
			context: {
				studentsCollection: Collection<StudentModel>;
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<CourseModel> => {
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
			return courseModel;
		},

		createTeacher: async (
			_: unknown,
			args: { name: string; email: string },
			context: {
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<TeacherModel> => {
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
			return teacherModel;
		},

		updateStudent: async (
			_: unknown,
			args: {
				id: string;
				name?: string;
				email?: string;
			},
			context: {
				studentsCollection: Collection<StudentModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<StudentModel | null> => {
			const { id, name, email } = args;

			const update: any = {};
			if (name) {
				update.name = name;
			} else if (email) {
				update.email = email;
			}

			const { modifiedCount } = await context.studentsCollection.updateOne({ _id: new ObjectId(id) }, { $set: update });

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

			return updatedStudentModel;
		},

		updateTeacher: async (
			_: unknown,
			args: {
				id: string;
				name?: string;
				email?: string;
			},
			context: {
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<TeacherModel | null> => {
			const { id, name, email } = args;

			const update: any = {};
			if (name) {
				update.name = name;
			} else if (email) {
				update.email = email;
			}
			const { modifiedCount } = await context.teachersCollection.updateOne({ _id: new ObjectId(id) }, { $set: update });
			if (modifiedCount === 0) {
				return null;
			}

			const updatedTeacherModel = await context.teachersCollection.findOne({
				_id: new ObjectId(id),
			});

			if (!updatedTeacherModel) {
				return null;
			}

			return updatedTeacherModel;
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
		): Promise<CourseModel | null> => {
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

			const { modifiedCount } = await context.coursesCollection.updateOne({ _id: new ObjectId(id) }, { $set: update });

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

			return updatedCourseModel;
		},

		enrollStudentInCourse: async (
			_: unknown,
			args: {
				studentId: string;
				courseId: string;
			},
			context: {
				studentsCollection: Collection<StudentModel>;
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<CourseModel> => {
			const { studentId, courseId } = args;
			const course = await context.coursesCollection.findOne({
				_id: new ObjectId(courseId),
			});
			if (!course) {
				throw console.error("Course not found");
			}
			const studentIdDB: ObjectId = new ObjectId(studentId);
			const updatedCourses: number = (
				await context.coursesCollection.updateOne(
					{ _id: new ObjectId(courseId) },
					{ $push: { studentIds: studentIdDB } }
				)
			).modifiedCount;

			if (updatedCourses === 0) {
				throw console.error("Course's studentIds failed to be updated");
			}

			// Hook : update student courses
			const studentsUpdated: number = (
				await context.studentsCollection.updateOne(
					{ _id: studentIdDB },
					{ $push: { enrolledCourses: new ObjectId(courseId) } }
				)
			).modifiedCount;

			if (studentsUpdated === 0) {
				throw console.error("Student's courses failed to be updated");
			}

			// Response
			const updatedCourse: CourseModel = {
				_id: course._id,
				title: course.title,
				description: course.description,
				teacherId: course.teacherId,
				studentIds: course.studentIds.concat(studentIdDB),
			};

			return updatedCourse;
		},

		removeStudentFromCourse: async (
			_: unknown,
			args: {
				studentId: string;
				courseId: string;
			},
			context: {
				studentsCollection: Collection<StudentModel>;
				teachersCollection: Collection<TeacherModel>;
				coursesCollection: Collection<CourseModel>;
			}
		): Promise<CourseModel | null> => {
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
				},
				{
					$pull: {
						studentIds: new ObjectId(studentId),
					},
				}
			);

			if (modifiedCount === 0) {
				console.log(`No student found with id ${studentId} in course`);
				return null;
			}

			const courseModel = await context.coursesCollection.findOne({
				_id: new ObjectId(courseId),
			});

			if (!courseModel) {
				return null;
			}

			return courseModel;
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
				{
					$pull: { studentIds: new ObjectId(id) },
				}
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
				{
					$pull: {
						enrolledCourses: new ObjectId(id),
					},
				}
			);

			await context.teachersCollection.updateMany(
				{ coursesTaught: new ObjectId(id) },
				{
					$pull: {
						coursesTaught: new ObjectId(id),
					},
				}
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

			const coursesIds: ObjectId[] = courseswithTeacher.map((c) => new ObjectId(c._id));

			if (coursesIds.length === 0) {
				return true;
			}

			await context.coursesCollection.updateMany({ _id: { $in: coursesIds } }, { $set: { teacherId: undefined } });

			return true;
		},
	},
};
