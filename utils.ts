import { Collection, ObjectId } from "mongodb";
import {
	Course,
	CourseModel,
	Student,
	StudentModel,
	Teacher,
	TeacherModel,
} from "./types.ts";

export const fromModelToStudent = async (
	studentModel: StudentModel,
	coursesCollection: Collection<CourseModel>
): Promise<Student> => {
	const enrolledCourses: CourseModel[] = await coursesCollection
		.find({
			_id: { $in: studentModel.enrolledCourses },
		})
		.toArray();

	const courseTitles: string[] = enrolledCourses.map(
		(course: CourseModel) => course.title
	);

	return {
		id: studentModel._id!.toString(),
		name: studentModel.name,
		email: studentModel.email,
		enrolledCourses: courseTitles,
	};
};

export const fromModelToTeacher = async (
	teacherModel: TeacherModel,
	coursesCollection: Collection<CourseModel>
): Promise<Teacher> => {
	const coursesTaught: CourseModel[] = await coursesCollection
		.find({
			_id: { $in: teacherModel.coursesTaught },
		})
		.toArray();

	const courseTitles: string[] = coursesTaught.map(
		(course: CourseModel) => course.title
	);

	return {
		id: teacherModel._id!.toString(),
		name: teacherModel.name,
		email: teacherModel.email,
		coursesTaught: courseTitles,
	};
};

export const fromModelToCourse = async (
	courseModel: CourseModel,
	studentsCollection: Collection<StudentModel>,
	teachersCollection: Collection<TeacherModel>
): Promise<Course> => {
	const teacherModel: TeacherModel | null = await teachersCollection.findOne({
		_id: new ObjectId(courseModel.teacherId),
	});
	if (!teacherModel) {
		throw console.error("Teacher not found");
	}
	const studentsModels: StudentModel[] = await studentsCollection
		.find({
			_id: { $in: courseModel.studentIds },
		})
		.toArray();

	const teacherId: string = teacherModel._id.toString();
	const studentIds: string[] = studentsModels.map((s: StudentModel) =>
		s._id.toString()
	);

	return {
		id: courseModel._id!.toString(),
		title: courseModel.title,
		description: courseModel.description,
		teacherId: teacherId,
		studentIds: studentIds,
	};
};
