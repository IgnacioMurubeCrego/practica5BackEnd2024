import { Collection, ObjectId } from "mongodb";
import { CourseModel, TeacherModel, StudentModel } from "./types.ts";

type Context = {
	studentCollection: Collection<StudentModel>;
	teacherCollection: Collection<TeacherModel>;
	courseCollection: Collection<CourseModel>;
};

export const resolvers = {
	Student: {
		id: (parent: StudentModel, _: unknown, _context: Context): string => {
			return parent._id!.toString();
		},
		enrolledCourses: async (parent: StudentModel, _: unknown, context: Context): Promise<CourseModel[]> => {
			return await context.courseCollection
				.find({
					_id: { $in: parent.enrolledCourses },
				})
				.toArray();
		},
	},
	Teacher: {
		id: (parent: TeacherModel, _: unknown, _context: Context): string => {
			return parent._id!.toString();
		},
		coursesTaught: async (parent: TeacherModel, _: unknown, context: Context): Promise<CourseModel[]> => {
			return await context.courseCollection
				.find({
					teacherId: parent._id,
				})
				.toArray();
		},
	},
	Course: {
		id: (parent: CourseModel, _: unknown, _context: Context): string => {
			return parent._id!.toString();
		},
		teacherId: async (parent: CourseModel, _: unknown, context: Context): Promise<TeacherModel> => {
			const teacherModel: TeacherModel | null = await context.teacherCollection.findOne({
				_id: parent.teacherId,
			});
			if (!teacherModel) {
				throw new Error(`No teacher found with id : ${parent.teacherId}`);
			}
			return teacherModel;
		},
		studentIds: async (parent: CourseModel, _: unknown, context: Context): Promise<StudentModel[]> => {
			return await context.studentCollection
				.find({
					_id: { $in: parent.studentIds },
				})
				.toArray();
		},
	},

	Query: {
		students: async (_: unknown, __: unknown, context: Context): Promise<StudentModel[]> => {
			const studentModel = await context.studentCollection.find().toArray();

			return await Promise.all(studentModel.map((student) => student));
		},

		student: async (_: unknown, args: { id: string }, context: Context): Promise<StudentModel | null> => {
			const stu_DB = await context.studentCollection.findOne({
				_id: new ObjectId(args.id),
			});

			if (!stu_DB) {
				return null;
			}

			return stu_DB;
		},

		teachers: async (_: unknown, __: unknown, context: Context): Promise<TeacherModel[]> => {
			const teacherModel = await context.teacherCollection.find().toArray();

			return teacherModel.map((teacher) => teacher);
		},

		teacher: async (_: unknown, args: { id: string }, context: Context): Promise<TeacherModel | null> => {
			const tea_DB = await context.teacherCollection.findOne({
				_id: new ObjectId(args.id),
			});

			if (!tea_DB) {
				return null;
			}

			return tea_DB;
		},

		courses: async (_: unknown, __: unknown, context: Context): Promise<CourseModel[]> => {
			const courseModel = await context.courseCollection.find().toArray();

			return courseModel;
		},

		course: async (_: unknown, args: { id: string }, context: Context): Promise<CourseModel | null> => {
			const cou_DB = await context.courseCollection.findOne({
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
			context: Context
		): Promise<StudentModel> => {
			const { name, email } = args;
			const { insertedId } = await context.studentCollection.insertOne({
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

		createTeacher: async (
			_: unknown,
			args: { name: string; email: string },
			context: Context
		): Promise<TeacherModel> => {
			const { name, email } = args;
			const { insertedId } = await context.teacherCollection.insertOne({
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

		createCourse: async (
			_: unknown,
			args: {
				title: string;
				description: string;
				teacherId: string;
			},
			context: Context
		): Promise<CourseModel> => {
			const { title, description, teacherId } = args;
			const teacherObjectId = new ObjectId(teacherId);
			const { insertedId } = await context.courseCollection.insertOne({
				title,
				description,
				teacherId: teacherObjectId,
				studentIds: [],
			});
			const courseModel: CourseModel = {
				_id: insertedId,
				title: title,
				description: description,
				teacherId: teacherObjectId,
				studentIds: [],
			};
			return courseModel;
		},

		updateStudent: async (
			_: unknown,
			args: {
				id: string;
				name?: string;
				email?: string;
			},
			context: Context
		): Promise<StudentModel | null> => {
			const { id, name, email } = args;

			const update: any = {};
			if (name) {
				update.name = name;
			} else if (email) {
				update.email = email;
			}

			const { modifiedCount } = await context.studentCollection.updateOne({ _id: new ObjectId(id) }, { $set: update });

			if (modifiedCount === 0) {
				console.log("Student not found");
				return null;
			}

			const updatedStudentModel = await context.studentCollection.findOne({
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
			context: Context
		): Promise<TeacherModel | null> => {
			const { id, name, email } = args;

			const update: any = {};
			if (name) {
				update.name = name;
			} else if (email) {
				update.email = email;
			}
			const { modifiedCount } = await context.teacherCollection.updateOne({ _id: new ObjectId(id) }, { $set: update });
			if (modifiedCount === 0) {
				return null;
			}

			const updatedTeacherModel = await context.teacherCollection.findOne({
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
			context: Context
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

			const { modifiedCount } = await context.courseCollection.updateOne({ _id: new ObjectId(id) }, { $set: update });

			if (modifiedCount === 0) {
				console.log("Course not found");
				return null;
			}

			const updatedCourseModel = await context.courseCollection.findOne({
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
			context: Context
		): Promise<CourseModel> => {
			const { studentId, courseId } = args;
			const course = await context.courseCollection.findOne({
				_id: new ObjectId(courseId),
			});
			if (!course) {
				throw console.error("Course not found");
			}
			const studentIdDB: ObjectId = new ObjectId(studentId);
			const updatedCourses: number = (
				await context.courseCollection.updateOne(
					{ _id: new ObjectId(courseId) },
					{ $push: { studentIds: studentIdDB } }
				)
			).modifiedCount;

			if (updatedCourses === 0) {
				throw console.error("Course's studentIds failed to be updated");
			}

			// Hook : update student courses
			const studentsUpdated: number = (
				await context.studentCollection.updateOne(
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
			context: Context
		): Promise<CourseModel | null> => {
			const { studentId, courseId } = args;

			const student_DB = await context.studentCollection.findOne({
				_id: new ObjectId(studentId),
			});

			if (!student_DB) {
				console.log(`No student found with id ${studentId} in DB`);
				return null;
			}

			const course_DB = await context.courseCollection.findOne({
				_id: new ObjectId(courseId),
			});

			if (!course_DB) {
				console.log(`No course found with id ${courseId} in DB`);
				return null;
			}

			const enrolled: CourseModel | null = await context.courseCollection.findOne({
				studentIds: new ObjectId(studentId),
			});

			if (!enrolled) {
				console.log(`No student found with id ${studentId} in course`);
				return null;
			}

			const modifiedCourses: number = (
				await context.courseCollection.updateOne(
					{
						_id: new ObjectId(courseId),
					},
					{
						$pull: {
							studentIds: new ObjectId(studentId),
						},
					}
				)
			).modifiedCount;

			if (modifiedCourses === 0) {
				console.log(`Error, no courses students where modified in update.`);
				return null;
			}

			const modifiedStudents: number = (
				await context.studentCollection.updateOne(
					{
						_id: new ObjectId(studentId),
					},
					{
						$pull: {
							enrolledCourses: new ObjectId(courseId),
						},
					}
				)
			).modifiedCount;

			if (modifiedStudents === 0) {
				console.log(`Error, no student courses where modified in update.`);
				return null;
			}

			const courseModel = await context.courseCollection.findOne({
				_id: new ObjectId(courseId),
			});

			if (!courseModel) {
				console.log(`No course found with id ${courseId} in DB after the update`);
				return null;
			}

			return courseModel;
		},

		deleteStudent: async (_: unknown, args: { id: string }, context: Context): Promise<boolean> => {
			const id = args.id;

			const { deletedCount } = await context.studentCollection.deleteOne({
				_id: new ObjectId(id),
			});

			if (deletedCount === 0) {
				return false;
			}

			await context.courseCollection.updateMany(
				{ studentIds: new ObjectId(id) },
				{
					$pull: { studentIds: new ObjectId(id) },
				}
			);

			return true;
		},

		deleteTeacher: async (_: unknown, args: { id: string }, context: Context): Promise<boolean> => {
			const id = args.id;

			const { deletedCount } = await context.teacherCollection.deleteOne({
				_id: new ObjectId(id),
			});

			if (deletedCount === 0) {
				return false;
			}

			// Hook
			const courseswithTeacher: CourseModel[] = await context.courseCollection
				.find({
					teacherId: new ObjectId(id),
				})
				.toArray();

			const coursesIds: ObjectId[] = courseswithTeacher.map((c) => new ObjectId(c._id));

			if (coursesIds.length === 0) {
				return true;
			}

			await context.courseCollection.updateMany({ _id: { $in: coursesIds } }, { $set: { teacherId: undefined } });

			return true;
		},

		deleteCourse: async (_: unknown, args: { id: string }, context: Context): Promise<boolean> => {
			const id = args.id;

			const { deletedCount } = await context.courseCollection.deleteOne({
				_id: new ObjectId(id),
			});

			if (deletedCount === 0) {
				return false;
			}

			await context.studentCollection.updateMany(
				{ enrolledCourses: new ObjectId(id) },
				{
					$pull: {
						enrolledCourses: new ObjectId(id),
					},
				}
			);

			await context.teacherCollection.updateMany(
				{ coursesTaught: new ObjectId(id) },
				{
					$pull: {
						coursesTaught: new ObjectId(id),
					},
				}
			);

			return true;
		},
	},
};
