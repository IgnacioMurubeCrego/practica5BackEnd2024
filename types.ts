import { ObjectId, OptionalId } from "mongodb";

export type StudentModel = OptionalId<{
	name: string;
	email: string;
	enrolledCourses: ObjectId[];
}>;

export type Student = {
	id: string;
	name: string;
	email: string;
	enrolledCourses: Course[];
};

export type TeacherModel = OptionalId<{
	name: string;
	email: string;
	coursesTaught: ObjectId[];
}>;

export type Teacher = {
	id: string;
	name: string;
	email: string;
	coursesTaught: Course[];
};

export type CourseModel = OptionalId<{
	title: string;
	description: string;
	teacherId: ObjectId;
	studentIds: ObjectId[];
}>;

export type Course = {
	id: string;
	title: string;
	description: string;
	teacher: Teacher;
	students: Student[];
};

/*
Relaciones entre objetos

Student → Course:
Un estudiante puede estar matriculado en varios cursos. 
Por lo tanto, el Student tendrá un campo enrolledCourses que será un 
array de referencias a IDs de cursos. 
Por el lado del Course, se reflejará este vínculo en el studentIds.

Teacher → Course:
Un profesor puede impartir varios cursos, y un curso es impartido por un único profesor. 
Por ende, el Teacher tendrá un campo coursesTaught que apunta a varios Courses. 
El Course tendrá un teacherId para saber quién lo imparte.
*/
