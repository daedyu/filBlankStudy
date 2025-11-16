export interface Problem {
	_id: string;
	text: string;
	answers: string[];
	blanks: number;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface ProblemInput {
	text: string;
	answers: string[];
	blanks: number;
}